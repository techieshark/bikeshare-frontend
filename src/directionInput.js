import { geocode } from './geocoder';
import { flyTo, renderDirectionsMarker } from './map';

import state from './state';

/**
 * returns a change handler which updates global state location
 * @param {String} location - 'origin' or 'destination'; requires state[destination] to exist.
 */
function geocodingChangeHandler(location) {
  const stateLocation = state[location];

  return function changeEventHandler(event) {
    const addr = event.target.value;
    console.log('geocoding address: ', addr);
    geocode(addr, (err, geoData) => {
      if (!err) {
        const d = geoData;
        if (
          d.type === 'FeatureCollection' &&
          d.features && d.features.length > 0 &&
          d.features[0].place_name
        ) {
          stateLocation.address = d.features[0].place_name;
        }

        if (
          d.type === 'FeatureCollection' &&
          d.features && d.features.length > 0
          && d.features[0].center
        ) {
          [stateLocation.longitude, stateLocation.latitude] = d.features[0].center;
        }
        console.log('gecoder returned coords:', [stateLocation.longitude, stateLocation.latitude]);
        console.log('app state:', state);
        renderDirectionsMarker(location);
        flyTo(location);
        // callback(err, geoData, state.destinationAddr);
      } else {
        console.log(`error geocoding ${addr}: ${err}`); //eslint-disable-line
      }
    });
  };
}

/**
 * Initialize the input handler for one of the direction inputs
 * @param {String} elId - ID of the input element to initialize
 * @param {String} location - 'origin' or 'destination'
 */
export default function initDirectionInput(elId, location) {
  // run geocode on address when input changes
  const input = document.getElementById(elId);
  input.onchange = geocodingChangeHandler(location);
}
