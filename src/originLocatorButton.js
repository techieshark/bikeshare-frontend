
import state from './state';
import { mapUpdateDirectionsEndpoint } from './map';

import userReverseGeocode from './userReverseGeocode';

/**
 * The origin locator button updates the origin input based
 * on the user's location.
 */
export default function initOriginLocatorBtn() {
  const btn = document.getElementsByClassName('directions--locate-origin')[0];
  // console.log('in btn init');
  btn.onclick = function onOriginLocatorBtnHandler() {
    // console.log('in btn click handler');
    const orig = document.getElementById('originInput');
    orig.value = 'Searching...';
    if (state.user.address) {
      orig.value = state.user.address;
      state.origin = { ...state.user };
      mapUpdateDirectionsEndpoint('origin');
    } else {
      console.log('fetching your address...');
      navigator.geolocation.getCurrentPosition((position) => {
        console.log(position);
        const { latitude, longitude } = position.coords;
        state.user.latitude = latitude;
        state.user.longitude = longitude;
        state.origin = { ...state.user };
        mapUpdateDirectionsEndpoint('origin');
        userReverseGeocode((err, data, address) => {
          orig.value = address;
          state.user.address = address;
          state.origin.address = address;
        });
      });
    }
  };
}
