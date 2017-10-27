// Set default location in case the IP doesn't have one
let lat = 40.8;
let lon = -96.67;
// Grab IP location from freegeoip API
const urlGeoIP = 'http://freegeoip.net/json/';
// var urlStations = 'http://feeds.bayareabikeshare.com/stations/stations.json';
// const urlStations = 'getBSjson.php';
// const urlStations = 'http://127.0.0.1:8080/http://feeds.bayareabikeshare.com/stations/stations.json';
const urlStations = 'http://127.0.0.1:3001/';
var map;

fetch(urlGeoIP)
  .then(resp => resp.json())
  .then((data) => {
    lat = data.latitude;
    lon = data.longitude;
    mapCreate([lon,lat]);
  })
  .catch((error) => {
    console.log('Error fetching location data: ' + error);
  });


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
    map.addSource('stations-source', {
      type: 'geojson',
      data: 'https://lit-beach-21586.herokuapp.com/' // geojson mirror of stations api
    });


    // add slightly different layers for the different zoom levels
    map.addLayer({
      "id": "stations-icons",
      "type": "circle",
      "source": "stations-source",
      "paint": {
          // "fill-color": "#888888",
          // "fill-opacity": 0.4
          "circle-radius": 6,
          "circle-color": "#B42222"
      },
      "minzoom": 13
    });

    map.addLayer({
      "id": "stations-dots",
      "type": "circle",
      "source": "stations-source",
      "paint": {
          // "fill-color": "#888888",
          // "fill-opacity": 0.4
          "circle-radius": 2,
          "circle-color": "#B42222"
      },
      // "filter": ["==", "$type", "Polygon"]
      "maxzoom": 13
    });

  });
}

/**
 * Instantiate map with stations.
 * @param {[lon,lat]} center: lon,lat coords on which to center the view
 */
function mapCreate(center) {
  map = new mapboxgl.Map({
    container: 'map',
    // style: 'mapbox://styles/mapbox/streets-v9',
    style: 'mapbox://styles/mapbox/light-v9',
    // style: 'mapbox://styles/techieshark/cj96g0w8c59zk2snztf4ild9v',
    zoom: '13',
    center: center,
  });

  // fetchStations();
  addStations();
}

// map.addControl(new mapboxgl.FullscreenControl());





/// OLD CRUD


// var request = new XMLHttpRequest();
// request.open('GET', urlGeoIP, true);

// request.onload = function() {
//   if (request.status >= 200 && request.status < 400) {
//     // Success!
//     var json = JSON.parse(request.responseText);
//     lat = json.latitude;
//     lon = json.longitude;
//   } else {
//     // We reached our target server, but it returned an error
//     console.log('error determining coordinates from IP');
//   }
//   mapCreate([lon,lat]);
// };

// request.onerror = function() {
//   // There was a connection error of some sort
//   console.log('error connecting to geoIP server');
//   mapCreate([lon,lat]);
// };

// request.send();