import turfCircle from '@turf/circle';
import { featureCollection as turfFeatureCollection, point as turfPoint } from '@turf/helpers';
import turfWithin from '@turf/within';

import StationFeed from './StationFeed';
import getPopupContent from './popups';
import userGeolocate from './userGeolocate';
import fetchRoute from './router';

import config from './config';
import state from './state';

const stationsURL = config.stationsUrl;

let map;

function addStations() {
  map.on('load', () => {
    window.setInterval(() => {
      map.getSource('stations-source').setData(StationFeed.getStations());
      // map.getSource('stations-source').setData(stationsURL);
      console.log('refetching live station data'); // eslint-disable-line
    }, 30 * 1000); // every N seconds (in milliseconds)

    map.addSource('stations-source', { type: 'geojson', data: stationsURL });
    map.addLayer({
      id: 'stations-layer',
      type: 'circle',
      source: 'stations-source',
      paint: {
        'circle-radius': 12,
        'circle-color': '#B42222',
        'circle-opacity': 0, // transparent dots sized for interaction - allows popup
      },
    });

    // Change the cursor to a pointer when the mouse is over the layer.
    map.on('mouseenter', 'stations-layer', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'stations-layer', () => {
      map.getCanvas().style.cursor = '';
    });
  });
}

function addPopups() {
  map.on('click', (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['stations-layer'],
    });

    if (!features.length) {
      return;
    }

    const feature = features[0];

    const popup = new mapboxgl.Popup({ offset: [0, -15] })
      .setLngLat(feature.geometry.coordinates)
      .setHTML(getPopupContent(feature))
      .setLngLat(feature.geometry.coordinates)
      .addTo(map);
    // eslint-disable-next-line no-underscore-dangle
    popup._container.classList.add('station-popup--container'); // for styling
  });
}

function addEmptyStationsNearbySources() {
  map.on('load', () => {
    const emptyFeatureSet = {
      type: 'FeatureCollection',
      features: [],
    };
    map.addSource('stations-near-origin', {
      type: 'geojson',
      data: emptyFeatureSet,
      maxzoom: 22, // otherwise we get precision / misalignment errors
      // might relate to:
      // https://github.com/mapbox/mapbox-gl-js/issues/2279
      // https://github.com/mapbox/mapbox-gl-js/issues/1733
    });
    map.addSource('stations-near-destination', {
      type: 'geojson',
      data: emptyFeatureSet,
      maxzoom: 22,
    });
  });
}


/**
 * Instantiate map with stations.
 * @param {[lon,lat]} center: lon,lat coords on which to center the view
 */
export default function initMap(center, zoom = 8) {
  map = new mapboxgl.Map({
    container: 'map',
    style: config.mapStyle,
    zoom,
    center,
  });

  // Add geolocate control to the map.
  // const geolocateControl = new mapboxgl.GeolocateControl({
  //   positionOptions: {
  //     enableHighAccuracy: true,
  //   },
  //   trackUserLocation: true,
  // });
  // map.addControl(geolocateControl);
  // geolocateControl.on('geolocate', userGeolocate);

  addEmptyStationsNearbySources();
  // fetchStations();
  addStations();
  addPopups();
}

/**
 *
 * @param {String} location - origin or destination
 */
export function flyTo(location) {
  // console.log(`flying to:
  // ${[state[location].longitude, state[location].latitude]} (${state[location].address})`);
  map.flyTo({
    center: [state[location].longitude, state[location].latitude],
    zoom: 14,
  });
}


const endpointMarkers = {};

/**
 * Add or update the origin or destination marker
 * @param {String} location - origin or destination
 */
export function renderDirectionsMarker(location) {
  if (endpointMarkers[location]) {
    // console.log(`setting endpoint for ${location} to
    // ${[state[location].longitude, state[location].latitude]}`);
    endpointMarkers[location].setLngLat([state[location].longitude, state[location].latitude]);
    // endpointMarkers[location].addTo(map);
  } else {
    // console.log(`creating ${location} marker`);
    const el = document.createElement('div');
    el.className = `marker map-marker-directions is-${location}`;
    endpointMarkers[location] = new mapboxgl.Marker(el)
      .setLngLat([state[location].longitude, state[location].latitude])
      .addTo(map);
  }
}


/**
 * Return a FeatureCollection of stations within state.maxWalkingDistance of location.
 * @param {String} location - origin or destination
 */
function getStationsNear(location) {
  if (state.maxWalkDistance === 0) {
    return {
      type: 'FeatureCollection',
      features: [],
    };
  }

  // get all stations
  const stations = StationFeed.getStationsArray();
  // const stations = map.querySourceFeatures('stations-source');
  // can't use querySourceFeatures: only looks in visible area
  // if needed, use filter to limit result set (only those w/ available bikes, etc).
  // https://www.mapbox.com/mapbox-gl-js/api/#map#querysourcefeatures

  console.log(`got all stations; searching within ${state.maxWalkDistance}`, stations);

  // use Turf to do a proximity search.
  // TODO: or better, use Mapzen to do an isochrone search
  const center = turfPoint([state[location].longitude, state[location].latitude]);
  const searchWithinFeatures = turfFeatureCollection([turfCircle(center, state.maxWalkDistance, { units: 'miles' })]);
  const stationCollection = turfFeatureCollection(stations);

  const nearbyStations = turfWithin(stationCollection, searchWithinFeatures);
  return nearbyStations;
}

