import './style/style.css';
import './vendor/nouislider.min.css';
import './style/img/favicon.ico';

import initDirectionsControls from './directionsControls';
import initMap from './map';
import { setGeocoderBounds, setGeocderCenter } from './geocoder';
import state from './state';

window.appState = state; // XXX for console debugging.

/* Initialization *************************** */

function ready(fn) {
  if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}


function initPage(lngLat, zoom) {
  const doInit = () => {
    initMap(lngLat, zoom);
    initDirectionsControls();
  };

  ready(doInit);
}

(function init() {
  console.log('initializing app');
  // Fallback location: center of bay area
  let lat = 37.611;
  let lon = -121.753;
  let zoom = 8;
  setGeocderCenter([lon, lat]);
  setGeocoderBounds('-123.5337,36.8931,-121.2082,38.8643');


  // eslint-disable-next-line no-extend-native
  Number.prototype.between = (min, max) => this > min && this < max;

  // Grab IP location from freegeoip API
  const geoLocationProviderURL = 'https://www.geoip-db.com/json/';
  fetch(geoLocationProviderURL)
    .then(resp => resp.json())
    .then((data) => {
      const { latitude: latString, longitude: longString } = data;
      const longitude = parseFloat(longString);
      const latitude = parseFloat(latString);
      // Because this bike share only operates in the SF bay area, we
      // jump to the user's specific location only if they're inside a
      // bay-centered bounding area.
      if ((longitude).between(-124, -121) && (latitude).between(36.5, 38.4)) {
        lat = latitude;
        lon = longitude;
        zoom = 11; // zoom more than default since we know exact location
      }
      initPage([lon, lat], zoom);
    })
    .catch((error) => {
      console.log(`Error fetching location data: ${error}`); // eslint-disable-line
      if (error === 'Error: Coordinates must contain numbers') {
        throw error;
      } else {
        initPage([lon, lat]); // go for it anyway, using defaults
      }
    });
}());
