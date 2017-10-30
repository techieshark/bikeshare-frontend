
import state from './state';
import userReverseGeocode from './userReverseGeocode';

export default function userGeolocate(position) {
  // console.log('coords: ', position.coords);
  const { latitude, longitude } = position.coords;
  state.user.latitude = latitude;
  state.user.longitude = longitude;
  userReverseGeocode();
}
