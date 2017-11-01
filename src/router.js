import config from './config';

import polyline from './vendor/polyline';

// const polyline = require('@mapbox/polyline');


function latLngPairToGeoJsonPoint(pair) {
  // GeoJSON is in the opposite order: Longitude, then Latitude
  return [pair[1], pair[0]];
}

/**
 * Fetch route point a to point b, call callback when done.
 * @param {Point} from
 * @param {Point} to
 * @param {Function} callback
 */
export default function fetchRoute(a, b, callback) {
  // build and submit request, then call callback.

  const baseUrl = 'https://valhalla.mapzen.com/route';

  const routeConfig = {
    locations:
      [
        { lat: a.latitude, lon: a.longitude, street: a.address },
        { lat: b.latitude, lon: b.longitude, street: b.address },
      ],
    costing: 'bicycle',
    costing_options: {
      bicycle: {
        bicycle_type: 'Mountain', // bike share: bigger and slower.
        use_roads: 0.25,
        use_hills: 0.1,
      },
    },
    directions_options: {
      units: 'miles',
    },
    id: 'route',
  };

  const routeProviderURL = `${baseUrl}?json=${JSON.stringify(routeConfig)}&api_key=${config.mapzenKey}`;

  fetch(routeProviderURL)
    .then(resp => resp.json())
    .then((data) => {
      console.log('got route data: ', data);
      if (data.trip && data.trip.legs) {
        // generate a MultiLineString (each leg becomes a line)
        const multiLineCoords = data.trip.legs.map((leg) => {
          const arr = polyline.decode(leg.shape); // returns array of lat, lon pairs
          // each leg becomes the coordinates for a LineString,
          return arr.map(latLngPairToGeoJsonPoint);
        });
        const multiLineString = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'MultiLineString',
            coordinates: multiLineCoords,
          },
        };
        console.log('fetched route as mappable feature: ', multiLineString);
        callback(multiLineString);
      }
    })
    .catch((error) => {
      console.log('error fetching route: ', error);
    });
}