/**
 * Splits the given group of stations based on availability status.
 * If location is origin, criteria is bikes; otherwise it's docks.
 * Returns [empty, available] where each is a F.C.
 * @param {String} location - origin or destination
 * @param {} stationsCollection - FeatureCollection of stations already near location
 */
// function splitEmptyOrAvailable(location, stationsCollection) {
//   /*
//   Bikeshare stations within the specified distance of the origin
//      that have bikes available should be marked green
//      with no available bikes should be marked red

//   Bikeshare stations within the specified distance of the destination
//     that have docks available should be marked green
//     that have no docks available should be marked red
//   */

//   const stations = stationsCollection.features;
//   const availableCritera = location === 'origin' ? 'availableBikes' : 'availableDocks';

//   const empty = [];
//   const available = [];

//   stations.forEach((station) => {
//     if (station.properties[availableCritera] > 0) {
//       available.push(station);
//     } else {
//       empty.push(station);
//     }
//   });

//   return [empty, available];
// }


function getLayerIdForStationsNear(location) {
  return `stations-near-${location}`;
}


/**
 * Highlight the given stations near the given location
 * @param {String} location - origin or destination
 * @param {FeatureCollection} stations nearby the origin or destination to highlight
 */
function showStationsNear(location, stations) {
  // draw stations as markers on the map
  console.log(`showing stations nearby ${location}: `, stations);

  const layerAndSourceId = getLayerIdForStationsNear(location);
  const availableCritera = location === 'origin' ? 'availableBikes' : 'availableDocks';

  console.log('adding matching nearby stations');
  map.getSource(layerAndSourceId).setData(stations);

  const layer = map.getLayer(layerAndSourceId);
  if (!layer) { // should only need to do this once.
    // Create a new circle layer from the data source
    map.addLayer({
      id: layerAndSourceId,
      type: 'circle',
      source: layerAndSourceId,
      paint: {
        'circle-radius': 12, // bikeshare icon is 24px (scaled by 1/2 so 12)
        'circle-color': {
          property: availableCritera,
          stops: [
            // "available": 0   -> circle color will be red
            [0, 'red'],
            // "available": 1 or more -> circle color will be green
            [1, 'lightseagreen'],
          ],
        },
      },
    }, 'bikeshare-stations'); // place color beneath bikeshare icons
  }
}


function clearStationsNear(location) {
  const layerID = getLayerIdForStationsNear(location);
  const layer = map.getLayer(layerID);
  if (layer) {
    map.removeLayer(layerID);
  }
}


/**
 * Update station results nearby.
 * When the origin or destination is set,
 * or when the user's max walking distance preference changes,
 * update nearby results.
 */
export function mapUpdateNearby() {
  // console.log('mapupdatenearby()');

  ['origin', 'destination'].forEach((location) => {
    if (state[location].latitude && state[location].longitude) {
      const nearbyStations = getStationsNear(location);
      console.log(`got stations near ${location}`, nearbyStations);
      showStationsNear(location, nearbyStations);
    } else { // if we *don't* have a particular location endpoint,
      // then we need to clear the markers
      clearStationsNear(location);
    }
  });
}

function mapClearRoute() {
  const routeLayer = map.getLayer('route');
  if (routeLayer) {
    map.removeLayer('route');
  }
}

function mapUpdateRoute() {
  if (state.origin.latitude && state.destination.latitude) {
    fetchRoute(state.origin, state.destination, (routeLineString) => {
      let source = map.getSource('route');
      if (source) {
        source.setData(routeLineString);
      } else {
        source = map.addSource('route', { type: 'geojson', data: routeLineString });
      }

      // place route beneath nearby markers (themselves beneath stations)
      const layerAbove = getLayerIdForStationsNear('origin');

      // creating source for the first time; add a layer for it.
      // have to do this every time?
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        //  {
        //   type: 'geojson',
        //   data: routeLineString,
        // },
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#4AB2F7', // google maps blue #888
          'line-width': 8,
        },
      }, layerAbove);
    });
  } else {
    // we don't have both end points - ensure no route shown
    mapClearRoute();
  }
}


/**
 * Add or remove endpoint marker and update nearby stations.
 * @param {String} location origin or destination
 */
export function mapUpdateDirectionsEndpoint(location) {
  // console.log('mapUpdateDirectionsEndpoint()');
  mapUpdateRoute();
  if (state[location].latitude === null && endpointMarkers[location]) {
    // clear marker
    console.log(`clearing ${location} marker (no latitude)`);
    endpointMarkers[location].remove();
    endpointMarkers[location] = null;
  } else {
    renderDirectionsMarker(location);
    flyTo(location);
  }
  mapUpdateNearby();
}
