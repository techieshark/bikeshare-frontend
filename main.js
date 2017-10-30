const stationsURL = 'https://lit-beach-21586.herokuapp.com/'; // geojson mirror of stations api
var map;
var userLat, userLng;


/**
* Fetches stations from server & loads them on the map.
*/
function fetchStations() {
  fetch(urlStations)
  .then((resp) => {
    // console.log('response', resp);
    // console.log('resp body', resp.body);
    return resp.json().then((data) => {
      // console.log('parsed json data', data);
      stationsLoad(data);
    }).catch(error => console.log('error parsing fetched data: ', error));
  })
  .catch((error) => {
    console.log('Error attempting to fetch stations: ' + error);
  });
}

/**
* Create one marker for every station in the response.
*/
function stationsLoad(stations) {
  // console.log('stations', stationsResponse);
  // let stations = stationsResponse.stationBeanList; <-- "beanlist" is in orig feed, not our custom data.
  stations.forEach((station) => {
    // create a HTML element for each feature
    var el = document.createElement('div');
    el.className = 'marker';

    var marker = new mapboxgl.Marker(el)
    .setLngLat([station.longitude, station.latitude])
    .addTo(map);
  });
}


function addStations() {
  map.on('load', function() {
    // map.addSource('stations-source', {
    //   type: 'geojson',
    //   data: 'https://lit-beach-21586.herokuapp.com/'
    // });


  window.setInterval(function() {
    map.getSource('stations-source').setData(stationsURL);
    console.log('refetching live station data');
  }, 30 * 1000); // every N seconds (in milliseconds)

  map.addSource('stations-source', { type: 'geojson', data: stationsURL });
  map.addLayer({
      "id": "stations-layer",
      // "type": "symbol",
      "type": "circle",
      "source": "stations-source",
      "paint": {
        "circle-radius": 12,
        "circle-color": "#B42222",
        "circle-opacity": 0, // transparent dots sized for interaction - allows popup
      },
      // "layout": {
      //     // "icon-image": "rocket-15"
      //     "icon-image": "bikeshare-marker",
      //     "icon-size": 2
      // }
  });


    // Change the cursor to a pointer when the mouse is over the layer.
    map.on('mouseenter', 'stations-layer', function () {
      map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'stations-layer', function () {
        map.getCanvas().style.cursor = '';
    });


    // TODO. For now, we've switched to getting layer from tileset in mapbox.
    // Need to figure out how to update tileset every X minutes.

    // add slightly different layers for the different zoom levels
    // map.addLayer({
    //   "id": "stations-icons",
    //   // "type": "circle",
    //   "source": "stations-source",
    //   // "paint": {
    //   //     "circle-radius": 6,
    //   //     "circle-color": "#B42222"
    //   // },
    //   type: 'symbol',
    //   // source: 'bikeshare-stations',
    //   "layout": {
    //       "icon-image": "bikeshare-marker",
    //       "icon-size":1.5
    //   },
    //   "paint": {},
    //   "minzoom": 13
    // });

    // map.addLayer({
    //   "id": "stations-dots",
    //   "type": "circle",
    //   "source": "stations-source",
    //   "paint": {
    //       "circle-radius": 2,
    //       "circle-color": "#B42222"
    //   },
    //   "maxzoom": 13
    // });

  });
}

function addPopups() {
  map.on('click', function(e) {
    var features = map.queryRenderedFeatures(e.point, {
      layers: ['stations-layer'] // replace this with the name of the layer
    });

    if (!features.length) {
      return;
    }

    var feature = features[0];

    var popup = new mapboxgl.Popup({ offset: [0, -15] })
      .setLngLat(feature.geometry.coordinates)
      .setHTML(getPopupContent(feature))
      .setLngLat(feature.geometry.coordinates)
      .addTo(map);
    popup._container.classList.add('station-popup--container'); // for styling
  });
}


/**
 * Get HTML content describing a station.
 * @param station - one station from the API
 */
function getPopupContent(station) {
  const {
    stAddress1: addr,
    latitude: lat,
    longitude: lng,
    availableBikes: bikes,
    availableDocks: docks,
    statusValue: status } = station.properties;
  const directionsURL = getDirectionsLink(addr, undefined, lat, lng);
  let round = (n) => Number(n).toFixed(2);

  const alertMsg = (status === 'Not In Service') ? `<div class="station-popup--alert">${status}</div>` : '';

  return `
    <div class="station-popup">
      <h3>${addr}</h3>
      ${alertMsg}
      <div class="columns station-popup--stats">
        <div class="column station-popup--bikes">
          <div class="station-popup--bikes-number">${bikes}</div>
          <div class="station-popup--bikes-text">bikes</div>
        </div>
        <div class="column station-popup--docks">
          <div class="station-popup--docks-number">${docks}</div>
          <div class="station-popup--docks-text">docks</div>
        </div>
      </div>
      <div class="station-popup--directions">
        <a rel="noopener noreferrer" target="_blank" href="${directionsURL}">Directions to here</a>
      </div>
      <div class="station-popup--coordinates">Lat/Long: <abbr title="${lat}, ${lng}">${round(lat)}, ${round(lng)}</abbr></div>
    </div>`
}

/**
 * Get URL for Google directions to or from a given place.
 * @param {*} dir - either 'to' (default) or 'from'
 * @param {*} addr - address
 * @param {*} lat - latitude
 * @param {*} lng - longitude
 */
function getDirectionsLink(toAddr = '', fromAddr = '', toLat, toLng) {
  // TODO / BUG: "addresses" with a '/' in them don't work, like
  // "Civic Center/UN Plaza BART Station (Market St at McAllister St)" - currently that results
  // in directions from civic center to UN plaza (b/c g-maps separates locations with a '/')
  const baseURL = 'https://www.google.com/maps/dir';
  const coords = toLat ? `${toLat},${toLng},`: '';
  const zoom = 17;
  return `${baseURL}/${fromAddr}/${toAddr}/@${coords}${zoom}/`
  // Google maps expects addresses with name first, then plus-separated components like this:
  // Noisebridge,+2169+Mission+St,+San+Francisco,+CA+94110

}

/**
 * Fetch the user's address based on the lat/lng
 */
function reverseGeocode() {
  if (!userLat || !userLng) return; // nothing to do

  reverseGeocodeLatLng(userLat, userLng); // XXX TODO
}

/**
 * Instantiate map with stations.
 * @param {[lon,lat]} center: lon,lat coords on which to center the view
 */
function mapCreate(center, zoom = 8) {
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/techieshark/cj97690r00bcc2sthkqxn8f2v',
    zoom: zoom, // '13',
    center: center,
  });

  // Add geolocate control to the map.
  let geolocateControl = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
  })
  map.addControl(geolocateControl);

  geolocateControl.on('geolocate', function (position) {
    console.log('coords: ', position.coords);
    const {latitude, longitude} = position.coordinates;
    userLat = latitude;
    userLng = longitude;
    reverseGeocode();
  })
  // geolocateControl.on('trackuserlocationstart', function (foo) {
  //   console.log('started tracking user location');
  //   console.log('foo', foo);
  // })

  // fetchStations();
  addStations();
  addPopups();
}


