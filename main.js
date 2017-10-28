const stationsURL = 'https://lit-beach-21586.herokuapp.com/'; // geojson mirror of stations api
var map;


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
  map.on("load", function() {
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
 * Instantiate map with stations.
 * @param {[lon,lat]} center: lon,lat coords on which to center the view
 */
function mapCreate(center) {
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/techieshark/cj97690r00bcc2sthkqxn8f2v',
    zoom: '13',
    center: center,
  });

  // fetchStations();
  addStations();
  addPopups();
}


(function init() {
  // Set default location in case the IP doesn't have one
  let lat = 40.8;
  let lon = -96.67;

  // Grab IP location from freegeoip API
  const geoLocationProviderURL = 'http://freegeoip.net/json/';
  fetch(geoLocationProviderURL)
    .then(resp => resp.json())
    .then((data) => {
      lat = data.latitude;
      lon = data.longitude;
      mapCreate([lon,lat]);
    })
    .catch((error) => {
      console.log('Error fetching location data: ' + error);
      mapCreate([lon,lat]); // go for it anyway, using defaults
    });
})();
