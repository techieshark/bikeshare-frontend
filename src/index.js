import noUiSlider from './vendor/nouislider';
import getPopupContent from './popups';
import './style.css';
import './vendor/nouislider.min.css';

import { reverseGeocode as revGeocode, geocode } from './geocoder';

const stationsURL = 'https://lit-beach-21586.herokuapp.com/'; // geojson mirror of stations api
let map;
let userLat;
let userLng;
let userAddr;


function addStations() {
  map.on('load', () => {
    // map.addSource('stations-source', {
    //   type: 'geojson',
    //   data: 'https://lit-beach-21586.herokuapp.com/'
    // });

    window.setInterval(() => {
      map.getSource('stations-source').setData(stationsURL);
      console.log('refetching live station data'); // eslint-disable-line
    }, 30 * 1000); // every N seconds (in milliseconds)

    map.addSource('stations-source', { type: 'geojson', data: stationsURL });
    map.addLayer({
      id: 'stations-layer',
      type: 'circle',
      source: 'stations-source',
      paint: {
        'circle-radius': 12,
        'circle-color': '#B42222',
        'circle-opacity': 0, // transparent dots sized for interaction - allows popup
      },
    });

    // Change the cursor to a pointer when the mouse is over the layer.
    map.on('mouseenter', 'stations-layer', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'stations-layer', () => {
      map.getCanvas().style.cursor = '';
    });
  });
}

function addPopups() {
  map.on('click', (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['stations-layer'], // replace this with the name of the layer
    });

    if (!features.length) {
      return;
    }

    const feature = features[0];

    const popup = new mapboxgl.Popup({ offset: [0, -15] })
      .setLngLat(feature.geometry.coordinates)
      .setHTML(getPopupContent(feature))
      .setLngLat(feature.geometry.coordinates)
      .addTo(map);
    // eslint-disable-next-line no-underscore-dangle
    popup._container.classList.add('station-popup--container'); // for styling
  });
}


/**
 * Fetch the user's address based on the lat/lng
 */
function reverseGeocode() {
  if (!userLat || !userLng) return; // nothing to do

  revGeocode(userLat, userLng, (err, geoData) => {
    userAddr = geoData;
  }); // XXX TODO
}

/**
 * Instantiate map with stations.
 * @param {[lon,lat]} center: lon,lat coords on which to center the view
 */
function mapCreate(center, zoom = 8) {
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/techieshark/cj97690r00bcc2sthkqxn8f2v',
    zoom, // '13',
    center,
  });

  // Add geolocate control to the map.
  const geolocateControl = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
  });
  map.addControl(geolocateControl);

  geolocateControl.on('geolocate', (position) => {
    // console.log('coords: ', position.coords);
    const { latitude, longitude } = position.coords;
    userLat = latitude;
    userLng = longitude;
    reverseGeocode();
  });
  // geolocateControl.on('trackuserlocationstart', function (foo) {
  //   console.log('started tracking user location');
  //   console.log('foo', foo);
  // })

  // fetchStations();
  addStations();
  addPopups();
}


/* Directions controls ********************** */

function initDistanceSlider() {
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
    start: 0.25,
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
    // console.log('Searching within ' + value + ' miles.');
    const el = document.getElementById('directions--distance-value');
    el.innerText = `${Number(value).toFixed(2)} mi.`;
  });
}


function initDirectionsControls() {
  document.addEventListener('DOMContentLoaded', () => {
    // let distancePicker = document.getElementById('directions--distance-picker');
    // distancePicker.onchange=distanceInputChanged;
    // var slider = document.getElementById('directions--distance-slider');
    initDistanceSlider();
  }, false);
}


/* Initialization *************************** */

(function init() {
  // Fallback location: center of bay area
  let lat = 37.611;
  let lon = -121.753;
  let zoom = 8;

  // eslint-disable-next-line no-extend-native
  Number.prototype.between = (min, max) => this > min && this < max;

  // Grab IP location from freegeoip API
  const geoLocationProviderURL = 'https://freegeoip.net/json/';
  fetch(geoLocationProviderURL)
    .then(resp => resp.json())
    .then((data) => {
      // Because this bike share only operates in the SF bay area, we
      // jump to the user's specific location only if they're inside a
      // bay-centered bounding area.
      if ((data.longitude).between(-124, -121) && (data.latitude).between(36.5, 38.4)) {
        lat = data.latitude;
        lon = data.longitude;
        zoom = 11; // zoom more than default since we know exact location
      }
      mapCreate([lon, lat], zoom);
    })
    .catch((error) => {
      console.log(`Error fetching location data: ${error}`); // eslint-disable-line
      mapCreate([lon, lat]); // go for it anyway, using defaults
    });

  initDirectionsControls();
}());
