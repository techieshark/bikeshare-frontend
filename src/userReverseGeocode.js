
import state from './state';
import { reverseGeocode } from './geocoder';

/**
 * Fetch the user's address based on the lat/lng
 * @param callback: (err, geoData, addrString)
 */
export default function userReverseGeocode(callback = () => {}) {
  if (!state.user.latitude || !state.user.longitude) return; // nothing to do

  reverseGeocode(state.user.latitude, state.user.longitude, (err, geoData) => {
    const d = geoData;
    if (
      d.type === 'FeatureCollection' &&
      d.features && d.features.length > 0 &&
      d.features[0].place_name
    ) {
      state.user.address = d.features[0].place_name;
    }
    console.log('got addr:', geoData);
    callback(err, geoData, state.user.address);
  });
}
