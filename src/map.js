import getPopupContent from './popups';
import userGeolocate from './userGeolocate';
import config from './config';
import state from './state';

const stationsURL = config.stationsUrl;

let map;

function addStations() {
  map.on('load', () => {
    window.setInterval(() => {
      map.getSource('stations-source').setData(stationsURL);
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
      layers: ['stations-layer'], // replace this with the name of the layer
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


/**
 * Instantiate map with stations.
 * @param {[lon,lat]} center: lon,lat coords on which to center the view
 */
export default function initMap(center, zoom = 8) {
  map = new mapboxgl.Map({
    container: 'map',
    style: config.mapStyle,
    zoom, // '13',
    center,
  });

  // Add geolocate control to the map.
  const geolocateControl = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
  });
  map.addControl(geolocateControl);

  geolocateControl.on('geolocate', userGeolocate);

  // fetchStations();
  addStations();
  addPopups();
}

/**
 *
 * @param {String} location - origin or destination
 */
export function flyTo(location) {
  map.flyTo({
    center: [state[location].longitude, state[location].latitude],
    zoom: 14,
  });
}

/**
 * Display the origin marker
 */
// export function renderOriginMarker() {
//   // create a HTML element for each feature
//   const el = document.createElement('div');
//   el.className = 'marker map-marker-origin';

//   const marker = new mapboxgl.Marker(el)
//     .setLngLat([state.origin.longitude, state.origin.latitude])
//     .addTo(map);
// }

const markers = {};

/**
 * Add or update the origin or destination marker
 * @param {String} location - origin or destination
 */
export function renderDirectionsMarker(location) {
  if (markers[location]) {
    markers[location].setLngLat([state[location].longitude, state[location].latitude]);
  } else {
    const el = document.createElement('div');
    el.className = `marker map-marker-directions is-${location}`;
    markers[location] = new mapboxgl.Marker(el)
      .setLngLat([state[location].longitude, state[location].latitude])
      .addTo(map);
  }
}
