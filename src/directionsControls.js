/* Directions controls ********************** */

import initDistanceSlider from './distanceSlider';
import initOriginLocatorBtn from './originLocatorButton';
import initDirectionInput from './directionInput';

function initDirectionsToggle() {
  const toggle = document.getElementById('directions-toggle');
  let shown = true;
  toggle.onclick = () => {
    const content = document.getElementsByClassName('directions--content')[0];
    if (shown) {
      // first ensure the toggle button doesn't disappear
      toggle.style.width = `${content.clientWidth}px`;
      content.style.display = 'none';
    } else {
      toggle.style.width = '100%';
      content.style.display = 'block';
    }
    shown = !shown;
    toggle.classList.toggle('shown');
    toggle.classList.toggle('hidden');
  };
}

export default function initDirectionsControls() {
  initDistanceSlider();
  initOriginLocatorBtn();
  initDirectionInput('originInput', 'origin');
  initDirectionInput('destinationInput', 'destination');
  initDirectionsToggle();
}
