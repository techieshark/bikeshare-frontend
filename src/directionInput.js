import autocomplete from 'autocompleter';

import { geocode } from './geocoder';
import { mapUpdateDirectionsEndpoint } from './map';

import state from './state';

/**
 * Hooks an input up to an autocomplete service
 * @param {String} elId element id of the input which should be autocompleted
 */
function initAutocomplete(elId) {
  const input = document.getElementById(elId);

  autocomplete({
    input: document.getElementById(elId),
    fetch: (text, update) => {
      geocode(text, (err, geoData) => {
        if (!err) {
          const d = geoData;
          // console.log(`result from geocoding ${text}: `, d);
          // ensure result looks as we expect from the API
          if (d.type === 'FeatureCollection' && d.features && d.features.length > 0) {
            // map d.features into useful format.
            // return {label:..., item:..} obj - the format
            // specified here: https://github.com/kraaden/autocomplete
            const featureToSuggestion = feature =>
              ({ label: feature.place_name, item: feature });
            const suggestions = d.features.map(featureToSuggestion);
            update(suggestions);
          }
        } else {
          console.log(`error geocoding ${text}: ${err}`); //eslint-disable-line
        }
      });
    },
    onSelect: (item) => {
      // console.log('SELECTED item:', item);
      input.value = item.place_name;
    },
  });
}


/**
 * returns a change handler which updates global state location
 * @param {String} location - 'origin' or 'destination'; requires state[destination] to exist.
 */
function geocodingChangeHandler(location) {
  return function changeEventHandler(event) {
    const addr = event.target.value;
    if (addr === '') {
      // user cleared input - erase known point for location
      state[location].longitude = null;
      state[location].latitude = null;
      state[location].address = null;
      mapUpdateDirectionsEndpoint(location);
      return;
    }
    console.log('geocoding address: ', addr);
    geocode(addr, (err, geoData) => {
      if (!err) {
        const d = geoData;
        console.log(`result from geocoding ${addr}: `, d);
        if ( // ensure result looks as we expect from the API
          d.type === 'FeatureCollection' && d.features && d.features.length > 0
        ) {
          if (d.features[0].place_name) {
            // console.log(`updating address for ${location} from
            //   ${state[location].address} to
            //   ${d.features[0].place_name}`);
            state[location].address = d.features[0].place_name;
          }
          if (d.features[0].center) {
            // console.log(`updating lon for ${location} from
            //   ${state[location].longitude},${state[location].latitude} to
            //   ${d.features[0].center}`);
            [state[location].longitude, state[location].latitude] = d.features[0].center;
            console.log('gecoder returned coords:', [state[location].longitude, state[location].latitude]);
          }
          // console.log('app state:', state);
          mapUpdateDirectionsEndpoint(location);
        }
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

  // enable autocomplete
  initAutocomplete(elId);
}

