
/* Directions controls ********************** */

import initDistanceSlider from './distanceSlider';
import initOriginLocatorBtn from './originLocatorButton';
import initDirectionInput from './directionInput';

export default function initDirectionsControls() {
  // let distancePicker = document.getElementById('directions--distance-picker');
  // distancePicker.onchange=distanceInputChanged;
  // var slider = document.getElementById('directions--distance-slider');
  initDistanceSlider();
  initOriginLocatorBtn();
  // initOriginField();
  initDirectionInput('originInput', 'origin');
  initDirectionInput('destinationInput', 'destination');
}
