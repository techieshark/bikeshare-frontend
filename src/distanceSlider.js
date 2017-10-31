import noUiSlider from './vendor/nouislider';
import state from './state';
import { mapUpdateNearby } from './map';

export default function initDistanceSlider() {
  const range = {
    min: [0],
    '100%': [2, 2],
    max: [2],
  };

  const slider = document.getElementById('directions--distance-range');

  const distFormatter = {
    // Integers stay integers, other values get two decimals.
    // ex: 1 -> "1" and 1.5 -> "1.50"
    // to: (n) => Number.isInteger(n) ? n : (n).toFixed(2)
    // we provide the 'to' function because noUiSlider expects that
    // (prototype compatible w/ wNumb formatting library's objects).
    to: (n) => {
      if (n === 1) { // don't need tick on '1', user can figure it out.
        return '';
      } else if (Number.isInteger(n)) {
        return n ? `${n} mi` : n; // 0 doesn't need units.
      } else if (n % 0.5 === 0) {
        return (n).toFixed(2);
      }
      return ''; // don't need labels on every tick mark
    },
  };

  noUiSlider.create(slider, {
    range,
    start: state.maxWalkDistance,
    step: 0.25,
    connect: [true, false],
    pips: {
      mode: 'count',
      values: 3, // 3 major ticks
      density: 12.5, // 1 small tick every 12.5% (every 0.25 btwn 0 and 2)
      format: distFormatter,
    },
  });

  slider.noUiSlider.on('update', (values, handle) => {
    const value = values[handle];
    // console.log(`Searching within ${value} miles.`);
    const el = document.getElementById('directions--distance-value');
    el.innerText = `${Number(value).toFixed(2)} mi.`;
    state.maxWalkDistance = parseFloat(value);
    mapUpdateNearby();
  });
}

