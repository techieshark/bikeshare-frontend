import mbxDirections from '@mapbox/mapbox-sdk/services/directions';
import polyline from '@mapbox/polyline';

import config from './config';

const directionsClient = mbxDirections({ accessToken: config.mapboxToken });


/**
 * Fetch route point a to point b, call callback when done.
 * @param {Point} from
 * @param {Point} to
 * @param {Function} callback
 */
export default function fetchRoute(a, b, callback) {
  directionsClient
    .getDirections({
      profile: 'cycling',
      waypoints: [
        {
          coordinates: [a.longitude, a.latitude],
          waypointName: a.address,
        },
        {
          coordinates: [b.longitude, b.latitude],
          waypointName: b.address,
        },
      ],
    })
    .send()
    .then((response) => {
      const directions = response.body;
      if (directions.code !== 'Ok') {
        // See: https://www.mapbox.com/api-documentation/#directions-api-errors
        // eslint-disable-next-line no-console
        console.error(directions);
        throw Error('Failed getting directions.');
      }
      callback(polyline.toGeoJSON(directions.routes[0].geometry));
    })
    .catch((error) => {
      console.log('error fetching route: ', error);
    });
}
