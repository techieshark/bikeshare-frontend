/* Directions controls ********************** */

import initDistanceSlider from './distanceSlider';
import initOriginLocatorBtn from './originLocatorButton';
import initDirectionInput from './directionInput';

export default function initDirectionsControls() {
  initDistanceSlider();
  initOriginLocatorBtn();
  initDirectionInput('originInput', 'origin');
  initDirectionInput('destinationInput', 'destination');
}