/* Directions controls ***********************/

function initDirectionsControls() {
  document.addEventListener('DOMContentLoaded',function() {
    // let distancePicker = document.getElementById('directions--distance-picker');
    // distancePicker.onchange=distanceInputChanged;
    // var slider = document.getElementById('directions--distance-slider');
    initDistanceSlider();
  },false);
}

function initDistanceSlider() {
  console.log('init slider');
  var range = {
    'min': [ 0 ],
    '100%': [ 2, 2 ],
    'max': [ 2 ]
  };

  var slider = document.getElementById('directions--distance-range');

  distFormatter = {
    // Integers stay integers, other values get two decimals.
    // ex: 1 -> "1" and 1.5 -> "1.50"
    // to: (n) => Number.isInteger(n) ? n : (n).toFixed(2)
    // we provide the 'to' function because noUiSlider expects that
    // (prototype compatible w/ wNumb formatting library's objects).
    to: (n) => {
      if (n == 1) { return '' } // don't need tick on '1', user can figure it out.
      else if (Number.isInteger(n)) {
        return n ? `${n} mi` : n; // 0 doesn't need units.
      } else if (n % 0.5 === 0) {
        return (n).toFixed(2);
      }
      return ''; // don't need labels on every tick mark
    }
  }

  noUiSlider.create(slider, {
    range: range,
    start: 0.25,
    step: 0.25,
    connect: [true, false],
    // tooltips: true,
    // pips: {
    //   mode: 'steps',
    //   density: 12.5,
    //   // filter function returns: 0 (no pip), 1 (large pip) or 2 (small pip).
    //   filter: (n) => Number.isInteger(n) ? 1 : 2,
    //   format: distFormatter
    // }
    pips: {
      mode: 'count',
      values: 3, // 3 major ticks
      density: 12.5, // 1 small tick every 12.5% (every 0.25 btwn 0 and 2)
      format: distFormatter,
    }
  });

  slider.noUiSlider.on('update', function( values, handle ) {
    var value = values[handle];

    // console.log('Searching within ' + value + ' miles.');
    let el = document.getElementById('directions--distance-value');
    el.innerText = `${Number(value).toFixed(2)} mi.`;
  });

  // function distanceInputChanged(event) {
  //   console.log('Searching within ' + event.target.value + ' miles.');
  //   let el = document.getElementById('directions--distance-value');
  //   el.innerText = `${Number(event.target.value).toFixed(2)} mi.`;
  // }
}


/* Initialization ****************************/

(function init() {
  // Fallback location: center of bay area
  let lat = 37.611;
  let lon = -121.753;
  let zoom = 8;

  Number.prototype.between = function (min, max) {
    return this > min && this < max;
  };

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
      mapCreate([lon,lat], zoom);
    })
    .catch((error) => {
      console.log('Error fetching location data: ' + error);
      mapCreate([lon,lat]); // go for it anyway, using defaults
    });

  initDirectionsControls();
})();
