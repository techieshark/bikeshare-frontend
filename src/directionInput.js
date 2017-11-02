import autocomplete from 'autocompleter';

import { geocode } from './geocoder';
import { mapUpdateDirectionsEndpoint } from './map';

import state from './state';

let lastAutocompleteSelection = null;

/**
 * Hooks an input up to an autocomplete service
 * @param {String} elId element id of the input which should be autocompleted
 */
function initAutocomplete(elId) {
  const input = document.getElementById(elId);

  autocomplete({
    input: document.getElementById(elId),
    fetch: (text, update) => {
      console.log('on fetch for input');
      geocode(text, (err, geoData) => {
        if (!err) {
          const d = geoData;
          console.log(`result from geocoding ${text}: `, d);
          // ensure result looks as we expect from the API
          if (d.type === 'FeatureCollection' && d.features && d.features.length > 0) {
            // map d.features into useful format.
            // return {label:..., item:..} obj - the format
            // specified here: https://github.com/kraaden/autocomplete
            const featureToSuggestion = feature =>
              ({
                label: feature.place_name,
                item: {
                  feature,
                  // make text and label available to onSelect():
                  label: feature.place_name,
                  text,
                },
              });
            const suggestions = d.features.map(featureToSuggestion);
            update(suggestions);
          }
        } else {
          console.log(`error geocoding ${text}: ${err}`); //eslint-disable-line
        }
      });
    },
    onSelect: (item) => {
      lastAutocompleteSelection = item;
      console.log('SELECTED item:', item);
      input.value = item.feature.place_name;
    },
  });
}

/**
 * Update state from feature returned by geocoder.
 * @param {string} location origin or destination.
 * @param {GeoJSON Feature} feature A valid geojson feature.
 */
function updateLocationFromFeature(location, feature) {
  if (feature.place_name) {
    state[location].address = feature.place_name;
  }
  if (feature.center) {
    [state[location].longitude, state[location].latitude] = feature.center;
  }
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
        if (lastAutocompleteSelection) {
          console.log('we should not have run geocoder');
          // hold on - user selected an autocomplete suggestion,
          // we should use that instead of this result based on a partial text.
          updateLocationFromFeature(location, lastAutocompleteSelection.feature);
          // handled, can reset:
          lastAutocompleteSelection = null;
        } else {
          const d = geoData;
          console.log(`result from geocoding ${addr}: `, d);
          // ensure result looks as we expect from the API
          if (d.type === 'FeatureCollection' && d.features && d.features.length > 0) {
            updateLocationFromFeature(location, d.features[0]);
          }
        }
        // console.log('app state:', state);
        mapUpdateDirectionsEndpoint(location);
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

