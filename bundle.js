/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

// Application state.
exports.default = {
  maxWalkDistance: 0.25,
  user: {
    longitude: null,
    latitude: null,
    address: null
  },
  origin: {
    longitude: null,
    latitude: null,
    address: null
  },
  destination: {
    longitude: null,
    latitude: null,
    address: null
  }
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initMap;
exports.flyTo = flyTo;
exports.renderDirectionsMarker = renderDirectionsMarker;
exports.mapUpdateNearby = mapUpdateNearby;
exports.mapUpdateDirectionsEndpoint = mapUpdateDirectionsEndpoint;

var _circle = __webpack_require__(21);

var _circle2 = _interopRequireDefault(_circle);

var _helpers = __webpack_require__(26);

var _within = __webpack_require__(27);

var _within2 = _interopRequireDefault(_within);

var _StationFeed = __webpack_require__(31);

var _StationFeed2 = _interopRequireDefault(_StationFeed);

var _popups = __webpack_require__(32);

var _popups2 = _interopRequireDefault(_popups);

var _userGeolocate = __webpack_require__(33);

var _userGeolocate2 = _interopRequireDefault(_userGeolocate);

var _router = __webpack_require__(36);

var _router2 = _interopRequireDefault(_router);

var _config = __webpack_require__(2);

var _config2 = _interopRequireDefault(_config);

var _state = __webpack_require__(0);

var _state2 = _interopRequireDefault(_state);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var stationsURL = _config2.default.stationsUrl;

var map = void 0;

function addStations() {
  map.on('load', function () {
    window.setInterval(function () {
      map.getSource('stations-source').setData(_StationFeed2.default.getStations());
      // map.getSource('stations-source').setData(stationsURL);
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
        'circle-opacity': 0 // transparent dots sized for interaction - allows popup
      }
    });

    // Change the cursor to a pointer when the mouse is over the layer.
    map.on('mouseenter', 'stations-layer', function () {
      map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'stations-layer', function () {
      map.getCanvas().style.cursor = '';
    });
  });
}

function addPopups() {
  map.on('click', function (e) {
    var features = map.queryRenderedFeatures(e.point, {
      layers: ['stations-layer'] // replace this with the name of the layer
    });

    if (!features.length) {
      return;
    }

    var feature = features[0];

    var popup = new mapboxgl.Popup({ offset: [0, -15] }).setLngLat(feature.geometry.coordinates).setHTML((0, _popups2.default)(feature)).setLngLat(feature.geometry.coordinates).addTo(map);
    // eslint-disable-next-line no-underscore-dangle
    popup._container.classList.add('station-popup--container'); // for styling
  });
}

function addEmptyStationsNearbySources() {
  map.on('load', function () {
    var emptyFeatureSet = {
      type: 'FeatureCollection',
      features: []
    };
    map.addSource('stations-near-origin', {
      type: 'geojson',
      data: emptyFeatureSet,
      maxzoom: 22 // otherwise we get precision / misalignment errors
      // might relate to:
      // https://github.com/mapbox/mapbox-gl-js/issues/2279
      // https://github.com/mapbox/mapbox-gl-js/issues/1733
    });
    map.addSource('stations-near-destination', {
      type: 'geojson',
      data: emptyFeatureSet,
      maxzoom: 22
    });
  });
}

/**
 * Instantiate map with stations.
 * @param {[lon,lat]} center: lon,lat coords on which to center the view
 */
function initMap(center) {
  var zoom = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 8;

  map = new mapboxgl.Map({
    container: 'map',
    style: _config2.default.mapStyle,
    zoom: zoom,
    center: center
  });

  // Add geolocate control to the map.
  var geolocateControl = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true
  });
  map.addControl(geolocateControl);
  geolocateControl.on('geolocate', _userGeolocate2.default);

  addEmptyStationsNearbySources();
  // fetchStations();
  addStations();
  addPopups();
}

/**
 *
 * @param {String} location - origin or destination
 */
function flyTo(location) {
  // console.log(`flying to:
  // ${[state[location].longitude, state[location].latitude]} (${state[location].address})`);
  map.flyTo({
    center: [_state2.default[location].longitude, _state2.default[location].latitude],
    zoom: 14
  });
}

var endpointMarkers = {};

/**
 * Add or update the origin or destination marker
 * @param {String} location - origin or destination
 */
function renderDirectionsMarker(location) {
  if (endpointMarkers[location]) {
    // console.log(`setting endpoint for ${location} to
    // ${[state[location].longitude, state[location].latitude]}`);
    endpointMarkers[location].setLngLat([_state2.default[location].longitude, _state2.default[location].latitude]);
    // endpointMarkers[location].addTo(map);
  } else {
    // console.log(`creating ${location} marker`);
    var el = document.createElement('div');
    el.className = 'marker map-marker-directions is-' + location;
    endpointMarkers[location] = new mapboxgl.Marker(el).setLngLat([_state2.default[location].longitude, _state2.default[location].latitude]).addTo(map);
  }
}

/**
 * Return a FeatureCollection of stations within state.maxWalkingDistance of location.
 * @param {String} location - origin or destination
 */
function getStationsNear(location) {
  if (_state2.default.maxWalkDistance === 0) {
    return {
      type: 'FeatureCollection',
      features: []
    };
  }

  // get all stations
  var stations = _StationFeed2.default.getStationsArray();
  // const stations = map.querySourceFeatures('stations-source');
  // can't use querySourceFeatures: only looks in visible area
  // if needed, use filter to limit result set (only those w/ available bikes, etc).
  // https://www.mapbox.com/mapbox-gl-js/api/#map#querysourcefeatures

  console.log('got all stations; searching within ' + _state2.default.maxWalkDistance, stations);

  // use Turf to do a proximity search.
  // TODO: or better, use Mapzen to do an isochrone search
  var center = (0, _helpers.point)([_state2.default[location].longitude, _state2.default[location].latitude]);
  var searchWithinFeatures = (0, _helpers.featureCollection)([(0, _circle2.default)(center, _state2.default.maxWalkDistance, { units: 'miles' })]);
  var stationCollection = (0, _helpers.featureCollection)(stations);

  var nearbyStations = (0, _within2.default)(stationCollection, searchWithinFeatures);
  return nearbyStations;
}

/**
 * Splits the given group of stations based on availability status.
 * If location is origin, criteria is bikes; otherwise it's docks.
 * Returns [empty, available] where each is a F.C.
 * @param {String} location - origin or destination
 * @param {} stationsCollection - FeatureCollection of stations already near location
 */
// function splitEmptyOrAvailable(location, stationsCollection) {
//   /*
//   Bikeshare stations within the specified distance of the origin
//      that have bikes available should be marked green
//      with no available bikes should be marked red

//   Bikeshare stations within the specified distance of the destination
//     that have docks available should be marked green
//     that have no docks available should be marked red
//   */

//   const stations = stationsCollection.features;
//   const availableCritera = location === 'origin' ? 'availableBikes' : 'availableDocks';

//   const empty = [];
//   const available = [];

//   stations.forEach((station) => {
//     if (station.properties[availableCritera] > 0) {
//       available.push(station);
//     } else {
//       empty.push(station);
//     }
//   });

//   return [empty, available];
// }


function getLayerIdForStationsNear(location) {
  return 'stations-near-' + location;
}

/**
 * Highlight the given stations near the given location
 * @param {String} location - origin or destination
 * @param {FeatureCollection} stations nearby the origin or destination to highlight
 */
function showStationsNear(location, stations) {
  // draw stations as markers on the map
  console.log('showing stations nearby ' + location + ': ', stations);

  var layerAndSourceId = getLayerIdForStationsNear(location);
  var availableCritera = location === 'origin' ? 'availableBikes' : 'availableDocks';

  console.log('adding matching nearby stations');
  map.getSource(layerAndSourceId).setData(stations);

  var layer = map.getLayer(layerAndSourceId);
  if (!layer) {
    // should only need to do this once.
    // Create a new circle layer from the data source
    map.addLayer({
      id: layerAndSourceId,
      type: 'circle',
      source: layerAndSourceId,
      paint: {
        'circle-radius': 12, // bikeshare icon is 24px (scaled by 1/2 so 12)
        'circle-color': {
          property: availableCritera,
          stops: [
          // "available": 0   -> circle color will be red
          [0, 'red'],
          // "available": 1 or more -> circle color will be green
          [1, 'lightseagreen']]
        }
      }
    }, 'bikeshare-stations'); // place color beneath bikeshare icons
  }
}

function clearStationsNear(location) {
  var layerID = getLayerIdForStationsNear(location);
  var layer = map.getLayer(layerID);
  if (layer) {
    map.removeLayer(layerID);
  }
}

/**
 * Update station results nearby.
 * When the origin or destination is set,
 * or when the user's max walking distance preference changes,
 * update nearby results.
 */
function mapUpdateNearby() {
  // console.log('mapupdatenearby()');

  ['origin', 'destination'].forEach(function (location) {
    if (_state2.default[location].latitude && _state2.default[location].longitude) {
      var nearbyStations = getStationsNear(location);
      console.log('got stations near ' + location, nearbyStations);

      // if (map.isMoving()) {
      //   console.log('NOTE: map was moving, rescheduling station update to end of move');
      //   map.once('moveend', () => {
      //     console.log('station update after move end');
      //     showStationsNear(location, nearbyStations);
      //   });
      // } else {
      //   console.log('map not moving; doing station update');
      //   showStationsNear(location, nearbyStations);
      // }
      showStationsNear(location, nearbyStations);
    } else {
      // if we *don't* have a particular location endpoint,
      // then we need to clear the markers
      clearStationsNear(location);
    }
  });
}

function mapClearRoute() {
  var routeLayer = map.getLayer('route');
  if (routeLayer) {
    map.removeLayer('route');
  }
}

function mapUpdateRoute() {
  if (_state2.default.origin.latitude && _state2.default.destination.latitude) {
    (0, _router2.default)(_state2.default.origin, _state2.default.destination, function (routeLineString) {
      var source = map.getSource('route');
      if (source) {
        source.setData(routeLineString);
      } else {
        source = map.addSource('route', { type: 'geojson', data: routeLineString });
      }

      // place route beneath nearby markers (themselves beneath stations)
      var layerAbove = getLayerIdForStationsNear('origin');

      // creating source for the first time; add a layer for it.
      // have to do this every time?
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        //  {
        //   type: 'geojson',
        //   data: routeLineString,
        // },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#4AB2F7', // google maps blue #888
          'line-width': 8
        }
      }, layerAbove);
    });
  } else {
    // we don't have both end points - ensure no route shown
    mapClearRoute();
  }
}

/**
 * Add or remove endpoint marker and update nearby stations.
 * @param {String} location origin or destination
 */
function mapUpdateDirectionsEndpoint(location) {
  // console.log('mapUpdateDirectionsEndpoint()');
  mapUpdateRoute();
  if (_state2.default[location].latitude === null && endpointMarkers[location]) {
    // clear marker
    console.log('clearing ' + location + ' marker (no latitude)');
    endpointMarkers[location].remove();
    endpointMarkers[location] = null;
  } else {
    renderDirectionsMarker(location);
    flyTo(location);
  }
  mapUpdateNearby();
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  mapzenKey: 'mapzen-hzVbSr5',
  mapboxToken: 'pk.eyJ1IjoidGVjaGllc2hhcmsiLCJhIjoiYzk2ZEFWTSJ9.8ZY6rG2BWXkDBmvAPvn_nw',
  mapStyle: 'mapbox://styles/techieshark/cj97690r00bcc2sthkqxn8f2v',
  stationsUrl: 'https://lit-beach-21586.herokuapp.com/' // geojson mirror of stations api
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reverseGeocode = reverseGeocode;
exports.geocode = geocode;
exports.setGeocderCenter = setGeocderCenter;
exports.setGeocoderBounds = setGeocoderBounds;

var _mapboxGeocoding = __webpack_require__(34);

var _mapboxGeocoding2 = _interopRequireDefault(_mapboxGeocoding);

var _config = __webpack_require__(2);

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mapboxGeocoding2.default.setAccessToken(_config2.default.mapboxToken);

/**
 * Reverse Geocode lat/lng -- using Mapbox under the hood.
 * @param {*} lat
 * @param {*} lng
 * @param {*} callback: (err, geoData) => any
 */

// var geo = require('mapbox-geocoding');

function reverseGeocode(lat, lng, callback) {
  // Reverse geocode coordinates to address.
  _mapboxGeocoding2.default.reverseGeocode('mapbox.places', lng, lat, function (err, geoData) {
    // console.log(geoData);
    callback(err, geoData);
  });
}

/**
 * Geocode address - using Mapbox under the hood.
 * @param {string} address
 * @param {Function} callback: (err, geoData) => any
 */
function geocode(address, callback) {
  // Geocode an address to coordinates
  _mapboxGeocoding2.default.geocode('mapbox.places', address, function (err, geoData) {
    // console.log(geoData);
    callback(err, geoData);
  });
}

/**
 * Bias geocoding results near the center.
 * @param {[longitude,latitude]} center for proximity bias
 */
function setGeocderCenter(center) {
  _mapboxGeocoding2.default.setSearchCenter(center);
}

/**
 * Search withing the given bounding box
 * @param {string} bbox bounding box string in format minX,minY,maxX,maxY
 */
function setGeocoderBounds(bbox) {
  _mapboxGeocoding2.default.setSearchBounds(bbox);
}

/***/ }),
/* 4 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			var styleTarget = fn.call(this, selector);
			// Special case to return head of iframe instead of iframe itself
			if (styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[selector] = styleTarget;
		}
		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(14);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertInto + " " + options.insertAt.before);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = userReverseGeocode;

var _state = __webpack_require__(0);

var _state2 = _interopRequireDefault(_state);

var _geocoder = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Fetch the user's address based on the lat/lng
 * @param callback: (err, geoData, addrString)
 */
function userReverseGeocode() {
  var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

  if (!_state2.default.user.latitude || !_state2.default.user.longitude) return; // nothing to do

  (0, _geocoder.reverseGeocode)(_state2.default.user.latitude, _state2.default.user.longitude, function (err, geoData) {
    var d = geoData;
    if (d.type === 'FeatureCollection' && d.features && d.features.length > 0 && d.features[0].place_name) {
      _state2.default.user.address = d.features[0].place_name;
    }
    // console.log('fetched reverse geocoder response for coords:', geoData);
    callback(err, geoData, _state2.default.user.address);
  });
}

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(8);

__webpack_require__(15);

__webpack_require__(17);

var _directionsControls = __webpack_require__(18);

var _directionsControls2 = _interopRequireDefault(_directionsControls);

var _map = __webpack_require__(1);

var _map2 = _interopRequireDefault(_map);

var _geocoder = __webpack_require__(3);

var _state = __webpack_require__(0);

var _state2 = _interopRequireDefault(_state);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.appState = _state2.default; // XXX for console debugging.

/* Initialization *************************** */

function initPage(lngLat, zoom) {
  var doInit = function doInit() {
    (0, _map2.default)(lngLat, zoom);
    (0, _directionsControls2.default)();
  };

  if (document.readyState === 'complete' || document.readyState === 'loaded') {
    // document is already ready to go
    doInit();
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      console.log('loading page');
      doInit();
    }, false);
  }
}

(function init() {
  var _this = this;

  console.log('initializing app');
  // Fallback location: center of bay area
  var lat = 37.611;
  var lon = -121.753;
  var zoom = 8;
  (0, _geocoder.setGeocderCenter)([lon, lat]);
  (0, _geocoder.setGeocoderBounds)('-123.5337,36.8931,-121.2082,38.8643');

  // eslint-disable-next-line no-extend-native
  Number.prototype.between = function (min, max) {
    return _this > min && _this < max;
  };

  // Grab IP location from freegeoip API
  var geoLocationProviderURL = 'https://freegeoip.net/json/';
  fetch(geoLocationProviderURL).then(function (resp) {
    return resp.json();
  }).then(function (data) {
    // Because this bike share only operates in the SF bay area, we
    // jump to the user's specific location only if they're inside a
    // bay-centered bounding area.
    if (data.longitude.between(-124, -121) && data.latitude.between(36.5, 38.4)) {
      lat = data.latitude;
      lon = data.longitude;
      zoom = 11; // zoom more than default since we know exact location
    }
    initPage([lon, lat], zoom);
  }).catch(function (error) {
    console.log('Error fetching location data: ' + error); // eslint-disable-line
    if (error === 'Error: Coordinates must contain numbers') {
      throw error;
    } else {
      initPage([lon, lat]); // go for it anyway, using defaults
    }
  });
})();

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(9);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(5)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!./style.css", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!./style.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(undefined);
// imports


// module
exports.push([module.i, ".marker {\n  background-image: url(" + __webpack_require__(10) + ");\n  background-size: cover;\n  width: 50px;\n  height: 50px;\n  border-radius: 50%;\n  cursor: pointer;\n}\n\n.map-marker-directions {\n  background-repeat: no-repeat;\n  background-position: center;\n  background-size: 12px;\n  width: 20px;\n}\n\n.map-marker-directions.is-origin {\n  background-image: url(" + __webpack_require__(11) + ");\n}\n.map-marker-directions.is-destination {\n  background-image: url(" + __webpack_require__(12) + ");\n}\n\n/********** Directions Input ****************************************/\n\n.directions {\n  position: absolute;\n  padding: 1em;\n  margin: 1em;\n  background: rgba(255, 255, 255, 0.85);\n}\n\n#directions--distance-range {\n  /* width: 157px; */\n  width: 100%;\n}\n\n.directions--distance-picker {\n  margin-bottom: 2em;\n}\n\n#directions--distance-range .noUi-connect {\n  background-color: rgb(222, 224, 224);\n  box-shadow: inset 0 0 1px rgba(51,51,51,.2);\n}\n\n.directions--locate-origin.column {\n  padding-left: 0;\n}\n\n.directions--locate-origin button{\n  background-image: url(" + __webpack_require__(13) + ");\n  background-repeat: no-repeat;\n  background-position: center;\n  background-size: 20px;\n  width: 38px;\n}\n\n/* .directions--locate-origin button.is-light:hover {\n  border-color: black;\n} */\n\n/********** Directions Autocomplete **********************************/\n\n.autocomplete {\n  background: white;\n  z-index: 100;\n  border: 1px solid #e4e2e2;\n}\n\n.autocomplete div {\n  border-top: 1px solid #adadad;\n  padding: 1em;\n  cursor: pointer;\n}\n\n.autocomplete div:hover, .autocomplete div:focus {\n  background: rgb(202, 206, 227);\n}\n\n\n/********** Station Popup *******************************************/\n\n.station-popup--container .mapboxgl-popup-content {\n  padding-bottom: 6px;\n}\n\n.station-popup {\n  text-align: center;\n}\n\n.station-popup h3 {\n  margin-bottom: 1em;\n}\n\n/* div.station-popup--directions {\n} */\n\ndiv.station-popup--directions a{\n  text-decoration: none;\n}\n\n.station-popup--coordinates {\n  border-top: 1px solid lightgrey;\n  text-align: right;\n  padding-top: 0.5em;\n  margin-top: 0.5em;\n\n  font-size: smaller;\n  color: lightgrey;\n}\n\n.station-popup--bikes-number, .station-popup--docks-number {\n  font-size: large;\n}\n\n/* .station-popup--bikes-text, .station-popup--docks-text {\n} */\n\ndiv.station-popup--stats {\n  margin-bottom: 0 !important;\n  font-weight: bold;\n}\n\n.station-popup--alert {\n  font-weight: bold;\n  font-size: large;\n  margin-bottom: 1em;\n}\n", ""]);

// exports


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "d049203bc74696d587a3cdb1d0a661d2.png";

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "2f67bd14f9872daf7713a52ce2e45f9a.svg";

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "99da9a1118b8e43225d3da6fee645ad0.svg";

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "99c6879b01fe7fb27fb26cf2afc7360d.svg";

/***/ }),
/* 14 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(16);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(5)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./nouislider.min.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./nouislider.min.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(undefined);
// imports


// module
exports.push([module.i, "/*! nouislider - 10.0.0 - 2017-05-28 14:52:48 */.noUi-target,.noUi-target *{-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;-ms-touch-action:none;touch-action:none;-ms-user-select:none;-moz-user-select:none;user-select:none;-moz-box-sizing:border-box;box-sizing:border-box}.noUi-target{position:relative;direction:ltr}.noUi-base{width:100%;height:100%;position:relative;z-index:1}.noUi-connect{position:absolute;right:0;top:0;left:0;bottom:0}.noUi-origin{position:absolute;height:0;width:0}.noUi-handle{position:relative;z-index:1}.noUi-state-tap .noUi-connect,.noUi-state-tap .noUi-origin{-webkit-transition:top .3s,right .3s,bottom .3s,left .3s;transition:top .3s,right .3s,bottom .3s,left .3s}.noUi-state-drag *{cursor:inherit!important}.noUi-base,.noUi-handle{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}.noUi-horizontal{height:18px}.noUi-horizontal .noUi-handle{width:34px;height:28px;left:-17px;top:-6px}.noUi-vertical{width:18px}.noUi-vertical .noUi-handle{width:28px;height:34px;left:-6px;top:-17px}.noUi-target{background:#FAFAFA;border-radius:4px;border:1px solid #D3D3D3;box-shadow:inset 0 1px 1px #F0F0F0,0 3px 6px -5px #BBB}.noUi-connect{background:#3FB8AF;border-radius:4px;box-shadow:inset 0 0 3px rgba(51,51,51,.45);-webkit-transition:background 450ms;transition:background 450ms;}.noUi-draggable{cursor:ew-resize}.noUi-vertical .noUi-draggable{cursor:ns-resize}.noUi-handle{border:1px solid #D9D9D9;border-radius:3px;background:#FFF;cursor:default;box-shadow: inset 0 0 1px #FFF,inset 0 1px 7px #EBEBEB,0 3px 6px -3px #BBB;}.noUi-active{box-shadow:inset 0 0 1px #FFF,inset 0 1px 7px #DDD,0 3px 6px -3px #BBB}.noUi-handle:after,.noUi-handle:before{content:\"\";display:block;position:absolute;height:14px;width:1px;background:#E8E7E6;left:14px;top:6px}.noUi-handle:after{left:17px}.noUi-vertical .noUi-handle:after,.noUi-vertical .noUi-handle:before{width:14px;height:1px;left:6px;top:14px}.noUi-vertical .noUi-handle:after{top:17px}[disabled] .noUi-connect{background:#B8B8B8}[disabled] .noUi-handle,[disabled].noUi-handle,[disabled].noUi-target{cursor:not-allowed}.noUi-pips,.noUi-pips *{-moz-box-sizing:border-box;box-sizing:border-box}.noUi-pips{position:absolute;color:#999;}.noUi-value{position:absolute;white-space:nowrap;text-align:center}.noUi-value-sub{color:#ccc;font-size:10px}.noUi-marker{position:absolute;background:#CCC}.noUi-marker-large,.noUi-marker-sub{background:#AAA}.noUi-pips-horizontal{padding:10px 0;height:80px;top:100%;left:0;width:100%}.noUi-value-horizontal{-webkit-transform:translate3d(-50%,50%,0);transform:translate3d(-50%,50%,0)}.noUi-marker-horizontal.noUi-marker{margin-left:-1px;width:2px;height:5px}.noUi-marker-horizontal.noUi-marker-sub{height:10px}.noUi-marker-horizontal.noUi-marker-large{height:15px}.noUi-pips-vertical{padding:0 10px;height:100%;top:0;left:100%}.noUi-value-vertical{-webkit-transform:translate3d(0,50%,0);transform:translate3d(0,50%,0);padding-left:25px}.noUi-marker-vertical.noUi-marker{width:5px;height:2px;margin-top:-1px}.noUi-marker-vertical.noUi-marker-sub{width:10px}.noUi-marker-vertical.noUi-marker-large{width:15px}.noUi-tooltip{display:block;position:absolute;border:1px solid #D9D9D9;border-radius:3px;background:#fff;color:#000;padding:5px;text-align:center;white-space:nowrap}.noUi-horizontal .noUi-tooltip{-webkit-transform:translate(-50%,0);transform:translate(-50%,0);left:50%;bottom:120%}.noUi-vertical .noUi-tooltip{-webkit-transform:translate(0,-50%);transform:translate(0,-50%);top:50%;right:120%}", ""]);

// exports


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "favicon.ico";

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initDirectionsControls;

var _distanceSlider = __webpack_require__(19);

var _distanceSlider2 = _interopRequireDefault(_distanceSlider);

var _originLocatorButton = __webpack_require__(38);

var _originLocatorButton2 = _interopRequireDefault(_originLocatorButton);

var _directionInput = __webpack_require__(39);

var _directionInput2 = _interopRequireDefault(_directionInput);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initDirectionsControls() {
  (0, _distanceSlider2.default)();
  (0, _originLocatorButton2.default)();
  (0, _directionInput2.default)('originInput', 'origin');
  (0, _directionInput2.default)('destinationInput', 'destination');
} /* Directions controls ********************** */

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initDistanceSlider;

var _nouislider = __webpack_require__(20);

var _nouislider2 = _interopRequireDefault(_nouislider);

var _state = __webpack_require__(0);

var _state2 = _interopRequireDefault(_state);

var _map = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initDistanceSlider() {
  var range = {
    min: [0],
    '100%': [2, 2],
    max: [2]
  };

  var slider = document.getElementById('directions--distance-range');

  var distFormatter = {
    // Integers stay integers, other values get two decimals.
    // ex: 1 -> "1" and 1.5 -> "1.50"
    // to: (n) => Number.isInteger(n) ? n : (n).toFixed(2)
    // we provide the 'to' function because noUiSlider expects that
    // (prototype compatible w/ wNumb formatting library's objects).
    to: function to(n) {
      if (n === 1) {
        // don't need tick on '1', user can figure it out.
        return '';
      } else if (Number.isInteger(n)) {
        return n ? n + ' mi' : n; // 0 doesn't need units.
      } else if (n % 0.5 === 0) {
        return n.toFixed(2);
      }
      return ''; // don't need labels on every tick mark
    }
  };

  _nouislider2.default.create(slider, {
    range: range,
    start: _state2.default.maxWalkDistance,
    step: 0.25,
    connect: [true, false],
    pips: {
      mode: 'count',
      values: 3, // 3 major ticks
      density: 12.5, // 1 small tick every 12.5% (every 0.25 btwn 0 and 2)
      format: distFormatter
    }
  });

  slider.noUiSlider.on('update', function (values, handle) {
    var value = values[handle];
    // console.log(`Searching within ${value} miles.`);
    var el = document.getElementById('directions--distance-value');
    el.innerText = Number(value).toFixed(2) + ' mi.';
    _state2.default.maxWalkDistance = parseFloat(value);
    (0, _map.mapUpdateNearby)();
  });
}

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*! nouislider - 10.0.0 - 2017-05-28 14:52:48 */

(function (factory) {

	if (true) {

		// AMD. Register as an anonymous module.
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {

		// Node/CommonJS
		module.exports = factory();
	} else {

		// Browser globals
		window.noUiSlider = factory();
	}
})(function () {

	'use strict';

	var VERSION = '10.0.0';

	function isValidFormatter(entry) {
		return (typeof entry === 'undefined' ? 'undefined' : _typeof(entry)) === 'object' && typeof entry.to === 'function' && typeof entry.from === 'function';
	}

	function removeElement(el) {
		el.parentElement.removeChild(el);
	}

	// Bindable version
	function preventDefault(e) {
		e.preventDefault();
	}

	// Removes duplicates from an array.
	function unique(array) {
		return array.filter(function (a) {
			return !this[a] ? this[a] = true : false;
		}, {});
	}

	// Round a value to the closest 'to'.
	function closest(value, to) {
		return Math.round(value / to) * to;
	}

	// Current position of an element relative to the document.
	function offset(elem, orientation) {

		var rect = elem.getBoundingClientRect();
		var doc = elem.ownerDocument;
		var docElem = doc.documentElement;
		var pageOffset = getPageOffset(doc);

		// getBoundingClientRect contains left scroll in Chrome on Android.
		// I haven't found a feature detection that proves this. Worst case
		// scenario on mis-match: the 'tap' feature on horizontal sliders breaks.
		if (/webkit.*Chrome.*Mobile/i.test(navigator.userAgent)) {
			pageOffset.x = 0;
		}

		return orientation ? rect.top + pageOffset.y - docElem.clientTop : rect.left + pageOffset.x - docElem.clientLeft;
	}

	// Checks whether a value is numerical.
	function isNumeric(a) {
		return typeof a === 'number' && !isNaN(a) && isFinite(a);
	}

	// Sets a class and removes it after [duration] ms.
	function addClassFor(element, className, duration) {
		if (duration > 0) {
			addClass(element, className);
			setTimeout(function () {
				removeClass(element, className);
			}, duration);
		}
	}

	// Limits a value to 0 - 100
	function limit(a) {
		return Math.max(Math.min(a, 100), 0);
	}

	// Wraps a variable as an array, if it isn't one yet.
	// Note that an input array is returned by reference!
	function asArray(a) {
		return Array.isArray(a) ? a : [a];
	}

	// Counts decimals
	function countDecimals(numStr) {
		numStr = String(numStr);
		var pieces = numStr.split(".");
		return pieces.length > 1 ? pieces[1].length : 0;
	}

	// http://youmightnotneedjquery.com/#add_class
	function addClass(el, className) {
		if (el.classList) {
			el.classList.add(className);
		} else {
			el.className += ' ' + className;
		}
	}

	// http://youmightnotneedjquery.com/#remove_class
	function removeClass(el, className) {
		if (el.classList) {
			el.classList.remove(className);
		} else {
			el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		}
	}

	// https://plainjs.com/javascript/attributes/adding-removing-and-testing-for-classes-9/
	function hasClass(el, className) {
		return el.classList ? el.classList.contains(className) : new RegExp('\\b' + className + '\\b').test(el.className);
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY#Notes
	function getPageOffset(doc) {

		var supportPageOffset = window.pageXOffset !== undefined;
		var isCSS1Compat = (doc.compatMode || "") === "CSS1Compat";
		var x = supportPageOffset ? window.pageXOffset : isCSS1Compat ? doc.documentElement.scrollLeft : doc.body.scrollLeft;
		var y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? doc.documentElement.scrollTop : doc.body.scrollTop;

		return {
			x: x,
			y: y
		};
	}

	// we provide a function to compute constants instead
	// of accessing window.* as soon as the module needs it
	// so that we do not compute anything if not needed
	function getActions() {

		// Determine the events to bind. IE11 implements pointerEvents without
		// a prefix, which breaks compatibility with the IE10 implementation.
		return window.navigator.pointerEnabled ? {
			start: 'pointerdown',
			move: 'pointermove',
			end: 'pointerup'
		} : window.navigator.msPointerEnabled ? {
			start: 'MSPointerDown',
			move: 'MSPointerMove',
			end: 'MSPointerUp'
		} : {
			start: 'mousedown touchstart',
			move: 'mousemove touchmove',
			end: 'mouseup touchend'
		};
	}

	// https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
	// Issue #785
	function getSupportsPassive() {

		var supportsPassive = false;

		try {

			var opts = Object.defineProperty({}, 'passive', {
				get: function get() {
					supportsPassive = true;
				}
			});

			window.addEventListener('test', null, opts);
		} catch (e) {}

		return supportsPassive;
	}

	function getSupportsTouchActionNone() {
		return window.CSS && CSS.supports && CSS.supports('touch-action', 'none');
	}

	// Value calculation

	// Determine the size of a sub-range in relation to a full range.
	function subRangeRatio(pa, pb) {
		return 100 / (pb - pa);
	}

	// (percentage) How many percent is this value of this range?
	function fromPercentage(range, value) {
		return value * 100 / (range[1] - range[0]);
	}

	// (percentage) Where is this value on this range?
	function toPercentage(range, value) {
		return fromPercentage(range, range[0] < 0 ? value + Math.abs(range[0]) : value - range[0]);
	}

	// (value) How much is this percentage on this range?
	function isPercentage(range, value) {
		return value * (range[1] - range[0]) / 100 + range[0];
	}

	// Range conversion

	function getJ(value, arr) {

		var j = 1;

		while (value >= arr[j]) {
			j += 1;
		}

		return j;
	}

	// (percentage) Input a value, find where, on a scale of 0-100, it applies.
	function toStepping(xVal, xPct, value) {

		if (value >= xVal.slice(-1)[0]) {
			return 100;
		}

		var j = getJ(value, xVal),
		    va,
		    vb,
		    pa,
		    pb;

		va = xVal[j - 1];
		vb = xVal[j];
		pa = xPct[j - 1];
		pb = xPct[j];

		return pa + toPercentage([va, vb], value) / subRangeRatio(pa, pb);
	}

	// (value) Input a percentage, find where it is on the specified range.
	function fromStepping(xVal, xPct, value) {

		// There is no range group that fits 100
		if (value >= 100) {
			return xVal.slice(-1)[0];
		}

		var j = getJ(value, xPct),
		    va,
		    vb,
		    pa,
		    pb;

		va = xVal[j - 1];
		vb = xVal[j];
		pa = xPct[j - 1];
		pb = xPct[j];

		return isPercentage([va, vb], (value - pa) * subRangeRatio(pa, pb));
	}

	// (percentage) Get the step that applies at a certain value.
	function getStep(xPct, xSteps, snap, value) {

		if (value === 100) {
			return value;
		}

		var j = getJ(value, xPct),
		    a,
		    b;

		// If 'snap' is set, steps are used as fixed points on the slider.
		if (snap) {

			a = xPct[j - 1];
			b = xPct[j];

			// Find the closest position, a or b.
			if (value - a > (b - a) / 2) {
				return b;
			}

			return a;
		}

		if (!xSteps[j - 1]) {
			return value;
		}

		return xPct[j - 1] + closest(value - xPct[j - 1], xSteps[j - 1]);
	}

	// Entry parsing

	function handleEntryPoint(index, value, that) {

		var percentage;

		// Wrap numerical input in an array.
		if (typeof value === "number") {
			value = [value];
		}

		// Reject any invalid input, by testing whether value is an array.
		if (Object.prototype.toString.call(value) !== '[object Array]') {
			throw new Error("noUiSlider (" + VERSION + "): 'range' contains invalid value.");
		}

		// Covert min/max syntax to 0 and 100.
		if (index === 'min') {
			percentage = 0;
		} else if (index === 'max') {
			percentage = 100;
		} else {
			percentage = parseFloat(index);
		}

		// Check for correct input.
		if (!isNumeric(percentage) || !isNumeric(value[0])) {
			throw new Error("noUiSlider (" + VERSION + "): 'range' value isn't numeric.");
		}

		// Store values.
		that.xPct.push(percentage);
		that.xVal.push(value[0]);

		// NaN will evaluate to false too, but to keep
		// logging clear, set step explicitly. Make sure
		// not to override the 'step' setting with false.
		if (!percentage) {
			if (!isNaN(value[1])) {
				that.xSteps[0] = value[1];
			}
		} else {
			that.xSteps.push(isNaN(value[1]) ? false : value[1]);
		}

		that.xHighestCompleteStep.push(0);
	}

	function handleStepPoint(i, n, that) {

		// Ignore 'false' stepping.
		if (!n) {
			return true;
		}

		// Factor to range ratio
		that.xSteps[i] = fromPercentage([that.xVal[i], that.xVal[i + 1]], n) / subRangeRatio(that.xPct[i], that.xPct[i + 1]);

		var totalSteps = (that.xVal[i + 1] - that.xVal[i]) / that.xNumSteps[i];
		var highestStep = Math.ceil(Number(totalSteps.toFixed(3)) - 1);
		var step = that.xVal[i] + that.xNumSteps[i] * highestStep;

		that.xHighestCompleteStep[i] = step;
	}

	// Interface

	function Spectrum(entry, snap, singleStep) {

		this.xPct = [];
		this.xVal = [];
		this.xSteps = [singleStep || false];
		this.xNumSteps = [false];
		this.xHighestCompleteStep = [];

		this.snap = snap;

		var index,
		    ordered = [/* [0, 'min'], [1, '50%'], [2, 'max'] */];

		// Map the object keys to an array.
		for (index in entry) {
			if (entry.hasOwnProperty(index)) {
				ordered.push([entry[index], index]);
			}
		}

		// Sort all entries by value (numeric sort).
		if (ordered.length && _typeof(ordered[0][0]) === "object") {
			ordered.sort(function (a, b) {
				return a[0][0] - b[0][0];
			});
		} else {
			ordered.sort(function (a, b) {
				return a[0] - b[0];
			});
		}

		// Convert all entries to subranges.
		for (index = 0; index < ordered.length; index++) {
			handleEntryPoint(ordered[index][1], ordered[index][0], this);
		}

		// Store the actual step values.
		// xSteps is sorted in the same order as xPct and xVal.
		this.xNumSteps = this.xSteps.slice(0);

		// Convert all numeric steps to the percentage of the subrange they represent.
		for (index = 0; index < this.xNumSteps.length; index++) {
			handleStepPoint(index, this.xNumSteps[index], this);
		}
	}

	Spectrum.prototype.getMargin = function (value) {

		var step = this.xNumSteps[0];

		if (step && value / step % 1 !== 0) {
			throw new Error("noUiSlider (" + VERSION + "): 'limit', 'margin' and 'padding' must be divisible by step.");
		}

		return this.xPct.length === 2 ? fromPercentage(this.xVal, value) : false;
	};

	Spectrum.prototype.toStepping = function (value) {

		value = toStepping(this.xVal, this.xPct, value);

		return value;
	};

	Spectrum.prototype.fromStepping = function (value) {

		return fromStepping(this.xVal, this.xPct, value);
	};

	Spectrum.prototype.getStep = function (value) {

		value = getStep(this.xPct, this.xSteps, this.snap, value);

		return value;
	};

	Spectrum.prototype.getNearbySteps = function (value) {

		var j = getJ(value, this.xPct);

		return {
			stepBefore: { startValue: this.xVal[j - 2], step: this.xNumSteps[j - 2], highestStep: this.xHighestCompleteStep[j - 2] },
			thisStep: { startValue: this.xVal[j - 1], step: this.xNumSteps[j - 1], highestStep: this.xHighestCompleteStep[j - 1] },
			stepAfter: { startValue: this.xVal[j - 0], step: this.xNumSteps[j - 0], highestStep: this.xHighestCompleteStep[j - 0] }
		};
	};

	Spectrum.prototype.countStepDecimals = function () {
		var stepDecimals = this.xNumSteps.map(countDecimals);
		return Math.max.apply(null, stepDecimals);
	};

	// Outside testing
	Spectrum.prototype.convert = function (value) {
		return this.getStep(this.toStepping(value));
	};

	/*	Every input option is tested and parsed. This'll prevent
 	endless validation in internal methods. These tests are
 	structured with an item for every option available. An
 	option can be marked as required by setting the 'r' flag.
 	The testing function is provided with three arguments:
 		- The provided value for the option;
 		- A reference to the options object;
 		- The name for the option;
 
 	The testing function returns false when an error is detected,
 	or true when everything is OK. It can also modify the option
 	object, to make sure all values can be correctly looped elsewhere. */

	var defaultFormatter = { 'to': function to(value) {
			return value !== undefined && value.toFixed(2);
		}, 'from': Number };

	function validateFormat(entry) {

		// Any object with a to and from method is supported.
		if (isValidFormatter(entry)) {
			return true;
		}

		throw new Error("noUiSlider (" + VERSION + "): 'format' requires 'to' and 'from' methods.");
	}

	function testStep(parsed, entry) {

		if (!isNumeric(entry)) {
			throw new Error("noUiSlider (" + VERSION + "): 'step' is not numeric.");
		}

		// The step option can still be used to set stepping
		// for linear sliders. Overwritten if set in 'range'.
		parsed.singleStep = entry;
	}

	function testRange(parsed, entry) {

		// Filter incorrect input.
		if ((typeof entry === 'undefined' ? 'undefined' : _typeof(entry)) !== 'object' || Array.isArray(entry)) {
			throw new Error("noUiSlider (" + VERSION + "): 'range' is not an object.");
		}

		// Catch missing start or end.
		if (entry.min === undefined || entry.max === undefined) {
			throw new Error("noUiSlider (" + VERSION + "): Missing 'min' or 'max' in 'range'.");
		}

		// Catch equal start or end.
		if (entry.min === entry.max) {
			throw new Error("noUiSlider (" + VERSION + "): 'range' 'min' and 'max' cannot be equal.");
		}

		parsed.spectrum = new Spectrum(entry, parsed.snap, parsed.singleStep);
	}

	function testStart(parsed, entry) {

		entry = asArray(entry);

		// Validate input. Values aren't tested, as the public .val method
		// will always provide a valid location.
		if (!Array.isArray(entry) || !entry.length) {
			throw new Error("noUiSlider (" + VERSION + "): 'start' option is incorrect.");
		}

		// Store the number of handles.
		parsed.handles = entry.length;

		// When the slider is initialized, the .val method will
		// be called with the start options.
		parsed.start = entry;
	}

	function testSnap(parsed, entry) {

		// Enforce 100% stepping within subranges.
		parsed.snap = entry;

		if (typeof entry !== 'boolean') {
			throw new Error("noUiSlider (" + VERSION + "): 'snap' option must be a boolean.");
		}
	}

	function testAnimate(parsed, entry) {

		// Enforce 100% stepping within subranges.
		parsed.animate = entry;

		if (typeof entry !== 'boolean') {
			throw new Error("noUiSlider (" + VERSION + "): 'animate' option must be a boolean.");
		}
	}

	function testAnimationDuration(parsed, entry) {

		parsed.animationDuration = entry;

		if (typeof entry !== 'number') {
			throw new Error("noUiSlider (" + VERSION + "): 'animationDuration' option must be a number.");
		}
	}

	function testConnect(parsed, entry) {

		var connect = [false];
		var i;

		// Map legacy options
		if (entry === 'lower') {
			entry = [true, false];
		} else if (entry === 'upper') {
			entry = [false, true];
		}

		// Handle boolean options
		if (entry === true || entry === false) {

			for (i = 1; i < parsed.handles; i++) {
				connect.push(entry);
			}

			connect.push(false);
		}

		// Reject invalid input
		else if (!Array.isArray(entry) || !entry.length || entry.length !== parsed.handles + 1) {
				throw new Error("noUiSlider (" + VERSION + "): 'connect' option doesn't match handle count.");
			} else {
				connect = entry;
			}

		parsed.connect = connect;
	}

	function testOrientation(parsed, entry) {

		// Set orientation to an a numerical value for easy
		// array selection.
		switch (entry) {
			case 'horizontal':
				parsed.ort = 0;
				break;
			case 'vertical':
				parsed.ort = 1;
				break;
			default:
				throw new Error("noUiSlider (" + VERSION + "): 'orientation' option is invalid.");
		}
	}

	function testMargin(parsed, entry) {

		if (!isNumeric(entry)) {
			throw new Error("noUiSlider (" + VERSION + "): 'margin' option must be numeric.");
		}

		// Issue #582
		if (entry === 0) {
			return;
		}

		parsed.margin = parsed.spectrum.getMargin(entry);

		if (!parsed.margin) {
			throw new Error("noUiSlider (" + VERSION + "): 'margin' option is only supported on linear sliders.");
		}
	}

	function testLimit(parsed, entry) {

		if (!isNumeric(entry)) {
			throw new Error("noUiSlider (" + VERSION + "): 'limit' option must be numeric.");
		}

		parsed.limit = parsed.spectrum.getMargin(entry);

		if (!parsed.limit || parsed.handles < 2) {
			throw new Error("noUiSlider (" + VERSION + "): 'limit' option is only supported on linear sliders with 2 or more handles.");
		}
	}

	function testPadding(parsed, entry) {

		if (!isNumeric(entry)) {
			throw new Error("noUiSlider (" + VERSION + "): 'padding' option must be numeric.");
		}

		if (entry === 0) {
			return;
		}

		parsed.padding = parsed.spectrum.getMargin(entry);

		if (!parsed.padding) {
			throw new Error("noUiSlider (" + VERSION + "): 'padding' option is only supported on linear sliders.");
		}

		if (parsed.padding < 0) {
			throw new Error("noUiSlider (" + VERSION + "): 'padding' option must be a positive number.");
		}

		if (parsed.padding >= 50) {
			throw new Error("noUiSlider (" + VERSION + "): 'padding' option must be less than half the range.");
		}
	}

	function testDirection(parsed, entry) {

		// Set direction as a numerical value for easy parsing.
		// Invert connection for RTL sliders, so that the proper
		// handles get the connect/background classes.
		switch (entry) {
			case 'ltr':
				parsed.dir = 0;
				break;
			case 'rtl':
				parsed.dir = 1;
				break;
			default:
				throw new Error("noUiSlider (" + VERSION + "): 'direction' option was not recognized.");
		}
	}

	function testBehaviour(parsed, entry) {

		// Make sure the input is a string.
		if (typeof entry !== 'string') {
			throw new Error("noUiSlider (" + VERSION + "): 'behaviour' must be a string containing options.");
		}

		// Check if the string contains any keywords.
		// None are required.
		var tap = entry.indexOf('tap') >= 0;
		var drag = entry.indexOf('drag') >= 0;
		var fixed = entry.indexOf('fixed') >= 0;
		var snap = entry.indexOf('snap') >= 0;
		var hover = entry.indexOf('hover') >= 0;

		if (fixed) {

			if (parsed.handles !== 2) {
				throw new Error("noUiSlider (" + VERSION + "): 'fixed' behaviour must be used with 2 handles");
			}

			// Use margin to enforce fixed state
			testMargin(parsed, parsed.start[1] - parsed.start[0]);
		}

		parsed.events = {
			tap: tap || snap,
			drag: drag,
			fixed: fixed,
			snap: snap,
			hover: hover
		};
	}

	function testTooltips(parsed, entry) {

		if (entry === false) {
			return;
		} else if (entry === true) {

			parsed.tooltips = [];

			for (var i = 0; i < parsed.handles; i++) {
				parsed.tooltips.push(true);
			}
		} else {

			parsed.tooltips = asArray(entry);

			if (parsed.tooltips.length !== parsed.handles) {
				throw new Error("noUiSlider (" + VERSION + "): must pass a formatter for all handles.");
			}

			parsed.tooltips.forEach(function (formatter) {
				if (typeof formatter !== 'boolean' && ((typeof formatter === 'undefined' ? 'undefined' : _typeof(formatter)) !== 'object' || typeof formatter.to !== 'function')) {
					throw new Error("noUiSlider (" + VERSION + "): 'tooltips' must be passed a formatter or 'false'.");
				}
			});
		}
	}

	function testAriaFormat(parsed, entry) {
		parsed.ariaFormat = entry;
		validateFormat(entry);
	}

	function testFormat(parsed, entry) {
		parsed.format = entry;
		validateFormat(entry);
	}

	function testCssPrefix(parsed, entry) {

		if (entry !== undefined && typeof entry !== 'string' && entry !== false) {
			throw new Error("noUiSlider (" + VERSION + "): 'cssPrefix' must be a string or `false`.");
		}

		parsed.cssPrefix = entry;
	}

	function testCssClasses(parsed, entry) {

		if (entry !== undefined && (typeof entry === 'undefined' ? 'undefined' : _typeof(entry)) !== 'object') {
			throw new Error("noUiSlider (" + VERSION + "): 'cssClasses' must be an object.");
		}

		if (typeof parsed.cssPrefix === 'string') {
			parsed.cssClasses = {};

			for (var key in entry) {
				if (!entry.hasOwnProperty(key)) {
					continue;
				}

				parsed.cssClasses[key] = parsed.cssPrefix + entry[key];
			}
		} else {
			parsed.cssClasses = entry;
		}
	}

	function testUseRaf(parsed, entry) {
		if (entry === true || entry === false) {
			parsed.useRequestAnimationFrame = entry;
		} else {
			throw new Error("noUiSlider (" + VERSION + "): 'useRequestAnimationFrame' option should be true (default) or false.");
		}
	}

	// Test all developer settings and parse to assumption-safe values.
	function testOptions(options) {

		// To prove a fix for #537, freeze options here.
		// If the object is modified, an error will be thrown.
		// Object.freeze(options);

		var parsed = {
			margin: 0,
			limit: 0,
			padding: 0,
			animate: true,
			animationDuration: 300,
			ariaFormat: defaultFormatter,
			format: defaultFormatter
		};

		// Tests are executed in the order they are presented here.
		var tests = {
			'step': { r: false, t: testStep },
			'start': { r: true, t: testStart },
			'connect': { r: true, t: testConnect },
			'direction': { r: true, t: testDirection },
			'snap': { r: false, t: testSnap },
			'animate': { r: false, t: testAnimate },
			'animationDuration': { r: false, t: testAnimationDuration },
			'range': { r: true, t: testRange },
			'orientation': { r: false, t: testOrientation },
			'margin': { r: false, t: testMargin },
			'limit': { r: false, t: testLimit },
			'padding': { r: false, t: testPadding },
			'behaviour': { r: true, t: testBehaviour },
			'ariaFormat': { r: false, t: testAriaFormat },
			'format': { r: false, t: testFormat },
			'tooltips': { r: false, t: testTooltips },
			'cssPrefix': { r: false, t: testCssPrefix },
			'cssClasses': { r: false, t: testCssClasses },
			'useRequestAnimationFrame': { r: false, t: testUseRaf }
		};

		var defaults = {
			'connect': false,
			'direction': 'ltr',
			'behaviour': 'tap',
			'orientation': 'horizontal',
			'cssPrefix': 'noUi-',
			'cssClasses': {
				target: 'target',
				base: 'base',
				origin: 'origin',
				handle: 'handle',
				handleLower: 'handle-lower',
				handleUpper: 'handle-upper',
				horizontal: 'horizontal',
				vertical: 'vertical',
				background: 'background',
				connect: 'connect',
				ltr: 'ltr',
				rtl: 'rtl',
				draggable: 'draggable',
				drag: 'state-drag',
				tap: 'state-tap',
				active: 'active',
				tooltip: 'tooltip',
				pips: 'pips',
				pipsHorizontal: 'pips-horizontal',
				pipsVertical: 'pips-vertical',
				marker: 'marker',
				markerHorizontal: 'marker-horizontal',
				markerVertical: 'marker-vertical',
				markerNormal: 'marker-normal',
				markerLarge: 'marker-large',
				markerSub: 'marker-sub',
				value: 'value',
				valueHorizontal: 'value-horizontal',
				valueVertical: 'value-vertical',
				valueNormal: 'value-normal',
				valueLarge: 'value-large',
				valueSub: 'value-sub'
			},
			'useRequestAnimationFrame': true
		};

		// AriaFormat defaults to regular format, if any.
		if (options.format && !options.ariaFormat) {
			options.ariaFormat = options.format;
		}

		// Run all options through a testing mechanism to ensure correct
		// input. It should be noted that options might get modified to
		// be handled properly. E.g. wrapping integers in arrays.
		Object.keys(tests).forEach(function (name) {

			// If the option isn't set, but it is required, throw an error.
			if (options[name] === undefined && defaults[name] === undefined) {

				if (tests[name].r) {
					throw new Error("noUiSlider (" + VERSION + "): '" + name + "' is required.");
				}

				return true;
			}

			tests[name].t(parsed, options[name] === undefined ? defaults[name] : options[name]);
		});

		// Forward pips options
		parsed.pips = options.pips;

		var styles = [['left', 'top'], ['right', 'bottom']];

		// Pre-define the styles.
		parsed.style = styles[parsed.dir][parsed.ort];
		parsed.styleOposite = styles[parsed.dir ? 0 : 1][parsed.ort];

		return parsed;
	}

	function closure(target, options, originalOptions) {

		var actions = getActions();
		var supportsTouchActionNone = getSupportsTouchActionNone();
		var supportsPassive = supportsTouchActionNone && getSupportsPassive();

		// All variables local to 'closure' are prefixed with 'scope_'
		var scope_Target = target;
		var scope_Locations = [];
		var scope_Base;
		var scope_Handles;
		var scope_HandleNumbers = [];
		var scope_ActiveHandle = false;
		var scope_Connects;
		var scope_Spectrum = options.spectrum;
		var scope_Values = [];
		var scope_Events = {};
		var scope_Self;
		var scope_Pips;
		var scope_Listeners = null;
		var scope_Document = target.ownerDocument;
		var scope_DocumentElement = scope_Document.documentElement;
		var scope_Body = scope_Document.body;

		// Creates a node, adds it to target, returns the new node.
		function addNodeTo(target, className) {

			var div = scope_Document.createElement('div');

			if (className) {
				addClass(div, className);
			}

			target.appendChild(div);

			return div;
		}

		// Append a origin to the base
		function addOrigin(base, handleNumber) {

			var origin = addNodeTo(base, options.cssClasses.origin);
			var handle = addNodeTo(origin, options.cssClasses.handle);

			handle.setAttribute('data-handle', handleNumber);

			// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex
			// 0 = focusable and reachable
			handle.setAttribute('tabindex', '0');
			handle.setAttribute('role', 'slider');
			handle.setAttribute('aria-orientation', options.ort ? 'vertical' : 'horizontal');

			if (handleNumber === 0) {
				addClass(handle, options.cssClasses.handleLower);
			} else if (handleNumber === options.handles - 1) {
				addClass(handle, options.cssClasses.handleUpper);
			}

			return origin;
		}

		// Insert nodes for connect elements
		function addConnect(base, add) {

			if (!add) {
				return false;
			}

			return addNodeTo(base, options.cssClasses.connect);
		}

		// Add handles to the slider base.
		function addElements(connectOptions, base) {

			scope_Handles = [];
			scope_Connects = [];

			scope_Connects.push(addConnect(base, connectOptions[0]));

			// [::::O====O====O====]
			// connectOptions = [0, 1, 1, 1]

			for (var i = 0; i < options.handles; i++) {
				// Keep a list of all added handles.
				scope_Handles.push(addOrigin(base, i));
				scope_HandleNumbers[i] = i;
				scope_Connects.push(addConnect(base, connectOptions[i + 1]));
			}
		}

		// Initialize a single slider.
		function addSlider(target) {

			// Apply classes and data to the target.
			addClass(target, options.cssClasses.target);

			if (options.dir === 0) {
				addClass(target, options.cssClasses.ltr);
			} else {
				addClass(target, options.cssClasses.rtl);
			}

			if (options.ort === 0) {
				addClass(target, options.cssClasses.horizontal);
			} else {
				addClass(target, options.cssClasses.vertical);
			}

			scope_Base = addNodeTo(target, options.cssClasses.base);
		}

		function addTooltip(handle, handleNumber) {

			if (!options.tooltips[handleNumber]) {
				return false;
			}

			return addNodeTo(handle.firstChild, options.cssClasses.tooltip);
		}

		// The tooltips option is a shorthand for using the 'update' event.
		function tooltips() {

			// Tooltips are added with options.tooltips in original order.
			var tips = scope_Handles.map(addTooltip);

			bindEvent('update', function (values, handleNumber, unencoded) {

				if (!tips[handleNumber]) {
					return;
				}

				var formattedValue = values[handleNumber];

				if (options.tooltips[handleNumber] !== true) {
					formattedValue = options.tooltips[handleNumber].to(unencoded[handleNumber]);
				}

				tips[handleNumber].innerHTML = formattedValue;
			});
		}

		function aria() {

			bindEvent('update', function (values, handleNumber, unencoded, tap, positions) {

				// Update Aria Values for all handles, as a change in one changes min and max values for the next.
				scope_HandleNumbers.forEach(function (handleNumber) {

					var handle = scope_Handles[handleNumber];

					var min = checkHandlePosition(scope_Locations, handleNumber, 0, true, true, true);
					var max = checkHandlePosition(scope_Locations, handleNumber, 100, true, true, true);

					var now = positions[handleNumber];
					var text = options.ariaFormat.to(unencoded[handleNumber]);

					handle.children[0].setAttribute('aria-valuemin', min.toFixed(1));
					handle.children[0].setAttribute('aria-valuemax', max.toFixed(1));
					handle.children[0].setAttribute('aria-valuenow', now.toFixed(1));
					handle.children[0].setAttribute('aria-valuetext', text);
				});
			});
		}

		function getGroup(mode, values, stepped) {

			// Use the range.
			if (mode === 'range' || mode === 'steps') {
				return scope_Spectrum.xVal;
			}

			if (mode === 'count') {

				if (!values) {
					throw new Error("noUiSlider (" + VERSION + "): 'values' required for mode 'count'.");
				}

				// Divide 0 - 100 in 'count' parts.
				var spread = 100 / (values - 1);
				var v;
				var i = 0;

				values = [];

				// List these parts and have them handled as 'positions'.
				while ((v = i++ * spread) <= 100) {
					values.push(v);
				}

				mode = 'positions';
			}

			if (mode === 'positions') {

				// Map all percentages to on-range values.
				return values.map(function (value) {
					return scope_Spectrum.fromStepping(stepped ? scope_Spectrum.getStep(value) : value);
				});
			}

			if (mode === 'values') {

				// If the value must be stepped, it needs to be converted to a percentage first.
				if (stepped) {

					return values.map(function (value) {

						// Convert to percentage, apply step, return to value.
						return scope_Spectrum.fromStepping(scope_Spectrum.getStep(scope_Spectrum.toStepping(value)));
					});
				}

				// Otherwise, we can simply use the values.
				return values;
			}
		}

		function generateSpread(density, mode, group) {

			function safeIncrement(value, increment) {
				// Avoid floating point variance by dropping the smallest decimal places.
				return (value + increment).toFixed(7) / 1;
			}

			var indexes = {};
			var firstInRange = scope_Spectrum.xVal[0];
			var lastInRange = scope_Spectrum.xVal[scope_Spectrum.xVal.length - 1];
			var ignoreFirst = false;
			var ignoreLast = false;
			var prevPct = 0;

			// Create a copy of the group, sort it and filter away all duplicates.
			group = unique(group.slice().sort(function (a, b) {
				return a - b;
			}));

			// Make sure the range starts with the first element.
			if (group[0] !== firstInRange) {
				group.unshift(firstInRange);
				ignoreFirst = true;
			}

			// Likewise for the last one.
			if (group[group.length - 1] !== lastInRange) {
				group.push(lastInRange);
				ignoreLast = true;
			}

			group.forEach(function (current, index) {

				// Get the current step and the lower + upper positions.
				var step;
				var i;
				var q;
				var low = current;
				var high = group[index + 1];
				var newPct;
				var pctDifference;
				var pctPos;
				var type;
				var steps;
				var realSteps;
				var stepsize;

				// When using 'steps' mode, use the provided steps.
				// Otherwise, we'll step on to the next subrange.
				if (mode === 'steps') {
					step = scope_Spectrum.xNumSteps[index];
				}

				// Default to a 'full' step.
				if (!step) {
					step = high - low;
				}

				// Low can be 0, so test for false. If high is undefined,
				// we are at the last subrange. Index 0 is already handled.
				if (low === false || high === undefined) {
					return;
				}

				// Make sure step isn't 0, which would cause an infinite loop (#654)
				step = Math.max(step, 0.0000001);

				// Find all steps in the subrange.
				for (i = low; i <= high; i = safeIncrement(i, step)) {

					// Get the percentage value for the current step,
					// calculate the size for the subrange.
					newPct = scope_Spectrum.toStepping(i);
					pctDifference = newPct - prevPct;

					steps = pctDifference / density;
					realSteps = Math.round(steps);

					// This ratio represents the ammount of percentage-space a point indicates.
					// For a density 1 the points/percentage = 1. For density 2, that percentage needs to be re-devided.
					// Round the percentage offset to an even number, then divide by two
					// to spread the offset on both sides of the range.
					stepsize = pctDifference / realSteps;

					// Divide all points evenly, adding the correct number to this subrange.
					// Run up to <= so that 100% gets a point, event if ignoreLast is set.
					for (q = 1; q <= realSteps; q += 1) {

						// The ratio between the rounded value and the actual size might be ~1% off.
						// Correct the percentage offset by the number of points
						// per subrange. density = 1 will result in 100 points on the
						// full range, 2 for 50, 4 for 25, etc.
						pctPos = prevPct + q * stepsize;
						indexes[pctPos.toFixed(5)] = ['x', 0];
					}

					// Determine the point type.
					type = group.indexOf(i) > -1 ? 1 : mode === 'steps' ? 2 : 0;

					// Enforce the 'ignoreFirst' option by overwriting the type for 0.
					if (!index && ignoreFirst) {
						type = 0;
					}

					if (!(i === high && ignoreLast)) {
						// Mark the 'type' of this point. 0 = plain, 1 = real value, 2 = step value.
						indexes[newPct.toFixed(5)] = [i, type];
					}

					// Update the percentage count.
					prevPct = newPct;
				}
			});

			return indexes;
		}

		function addMarking(spread, filterFunc, formatter) {

			var element = scope_Document.createElement('div');

			var valueSizeClasses = [options.cssClasses.valueNormal, options.cssClasses.valueLarge, options.cssClasses.valueSub];
			var markerSizeClasses = [options.cssClasses.markerNormal, options.cssClasses.markerLarge, options.cssClasses.markerSub];
			var valueOrientationClasses = [options.cssClasses.valueHorizontal, options.cssClasses.valueVertical];
			var markerOrientationClasses = [options.cssClasses.markerHorizontal, options.cssClasses.markerVertical];

			addClass(element, options.cssClasses.pips);
			addClass(element, options.ort === 0 ? options.cssClasses.pipsHorizontal : options.cssClasses.pipsVertical);

			function getClasses(type, source) {
				var a = source === options.cssClasses.value;
				var orientationClasses = a ? valueOrientationClasses : markerOrientationClasses;
				var sizeClasses = a ? valueSizeClasses : markerSizeClasses;

				return source + ' ' + orientationClasses[options.ort] + ' ' + sizeClasses[type];
			}

			function addSpread(offset, values) {

				// Apply the filter function, if it is set.
				values[1] = values[1] && filterFunc ? filterFunc(values[0], values[1]) : values[1];

				// Add a marker for every point
				var node = addNodeTo(element, false);
				node.className = getClasses(values[1], options.cssClasses.marker);
				node.style[options.style] = offset + '%';

				// Values are only appended for points marked '1' or '2'.
				if (values[1]) {
					node = addNodeTo(element, false);
					node.className = getClasses(values[1], options.cssClasses.value);
					node.style[options.style] = offset + '%';
					node.innerText = formatter.to(values[0]);
				}
			}

			// Append all points.
			Object.keys(spread).forEach(function (a) {
				addSpread(a, spread[a]);
			});

			return element;
		}

		function removePips() {
			if (scope_Pips) {
				removeElement(scope_Pips);
				scope_Pips = null;
			}
		}

		function pips(grid) {

			// Fix #669
			removePips();

			var mode = grid.mode;
			var density = grid.density || 1;
			var filter = grid.filter || false;
			var values = grid.values || false;
			var stepped = grid.stepped || false;
			var group = getGroup(mode, values, stepped);
			var spread = generateSpread(density, mode, group);
			var format = grid.format || {
				to: Math.round
			};

			scope_Pips = scope_Target.appendChild(addMarking(spread, filter, format));

			return scope_Pips;
		}

		// Shorthand for base dimensions.
		function baseSize() {
			var rect = scope_Base.getBoundingClientRect(),
			    alt = 'offset' + ['Width', 'Height'][options.ort];
			return options.ort === 0 ? rect.width || scope_Base[alt] : rect.height || scope_Base[alt];
		}

		// Handler for attaching events trough a proxy.
		function attachEvent(events, element, callback, data) {

			// This function can be used to 'filter' events to the slider.
			// element is a node, not a nodeList

			var method = function method(e) {

				if (scope_Target.hasAttribute('disabled')) {
					return false;
				}

				// Stop if an active 'tap' transition is taking place.
				if (hasClass(scope_Target, options.cssClasses.tap)) {
					return false;
				}

				e = fixEvent(e, data.pageOffset);

				// Handle reject of multitouch
				if (!e) {
					return false;
				}

				// Ignore right or middle clicks on start #454
				if (events === actions.start && e.buttons !== undefined && e.buttons > 1) {
					return false;
				}

				// Ignore right or middle clicks on start #454
				if (data.hover && e.buttons) {
					return false;
				}

				// 'supportsPassive' is only true if a browser also supports touch-action: none in CSS.
				// iOS safari does not, so it doesn't get to benefit from passive scrolling. iOS does support
				// touch-action: manipulation, but that allows panning, which breaks
				// sliders after zooming/on non-responsive pages.
				// See: https://bugs.webkit.org/show_bug.cgi?id=133112
				if (!supportsPassive) {
					e.preventDefault();
				}

				e.calcPoint = e.points[options.ort];

				// Call the event handler with the event [ and additional data ].
				callback(e, data);
			};

			var methods = [];

			// Bind a closure on the target for every event type.
			events.split(' ').forEach(function (eventName) {
				element.addEventListener(eventName, method, supportsPassive ? { passive: true } : false);
				methods.push([eventName, method]);
			});

			return methods;
		}

		// Provide a clean event with standardized offset values.
		function fixEvent(e, pageOffset) {

			// Filter the event to register the type, which can be
			// touch, mouse or pointer. Offset changes need to be
			// made on an event specific basis.
			var touch = e.type.indexOf('touch') === 0;
			var mouse = e.type.indexOf('mouse') === 0;
			var pointer = e.type.indexOf('pointer') === 0;

			var x;
			var y;

			// IE10 implemented pointer events with a prefix;
			if (e.type.indexOf('MSPointer') === 0) {
				pointer = true;
			}

			if (touch) {

				// Fix bug when user touches with two or more fingers on mobile devices.
				// It's useful when you have two or more sliders on one page,
				// that can be touched simultaneously.
				// #649, #663, #668
				if (e.touches.length > 1) {
					return false;
				}

				// noUiSlider supports one movement at a time,
				// so we can select the first 'changedTouch'.
				x = e.changedTouches[0].pageX;
				y = e.changedTouches[0].pageY;
			}

			pageOffset = pageOffset || getPageOffset(scope_Document);

			if (mouse || pointer) {
				x = e.clientX + pageOffset.x;
				y = e.clientY + pageOffset.y;
			}

			e.pageOffset = pageOffset;
			e.points = [x, y];
			e.cursor = mouse || pointer; // Fix #435

			return e;
		}

		// Translate a coordinate in the document to a percentage on the slider
		function calcPointToPercentage(calcPoint) {
			var location = calcPoint - offset(scope_Base, options.ort);
			var proposal = location * 100 / baseSize();
			return options.dir ? 100 - proposal : proposal;
		}

		// Find handle closest to a certain percentage on the slider
		function getClosestHandle(proposal) {

			var closest = 100;
			var handleNumber = false;

			scope_Handles.forEach(function (handle, index) {

				// Disabled handles are ignored
				if (handle.hasAttribute('disabled')) {
					return;
				}

				var pos = Math.abs(scope_Locations[index] - proposal);

				if (pos < closest) {
					handleNumber = index;
					closest = pos;
				}
			});

			return handleNumber;
		}

		// Moves handle(s) by a percentage
		// (bool, % to move, [% where handle started, ...], [index in scope_Handles, ...])
		function moveHandles(upward, proposal, locations, handleNumbers) {

			var proposals = locations.slice();

			var b = [!upward, upward];
			var f = [upward, !upward];

			// Copy handleNumbers so we don't change the dataset
			handleNumbers = handleNumbers.slice();

			// Check to see which handle is 'leading'.
			// If that one can't move the second can't either.
			if (upward) {
				handleNumbers.reverse();
			}

			// Step 1: get the maximum percentage that any of the handles can move
			if (handleNumbers.length > 1) {

				handleNumbers.forEach(function (handleNumber, o) {

					var to = checkHandlePosition(proposals, handleNumber, proposals[handleNumber] + proposal, b[o], f[o], false);

					// Stop if one of the handles can't move.
					if (to === false) {
						proposal = 0;
					} else {
						proposal = to - proposals[handleNumber];
						proposals[handleNumber] = to;
					}
				});
			}

			// If using one handle, check backward AND forward
			else {
					b = f = [true];
				}

			var state = false;

			// Step 2: Try to set the handles with the found percentage
			handleNumbers.forEach(function (handleNumber, o) {
				state = setHandle(handleNumber, locations[handleNumber] + proposal, b[o], f[o]) || state;
			});

			// Step 3: If a handle moved, fire events
			if (state) {
				handleNumbers.forEach(function (handleNumber) {
					fireEvent('update', handleNumber);
					fireEvent('slide', handleNumber);
				});
			}
		}

		// External event handling
		function fireEvent(eventName, handleNumber, tap) {

			Object.keys(scope_Events).forEach(function (targetEvent) {

				var eventType = targetEvent.split('.')[0];

				if (eventName === eventType) {
					scope_Events[targetEvent].forEach(function (callback) {

						callback.call(
						// Use the slider public API as the scope ('this')
						scope_Self,
						// Return values as array, so arg_1[arg_2] is always valid.
						scope_Values.map(options.format.to),
						// Handle index, 0 or 1
						handleNumber,
						// Unformatted slider values
						scope_Values.slice(),
						// Event is fired by tap, true or false
						tap || false,
						// Left offset of the handle, in relation to the slider
						scope_Locations.slice());
					});
				}
			});
		}

		// Fire 'end' when a mouse or pen leaves the document.
		function documentLeave(event, data) {
			if (event.type === "mouseout" && event.target.nodeName === "HTML" && event.relatedTarget === null) {
				eventEnd(event, data);
			}
		}

		// Handle movement on document for handle and range drag.
		function eventMove(event, data) {

			// Fix #498
			// Check value of .buttons in 'start' to work around a bug in IE10 mobile (data.buttonsProperty).
			// https://connect.microsoft.com/IE/feedback/details/927005/mobile-ie10-windows-phone-buttons-property-of-pointermove-event-always-zero
			// IE9 has .buttons and .which zero on mousemove.
			// Firefox breaks the spec MDN defines.
			if (navigator.appVersion.indexOf("MSIE 9") === -1 && event.buttons === 0 && data.buttonsProperty !== 0) {
				return eventEnd(event, data);
			}

			// Check if we are moving up or down
			var movement = (options.dir ? -1 : 1) * (event.calcPoint - data.startCalcPoint);

			// Convert the movement into a percentage of the slider width/height
			var proposal = movement * 100 / data.baseSize;

			moveHandles(movement > 0, proposal, data.locations, data.handleNumbers);
		}

		// Unbind move events on document, call callbacks.
		function eventEnd(event, data) {

			// The handle is no longer active, so remove the class.
			if (scope_ActiveHandle) {
				removeClass(scope_ActiveHandle, options.cssClasses.active);
				scope_ActiveHandle = false;
			}

			// Remove cursor styles and text-selection events bound to the body.
			if (event.cursor) {
				scope_Body.style.cursor = '';
				scope_Body.removeEventListener('selectstart', preventDefault);
			}

			// Unbind the move and end events, which are added on 'start'.
			scope_Listeners.forEach(function (c) {
				scope_DocumentElement.removeEventListener(c[0], c[1]);
			});

			// Remove dragging class.
			removeClass(scope_Target, options.cssClasses.drag);

			setZindex();

			data.handleNumbers.forEach(function (handleNumber) {
				fireEvent('change', handleNumber);
				fireEvent('set', handleNumber);
				fireEvent('end', handleNumber);
			});
		}

		// Bind move events on document.
		function eventStart(event, data) {

			if (data.handleNumbers.length === 1) {

				var handle = scope_Handles[data.handleNumbers[0]];

				// Ignore 'disabled' handles
				if (handle.hasAttribute('disabled')) {
					return false;
				}

				// Mark the handle as 'active' so it can be styled.
				scope_ActiveHandle = handle.children[0];
				addClass(scope_ActiveHandle, options.cssClasses.active);
			}

			// A drag should never propagate up to the 'tap' event.
			event.stopPropagation();

			// Attach the move and end events.
			var moveEvent = attachEvent(actions.move, scope_DocumentElement, eventMove, {
				startCalcPoint: event.calcPoint,
				baseSize: baseSize(),
				pageOffset: event.pageOffset,
				handleNumbers: data.handleNumbers,
				buttonsProperty: event.buttons,
				locations: scope_Locations.slice()
			});

			var endEvent = attachEvent(actions.end, scope_DocumentElement, eventEnd, {
				handleNumbers: data.handleNumbers
			});

			var outEvent = attachEvent("mouseout", scope_DocumentElement, documentLeave, {
				handleNumbers: data.handleNumbers
			});

			scope_Listeners = moveEvent.concat(endEvent, outEvent);

			// Text selection isn't an issue on touch devices,
			// so adding cursor styles can be skipped.
			if (event.cursor) {

				// Prevent the 'I' cursor and extend the range-drag cursor.
				scope_Body.style.cursor = getComputedStyle(event.target).cursor;

				// Mark the target with a dragging state.
				if (scope_Handles.length > 1) {
					addClass(scope_Target, options.cssClasses.drag);
				}

				// Prevent text selection when dragging the handles.
				// In noUiSlider <= 9.2.0, this was handled by calling preventDefault on mouse/touch start/move,
				// which is scroll blocking. The selectstart event is supported by FireFox starting from version 52,
				// meaning the only holdout is iOS Safari. This doesn't matter: text selection isn't triggered there.
				// The 'cursor' flag is false.
				// See: http://caniuse.com/#search=selectstart
				scope_Body.addEventListener('selectstart', preventDefault, false);
			}

			data.handleNumbers.forEach(function (handleNumber) {
				fireEvent('start', handleNumber);
			});
		}

		// Move closest handle to tapped location.
		function eventTap(event) {

			// The tap event shouldn't propagate up
			event.stopPropagation();

			var proposal = calcPointToPercentage(event.calcPoint);
			var handleNumber = getClosestHandle(proposal);

			// Tackle the case that all handles are 'disabled'.
			if (handleNumber === false) {
				return false;
			}

			// Flag the slider as it is now in a transitional state.
			// Transition takes a configurable amount of ms (default 300). Re-enable the slider after that.
			if (!options.events.snap) {
				addClassFor(scope_Target, options.cssClasses.tap, options.animationDuration);
			}

			setHandle(handleNumber, proposal, true, true);

			setZindex();

			fireEvent('slide', handleNumber, true);
			fireEvent('update', handleNumber, true);
			fireEvent('change', handleNumber, true);
			fireEvent('set', handleNumber, true);

			if (options.events.snap) {
				eventStart(event, { handleNumbers: [handleNumber] });
			}
		}

		// Fires a 'hover' event for a hovered mouse/pen position.
		function eventHover(event) {

			var proposal = calcPointToPercentage(event.calcPoint);

			var to = scope_Spectrum.getStep(proposal);
			var value = scope_Spectrum.fromStepping(to);

			Object.keys(scope_Events).forEach(function (targetEvent) {
				if ('hover' === targetEvent.split('.')[0]) {
					scope_Events[targetEvent].forEach(function (callback) {
						callback.call(scope_Self, value);
					});
				}
			});
		}

		// Attach events to several slider parts.
		function bindSliderEvents(behaviour) {

			// Attach the standard drag event to the handles.
			if (!behaviour.fixed) {

				scope_Handles.forEach(function (handle, index) {

					// These events are only bound to the visual handle
					// element, not the 'real' origin element.
					attachEvent(actions.start, handle.children[0], eventStart, {
						handleNumbers: [index]
					});
				});
			}

			// Attach the tap event to the slider base.
			if (behaviour.tap) {
				attachEvent(actions.start, scope_Base, eventTap, {});
			}

			// Fire hover events
			if (behaviour.hover) {
				attachEvent(actions.move, scope_Base, eventHover, { hover: true });
			}

			// Make the range draggable.
			if (behaviour.drag) {

				scope_Connects.forEach(function (connect, index) {

					if (connect === false || index === 0 || index === scope_Connects.length - 1) {
						return;
					}

					var handleBefore = scope_Handles[index - 1];
					var handleAfter = scope_Handles[index];
					var eventHolders = [connect];

					addClass(connect, options.cssClasses.draggable);

					// When the range is fixed, the entire range can
					// be dragged by the handles. The handle in the first
					// origin will propagate the start event upward,
					// but it needs to be bound manually on the other.
					if (behaviour.fixed) {
						eventHolders.push(handleBefore.children[0]);
						eventHolders.push(handleAfter.children[0]);
					}

					eventHolders.forEach(function (eventHolder) {
						attachEvent(actions.start, eventHolder, eventStart, {
							handles: [handleBefore, handleAfter],
							handleNumbers: [index - 1, index]
						});
					});
				});
			}
		}

		// Split out the handle positioning logic so the Move event can use it, too
		function checkHandlePosition(reference, handleNumber, to, lookBackward, lookForward, getValue) {

			// For sliders with multiple handles, limit movement to the other handle.
			// Apply the margin option by adding it to the handle positions.
			if (scope_Handles.length > 1) {

				if (lookBackward && handleNumber > 0) {
					to = Math.max(to, reference[handleNumber - 1] + options.margin);
				}

				if (lookForward && handleNumber < scope_Handles.length - 1) {
					to = Math.min(to, reference[handleNumber + 1] - options.margin);
				}
			}

			// The limit option has the opposite effect, limiting handles to a
			// maximum distance from another. Limit must be > 0, as otherwise
			// handles would be unmoveable.
			if (scope_Handles.length > 1 && options.limit) {

				if (lookBackward && handleNumber > 0) {
					to = Math.min(to, reference[handleNumber - 1] + options.limit);
				}

				if (lookForward && handleNumber < scope_Handles.length - 1) {
					to = Math.max(to, reference[handleNumber + 1] - options.limit);
				}
			}

			// The padding option keeps the handles a certain distance from the
			// edges of the slider. Padding must be > 0.
			if (options.padding) {

				if (handleNumber === 0) {
					to = Math.max(to, options.padding);
				}

				if (handleNumber === scope_Handles.length - 1) {
					to = Math.min(to, 100 - options.padding);
				}
			}

			to = scope_Spectrum.getStep(to);

			// Limit percentage to the 0 - 100 range
			to = limit(to);

			// Return false if handle can't move
			if (to === reference[handleNumber] && !getValue) {
				return false;
			}

			return to;
		}

		function toPct(pct) {
			return pct + '%';
		}

		// Updates scope_Locations and scope_Values, updates visual state
		function updateHandlePosition(handleNumber, to) {

			// Update locations.
			scope_Locations[handleNumber] = to;

			// Convert the value to the slider stepping/range.
			scope_Values[handleNumber] = scope_Spectrum.fromStepping(to);

			// Called synchronously or on the next animationFrame
			var stateUpdate = function stateUpdate() {
				scope_Handles[handleNumber].style[options.style] = toPct(to);
				updateConnect(handleNumber);
				updateConnect(handleNumber + 1);
			};

			// Set the handle to the new position.
			// Use requestAnimationFrame for efficient painting.
			// No significant effect in Chrome, Edge sees dramatic performace improvements.
			// Option to disable is useful for unit tests, and single-step debugging.
			if (window.requestAnimationFrame && options.useRequestAnimationFrame) {
				window.requestAnimationFrame(stateUpdate);
			} else {
				stateUpdate();
			}
		}

		function setZindex() {

			scope_HandleNumbers.forEach(function (handleNumber) {
				// Handles before the slider middle are stacked later = higher,
				// Handles after the middle later is lower
				// [[7] [8] .......... | .......... [5] [4]
				var dir = scope_Locations[handleNumber] > 50 ? -1 : 1;
				var zIndex = 3 + (scope_Handles.length + dir * handleNumber);
				scope_Handles[handleNumber].childNodes[0].style.zIndex = zIndex;
			});
		}

		// Test suggested values and apply margin, step.
		function setHandle(handleNumber, to, lookBackward, lookForward) {

			to = checkHandlePosition(scope_Locations, handleNumber, to, lookBackward, lookForward, false);

			if (to === false) {
				return false;
			}

			updateHandlePosition(handleNumber, to);

			return true;
		}

		// Updates style attribute for connect nodes
		function updateConnect(index) {

			// Skip connects set to false
			if (!scope_Connects[index]) {
				return;
			}

			var l = 0;
			var h = 100;

			if (index !== 0) {
				l = scope_Locations[index - 1];
			}

			if (index !== scope_Connects.length - 1) {
				h = scope_Locations[index];
			}

			scope_Connects[index].style[options.style] = toPct(l);
			scope_Connects[index].style[options.styleOposite] = toPct(100 - h);
		}

		// ...
		function setValue(to, handleNumber) {

			// Setting with null indicates an 'ignore'.
			// Inputting 'false' is invalid.
			if (to === null || to === false) {
				return;
			}

			// If a formatted number was passed, attemt to decode it.
			if (typeof to === 'number') {
				to = String(to);
			}

			to = options.format.from(to);

			// Request an update for all links if the value was invalid.
			// Do so too if setting the handle fails.
			if (to !== false && !isNaN(to)) {
				setHandle(handleNumber, scope_Spectrum.toStepping(to), false, false);
			}
		}

		// Set the slider value.
		function valueSet(input, fireSetEvent) {

			var values = asArray(input);
			var isInit = scope_Locations[0] === undefined;

			// Event fires by default
			fireSetEvent = fireSetEvent === undefined ? true : !!fireSetEvent;

			values.forEach(setValue);

			// Animation is optional.
			// Make sure the initial values were set before using animated placement.
			if (options.animate && !isInit) {
				addClassFor(scope_Target, options.cssClasses.tap, options.animationDuration);
			}

			// Now that all base values are set, apply constraints
			scope_HandleNumbers.forEach(function (handleNumber) {
				setHandle(handleNumber, scope_Locations[handleNumber], true, false);
			});

			setZindex();

			scope_HandleNumbers.forEach(function (handleNumber) {

				fireEvent('update', handleNumber);

				// Fire the event only for handles that received a new value, as per #579
				if (values[handleNumber] !== null && fireSetEvent) {
					fireEvent('set', handleNumber);
				}
			});
		}

		// Reset slider to initial values
		function valueReset(fireSetEvent) {
			valueSet(options.start, fireSetEvent);
		}

		// Get the slider value.
		function valueGet() {

			var values = scope_Values.map(options.format.to);

			// If only one handle is used, return a single value.
			if (values.length === 1) {
				return values[0];
			}

			return values;
		}

		// Removes classes from the root and empties it.
		function destroy() {

			for (var key in options.cssClasses) {
				if (!options.cssClasses.hasOwnProperty(key)) {
					continue;
				}
				removeClass(scope_Target, options.cssClasses[key]);
			}

			while (scope_Target.firstChild) {
				scope_Target.removeChild(scope_Target.firstChild);
			}

			delete scope_Target.noUiSlider;
		}

		// Get the current step size for the slider.
		function getCurrentStep() {

			// Check all locations, map them to their stepping point.
			// Get the step point, then find it in the input list.
			return scope_Locations.map(function (location, index) {

				var nearbySteps = scope_Spectrum.getNearbySteps(location);
				var value = scope_Values[index];
				var increment = nearbySteps.thisStep.step;
				var decrement = null;

				// If the next value in this step moves into the next step,
				// the increment is the start of the next step - the current value
				if (increment !== false) {
					if (value + increment > nearbySteps.stepAfter.startValue) {
						increment = nearbySteps.stepAfter.startValue - value;
					}
				}

				// If the value is beyond the starting point
				if (value > nearbySteps.thisStep.startValue) {
					decrement = nearbySteps.thisStep.step;
				} else if (nearbySteps.stepBefore.step === false) {
					decrement = false;
				}

				// If a handle is at the start of a step, it always steps back into the previous step first
				else {
						decrement = value - nearbySteps.stepBefore.highestStep;
					}

				// Now, if at the slider edges, there is not in/decrement
				if (location === 100) {
					increment = null;
				} else if (location === 0) {
					decrement = null;
				}

				// As per #391, the comparison for the decrement step can have some rounding issues.
				var stepDecimals = scope_Spectrum.countStepDecimals();

				// Round per #391
				if (increment !== null && increment !== false) {
					increment = Number(increment.toFixed(stepDecimals));
				}

				if (decrement !== null && decrement !== false) {
					decrement = Number(decrement.toFixed(stepDecimals));
				}

				return [decrement, increment];
			});
		}

		// Attach an event to this slider, possibly including a namespace
		function bindEvent(namespacedEvent, callback) {
			scope_Events[namespacedEvent] = scope_Events[namespacedEvent] || [];
			scope_Events[namespacedEvent].push(callback);

			// If the event bound is 'update,' fire it immediately for all handles.
			if (namespacedEvent.split('.')[0] === 'update') {
				scope_Handles.forEach(function (a, index) {
					fireEvent('update', index);
				});
			}
		}

		// Undo attachment of event
		function removeEvent(namespacedEvent) {

			var event = namespacedEvent && namespacedEvent.split('.')[0];
			var namespace = event && namespacedEvent.substring(event.length);

			Object.keys(scope_Events).forEach(function (bind) {

				var tEvent = bind.split('.')[0],
				    tNamespace = bind.substring(tEvent.length);

				if ((!event || event === tEvent) && (!namespace || namespace === tNamespace)) {
					delete scope_Events[bind];
				}
			});
		}

		// Updateable: margin, limit, padding, step, range, animate, snap
		function updateOptions(optionsToUpdate, fireSetEvent) {

			// Spectrum is created using the range, snap, direction and step options.
			// 'snap' and 'step' can be updated.
			// If 'snap' and 'step' are not passed, they should remain unchanged.
			var v = valueGet();

			var updateAble = ['margin', 'limit', 'padding', 'range', 'animate', 'snap', 'step', 'format'];

			// Only change options that we're actually passed to update.
			updateAble.forEach(function (name) {
				if (optionsToUpdate[name] !== undefined) {
					originalOptions[name] = optionsToUpdate[name];
				}
			});

			var newOptions = testOptions(originalOptions);

			// Load new options into the slider state
			updateAble.forEach(function (name) {
				if (optionsToUpdate[name] !== undefined) {
					options[name] = newOptions[name];
				}
			});

			scope_Spectrum = newOptions.spectrum;

			// Limit, margin and padding depend on the spectrum but are stored outside of it. (#677)
			options.margin = newOptions.margin;
			options.limit = newOptions.limit;
			options.padding = newOptions.padding;

			// Update pips, removes existing.
			if (options.pips) {
				pips(options.pips);
			}

			// Invalidate the current positioning so valueSet forces an update.
			scope_Locations = [];
			valueSet(optionsToUpdate.start || v, fireSetEvent);
		}

		// Throw an error if the slider was already initialized.
		if (scope_Target.noUiSlider) {
			throw new Error("noUiSlider (" + VERSION + "): Slider was already initialized.");
		}

		// Create the base element, initialise HTML and set classes.
		// Add handles and connect elements.
		addSlider(scope_Target);
		addElements(options.connect, scope_Base);

		scope_Self = {
			destroy: destroy,
			steps: getCurrentStep,
			on: bindEvent,
			off: removeEvent,
			get: valueGet,
			set: valueSet,
			reset: valueReset,
			// Exposed for unit testing, don't use this in your application.
			__moveHandles: function __moveHandles(a, b, c) {
				moveHandles(a, b, scope_Locations, c);
			},
			options: originalOptions, // Issue #600, #678
			updateOptions: updateOptions,
			target: scope_Target, // Issue #597
			removePips: removePips,
			pips: pips // Issue #594
		};

		// Attach user events.
		bindSliderEvents(options.events);

		// Use the public value method to set the start values.
		valueSet(options.start);

		if (options.pips) {
			pips(options.pips);
		}

		if (options.tooltips) {
			tooltips();
		}

		aria();

		return scope_Self;
	}

	// Run the standard initializer
	function initialize(target, originalOptions) {

		if (!target || !target.nodeName) {
			throw new Error("noUiSlider (" + VERSION + "): create requires a single element, got: " + target);
		}

		// Test the options and create the slider environment;
		var options = testOptions(originalOptions, target);
		var api = closure(target, options, originalOptions);

		target.noUiSlider = api;

		return api;
	}

	// Use an object instead of a function for future expansibility;
	return {
		version: VERSION,
		create: initialize
	};
});

/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__turf_destination__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__turf_helpers__ = __webpack_require__(25);



/**
 * Takes a {@link Point} and calculates the circle polygon given a radius in degrees, radians, miles, or kilometers; and steps for precision.
 *
 * @name circle
 * @param {Feature<Point>|number[]} center center point
 * @param {number} radius radius of the circle
 * @param {Object} [options={}] Optional parameters
 * @param {number} [options.steps=64] number of steps
 * @param {string} [options.units='kilometers'] miles, kilometers, degrees, or radians
 * @param {Object} [options.properties={}] properties
 * @returns {Feature<Polygon>} circle polygon
 * @example
 * var center = [-75.343, 39.984];
 * var radius = 5;
 * var steps = 10;
 * var units = 'kilometers';
 * var properties = {foo: 'bar'};
 *
 * var circle = turf.circle(center, radius, steps, units, properties);
 *
 * //addToMap
 * var addToMap = [turf.point(center), circle]
 */
function circle(center, radius, options) {
    // Optional params
    options = options || {};
    var steps = options.steps || 64;
    var units = options.units;
    var properties = options.properties;

    // validation
    if (!center) throw new Error('center is required');
    if (!radius) throw new Error('radius is required');
    if (typeof options !== 'object') throw new Error('options must be an object');
    if (typeof steps !== 'number') throw new Error('steps must be a number');

    // default params
    steps = steps || 64;
    properties = properties || center.properties || {};

    var coordinates = [];
    for (var i = 0; i < steps; i++) {
        coordinates.push(Object(__WEBPACK_IMPORTED_MODULE_0__turf_destination__["a" /* default */])(center, radius, i * 360 / steps, units).geometry.coordinates);
    }
    coordinates.push(coordinates[0]);

    return Object(__WEBPACK_IMPORTED_MODULE_1__turf_helpers__["a" /* polygon */])([coordinates], properties);
}

/* harmony default export */ __webpack_exports__["default"] = (circle);


/***/ }),
/* 22 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__turf_invariant__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__turf_helpers__ = __webpack_require__(24);
//http://en.wikipedia.org/wiki/Haversine_formula
//http://www.movable-type.co.uk/scripts/latlong.html



/**
 * Takes a {@link Point} and calculates the location of a destination point given a distance in degrees, radians, miles, or kilometers; and bearing in degrees. This uses the [Haversine formula](http://en.wikipedia.org/wiki/Haversine_formula) to account for global curvature.
 *
 * @name destination
 * @param {Geometry|Feature<Point>|Array<number>} origin starting point
 * @param {number} distance distance from the origin point
 * @param {number} bearing ranging from -180 to 180
 * @param {Object} options Optional parameters
 * @param {string} [options.units='kilometers'] miles, kilometers, degrees, or radians
 * @returns {Feature<Point>} destination point
 * @example
 * var point = turf.point([-75.343, 39.984]);
 * var distance = 50;
 * var bearing = 90;
 * var units = 'miles';
 *
 * var destination = turf.destination(point, distance, bearing, units);
 *
 * //addToMap
 * var addToMap = [point, destination]
 * destination.properties['marker-color'] = '#f00';
 * point.properties['marker-color'] = '#0f0';
 */
function destination(origin, distance, bearing, options) {
    // Backwards compatible with v4.0
    var units = (typeof options === 'object') ? options.units : options;

    var degrees2radians = Math.PI / 180;
    var radians2degrees = 180 / Math.PI;
    var coordinates1 = Object(__WEBPACK_IMPORTED_MODULE_0__turf_invariant__["a" /* getCoord */])(origin);
    var longitude1 = degrees2radians * coordinates1[0];
    var latitude1 = degrees2radians * coordinates1[1];
    var bearing_rad = degrees2radians * bearing;

    var radians = Object(__WEBPACK_IMPORTED_MODULE_1__turf_helpers__["a" /* distanceToRadians */])(distance, units);

    var latitude2 = Math.asin(Math.sin(latitude1) * Math.cos(radians) +
        Math.cos(latitude1) * Math.sin(radians) * Math.cos(bearing_rad));
    var longitude2 = longitude1 + Math.atan2(Math.sin(bearing_rad) * Math.sin(radians) * Math.cos(latitude1),
        Math.cos(radians) - Math.sin(latitude1) * Math.sin(latitude2));

    return Object(__WEBPACK_IMPORTED_MODULE_1__turf_helpers__["b" /* point */])([radians2degrees * longitude2, radians2degrees * latitude2]);
}

/* harmony default export */ __webpack_exports__["a"] = (destination);


/***/ }),
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = getCoord;
/* unused harmony export getCoords */
/* unused harmony export containsNumber */
/* unused harmony export geojsonType */
/* unused harmony export featureOf */
/* unused harmony export collectionOf */
/* unused harmony export getGeom */
/* unused harmony export getGeomType */
/* unused harmony export getType */
/**
 * Unwrap a coordinate from a Point Feature, Geometry or a single coordinate.
 *
 * @name getCoord
 * @param {Array<number>|Geometry<Point>|Feature<Point>} obj Object
 * @returns {Array<number>} coordinates
 * @example
 * var pt = turf.point([10, 10]);
 *
 * var coord = turf.getCoord(pt);
 * //= [10, 10]
 */
function getCoord(obj) {
    if (!obj) throw new Error('obj is required');

    var coordinates = getCoords(obj);

    // getCoord() must contain at least two numbers (Point)
    if (coordinates.length > 1 &&
        typeof coordinates[0] === 'number' &&
        typeof coordinates[1] === 'number') {
        return coordinates;
    } else {
        throw new Error('Coordinate is not a valid Point');
    }
}

/**
 * Unwrap coordinates from a Feature, Geometry Object or an Array of numbers
 *
 * @name getCoords
 * @param {Array<number>|Geometry|Feature} obj Object
 * @returns {Array<number>} coordinates
 * @example
 * var poly = turf.polygon([[[119.32, -8.7], [119.55, -8.69], [119.51, -8.54], [119.32, -8.7]]]);
 *
 * var coord = turf.getCoords(poly);
 * //= [[[119.32, -8.7], [119.55, -8.69], [119.51, -8.54], [119.32, -8.7]]]
 */
function getCoords(obj) {
    if (!obj) throw new Error('obj is required');
    var coordinates;

    // Array of numbers
    if (obj.length) {
        coordinates = obj;

    // Geometry Object
    } else if (obj.coordinates) {
        coordinates = obj.coordinates;

    // Feature
    } else if (obj.geometry && obj.geometry.coordinates) {
        coordinates = obj.geometry.coordinates;
    }
    // Checks if coordinates contains a number
    if (coordinates) {
        containsNumber(coordinates);
        return coordinates;
    }
    throw new Error('No valid coordinates');
}

/**
 * Checks if coordinates contains a number
 *
 * @name containsNumber
 * @param {Array<any>} coordinates GeoJSON Coordinates
 * @returns {boolean} true if Array contains a number
 */
function containsNumber(coordinates) {
    if (coordinates.length > 1 &&
        typeof coordinates[0] === 'number' &&
        typeof coordinates[1] === 'number') {
        return true;
    }

    if (Array.isArray(coordinates[0]) && coordinates[0].length) {
        return containsNumber(coordinates[0]);
    }
    throw new Error('coordinates must only contain numbers');
}

/**
 * Enforce expectations about types of GeoJSON objects for Turf.
 *
 * @name geojsonType
 * @param {GeoJSON} value any GeoJSON object
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} if value is not the expected type.
 */
function geojsonType(value, type, name) {
    if (!type || !name) throw new Error('type and name required');

    if (!value || value.type !== type) {
        throw new Error('Invalid input to ' + name + ': must be a ' + type + ', given ' + value.type);
    }
}

/**
 * Enforce expectations about types of {@link Feature} inputs for Turf.
 * Internally this uses {@link geojsonType} to judge geometry types.
 *
 * @name featureOf
 * @param {Feature} feature a feature with an expected geometry type
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} error if value is not the expected type.
 */
function featureOf(feature, type, name) {
    if (!feature) throw new Error('No feature passed');
    if (!name) throw new Error('.featureOf() requires a name');
    if (!feature || feature.type !== 'Feature' || !feature.geometry) {
        throw new Error('Invalid input to ' + name + ', Feature with geometry required');
    }
    if (!feature.geometry || feature.geometry.type !== type) {
        throw new Error('Invalid input to ' + name + ': must be a ' + type + ', given ' + feature.geometry.type);
    }
}

/**
 * Enforce expectations about types of {@link FeatureCollection} inputs for Turf.
 * Internally this uses {@link geojsonType} to judge geometry types.
 *
 * @name collectionOf
 * @param {FeatureCollection} featureCollection a FeatureCollection for which features will be judged
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} if value is not the expected type.
 */
function collectionOf(featureCollection, type, name) {
    if (!featureCollection) throw new Error('No featureCollection passed');
    if (!name) throw new Error('.collectionOf() requires a name');
    if (!featureCollection || featureCollection.type !== 'FeatureCollection') {
        throw new Error('Invalid input to ' + name + ', FeatureCollection required');
    }
    for (var i = 0; i < featureCollection.features.length; i++) {
        var feature = featureCollection.features[i];
        if (!feature || feature.type !== 'Feature' || !feature.geometry) {
            throw new Error('Invalid input to ' + name + ', Feature with geometry required');
        }
        if (!feature.geometry || feature.geometry.type !== type) {
            throw new Error('Invalid input to ' + name + ': must be a ' + type + ', given ' + feature.geometry.type);
        }
    }
}

/**
 * Get Geometry from Feature or Geometry Object
 *
 * @param {Feature|Geometry} geojson GeoJSON Feature or Geometry Object
 * @returns {Geometry|null} GeoJSON Geometry Object
 * @throws {Error} if geojson is not a Feature or Geometry Object
 * @example
 * var point = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [110, 40]
 *   }
 * }
 * var geom = turf.getGeom(point)
 * //={"type": "Point", "coordinates": [110, 40]}
 */
function getGeom(geojson) {
    if (!geojson) throw new Error('geojson is required');
    if (geojson.geometry !== undefined) return geojson.geometry;
    if (geojson.coordinates || geojson.geometries) return geojson;
    throw new Error('geojson must be a valid Feature or Geometry Object');
}

/**
 * Get Geometry Type from Feature or Geometry Object
 *
 * @throws {Error} **DEPRECATED** in v5.0.0 in favor of getType
 */
function getGeomType() {
    throw new Error('invariant.getGeomType has been deprecated in v5.0 in favor of invariant.getType');
}

/**
 * Get GeoJSON object's type, Geometry type is prioritize.
 *
 * @param {GeoJSON} geojson GeoJSON object
 * @param {string} [name] name of the variable to display in error message
 * @returns {string} GeoJSON type
 * @example
 * var point = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [110, 40]
 *   }
 * }
 * var geom = turf.getType(point)
 * //="Point"
 */
function getType(geojson, name) {
    if (!geojson) throw new Error((name || 'geojson') + ' is required');
    // GeoJSON Feature & GeometryCollection
    if (geojson.geometry && geojson.geometry.type) return geojson.geometry.type;
    // GeoJSON Geometry & FeatureCollection
    if (geojson.type) return geojson.type;
    throw new Error((name || 'geojson') + ' is invalid');
}


/***/ }),
/* 24 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export feature */
/* unused harmony export geometry */
/* harmony export (immutable) */ __webpack_exports__["b"] = point;
/* unused harmony export polygon */
/* unused harmony export lineString */
/* unused harmony export featureCollection */
/* unused harmony export multiLineString */
/* unused harmony export multiPoint */
/* unused harmony export multiPolygon */
/* unused harmony export geometryCollection */
/* unused harmony export round */
/* unused harmony export radiansToDistance */
/* harmony export (immutable) */ __webpack_exports__["a"] = distanceToRadians;
/* unused harmony export distanceToDegrees */
/* unused harmony export bearingToAngle */
/* unused harmony export radians2degrees */
/* unused harmony export degrees2radians */
/* unused harmony export convertDistance */
/* unused harmony export convertArea */
/* unused harmony export isNumber */
/* unused harmony export isObject */
/* unused harmony export earthRadius */
/**
 * Wraps a GeoJSON {@link Geometry} in a GeoJSON {@link Feature}.
 *
 * @name feature
 * @param {Geometry} geometry input geometry
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature} a GeoJSON Feature
 * @example
 * var geometry = {
 *   "type": "Point",
 *   "coordinates": [110, 50]
 * };
 *
 * var feature = turf.feature(geometry);
 *
 * //=feature
 */
function feature(geometry, properties, bbox, id) {
    if (geometry === undefined) throw new Error('geometry is required');
    if (properties && properties.constructor !== Object) throw new Error('properties must be an Object');
    if (bbox && bbox.length !== 4) throw new Error('bbox must be an Array of 4 numbers');
    if (id && ['string', 'number'].indexOf(typeof id) === -1) throw new Error('id must be a number or a string');

    var feat = {type: 'Feature'};
    if (id) feat.id = id;
    if (bbox) feat.bbox = bbox;
    feat.properties = properties || {};
    feat.geometry = geometry;
    return feat;
}

/**
 * Creates a GeoJSON {@link Geometry} from a Geometry string type & coordinates.
 * For GeometryCollection type use `helpers.geometryCollection`
 *
 * @name geometry
 * @param {string} type Geometry Type
 * @param {Array<number>} coordinates Coordinates
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @returns {Geometry} a GeoJSON Geometry
 * @example
 * var type = 'Point';
 * var coordinates = [110, 50];
 *
 * var geometry = turf.geometry(type, coordinates);
 *
 * //=geometry
 */
function geometry(type, coordinates, bbox) {
    // Validation
    if (!type) throw new Error('type is required');
    if (!coordinates) throw new Error('coordinates is required');
    if (!Array.isArray(coordinates)) throw new Error('coordinates must be an Array');
    if (bbox && bbox.length !== 4) throw new Error('bbox must be an Array of 4 numbers');

    var geom;
    switch (type) {
    case 'Point': geom = point(coordinates).geometry; break;
    case 'LineString': geom = lineString(coordinates).geometry; break;
    case 'Polygon': geom = polygon(coordinates).geometry; break;
    case 'MultiPoint': geom = multiPoint(coordinates).geometry; break;
    case 'MultiLineString': geom = multiLineString(coordinates).geometry; break;
    case 'MultiPolygon': geom = multiPolygon(coordinates).geometry; break;
    default: throw new Error(type + ' is invalid');
    }
    if (bbox) geom.bbox = bbox;
    return geom;
}

/**
 * Takes coordinates and properties (optional) and returns a new {@link Point} feature.
 *
 * @name point
 * @param {Array<number>} coordinates longitude, latitude position (each in decimal degrees)
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<Point>} a Point feature
 * @example
 * var point = turf.point([-75.343, 39.984]);
 *
 * //=point
 */
function point(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');
    if (coordinates.length === undefined) throw new Error('Coordinates must be an array');
    if (coordinates.length < 2) throw new Error('Coordinates must be at least 2 numbers long');
    if (!isNumber(coordinates[0]) || !isNumber(coordinates[1])) throw new Error('Coordinates must contain numbers');

    return feature({
        type: 'Point',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Takes an array of LinearRings and optionally an {@link Object} with properties and returns a {@link Polygon} feature.
 *
 * @name polygon
 * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<Polygon>} a Polygon feature
 * @throws {Error} throw an error if a LinearRing of the polygon has too few positions
 * or if a LinearRing of the Polygon does not have matching Positions at the beginning & end.
 * @example
 * var polygon = turf.polygon([[
 *   [-2.275543, 53.464547],
 *   [-2.275543, 53.489271],
 *   [-2.215118, 53.489271],
 *   [-2.215118, 53.464547],
 *   [-2.275543, 53.464547]
 * ]], { name: 'poly1', population: 400});
 *
 * //=polygon
 */
function polygon(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');

    for (var i = 0; i < coordinates.length; i++) {
        var ring = coordinates[i];
        if (ring.length < 4) {
            throw new Error('Each LinearRing of a Polygon must have 4 or more Positions.');
        }
        for (var j = 0; j < ring[ring.length - 1].length; j++) {
            // Check if first point of Polygon contains two numbers
            if (i === 0 && j === 0 && !isNumber(ring[0][0]) || !isNumber(ring[0][1])) throw new Error('Coordinates must contain numbers');
            if (ring[ring.length - 1][j] !== ring[0][j]) {
                throw new Error('First and last Position are not equivalent.');
            }
        }
    }

    return feature({
        type: 'Polygon',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Creates a {@link LineString} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name lineString
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<LineString>} a LineString feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var linestring1 = turf.lineString([
 *   [-21.964416, 64.148203],
 *   [-21.956176, 64.141316],
 *   [-21.93901, 64.135924],
 *   [-21.927337, 64.136673]
 * ]);
 * var linestring2 = turf.lineString([
 *   [-21.929054, 64.127985],
 *   [-21.912918, 64.134726],
 *   [-21.916007, 64.141016],
 *   [-21.930084, 64.14446]
 * ], {name: 'line 1', distance: 145});
 *
 * //=linestring1
 *
 * //=linestring2
 */
function lineString(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');
    if (coordinates.length < 2) throw new Error('Coordinates must be an array of two or more positions');
    // Check if first point of LineString contains two numbers
    if (!isNumber(coordinates[0][1]) || !isNumber(coordinates[0][1])) throw new Error('Coordinates must contain numbers');

    return feature({
        type: 'LineString',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Takes one or more {@link Feature|Features} and creates a {@link FeatureCollection}.
 *
 * @name featureCollection
 * @param {Feature[]} features input features
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {FeatureCollection} a FeatureCollection of input features
 * @example
 * var features = [
 *  turf.point([-75.343, 39.984], {name: 'Location A'}),
 *  turf.point([-75.833, 39.284], {name: 'Location B'}),
 *  turf.point([-75.534, 39.123], {name: 'Location C'})
 * ];
 *
 * var collection = turf.featureCollection(features);
 *
 * //=collection
 */
function featureCollection(features, bbox, id) {
    if (!features) throw new Error('No features passed');
    if (!Array.isArray(features)) throw new Error('features must be an Array');
    if (bbox && bbox.length !== 4) throw new Error('bbox must be an Array of 4 numbers');
    if (id && ['string', 'number'].indexOf(typeof id) === -1) throw new Error('id must be a number or a string');

    var fc = {type: 'FeatureCollection'};
    if (id) fc.id = id;
    if (bbox) fc.bbox = bbox;
    fc.features = features;
    return fc;
}

/**
 * Creates a {@link Feature<MultiLineString>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiLineString
 * @param {Array<Array<Array<number>>>} coordinates an array of LineStrings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<MultiLineString>} a MultiLineString feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiLine = turf.multiLineString([[[0,0],[10,10]]]);
 *
 * //=multiLine
 */
function multiLineString(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');

    return feature({
        type: 'MultiLineString',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Creates a {@link Feature<MultiPoint>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPoint
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<MultiPoint>} a MultiPoint feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPt = turf.multiPoint([[0,0],[10,10]]);
 *
 * //=multiPt
 */
function multiPoint(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');

    return feature({
        type: 'MultiPoint',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Creates a {@link Feature<MultiPolygon>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPolygon
 * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygons
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<MultiPolygon>} a multipolygon feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPoly = turf.multiPolygon([[[[0,0],[0,10],[10,10],[10,0],[0,0]]]]);
 *
 * //=multiPoly
 *
 */
function multiPolygon(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');

    return feature({
        type: 'MultiPolygon',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Creates a {@link Feature<GeometryCollection>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name geometryCollection
 * @param {Array<Geometry>} geometries an array of GeoJSON Geometries
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<GeometryCollection>} a GeoJSON GeometryCollection Feature
 * @example
 * var pt = {
 *     "type": "Point",
 *       "coordinates": [100, 0]
 *     };
 * var line = {
 *     "type": "LineString",
 *     "coordinates": [ [101, 0], [102, 1] ]
 *   };
 * var collection = turf.geometryCollection([pt, line]);
 *
 * //=collection
 */
function geometryCollection(geometries, properties, bbox, id) {
    if (!geometries) throw new Error('geometries is required');
    if (!Array.isArray(geometries)) throw new Error('geometries must be an Array');

    return feature({
        type: 'GeometryCollection',
        geometries: geometries
    }, properties, bbox, id);
}

// https://en.wikipedia.org/wiki/Great-circle_distance#Radius_for_spherical_Earth
var factors = {
    miles: 3960,
    nauticalmiles: 3441.145,
    degrees: 57.2957795,
    radians: 1,
    inches: 250905600,
    yards: 6969600,
    meters: 6373000,
    metres: 6373000,
    centimeters: 6.373e+8,
    centimetres: 6.373e+8,
    kilometers: 6373,
    kilometres: 6373,
    feet: 20908792.65
};

var areaFactors = {
    kilometers: 0.000001,
    kilometres: 0.000001,
    meters: 1,
    metres: 1,
    centimetres: 10000,
    millimeter: 1000000,
    acres: 0.000247105,
    miles: 3.86e-7,
    yards: 1.195990046,
    feet: 10.763910417,
    inches: 1550.003100006
};

/**
 * Round number to precision
 *
 * @param {number} num Number
 * @param {number} [precision=0] Precision
 * @returns {number} rounded number
 * @example
 * turf.round(120.4321)
 * //=120
 *
 * turf.round(120.4321, 2)
 * //=120.43
 */
function round(num, precision) {
    if (num === undefined || num === null || isNaN(num)) throw new Error('num is required');
    if (precision && !(precision >= 0)) throw new Error('precision must be a positive number');
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(num * multiplier) / multiplier;
}

/**
 * Convert a distance measurement (assuming a spherical Earth) from radians to a more friendly unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name radiansToDistance
 * @param {number} radians in radians across the sphere
 * @param {string} [units="kilometers"] can be degrees, radians, miles, or kilometers inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} distance
 */
function radiansToDistance(radians, units) {
    if (radians === undefined || radians === null) throw new Error('radians is required');

    if (units && typeof units !== 'string') throw new Error('units must be a string');
    var factor = factors[units || 'kilometers'];
    if (!factor) throw new Error(units + ' units is invalid');
    return radians * factor;
}

/**
 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into radians
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name distanceToRadians
 * @param {number} distance in real units
 * @param {string} [units=kilometers] can be degrees, radians, miles, or kilometers inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} radians
 */
function distanceToRadians(distance, units) {
    if (distance === undefined || distance === null) throw new Error('distance is required');

    if (units && typeof units !== 'string') throw new Error('units must be a string');
    var factor = factors[units || 'kilometers'];
    if (!factor) throw new Error(units + ' units is invalid');
    return distance / factor;
}

/**
 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into degrees
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, centimeters, kilometres, feet
 *
 * @name distanceToDegrees
 * @param {number} distance in real units
 * @param {string} [units=kilometers] can be degrees, radians, miles, or kilometers inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} degrees
 */
function distanceToDegrees(distance, units) {
    return radians2degrees(distanceToRadians(distance, units));
}

/**
 * Converts any bearing angle from the north line direction (positive clockwise)
 * and returns an angle between 0-360 degrees (positive clockwise), 0 being the north line
 *
 * @name bearingToAngle
 * @param {number} bearing angle, between -180 and +180 degrees
 * @returns {number} angle between 0 and 360 degrees
 */
function bearingToAngle(bearing) {
    if (bearing === null || bearing === undefined) throw new Error('bearing is required');

    var angle = bearing % 360;
    if (angle < 0) angle += 360;
    return angle;
}

/**
 * Converts an angle in radians to degrees
 *
 * @name radians2degrees
 * @param {number} radians angle in radians
 * @returns {number} degrees between 0 and 360 degrees
 */
function radians2degrees(radians) {
    if (radians === null || radians === undefined) throw new Error('radians is required');

    var degrees = radians % (2 * Math.PI);
    return degrees * 180 / Math.PI;
}

/**
 * Converts an angle in degrees to radians
 *
 * @name degrees2radians
 * @param {number} degrees angle between 0 and 360 degrees
 * @returns {number} angle in radians
 */
function degrees2radians(degrees) {
    if (degrees === null || degrees === undefined) throw new Error('degrees is required');

    var radians = degrees % 360;
    return radians * Math.PI / 180;
}

/**
 * Converts a distance to the requested unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @param {number} distance to be converted
 * @param {string} originalUnit of the distance
 * @param {string} [finalUnit=kilometers] returned unit
 * @returns {number} the converted distance
 */
function convertDistance(distance, originalUnit, finalUnit) {
    if (distance === null || distance === undefined) throw new Error('distance is required');
    if (!(distance >= 0)) throw new Error('distance must be a positive number');

    var convertedDistance = radiansToDistance(distanceToRadians(distance, originalUnit), finalUnit || 'kilometers');
    return convertedDistance;
}

/**
 * Converts a area to the requested unit.
 * Valid units: kilometers, kilometres, meters, metres, centimetres, millimeter, acre, mile, yard, foot, inch
 * @param {number} area to be converted
 * @param {string} [originalUnit=meters] of the distance
 * @param {string} [finalUnit=kilometers] returned unit
 * @returns {number} the converted distance
 */
function convertArea(area, originalUnit, finalUnit) {
    if (area === null || area === undefined) throw new Error('area is required');
    if (!(area >= 0)) throw new Error('area must be a positive number');

    var startFactor = areaFactors[originalUnit || 'meters'];
    if (!startFactor) throw new Error('invalid original units');

    var finalFactor = areaFactors[finalUnit || 'kilometers'];
    if (!finalFactor) throw new Error('invalid final units');

    return (area / startFactor) * finalFactor;
}

/**
 * isNumber
 *
 * @param {*} num Number to validate
 * @returns {boolean} true/false
 * @example
 * turf.isNumber(123)
 * //=true
 * turf.isNumber('foo')
 * //=false
 */
function isNumber(num) {
    return !isNaN(num) && num !== null && !Array.isArray(num);
}

/**
 * isObject
 *
 * @param {*} input variable to validate
 * @returns {boolean} true/false
 * @example
 * turf.isObject({elevation: 10})
 * //=true
 * turf.isObject('foo')
 * //=false
 */
function isObject(input) {
    return (!!input) && (input.constructor === Object);
}

/**
 * Earth Radius used with the Harvesine formula and approximates using a spherical (non-ellipsoid) Earth.
 */
var earthRadius = 6371008.8;


/***/ }),
/* 25 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export feature */
/* unused harmony export geometry */
/* unused harmony export point */
/* harmony export (immutable) */ __webpack_exports__["a"] = polygon;
/* unused harmony export lineString */
/* unused harmony export featureCollection */
/* unused harmony export multiLineString */
/* unused harmony export multiPoint */
/* unused harmony export multiPolygon */
/* unused harmony export geometryCollection */
/* unused harmony export round */
/* unused harmony export radiansToDistance */
/* unused harmony export distanceToRadians */
/* unused harmony export distanceToDegrees */
/* unused harmony export bearingToAngle */
/* unused harmony export radians2degrees */
/* unused harmony export degrees2radians */
/* unused harmony export convertDistance */
/* unused harmony export convertArea */
/* unused harmony export isNumber */
/* unused harmony export isObject */
/* unused harmony export earthRadius */
/**
 * Wraps a GeoJSON {@link Geometry} in a GeoJSON {@link Feature}.
 *
 * @name feature
 * @param {Geometry} geometry input geometry
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature} a GeoJSON Feature
 * @example
 * var geometry = {
 *   "type": "Point",
 *   "coordinates": [110, 50]
 * };
 *
 * var feature = turf.feature(geometry);
 *
 * //=feature
 */
function feature(geometry, properties, bbox, id) {
    if (geometry === undefined) throw new Error('geometry is required');
    if (properties && properties.constructor !== Object) throw new Error('properties must be an Object');
    if (bbox && bbox.length !== 4) throw new Error('bbox must be an Array of 4 numbers');
    if (id && ['string', 'number'].indexOf(typeof id) === -1) throw new Error('id must be a number or a string');

    var feat = {type: 'Feature'};
    if (id) feat.id = id;
    if (bbox) feat.bbox = bbox;
    feat.properties = properties || {};
    feat.geometry = geometry;
    return feat;
}

/**
 * Creates a GeoJSON {@link Geometry} from a Geometry string type & coordinates.
 * For GeometryCollection type use `helpers.geometryCollection`
 *
 * @name geometry
 * @param {string} type Geometry Type
 * @param {Array<number>} coordinates Coordinates
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @returns {Geometry} a GeoJSON Geometry
 * @example
 * var type = 'Point';
 * var coordinates = [110, 50];
 *
 * var geometry = turf.geometry(type, coordinates);
 *
 * //=geometry
 */
function geometry(type, coordinates, bbox) {
    // Validation
    if (!type) throw new Error('type is required');
    if (!coordinates) throw new Error('coordinates is required');
    if (!Array.isArray(coordinates)) throw new Error('coordinates must be an Array');
    if (bbox && bbox.length !== 4) throw new Error('bbox must be an Array of 4 numbers');

    var geom;
    switch (type) {
    case 'Point': geom = point(coordinates).geometry; break;
    case 'LineString': geom = lineString(coordinates).geometry; break;
    case 'Polygon': geom = polygon(coordinates).geometry; break;
    case 'MultiPoint': geom = multiPoint(coordinates).geometry; break;
    case 'MultiLineString': geom = multiLineString(coordinates).geometry; break;
    case 'MultiPolygon': geom = multiPolygon(coordinates).geometry; break;
    default: throw new Error(type + ' is invalid');
    }
    if (bbox) geom.bbox = bbox;
    return geom;
}

/**
 * Takes coordinates and properties (optional) and returns a new {@link Point} feature.
 *
 * @name point
 * @param {Array<number>} coordinates longitude, latitude position (each in decimal degrees)
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<Point>} a Point feature
 * @example
 * var point = turf.point([-75.343, 39.984]);
 *
 * //=point
 */
function point(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');
    if (coordinates.length === undefined) throw new Error('Coordinates must be an array');
    if (coordinates.length < 2) throw new Error('Coordinates must be at least 2 numbers long');
    if (!isNumber(coordinates[0]) || !isNumber(coordinates[1])) throw new Error('Coordinates must contain numbers');

    return feature({
        type: 'Point',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Takes an array of LinearRings and optionally an {@link Object} with properties and returns a {@link Polygon} feature.
 *
 * @name polygon
 * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<Polygon>} a Polygon feature
 * @throws {Error} throw an error if a LinearRing of the polygon has too few positions
 * or if a LinearRing of the Polygon does not have matching Positions at the beginning & end.
 * @example
 * var polygon = turf.polygon([[
 *   [-2.275543, 53.464547],
 *   [-2.275543, 53.489271],
 *   [-2.215118, 53.489271],
 *   [-2.215118, 53.464547],
 *   [-2.275543, 53.464547]
 * ]], { name: 'poly1', population: 400});
 *
 * //=polygon
 */
function polygon(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');

    for (var i = 0; i < coordinates.length; i++) {
        var ring = coordinates[i];
        if (ring.length < 4) {
            throw new Error('Each LinearRing of a Polygon must have 4 or more Positions.');
        }
        for (var j = 0; j < ring[ring.length - 1].length; j++) {
            // Check if first point of Polygon contains two numbers
            if (i === 0 && j === 0 && !isNumber(ring[0][0]) || !isNumber(ring[0][1])) throw new Error('Coordinates must contain numbers');
            if (ring[ring.length - 1][j] !== ring[0][j]) {
                throw new Error('First and last Position are not equivalent.');
            }
        }
    }

    return feature({
        type: 'Polygon',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Creates a {@link LineString} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name lineString
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<LineString>} a LineString feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var linestring1 = turf.lineString([
 *   [-21.964416, 64.148203],
 *   [-21.956176, 64.141316],
 *   [-21.93901, 64.135924],
 *   [-21.927337, 64.136673]
 * ]);
 * var linestring2 = turf.lineString([
 *   [-21.929054, 64.127985],
 *   [-21.912918, 64.134726],
 *   [-21.916007, 64.141016],
 *   [-21.930084, 64.14446]
 * ], {name: 'line 1', distance: 145});
 *
 * //=linestring1
 *
 * //=linestring2
 */
function lineString(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');
    if (coordinates.length < 2) throw new Error('Coordinates must be an array of two or more positions');
    // Check if first point of LineString contains two numbers
    if (!isNumber(coordinates[0][1]) || !isNumber(coordinates[0][1])) throw new Error('Coordinates must contain numbers');

    return feature({
        type: 'LineString',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Takes one or more {@link Feature|Features} and creates a {@link FeatureCollection}.
 *
 * @name featureCollection
 * @param {Feature[]} features input features
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {FeatureCollection} a FeatureCollection of input features
 * @example
 * var features = [
 *  turf.point([-75.343, 39.984], {name: 'Location A'}),
 *  turf.point([-75.833, 39.284], {name: 'Location B'}),
 *  turf.point([-75.534, 39.123], {name: 'Location C'})
 * ];
 *
 * var collection = turf.featureCollection(features);
 *
 * //=collection
 */
function featureCollection(features, bbox, id) {
    if (!features) throw new Error('No features passed');
    if (!Array.isArray(features)) throw new Error('features must be an Array');
    if (bbox && bbox.length !== 4) throw new Error('bbox must be an Array of 4 numbers');
    if (id && ['string', 'number'].indexOf(typeof id) === -1) throw new Error('id must be a number or a string');

    var fc = {type: 'FeatureCollection'};
    if (id) fc.id = id;
    if (bbox) fc.bbox = bbox;
    fc.features = features;
    return fc;
}

/**
 * Creates a {@link Feature<MultiLineString>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiLineString
 * @param {Array<Array<Array<number>>>} coordinates an array of LineStrings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<MultiLineString>} a MultiLineString feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiLine = turf.multiLineString([[[0,0],[10,10]]]);
 *
 * //=multiLine
 */
function multiLineString(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');

    return feature({
        type: 'MultiLineString',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Creates a {@link Feature<MultiPoint>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPoint
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<MultiPoint>} a MultiPoint feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPt = turf.multiPoint([[0,0],[10,10]]);
 *
 * //=multiPt
 */
function multiPoint(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');

    return feature({
        type: 'MultiPoint',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Creates a {@link Feature<MultiPolygon>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPolygon
 * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygons
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<MultiPolygon>} a multipolygon feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPoly = turf.multiPolygon([[[[0,0],[0,10],[10,10],[10,0],[0,0]]]]);
 *
 * //=multiPoly
 *
 */
function multiPolygon(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');

    return feature({
        type: 'MultiPolygon',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Creates a {@link Feature<GeometryCollection>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name geometryCollection
 * @param {Array<Geometry>} geometries an array of GeoJSON Geometries
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<GeometryCollection>} a GeoJSON GeometryCollection Feature
 * @example
 * var pt = {
 *     "type": "Point",
 *       "coordinates": [100, 0]
 *     };
 * var line = {
 *     "type": "LineString",
 *     "coordinates": [ [101, 0], [102, 1] ]
 *   };
 * var collection = turf.geometryCollection([pt, line]);
 *
 * //=collection
 */
function geometryCollection(geometries, properties, bbox, id) {
    if (!geometries) throw new Error('geometries is required');
    if (!Array.isArray(geometries)) throw new Error('geometries must be an Array');

    return feature({
        type: 'GeometryCollection',
        geometries: geometries
    }, properties, bbox, id);
}

// https://en.wikipedia.org/wiki/Great-circle_distance#Radius_for_spherical_Earth
var factors = {
    miles: 3960,
    nauticalmiles: 3441.145,
    degrees: 57.2957795,
    radians: 1,
    inches: 250905600,
    yards: 6969600,
    meters: 6373000,
    metres: 6373000,
    centimeters: 6.373e+8,
    centimetres: 6.373e+8,
    kilometers: 6373,
    kilometres: 6373,
    feet: 20908792.65
};

var areaFactors = {
    kilometers: 0.000001,
    kilometres: 0.000001,
    meters: 1,
    metres: 1,
    centimetres: 10000,
    millimeter: 1000000,
    acres: 0.000247105,
    miles: 3.86e-7,
    yards: 1.195990046,
    feet: 10.763910417,
    inches: 1550.003100006
};

/**
 * Round number to precision
 *
 * @param {number} num Number
 * @param {number} [precision=0] Precision
 * @returns {number} rounded number
 * @example
 * turf.round(120.4321)
 * //=120
 *
 * turf.round(120.4321, 2)
 * //=120.43
 */
function round(num, precision) {
    if (num === undefined || num === null || isNaN(num)) throw new Error('num is required');
    if (precision && !(precision >= 0)) throw new Error('precision must be a positive number');
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(num * multiplier) / multiplier;
}

/**
 * Convert a distance measurement (assuming a spherical Earth) from radians to a more friendly unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name radiansToDistance
 * @param {number} radians in radians across the sphere
 * @param {string} [units="kilometers"] can be degrees, radians, miles, or kilometers inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} distance
 */
function radiansToDistance(radians, units) {
    if (radians === undefined || radians === null) throw new Error('radians is required');

    if (units && typeof units !== 'string') throw new Error('units must be a string');
    var factor = factors[units || 'kilometers'];
    if (!factor) throw new Error(units + ' units is invalid');
    return radians * factor;
}

/**
 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into radians
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name distanceToRadians
 * @param {number} distance in real units
 * @param {string} [units=kilometers] can be degrees, radians, miles, or kilometers inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} radians
 */
function distanceToRadians(distance, units) {
    if (distance === undefined || distance === null) throw new Error('distance is required');

    if (units && typeof units !== 'string') throw new Error('units must be a string');
    var factor = factors[units || 'kilometers'];
    if (!factor) throw new Error(units + ' units is invalid');
    return distance / factor;
}

/**
 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into degrees
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, centimeters, kilometres, feet
 *
 * @name distanceToDegrees
 * @param {number} distance in real units
 * @param {string} [units=kilometers] can be degrees, radians, miles, or kilometers inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} degrees
 */
function distanceToDegrees(distance, units) {
    return radians2degrees(distanceToRadians(distance, units));
}

/**
 * Converts any bearing angle from the north line direction (positive clockwise)
 * and returns an angle between 0-360 degrees (positive clockwise), 0 being the north line
 *
 * @name bearingToAngle
 * @param {number} bearing angle, between -180 and +180 degrees
 * @returns {number} angle between 0 and 360 degrees
 */
function bearingToAngle(bearing) {
    if (bearing === null || bearing === undefined) throw new Error('bearing is required');

    var angle = bearing % 360;
    if (angle < 0) angle += 360;
    return angle;
}

/**
 * Converts an angle in radians to degrees
 *
 * @name radians2degrees
 * @param {number} radians angle in radians
 * @returns {number} degrees between 0 and 360 degrees
 */
function radians2degrees(radians) {
    if (radians === null || radians === undefined) throw new Error('radians is required');

    var degrees = radians % (2 * Math.PI);
    return degrees * 180 / Math.PI;
}

/**
 * Converts an angle in degrees to radians
 *
 * @name degrees2radians
 * @param {number} degrees angle between 0 and 360 degrees
 * @returns {number} angle in radians
 */
function degrees2radians(degrees) {
    if (degrees === null || degrees === undefined) throw new Error('degrees is required');

    var radians = degrees % 360;
    return radians * Math.PI / 180;
}

/**
 * Converts a distance to the requested unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @param {number} distance to be converted
 * @param {string} originalUnit of the distance
 * @param {string} [finalUnit=kilometers] returned unit
 * @returns {number} the converted distance
 */
function convertDistance(distance, originalUnit, finalUnit) {
    if (distance === null || distance === undefined) throw new Error('distance is required');
    if (!(distance >= 0)) throw new Error('distance must be a positive number');

    var convertedDistance = radiansToDistance(distanceToRadians(distance, originalUnit), finalUnit || 'kilometers');
    return convertedDistance;
}

/**
 * Converts a area to the requested unit.
 * Valid units: kilometers, kilometres, meters, metres, centimetres, millimeter, acre, mile, yard, foot, inch
 * @param {number} area to be converted
 * @param {string} [originalUnit=meters] of the distance
 * @param {string} [finalUnit=kilometers] returned unit
 * @returns {number} the converted distance
 */
function convertArea(area, originalUnit, finalUnit) {
    if (area === null || area === undefined) throw new Error('area is required');
    if (!(area >= 0)) throw new Error('area must be a positive number');

    var startFactor = areaFactors[originalUnit || 'meters'];
    if (!startFactor) throw new Error('invalid original units');

    var finalFactor = areaFactors[finalUnit || 'kilometers'];
    if (!finalFactor) throw new Error('invalid final units');

    return (area / startFactor) * finalFactor;
}

/**
 * isNumber
 *
 * @param {*} num Number to validate
 * @returns {boolean} true/false
 * @example
 * turf.isNumber(123)
 * //=true
 * turf.isNumber('foo')
 * //=false
 */
function isNumber(num) {
    return !isNaN(num) && num !== null && !Array.isArray(num);
}

/**
 * isObject
 *
 * @param {*} input variable to validate
 * @returns {boolean} true/false
 * @example
 * turf.isObject({elevation: 10})
 * //=true
 * turf.isObject('foo')
 * //=false
 */
function isObject(input) {
    return (!!input) && (input.constructor === Object);
}

/**
 * Earth Radius used with the Harvesine formula and approximates using a spherical (non-ellipsoid) Earth.
 */
var earthRadius = 6371008.8;


/***/ }),
/* 26 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "earthRadius", function() { return earthRadius; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "factors", function() { return factors; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "unitsFactors", function() { return unitsFactors; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "areaFactors", function() { return areaFactors; });
/* harmony export (immutable) */ __webpack_exports__["feature"] = feature;
/* harmony export (immutable) */ __webpack_exports__["geometry"] = geometry;
/* harmony export (immutable) */ __webpack_exports__["point"] = point;
/* harmony export (immutable) */ __webpack_exports__["polygon"] = polygon;
/* harmony export (immutable) */ __webpack_exports__["lineString"] = lineString;
/* harmony export (immutable) */ __webpack_exports__["featureCollection"] = featureCollection;
/* harmony export (immutable) */ __webpack_exports__["multiLineString"] = multiLineString;
/* harmony export (immutable) */ __webpack_exports__["multiPoint"] = multiPoint;
/* harmony export (immutable) */ __webpack_exports__["multiPolygon"] = multiPolygon;
/* harmony export (immutable) */ __webpack_exports__["geometryCollection"] = geometryCollection;
/* harmony export (immutable) */ __webpack_exports__["round"] = round;
/* harmony export (immutable) */ __webpack_exports__["radiansToDistance"] = radiansToDistance;
/* harmony export (immutable) */ __webpack_exports__["distanceToRadians"] = distanceToRadians;
/* harmony export (immutable) */ __webpack_exports__["distanceToDegrees"] = distanceToDegrees;
/* harmony export (immutable) */ __webpack_exports__["bearingToAngle"] = bearingToAngle;
/* harmony export (immutable) */ __webpack_exports__["radians2degrees"] = radians2degrees;
/* harmony export (immutable) */ __webpack_exports__["degrees2radians"] = degrees2radians;
/* harmony export (immutable) */ __webpack_exports__["convertDistance"] = convertDistance;
/* harmony export (immutable) */ __webpack_exports__["convertArea"] = convertArea;
/* harmony export (immutable) */ __webpack_exports__["isNumber"] = isNumber;
/* harmony export (immutable) */ __webpack_exports__["isObject"] = isObject;
/**
 * Earth Radius used with the Harvesine formula and approximates using a spherical (non-ellipsoid) Earth.
 */
var earthRadius = 6371008.8;

/**
 * Unit of measurement factors using a spherical (non-ellipsoid) earth radius.
 */
var factors = {
    meters: earthRadius,
    metres: earthRadius,
    millimeters: earthRadius * 1000,
    millimetres: earthRadius * 1000,
    centimeters: earthRadius * 100,
    centimetres: earthRadius * 100,
    kilometers: earthRadius / 1000,
    kilometres: earthRadius / 1000,
    miles: earthRadius / 1609.344,
    nauticalmiles: earthRadius / 1852,
    inches: earthRadius * 39.370,
    yards: earthRadius / 1.0936,
    feet: earthRadius * 3.28084,
    radians: 1,
    degrees: earthRadius / 111325,
};

/**
 * Units of measurement factors based on 1 meter.
 */
var unitsFactors = {
    meters: 1,
    metres: 1,
    millimeters: 1000,
    millimetres: 1000,
    centimeters: 100,
    centimetres: 100,
    kilometers: 1 / 1000,
    kilometres: 1 / 1000,
    miles: 1 / 1609.344,
    nauticalmiles: 1 / 1852,
    inches: 39.370,
    yards: 1 / 1.0936,
    feet: 3.28084,
    radians: 1 / earthRadius,
    degrees: 1 / 111325,
};

/**
 * Area of measurement factors based on 1 square meter.
 */
var areaFactors = {
    meters: 1,
    metres: 1,
    millimeters: 1000000,
    millimetres: 1000000,
    centimeters: 10000,
    centimetres: 10000,
    kilometers: 0.000001,
    kilometres: 0.000001,
    acres: 0.000247105,
    miles: 3.86e-7,
    yards: 1.195990046,
    feet: 10.763910417,
    inches: 1550.003100006
};

/**
 * Wraps a GeoJSON {@link Geometry} in a GeoJSON {@link Feature}.
 *
 * @name feature
 * @param {Geometry} geometry input geometry
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature} a GeoJSON Feature
 * @example
 * var geometry = {
 *   "type": "Point",
 *   "coordinates": [110, 50]
 * };
 *
 * var feature = turf.feature(geometry);
 *
 * //=feature
 */
function feature(geometry, properties, bbox, id) {
    if (geometry === undefined) throw new Error('geometry is required');
    if (properties && properties.constructor !== Object) throw new Error('properties must be an Object');
    if (bbox && bbox.length !== 4) throw new Error('bbox must be an Array of 4 numbers');
    if (id && ['string', 'number'].indexOf(typeof id) === -1) throw new Error('id must be a number or a string');

    var feat = {type: 'Feature'};
    if (id) feat.id = id;
    if (bbox) feat.bbox = bbox;
    feat.properties = properties || {};
    feat.geometry = geometry;
    return feat;
}

/**
 * Creates a GeoJSON {@link Geometry} from a Geometry string type & coordinates.
 * For GeometryCollection type use `helpers.geometryCollection`
 *
 * @name geometry
 * @param {string} type Geometry Type
 * @param {Array<number>} coordinates Coordinates
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @returns {Geometry} a GeoJSON Geometry
 * @example
 * var type = 'Point';
 * var coordinates = [110, 50];
 *
 * var geometry = turf.geometry(type, coordinates);
 *
 * //=geometry
 */
function geometry(type, coordinates, bbox) {
    // Validation
    if (!type) throw new Error('type is required');
    if (!coordinates) throw new Error('coordinates is required');
    if (!Array.isArray(coordinates)) throw new Error('coordinates must be an Array');
    if (bbox && bbox.length !== 4) throw new Error('bbox must be an Array of 4 numbers');

    var geom;
    switch (type) {
    case 'Point': geom = point(coordinates).geometry; break;
    case 'LineString': geom = lineString(coordinates).geometry; break;
    case 'Polygon': geom = polygon(coordinates).geometry; break;
    case 'MultiPoint': geom = multiPoint(coordinates).geometry; break;
    case 'MultiLineString': geom = multiLineString(coordinates).geometry; break;
    case 'MultiPolygon': geom = multiPolygon(coordinates).geometry; break;
    default: throw new Error(type + ' is invalid');
    }
    if (bbox) geom.bbox = bbox;
    return geom;
}

/**
 * Takes coordinates and properties (optional) and returns a new {@link Point} feature.
 *
 * @name point
 * @param {Array<number>} coordinates longitude, latitude position (each in decimal degrees)
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<Point>} a Point feature
 * @example
 * var point = turf.point([-75.343, 39.984]);
 *
 * //=point
 */
function point(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');
    if (coordinates.length === undefined) throw new Error('Coordinates must be an array');
    if (coordinates.length < 2) throw new Error('Coordinates must be at least 2 numbers long');
    if (!isNumber(coordinates[0]) || !isNumber(coordinates[1])) throw new Error('Coordinates must contain numbers');

    return feature({
        type: 'Point',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Takes an array of LinearRings and optionally an {@link Object} with properties and returns a {@link Polygon} feature.
 *
 * @name polygon
 * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<Polygon>} a Polygon feature
 * @throws {Error} throw an error if a LinearRing of the polygon has too few positions
 * or if a LinearRing of the Polygon does not have matching Positions at the beginning & end.
 * @example
 * var polygon = turf.polygon([[
 *   [-2.275543, 53.464547],
 *   [-2.275543, 53.489271],
 *   [-2.215118, 53.489271],
 *   [-2.215118, 53.464547],
 *   [-2.275543, 53.464547]
 * ]], { name: 'poly1', population: 400});
 *
 * //=polygon
 */
function polygon(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');

    for (var i = 0; i < coordinates.length; i++) {
        var ring = coordinates[i];
        if (ring.length < 4) {
            throw new Error('Each LinearRing of a Polygon must have 4 or more Positions.');
        }
        for (var j = 0; j < ring[ring.length - 1].length; j++) {
            // Check if first point of Polygon contains two numbers
            if (i === 0 && j === 0 && !isNumber(ring[0][0]) || !isNumber(ring[0][1])) throw new Error('Coordinates must contain numbers');
            if (ring[ring.length - 1][j] !== ring[0][j]) {
                throw new Error('First and last Position are not equivalent.');
            }
        }
    }

    return feature({
        type: 'Polygon',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Creates a {@link LineString} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name lineString
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<LineString>} a LineString feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var linestring1 = turf.lineString([
 *   [-21.964416, 64.148203],
 *   [-21.956176, 64.141316],
 *   [-21.93901, 64.135924],
 *   [-21.927337, 64.136673]
 * ]);
 * var linestring2 = turf.lineString([
 *   [-21.929054, 64.127985],
 *   [-21.912918, 64.134726],
 *   [-21.916007, 64.141016],
 *   [-21.930084, 64.14446]
 * ], {name: 'line 1', distance: 145});
 *
 * //=linestring1
 *
 * //=linestring2
 */
function lineString(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');
    if (coordinates.length < 2) throw new Error('Coordinates must be an array of two or more positions');
    // Check if first point of LineString contains two numbers
    if (!isNumber(coordinates[0][1]) || !isNumber(coordinates[0][1])) throw new Error('Coordinates must contain numbers');

    return feature({
        type: 'LineString',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Takes one or more {@link Feature|Features} and creates a {@link FeatureCollection}.
 *
 * @name featureCollection
 * @param {Feature[]} features input features
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {FeatureCollection} a FeatureCollection of input features
 * @example
 * var features = [
 *  turf.point([-75.343, 39.984], {name: 'Location A'}),
 *  turf.point([-75.833, 39.284], {name: 'Location B'}),
 *  turf.point([-75.534, 39.123], {name: 'Location C'})
 * ];
 *
 * var collection = turf.featureCollection(features);
 *
 * //=collection
 */
function featureCollection(features, bbox, id) {
    if (!features) throw new Error('No features passed');
    if (!Array.isArray(features)) throw new Error('features must be an Array');
    if (bbox && bbox.length !== 4) throw new Error('bbox must be an Array of 4 numbers');
    if (id && ['string', 'number'].indexOf(typeof id) === -1) throw new Error('id must be a number or a string');

    var fc = {type: 'FeatureCollection'};
    if (id) fc.id = id;
    if (bbox) fc.bbox = bbox;
    fc.features = features;
    return fc;
}

/**
 * Creates a {@link Feature<MultiLineString>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiLineString
 * @param {Array<Array<Array<number>>>} coordinates an array of LineStrings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<MultiLineString>} a MultiLineString feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiLine = turf.multiLineString([[[0,0],[10,10]]]);
 *
 * //=multiLine
 */
function multiLineString(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');

    return feature({
        type: 'MultiLineString',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Creates a {@link Feature<MultiPoint>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPoint
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<MultiPoint>} a MultiPoint feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPt = turf.multiPoint([[0,0],[10,10]]);
 *
 * //=multiPt
 */
function multiPoint(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');

    return feature({
        type: 'MultiPoint',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Creates a {@link Feature<MultiPolygon>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPolygon
 * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygons
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<MultiPolygon>} a multipolygon feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPoly = turf.multiPolygon([[[[0,0],[0,10],[10,10],[10,0],[0,0]]]]);
 *
 * //=multiPoly
 *
 */
function multiPolygon(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');

    return feature({
        type: 'MultiPolygon',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Creates a {@link Feature<GeometryCollection>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name geometryCollection
 * @param {Array<Geometry>} geometries an array of GeoJSON Geometries
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<GeometryCollection>} a GeoJSON GeometryCollection Feature
 * @example
 * var pt = {
 *     "type": "Point",
 *       "coordinates": [100, 0]
 *     };
 * var line = {
 *     "type": "LineString",
 *     "coordinates": [ [101, 0], [102, 1] ]
 *   };
 * var collection = turf.geometryCollection([pt, line]);
 *
 * //=collection
 */
function geometryCollection(geometries, properties, bbox, id) {
    if (!geometries) throw new Error('geometries is required');
    if (!Array.isArray(geometries)) throw new Error('geometries must be an Array');

    return feature({
        type: 'GeometryCollection',
        geometries: geometries
    }, properties, bbox, id);
}

/**
 * Round number to precision
 *
 * @param {number} num Number
 * @param {number} [precision=0] Precision
 * @returns {number} rounded number
 * @example
 * turf.round(120.4321)
 * //=120
 *
 * turf.round(120.4321, 2)
 * //=120.43
 */
function round(num, precision) {
    if (num === undefined || num === null || isNaN(num)) throw new Error('num is required');
    if (precision && !(precision >= 0)) throw new Error('precision must be a positive number');
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(num * multiplier) / multiplier;
}

/**
 * Convert a distance measurement (assuming a spherical Earth) from radians to a more friendly unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name radiansToDistance
 * @param {number} radians in radians across the sphere
 * @param {string} [units='kilometers'] can be degrees, radians, miles, or kilometers inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} distance
 */
function radiansToDistance(radians, units) {
    if (radians === undefined || radians === null) throw new Error('radians is required');

    if (units && typeof units !== 'string') throw new Error('units must be a string');
    var factor = factors[units || 'kilometers'];
    if (!factor) throw new Error(units + ' units is invalid');
    return radians * factor;
}

/**
 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into radians
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name distanceToRadians
 * @param {number} distance in real units
 * @param {string} [units='kilometers'] can be degrees, radians, miles, or kilometers inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} radians
 */
function distanceToRadians(distance, units) {
    if (distance === undefined || distance === null) throw new Error('distance is required');

    if (units && typeof units !== 'string') throw new Error('units must be a string');
    var factor = factors[units || 'kilometers'];
    if (!factor) throw new Error(units + ' units is invalid');
    return distance / factor;
}

/**
 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into degrees
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, centimeters, kilometres, feet
 *
 * @name distanceToDegrees
 * @param {number} distance in real units
 * @param {string} [units='kilometers'] can be degrees, radians, miles, or kilometers inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} degrees
 */
function distanceToDegrees(distance, units) {
    return radians2degrees(distanceToRadians(distance, units));
}

/**
 * Converts any bearing angle from the north line direction (positive clockwise)
 * and returns an angle between 0-360 degrees (positive clockwise), 0 being the north line
 *
 * @name bearingToAngle
 * @param {number} bearing angle, between -180 and +180 degrees
 * @returns {number} angle between 0 and 360 degrees
 */
function bearingToAngle(bearing) {
    if (bearing === null || bearing === undefined) throw new Error('bearing is required');

    var angle = bearing % 360;
    if (angle < 0) angle += 360;
    return angle;
}

/**
 * Converts an angle in radians to degrees
 *
 * @name radians2degrees
 * @param {number} radians angle in radians
 * @returns {number} degrees between 0 and 360 degrees
 */
function radians2degrees(radians) {
    if (radians === null || radians === undefined) throw new Error('radians is required');

    var degrees = radians % (2 * Math.PI);
    return degrees * 180 / Math.PI;
}

/**
 * Converts an angle in degrees to radians
 *
 * @name degrees2radians
 * @param {number} degrees angle between 0 and 360 degrees
 * @returns {number} angle in radians
 */
function degrees2radians(degrees) {
    if (degrees === null || degrees === undefined) throw new Error('degrees is required');

    var radians = degrees % 360;
    return radians * Math.PI / 180;
}

/**
 * Converts a distance to the requested unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @param {number} distance to be converted
 * @param {string} originalUnit of the distance
 * @param {string} [finalUnit='kilometers'] returned unit
 * @returns {number} the converted distance
 */
function convertDistance(distance, originalUnit, finalUnit) {
    if (distance === null || distance === undefined) throw new Error('distance is required');
    if (!(distance >= 0)) throw new Error('distance must be a positive number');

    var convertedDistance = radiansToDistance(distanceToRadians(distance, originalUnit), finalUnit || 'kilometers');
    return convertedDistance;
}

/**
 * Converts a area to the requested unit.
 * Valid units: kilometers, kilometres, meters, metres, centimetres, millimeter, acre, mile, yard, foot, inch
 * @param {number} area to be converted
 * @param {string} [originalUnit='meters'] of the distance
 * @param {string} [finalUnit='kilometers'] returned unit
 * @returns {number} the converted distance
 */
function convertArea(area, originalUnit, finalUnit) {
    if (area === null || area === undefined) throw new Error('area is required');
    if (!(area >= 0)) throw new Error('area must be a positive number');

    var startFactor = areaFactors[originalUnit || 'meters'];
    if (!startFactor) throw new Error('invalid original units');

    var finalFactor = areaFactors[finalUnit || 'kilometers'];
    if (!finalFactor) throw new Error('invalid final units');

    return (area / startFactor) * finalFactor;
}

/**
 * isNumber
 *
 * @param {*} num Number to validate
 * @returns {boolean} true/false
 * @example
 * turf.isNumber(123)
 * //=true
 * turf.isNumber('foo')
 * //=false
 */
function isNumber(num) {
    return !isNaN(num) && num !== null && !Array.isArray(num);
}

/**
 * isObject
 *
 * @param {*} input variable to validate
 * @returns {boolean} true/false
 * @example
 * turf.isObject({elevation: 10})
 * //=true
 * turf.isObject('foo')
 * //=false
 */
function isObject(input) {
    return (!!input) && (input.constructor === Object);
}


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

var inside = __webpack_require__(28);
var featureCollection = __webpack_require__(30).featureCollection;

/**
 * Takes a set of {@link Point|points} and a set of {@link Polygon|polygons} and returns the points that fall within the polygons.
 *
 * @name within
 * @param {FeatureCollection<Point>} points input points
 * @param {FeatureCollection<Polygon>} polygons input polygons
 * @returns {FeatureCollection<Point>} points that land within at least one polygon
 * @example
 * var searchWithin = turf.featureCollection([
 *     turf.polygon([[
 *         [-46.653,-23.543],
 *         [-46.634,-23.5346],
 *         [-46.613,-23.543],
 *         [-46.614,-23.559],
 *         [-46.631,-23.567],
 *         [-46.653,-23.560],
 *         [-46.653,-23.543]
 *     ]])
 * ]);
 * var points = turf.featureCollection([
 *     turf.point([-46.6318, -23.5523]),
 *     turf.point([-46.6246, -23.5325]),
 *     turf.point([-46.6062, -23.5513]),
 *     turf.point([-46.663, -23.554]),
 *     turf.point([-46.643, -23.557])
 * ]);
 *
 * var ptsWithin = turf.within(points, searchWithin);
 *
 * //addToMap
 * var addToMap = [points, searchWithin, ptsWithin]
 * turf.featureEach(ptsWithin, function (currentFeature) {
 *   currentFeature.properties['marker-size'] = 'large';
 *   currentFeature.properties['marker-color'] = '#000';
 * });
 */
module.exports = function (points, polygons) {
    var pointsWithin = featureCollection([]);
    for (var i = 0; i < polygons.features.length; i++) {
        for (var j = 0; j < points.features.length; j++) {
            var isInside = inside(points.features[j], polygons.features[i]);
            if (isInside) {
                pointsWithin.features.push(points.features[j]);
            }
        }
    }
    return pointsWithin;
};


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

var invariant = __webpack_require__(29);
var getCoord = invariant.getCoord;
var getCoords = invariant.getCoords;

// http://en.wikipedia.org/wiki/Even%E2%80%93odd_rule
// modified from: https://github.com/substack/point-in-polygon/blob/master/index.js
// which was modified from http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

/**
 * Takes a {@link Point} and a {@link Polygon} or {@link MultiPolygon} and determines if the point resides inside the polygon. The polygon can
 * be convex or concave. The function accounts for holes.
 *
 * @name inside
 * @param {Feature<Point>} point input point
 * @param {Feature<Polygon|MultiPolygon>} polygon input polygon or multipolygon
 * @param {boolean} [ignoreBoundary=false] True if polygon boundary should be ignored when determining if the point is inside the polygon otherwise false.
 * @returns {boolean} `true` if the Point is inside the Polygon; `false` if the Point is not inside the Polygon
 * @example
 * var pt = turf.point([-77, 44]);
 * var poly = turf.polygon([[
 *   [-81, 41],
 *   [-81, 47],
 *   [-72, 47],
 *   [-72, 41],
 *   [-81, 41]
 * ]]);
 *
 * turf.inside(pt, poly);
 * //= true
 */
module.exports = function (point, polygon, ignoreBoundary) {
    // validation
    if (!point) throw new Error('point is required');
    if (!polygon) throw new Error('polygon is required');

    var pt = getCoord(point);
    var polys = getCoords(polygon);
    var type = (polygon.geometry) ? polygon.geometry.type : polygon.type;
    var bbox = polygon.bbox;

    // Quick elimination if point is not inside bbox
    if (bbox && inBBox(pt, bbox) === false) return false;

    // normalize to multipolygon
    if (type === 'Polygon') polys = [polys];

    for (var i = 0, insidePoly = false; i < polys.length && !insidePoly; i++) {
        // check if it is in the outer ring first
        if (inRing(pt, polys[i][0], ignoreBoundary)) {
            var inHole = false;
            var k = 1;
            // check for the point in any of the holes
            while (k < polys[i].length && !inHole) {
                if (inRing(pt, polys[i][k], !ignoreBoundary)) {
                    inHole = true;
                }
                k++;
            }
            if (!inHole) insidePoly = true;
        }
    }
    return insidePoly;
};

/**
 * inRing
 *
 * @private
 * @param {[number, number]} pt [x,y]
 * @param {Array<[number, number]>} ring [[x,y], [x,y],..]
 * @param {boolean} ignoreBoundary ignoreBoundary
 * @returns {boolean} inRing
 */
function inRing(pt, ring, ignoreBoundary) {
    var isInside = false;
    if (ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]) ring = ring.slice(0, ring.length - 1);

    for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        var xi = ring[i][0], yi = ring[i][1];
        var xj = ring[j][0], yj = ring[j][1];
        var onBoundary = (pt[1] * (xi - xj) + yi * (xj - pt[0]) + yj * (pt[0] - xi) === 0) &&
            ((xi - pt[0]) * (xj - pt[0]) <= 0) && ((yi - pt[1]) * (yj - pt[1]) <= 0);
        if (onBoundary) return !ignoreBoundary;
        var intersect = ((yi > pt[1]) !== (yj > pt[1])) &&
        (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi);
        if (intersect) isInside = !isInside;
    }
    return isInside;
}

/**
 * inBBox
 *
 * @private
 * @param {[number, number]} pt point [x,y]
 * @param {[number, number, number, number]} bbox BBox [west, south, east, north]
 * @returns {boolean} true/false if point is inside BBox
 */
function inBBox(pt, bbox) {
    return bbox[0] <= pt[0] &&
           bbox[1] <= pt[1] &&
           bbox[2] >= pt[0] &&
           bbox[3] >= pt[1];
}


/***/ }),
/* 29 */
/***/ (function(module, exports) {

/**
 * Unwrap a coordinate from a Point Feature, Geometry or a single coordinate.
 *
 * @name getCoord
 * @param {Array<number>|Geometry<Point>|Feature<Point>} obj Object
 * @returns {Array<number>} coordinates
 * @example
 * var pt = turf.point([10, 10]);
 *
 * var coord = turf.getCoord(pt);
 * //= [10, 10]
 */
function getCoord(obj) {
    if (!obj) throw new Error('obj is required');

    var coordinates = getCoords(obj);

    // getCoord() must contain at least two numbers (Point)
    if (coordinates.length > 1 &&
        typeof coordinates[0] === 'number' &&
        typeof coordinates[1] === 'number') {
        return coordinates;
    } else {
        throw new Error('Coordinate is not a valid Point');
    }
}

/**
 * Unwrap coordinates from a Feature, Geometry Object or an Array of numbers
 *
 * @name getCoords
 * @param {Array<number>|Geometry|Feature} obj Object
 * @returns {Array<number>} coordinates
 * @example
 * var poly = turf.polygon([[[119.32, -8.7], [119.55, -8.69], [119.51, -8.54], [119.32, -8.7]]]);
 *
 * var coord = turf.getCoords(poly);
 * //= [[[119.32, -8.7], [119.55, -8.69], [119.51, -8.54], [119.32, -8.7]]]
 */
function getCoords(obj) {
    if (!obj) throw new Error('obj is required');
    var coordinates;

    // Array of numbers
    if (obj.length) {
        coordinates = obj;

    // Geometry Object
    } else if (obj.coordinates) {
        coordinates = obj.coordinates;

    // Feature
    } else if (obj.geometry && obj.geometry.coordinates) {
        coordinates = obj.geometry.coordinates;
    }
    // Checks if coordinates contains a number
    if (coordinates) {
        containsNumber(coordinates);
        return coordinates;
    }
    throw new Error('No valid coordinates');
}

/**
 * Checks if coordinates contains a number
 *
 * @name containsNumber
 * @param {Array<any>} coordinates GeoJSON Coordinates
 * @returns {boolean} true if Array contains a number
 */
function containsNumber(coordinates) {
    if (coordinates.length > 1 &&
        typeof coordinates[0] === 'number' &&
        typeof coordinates[1] === 'number') {
        return true;
    }

    if (Array.isArray(coordinates[0]) && coordinates[0].length) {
        return containsNumber(coordinates[0]);
    }
    throw new Error('coordinates must only contain numbers');
}

/**
 * Enforce expectations about types of GeoJSON objects for Turf.
 *
 * @name geojsonType
 * @param {GeoJSON} value any GeoJSON object
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} if value is not the expected type.
 */
function geojsonType(value, type, name) {
    if (!type || !name) throw new Error('type and name required');

    if (!value || value.type !== type) {
        throw new Error('Invalid input to ' + name + ': must be a ' + type + ', given ' + value.type);
    }
}

/**
 * Enforce expectations about types of {@link Feature} inputs for Turf.
 * Internally this uses {@link geojsonType} to judge geometry types.
 *
 * @name featureOf
 * @param {Feature} feature a feature with an expected geometry type
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} error if value is not the expected type.
 */
function featureOf(feature, type, name) {
    if (!feature) throw new Error('No feature passed');
    if (!name) throw new Error('.featureOf() requires a name');
    if (!feature || feature.type !== 'Feature' || !feature.geometry) {
        throw new Error('Invalid input to ' + name + ', Feature with geometry required');
    }
    if (!feature.geometry || feature.geometry.type !== type) {
        throw new Error('Invalid input to ' + name + ': must be a ' + type + ', given ' + feature.geometry.type);
    }
}

/**
 * Enforce expectations about types of {@link FeatureCollection} inputs for Turf.
 * Internally this uses {@link geojsonType} to judge geometry types.
 *
 * @name collectionOf
 * @param {FeatureCollection} featureCollection a FeatureCollection for which features will be judged
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} if value is not the expected type.
 */
function collectionOf(featureCollection, type, name) {
    if (!featureCollection) throw new Error('No featureCollection passed');
    if (!name) throw new Error('.collectionOf() requires a name');
    if (!featureCollection || featureCollection.type !== 'FeatureCollection') {
        throw new Error('Invalid input to ' + name + ', FeatureCollection required');
    }
    for (var i = 0; i < featureCollection.features.length; i++) {
        var feature = featureCollection.features[i];
        if (!feature || feature.type !== 'Feature' || !feature.geometry) {
            throw new Error('Invalid input to ' + name + ', Feature with geometry required');
        }
        if (!feature.geometry || feature.geometry.type !== type) {
            throw new Error('Invalid input to ' + name + ': must be a ' + type + ', given ' + feature.geometry.type);
        }
    }
}

/**
 * Get Geometry from Feature or Geometry Object
 *
 * @param {Feature|Geometry} geojson GeoJSON Feature or Geometry Object
 * @returns {Geometry|null} GeoJSON Geometry Object
 * @throws {Error} if geojson is not a Feature or Geometry Object
 * @example
 * var point = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [110, 40]
 *   }
 * }
 * var geom = turf.getGeom(point)
 * //={"type": "Point", "coordinates": [110, 40]}
 */
function getGeom(geojson) {
    if (!geojson) throw new Error('geojson is required');
    if (geojson.geometry !== undefined) return geojson.geometry;
    if (geojson.coordinates || geojson.geometries) return geojson;
    throw new Error('geojson must be a valid Feature or Geometry Object');
}

/**
 * Get Geometry Type from Feature or Geometry Object
 *
 * @param {Feature|Geometry} geojson GeoJSON Feature or Geometry Object
 * @returns {string} GeoJSON Geometry Type
 * @throws {Error} if geojson is not a Feature or Geometry Object
 * @example
 * var point = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [110, 40]
 *   }
 * }
 * var geom = turf.getGeomType(point)
 * //="Point"
 */
function getGeomType(geojson) {
    if (!geojson) throw new Error('geojson is required');
    var geom = getGeom(geojson);
    if (geom) return geom.type;
}

module.exports = {
    geojsonType: geojsonType,
    collectionOf: collectionOf,
    featureOf: featureOf,
    getCoord: getCoord,
    getCoords: getCoords,
    containsNumber: containsNumber,
    getGeom: getGeom,
    getGeomType: getGeomType
};


/***/ }),
/* 30 */
/***/ (function(module, exports) {

/**
 * Wraps a GeoJSON {@link Geometry} in a GeoJSON {@link Feature}.
 *
 * @name feature
 * @param {Geometry} geometry input geometry
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature} a GeoJSON Feature
 * @example
 * var geometry = {
 *   "type": "Point",
 *   "coordinates": [110, 50]
 * };
 *
 * var feature = turf.feature(geometry);
 *
 * //=feature
 */
function feature(geometry, properties, bbox, id) {
    if (geometry === undefined) throw new Error('geometry is required');
    if (properties && properties.constructor !== Object) throw new Error('properties must be an Object');
    if (bbox && bbox.length !== 4) throw new Error('bbox must be an Array of 4 numbers');
    if (id && ['string', 'number'].indexOf(typeof id) === -1) throw new Error('id must be a number or a string');

    var feat = {type: 'Feature'};
    if (id) feat.id = id;
    if (bbox) feat.bbox = bbox;
    feat.properties = properties || {};
    feat.geometry = geometry;
    return feat;
}

/**
 * Creates a GeoJSON {@link Geometry} from a Geometry string type & coordinates.
 * For GeometryCollection type use `helpers.geometryCollection`
 *
 * @name geometry
 * @param {string} type Geometry Type
 * @param {Array<number>} coordinates Coordinates
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @returns {Geometry} a GeoJSON Geometry
 * @example
 * var type = 'Point';
 * var coordinates = [110, 50];
 *
 * var geometry = turf.geometry(type, coordinates);
 *
 * //=geometry
 */
function geometry(type, coordinates, bbox) {
    // Validation
    if (!type) throw new Error('type is required');
    if (!coordinates) throw new Error('coordinates is required');
    if (!Array.isArray(coordinates)) throw new Error('coordinates must be an Array');
    if (bbox && bbox.length !== 4) throw new Error('bbox must be an Array of 4 numbers');

    var geom;
    switch (type) {
    case 'Point': geom = point(coordinates).geometry; break;
    case 'LineString': geom = lineString(coordinates).geometry; break;
    case 'Polygon': geom = polygon(coordinates).geometry; break;
    case 'MultiPoint': geom = multiPoint(coordinates).geometry; break;
    case 'MultiLineString': geom = multiLineString(coordinates).geometry; break;
    case 'MultiPolygon': geom = multiPolygon(coordinates).geometry; break;
    default: throw new Error(type + ' is invalid');
    }
    if (bbox) geom.bbox = bbox;
    return geom;
}

/**
 * Takes coordinates and properties (optional) and returns a new {@link Point} feature.
 *
 * @name point
 * @param {Array<number>} coordinates longitude, latitude position (each in decimal degrees)
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<Point>} a Point feature
 * @example
 * var point = turf.point([-75.343, 39.984]);
 *
 * //=point
 */
function point(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');
    if (coordinates.length === undefined) throw new Error('Coordinates must be an array');
    if (coordinates.length < 2) throw new Error('Coordinates must be at least 2 numbers long');
    if (!isNumber(coordinates[0]) || !isNumber(coordinates[1])) throw new Error('Coordinates must contain numbers');

    return feature({
        type: 'Point',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Takes an array of LinearRings and optionally an {@link Object} with properties and returns a {@link Polygon} feature.
 *
 * @name polygon
 * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<Polygon>} a Polygon feature
 * @throws {Error} throw an error if a LinearRing of the polygon has too few positions
 * or if a LinearRing of the Polygon does not have matching Positions at the beginning & end.
 * @example
 * var polygon = turf.polygon([[
 *   [-2.275543, 53.464547],
 *   [-2.275543, 53.489271],
 *   [-2.215118, 53.489271],
 *   [-2.215118, 53.464547],
 *   [-2.275543, 53.464547]
 * ]], { name: 'poly1', population: 400});
 *
 * //=polygon
 */
function polygon(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');

    for (var i = 0; i < coordinates.length; i++) {
        var ring = coordinates[i];
        if (ring.length < 4) {
            throw new Error('Each LinearRing of a Polygon must have 4 or more Positions.');
        }
        for (var j = 0; j < ring[ring.length - 1].length; j++) {
            // Check if first point of Polygon contains two numbers
            if (i === 0 && j === 0 && !isNumber(ring[0][0]) || !isNumber(ring[0][1])) throw new Error('Coordinates must contain numbers');
            if (ring[ring.length - 1][j] !== ring[0][j]) {
                throw new Error('First and last Position are not equivalent.');
            }
        }
    }

    return feature({
        type: 'Polygon',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Creates a {@link LineString} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name lineString
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<LineString>} a LineString feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var linestring1 = turf.lineString([
 *   [-21.964416, 64.148203],
 *   [-21.956176, 64.141316],
 *   [-21.93901, 64.135924],
 *   [-21.927337, 64.136673]
 * ]);
 * var linestring2 = turf.lineString([
 *   [-21.929054, 64.127985],
 *   [-21.912918, 64.134726],
 *   [-21.916007, 64.141016],
 *   [-21.930084, 64.14446]
 * ], {name: 'line 1', distance: 145});
 *
 * //=linestring1
 *
 * //=linestring2
 */
function lineString(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');
    if (coordinates.length < 2) throw new Error('Coordinates must be an array of two or more positions');
    // Check if first point of LineString contains two numbers
    if (!isNumber(coordinates[0][1]) || !isNumber(coordinates[0][1])) throw new Error('Coordinates must contain numbers');

    return feature({
        type: 'LineString',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Takes one or more {@link Feature|Features} and creates a {@link FeatureCollection}.
 *
 * @name featureCollection
 * @param {Feature[]} features input features
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {FeatureCollection} a FeatureCollection of input features
 * @example
 * var features = [
 *  turf.point([-75.343, 39.984], {name: 'Location A'}),
 *  turf.point([-75.833, 39.284], {name: 'Location B'}),
 *  turf.point([-75.534, 39.123], {name: 'Location C'})
 * ];
 *
 * var collection = turf.featureCollection(features);
 *
 * //=collection
 */
function featureCollection(features, bbox, id) {
    if (!features) throw new Error('No features passed');
    if (!Array.isArray(features)) throw new Error('features must be an Array');
    if (bbox && bbox.length !== 4) throw new Error('bbox must be an Array of 4 numbers');
    if (id && ['string', 'number'].indexOf(typeof id) === -1) throw new Error('id must be a number or a string');

    var fc = {type: 'FeatureCollection'};
    if (id) fc.id = id;
    if (bbox) fc.bbox = bbox;
    fc.features = features;
    return fc;
}

/**
 * Creates a {@link Feature<MultiLineString>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiLineString
 * @param {Array<Array<Array<number>>>} coordinates an array of LineStrings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<MultiLineString>} a MultiLineString feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiLine = turf.multiLineString([[[0,0],[10,10]]]);
 *
 * //=multiLine
 */
function multiLineString(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');

    return feature({
        type: 'MultiLineString',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Creates a {@link Feature<MultiPoint>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPoint
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<MultiPoint>} a MultiPoint feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPt = turf.multiPoint([[0,0],[10,10]]);
 *
 * //=multiPt
 */
function multiPoint(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');

    return feature({
        type: 'MultiPoint',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Creates a {@link Feature<MultiPolygon>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPolygon
 * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygons
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<MultiPolygon>} a multipolygon feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPoly = turf.multiPolygon([[[[0,0],[0,10],[10,10],[10,0],[0,0]]]]);
 *
 * //=multiPoly
 *
 */
function multiPolygon(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');

    return feature({
        type: 'MultiPolygon',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Creates a {@link Feature<GeometryCollection>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name geometryCollection
 * @param {Array<Geometry>} geometries an array of GeoJSON Geometries
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<GeometryCollection>} a GeoJSON GeometryCollection Feature
 * @example
 * var pt = {
 *     "type": "Point",
 *       "coordinates": [100, 0]
 *     };
 * var line = {
 *     "type": "LineString",
 *     "coordinates": [ [101, 0], [102, 1] ]
 *   };
 * var collection = turf.geometryCollection([pt, line]);
 *
 * //=collection
 */
function geometryCollection(geometries, properties, bbox, id) {
    if (!geometries) throw new Error('geometries is required');
    if (!Array.isArray(geometries)) throw new Error('geometries must be an Array');

    return feature({
        type: 'GeometryCollection',
        geometries: geometries
    }, properties, bbox, id);
}

// https://en.wikipedia.org/wiki/Great-circle_distance#Radius_for_spherical_Earth
var factors = {
    miles: 3960,
    nauticalmiles: 3441.145,
    degrees: 57.2957795,
    radians: 1,
    inches: 250905600,
    yards: 6969600,
    meters: 6373000,
    metres: 6373000,
    centimeters: 6.373e+8,
    centimetres: 6.373e+8,
    kilometers: 6373,
    kilometres: 6373,
    feet: 20908792.65
};

var areaFactors = {
    kilometers: 0.000001,
    kilometres: 0.000001,
    meters: 1,
    metres: 1,
    centimetres: 10000,
    millimeter: 1000000,
    acres: 0.000247105,
    miles: 3.86e-7,
    yards: 1.195990046,
    feet: 10.763910417,
    inches: 1550.003100006
};
/**
 * Round number to precision
 *
 * @param {number} num Number
 * @param {number} [precision=0] Precision
 * @returns {number} rounded number
 * @example
 * turf.round(120.4321)
 * //=120
 *
 * turf.round(120.4321, 2)
 * //=120.43
 */
function round(num, precision) {
    if (num === undefined || num === null || isNaN(num)) throw new Error('num is required');
    if (precision && !(precision >= 0)) throw new Error('precision must be a positive number');
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(num * multiplier) / multiplier;
}

/**
 * Convert a distance measurement (assuming a spherical Earth) from radians to a more friendly unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name radiansToDistance
 * @param {number} radians in radians across the sphere
 * @param {string} [units=kilometers] can be degrees, radians, miles, or kilometers inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} distance
 */
function radiansToDistance(radians, units) {
    if (radians === undefined || radians === null) throw new Error('radians is required');

    var factor = factors[units || 'kilometers'];
    if (!factor) throw new Error('units is invalid');
    return radians * factor;
}

/**
 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into radians
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name distanceToRadians
 * @param {number} distance in real units
 * @param {string} [units=kilometers] can be degrees, radians, miles, or kilometers inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} radians
 */
function distanceToRadians(distance, units) {
    if (distance === undefined || distance === null) throw new Error('distance is required');

    var factor = factors[units || 'kilometers'];
    if (!factor) throw new Error('units is invalid');
    return distance / factor;
}

/**
 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into degrees
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, centimeters, kilometres, feet
 *
 * @name distanceToDegrees
 * @param {number} distance in real units
 * @param {string} [units=kilometers] can be degrees, radians, miles, or kilometers inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} degrees
 */
function distanceToDegrees(distance, units) {
    return radians2degrees(distanceToRadians(distance, units));
}

/**
 * Converts any bearing angle from the north line direction (positive clockwise)
 * and returns an angle between 0-360 degrees (positive clockwise), 0 being the north line
 *
 * @name bearingToAngle
 * @param {number} bearing angle, between -180 and +180 degrees
 * @returns {number} angle between 0 and 360 degrees
 */
function bearingToAngle(bearing) {
    if (bearing === null || bearing === undefined) throw new Error('bearing is required');

    var angle = bearing % 360;
    if (angle < 0) angle += 360;
    return angle;
}

/**
 * Converts an angle in radians to degrees
 *
 * @name radians2degrees
 * @param {number} radians angle in radians
 * @returns {number} degrees between 0 and 360 degrees
 */
function radians2degrees(radians) {
    if (radians === null || radians === undefined) throw new Error('radians is required');

    var degrees = radians % (2 * Math.PI);
    return degrees * 180 / Math.PI;
}

/**
 * Converts an angle in degrees to radians
 *
 * @name degrees2radians
 * @param {number} degrees angle between 0 and 360 degrees
 * @returns {number} angle in radians
 */
function degrees2radians(degrees) {
    if (degrees === null || degrees === undefined) throw new Error('degrees is required');

    var radians = degrees % 360;
    return radians * Math.PI / 180;
}


/**
 * Converts a distance to the requested unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @param {number} distance to be converted
 * @param {string} originalUnit of the distance
 * @param {string} [finalUnit=kilometers] returned unit
 * @returns {number} the converted distance
 */
function convertDistance(distance, originalUnit, finalUnit) {
    if (distance === null || distance === undefined) throw new Error('distance is required');
    if (!(distance >= 0)) throw new Error('distance must be a positive number');

    var convertedDistance = radiansToDistance(distanceToRadians(distance, originalUnit), finalUnit || 'kilometers');
    return convertedDistance;
}

/**
 * Converts a area to the requested unit.
 * Valid units: kilometers, kilometres, meters, metres, centimetres, millimeter, acre, mile, yard, foot, inch
 * @param {number} area to be converted
 * @param {string} [originalUnit=meters] of the distance
 * @param {string} [finalUnit=kilometers] returned unit
 * @returns {number} the converted distance
 */
function convertArea(area, originalUnit, finalUnit) {
    if (area === null || area === undefined) throw new Error('area is required');
    if (!(area >= 0)) throw new Error('area must be a positive number');

    var startFactor = areaFactors[originalUnit || 'meters'];
    if (!startFactor) throw new Error('invalid original units');

    var finalFactor = areaFactors[finalUnit || 'kilometers'];
    if (!finalFactor) throw new Error('invalid final units');

    return (area / startFactor) * finalFactor;
}

/**
 * isNumber
 *
 * @param {*} num Number to validate
 * @returns {boolean} true/false
 * @example
 * turf.isNumber(123)
 * //=true
 * turf.isNumber('foo')
 * //=false
 */
function isNumber(num) {
    return !isNaN(num) && num !== null && !Array.isArray(num);
}

module.exports = {
    feature: feature,
    geometry: geometry,
    featureCollection: featureCollection,
    geometryCollection: geometryCollection,
    point: point,
    multiPoint: multiPoint,
    lineString: lineString,
    multiLineString: multiLineString,
    polygon: polygon,
    multiPolygon: multiPolygon,
    radiansToDistance: radiansToDistance,
    distanceToRadians: distanceToRadians,
    distanceToDegrees: distanceToDegrees,
    radians2degrees: radians2degrees,
    degrees2radians: degrees2radians,
    bearingToAngle: bearingToAngle,
    convertDistance: convertDistance,
    convertArea: convertArea,
    round: round,
    isNumber: isNumber
};


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _config = __webpack_require__(2);

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// because we can't easily grab data from map, and
// querySourceFeatures only returns things that are within view.
var StationFeed = function StationFeed() {
  _classCallCheck(this, StationFeed);

  var stations = [];

  // returns geojson
  this.getStations = function getStations() {
    return stations;
  };

  // returns array
  this.getStationsArray = function getStationsArray() {
    return stations.features ? stations.features : [];
  };
  // const setStations = function setStations(data) { stations = data; }
  // function setStations(data) { stations = data; }

  var doFetch = function doFetch() {
    fetch(_config2.default.stationsUrl).then(function (resp) {
      return resp.json();
    }).then(function (data) {
      // console.log('fetched stations: ', data);
      stations = data;
      // setStations(data);
    });
  };

  doFetch();
  window.setTimeout(doFetch, 30 /* seconds */ * 1000);
};

var feed = new StationFeed();
exports.default = feed; // export singleton

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getPopupContent;
/**
 * Get URL for Google directions to or from a given place.
 * @param {*} dir - either 'to' (default) or 'from'
 * @param {*} addr - address
 * @param {*} lat - latitude
 * @param {*} lng - longitude
 */
function getDirectionsLink() {
  var toAddr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var fromAddr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var toLat = arguments[2];
  var toLng = arguments[3];

  // TODO / BUG: "addresses" with a '/' in them don't work, like
  // "Civic Center/UN Plaza BART Station (Market St at McAllister St)" - currently that results
  // in directions from civic center to UN plaza (b/c g-maps separates locations with a '/')
  var baseURL = 'https://www.google.com/maps/dir';
  var coords = toLat ? toLat + ',' + toLng + ',' : '';
  var zoom = 17;
  return baseURL + '/' + fromAddr + '/' + toAddr + '/@' + coords + zoom + '/';
  // Google maps expects addresses with name first, then plus-separated components like this:
  // Noisebridge,+2169+Mission+St,+San+Francisco,+CA+94110
}

/**
 * Get HTML content describing a station.
 * @param station - one station from the API
 */
function getPopupContent(station) {
  var _station$properties = station.properties,
      addr = _station$properties.stAddress1,
      lat = _station$properties.latitude,
      lng = _station$properties.longitude,
      bikes = _station$properties.availableBikes,
      docks = _station$properties.availableDocks,
      status = _station$properties.statusValue;

  var directionsURL = getDirectionsLink(addr, undefined, lat, lng);
  var round = function round(n) {
    return Number(n).toFixed(2);
  };

  var alertMsg = status === 'Not In Service' ? '<div class="station-popup--alert">' + status + '</div>' : '';

  return '\n    <div class="station-popup">\n      <h3>' + addr + '</h3>\n      ' + alertMsg + '\n      <div class="columns station-popup--stats">\n        <div class="column station-popup--bikes">\n          <div class="station-popup--bikes-number">' + bikes + '</div>\n          <div class="station-popup--bikes-text">bikes</div>\n        </div>\n        <div class="column station-popup--docks">\n          <div class="station-popup--docks-number">' + docks + '</div>\n          <div class="station-popup--docks-text">docks</div>\n        </div>\n      </div>\n      <div class="station-popup--directions">\n        <a rel="noopener noreferrer" target="_blank" href="' + directionsURL + '">Directions to here</a>\n      </div>\n      <div class="station-popup--coordinates">Lat/Long: <abbr title="' + lat + ', ' + lng + '">' + round(lat) + ', ' + round(lng) + '</abbr></div>\n    </div>';
}

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = userGeolocate;

var _state = __webpack_require__(0);

var _state2 = _interopRequireDefault(_state);

var _userReverseGeocode = __webpack_require__(6);

var _userReverseGeocode2 = _interopRequireDefault(_userReverseGeocode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function userGeolocate(position) {
  // console.log('coords: ', position.coords);
  var _position$coords = position.coords,
      latitude = _position$coords.latitude,
      longitude = _position$coords.longitude;

  _state2.default.user.latitude = latitude;
  _state2.default.user.longitude = longitude;
  (0, _userReverseGeocode2.default)();
}

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * @module mapbox-geocoding
 */
var request = __webpack_require__(35);
// var request = require('request');
// var request = function() {};

var BASE_URL = 'https://api.mapbox.com/geocoding/v5/';
var ACCESS_TOKEN = null;
var CENTER = null;
var BBOX = null;

/**
 * Constracts the geocode/reverse geocode url for the query to mapbox.
 *
 * @param  {string}   dataset - The mapbox dataset ('mapbox.places' or 'mapbox.places-permanent')
 * @param  {string}   address - The address to geocode
 * @param  {Function} done    - Callback function with an error and the returned data as parameter
 */
var __geocodeQuery = function (dataset, query, done) {
    if (!ACCESS_TOKEN) {
        return done('You have to set your mapbox public access token first.');
    }

    if (!dataset) {
        return done('A mapbox dataset is required.');
    }

    if (!query) {
        return done('You have to specify the location to geocode.');
    }

    var url = BASE_URL +
              dataset + '/' +
              query + '.json' +
              '?access_token=' + ACCESS_TOKEN +
              '&country=US' +
              (BBOX ? `&bbox=${BBOX}` : '') + // minX,minY,maxX,maxY
              (CENTER ? `&${CENTER[0]},${CENTER[1]}` : '');


    // fetch(url)
    //     .then(resp => {
    //         if (resp.status !== 200) {
    //             resp.json().then(data => {
    //                 return done('Invalid Response', data);
    //             });
    //         } else {
    //             resp.json().then(data => {
    //                 done(null, data);
    //             });
    //         }
    //     )
    //     .catch(error) {
    //         done(error);
    //     }

    // reimplemented above w/o request because it's huge
    request(url , function (err, response, body) {
        if (err || response.statusCode !== 200) {
            return done(err || JSON.parse(body));
        }

        done(null, JSON.parse(body));
    });
};

module.exports = {
    /**
     * Sets the mapbox access token with the given one.
     *
     * @param {string} accessToken - The mapbox public access token
     */
    setAccessToken: function (accessToken) {
        ACCESS_TOKEN = accessToken;
    },

    /**
     * Sets the location to use for proximity geocoding search.
     * @param {[longitude, latitude]}
     *
     */
    setSearchCenter: function (center) {
        CENTER = center;
    },

    setSearchBounds: function (bbox) {
        BBOX = bbox;
    },

    /**
     * Geocodes the given address.
     *
     * @param  {string}   dataset - The mapbox dataset ('mapbox.places' or 'mapbox.places-permanent')
     * @param  {string}   address - The address to geocode
     * @param  {Function} done    - Callback function with an error and the returned data as parameter
     */
    geocode: function (dataset, address, done) {
        __geocodeQuery(dataset, address, done);
    },

    /**
     * Reverse geocodes the given longitude and latitude.
     *
     * @param  {string}   dataset - The mapbox dataset ('mapbox.places' or 'mapbox.places-permanent')
     * @param  {string}   address - The address to geocode
     * @param  {Function} done    - Callback function with an error and the returned data as parameter
     */
    reverseGeocode: function (dataset, lng, lat, done) {
        var query = lng + ',' + lat;

        __geocodeQuery(dataset, query, done);
    }
};


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// Browser Request
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// UMD HEADER START 
(function (root, factory) {
    if (true) {
        // AMD. Register as an anonymous module.
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
  }
}(this, function () {
// UMD HEADER END

var XHR = XMLHttpRequest
if (!XHR) throw new Error('missing XMLHttpRequest')
request.log = {
  'trace': noop, 'debug': noop, 'info': noop, 'warn': noop, 'error': noop
}

var DEFAULT_TIMEOUT = 3 * 60 * 1000 // 3 minutes

//
// request
//

function request(options, callback) {
  // The entry-point to the API: prep the options object and pass the real work to run_xhr.
  if(typeof callback !== 'function')
    throw new Error('Bad callback given: ' + callback)

  if(!options)
    throw new Error('No options given')

  var options_onResponse = options.onResponse; // Save this for later.

  if(typeof options === 'string')
    options = {'uri':options};
  else
    options = JSON.parse(JSON.stringify(options)); // Use a duplicate for mutating.

  options.onResponse = options_onResponse // And put it back.

  if (options.verbose) request.log = getLogger();

  if(options.url) {
    options.uri = options.url;
    delete options.url;
  }

  if(!options.uri && options.uri !== "")
    throw new Error("options.uri is a required argument");

  if(typeof options.uri != "string")
    throw new Error("options.uri must be a string");

  var unsupported_options = ['proxy', '_redirectsFollowed', 'maxRedirects', 'followRedirect']
  for (var i = 0; i < unsupported_options.length; i++)
    if(options[ unsupported_options[i] ])
      throw new Error("options." + unsupported_options[i] + " is not supported")

  options.callback = callback
  options.method = options.method || 'GET';
  options.headers = options.headers || {};
  options.body    = options.body || null
  options.timeout = options.timeout || request.DEFAULT_TIMEOUT

  if(options.headers.host)
    throw new Error("Options.headers.host is not supported");

  if(options.json) {
    options.headers.accept = options.headers.accept || 'application/json'
    if(options.method !== 'GET')
      options.headers['content-type'] = 'application/json'

    if(typeof options.json !== 'boolean')
      options.body = JSON.stringify(options.json)
    else if(typeof options.body !== 'string')
      options.body = JSON.stringify(options.body)
  }
  
  //BEGIN QS Hack
  var serialize = function(obj) {
    var str = [];
    for(var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  }
  
  if(options.qs){
    var qs = (typeof options.qs == 'string')? options.qs : serialize(options.qs);
    if(options.uri.indexOf('?') !== -1){ //no get params
        options.uri = options.uri+'&'+qs;
    }else{ //existing get params
        options.uri = options.uri+'?'+qs;
    }
  }
  //END QS Hack
  
  //BEGIN FORM Hack
  var multipart = function(obj) {
    //todo: support file type (useful?)
    var result = {};
    result.boundry = '-------------------------------'+Math.floor(Math.random()*1000000000);
    var lines = [];
    for(var p in obj){
        if (obj.hasOwnProperty(p)) {
            lines.push(
                '--'+result.boundry+"\n"+
                'Content-Disposition: form-data; name="'+p+'"'+"\n"+
                "\n"+
                obj[p]+"\n"
            );
        }
    }
    lines.push( '--'+result.boundry+'--' );
    result.body = lines.join('');
    result.length = result.body.length;
    result.type = 'multipart/form-data; boundary='+result.boundry;
    return result;
  }
  
  if(options.form){
    if(typeof options.form == 'string') throw('form name unsupported');
    if(options.method === 'POST'){
        var encoding = (options.encoding || 'application/x-www-form-urlencoded').toLowerCase();
        options.headers['content-type'] = encoding;
        switch(encoding){
            case 'application/x-www-form-urlencoded':
                options.body = serialize(options.form).replace(/%20/g, "+");
                break;
            case 'multipart/form-data':
                var multi = multipart(options.form);
                //options.headers['content-length'] = multi.length;
                options.body = multi.body;
                options.headers['content-type'] = multi.type;
                break;
            default : throw new Error('unsupported encoding:'+encoding);
        }
    }
  }
  //END FORM Hack

  // If onResponse is boolean true, call back immediately when the response is known,
  // not when the full request is complete.
  options.onResponse = options.onResponse || noop
  if(options.onResponse === true) {
    options.onResponse = callback
    options.callback = noop
  }

  // XXX Browsers do not like this.
  //if(options.body)
  //  options.headers['content-length'] = options.body.length;

  // HTTP basic authentication
  if(!options.headers.authorization && options.auth)
    options.headers.authorization = 'Basic ' + b64_enc(options.auth.username + ':' + options.auth.password);

  return run_xhr(options)
}

var req_seq = 0
function run_xhr(options) {
  var xhr = new XHR
    , timed_out = false
    , is_cors = is_crossDomain(options.uri)
    , supports_cors = ('withCredentials' in xhr)

  req_seq += 1
  xhr.seq_id = req_seq
  xhr.id = req_seq + ': ' + options.method + ' ' + options.uri
  xhr._id = xhr.id // I know I will type "_id" from habit all the time.

  if(is_cors && !supports_cors) {
    var cors_err = new Error('Browser does not support cross-origin request: ' + options.uri)
    cors_err.cors = 'unsupported'
    return options.callback(cors_err, xhr)
  }

  xhr.timeoutTimer = setTimeout(too_late, options.timeout)
  function too_late() {
    timed_out = true
    var er = new Error('ETIMEDOUT')
    er.code = 'ETIMEDOUT'
    er.duration = options.timeout

    request.log.error('Timeout', { 'id':xhr._id, 'milliseconds':options.timeout })
    return options.callback(er, xhr)
  }

  // Some states can be skipped over, so remember what is still incomplete.
  var did = {'response':false, 'loading':false, 'end':false}

  xhr.onreadystatechange = on_state_change
  xhr.open(options.method, options.uri, true) // asynchronous
  if(is_cors)
    xhr.withCredentials = !! options.withCredentials
  xhr.send(options.body)
  return xhr

  function on_state_change(event) {
    if(timed_out)
      return request.log.debug('Ignoring timed out state change', {'state':xhr.readyState, 'id':xhr.id})

    request.log.debug('State change', {'state':xhr.readyState, 'id':xhr.id, 'timed_out':timed_out})

    if(xhr.readyState === XHR.OPENED) {
      request.log.debug('Request started', {'id':xhr.id})
      for (var key in options.headers)
        xhr.setRequestHeader(key, options.headers[key])
    }

    else if(xhr.readyState === XHR.HEADERS_RECEIVED)
      on_response()

    else if(xhr.readyState === XHR.LOADING) {
      on_response()
      on_loading()
    }

    else if(xhr.readyState === XHR.DONE) {
      on_response()
      on_loading()
      on_end()
    }
  }

  function on_response() {
    if(did.response)
      return

    did.response = true
    request.log.debug('Got response', {'id':xhr.id, 'status':xhr.status})
    clearTimeout(xhr.timeoutTimer)
    xhr.statusCode = xhr.status // Node request compatibility

    // Detect failed CORS requests.
    if(is_cors && xhr.statusCode == 0) {
      var cors_err = new Error('CORS request rejected: ' + options.uri)
      cors_err.cors = 'rejected'

      // Do not process this request further.
      did.loading = true
      did.end = true

      return options.callback(cors_err, xhr)
    }

    options.onResponse(null, xhr)
  }

  function on_loading() {
    if(did.loading)
      return

    did.loading = true
    request.log.debug('Response body loading', {'id':xhr.id})
    // TODO: Maybe simulate "data" events by watching xhr.responseText
  }

  function on_end() {
    if(did.end)
      return

    did.end = true
    request.log.debug('Request done', {'id':xhr.id})

    xhr.body = xhr.responseText
    if(options.json) {
      try        { xhr.body = JSON.parse(xhr.responseText) }
      catch (er) { return options.callback(er, xhr)        }
    }

    options.callback(null, xhr, xhr.body)
  }

} // request

request.withCredentials = false;
request.DEFAULT_TIMEOUT = DEFAULT_TIMEOUT;

//
// defaults
//

request.defaults = function(options, requester) {
  var def = function (method) {
    var d = function (params, callback) {
      if(typeof params === 'string')
        params = {'uri': params};
      else {
        params = JSON.parse(JSON.stringify(params));
      }
      for (var i in options) {
        if (params[i] === undefined) params[i] = options[i]
      }
      return method(params, callback)
    }
    return d
  }
  var de = def(request)
  de.get = def(request.get)
  de.post = def(request.post)
  de.put = def(request.put)
  de.head = def(request.head)
  return de
}

//
// HTTP method shortcuts
//

var shortcuts = [ 'get', 'put', 'post', 'head' ];
shortcuts.forEach(function(shortcut) {
  var method = shortcut.toUpperCase();
  var func   = shortcut.toLowerCase();

  request[func] = function(opts) {
    if(typeof opts === 'string')
      opts = {'method':method, 'uri':opts};
    else {
      opts = JSON.parse(JSON.stringify(opts));
      opts.method = method;
    }

    var args = [opts].concat(Array.prototype.slice.apply(arguments, [1]));
    return request.apply(this, args);
  }
})

//
// CouchDB shortcut
//

request.couch = function(options, callback) {
  if(typeof options === 'string')
    options = {'uri':options}

  // Just use the request API to do JSON.
  options.json = true
  if(options.body)
    options.json = options.body
  delete options.body

  callback = callback || noop

  var xhr = request(options, couch_handler)
  return xhr

  function couch_handler(er, resp, body) {
    if(er)
      return callback(er, resp, body)

    if((resp.statusCode < 200 || resp.statusCode > 299) && body.error) {
      // The body is a Couch JSON object indicating the error.
      er = new Error('CouchDB error: ' + (body.error.reason || body.error.error))
      for (var key in body)
        er[key] = body[key]
      return callback(er, resp, body);
    }

    return callback(er, resp, body);
  }
}

//
// Utility
//

function noop() {}

function getLogger() {
  var logger = {}
    , levels = ['trace', 'debug', 'info', 'warn', 'error']
    , level, i

  for(i = 0; i < levels.length; i++) {
    level = levels[i]

    logger[level] = noop
    if(typeof console !== 'undefined' && console && console[level])
      logger[level] = formatted(console, level)
  }

  return logger
}

function formatted(obj, method) {
  return formatted_logger

  function formatted_logger(str, context) {
    if(typeof context === 'object')
      str += ' ' + JSON.stringify(context)

    return obj[method].call(obj, str)
  }
}

// Return whether a URL is a cross-domain request.
function is_crossDomain(url) {
  var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/

  // jQuery #8138, IE may throw an exception when accessing
  // a field from window.location if document.domain has been set
  var ajaxLocation
  try { ajaxLocation = location.href }
  catch (e) {
    // Use the href attribute of an A element since IE will modify it given document.location
    ajaxLocation = document.createElement( "a" );
    ajaxLocation.href = "";
    ajaxLocation = ajaxLocation.href;
  }

  var ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || []
    , parts = rurl.exec(url.toLowerCase() )

  var result = !!(
    parts &&
    (  parts[1] != ajaxLocParts[1]
    || parts[2] != ajaxLocParts[2]
    || (parts[3] || (parts[1] === "http:" ? 80 : 443)) != (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? 80 : 443))
    )
  )

  //console.debug('is_crossDomain('+url+') -> ' + result)
  return result
}

// MIT License from http://phpjs.org/functions/base64_encode:358
function b64_enc (data) {
    // Encodes string using MIME base64 algorithm
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc="", tmp_arr = [];

    if (!data) {
        return data;
    }

    // assume utf8 data
    // data = this.utf8_encode(data+'');

    do { // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1<<16 | o2<<8 | o3;

        h1 = bits>>18 & 0x3f;
        h2 = bits>>12 & 0x3f;
        h3 = bits>>6 & 0x3f;
        h4 = bits & 0x3f;

        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    switch (data.length % 3) {
        case 1:
            enc = enc.slice(0, -2) + '==';
        break;
        case 2:
            enc = enc.slice(0, -1) + '=';
        break;
    }

    return enc;
}
    return request;
//UMD FOOTER START
}));
//UMD FOOTER END


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fetchRoute;

var _config = __webpack_require__(2);

var _config2 = _interopRequireDefault(_config);

var _polyline = __webpack_require__(37);

var _polyline2 = _interopRequireDefault(_polyline);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// const polyline = require('@mapbox/polyline');


function latLngPairToGeoJsonPoint(pair) {
  // GeoJSON is in the opposite order: Longitude, then Latitude
  return [pair[1], pair[0]];
}

/**
 * Fetch route point a to point b, call callback when done.
 * @param {Point} from
 * @param {Point} to
 * @param {Function} callback
 */
function fetchRoute(a, b, callback) {
  // build and submit request, then call callback.

  var baseUrl = 'https://valhalla.mapzen.com/route';

  var routeConfig = {
    locations: [{ lat: a.latitude, lon: a.longitude, street: a.address }, { lat: b.latitude, lon: b.longitude, street: b.address }],
    costing: 'bicycle',
    costing_options: {
      bicycle: {
        bicycle_type: 'Mountain', // bike share: bigger and slower.
        use_roads: 0.25,
        use_hills: 0.1
      }
    },
    directions_options: {
      units: 'miles'
    },
    id: 'route'
  };

  var routeProviderURL = baseUrl + '?json=' + JSON.stringify(routeConfig) + '&api_key=' + _config2.default.mapzenKey;

  fetch(routeProviderURL).then(function (resp) {
    return resp.json();
  }).then(function (data) {
    console.log('got route data: ', data);
    if (data.trip && data.trip.legs) {
      // generate a MultiLineString (each leg becomes a line)
      var multiLineCoords = data.trip.legs.map(function (leg) {
        var arr = _polyline2.default.decode(leg.shape); // returns array of lat, lon pairs
        // each leg becomes the coordinates for a LineString,
        return arr.map(latLngPairToGeoJsonPoint);
      });
      var multiLineString = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'MultiLineString',
          coordinates: multiLineCoords
        }
      };
      console.log('fetched route as mappable feature: ', multiLineString);
      callback(multiLineString);
    }
  }).catch(function (error) {
    console.log('error fetching route: ', error);
  });
}

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

// From: https://mapzen.com/documentation/mobility/decoding/
var polyline = {};

// This is adapted from the implementation in Project-OSRM
// https://github.com/DennisOSRM/Project-OSRM-Web/blob/master/WebContent/routing/OSRM.RoutingGeometry.js
polyline.decode = function (str, precision) {
  var index = 0,
      lat = 0,
      lng = 0,
      coordinates = [],
      shift = 0,
      result = 0,
      byte = null,
      latitude_change = void 0,
      longitude_change = void 0,
      factor = Math.pow(10, precision || 6);

  // Coordinates have variable length when encoded, so just keep
  // track of whether we've hit the end of the string. In each
  // loop iteration, a single coordinate is decoded.
  while (index < str.length) {
    // Reset shift, result, and byte
    byte = null;
    shift = 0;
    result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    latitude_change = result & 1 ? ~(result >> 1) : result >> 1;

    shift = result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    longitude_change = result & 1 ? ~(result >> 1) : result >> 1;

    lat += latitude_change;
    lng += longitude_change;

    coordinates.push([lat / factor, lng / factor]);
  }

  return coordinates;
};

exports.default = polyline;

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = initOriginLocatorBtn;

var _state = __webpack_require__(0);

var _state2 = _interopRequireDefault(_state);

var _map = __webpack_require__(1);

var _userReverseGeocode = __webpack_require__(6);

var _userReverseGeocode2 = _interopRequireDefault(_userReverseGeocode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The origin locator button updates the origin input based
 * on the user's location.
 */
function initOriginLocatorBtn() {
  var btn = document.getElementsByClassName('directions--locate-origin')[0];
  // console.log('in btn init');
  btn.onclick = function onOriginLocatorBtnHandler() {
    // console.log('in btn click handler');
    var orig = document.getElementById('originInput');
    orig.value = 'Searching...';
    if (_state2.default.user.address) {
      orig.value = _state2.default.user.address;
      _state2.default.origin = _extends({}, _state2.default.user);
      (0, _map.mapUpdateDirectionsEndpoint)('origin');
    } else {
      console.log('fetching your address...');
      navigator.geolocation.getCurrentPosition(function (position) {
        console.log(position);
        var _position$coords = position.coords,
            latitude = _position$coords.latitude,
            longitude = _position$coords.longitude;

        _state2.default.user.latitude = latitude;
        _state2.default.user.longitude = longitude;
        _state2.default.origin = _extends({}, _state2.default.user);
        (0, _map.mapUpdateDirectionsEndpoint)('origin');
        (0, _userReverseGeocode2.default)(function (err, data, address) {
          orig.value = address;
          _state2.default.user.address = address;
        });
      });
    }
  };
}

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = initDirectionInput;

var _autocompleter = __webpack_require__(40);

var _autocompleter2 = _interopRequireDefault(_autocompleter);

var _geocoder = __webpack_require__(3);

var _map = __webpack_require__(1);

var _state = __webpack_require__(0);

var _state2 = _interopRequireDefault(_state);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Hooks an input up to an autocomplete service
 * @param {String} elId element id of the input which should be autocompleted
 */
function initAutocomplete(elId) {
  var input = document.getElementById(elId);

  (0, _autocompleter2.default)({
    input: document.getElementById(elId),
    fetch: function fetch(text, update) {
      (0, _geocoder.geocode)(text, function (err, geoData) {
        if (!err) {
          var d = geoData;
          // console.log(`result from geocoding ${text}: `, d);
          // ensure result looks as we expect from the API
          if (d.type === 'FeatureCollection' && d.features && d.features.length > 0) {
            // map d.features into useful format.
            // return {label:..., item:..} obj - the format
            // specified here: https://github.com/kraaden/autocomplete
            var featureToSuggestion = function featureToSuggestion(feature) {
              return { label: feature.place_name, item: feature };
            };
            var suggestions = d.features.map(featureToSuggestion);
            update(suggestions);
          }
        } else {
          console.log('error geocoding ' + text + ': ' + err); //eslint-disable-line
        }
      });
    },
    onSelect: function onSelect(item) {
      // console.log('SELECTED item:', item);
      input.value = item.place_name;
    }
  });
}

/**
 * returns a change handler which updates global state location
 * @param {String} location - 'origin' or 'destination'; requires state[destination] to exist.
 */
function geocodingChangeHandler(location) {
  return function changeEventHandler(event) {
    var addr = event.target.value;
    if (addr === '') {
      // user cleared input - erase known point for location
      _state2.default[location].longitude = null;
      _state2.default[location].latitude = null;
      _state2.default[location].address = null;
      (0, _map.mapUpdateDirectionsEndpoint)(location);
      return;
    }
    console.log('geocoding address: ', addr);
    (0, _geocoder.geocode)(addr, function (err, geoData) {
      if (!err) {
        var d = geoData;
        console.log('result from geocoding ' + addr + ': ', d);
        if ( // ensure result looks as we expect from the API
        d.type === 'FeatureCollection' && d.features && d.features.length > 0) {
          if (d.features[0].place_name) {
            // console.log(`updating address for ${location} from
            //   ${state[location].address} to
            //   ${d.features[0].place_name}`);
            _state2.default[location].address = d.features[0].place_name;
          }
          if (d.features[0].center) {
            var _d$features$0$center = _slicedToArray(d.features[0].center, 2);
            // console.log(`updating lon for ${location} from
            //   ${state[location].longitude},${state[location].latitude} to
            //   ${d.features[0].center}`);


            _state2.default[location].longitude = _d$features$0$center[0];
            _state2.default[location].latitude = _d$features$0$center[1];

            console.log('gecoder returned coords:', [_state2.default[location].longitude, _state2.default[location].latitude]);
          }
          // console.log('app state:', state);
          (0, _map.mapUpdateDirectionsEndpoint)(location);
        }
        // callback(err, geoData, state.destinationAddr);
      } else {
        console.log('error geocoding ' + addr + ': ' + err); //eslint-disable-line
      }
    });
  };
}

/**
 * Initialize the input handler for one of the direction inputs
 * @param {String} elId - ID of the input element to initialize
 * @param {String} location - 'origin' or 'destination'
 */
function initDirectionInput(elId, location) {
  // run geocode on address when input changes
  var input = document.getElementById(elId);
  input.onchange = geocodingChangeHandler(location);

  // enable autocomplete
  initAutocomplete(elId);
}

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;!function(e){if(true)!(__WEBPACK_AMD_DEFINE_FACTORY__ = (e),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));else if("undefined"!=typeof module&&void 0!==module.exports){var t=e();Object.defineProperty(exports,"__esModule",{value:!0}),exports.autocomplete=t,exports.default=t}else window.autocomplete=e()}(function(){"use strict";function e(e){function t(){return"none"!==h.display}function n(){y++,m=[],p=void 0,h.display="none"}function o(){for(;v.firstChild;)v.removeChild(v.firstChild);var t=!1,o="#9?$";m.forEach(function(e){e.group&&(t=!0)});var i=function(e){var t=c.createElement("div");return t.textContent=e.label,t};e.render&&(i=e.render);var l=function(e){var t=c.createElement("div");return t.textContent=e,t};if(e.renderGroup&&(l=e.renderGroup),m.forEach(function(t){if(t.group&&t.group!==o){o=t.group;var r=l(t.group);r&&(r.className+=" group",v.appendChild(r))}var a=i(t);a&&(a.addEventListener("click",function(o){e.onSelect(t.item,u),n(),o.preventDefault(),o.stopPropagation()}),t===p&&(a.className+=" selected"),v.appendChild(a))}),m.length<1){if(!e.emptyMsg)return void n();var a=c.createElement("div");a.className="empty",a.textContent=e.emptyMsg,v.appendChild(a)}var f=u.getBoundingClientRect(),d=f.top+u.offsetHeight+c.body.scrollTop;h.top=d+"px",h.left=f.left+"px",h.width=u.offsetWidth+"px",h.maxHeight=window.innerHeight-(f.top+u.offsetHeight)+"px",h.height="auto",h.display="block",r()}function i(i){var r=i.which||i.keyCode||0,l=++y;38!==r&&13!==r&&27!==r&&39!==r&&37!==r&&(40===r&&t()||(u.value.length>=g?e.fetch(u.value,function(e){y===l&&e&&(m=e,p=m.length>0?m[0]:void 0,o())}):n()))}function r(){var e=v.getElementsByClassName("selected");if(e.length>0){var t=e[0],n=t.previousElementSibling;if(n&&-1!==n.className.indexOf("group")&&!n.previousElementSibling&&(t=n),t.offsetTop<v.scrollTop)v.scrollTop=t.offsetTop;else{var o=t.offsetTop+t.offsetHeight,i=v.scrollTop+v.offsetHeight;o>i&&(v.scrollTop+=o-i)}}}function l(){if(m.length<1)p=void 0;else if(p===m[0])p=m[m.length-1];else for(var e=m.length-1;e>0;e--)if(p===m[e]||1===e){p=m[e-1];break}}function a(){if(m.length<1&&(p=void 0),!p||p===m[m.length-1])return void(p=m[0]);for(var e=0;e<m.length-1;e++)if(p===m[e]){p=m[e+1];break}}function f(i){var r=i.which||i.keyCode||0;if(38===r||40===r||27===r){var f=t();if(27===r)n();else{if(!t||m.length<1)return;38===r?l():a(),o()}return i.preventDefault(),void(f&&i.stopPropagation())}13===r&&p&&(e.onSelect(p.item,u),n())}function d(){setTimeout(function(){c.activeElement!==u&&n()},200)}function s(){u.removeEventListener("keydown",f),u.removeEventListener("keyup",i),u.removeEventListener("blur",d),window.removeEventListener("resize",o),n();var e=v.parentNode;e&&e.removeChild(v)}var u,p,c=document,v=c.createElement("div"),h=v.style,m=[],g=e.minLength||2,y=0;if(!e.input)throw new Error("input undefined");return u=e.input,c.body.appendChild(v),v.className="autocomplete "+(e.className||""),h.position="absolute",h.display="none",u.addEventListener("keydown",f),u.addEventListener("keyup",i),u.addEventListener("blur",d),window.addEventListener("resize",o),{destroy:s}}return e});

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMDMxOGVkYTZjZWE4ZjkyM2RkODYiLCJ3ZWJwYWNrOi8vLy4vc3JjL3N0YXRlLmpzIiwid2VicGFjazovLy8uL3NyYy9tYXAuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbmZpZy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZ2VvY29kZXIuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL2FkZFN0eWxlcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXNlclJldmVyc2VHZW9jb2RlLmpzIiwid2VicGFjazovLy8uL3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvc3R5bGUuY3NzP2JkODQiLCJ3ZWJwYWNrOi8vLy4vc3JjL3N0eWxlLmNzcyIsIndlYnBhY2s6Ly8vLi9zcmMvbm91bl84MDA2MDAucG5nIiwid2VicGFjazovLy8uL3NyYy9tYXAtZG90LW9yaWdpbi5zdmciLCJ3ZWJwYWNrOi8vLy4vc3JjL21hcC1kb3QtZGVzdGluYXRpb24uc3ZnIiwid2VicGFjazovLy8uL3NyYy9sb2NhdGUtcGVyc29uLnN2ZyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2xpYi91cmxzLmpzIiwid2VicGFjazovLy8uL3NyYy92ZW5kb3Ivbm91aXNsaWRlci5taW4uY3NzPzYxYzAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZlbmRvci9ub3Vpc2xpZGVyLm1pbi5jc3MiLCJ3ZWJwYWNrOi8vLy4vc3JjL2Zhdmljb24uaWNvIiwid2VicGFjazovLy8uL3NyYy9kaXJlY3Rpb25zQ29udHJvbHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2Rpc3RhbmNlU2xpZGVyLmpzIiwid2VicGFjazovLy8uL3NyYy92ZW5kb3Ivbm91aXNsaWRlci5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQHR1cmYvY2lyY2xlL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AdHVyZi9kZXN0aW5hdGlvbi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQHR1cmYvaW52YXJpYW50L2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AdHVyZi9kZXN0aW5hdGlvbi9ub2RlX21vZHVsZXMvQHR1cmYvaGVscGVycy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQHR1cmYvY2lyY2xlL25vZGVfbW9kdWxlcy9AdHVyZi9oZWxwZXJzL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AdHVyZi9oZWxwZXJzL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AdHVyZi93aXRoaW4vaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0B0dXJmL2luc2lkZS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQHR1cmYvaW5zaWRlL25vZGVfbW9kdWxlcy9AdHVyZi9pbnZhcmlhbnQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0B0dXJmL3dpdGhpbi9ub2RlX21vZHVsZXMvQHR1cmYvaGVscGVycy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvU3RhdGlvbkZlZWQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BvcHVwcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXNlckdlb2xvY2F0ZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvbWFwYm94LWdlb2NvZGluZy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvYnJvd3Nlci1yZXF1ZXN0L2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy9yb3V0ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZlbmRvci9wb2x5bGluZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvb3JpZ2luTG9jYXRvckJ1dHRvbi5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZGlyZWN0aW9uSW5wdXQuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2F1dG9jb21wbGV0ZXIvYXV0b2NvbXBsZXRlLmpzIl0sIm5hbWVzIjpbIm1heFdhbGtEaXN0YW5jZSIsInVzZXIiLCJsb25naXR1ZGUiLCJsYXRpdHVkZSIsImFkZHJlc3MiLCJvcmlnaW4iLCJkZXN0aW5hdGlvbiIsImluaXRNYXAiLCJmbHlUbyIsInJlbmRlckRpcmVjdGlvbnNNYXJrZXIiLCJtYXBVcGRhdGVOZWFyYnkiLCJtYXBVcGRhdGVEaXJlY3Rpb25zRW5kcG9pbnQiLCJzdGF0aW9uc1VSTCIsInN0YXRpb25zVXJsIiwibWFwIiwiYWRkU3RhdGlvbnMiLCJvbiIsIndpbmRvdyIsInNldEludGVydmFsIiwiZ2V0U291cmNlIiwic2V0RGF0YSIsImdldFN0YXRpb25zIiwiY29uc29sZSIsImxvZyIsImFkZFNvdXJjZSIsInR5cGUiLCJkYXRhIiwiYWRkTGF5ZXIiLCJpZCIsInNvdXJjZSIsInBhaW50IiwiZ2V0Q2FudmFzIiwic3R5bGUiLCJjdXJzb3IiLCJhZGRQb3B1cHMiLCJlIiwiZmVhdHVyZXMiLCJxdWVyeVJlbmRlcmVkRmVhdHVyZXMiLCJwb2ludCIsImxheWVycyIsImxlbmd0aCIsImZlYXR1cmUiLCJwb3B1cCIsIm1hcGJveGdsIiwiUG9wdXAiLCJvZmZzZXQiLCJzZXRMbmdMYXQiLCJnZW9tZXRyeSIsImNvb3JkaW5hdGVzIiwic2V0SFRNTCIsImFkZFRvIiwiX2NvbnRhaW5lciIsImNsYXNzTGlzdCIsImFkZCIsImFkZEVtcHR5U3RhdGlvbnNOZWFyYnlTb3VyY2VzIiwiZW1wdHlGZWF0dXJlU2V0IiwibWF4em9vbSIsImNlbnRlciIsInpvb20iLCJNYXAiLCJjb250YWluZXIiLCJtYXBTdHlsZSIsImdlb2xvY2F0ZUNvbnRyb2wiLCJHZW9sb2NhdGVDb250cm9sIiwicG9zaXRpb25PcHRpb25zIiwiZW5hYmxlSGlnaEFjY3VyYWN5IiwidHJhY2tVc2VyTG9jYXRpb24iLCJhZGRDb250cm9sIiwibG9jYXRpb24iLCJlbmRwb2ludE1hcmtlcnMiLCJlbCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImNsYXNzTmFtZSIsIk1hcmtlciIsImdldFN0YXRpb25zTmVhciIsInN0YXRpb25zIiwiZ2V0U3RhdGlvbnNBcnJheSIsInNlYXJjaFdpdGhpbkZlYXR1cmVzIiwidW5pdHMiLCJzdGF0aW9uQ29sbGVjdGlvbiIsIm5lYXJieVN0YXRpb25zIiwiZ2V0TGF5ZXJJZEZvclN0YXRpb25zTmVhciIsInNob3dTdGF0aW9uc05lYXIiLCJsYXllckFuZFNvdXJjZUlkIiwiYXZhaWxhYmxlQ3JpdGVyYSIsImxheWVyIiwiZ2V0TGF5ZXIiLCJwcm9wZXJ0eSIsInN0b3BzIiwiY2xlYXJTdGF0aW9uc05lYXIiLCJsYXllcklEIiwicmVtb3ZlTGF5ZXIiLCJmb3JFYWNoIiwibWFwQ2xlYXJSb3V0ZSIsInJvdXRlTGF5ZXIiLCJtYXBVcGRhdGVSb3V0ZSIsInJvdXRlTGluZVN0cmluZyIsImxheWVyQWJvdmUiLCJsYXlvdXQiLCJyZW1vdmUiLCJtYXB6ZW5LZXkiLCJtYXBib3hUb2tlbiIsInJldmVyc2VHZW9jb2RlIiwiZ2VvY29kZSIsInNldEdlb2NkZXJDZW50ZXIiLCJzZXRHZW9jb2RlckJvdW5kcyIsInNldEFjY2Vzc1Rva2VuIiwibGF0IiwibG5nIiwiY2FsbGJhY2siLCJlcnIiLCJnZW9EYXRhIiwic2V0U2VhcmNoQ2VudGVyIiwiYmJveCIsInNldFNlYXJjaEJvdW5kcyIsInVzZXJSZXZlcnNlR2VvY29kZSIsImQiLCJwbGFjZV9uYW1lIiwiYXBwU3RhdGUiLCJpbml0UGFnZSIsImxuZ0xhdCIsImRvSW5pdCIsInJlYWR5U3RhdGUiLCJhZGRFdmVudExpc3RlbmVyIiwiaW5pdCIsImxvbiIsIk51bWJlciIsInByb3RvdHlwZSIsImJldHdlZW4iLCJtaW4iLCJtYXgiLCJnZW9Mb2NhdGlvblByb3ZpZGVyVVJMIiwiZmV0Y2giLCJ0aGVuIiwicmVzcCIsImpzb24iLCJjYXRjaCIsImVycm9yIiwiaW5pdERpcmVjdGlvbnNDb250cm9scyIsImluaXREaXN0YW5jZVNsaWRlciIsInJhbmdlIiwic2xpZGVyIiwiZ2V0RWxlbWVudEJ5SWQiLCJkaXN0Rm9ybWF0dGVyIiwidG8iLCJuIiwiaXNJbnRlZ2VyIiwidG9GaXhlZCIsImNyZWF0ZSIsInN0YXJ0Iiwic3RlcCIsImNvbm5lY3QiLCJwaXBzIiwibW9kZSIsInZhbHVlcyIsImRlbnNpdHkiLCJmb3JtYXQiLCJub1VpU2xpZGVyIiwiaGFuZGxlIiwidmFsdWUiLCJpbm5lclRleHQiLCJwYXJzZUZsb2F0IiwiZmFjdG9yeSIsImRlZmluZSIsImV4cG9ydHMiLCJtb2R1bGUiLCJWRVJTSU9OIiwiaXNWYWxpZEZvcm1hdHRlciIsImVudHJ5IiwiZnJvbSIsInJlbW92ZUVsZW1lbnQiLCJwYXJlbnRFbGVtZW50IiwicmVtb3ZlQ2hpbGQiLCJwcmV2ZW50RGVmYXVsdCIsInVuaXF1ZSIsImFycmF5IiwiZmlsdGVyIiwiYSIsImNsb3Nlc3QiLCJNYXRoIiwicm91bmQiLCJlbGVtIiwib3JpZW50YXRpb24iLCJyZWN0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiZG9jIiwib3duZXJEb2N1bWVudCIsImRvY0VsZW0iLCJkb2N1bWVudEVsZW1lbnQiLCJwYWdlT2Zmc2V0IiwiZ2V0UGFnZU9mZnNldCIsInRlc3QiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJ4IiwidG9wIiwieSIsImNsaWVudFRvcCIsImxlZnQiLCJjbGllbnRMZWZ0IiwiaXNOdW1lcmljIiwiaXNOYU4iLCJpc0Zpbml0ZSIsImFkZENsYXNzRm9yIiwiZWxlbWVudCIsImR1cmF0aW9uIiwiYWRkQ2xhc3MiLCJzZXRUaW1lb3V0IiwicmVtb3ZlQ2xhc3MiLCJsaW1pdCIsImFzQXJyYXkiLCJBcnJheSIsImlzQXJyYXkiLCJjb3VudERlY2ltYWxzIiwibnVtU3RyIiwiU3RyaW5nIiwicGllY2VzIiwic3BsaXQiLCJyZXBsYWNlIiwiUmVnRXhwIiwiam9pbiIsImhhc0NsYXNzIiwiY29udGFpbnMiLCJzdXBwb3J0UGFnZU9mZnNldCIsInBhZ2VYT2Zmc2V0IiwidW5kZWZpbmVkIiwiaXNDU1MxQ29tcGF0IiwiY29tcGF0TW9kZSIsInNjcm9sbExlZnQiLCJib2R5IiwicGFnZVlPZmZzZXQiLCJzY3JvbGxUb3AiLCJnZXRBY3Rpb25zIiwicG9pbnRlckVuYWJsZWQiLCJtb3ZlIiwiZW5kIiwibXNQb2ludGVyRW5hYmxlZCIsImdldFN1cHBvcnRzUGFzc2l2ZSIsInN1cHBvcnRzUGFzc2l2ZSIsIm9wdHMiLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImdldCIsImdldFN1cHBvcnRzVG91Y2hBY3Rpb25Ob25lIiwiQ1NTIiwic3VwcG9ydHMiLCJzdWJSYW5nZVJhdGlvIiwicGEiLCJwYiIsImZyb21QZXJjZW50YWdlIiwidG9QZXJjZW50YWdlIiwiYWJzIiwiaXNQZXJjZW50YWdlIiwiZ2V0SiIsImFyciIsImoiLCJ0b1N0ZXBwaW5nIiwieFZhbCIsInhQY3QiLCJzbGljZSIsInZhIiwidmIiLCJmcm9tU3RlcHBpbmciLCJnZXRTdGVwIiwieFN0ZXBzIiwic25hcCIsImIiLCJoYW5kbGVFbnRyeVBvaW50IiwiaW5kZXgiLCJ0aGF0IiwicGVyY2VudGFnZSIsInRvU3RyaW5nIiwiY2FsbCIsIkVycm9yIiwicHVzaCIsInhIaWdoZXN0Q29tcGxldGVTdGVwIiwiaGFuZGxlU3RlcFBvaW50IiwiaSIsInRvdGFsU3RlcHMiLCJ4TnVtU3RlcHMiLCJoaWdoZXN0U3RlcCIsImNlaWwiLCJTcGVjdHJ1bSIsInNpbmdsZVN0ZXAiLCJvcmRlcmVkIiwiaGFzT3duUHJvcGVydHkiLCJzb3J0IiwiZ2V0TWFyZ2luIiwiZ2V0TmVhcmJ5U3RlcHMiLCJzdGVwQmVmb3JlIiwic3RhcnRWYWx1ZSIsInRoaXNTdGVwIiwic3RlcEFmdGVyIiwiY291bnRTdGVwRGVjaW1hbHMiLCJzdGVwRGVjaW1hbHMiLCJhcHBseSIsImNvbnZlcnQiLCJkZWZhdWx0Rm9ybWF0dGVyIiwidmFsaWRhdGVGb3JtYXQiLCJ0ZXN0U3RlcCIsInBhcnNlZCIsInRlc3RSYW5nZSIsInNwZWN0cnVtIiwidGVzdFN0YXJ0IiwiaGFuZGxlcyIsInRlc3RTbmFwIiwidGVzdEFuaW1hdGUiLCJhbmltYXRlIiwidGVzdEFuaW1hdGlvbkR1cmF0aW9uIiwiYW5pbWF0aW9uRHVyYXRpb24iLCJ0ZXN0Q29ubmVjdCIsInRlc3RPcmllbnRhdGlvbiIsIm9ydCIsInRlc3RNYXJnaW4iLCJtYXJnaW4iLCJ0ZXN0TGltaXQiLCJ0ZXN0UGFkZGluZyIsInBhZGRpbmciLCJ0ZXN0RGlyZWN0aW9uIiwiZGlyIiwidGVzdEJlaGF2aW91ciIsInRhcCIsImluZGV4T2YiLCJkcmFnIiwiZml4ZWQiLCJob3ZlciIsImV2ZW50cyIsInRlc3RUb29sdGlwcyIsInRvb2x0aXBzIiwiZm9ybWF0dGVyIiwidGVzdEFyaWFGb3JtYXQiLCJhcmlhRm9ybWF0IiwidGVzdEZvcm1hdCIsInRlc3RDc3NQcmVmaXgiLCJjc3NQcmVmaXgiLCJ0ZXN0Q3NzQ2xhc3NlcyIsImNzc0NsYXNzZXMiLCJrZXkiLCJ0ZXN0VXNlUmFmIiwidXNlUmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwidGVzdE9wdGlvbnMiLCJvcHRpb25zIiwidGVzdHMiLCJyIiwidCIsImRlZmF1bHRzIiwidGFyZ2V0IiwiYmFzZSIsImhhbmRsZUxvd2VyIiwiaGFuZGxlVXBwZXIiLCJob3Jpem9udGFsIiwidmVydGljYWwiLCJiYWNrZ3JvdW5kIiwibHRyIiwicnRsIiwiZHJhZ2dhYmxlIiwiYWN0aXZlIiwidG9vbHRpcCIsInBpcHNIb3Jpem9udGFsIiwicGlwc1ZlcnRpY2FsIiwibWFya2VyIiwibWFya2VySG9yaXpvbnRhbCIsIm1hcmtlclZlcnRpY2FsIiwibWFya2VyTm9ybWFsIiwibWFya2VyTGFyZ2UiLCJtYXJrZXJTdWIiLCJ2YWx1ZUhvcml6b250YWwiLCJ2YWx1ZVZlcnRpY2FsIiwidmFsdWVOb3JtYWwiLCJ2YWx1ZUxhcmdlIiwidmFsdWVTdWIiLCJrZXlzIiwibmFtZSIsInN0eWxlcyIsInN0eWxlT3Bvc2l0ZSIsImNsb3N1cmUiLCJvcmlnaW5hbE9wdGlvbnMiLCJhY3Rpb25zIiwic3VwcG9ydHNUb3VjaEFjdGlvbk5vbmUiLCJzY29wZV9UYXJnZXQiLCJzY29wZV9Mb2NhdGlvbnMiLCJzY29wZV9CYXNlIiwic2NvcGVfSGFuZGxlcyIsInNjb3BlX0hhbmRsZU51bWJlcnMiLCJzY29wZV9BY3RpdmVIYW5kbGUiLCJzY29wZV9Db25uZWN0cyIsInNjb3BlX1NwZWN0cnVtIiwic2NvcGVfVmFsdWVzIiwic2NvcGVfRXZlbnRzIiwic2NvcGVfU2VsZiIsInNjb3BlX1BpcHMiLCJzY29wZV9MaXN0ZW5lcnMiLCJzY29wZV9Eb2N1bWVudCIsInNjb3BlX0RvY3VtZW50RWxlbWVudCIsInNjb3BlX0JvZHkiLCJhZGROb2RlVG8iLCJkaXYiLCJhcHBlbmRDaGlsZCIsImFkZE9yaWdpbiIsImhhbmRsZU51bWJlciIsInNldEF0dHJpYnV0ZSIsImFkZENvbm5lY3QiLCJhZGRFbGVtZW50cyIsImNvbm5lY3RPcHRpb25zIiwiYWRkU2xpZGVyIiwiYWRkVG9vbHRpcCIsImZpcnN0Q2hpbGQiLCJ0aXBzIiwiYmluZEV2ZW50IiwidW5lbmNvZGVkIiwiZm9ybWF0dGVkVmFsdWUiLCJpbm5lckhUTUwiLCJhcmlhIiwicG9zaXRpb25zIiwiY2hlY2tIYW5kbGVQb3NpdGlvbiIsIm5vdyIsInRleHQiLCJjaGlsZHJlbiIsImdldEdyb3VwIiwic3RlcHBlZCIsInNwcmVhZCIsInYiLCJnZW5lcmF0ZVNwcmVhZCIsImdyb3VwIiwic2FmZUluY3JlbWVudCIsImluY3JlbWVudCIsImluZGV4ZXMiLCJmaXJzdEluUmFuZ2UiLCJsYXN0SW5SYW5nZSIsImlnbm9yZUZpcnN0IiwiaWdub3JlTGFzdCIsInByZXZQY3QiLCJ1bnNoaWZ0IiwiY3VycmVudCIsInEiLCJsb3ciLCJoaWdoIiwibmV3UGN0IiwicGN0RGlmZmVyZW5jZSIsInBjdFBvcyIsInN0ZXBzIiwicmVhbFN0ZXBzIiwic3RlcHNpemUiLCJhZGRNYXJraW5nIiwiZmlsdGVyRnVuYyIsInZhbHVlU2l6ZUNsYXNzZXMiLCJtYXJrZXJTaXplQ2xhc3NlcyIsInZhbHVlT3JpZW50YXRpb25DbGFzc2VzIiwibWFya2VyT3JpZW50YXRpb25DbGFzc2VzIiwiZ2V0Q2xhc3NlcyIsIm9yaWVudGF0aW9uQ2xhc3NlcyIsInNpemVDbGFzc2VzIiwiYWRkU3ByZWFkIiwibm9kZSIsInJlbW92ZVBpcHMiLCJncmlkIiwiYmFzZVNpemUiLCJhbHQiLCJ3aWR0aCIsImhlaWdodCIsImF0dGFjaEV2ZW50IiwibWV0aG9kIiwiaGFzQXR0cmlidXRlIiwiZml4RXZlbnQiLCJidXR0b25zIiwiY2FsY1BvaW50IiwicG9pbnRzIiwibWV0aG9kcyIsImV2ZW50TmFtZSIsInBhc3NpdmUiLCJ0b3VjaCIsIm1vdXNlIiwicG9pbnRlciIsInRvdWNoZXMiLCJjaGFuZ2VkVG91Y2hlcyIsInBhZ2VYIiwicGFnZVkiLCJjbGllbnRYIiwiY2xpZW50WSIsImNhbGNQb2ludFRvUGVyY2VudGFnZSIsInByb3Bvc2FsIiwiZ2V0Q2xvc2VzdEhhbmRsZSIsInBvcyIsIm1vdmVIYW5kbGVzIiwidXB3YXJkIiwibG9jYXRpb25zIiwiaGFuZGxlTnVtYmVycyIsInByb3Bvc2FscyIsImYiLCJyZXZlcnNlIiwibyIsInN0YXRlIiwic2V0SGFuZGxlIiwiZmlyZUV2ZW50IiwidGFyZ2V0RXZlbnQiLCJldmVudFR5cGUiLCJkb2N1bWVudExlYXZlIiwiZXZlbnQiLCJub2RlTmFtZSIsInJlbGF0ZWRUYXJnZXQiLCJldmVudEVuZCIsImV2ZW50TW92ZSIsImFwcFZlcnNpb24iLCJidXR0b25zUHJvcGVydHkiLCJtb3ZlbWVudCIsInN0YXJ0Q2FsY1BvaW50IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImMiLCJzZXRaaW5kZXgiLCJldmVudFN0YXJ0Iiwic3RvcFByb3BhZ2F0aW9uIiwibW92ZUV2ZW50IiwiZW5kRXZlbnQiLCJvdXRFdmVudCIsImNvbmNhdCIsImdldENvbXB1dGVkU3R5bGUiLCJldmVudFRhcCIsImV2ZW50SG92ZXIiLCJiaW5kU2xpZGVyRXZlbnRzIiwiYmVoYXZpb3VyIiwiaGFuZGxlQmVmb3JlIiwiaGFuZGxlQWZ0ZXIiLCJldmVudEhvbGRlcnMiLCJldmVudEhvbGRlciIsInJlZmVyZW5jZSIsImxvb2tCYWNrd2FyZCIsImxvb2tGb3J3YXJkIiwiZ2V0VmFsdWUiLCJ0b1BjdCIsInBjdCIsInVwZGF0ZUhhbmRsZVBvc2l0aW9uIiwic3RhdGVVcGRhdGUiLCJ1cGRhdGVDb25uZWN0IiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwiekluZGV4IiwiY2hpbGROb2RlcyIsImwiLCJoIiwic2V0VmFsdWUiLCJ2YWx1ZVNldCIsImlucHV0IiwiZmlyZVNldEV2ZW50IiwiaXNJbml0IiwidmFsdWVSZXNldCIsInZhbHVlR2V0IiwiZGVzdHJveSIsImdldEN1cnJlbnRTdGVwIiwibmVhcmJ5U3RlcHMiLCJkZWNyZW1lbnQiLCJuYW1lc3BhY2VkRXZlbnQiLCJyZW1vdmVFdmVudCIsIm5hbWVzcGFjZSIsInN1YnN0cmluZyIsImJpbmQiLCJ0RXZlbnQiLCJ0TmFtZXNwYWNlIiwidXBkYXRlT3B0aW9ucyIsIm9wdGlvbnNUb1VwZGF0ZSIsInVwZGF0ZUFibGUiLCJuZXdPcHRpb25zIiwib2ZmIiwic2V0IiwicmVzZXQiLCJfX21vdmVIYW5kbGVzIiwiaW5pdGlhbGl6ZSIsImFwaSIsInZlcnNpb24iLCJTdGF0aW9uRmVlZCIsImRvRmV0Y2giLCJmZWVkIiwiZ2V0UG9wdXBDb250ZW50IiwiZ2V0RGlyZWN0aW9uc0xpbmsiLCJ0b0FkZHIiLCJmcm9tQWRkciIsInRvTGF0IiwidG9MbmciLCJiYXNlVVJMIiwiY29vcmRzIiwic3RhdGlvbiIsInByb3BlcnRpZXMiLCJhZGRyIiwic3RBZGRyZXNzMSIsImJpa2VzIiwiYXZhaWxhYmxlQmlrZXMiLCJkb2NrcyIsImF2YWlsYWJsZURvY2tzIiwic3RhdHVzIiwic3RhdHVzVmFsdWUiLCJkaXJlY3Rpb25zVVJMIiwiYWxlcnRNc2ciLCJ1c2VyR2VvbG9jYXRlIiwicG9zaXRpb24iLCJmZXRjaFJvdXRlIiwibGF0TG5nUGFpclRvR2VvSnNvblBvaW50IiwicGFpciIsImJhc2VVcmwiLCJyb3V0ZUNvbmZpZyIsInN0cmVldCIsImNvc3RpbmciLCJjb3N0aW5nX29wdGlvbnMiLCJiaWN5Y2xlIiwiYmljeWNsZV90eXBlIiwidXNlX3JvYWRzIiwidXNlX2hpbGxzIiwiZGlyZWN0aW9uc19vcHRpb25zIiwicm91dGVQcm92aWRlclVSTCIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0cmlwIiwibGVncyIsIm11bHRpTGluZUNvb3JkcyIsImxlZyIsImRlY29kZSIsInNoYXBlIiwibXVsdGlMaW5lU3RyaW5nIiwicG9seWxpbmUiLCJzdHIiLCJwcmVjaXNpb24iLCJzaGlmdCIsInJlc3VsdCIsImJ5dGUiLCJsYXRpdHVkZV9jaGFuZ2UiLCJsb25naXR1ZGVfY2hhbmdlIiwiZmFjdG9yIiwicG93IiwiY2hhckNvZGVBdCIsImluaXRPcmlnaW5Mb2NhdG9yQnRuIiwiYnRuIiwiZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSIsIm9uY2xpY2siLCJvbk9yaWdpbkxvY2F0b3JCdG5IYW5kbGVyIiwib3JpZyIsImdlb2xvY2F0aW9uIiwiZ2V0Q3VycmVudFBvc2l0aW9uIiwiaW5pdERpcmVjdGlvbklucHV0IiwiaW5pdEF1dG9jb21wbGV0ZSIsImVsSWQiLCJ1cGRhdGUiLCJmZWF0dXJlVG9TdWdnZXN0aW9uIiwibGFiZWwiLCJpdGVtIiwic3VnZ2VzdGlvbnMiLCJvblNlbGVjdCIsImdlb2NvZGluZ0NoYW5nZUhhbmRsZXIiLCJjaGFuZ2VFdmVudEhhbmRsZXIiLCJvbmNoYW5nZSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztB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QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztBQUNsQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsRUFBRTtBQUNiLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNB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O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztBQUNsQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztBQUNsQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsRUFBRTtBQUNiLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSw4Q0FBOEM7O0FBRTlDO0FBQ0EsZUFBZTtBQUNmO0FBQ0Esa0RBQWtEOztBQUVsRDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxpQkFBaUIsZ0NBQWdDO0FBQ2pEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx3Q0FBd0M7QUFDeEM7QUFDQSxLQUFLLEtBQUs7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdEQUFnRDtBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUNBQXVDO0FBQ3ZDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtDQUFrQywrQ0FBK0M7QUFDakY7QUFDQTs7QUFFQTtBQUNBLGFBQWE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxtRUFBbUUsb0NBQW9DOztBQUV2Ryx1Q0FBdUMsMkRBQTJEOztBQUVsRztBQUNBLDRDQUE0QyxZQUFZO0FBQ3hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx1Q0FBdUMsaUNBQWlDO0FBQ3hFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxnREFBZ0QsWUFBWTtBQUM1RDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHVDQUF1QyxZQUFZOztBQUVuRDtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCLGtCQUFrQjtBQUNsQjs7QUFFQTtBQUNBOztBQUVBLENBQUM7O0FBRUQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZUFBZTs7QUFFZjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsWUFBWSxtQkFBbUI7QUFDL0I7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxRQUFRO0FBQ1I7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxLQUFLOztBQUVMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7Ozs7Ozs7Ozs7Ozs7a0JDM2R3QitrQixVOztBQWxCeEI7Ozs7QUFFQTs7Ozs7O0FBRUE7OztBQUdBLFNBQVNDLHdCQUFULENBQWtDQyxJQUFsQyxFQUF3QztBQUN0QztBQUNBLFNBQU8sQ0FBQ0EsS0FBSyxDQUFMLENBQUQsRUFBVUEsS0FBSyxDQUFMLENBQVYsQ0FBUDtBQUNEOztBQUVEOzs7Ozs7QUFNZSxTQUFTRixVQUFULENBQW9CL1osQ0FBcEIsRUFBdUJ5RixDQUF2QixFQUEwQjdKLFFBQTFCLEVBQW9DO0FBQ2pEOztBQUVBLE1BQU1zZSxVQUFVLG1DQUFoQjs7QUFFQSxNQUFNQyxjQUFjO0FBQ2xCL0csZUFDRSxDQUNFLEVBQUUxWCxLQUFLc0UsRUFBRS9LLFFBQVQsRUFBbUIySCxLQUFLb0QsRUFBRWhMLFNBQTFCLEVBQXFDb2xCLFFBQVFwYSxFQUFFOUssT0FBL0MsRUFERixFQUVFLEVBQUV3RyxLQUFLK0osRUFBRXhRLFFBQVQsRUFBbUIySCxLQUFLNkksRUFBRXpRLFNBQTFCLEVBQXFDb2xCLFFBQVEzVSxFQUFFdlEsT0FBL0MsRUFGRixDQUZnQjtBQU1sQm1sQixhQUFTLFNBTlM7QUFPbEJDLHFCQUFpQjtBQUNmQyxlQUFTO0FBQ1BDLHNCQUFjLFVBRFAsRUFDbUI7QUFDMUJDLG1CQUFXLElBRko7QUFHUEMsbUJBQVc7QUFISjtBQURNLEtBUEM7QUFjbEJDLHdCQUFvQjtBQUNsQjlnQixhQUFPO0FBRFcsS0FkRjtBQWlCbEJuRCxRQUFJO0FBakJjLEdBQXBCOztBQW9CQSxNQUFNa2tCLG1CQUFzQlYsT0FBdEIsY0FBc0NXLEtBQUtDLFNBQUwsQ0FBZVgsV0FBZixDQUF0QyxpQkFBNkUsaUJBQU9oZixTQUExRjs7QUFFQWdDLFFBQU15ZCxnQkFBTixFQUNHeGQsSUFESCxDQUNRO0FBQUEsV0FBUUMsS0FBS0MsSUFBTCxFQUFSO0FBQUEsR0FEUixFQUVHRixJQUZILENBRVEsVUFBQzVHLElBQUQsRUFBVTtBQUNkSixZQUFRQyxHQUFSLENBQVksa0JBQVosRUFBZ0NHLElBQWhDO0FBQ0EsUUFBSUEsS0FBS3VrQixJQUFMLElBQWF2a0IsS0FBS3VrQixJQUFMLENBQVVDLElBQTNCLEVBQWlDO0FBQy9CO0FBQ0EsVUFBTUMsa0JBQWtCemtCLEtBQUt1a0IsSUFBTCxDQUFVQyxJQUFWLENBQWVwbEIsR0FBZixDQUFtQixVQUFDc2xCLEdBQUQsRUFBUztBQUNsRCxZQUFNclcsTUFBTSxtQkFBU3NXLE1BQVQsQ0FBZ0JELElBQUlFLEtBQXBCLENBQVosQ0FEa0QsQ0FDVjtBQUN4QztBQUNBLGVBQU92VyxJQUFJalAsR0FBSixDQUFRb2tCLHdCQUFSLENBQVA7QUFDRCxPQUp1QixDQUF4QjtBQUtBLFVBQU1xQixrQkFBa0I7QUFDdEI5a0IsY0FBTSxTQURnQjtBQUV0QjJpQixvQkFBWSxFQUZVO0FBR3RCcmhCLGtCQUFVO0FBQ1J0QixnQkFBTSxpQkFERTtBQUVSdUIsdUJBQWFtakI7QUFGTDtBQUhZLE9BQXhCO0FBUUE3a0IsY0FBUUMsR0FBUixDQUFZLHFDQUFaLEVBQW1EZ2xCLGVBQW5EO0FBQ0F6ZixlQUFTeWYsZUFBVDtBQUNEO0FBQ0YsR0F0QkgsRUF1Qkc5ZCxLQXZCSCxDQXVCUyxVQUFDQyxLQUFELEVBQVc7QUFDaEJwSCxZQUFRQyxHQUFSLENBQVksd0JBQVosRUFBc0NtSCxLQUF0QztBQUNELEdBekJIO0FBMEJELEM7Ozs7Ozs7Ozs7Ozs7QUN0RUQ7QUFDQSxJQUFNOGQsV0FBVyxFQUFqQjs7QUFFQTtBQUNBO0FBQ0FBLFNBQVNILE1BQVQsR0FBa0IsVUFBVUksR0FBVixFQUFlQyxTQUFmLEVBQTBCO0FBQzFDLE1BQUk3VixRQUFRLENBQVo7QUFBQSxNQUNFakssTUFBTSxDQURSO0FBQUEsTUFFRUMsTUFBTSxDQUZSO0FBQUEsTUFHRTdELGNBQWMsRUFIaEI7QUFBQSxNQUlFMmpCLFFBQVEsQ0FKVjtBQUFBLE1BS0VDLFNBQVMsQ0FMWDtBQUFBLE1BTUVDLE9BQU8sSUFOVDtBQUFBLE1BT0VDLHdCQVBGO0FBQUEsTUFRRUMseUJBUkY7QUFBQSxNQVNFQyxTQUFTNWIsS0FBSzZiLEdBQUwsQ0FBUyxFQUFULEVBQWFQLGFBQWEsQ0FBMUIsQ0FUWDs7QUFXRTtBQUNBO0FBQ0E7QUFDRixTQUFPN1YsUUFBUTRWLElBQUlqa0IsTUFBbkIsRUFBMkI7QUFDekI7QUFDQXFrQixXQUFPLElBQVA7QUFDQUYsWUFBUSxDQUFSO0FBQ0FDLGFBQVMsQ0FBVDs7QUFFQSxPQUFHO0FBQ0RDLGFBQU9KLElBQUlTLFVBQUosQ0FBZXJXLE9BQWYsSUFBMEIsRUFBakM7QUFDQStWLGdCQUFVLENBQUNDLE9BQU8sSUFBUixLQUFpQkYsS0FBM0I7QUFDQUEsZUFBUyxDQUFUO0FBQ0QsS0FKRCxRQUlTRSxRQUFRLElBSmpCOztBQU1BQyxzQkFBb0JGLFNBQVMsQ0FBVixHQUFlLEVBQUVBLFVBQVUsQ0FBWixDQUFmLEdBQWlDQSxVQUFVLENBQTlEOztBQUVBRCxZQUFRQyxTQUFTLENBQWpCOztBQUVBLE9BQUc7QUFDREMsYUFBT0osSUFBSVMsVUFBSixDQUFlclcsT0FBZixJQUEwQixFQUFqQztBQUNBK1YsZ0JBQVUsQ0FBQ0MsT0FBTyxJQUFSLEtBQWlCRixLQUEzQjtBQUNBQSxlQUFTLENBQVQ7QUFDRCxLQUpELFFBSVNFLFFBQVEsSUFKakI7O0FBTUFFLHVCQUFxQkgsU0FBUyxDQUFWLEdBQWUsRUFBRUEsVUFBVSxDQUFaLENBQWYsR0FBaUNBLFVBQVUsQ0FBL0Q7O0FBRUFoZ0IsV0FBT2tnQixlQUFQO0FBQ0FqZ0IsV0FBT2tnQixnQkFBUDs7QUFFQS9qQixnQkFBWW1PLElBQVosQ0FBaUIsQ0FBQ3ZLLE1BQU1vZ0IsTUFBUCxFQUFlbmdCLE1BQU1tZ0IsTUFBckIsQ0FBakI7QUFDRDs7QUFFRCxTQUFPaGtCLFdBQVA7QUFDRCxDQTlDRDs7a0JBZ0Rld2pCLFE7Ozs7Ozs7Ozs7Ozs7OztrQkM1Q1NXLG9COztBQVR4Qjs7OztBQUNBOztBQUVBOzs7Ozs7QUFFQTs7OztBQUllLFNBQVNBLG9CQUFULEdBQWdDO0FBQzdDLE1BQU1DLE1BQU03aUIsU0FBUzhpQixzQkFBVCxDQUFnQywyQkFBaEMsRUFBNkQsQ0FBN0QsQ0FBWjtBQUNBO0FBQ0FELE1BQUlFLE9BQUosR0FBYyxTQUFTQyx5QkFBVCxHQUFxQztBQUNqRDtBQUNBLFFBQU1DLE9BQU9qakIsU0FBU3dFLGNBQVQsQ0FBd0IsYUFBeEIsQ0FBYjtBQUNBeWUsU0FBS3hkLEtBQUwsR0FBYSxjQUFiO0FBQ0EsUUFBSSxnQkFBTS9KLElBQU4sQ0FBV0csT0FBZixFQUF3QjtBQUN0Qm9uQixXQUFLeGQsS0FBTCxHQUFhLGdCQUFNL0osSUFBTixDQUFXRyxPQUF4QjtBQUNBLHNCQUFNQyxNQUFOLGdCQUFvQixnQkFBTUosSUFBMUI7QUFDQSw0Q0FBNEIsUUFBNUI7QUFDRCxLQUpELE1BSU87QUFDTHFCLGNBQVFDLEdBQVIsQ0FBWSwwQkFBWjtBQUNBMEssZ0JBQVV3YixXQUFWLENBQXNCQyxrQkFBdEIsQ0FBeUMsVUFBQzFDLFFBQUQsRUFBYztBQUNyRDFqQixnQkFBUUMsR0FBUixDQUFZeWpCLFFBQVo7QUFEcUQsK0JBRXJCQSxTQUFTZCxNQUZZO0FBQUEsWUFFN0MvakIsUUFGNkMsb0JBRTdDQSxRQUY2QztBQUFBLFlBRW5DRCxTQUZtQyxvQkFFbkNBLFNBRm1DOztBQUdyRCx3QkFBTUQsSUFBTixDQUFXRSxRQUFYLEdBQXNCQSxRQUF0QjtBQUNBLHdCQUFNRixJQUFOLENBQVdDLFNBQVgsR0FBdUJBLFNBQXZCO0FBQ0Esd0JBQU1HLE1BQU4sZ0JBQW9CLGdCQUFNSixJQUExQjtBQUNBLDhDQUE0QixRQUE1QjtBQUNBLDBDQUFtQixVQUFDOEcsR0FBRCxFQUFNckYsSUFBTixFQUFZdEIsT0FBWixFQUF3QjtBQUN6Q29uQixlQUFLeGQsS0FBTCxHQUFhNUosT0FBYjtBQUNBLDBCQUFNSCxJQUFOLENBQVdHLE9BQVgsR0FBcUJBLE9BQXJCO0FBQ0QsU0FIRDtBQUlELE9BWEQ7QUFZRDtBQUNGLEdBdkJEO0FBd0JELEM7Ozs7Ozs7Ozs7Ozs7OztrQkMyRHVCdW5CLGtCOztBQWhHeEI7Ozs7QUFFQTs7QUFDQTs7QUFFQTs7Ozs7O0FBRUE7Ozs7QUFJQSxTQUFTQyxnQkFBVCxDQUEwQkMsSUFBMUIsRUFBZ0M7QUFDOUIsTUFBTWhHLFFBQVF0ZCxTQUFTd0UsY0FBVCxDQUF3QjhlLElBQXhCLENBQWQ7O0FBRUEsK0JBQWE7QUFDWGhHLFdBQU90ZCxTQUFTd0UsY0FBVCxDQUF3QjhlLElBQXhCLENBREk7QUFFWHhmLFdBQU8sZUFBQzRSLElBQUQsRUFBTzZOLE1BQVAsRUFBa0I7QUFDdkIsNkJBQVE3TixJQUFSLEVBQWMsVUFBQ2xULEdBQUQsRUFBTUMsT0FBTixFQUFrQjtBQUM5QixZQUFJLENBQUNELEdBQUwsRUFBVTtBQUNSLGNBQU1NLElBQUlMLE9BQVY7QUFDQTtBQUNBO0FBQ0EsY0FBSUssRUFBRTVGLElBQUYsS0FBVyxtQkFBWCxJQUFrQzRGLEVBQUVqRixRQUFwQyxJQUFnRGlGLEVBQUVqRixRQUFGLENBQVdJLE1BQVgsR0FBb0IsQ0FBeEUsRUFBMkU7QUFDekU7QUFDQTtBQUNBO0FBQ0EsZ0JBQU11bEIsc0JBQXNCLFNBQXRCQSxtQkFBc0I7QUFBQSxxQkFDekIsRUFBRUMsT0FBT3ZsQixRQUFRNkUsVUFBakIsRUFBNkIyZ0IsTUFBTXhsQixPQUFuQyxFQUR5QjtBQUFBLGFBQTVCO0FBRUEsZ0JBQU15bEIsY0FBYzdnQixFQUFFakYsUUFBRixDQUFXdEIsR0FBWCxDQUFlaW5CLG1CQUFmLENBQXBCO0FBQ0FELG1CQUFPSSxXQUFQO0FBQ0Q7QUFDRixTQWJELE1BYU87QUFDTDVtQixrQkFBUUMsR0FBUixzQkFBK0IwWSxJQUEvQixVQUF3Q2xULEdBQXhDLEVBREssQ0FDMkM7QUFDakQ7QUFDRixPQWpCRDtBQWtCRCxLQXJCVTtBQXNCWG9oQixjQUFVLGtCQUFDRixJQUFELEVBQVU7QUFDbEI7QUFDQXBHLFlBQU03WCxLQUFOLEdBQWNpZSxLQUFLM2dCLFVBQW5CO0FBQ0Q7QUF6QlUsR0FBYjtBQTJCRDs7QUFHRDs7OztBQUlBLFNBQVM4Z0Isc0JBQVQsQ0FBZ0Noa0IsUUFBaEMsRUFBMEM7QUFDeEMsU0FBTyxTQUFTaWtCLGtCQUFULENBQTRCbkosS0FBNUIsRUFBbUM7QUFDeEMsUUFBTW1GLE9BQU9uRixNQUFNdkosTUFBTixDQUFhM0wsS0FBMUI7QUFDQSxRQUFJcWEsU0FBUyxFQUFiLEVBQWlCO0FBQ2Y7QUFDQSxzQkFBTWpnQixRQUFOLEVBQWdCbEUsU0FBaEIsR0FBNEIsSUFBNUI7QUFDQSxzQkFBTWtFLFFBQU4sRUFBZ0JqRSxRQUFoQixHQUEyQixJQUEzQjtBQUNBLHNCQUFNaUUsUUFBTixFQUFnQmhFLE9BQWhCLEdBQTBCLElBQTFCO0FBQ0EsNENBQTRCZ0UsUUFBNUI7QUFDQTtBQUNEO0FBQ0Q5QyxZQUFRQyxHQUFSLENBQVkscUJBQVosRUFBbUM4aUIsSUFBbkM7QUFDQSwyQkFBUUEsSUFBUixFQUFjLFVBQUN0ZCxHQUFELEVBQU1DLE9BQU4sRUFBa0I7QUFDOUIsVUFBSSxDQUFDRCxHQUFMLEVBQVU7QUFDUixZQUFNTSxJQUFJTCxPQUFWO0FBQ0ExRixnQkFBUUMsR0FBUiw0QkFBcUM4aUIsSUFBckMsU0FBK0NoZCxDQUEvQztBQUNBLGFBQUs7QUFDSEEsVUFBRTVGLElBQUYsS0FBVyxtQkFBWCxJQUFrQzRGLEVBQUVqRixRQUFwQyxJQUFnRGlGLEVBQUVqRixRQUFGLENBQVdJLE1BQVgsR0FBb0IsQ0FEdEUsRUFFRTtBQUNBLGNBQUk2RSxFQUFFakYsUUFBRixDQUFXLENBQVgsRUFBY2tGLFVBQWxCLEVBQThCO0FBQzVCO0FBQ0E7QUFDQTtBQUNBLDRCQUFNbEQsUUFBTixFQUFnQmhFLE9BQWhCLEdBQTBCaUgsRUFBRWpGLFFBQUYsQ0FBVyxDQUFYLEVBQWNrRixVQUF4QztBQUNEO0FBQ0QsY0FBSUQsRUFBRWpGLFFBQUYsQ0FBVyxDQUFYLEVBQWNxQixNQUFsQixFQUEwQjtBQUFBLHNEQUlnQzRELEVBQUVqRixRQUFGLENBQVcsQ0FBWCxFQUFjcUIsTUFKOUM7QUFDeEI7QUFDQTtBQUNBOzs7QUFDQyw0QkFBTVcsUUFBTixFQUFnQmxFLFNBSk87QUFJSSw0QkFBTWtFLFFBQU4sRUFBZ0JqRSxRQUpwQjs7QUFLeEJtQixvQkFBUUMsR0FBUixDQUFZLDBCQUFaLEVBQXdDLENBQUMsZ0JBQU02QyxRQUFOLEVBQWdCbEUsU0FBakIsRUFBNEIsZ0JBQU1rRSxRQUFOLEVBQWdCakUsUUFBNUMsQ0FBeEM7QUFDRDtBQUNEO0FBQ0EsZ0RBQTRCaUUsUUFBNUI7QUFDRDtBQUNEO0FBQ0QsT0F2QkQsTUF1Qk87QUFDTDlDLGdCQUFRQyxHQUFSLHNCQUErQjhpQixJQUEvQixVQUF3Q3RkLEdBQXhDLEVBREssQ0FDMkM7QUFDakQ7QUFDRixLQTNCRDtBQTRCRCxHQXZDRDtBQXdDRDs7QUFFRDs7Ozs7QUFLZSxTQUFTNGdCLGtCQUFULENBQTRCRSxJQUE1QixFQUFrQ3pqQixRQUFsQyxFQUE0QztBQUN6RDtBQUNBLE1BQU15ZCxRQUFRdGQsU0FBU3dFLGNBQVQsQ0FBd0I4ZSxJQUF4QixDQUFkO0FBQ0FoRyxRQUFNeUcsUUFBTixHQUFpQkYsdUJBQXVCaGtCLFFBQXZCLENBQWpCOztBQUVBO0FBQ0F3akIsbUJBQWlCQyxJQUFqQjtBQUNELEM7Ozs7OztBQ3ZHRCwrRUFBYTtBQUFBO0FBQUE7QUFBQTtBQUFBLHFHQUFtRCw2REFBNkQsVUFBVSw0Q0FBNEMsU0FBUywyQ0FBMkMsNkJBQTZCLFlBQVksYUFBYSxjQUFjLGFBQWEseUJBQXlCLGFBQWEsbUNBQW1DLGFBQWEsS0FBSyxhQUFhLDZCQUE2QixrQkFBa0Isc0JBQXNCLGdCQUFnQixFQUFFLGtCQUFrQiw2QkFBNkIsZ0NBQWdDLHVCQUF1QixrQkFBa0IsNkJBQTZCLDBCQUEwQiwwREFBMEQseUJBQXlCLFVBQVUsaUJBQWlCLDRDQUE0QyxXQUFXLDJDQUEyQyxnRUFBZ0Usc0RBQXNELGNBQWMsK0JBQStCLDZCQUE2Qiw4REFBOEQsd0VBQXdFLDRKQUE0SixjQUFjLGtDQUFrQyxxR0FBcUcsNkNBQTZDLFFBQVEsYUFBYSwyQ0FBMkMsZUFBZSxzQ0FBc0MsMEhBQTBILEtBQUssOERBQThELDBCQUEwQixhQUFhLHVCQUF1QixpQ0FBaUMsMEJBQTBCLElBQUksd0JBQXdCLFNBQVMsT0FBTyxhQUFhLG9FQUFvRSxZQUFZLGFBQWEsaUJBQWlCLFNBQVMsT0FBTyxjQUFjLDRCQUE0QiwyQkFBMkIsVUFBVSxjQUFjLEtBQUsseUJBQXlCLG1CQUFtQix1REFBdUQsc0NBQXNDLGFBQWEsc0JBQXNCLHlCQUF5QixNQUFNLGFBQWEsK0lBQStJLG1CQUFtQixvQkFBb0IsZ0ZBQWdGLCtDQUErQyw0UEFBNFAsV0FBVyxTQUFTLEUiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gNyk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgMDMxOGVkYTZjZWE4ZjkyM2RkODYiLCJcbi8vIEFwcGxpY2F0aW9uIHN0YXRlLlxuZXhwb3J0IGRlZmF1bHQge1xuICBtYXhXYWxrRGlzdGFuY2U6IDAuMjUsXG4gIHVzZXI6IHtcbiAgICBsb25naXR1ZGU6IG51bGwsXG4gICAgbGF0aXR1ZGU6IG51bGwsXG4gICAgYWRkcmVzczogbnVsbCxcbiAgfSxcbiAgb3JpZ2luOiB7XG4gICAgbG9uZ2l0dWRlOiBudWxsLFxuICAgIGxhdGl0dWRlOiBudWxsLFxuICAgIGFkZHJlc3M6IG51bGwsXG4gIH0sXG4gIGRlc3RpbmF0aW9uOiB7XG4gICAgbG9uZ2l0dWRlOiBudWxsLFxuICAgIGxhdGl0dWRlOiBudWxsLFxuICAgIGFkZHJlc3M6IG51bGwsXG4gIH0sXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3N0YXRlLmpzIiwiaW1wb3J0IHR1cmZDaXJjbGUgZnJvbSAnQHR1cmYvY2lyY2xlJztcbmltcG9ydCB7IGZlYXR1cmVDb2xsZWN0aW9uIGFzIHR1cmZGZWF0dXJlQ29sbGVjdGlvbiwgcG9pbnQgYXMgdHVyZlBvaW50IH0gZnJvbSAnQHR1cmYvaGVscGVycyc7XG5pbXBvcnQgdHVyZldpdGhpbiBmcm9tICdAdHVyZi93aXRoaW4nO1xuXG5pbXBvcnQgU3RhdGlvbkZlZWQgZnJvbSAnLi9TdGF0aW9uRmVlZCc7XG5pbXBvcnQgZ2V0UG9wdXBDb250ZW50IGZyb20gJy4vcG9wdXBzJztcbmltcG9ydCB1c2VyR2VvbG9jYXRlIGZyb20gJy4vdXNlckdlb2xvY2F0ZSc7XG5pbXBvcnQgZmV0Y2hSb3V0ZSBmcm9tICcuL3JvdXRlcic7XG5cbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHN0YXRlIGZyb20gJy4vc3RhdGUnO1xuXG5jb25zdCBzdGF0aW9uc1VSTCA9IGNvbmZpZy5zdGF0aW9uc1VybDtcblxubGV0IG1hcDtcblxuZnVuY3Rpb24gYWRkU3RhdGlvbnMoKSB7XG4gIG1hcC5vbignbG9hZCcsICgpID0+IHtcbiAgICB3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgbWFwLmdldFNvdXJjZSgnc3RhdGlvbnMtc291cmNlJykuc2V0RGF0YShTdGF0aW9uRmVlZC5nZXRTdGF0aW9ucygpKTtcbiAgICAgIC8vIG1hcC5nZXRTb3VyY2UoJ3N0YXRpb25zLXNvdXJjZScpLnNldERhdGEoc3RhdGlvbnNVUkwpO1xuICAgICAgY29uc29sZS5sb2coJ3JlZmV0Y2hpbmcgbGl2ZSBzdGF0aW9uIGRhdGEnKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIH0sIDMwICogMTAwMCk7IC8vIGV2ZXJ5IE4gc2Vjb25kcyAoaW4gbWlsbGlzZWNvbmRzKVxuXG4gICAgbWFwLmFkZFNvdXJjZSgnc3RhdGlvbnMtc291cmNlJywgeyB0eXBlOiAnZ2VvanNvbicsIGRhdGE6IHN0YXRpb25zVVJMIH0pO1xuICAgIG1hcC5hZGRMYXllcih7XG4gICAgICBpZDogJ3N0YXRpb25zLWxheWVyJyxcbiAgICAgIHR5cGU6ICdjaXJjbGUnLFxuICAgICAgc291cmNlOiAnc3RhdGlvbnMtc291cmNlJyxcbiAgICAgIHBhaW50OiB7XG4gICAgICAgICdjaXJjbGUtcmFkaXVzJzogMTIsXG4gICAgICAgICdjaXJjbGUtY29sb3InOiAnI0I0MjIyMicsXG4gICAgICAgICdjaXJjbGUtb3BhY2l0eSc6IDAsIC8vIHRyYW5zcGFyZW50IGRvdHMgc2l6ZWQgZm9yIGludGVyYWN0aW9uIC0gYWxsb3dzIHBvcHVwXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gQ2hhbmdlIHRoZSBjdXJzb3IgdG8gYSBwb2ludGVyIHdoZW4gdGhlIG1vdXNlIGlzIG92ZXIgdGhlIGxheWVyLlxuICAgIG1hcC5vbignbW91c2VlbnRlcicsICdzdGF0aW9ucy1sYXllcicsICgpID0+IHtcbiAgICAgIG1hcC5nZXRDYW52YXMoKS5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgfSk7XG5cbiAgICAvLyBDaGFuZ2UgaXQgYmFjayB0byBhIHBvaW50ZXIgd2hlbiBpdCBsZWF2ZXMuXG4gICAgbWFwLm9uKCdtb3VzZWxlYXZlJywgJ3N0YXRpb25zLWxheWVyJywgKCkgPT4ge1xuICAgICAgbWFwLmdldENhbnZhcygpLnN0eWxlLmN1cnNvciA9ICcnO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gYWRkUG9wdXBzKCkge1xuICBtYXAub24oJ2NsaWNrJywgKGUpID0+IHtcbiAgICBjb25zdCBmZWF0dXJlcyA9IG1hcC5xdWVyeVJlbmRlcmVkRmVhdHVyZXMoZS5wb2ludCwge1xuICAgICAgbGF5ZXJzOiBbJ3N0YXRpb25zLWxheWVyJ10sIC8vIHJlcGxhY2UgdGhpcyB3aXRoIHRoZSBuYW1lIG9mIHRoZSBsYXllclxuICAgIH0pO1xuXG4gICAgaWYgKCFmZWF0dXJlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBmZWF0dXJlID0gZmVhdHVyZXNbMF07XG5cbiAgICBjb25zdCBwb3B1cCA9IG5ldyBtYXBib3hnbC5Qb3B1cCh7IG9mZnNldDogWzAsIC0xNV0gfSlcbiAgICAgIC5zZXRMbmdMYXQoZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlcylcbiAgICAgIC5zZXRIVE1MKGdldFBvcHVwQ29udGVudChmZWF0dXJlKSlcbiAgICAgIC5zZXRMbmdMYXQoZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlcylcbiAgICAgIC5hZGRUbyhtYXApO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlcnNjb3JlLWRhbmdsZVxuICAgIHBvcHVwLl9jb250YWluZXIuY2xhc3NMaXN0LmFkZCgnc3RhdGlvbi1wb3B1cC0tY29udGFpbmVyJyk7IC8vIGZvciBzdHlsaW5nXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBhZGRFbXB0eVN0YXRpb25zTmVhcmJ5U291cmNlcygpIHtcbiAgbWFwLm9uKCdsb2FkJywgKCkgPT4ge1xuICAgIGNvbnN0IGVtcHR5RmVhdHVyZVNldCA9IHtcbiAgICAgIHR5cGU6ICdGZWF0dXJlQ29sbGVjdGlvbicsXG4gICAgICBmZWF0dXJlczogW10sXG4gICAgfTtcbiAgICBtYXAuYWRkU291cmNlKCdzdGF0aW9ucy1uZWFyLW9yaWdpbicsIHtcbiAgICAgIHR5cGU6ICdnZW9qc29uJyxcbiAgICAgIGRhdGE6IGVtcHR5RmVhdHVyZVNldCxcbiAgICAgIG1heHpvb206IDIyLCAvLyBvdGhlcndpc2Ugd2UgZ2V0IHByZWNpc2lvbiAvIG1pc2FsaWdubWVudCBlcnJvcnNcbiAgICAgIC8vIG1pZ2h0IHJlbGF0ZSB0bzpcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXBib3gvbWFwYm94LWdsLWpzL2lzc3Vlcy8yMjc5XG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L21hcGJveC1nbC1qcy9pc3N1ZXMvMTczM1xuICAgIH0pO1xuICAgIG1hcC5hZGRTb3VyY2UoJ3N0YXRpb25zLW5lYXItZGVzdGluYXRpb24nLCB7XG4gICAgICB0eXBlOiAnZ2VvanNvbicsXG4gICAgICBkYXRhOiBlbXB0eUZlYXR1cmVTZXQsXG4gICAgICBtYXh6b29tOiAyMixcbiAgICB9KTtcbiAgfSk7XG59XG5cblxuLyoqXG4gKiBJbnN0YW50aWF0ZSBtYXAgd2l0aCBzdGF0aW9ucy5cbiAqIEBwYXJhbSB7W2xvbixsYXRdfSBjZW50ZXI6IGxvbixsYXQgY29vcmRzIG9uIHdoaWNoIHRvIGNlbnRlciB0aGUgdmlld1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpbml0TWFwKGNlbnRlciwgem9vbSA9IDgpIHtcbiAgbWFwID0gbmV3IG1hcGJveGdsLk1hcCh7XG4gICAgY29udGFpbmVyOiAnbWFwJyxcbiAgICBzdHlsZTogY29uZmlnLm1hcFN0eWxlLFxuICAgIHpvb20sXG4gICAgY2VudGVyLFxuICB9KTtcblxuICAvLyBBZGQgZ2VvbG9jYXRlIGNvbnRyb2wgdG8gdGhlIG1hcC5cbiAgY29uc3QgZ2VvbG9jYXRlQ29udHJvbCA9IG5ldyBtYXBib3hnbC5HZW9sb2NhdGVDb250cm9sKHtcbiAgICBwb3NpdGlvbk9wdGlvbnM6IHtcbiAgICAgIGVuYWJsZUhpZ2hBY2N1cmFjeTogdHJ1ZSxcbiAgICB9LFxuICAgIHRyYWNrVXNlckxvY2F0aW9uOiB0cnVlLFxuICB9KTtcbiAgbWFwLmFkZENvbnRyb2woZ2VvbG9jYXRlQ29udHJvbCk7XG4gIGdlb2xvY2F0ZUNvbnRyb2wub24oJ2dlb2xvY2F0ZScsIHVzZXJHZW9sb2NhdGUpO1xuXG4gIGFkZEVtcHR5U3RhdGlvbnNOZWFyYnlTb3VyY2VzKCk7XG4gIC8vIGZldGNoU3RhdGlvbnMoKTtcbiAgYWRkU3RhdGlvbnMoKTtcbiAgYWRkUG9wdXBzKCk7XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBsb2NhdGlvbiAtIG9yaWdpbiBvciBkZXN0aW5hdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZmx5VG8obG9jYXRpb24pIHtcbiAgLy8gY29uc29sZS5sb2coYGZseWluZyB0bzpcbiAgLy8gJHtbc3RhdGVbbG9jYXRpb25dLmxvbmdpdHVkZSwgc3RhdGVbbG9jYXRpb25dLmxhdGl0dWRlXX0gKCR7c3RhdGVbbG9jYXRpb25dLmFkZHJlc3N9KWApO1xuICBtYXAuZmx5VG8oe1xuICAgIGNlbnRlcjogW3N0YXRlW2xvY2F0aW9uXS5sb25naXR1ZGUsIHN0YXRlW2xvY2F0aW9uXS5sYXRpdHVkZV0sXG4gICAgem9vbTogMTQsXG4gIH0pO1xufVxuXG5cbmNvbnN0IGVuZHBvaW50TWFya2VycyA9IHt9O1xuXG4vKipcbiAqIEFkZCBvciB1cGRhdGUgdGhlIG9yaWdpbiBvciBkZXN0aW5hdGlvbiBtYXJrZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSBsb2NhdGlvbiAtIG9yaWdpbiBvciBkZXN0aW5hdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyRGlyZWN0aW9uc01hcmtlcihsb2NhdGlvbikge1xuICBpZiAoZW5kcG9pbnRNYXJrZXJzW2xvY2F0aW9uXSkge1xuICAgIC8vIGNvbnNvbGUubG9nKGBzZXR0aW5nIGVuZHBvaW50IGZvciAke2xvY2F0aW9ufSB0b1xuICAgIC8vICR7W3N0YXRlW2xvY2F0aW9uXS5sb25naXR1ZGUsIHN0YXRlW2xvY2F0aW9uXS5sYXRpdHVkZV19YCk7XG4gICAgZW5kcG9pbnRNYXJrZXJzW2xvY2F0aW9uXS5zZXRMbmdMYXQoW3N0YXRlW2xvY2F0aW9uXS5sb25naXR1ZGUsIHN0YXRlW2xvY2F0aW9uXS5sYXRpdHVkZV0pO1xuICAgIC8vIGVuZHBvaW50TWFya2Vyc1tsb2NhdGlvbl0uYWRkVG8obWFwKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBjb25zb2xlLmxvZyhgY3JlYXRpbmcgJHtsb2NhdGlvbn0gbWFya2VyYCk7XG4gICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBlbC5jbGFzc05hbWUgPSBgbWFya2VyIG1hcC1tYXJrZXItZGlyZWN0aW9ucyBpcy0ke2xvY2F0aW9ufWA7XG4gICAgZW5kcG9pbnRNYXJrZXJzW2xvY2F0aW9uXSA9IG5ldyBtYXBib3hnbC5NYXJrZXIoZWwpXG4gICAgICAuc2V0TG5nTGF0KFtzdGF0ZVtsb2NhdGlvbl0ubG9uZ2l0dWRlLCBzdGF0ZVtsb2NhdGlvbl0ubGF0aXR1ZGVdKVxuICAgICAgLmFkZFRvKG1hcCk7XG4gIH1cbn1cblxuXG4vKipcbiAqIFJldHVybiBhIEZlYXR1cmVDb2xsZWN0aW9uIG9mIHN0YXRpb25zIHdpdGhpbiBzdGF0ZS5tYXhXYWxraW5nRGlzdGFuY2Ugb2YgbG9jYXRpb24uXG4gKiBAcGFyYW0ge1N0cmluZ30gbG9jYXRpb24gLSBvcmlnaW4gb3IgZGVzdGluYXRpb25cbiAqL1xuZnVuY3Rpb24gZ2V0U3RhdGlvbnNOZWFyKGxvY2F0aW9uKSB7XG4gIGlmIChzdGF0ZS5tYXhXYWxrRGlzdGFuY2UgPT09IDApIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogJ0ZlYXR1cmVDb2xsZWN0aW9uJyxcbiAgICAgIGZlYXR1cmVzOiBbXSxcbiAgICB9O1xuICB9XG5cbiAgLy8gZ2V0IGFsbCBzdGF0aW9uc1xuICBjb25zdCBzdGF0aW9ucyA9IFN0YXRpb25GZWVkLmdldFN0YXRpb25zQXJyYXkoKTtcbiAgLy8gY29uc3Qgc3RhdGlvbnMgPSBtYXAucXVlcnlTb3VyY2VGZWF0dXJlcygnc3RhdGlvbnMtc291cmNlJyk7XG4gIC8vIGNhbid0IHVzZSBxdWVyeVNvdXJjZUZlYXR1cmVzOiBvbmx5IGxvb2tzIGluIHZpc2libGUgYXJlYVxuICAvLyBpZiBuZWVkZWQsIHVzZSBmaWx0ZXIgdG8gbGltaXQgcmVzdWx0IHNldCAob25seSB0aG9zZSB3LyBhdmFpbGFibGUgYmlrZXMsIGV0YykuXG4gIC8vIGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLWpzL2FwaS8jbWFwI3F1ZXJ5c291cmNlZmVhdHVyZXNcblxuICBjb25zb2xlLmxvZyhgZ290IGFsbCBzdGF0aW9uczsgc2VhcmNoaW5nIHdpdGhpbiAke3N0YXRlLm1heFdhbGtEaXN0YW5jZX1gLCBzdGF0aW9ucyk7XG5cbiAgLy8gdXNlIFR1cmYgdG8gZG8gYSBwcm94aW1pdHkgc2VhcmNoLlxuICAvLyBUT0RPOiBvciBiZXR0ZXIsIHVzZSBNYXB6ZW4gdG8gZG8gYW4gaXNvY2hyb25lIHNlYXJjaFxuICBjb25zdCBjZW50ZXIgPSB0dXJmUG9pbnQoW3N0YXRlW2xvY2F0aW9uXS5sb25naXR1ZGUsIHN0YXRlW2xvY2F0aW9uXS5sYXRpdHVkZV0pO1xuICBjb25zdCBzZWFyY2hXaXRoaW5GZWF0dXJlcyA9IHR1cmZGZWF0dXJlQ29sbGVjdGlvbihbdHVyZkNpcmNsZShjZW50ZXIsIHN0YXRlLm1heFdhbGtEaXN0YW5jZSwgeyB1bml0czogJ21pbGVzJyB9KV0pO1xuICBjb25zdCBzdGF0aW9uQ29sbGVjdGlvbiA9IHR1cmZGZWF0dXJlQ29sbGVjdGlvbihzdGF0aW9ucyk7XG5cbiAgY29uc3QgbmVhcmJ5U3RhdGlvbnMgPSB0dXJmV2l0aGluKHN0YXRpb25Db2xsZWN0aW9uLCBzZWFyY2hXaXRoaW5GZWF0dXJlcyk7XG4gIHJldHVybiBuZWFyYnlTdGF0aW9ucztcbn1cblxuLyoqXG4gKiBTcGxpdHMgdGhlIGdpdmVuIGdyb3VwIG9mIHN0YXRpb25zIGJhc2VkIG9uIGF2YWlsYWJpbGl0eSBzdGF0dXMuXG4gKiBJZiBsb2NhdGlvbiBpcyBvcmlnaW4sIGNyaXRlcmlhIGlzIGJpa2VzOyBvdGhlcndpc2UgaXQncyBkb2Nrcy5cbiAqIFJldHVybnMgW2VtcHR5LCBhdmFpbGFibGVdIHdoZXJlIGVhY2ggaXMgYSBGLkMuXG4gKiBAcGFyYW0ge1N0cmluZ30gbG9jYXRpb24gLSBvcmlnaW4gb3IgZGVzdGluYXRpb25cbiAqIEBwYXJhbSB7fSBzdGF0aW9uc0NvbGxlY3Rpb24gLSBGZWF0dXJlQ29sbGVjdGlvbiBvZiBzdGF0aW9ucyBhbHJlYWR5IG5lYXIgbG9jYXRpb25cbiAqL1xuLy8gZnVuY3Rpb24gc3BsaXRFbXB0eU9yQXZhaWxhYmxlKGxvY2F0aW9uLCBzdGF0aW9uc0NvbGxlY3Rpb24pIHtcbi8vICAgLypcbi8vICAgQmlrZXNoYXJlIHN0YXRpb25zIHdpdGhpbiB0aGUgc3BlY2lmaWVkIGRpc3RhbmNlIG9mIHRoZSBvcmlnaW5cbi8vICAgICAgdGhhdCBoYXZlIGJpa2VzIGF2YWlsYWJsZSBzaG91bGQgYmUgbWFya2VkIGdyZWVuXG4vLyAgICAgIHdpdGggbm8gYXZhaWxhYmxlIGJpa2VzIHNob3VsZCBiZSBtYXJrZWQgcmVkXG5cbi8vICAgQmlrZXNoYXJlIHN0YXRpb25zIHdpdGhpbiB0aGUgc3BlY2lmaWVkIGRpc3RhbmNlIG9mIHRoZSBkZXN0aW5hdGlvblxuLy8gICAgIHRoYXQgaGF2ZSBkb2NrcyBhdmFpbGFibGUgc2hvdWxkIGJlIG1hcmtlZCBncmVlblxuLy8gICAgIHRoYXQgaGF2ZSBubyBkb2NrcyBhdmFpbGFibGUgc2hvdWxkIGJlIG1hcmtlZCByZWRcbi8vICAgKi9cblxuLy8gICBjb25zdCBzdGF0aW9ucyA9IHN0YXRpb25zQ29sbGVjdGlvbi5mZWF0dXJlcztcbi8vICAgY29uc3QgYXZhaWxhYmxlQ3JpdGVyYSA9IGxvY2F0aW9uID09PSAnb3JpZ2luJyA/ICdhdmFpbGFibGVCaWtlcycgOiAnYXZhaWxhYmxlRG9ja3MnO1xuXG4vLyAgIGNvbnN0IGVtcHR5ID0gW107XG4vLyAgIGNvbnN0IGF2YWlsYWJsZSA9IFtdO1xuXG4vLyAgIHN0YXRpb25zLmZvckVhY2goKHN0YXRpb24pID0+IHtcbi8vICAgICBpZiAoc3RhdGlvbi5wcm9wZXJ0aWVzW2F2YWlsYWJsZUNyaXRlcmFdID4gMCkge1xuLy8gICAgICAgYXZhaWxhYmxlLnB1c2goc3RhdGlvbik7XG4vLyAgICAgfSBlbHNlIHtcbi8vICAgICAgIGVtcHR5LnB1c2goc3RhdGlvbik7XG4vLyAgICAgfVxuLy8gICB9KTtcblxuLy8gICByZXR1cm4gW2VtcHR5LCBhdmFpbGFibGVdO1xuLy8gfVxuXG5cbmZ1bmN0aW9uIGdldExheWVySWRGb3JTdGF0aW9uc05lYXIobG9jYXRpb24pIHtcbiAgcmV0dXJuIGBzdGF0aW9ucy1uZWFyLSR7bG9jYXRpb259YDtcbn1cblxuXG4vKipcbiAqIEhpZ2hsaWdodCB0aGUgZ2l2ZW4gc3RhdGlvbnMgbmVhciB0aGUgZ2l2ZW4gbG9jYXRpb25cbiAqIEBwYXJhbSB7U3RyaW5nfSBsb2NhdGlvbiAtIG9yaWdpbiBvciBkZXN0aW5hdGlvblxuICogQHBhcmFtIHtGZWF0dXJlQ29sbGVjdGlvbn0gc3RhdGlvbnMgbmVhcmJ5IHRoZSBvcmlnaW4gb3IgZGVzdGluYXRpb24gdG8gaGlnaGxpZ2h0XG4gKi9cbmZ1bmN0aW9uIHNob3dTdGF0aW9uc05lYXIobG9jYXRpb24sIHN0YXRpb25zKSB7XG4gIC8vIGRyYXcgc3RhdGlvbnMgYXMgbWFya2VycyBvbiB0aGUgbWFwXG4gIGNvbnNvbGUubG9nKGBzaG93aW5nIHN0YXRpb25zIG5lYXJieSAke2xvY2F0aW9ufTogYCwgc3RhdGlvbnMpO1xuXG4gIGNvbnN0IGxheWVyQW5kU291cmNlSWQgPSBnZXRMYXllcklkRm9yU3RhdGlvbnNOZWFyKGxvY2F0aW9uKTtcbiAgY29uc3QgYXZhaWxhYmxlQ3JpdGVyYSA9IGxvY2F0aW9uID09PSAnb3JpZ2luJyA/ICdhdmFpbGFibGVCaWtlcycgOiAnYXZhaWxhYmxlRG9ja3MnO1xuXG4gIGNvbnNvbGUubG9nKCdhZGRpbmcgbWF0Y2hpbmcgbmVhcmJ5IHN0YXRpb25zJyk7XG4gIG1hcC5nZXRTb3VyY2UobGF5ZXJBbmRTb3VyY2VJZCkuc2V0RGF0YShzdGF0aW9ucyk7XG5cbiAgY29uc3QgbGF5ZXIgPSBtYXAuZ2V0TGF5ZXIobGF5ZXJBbmRTb3VyY2VJZCk7XG4gIGlmICghbGF5ZXIpIHsgLy8gc2hvdWxkIG9ubHkgbmVlZCB0byBkbyB0aGlzIG9uY2UuXG4gICAgLy8gQ3JlYXRlIGEgbmV3IGNpcmNsZSBsYXllciBmcm9tIHRoZSBkYXRhIHNvdXJjZVxuICAgIG1hcC5hZGRMYXllcih7XG4gICAgICBpZDogbGF5ZXJBbmRTb3VyY2VJZCxcbiAgICAgIHR5cGU6ICdjaXJjbGUnLFxuICAgICAgc291cmNlOiBsYXllckFuZFNvdXJjZUlkLFxuICAgICAgcGFpbnQ6IHtcbiAgICAgICAgJ2NpcmNsZS1yYWRpdXMnOiAxMiwgLy8gYmlrZXNoYXJlIGljb24gaXMgMjRweCAoc2NhbGVkIGJ5IDEvMiBzbyAxMilcbiAgICAgICAgJ2NpcmNsZS1jb2xvcic6IHtcbiAgICAgICAgICBwcm9wZXJ0eTogYXZhaWxhYmxlQ3JpdGVyYSxcbiAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgLy8gXCJhdmFpbGFibGVcIjogMCAgIC0+IGNpcmNsZSBjb2xvciB3aWxsIGJlIHJlZFxuICAgICAgICAgICAgWzAsICdyZWQnXSxcbiAgICAgICAgICAgIC8vIFwiYXZhaWxhYmxlXCI6IDEgb3IgbW9yZSAtPiBjaXJjbGUgY29sb3Igd2lsbCBiZSBncmVlblxuICAgICAgICAgICAgWzEsICdsaWdodHNlYWdyZWVuJ10sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSwgJ2Jpa2VzaGFyZS1zdGF0aW9ucycpOyAvLyBwbGFjZSBjb2xvciBiZW5lYXRoIGJpa2VzaGFyZSBpY29uc1xuICB9XG59XG5cblxuZnVuY3Rpb24gY2xlYXJTdGF0aW9uc05lYXIobG9jYXRpb24pIHtcbiAgY29uc3QgbGF5ZXJJRCA9IGdldExheWVySWRGb3JTdGF0aW9uc05lYXIobG9jYXRpb24pO1xuICBjb25zdCBsYXllciA9IG1hcC5nZXRMYXllcihsYXllcklEKTtcbiAgaWYgKGxheWVyKSB7XG4gICAgbWFwLnJlbW92ZUxheWVyKGxheWVySUQpO1xuICB9XG59XG5cblxuLyoqXG4gKiBVcGRhdGUgc3RhdGlvbiByZXN1bHRzIG5lYXJieS5cbiAqIFdoZW4gdGhlIG9yaWdpbiBvciBkZXN0aW5hdGlvbiBpcyBzZXQsXG4gKiBvciB3aGVuIHRoZSB1c2VyJ3MgbWF4IHdhbGtpbmcgZGlzdGFuY2UgcHJlZmVyZW5jZSBjaGFuZ2VzLFxuICogdXBkYXRlIG5lYXJieSByZXN1bHRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFwVXBkYXRlTmVhcmJ5KCkge1xuICAvLyBjb25zb2xlLmxvZygnbWFwdXBkYXRlbmVhcmJ5KCknKTtcblxuICBbJ29yaWdpbicsICdkZXN0aW5hdGlvbiddLmZvckVhY2goKGxvY2F0aW9uKSA9PiB7XG4gICAgaWYgKHN0YXRlW2xvY2F0aW9uXS5sYXRpdHVkZSAmJiBzdGF0ZVtsb2NhdGlvbl0ubG9uZ2l0dWRlKSB7XG4gICAgICBjb25zdCBuZWFyYnlTdGF0aW9ucyA9IGdldFN0YXRpb25zTmVhcihsb2NhdGlvbik7XG4gICAgICBjb25zb2xlLmxvZyhgZ290IHN0YXRpb25zIG5lYXIgJHtsb2NhdGlvbn1gLCBuZWFyYnlTdGF0aW9ucyk7XG5cbiAgICAgIC8vIGlmIChtYXAuaXNNb3ZpbmcoKSkge1xuICAgICAgLy8gICBjb25zb2xlLmxvZygnTk9URTogbWFwIHdhcyBtb3ZpbmcsIHJlc2NoZWR1bGluZyBzdGF0aW9uIHVwZGF0ZSB0byBlbmQgb2YgbW92ZScpO1xuICAgICAgLy8gICBtYXAub25jZSgnbW92ZWVuZCcsICgpID0+IHtcbiAgICAgIC8vICAgICBjb25zb2xlLmxvZygnc3RhdGlvbiB1cGRhdGUgYWZ0ZXIgbW92ZSBlbmQnKTtcbiAgICAgIC8vICAgICBzaG93U3RhdGlvbnNOZWFyKGxvY2F0aW9uLCBuZWFyYnlTdGF0aW9ucyk7XG4gICAgICAvLyAgIH0pO1xuICAgICAgLy8gfSBlbHNlIHtcbiAgICAgIC8vICAgY29uc29sZS5sb2coJ21hcCBub3QgbW92aW5nOyBkb2luZyBzdGF0aW9uIHVwZGF0ZScpO1xuICAgICAgLy8gICBzaG93U3RhdGlvbnNOZWFyKGxvY2F0aW9uLCBuZWFyYnlTdGF0aW9ucyk7XG4gICAgICAvLyB9XG4gICAgICBzaG93U3RhdGlvbnNOZWFyKGxvY2F0aW9uLCBuZWFyYnlTdGF0aW9ucyk7XG4gICAgfSBlbHNlIHsgLy8gaWYgd2UgKmRvbid0KiBoYXZlIGEgcGFydGljdWxhciBsb2NhdGlvbiBlbmRwb2ludCxcbiAgICAgIC8vIHRoZW4gd2UgbmVlZCB0byBjbGVhciB0aGUgbWFya2Vyc1xuICAgICAgY2xlYXJTdGF0aW9uc05lYXIobG9jYXRpb24pO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG1hcENsZWFyUm91dGUoKSB7XG4gIGNvbnN0IHJvdXRlTGF5ZXIgPSBtYXAuZ2V0TGF5ZXIoJ3JvdXRlJyk7XG4gIGlmIChyb3V0ZUxheWVyKSB7XG4gICAgbWFwLnJlbW92ZUxheWVyKCdyb3V0ZScpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1hcFVwZGF0ZVJvdXRlKCkge1xuICBpZiAoc3RhdGUub3JpZ2luLmxhdGl0dWRlICYmIHN0YXRlLmRlc3RpbmF0aW9uLmxhdGl0dWRlKSB7XG4gICAgZmV0Y2hSb3V0ZShzdGF0ZS5vcmlnaW4sIHN0YXRlLmRlc3RpbmF0aW9uLCAocm91dGVMaW5lU3RyaW5nKSA9PiB7XG4gICAgICBsZXQgc291cmNlID0gbWFwLmdldFNvdXJjZSgncm91dGUnKTtcbiAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgc291cmNlLnNldERhdGEocm91dGVMaW5lU3RyaW5nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNvdXJjZSA9IG1hcC5hZGRTb3VyY2UoJ3JvdXRlJywgeyB0eXBlOiAnZ2VvanNvbicsIGRhdGE6IHJvdXRlTGluZVN0cmluZyB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gcGxhY2Ugcm91dGUgYmVuZWF0aCBuZWFyYnkgbWFya2VycyAodGhlbXNlbHZlcyBiZW5lYXRoIHN0YXRpb25zKVxuICAgICAgY29uc3QgbGF5ZXJBYm92ZSA9IGdldExheWVySWRGb3JTdGF0aW9uc05lYXIoJ29yaWdpbicpO1xuXG4gICAgICAvLyBjcmVhdGluZyBzb3VyY2UgZm9yIHRoZSBmaXJzdCB0aW1lOyBhZGQgYSBsYXllciBmb3IgaXQuXG4gICAgICAvLyBoYXZlIHRvIGRvIHRoaXMgZXZlcnkgdGltZT9cbiAgICAgIG1hcC5hZGRMYXllcih7XG4gICAgICAgIGlkOiAncm91dGUnLFxuICAgICAgICB0eXBlOiAnbGluZScsXG4gICAgICAgIHNvdXJjZTogJ3JvdXRlJyxcbiAgICAgICAgLy8gIHtcbiAgICAgICAgLy8gICB0eXBlOiAnZ2VvanNvbicsXG4gICAgICAgIC8vICAgZGF0YTogcm91dGVMaW5lU3RyaW5nLFxuICAgICAgICAvLyB9LFxuICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAnbGluZS1qb2luJzogJ3JvdW5kJyxcbiAgICAgICAgICAnbGluZS1jYXAnOiAncm91bmQnLFxuICAgICAgICB9LFxuICAgICAgICBwYWludDoge1xuICAgICAgICAgICdsaW5lLWNvbG9yJzogJyM0QUIyRjcnLCAvLyBnb29nbGUgbWFwcyBibHVlICM4ODhcbiAgICAgICAgICAnbGluZS13aWR0aCc6IDgsXG4gICAgICAgIH0sXG4gICAgICB9LCBsYXllckFib3ZlKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICAvLyB3ZSBkb24ndCBoYXZlIGJvdGggZW5kIHBvaW50cyAtIGVuc3VyZSBubyByb3V0ZSBzaG93blxuICAgIG1hcENsZWFyUm91dGUoKTtcbiAgfVxufVxuXG5cbi8qKlxuICogQWRkIG9yIHJlbW92ZSBlbmRwb2ludCBtYXJrZXIgYW5kIHVwZGF0ZSBuZWFyYnkgc3RhdGlvbnMuXG4gKiBAcGFyYW0ge1N0cmluZ30gbG9jYXRpb24gb3JpZ2luIG9yIGRlc3RpbmF0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXBVcGRhdGVEaXJlY3Rpb25zRW5kcG9pbnQobG9jYXRpb24pIHtcbiAgLy8gY29uc29sZS5sb2coJ21hcFVwZGF0ZURpcmVjdGlvbnNFbmRwb2ludCgpJyk7XG4gIG1hcFVwZGF0ZVJvdXRlKCk7XG4gIGlmIChzdGF0ZVtsb2NhdGlvbl0ubGF0aXR1ZGUgPT09IG51bGwgJiYgZW5kcG9pbnRNYXJrZXJzW2xvY2F0aW9uXSkge1xuICAgIC8vIGNsZWFyIG1hcmtlclxuICAgIGNvbnNvbGUubG9nKGBjbGVhcmluZyAke2xvY2F0aW9ufSBtYXJrZXIgKG5vIGxhdGl0dWRlKWApO1xuICAgIGVuZHBvaW50TWFya2Vyc1tsb2NhdGlvbl0ucmVtb3ZlKCk7XG4gICAgZW5kcG9pbnRNYXJrZXJzW2xvY2F0aW9uXSA9IG51bGw7XG4gIH0gZWxzZSB7XG4gICAgcmVuZGVyRGlyZWN0aW9uc01hcmtlcihsb2NhdGlvbik7XG4gICAgZmx5VG8obG9jYXRpb24pO1xuICB9XG4gIG1hcFVwZGF0ZU5lYXJieSgpO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL21hcC5qcyIsImV4cG9ydCBkZWZhdWx0IHtcbiAgbWFwemVuS2V5OiAnbWFwemVuLWh6VmJTcjUnLFxuICBtYXBib3hUb2tlbjogJ3BrLmV5SjFJam9pZEdWamFHbGxjMmhoY21zaUxDSmhJam9pWXprMlpFRldUU0o5LjhaWTZyRzJCV1hrREJtdkFQdm5fbncnLFxuICBtYXBTdHlsZTogJ21hcGJveDovL3N0eWxlcy90ZWNoaWVzaGFyay9jajk3NjkwcjAwYmNjMnN0aGtxeG44ZjJ2JyxcbiAgc3RhdGlvbnNVcmw6ICdodHRwczovL2xpdC1iZWFjaC0yMTU4Ni5oZXJva3VhcHAuY29tLycsIC8vIGdlb2pzb24gbWlycm9yIG9mIHN0YXRpb25zIGFwaVxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb25maWcuanMiLCJpbXBvcnQgZ2VvIGZyb20gJ21hcGJveC1nZW9jb2RpbmcnO1xuLy8gdmFyIGdlbyA9IHJlcXVpcmUoJ21hcGJveC1nZW9jb2RpbmcnKTtcblxuaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5cbmdlby5zZXRBY2Nlc3NUb2tlbihjb25maWcubWFwYm94VG9rZW4pO1xuXG4vKipcbiAqIFJldmVyc2UgR2VvY29kZSBsYXQvbG5nIC0tIHVzaW5nIE1hcGJveCB1bmRlciB0aGUgaG9vZC5cbiAqIEBwYXJhbSB7Kn0gbGF0XG4gKiBAcGFyYW0geyp9IGxuZ1xuICogQHBhcmFtIHsqfSBjYWxsYmFjazogKGVyciwgZ2VvRGF0YSkgPT4gYW55XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXZlcnNlR2VvY29kZShsYXQsIGxuZywgY2FsbGJhY2spIHtcbiAgLy8gUmV2ZXJzZSBnZW9jb2RlIGNvb3JkaW5hdGVzIHRvIGFkZHJlc3MuXG4gIGdlby5yZXZlcnNlR2VvY29kZSgnbWFwYm94LnBsYWNlcycsIGxuZywgbGF0LCAoZXJyLCBnZW9EYXRhKSA9PiB7XG4gICAgLy8gY29uc29sZS5sb2coZ2VvRGF0YSk7XG4gICAgY2FsbGJhY2soZXJyLCBnZW9EYXRhKTtcbiAgfSk7XG59XG5cblxuLyoqXG4gKiBHZW9jb2RlIGFkZHJlc3MgLSB1c2luZyBNYXBib3ggdW5kZXIgdGhlIGhvb2QuXG4gKiBAcGFyYW0ge3N0cmluZ30gYWRkcmVzc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IChlcnIsIGdlb0RhdGEpID0+IGFueVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VvY29kZShhZGRyZXNzLCBjYWxsYmFjaykge1xuICAvLyBHZW9jb2RlIGFuIGFkZHJlc3MgdG8gY29vcmRpbmF0ZXNcbiAgZ2VvLmdlb2NvZGUoJ21hcGJveC5wbGFjZXMnLCBhZGRyZXNzLCAoZXJyLCBnZW9EYXRhKSA9PiB7XG4gICAgLy8gY29uc29sZS5sb2coZ2VvRGF0YSk7XG4gICAgY2FsbGJhY2soZXJyLCBnZW9EYXRhKTtcbiAgfSk7XG59XG5cblxuLyoqXG4gKiBCaWFzIGdlb2NvZGluZyByZXN1bHRzIG5lYXIgdGhlIGNlbnRlci5cbiAqIEBwYXJhbSB7W2xvbmdpdHVkZSxsYXRpdHVkZV19IGNlbnRlciBmb3IgcHJveGltaXR5IGJpYXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEdlb2NkZXJDZW50ZXIoY2VudGVyKSB7XG4gIGdlby5zZXRTZWFyY2hDZW50ZXIoY2VudGVyKTtcbn1cblxuXG4vKipcbiAqIFNlYXJjaCB3aXRoaW5nIHRoZSBnaXZlbiBib3VuZGluZyBib3hcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYm94IGJvdW5kaW5nIGJveCBzdHJpbmcgaW4gZm9ybWF0IG1pblgsbWluWSxtYXhYLG1heFlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEdlb2NvZGVyQm91bmRzKGJib3gpIHtcbiAgZ2VvLnNldFNlYXJjaEJvdW5kcyhiYm94KTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9nZW9jb2Rlci5qcyIsIi8qXG5cdE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG5cdEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG4vLyBjc3MgYmFzZSBjb2RlLCBpbmplY3RlZCBieSB0aGUgY3NzLWxvYWRlclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih1c2VTb3VyY2VNYXApIHtcblx0dmFyIGxpc3QgPSBbXTtcblxuXHQvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG5cdGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0XHRyZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcblx0XHRcdHZhciBjb250ZW50ID0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtLCB1c2VTb3VyY2VNYXApO1xuXHRcdFx0aWYoaXRlbVsyXSkge1xuXHRcdFx0XHRyZXR1cm4gXCJAbWVkaWEgXCIgKyBpdGVtWzJdICsgXCJ7XCIgKyBjb250ZW50ICsgXCJ9XCI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gY29udGVudDtcblx0XHRcdH1cblx0XHR9KS5qb2luKFwiXCIpO1xuXHR9O1xuXG5cdC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG5cdGxpc3QuaSA9IGZ1bmN0aW9uKG1vZHVsZXMsIG1lZGlhUXVlcnkpIHtcblx0XHRpZih0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIilcblx0XHRcdG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIFwiXCJdXTtcblx0XHR2YXIgYWxyZWFkeUltcG9ydGVkTW9kdWxlcyA9IHt9O1xuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaWQgPSB0aGlzW2ldWzBdO1xuXHRcdFx0aWYodHlwZW9mIGlkID09PSBcIm51bWJlclwiKVxuXHRcdFx0XHRhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2lkXSA9IHRydWU7XG5cdFx0fVxuXHRcdGZvcihpID0gMDsgaSA8IG1vZHVsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBpdGVtID0gbW9kdWxlc1tpXTtcblx0XHRcdC8vIHNraXAgYWxyZWFkeSBpbXBvcnRlZCBtb2R1bGVcblx0XHRcdC8vIHRoaXMgaW1wbGVtZW50YXRpb24gaXMgbm90IDEwMCUgcGVyZmVjdCBmb3Igd2VpcmQgbWVkaWEgcXVlcnkgY29tYmluYXRpb25zXG5cdFx0XHQvLyAgd2hlbiBhIG1vZHVsZSBpcyBpbXBvcnRlZCBtdWx0aXBsZSB0aW1lcyB3aXRoIGRpZmZlcmVudCBtZWRpYSBxdWVyaWVzLlxuXHRcdFx0Ly8gIEkgaG9wZSB0aGlzIHdpbGwgbmV2ZXIgb2NjdXIgKEhleSB0aGlzIHdheSB3ZSBoYXZlIHNtYWxsZXIgYnVuZGxlcylcblx0XHRcdGlmKHR5cGVvZiBpdGVtWzBdICE9PSBcIm51bWJlclwiIHx8ICFhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG5cdFx0XHRcdGlmKG1lZGlhUXVlcnkgJiYgIWl0ZW1bMl0pIHtcblx0XHRcdFx0XHRpdGVtWzJdID0gbWVkaWFRdWVyeTtcblx0XHRcdFx0fSBlbHNlIGlmKG1lZGlhUXVlcnkpIHtcblx0XHRcdFx0XHRpdGVtWzJdID0gXCIoXCIgKyBpdGVtWzJdICsgXCIpIGFuZCAoXCIgKyBtZWRpYVF1ZXJ5ICsgXCIpXCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0bGlzdC5wdXNoKGl0ZW0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0cmV0dXJuIGxpc3Q7XG59O1xuXG5mdW5jdGlvbiBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0sIHVzZVNvdXJjZU1hcCkge1xuXHR2YXIgY29udGVudCA9IGl0ZW1bMV0gfHwgJyc7XG5cdHZhciBjc3NNYXBwaW5nID0gaXRlbVszXTtcblx0aWYgKCFjc3NNYXBwaW5nKSB7XG5cdFx0cmV0dXJuIGNvbnRlbnQ7XG5cdH1cblxuXHRpZiAodXNlU291cmNlTWFwICYmIHR5cGVvZiBidG9hID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0dmFyIHNvdXJjZU1hcHBpbmcgPSB0b0NvbW1lbnQoY3NzTWFwcGluZyk7XG5cdFx0dmFyIHNvdXJjZVVSTHMgPSBjc3NNYXBwaW5nLnNvdXJjZXMubWFwKGZ1bmN0aW9uIChzb3VyY2UpIHtcblx0XHRcdHJldHVybiAnLyojIHNvdXJjZVVSTD0nICsgY3NzTWFwcGluZy5zb3VyY2VSb290ICsgc291cmNlICsgJyAqLydcblx0XHR9KTtcblxuXHRcdHJldHVybiBbY29udGVudF0uY29uY2F0KHNvdXJjZVVSTHMpLmNvbmNhdChbc291cmNlTWFwcGluZ10pLmpvaW4oJ1xcbicpO1xuXHR9XG5cblx0cmV0dXJuIFtjb250ZW50XS5qb2luKCdcXG4nKTtcbn1cblxuLy8gQWRhcHRlZCBmcm9tIGNvbnZlcnQtc291cmNlLW1hcCAoTUlUKVxuZnVuY3Rpb24gdG9Db21tZW50KHNvdXJjZU1hcCkge1xuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcblx0dmFyIGJhc2U2NCA9IGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSk7XG5cdHZhciBkYXRhID0gJ3NvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LCcgKyBiYXNlNjQ7XG5cblx0cmV0dXJuICcvKiMgJyArIGRhdGEgKyAnICovJztcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXG4vLyBtb2R1bGUgaWQgPSA0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qXG5cdE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG5cdEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG5cbnZhciBzdHlsZXNJbkRvbSA9IHt9O1xuXG52YXJcdG1lbW9pemUgPSBmdW5jdGlvbiAoZm4pIHtcblx0dmFyIG1lbW87XG5cblx0cmV0dXJuIGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodHlwZW9mIG1lbW8gPT09IFwidW5kZWZpbmVkXCIpIG1lbW8gPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdHJldHVybiBtZW1vO1xuXHR9O1xufTtcblxudmFyIGlzT2xkSUUgPSBtZW1vaXplKGZ1bmN0aW9uICgpIHtcblx0Ly8gVGVzdCBmb3IgSUUgPD0gOSBhcyBwcm9wb3NlZCBieSBCcm93c2VyaGFja3Ncblx0Ly8gQHNlZSBodHRwOi8vYnJvd3NlcmhhY2tzLmNvbS8jaGFjay1lNzFkODY5MmY2NTMzNDE3M2ZlZTcxNWMyMjJjYjgwNVxuXHQvLyBUZXN0cyBmb3IgZXhpc3RlbmNlIG9mIHN0YW5kYXJkIGdsb2JhbHMgaXMgdG8gYWxsb3cgc3R5bGUtbG9hZGVyXG5cdC8vIHRvIG9wZXJhdGUgY29ycmVjdGx5IGludG8gbm9uLXN0YW5kYXJkIGVudmlyb25tZW50c1xuXHQvLyBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJwYWNrLWNvbnRyaWIvc3R5bGUtbG9hZGVyL2lzc3Vlcy8xNzdcblx0cmV0dXJuIHdpbmRvdyAmJiBkb2N1bWVudCAmJiBkb2N1bWVudC5hbGwgJiYgIXdpbmRvdy5hdG9iO1xufSk7XG5cbnZhciBnZXRFbGVtZW50ID0gKGZ1bmN0aW9uIChmbikge1xuXHR2YXIgbWVtbyA9IHt9O1xuXG5cdHJldHVybiBmdW5jdGlvbihzZWxlY3Rvcikge1xuXHRcdGlmICh0eXBlb2YgbWVtb1tzZWxlY3Rvcl0gPT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdHZhciBzdHlsZVRhcmdldCA9IGZuLmNhbGwodGhpcywgc2VsZWN0b3IpO1xuXHRcdFx0Ly8gU3BlY2lhbCBjYXNlIHRvIHJldHVybiBoZWFkIG9mIGlmcmFtZSBpbnN0ZWFkIG9mIGlmcmFtZSBpdHNlbGZcblx0XHRcdGlmIChzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdC8vIFRoaXMgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYWNjZXNzIHRvIGlmcmFtZSBpcyBibG9ja2VkXG5cdFx0XHRcdFx0Ly8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcblx0XHRcdFx0XHRzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuXHRcdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0XHRzdHlsZVRhcmdldCA9IG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdG1lbW9bc2VsZWN0b3JdID0gc3R5bGVUYXJnZXQ7XG5cdFx0fVxuXHRcdHJldHVybiBtZW1vW3NlbGVjdG9yXVxuXHR9O1xufSkoZnVuY3Rpb24gKHRhcmdldCkge1xuXHRyZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpXG59KTtcblxudmFyIHNpbmdsZXRvbiA9IG51bGw7XG52YXJcdHNpbmdsZXRvbkNvdW50ZXIgPSAwO1xudmFyXHRzdHlsZXNJbnNlcnRlZEF0VG9wID0gW107XG5cbnZhclx0Zml4VXJscyA9IHJlcXVpcmUoXCIuL3VybHNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGlzdCwgb3B0aW9ucykge1xuXHRpZiAodHlwZW9mIERFQlVHICE9PSBcInVuZGVmaW5lZFwiICYmIERFQlVHKSB7XG5cdFx0aWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gXCJvYmplY3RcIikgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHN0eWxlLWxvYWRlciBjYW5ub3QgYmUgdXNlZCBpbiBhIG5vbi1icm93c2VyIGVudmlyb25tZW50XCIpO1xuXHR9XG5cblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0b3B0aW9ucy5hdHRycyA9IHR5cGVvZiBvcHRpb25zLmF0dHJzID09PSBcIm9iamVjdFwiID8gb3B0aW9ucy5hdHRycyA6IHt9O1xuXG5cdC8vIEZvcmNlIHNpbmdsZS10YWcgc29sdXRpb24gb24gSUU2LTksIHdoaWNoIGhhcyBhIGhhcmQgbGltaXQgb24gdGhlICMgb2YgPHN0eWxlPlxuXHQvLyB0YWdzIGl0IHdpbGwgYWxsb3cgb24gYSBwYWdlXG5cdGlmICghb3B0aW9ucy5zaW5nbGV0b24pIG9wdGlvbnMuc2luZ2xldG9uID0gaXNPbGRJRSgpO1xuXG5cdC8vIEJ5IGRlZmF1bHQsIGFkZCA8c3R5bGU+IHRhZ3MgdG8gdGhlIDxoZWFkPiBlbGVtZW50XG5cdGlmICghb3B0aW9ucy5pbnNlcnRJbnRvKSBvcHRpb25zLmluc2VydEludG8gPSBcImhlYWRcIjtcblxuXHQvLyBCeSBkZWZhdWx0LCBhZGQgPHN0eWxlPiB0YWdzIHRvIHRoZSBib3R0b20gb2YgdGhlIHRhcmdldFxuXHRpZiAoIW9wdGlvbnMuaW5zZXJ0QXQpIG9wdGlvbnMuaW5zZXJ0QXQgPSBcImJvdHRvbVwiO1xuXG5cdHZhciBzdHlsZXMgPSBsaXN0VG9TdHlsZXMobGlzdCwgb3B0aW9ucyk7XG5cblx0YWRkU3R5bGVzVG9Eb20oc3R5bGVzLCBvcHRpb25zKTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gdXBkYXRlIChuZXdMaXN0KSB7XG5cdFx0dmFyIG1heVJlbW92ZSA9IFtdO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBpdGVtID0gc3R5bGVzW2ldO1xuXHRcdFx0dmFyIGRvbVN0eWxlID0gc3R5bGVzSW5Eb21baXRlbS5pZF07XG5cblx0XHRcdGRvbVN0eWxlLnJlZnMtLTtcblx0XHRcdG1heVJlbW92ZS5wdXNoKGRvbVN0eWxlKTtcblx0XHR9XG5cblx0XHRpZihuZXdMaXN0KSB7XG5cdFx0XHR2YXIgbmV3U3R5bGVzID0gbGlzdFRvU3R5bGVzKG5ld0xpc3QsIG9wdGlvbnMpO1xuXHRcdFx0YWRkU3R5bGVzVG9Eb20obmV3U3R5bGVzLCBvcHRpb25zKTtcblx0XHR9XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1heVJlbW92ZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGRvbVN0eWxlID0gbWF5UmVtb3ZlW2ldO1xuXG5cdFx0XHRpZihkb21TdHlsZS5yZWZzID09PSAwKSB7XG5cdFx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgZG9tU3R5bGUucGFydHMubGVuZ3RoOyBqKyspIGRvbVN0eWxlLnBhcnRzW2pdKCk7XG5cblx0XHRcdFx0ZGVsZXRlIHN0eWxlc0luRG9tW2RvbVN0eWxlLmlkXTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG59O1xuXG5mdW5jdGlvbiBhZGRTdHlsZXNUb0RvbSAoc3R5bGVzLCBvcHRpb25zKSB7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGl0ZW0gPSBzdHlsZXNbaV07XG5cdFx0dmFyIGRvbVN0eWxlID0gc3R5bGVzSW5Eb21baXRlbS5pZF07XG5cblx0XHRpZihkb21TdHlsZSkge1xuXHRcdFx0ZG9tU3R5bGUucmVmcysrO1xuXG5cdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgZG9tU3R5bGUucGFydHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0ZG9tU3R5bGUucGFydHNbal0oaXRlbS5wYXJ0c1tqXSk7XG5cdFx0XHR9XG5cblx0XHRcdGZvcig7IGogPCBpdGVtLnBhcnRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGRvbVN0eWxlLnBhcnRzLnB1c2goYWRkU3R5bGUoaXRlbS5wYXJ0c1tqXSwgb3B0aW9ucykpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgcGFydHMgPSBbXTtcblxuXHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IGl0ZW0ucGFydHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0cGFydHMucHVzaChhZGRTdHlsZShpdGVtLnBhcnRzW2pdLCBvcHRpb25zKSk7XG5cdFx0XHR9XG5cblx0XHRcdHN0eWxlc0luRG9tW2l0ZW0uaWRdID0ge2lkOiBpdGVtLmlkLCByZWZzOiAxLCBwYXJ0czogcGFydHN9O1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBsaXN0VG9TdHlsZXMgKGxpc3QsIG9wdGlvbnMpIHtcblx0dmFyIHN0eWxlcyA9IFtdO1xuXHR2YXIgbmV3U3R5bGVzID0ge307XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGl0ZW0gPSBsaXN0W2ldO1xuXHRcdHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuXHRcdHZhciBjc3MgPSBpdGVtWzFdO1xuXHRcdHZhciBtZWRpYSA9IGl0ZW1bMl07XG5cdFx0dmFyIHNvdXJjZU1hcCA9IGl0ZW1bM107XG5cdFx0dmFyIHBhcnQgPSB7Y3NzOiBjc3MsIG1lZGlhOiBtZWRpYSwgc291cmNlTWFwOiBzb3VyY2VNYXB9O1xuXG5cdFx0aWYoIW5ld1N0eWxlc1tpZF0pIHN0eWxlcy5wdXNoKG5ld1N0eWxlc1tpZF0gPSB7aWQ6IGlkLCBwYXJ0czogW3BhcnRdfSk7XG5cdFx0ZWxzZSBuZXdTdHlsZXNbaWRdLnBhcnRzLnB1c2gocGFydCk7XG5cdH1cblxuXHRyZXR1cm4gc3R5bGVzO1xufVxuXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQgKG9wdGlvbnMsIHN0eWxlKSB7XG5cdHZhciB0YXJnZXQgPSBnZXRFbGVtZW50KG9wdGlvbnMuaW5zZXJ0SW50bylcblxuXHRpZiAoIXRhcmdldCkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0SW50bycgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuXHR9XG5cblx0dmFyIGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wID0gc3R5bGVzSW5zZXJ0ZWRBdFRvcFtzdHlsZXNJbnNlcnRlZEF0VG9wLmxlbmd0aCAtIDFdO1xuXG5cdGlmIChvcHRpb25zLmluc2VydEF0ID09PSBcInRvcFwiKSB7XG5cdFx0aWYgKCFsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcCkge1xuXHRcdFx0dGFyZ2V0Lmluc2VydEJlZm9yZShzdHlsZSwgdGFyZ2V0LmZpcnN0Q2hpbGQpO1xuXHRcdH0gZWxzZSBpZiAobGFzdFN0eWxlRWxlbWVudEluc2VydGVkQXRUb3AubmV4dFNpYmxpbmcpIHtcblx0XHRcdHRhcmdldC5pbnNlcnRCZWZvcmUoc3R5bGUsIGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wLm5leHRTaWJsaW5nKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcblx0XHR9XG5cdFx0c3R5bGVzSW5zZXJ0ZWRBdFRvcC5wdXNoKHN0eWxlKTtcblx0fSBlbHNlIGlmIChvcHRpb25zLmluc2VydEF0ID09PSBcImJvdHRvbVwiKSB7XG5cdFx0dGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcblx0fSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJvYmplY3RcIiAmJiBvcHRpb25zLmluc2VydEF0LmJlZm9yZSkge1xuXHRcdHZhciBuZXh0U2libGluZyA9IGdldEVsZW1lbnQob3B0aW9ucy5pbnNlcnRJbnRvICsgXCIgXCIgKyBvcHRpb25zLmluc2VydEF0LmJlZm9yZSk7XG5cdFx0dGFyZ2V0Lmluc2VydEJlZm9yZShzdHlsZSwgbmV4dFNpYmxpbmcpO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIltTdHlsZSBMb2FkZXJdXFxuXFxuIEludmFsaWQgdmFsdWUgZm9yIHBhcmFtZXRlciAnaW5zZXJ0QXQnICgnb3B0aW9ucy5pbnNlcnRBdCcpIGZvdW5kLlxcbiBNdXN0IGJlICd0b3AnLCAnYm90dG9tJywgb3IgT2JqZWN0LlxcbiAoaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2stY29udHJpYi9zdHlsZS1sb2FkZXIjaW5zZXJ0YXQpXFxuXCIpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudCAoc3R5bGUpIHtcblx0aWYgKHN0eWxlLnBhcmVudE5vZGUgPT09IG51bGwpIHJldHVybiBmYWxzZTtcblx0c3R5bGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZSk7XG5cblx0dmFyIGlkeCA9IHN0eWxlc0luc2VydGVkQXRUb3AuaW5kZXhPZihzdHlsZSk7XG5cdGlmKGlkeCA+PSAwKSB7XG5cdFx0c3R5bGVzSW5zZXJ0ZWRBdFRvcC5zcGxpY2UoaWR4LCAxKTtcblx0fVxufVxuXG5mdW5jdGlvbiBjcmVhdGVTdHlsZUVsZW1lbnQgKG9wdGlvbnMpIHtcblx0dmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuXG5cdG9wdGlvbnMuYXR0cnMudHlwZSA9IFwidGV4dC9jc3NcIjtcblxuXHRhZGRBdHRycyhzdHlsZSwgb3B0aW9ucy5hdHRycyk7XG5cdGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zLCBzdHlsZSk7XG5cblx0cmV0dXJuIHN0eWxlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVMaW5rRWxlbWVudCAob3B0aW9ucykge1xuXHR2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaW5rXCIpO1xuXG5cdG9wdGlvbnMuYXR0cnMudHlwZSA9IFwidGV4dC9jc3NcIjtcblx0b3B0aW9ucy5hdHRycy5yZWwgPSBcInN0eWxlc2hlZXRcIjtcblxuXHRhZGRBdHRycyhsaW5rLCBvcHRpb25zLmF0dHJzKTtcblx0aW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMsIGxpbmspO1xuXG5cdHJldHVybiBsaW5rO1xufVxuXG5mdW5jdGlvbiBhZGRBdHRycyAoZWwsIGF0dHJzKSB7XG5cdE9iamVjdC5rZXlzKGF0dHJzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRlbC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGFkZFN0eWxlIChvYmosIG9wdGlvbnMpIHtcblx0dmFyIHN0eWxlLCB1cGRhdGUsIHJlbW92ZSwgcmVzdWx0O1xuXG5cdC8vIElmIGEgdHJhbnNmb3JtIGZ1bmN0aW9uIHdhcyBkZWZpbmVkLCBydW4gaXQgb24gdGhlIGNzc1xuXHRpZiAob3B0aW9ucy50cmFuc2Zvcm0gJiYgb2JqLmNzcykge1xuXHQgICAgcmVzdWx0ID0gb3B0aW9ucy50cmFuc2Zvcm0ob2JqLmNzcyk7XG5cblx0ICAgIGlmIChyZXN1bHQpIHtcblx0ICAgIFx0Ly8gSWYgdHJhbnNmb3JtIHJldHVybnMgYSB2YWx1ZSwgdXNlIHRoYXQgaW5zdGVhZCBvZiB0aGUgb3JpZ2luYWwgY3NzLlxuXHQgICAgXHQvLyBUaGlzIGFsbG93cyBydW5uaW5nIHJ1bnRpbWUgdHJhbnNmb3JtYXRpb25zIG9uIHRoZSBjc3MuXG5cdCAgICBcdG9iai5jc3MgPSByZXN1bHQ7XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgXHQvLyBJZiB0aGUgdHJhbnNmb3JtIGZ1bmN0aW9uIHJldHVybnMgYSBmYWxzeSB2YWx1ZSwgZG9uJ3QgYWRkIHRoaXMgY3NzLlxuXHQgICAgXHQvLyBUaGlzIGFsbG93cyBjb25kaXRpb25hbCBsb2FkaW5nIG9mIGNzc1xuXHQgICAgXHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdCAgICBcdFx0Ly8gbm9vcFxuXHQgICAgXHR9O1xuXHQgICAgfVxuXHR9XG5cblx0aWYgKG9wdGlvbnMuc2luZ2xldG9uKSB7XG5cdFx0dmFyIHN0eWxlSW5kZXggPSBzaW5nbGV0b25Db3VudGVyKys7XG5cblx0XHRzdHlsZSA9IHNpbmdsZXRvbiB8fCAoc2luZ2xldG9uID0gY3JlYXRlU3R5bGVFbGVtZW50KG9wdGlvbnMpKTtcblxuXHRcdHVwZGF0ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZSwgc3R5bGVJbmRleCwgZmFsc2UpO1xuXHRcdHJlbW92ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZSwgc3R5bGVJbmRleCwgdHJ1ZSk7XG5cblx0fSBlbHNlIGlmIChcblx0XHRvYmouc291cmNlTWFwICYmXG5cdFx0dHlwZW9mIFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIFVSTC5jcmVhdGVPYmplY3RVUkwgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBVUkwucmV2b2tlT2JqZWN0VVJMID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgQmxvYiA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIlxuXHQpIHtcblx0XHRzdHlsZSA9IGNyZWF0ZUxpbmtFbGVtZW50KG9wdGlvbnMpO1xuXHRcdHVwZGF0ZSA9IHVwZGF0ZUxpbmsuYmluZChudWxsLCBzdHlsZSwgb3B0aW9ucyk7XG5cdFx0cmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlKTtcblxuXHRcdFx0aWYoc3R5bGUuaHJlZikgVVJMLnJldm9rZU9iamVjdFVSTChzdHlsZS5ocmVmKTtcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdHN0eWxlID0gY3JlYXRlU3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuXHRcdHVwZGF0ZSA9IGFwcGx5VG9UYWcuYmluZChudWxsLCBzdHlsZSk7XG5cdFx0cmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlKTtcblx0XHR9O1xuXHR9XG5cblx0dXBkYXRlKG9iaik7XG5cblx0cmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZVN0eWxlIChuZXdPYmopIHtcblx0XHRpZiAobmV3T2JqKSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdG5ld09iai5jc3MgPT09IG9iai5jc3MgJiZcblx0XHRcdFx0bmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiZcblx0XHRcdFx0bmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcFxuXHRcdFx0KSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0dXBkYXRlKG9iaiA9IG5ld09iaik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlbW92ZSgpO1xuXHRcdH1cblx0fTtcbn1cblxudmFyIHJlcGxhY2VUZXh0ID0gKGZ1bmN0aW9uICgpIHtcblx0dmFyIHRleHRTdG9yZSA9IFtdO1xuXG5cdHJldHVybiBmdW5jdGlvbiAoaW5kZXgsIHJlcGxhY2VtZW50KSB7XG5cdFx0dGV4dFN0b3JlW2luZGV4XSA9IHJlcGxhY2VtZW50O1xuXG5cdFx0cmV0dXJuIHRleHRTdG9yZS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuJyk7XG5cdH07XG59KSgpO1xuXG5mdW5jdGlvbiBhcHBseVRvU2luZ2xldG9uVGFnIChzdHlsZSwgaW5kZXgsIHJlbW92ZSwgb2JqKSB7XG5cdHZhciBjc3MgPSByZW1vdmUgPyBcIlwiIDogb2JqLmNzcztcblxuXHRpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuXHRcdHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHJlcGxhY2VUZXh0KGluZGV4LCBjc3MpO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBjc3NOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKTtcblx0XHR2YXIgY2hpbGROb2RlcyA9IHN0eWxlLmNoaWxkTm9kZXM7XG5cblx0XHRpZiAoY2hpbGROb2Rlc1tpbmRleF0pIHN0eWxlLnJlbW92ZUNoaWxkKGNoaWxkTm9kZXNbaW5kZXhdKTtcblxuXHRcdGlmIChjaGlsZE5vZGVzLmxlbmd0aCkge1xuXHRcdFx0c3R5bGUuaW5zZXJ0QmVmb3JlKGNzc05vZGUsIGNoaWxkTm9kZXNbaW5kZXhdKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c3R5bGUuYXBwZW5kQ2hpbGQoY3NzTm9kZSk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGFwcGx5VG9UYWcgKHN0eWxlLCBvYmopIHtcblx0dmFyIGNzcyA9IG9iai5jc3M7XG5cdHZhciBtZWRpYSA9IG9iai5tZWRpYTtcblxuXHRpZihtZWRpYSkge1xuXHRcdHN0eWxlLnNldEF0dHJpYnV0ZShcIm1lZGlhXCIsIG1lZGlhKVxuXHR9XG5cblx0aWYoc3R5bGUuc3R5bGVTaGVldCkge1xuXHRcdHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcblx0fSBlbHNlIHtcblx0XHR3aGlsZShzdHlsZS5maXJzdENoaWxkKSB7XG5cdFx0XHRzdHlsZS5yZW1vdmVDaGlsZChzdHlsZS5maXJzdENoaWxkKTtcblx0XHR9XG5cblx0XHRzdHlsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcblx0fVxufVxuXG5mdW5jdGlvbiB1cGRhdGVMaW5rIChsaW5rLCBvcHRpb25zLCBvYmopIHtcblx0dmFyIGNzcyA9IG9iai5jc3M7XG5cdHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuXG5cdC8qXG5cdFx0SWYgY29udmVydFRvQWJzb2x1dGVVcmxzIGlzbid0IGRlZmluZWQsIGJ1dCBzb3VyY2VtYXBzIGFyZSBlbmFibGVkXG5cdFx0YW5kIHRoZXJlIGlzIG5vIHB1YmxpY1BhdGggZGVmaW5lZCB0aGVuIGxldHMgdHVybiBjb252ZXJ0VG9BYnNvbHV0ZVVybHNcblx0XHRvbiBieSBkZWZhdWx0LiAgT3RoZXJ3aXNlIGRlZmF1bHQgdG8gdGhlIGNvbnZlcnRUb0Fic29sdXRlVXJscyBvcHRpb25cblx0XHRkaXJlY3RseVxuXHQqL1xuXHR2YXIgYXV0b0ZpeFVybHMgPSBvcHRpb25zLmNvbnZlcnRUb0Fic29sdXRlVXJscyA9PT0gdW5kZWZpbmVkICYmIHNvdXJjZU1hcDtcblxuXHRpZiAob3B0aW9ucy5jb252ZXJ0VG9BYnNvbHV0ZVVybHMgfHwgYXV0b0ZpeFVybHMpIHtcblx0XHRjc3MgPSBmaXhVcmxzKGNzcyk7XG5cdH1cblxuXHRpZiAoc291cmNlTWFwKSB7XG5cdFx0Ly8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjY2MDM4NzVcblx0XHRjc3MgKz0gXCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiICsgYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSArIFwiICovXCI7XG5cdH1cblxuXHR2YXIgYmxvYiA9IG5ldyBCbG9iKFtjc3NdLCB7IHR5cGU6IFwidGV4dC9jc3NcIiB9KTtcblxuXHR2YXIgb2xkU3JjID0gbGluay5ocmVmO1xuXG5cdGxpbmsuaHJlZiA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG5cblx0aWYob2xkU3JjKSBVUkwucmV2b2tlT2JqZWN0VVJMKG9sZFNyYyk7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL2FkZFN0eWxlcy5qc1xuLy8gbW9kdWxlIGlkID0gNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcbmltcG9ydCBzdGF0ZSBmcm9tICcuL3N0YXRlJztcbmltcG9ydCB7IHJldmVyc2VHZW9jb2RlIH0gZnJvbSAnLi9nZW9jb2Rlcic7XG5cbi8qKlxuICogRmV0Y2ggdGhlIHVzZXIncyBhZGRyZXNzIGJhc2VkIG9uIHRoZSBsYXQvbG5nXG4gKiBAcGFyYW0gY2FsbGJhY2s6IChlcnIsIGdlb0RhdGEsIGFkZHJTdHJpbmcpXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHVzZXJSZXZlcnNlR2VvY29kZShjYWxsYmFjayA9ICgpID0+IHt9KSB7XG4gIGlmICghc3RhdGUudXNlci5sYXRpdHVkZSB8fCAhc3RhdGUudXNlci5sb25naXR1ZGUpIHJldHVybjsgLy8gbm90aGluZyB0byBkb1xuXG4gIHJldmVyc2VHZW9jb2RlKHN0YXRlLnVzZXIubGF0aXR1ZGUsIHN0YXRlLnVzZXIubG9uZ2l0dWRlLCAoZXJyLCBnZW9EYXRhKSA9PiB7XG4gICAgY29uc3QgZCA9IGdlb0RhdGE7XG4gICAgaWYgKFxuICAgICAgZC50eXBlID09PSAnRmVhdHVyZUNvbGxlY3Rpb24nICYmXG4gICAgICBkLmZlYXR1cmVzICYmIGQuZmVhdHVyZXMubGVuZ3RoID4gMCAmJlxuICAgICAgZC5mZWF0dXJlc1swXS5wbGFjZV9uYW1lXG4gICAgKSB7XG4gICAgICBzdGF0ZS51c2VyLmFkZHJlc3MgPSBkLmZlYXR1cmVzWzBdLnBsYWNlX25hbWU7XG4gICAgfVxuICAgIC8vIGNvbnNvbGUubG9nKCdmZXRjaGVkIHJldmVyc2UgZ2VvY29kZXIgcmVzcG9uc2UgZm9yIGNvb3JkczonLCBnZW9EYXRhKTtcbiAgICBjYWxsYmFjayhlcnIsIGdlb0RhdGEsIHN0YXRlLnVzZXIuYWRkcmVzcyk7XG4gIH0pO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3VzZXJSZXZlcnNlR2VvY29kZS5qcyIsImltcG9ydCAnLi9zdHlsZS5jc3MnO1xuaW1wb3J0ICcuL3ZlbmRvci9ub3Vpc2xpZGVyLm1pbi5jc3MnO1xuaW1wb3J0ICcuL2Zhdmljb24uaWNvJztcblxuaW1wb3J0IGluaXREaXJlY3Rpb25zQ29udHJvbHMgZnJvbSAnLi9kaXJlY3Rpb25zQ29udHJvbHMnO1xuaW1wb3J0IGluaXRNYXAgZnJvbSAnLi9tYXAnO1xuaW1wb3J0IHsgc2V0R2VvY29kZXJCb3VuZHMsIHNldEdlb2NkZXJDZW50ZXIgfSBmcm9tICcuL2dlb2NvZGVyJztcbmltcG9ydCBzdGF0ZSBmcm9tICcuL3N0YXRlJztcblxud2luZG93LmFwcFN0YXRlID0gc3RhdGU7IC8vIFhYWCBmb3IgY29uc29sZSBkZWJ1Z2dpbmcuXG5cbi8qIEluaXRpYWxpemF0aW9uICoqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5mdW5jdGlvbiBpbml0UGFnZShsbmdMYXQsIHpvb20pIHtcbiAgY29uc3QgZG9Jbml0ID0gKCkgPT4ge1xuICAgIGluaXRNYXAobG5nTGF0LCB6b29tKTtcbiAgICBpbml0RGlyZWN0aW9uc0NvbnRyb2xzKCk7XG4gIH07XG5cbiAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScgfHwgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2xvYWRlZCcpIHtcbiAgICAvLyBkb2N1bWVudCBpcyBhbHJlYWR5IHJlYWR5IHRvIGdvXG4gICAgZG9Jbml0KCk7XG4gIH0gZWxzZSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCdsb2FkaW5nIHBhZ2UnKTtcbiAgICAgIGRvSW5pdCgpO1xuICAgIH0sIGZhbHNlKTtcbiAgfVxufVxuXG4oZnVuY3Rpb24gaW5pdCgpIHtcbiAgY29uc29sZS5sb2coJ2luaXRpYWxpemluZyBhcHAnKTtcbiAgLy8gRmFsbGJhY2sgbG9jYXRpb246IGNlbnRlciBvZiBiYXkgYXJlYVxuICBsZXQgbGF0ID0gMzcuNjExO1xuICBsZXQgbG9uID0gLTEyMS43NTM7XG4gIGxldCB6b29tID0gODtcbiAgc2V0R2VvY2RlckNlbnRlcihbbG9uLCBsYXRdKTtcbiAgc2V0R2VvY29kZXJCb3VuZHMoJy0xMjMuNTMzNywzNi44OTMxLC0xMjEuMjA4MiwzOC44NjQzJyk7XG5cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tZXh0ZW5kLW5hdGl2ZVxuICBOdW1iZXIucHJvdG90eXBlLmJldHdlZW4gPSAobWluLCBtYXgpID0+IHRoaXMgPiBtaW4gJiYgdGhpcyA8IG1heDtcblxuICAvLyBHcmFiIElQIGxvY2F0aW9uIGZyb20gZnJlZWdlb2lwIEFQSVxuICBjb25zdCBnZW9Mb2NhdGlvblByb3ZpZGVyVVJMID0gJ2h0dHBzOi8vZnJlZWdlb2lwLm5ldC9qc29uLyc7XG4gIGZldGNoKGdlb0xvY2F0aW9uUHJvdmlkZXJVUkwpXG4gICAgLnRoZW4ocmVzcCA9PiByZXNwLmpzb24oKSlcbiAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgLy8gQmVjYXVzZSB0aGlzIGJpa2Ugc2hhcmUgb25seSBvcGVyYXRlcyBpbiB0aGUgU0YgYmF5IGFyZWEsIHdlXG4gICAgICAvLyBqdW1wIHRvIHRoZSB1c2VyJ3Mgc3BlY2lmaWMgbG9jYXRpb24gb25seSBpZiB0aGV5J3JlIGluc2lkZSBhXG4gICAgICAvLyBiYXktY2VudGVyZWQgYm91bmRpbmcgYXJlYS5cbiAgICAgIGlmICgoZGF0YS5sb25naXR1ZGUpLmJldHdlZW4oLTEyNCwgLTEyMSkgJiYgKGRhdGEubGF0aXR1ZGUpLmJldHdlZW4oMzYuNSwgMzguNCkpIHtcbiAgICAgICAgbGF0ID0gZGF0YS5sYXRpdHVkZTtcbiAgICAgICAgbG9uID0gZGF0YS5sb25naXR1ZGU7XG4gICAgICAgIHpvb20gPSAxMTsgLy8gem9vbSBtb3JlIHRoYW4gZGVmYXVsdCBzaW5jZSB3ZSBrbm93IGV4YWN0IGxvY2F0aW9uXG4gICAgICB9XG4gICAgICBpbml0UGFnZShbbG9uLCBsYXRdLCB6b29tKTtcbiAgICB9KVxuICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGBFcnJvciBmZXRjaGluZyBsb2NhdGlvbiBkYXRhOiAke2Vycm9yfWApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICBpZiAoZXJyb3IgPT09ICdFcnJvcjogQ29vcmRpbmF0ZXMgbXVzdCBjb250YWluIG51bWJlcnMnKSB7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5pdFBhZ2UoW2xvbiwgbGF0XSk7IC8vIGdvIGZvciBpdCBhbnl3YXksIHVzaW5nIGRlZmF1bHRzXG4gICAgICB9XG4gICAgfSk7XG59KCkpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2luZGV4LmpzIiwiLy8gc3R5bGUtbG9hZGVyOiBBZGRzIHNvbWUgY3NzIHRvIHRoZSBET00gYnkgYWRkaW5nIGEgPHN0eWxlPiB0YWdcblxuLy8gbG9hZCB0aGUgc3R5bGVzXG52YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vc3R5bGUuY3NzXCIpO1xuaWYodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSBjb250ZW50ID0gW1ttb2R1bGUuaWQsIGNvbnRlbnQsICcnXV07XG4vLyBQcmVwYXJlIGNzc1RyYW5zZm9ybWF0aW9uXG52YXIgdHJhbnNmb3JtO1xuXG52YXIgb3B0aW9ucyA9IHtcImhtclwiOnRydWV9XG5vcHRpb25zLnRyYW5zZm9ybSA9IHRyYW5zZm9ybVxuLy8gYWRkIHRoZSBzdHlsZXMgdG8gdGhlIERPTVxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9saWIvYWRkU3R5bGVzLmpzXCIpKGNvbnRlbnQsIG9wdGlvbnMpO1xuaWYoY29udGVudC5sb2NhbHMpIG1vZHVsZS5leHBvcnRzID0gY29udGVudC5sb2NhbHM7XG4vLyBIb3QgTW9kdWxlIFJlcGxhY2VtZW50XG5pZihtb2R1bGUuaG90KSB7XG5cdC8vIFdoZW4gdGhlIHN0eWxlcyBjaGFuZ2UsIHVwZGF0ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdGlmKCFjb250ZW50LmxvY2Fscykge1xuXHRcdG1vZHVsZS5ob3QuYWNjZXB0KFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL3N0eWxlLmNzc1wiLCBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBuZXdDb250ZW50ID0gcmVxdWlyZShcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9zdHlsZS5jc3NcIik7XG5cdFx0XHRpZih0eXBlb2YgbmV3Q29udGVudCA9PT0gJ3N0cmluZycpIG5ld0NvbnRlbnQgPSBbW21vZHVsZS5pZCwgbmV3Q29udGVudCwgJyddXTtcblx0XHRcdHVwZGF0ZShuZXdDb250ZW50KTtcblx0XHR9KTtcblx0fVxuXHQvLyBXaGVuIHRoZSBtb2R1bGUgaXMgZGlzcG9zZWQsIHJlbW92ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbigpIHsgdXBkYXRlKCk7IH0pO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3N0eWxlLmNzc1xuLy8gbW9kdWxlIGlkID0gOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXCIpKHVuZGVmaW5lZCk7XG4vLyBpbXBvcnRzXG5cblxuLy8gbW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCIubWFya2VyIHtcXG4gIGJhY2tncm91bmQtaW1hZ2U6IHVybChcIiArIHJlcXVpcmUoXCIuL25vdW5fODAwNjAwLnBuZ1wiKSArIFwiKTtcXG4gIGJhY2tncm91bmQtc2l6ZTogY292ZXI7XFxuICB3aWR0aDogNTBweDtcXG4gIGhlaWdodDogNTBweDtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuXFxuLm1hcC1tYXJrZXItZGlyZWN0aW9ucyB7XFxuICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgYmFja2dyb3VuZC1wb3NpdGlvbjogY2VudGVyO1xcbiAgYmFja2dyb3VuZC1zaXplOiAxMnB4O1xcbiAgd2lkdGg6IDIwcHg7XFxufVxcblxcbi5tYXAtbWFya2VyLWRpcmVjdGlvbnMuaXMtb3JpZ2luIHtcXG4gIGJhY2tncm91bmQtaW1hZ2U6IHVybChcIiArIHJlcXVpcmUoXCIuL21hcC1kb3Qtb3JpZ2luLnN2Z1wiKSArIFwiKTtcXG59XFxuLm1hcC1tYXJrZXItZGlyZWN0aW9ucy5pcy1kZXN0aW5hdGlvbiB7XFxuICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCIgKyByZXF1aXJlKFwiLi9tYXAtZG90LWRlc3RpbmF0aW9uLnN2Z1wiKSArIFwiKTtcXG59XFxuXFxuLyoqKioqKioqKiogRGlyZWN0aW9ucyBJbnB1dCAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xcblxcbi5kaXJlY3Rpb25zIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHBhZGRpbmc6IDFlbTtcXG4gIG1hcmdpbjogMWVtO1xcbiAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjg1KTtcXG59XFxuXFxuI2RpcmVjdGlvbnMtLWRpc3RhbmNlLXJhbmdlIHtcXG4gIC8qIHdpZHRoOiAxNTdweDsgKi9cXG4gIHdpZHRoOiAxMDAlO1xcbn1cXG5cXG4uZGlyZWN0aW9ucy0tZGlzdGFuY2UtcGlja2VyIHtcXG4gIG1hcmdpbi1ib3R0b206IDJlbTtcXG59XFxuXFxuI2RpcmVjdGlvbnMtLWRpc3RhbmNlLXJhbmdlIC5ub1VpLWNvbm5lY3Qge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDIyMiwgMjI0LCAyMjQpO1xcbiAgYm94LXNoYWRvdzogaW5zZXQgMCAwIDFweCByZ2JhKDUxLDUxLDUxLC4yKTtcXG59XFxuXFxuLmRpcmVjdGlvbnMtLWxvY2F0ZS1vcmlnaW4uY29sdW1uIHtcXG4gIHBhZGRpbmctbGVmdDogMDtcXG59XFxuXFxuLmRpcmVjdGlvbnMtLWxvY2F0ZS1vcmlnaW4gYnV0dG9ue1xcbiAgYmFja2dyb3VuZC1pbWFnZTogdXJsKFwiICsgcmVxdWlyZShcIi4vbG9jYXRlLXBlcnNvbi5zdmdcIikgKyBcIik7XFxuICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgYmFja2dyb3VuZC1wb3NpdGlvbjogY2VudGVyO1xcbiAgYmFja2dyb3VuZC1zaXplOiAyMHB4O1xcbiAgd2lkdGg6IDM4cHg7XFxufVxcblxcbi8qIC5kaXJlY3Rpb25zLS1sb2NhdGUtb3JpZ2luIGJ1dHRvbi5pcy1saWdodDpob3ZlciB7XFxuICBib3JkZXItY29sb3I6IGJsYWNrO1xcbn0gKi9cXG5cXG4vKioqKioqKioqKiBEaXJlY3Rpb25zIEF1dG9jb21wbGV0ZSAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xcblxcbi5hdXRvY29tcGxldGUge1xcbiAgYmFja2dyb3VuZDogd2hpdGU7XFxuICB6LWluZGV4OiAxMDA7XFxuICBib3JkZXI6IDFweCBzb2xpZCAjZTRlMmUyO1xcbn1cXG5cXG4uYXV0b2NvbXBsZXRlIGRpdiB7XFxuICBib3JkZXItdG9wOiAxcHggc29saWQgI2FkYWRhZDtcXG4gIHBhZGRpbmc6IDFlbTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuXFxuLmF1dG9jb21wbGV0ZSBkaXY6aG92ZXIsIC5hdXRvY29tcGxldGUgZGl2OmZvY3VzIHtcXG4gIGJhY2tncm91bmQ6IHJnYigyMDIsIDIwNiwgMjI3KTtcXG59XFxuXFxuXFxuLyoqKioqKioqKiogU3RhdGlvbiBQb3B1cCAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xcblxcbi5zdGF0aW9uLXBvcHVwLS1jb250YWluZXIgLm1hcGJveGdsLXBvcHVwLWNvbnRlbnQge1xcbiAgcGFkZGluZy1ib3R0b206IDZweDtcXG59XFxuXFxuLnN0YXRpb24tcG9wdXAge1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG5cXG4uc3RhdGlvbi1wb3B1cCBoMyB7XFxuICBtYXJnaW4tYm90dG9tOiAxZW07XFxufVxcblxcbi8qIGRpdi5zdGF0aW9uLXBvcHVwLS1kaXJlY3Rpb25zIHtcXG59ICovXFxuXFxuZGl2LnN0YXRpb24tcG9wdXAtLWRpcmVjdGlvbnMgYXtcXG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG59XFxuXFxuLnN0YXRpb24tcG9wdXAtLWNvb3JkaW5hdGVzIHtcXG4gIGJvcmRlci10b3A6IDFweCBzb2xpZCBsaWdodGdyZXk7XFxuICB0ZXh0LWFsaWduOiByaWdodDtcXG4gIHBhZGRpbmctdG9wOiAwLjVlbTtcXG4gIG1hcmdpbi10b3A6IDAuNWVtO1xcblxcbiAgZm9udC1zaXplOiBzbWFsbGVyO1xcbiAgY29sb3I6IGxpZ2h0Z3JleTtcXG59XFxuXFxuLnN0YXRpb24tcG9wdXAtLWJpa2VzLW51bWJlciwgLnN0YXRpb24tcG9wdXAtLWRvY2tzLW51bWJlciB7XFxuICBmb250LXNpemU6IGxhcmdlO1xcbn1cXG5cXG4vKiAuc3RhdGlvbi1wb3B1cC0tYmlrZXMtdGV4dCwgLnN0YXRpb24tcG9wdXAtLWRvY2tzLXRleHQge1xcbn0gKi9cXG5cXG5kaXYuc3RhdGlvbi1wb3B1cC0tc3RhdHMge1xcbiAgbWFyZ2luLWJvdHRvbTogMCAhaW1wb3J0YW50O1xcbiAgZm9udC13ZWlnaHQ6IGJvbGQ7XFxufVxcblxcbi5zdGF0aW9uLXBvcHVwLS1hbGVydCB7XFxuICBmb250LXdlaWdodDogYm9sZDtcXG4gIGZvbnQtc2l6ZTogbGFyZ2U7XFxuICBtYXJnaW4tYm90dG9tOiAxZW07XFxufVxcblwiLCBcIlwiXSk7XG5cbi8vIGV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIhLi9zcmMvc3R5bGUuY3NzXG4vLyBtb2R1bGUgaWQgPSA5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImQwNDkyMDNiYzc0Njk2ZDU4N2EzY2RiMWQwYTY2MWQyLnBuZ1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL25vdW5fODAwNjAwLnBuZ1xuLy8gbW9kdWxlIGlkID0gMTBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiMmY2N2JkMTRmOTg3MmRhZjc3MTNhNTJjZTJlNDVmOWEuc3ZnXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvbWFwLWRvdC1vcmlnaW4uc3ZnXG4vLyBtb2R1bGUgaWQgPSAxMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCI5OWRhOWExMTE4YjhlNDMyMjVkM2RhNmZlZTY0NWFkMC5zdmdcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9tYXAtZG90LWRlc3RpbmF0aW9uLnN2Z1xuLy8gbW9kdWxlIGlkID0gMTJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiOTljNjg3OWIwMWZlN2ZiMjdmYjI2Y2YyYWZjNzM2MGQuc3ZnXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvbG9jYXRlLXBlcnNvbi5zdmdcbi8vIG1vZHVsZSBpZCA9IDEzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlxuLyoqXG4gKiBXaGVuIHNvdXJjZSBtYXBzIGFyZSBlbmFibGVkLCBgc3R5bGUtbG9hZGVyYCB1c2VzIGEgbGluayBlbGVtZW50IHdpdGggYSBkYXRhLXVyaSB0b1xuICogZW1iZWQgdGhlIGNzcyBvbiB0aGUgcGFnZS4gVGhpcyBicmVha3MgYWxsIHJlbGF0aXZlIHVybHMgYmVjYXVzZSBub3cgdGhleSBhcmUgcmVsYXRpdmUgdG8gYVxuICogYnVuZGxlIGluc3RlYWQgb2YgdGhlIGN1cnJlbnQgcGFnZS5cbiAqXG4gKiBPbmUgc29sdXRpb24gaXMgdG8gb25seSB1c2UgZnVsbCB1cmxzLCBidXQgdGhhdCBtYXkgYmUgaW1wb3NzaWJsZS5cbiAqXG4gKiBJbnN0ZWFkLCB0aGlzIGZ1bmN0aW9uIFwiZml4ZXNcIiB0aGUgcmVsYXRpdmUgdXJscyB0byBiZSBhYnNvbHV0ZSBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgcGFnZSBsb2NhdGlvbi5cbiAqXG4gKiBBIHJ1ZGltZW50YXJ5IHRlc3Qgc3VpdGUgaXMgbG9jYXRlZCBhdCBgdGVzdC9maXhVcmxzLmpzYCBhbmQgY2FuIGJlIHJ1biB2aWEgdGhlIGBucG0gdGVzdGAgY29tbWFuZC5cbiAqXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzKSB7XG4gIC8vIGdldCBjdXJyZW50IGxvY2F0aW9uXG4gIHZhciBsb2NhdGlvbiA9IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgd2luZG93LmxvY2F0aW9uO1xuXG4gIGlmICghbG9jYXRpb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJmaXhVcmxzIHJlcXVpcmVzIHdpbmRvdy5sb2NhdGlvblwiKTtcbiAgfVxuXG5cdC8vIGJsYW5rIG9yIG51bGw/XG5cdGlmICghY3NzIHx8IHR5cGVvZiBjc3MgIT09IFwic3RyaW5nXCIpIHtcblx0ICByZXR1cm4gY3NzO1xuICB9XG5cbiAgdmFyIGJhc2VVcmwgPSBsb2NhdGlvbi5wcm90b2NvbCArIFwiLy9cIiArIGxvY2F0aW9uLmhvc3Q7XG4gIHZhciBjdXJyZW50RGlyID0gYmFzZVVybCArIGxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL1xcL1teXFwvXSokLywgXCIvXCIpO1xuXG5cdC8vIGNvbnZlcnQgZWFjaCB1cmwoLi4uKVxuXHQvKlxuXHRUaGlzIHJlZ3VsYXIgZXhwcmVzc2lvbiBpcyBqdXN0IGEgd2F5IHRvIHJlY3Vyc2l2ZWx5IG1hdGNoIGJyYWNrZXRzIHdpdGhpblxuXHRhIHN0cmluZy5cblxuXHQgL3VybFxccypcXCggID0gTWF0Y2ggb24gdGhlIHdvcmQgXCJ1cmxcIiB3aXRoIGFueSB3aGl0ZXNwYWNlIGFmdGVyIGl0IGFuZCB0aGVuIGEgcGFyZW5zXG5cdCAgICggID0gU3RhcnQgYSBjYXB0dXJpbmcgZ3JvdXBcblx0ICAgICAoPzogID0gU3RhcnQgYSBub24tY2FwdHVyaW5nIGdyb3VwXG5cdCAgICAgICAgIFteKShdICA9IE1hdGNoIGFueXRoaW5nIHRoYXQgaXNuJ3QgYSBwYXJlbnRoZXNlc1xuXHQgICAgICAgICB8ICA9IE9SXG5cdCAgICAgICAgIFxcKCAgPSBNYXRjaCBhIHN0YXJ0IHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICAoPzogID0gU3RhcnQgYW5vdGhlciBub24tY2FwdHVyaW5nIGdyb3Vwc1xuXHQgICAgICAgICAgICAgICAgIFteKShdKyAgPSBNYXRjaCBhbnl0aGluZyB0aGF0IGlzbid0IGEgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICAgICB8ICA9IE9SXG5cdCAgICAgICAgICAgICAgICAgXFwoICA9IE1hdGNoIGEgc3RhcnQgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICAgICAgICAgW14pKF0qICA9IE1hdGNoIGFueXRoaW5nIHRoYXQgaXNuJ3QgYSBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgICAgIFxcKSAgPSBNYXRjaCBhIGVuZCBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgKSAgPSBFbmQgR3JvdXBcbiAgICAgICAgICAgICAgKlxcKSA9IE1hdGNoIGFueXRoaW5nIGFuZCB0aGVuIGEgY2xvc2UgcGFyZW5zXG4gICAgICAgICAgKSAgPSBDbG9zZSBub24tY2FwdHVyaW5nIGdyb3VwXG4gICAgICAgICAgKiAgPSBNYXRjaCBhbnl0aGluZ1xuICAgICAgICkgID0gQ2xvc2UgY2FwdHVyaW5nIGdyb3VwXG5cdCBcXCkgID0gTWF0Y2ggYSBjbG9zZSBwYXJlbnNcblxuXHQgL2dpICA9IEdldCBhbGwgbWF0Y2hlcywgbm90IHRoZSBmaXJzdC4gIEJlIGNhc2UgaW5zZW5zaXRpdmUuXG5cdCAqL1xuXHR2YXIgZml4ZWRDc3MgPSBjc3MucmVwbGFjZSgvdXJsXFxzKlxcKCgoPzpbXikoXXxcXCgoPzpbXikoXSt8XFwoW14pKF0qXFwpKSpcXCkpKilcXCkvZ2ksIGZ1bmN0aW9uKGZ1bGxNYXRjaCwgb3JpZ1VybCkge1xuXHRcdC8vIHN0cmlwIHF1b3RlcyAoaWYgdGhleSBleGlzdClcblx0XHR2YXIgdW5xdW90ZWRPcmlnVXJsID0gb3JpZ1VybFxuXHRcdFx0LnRyaW0oKVxuXHRcdFx0LnJlcGxhY2UoL15cIiguKilcIiQvLCBmdW5jdGlvbihvLCAkMSl7IHJldHVybiAkMTsgfSlcblx0XHRcdC5yZXBsYWNlKC9eJyguKiknJC8sIGZ1bmN0aW9uKG8sICQxKXsgcmV0dXJuICQxOyB9KTtcblxuXHRcdC8vIGFscmVhZHkgYSBmdWxsIHVybD8gbm8gY2hhbmdlXG5cdFx0aWYgKC9eKCN8ZGF0YTp8aHR0cDpcXC9cXC98aHR0cHM6XFwvXFwvfGZpbGU6XFwvXFwvXFwvKS9pLnRlc3QodW5xdW90ZWRPcmlnVXJsKSkge1xuXHRcdCAgcmV0dXJuIGZ1bGxNYXRjaDtcblx0XHR9XG5cblx0XHQvLyBjb252ZXJ0IHRoZSB1cmwgdG8gYSBmdWxsIHVybFxuXHRcdHZhciBuZXdVcmw7XG5cblx0XHRpZiAodW5xdW90ZWRPcmlnVXJsLmluZGV4T2YoXCIvL1wiKSA9PT0gMCkge1xuXHRcdCAgXHQvL1RPRE86IHNob3VsZCB3ZSBhZGQgcHJvdG9jb2w/XG5cdFx0XHRuZXdVcmwgPSB1bnF1b3RlZE9yaWdVcmw7XG5cdFx0fSBlbHNlIGlmICh1bnF1b3RlZE9yaWdVcmwuaW5kZXhPZihcIi9cIikgPT09IDApIHtcblx0XHRcdC8vIHBhdGggc2hvdWxkIGJlIHJlbGF0aXZlIHRvIHRoZSBiYXNlIHVybFxuXHRcdFx0bmV3VXJsID0gYmFzZVVybCArIHVucXVvdGVkT3JpZ1VybDsgLy8gYWxyZWFkeSBzdGFydHMgd2l0aCAnLydcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gcGF0aCBzaG91bGQgYmUgcmVsYXRpdmUgdG8gY3VycmVudCBkaXJlY3Rvcnlcblx0XHRcdG5ld1VybCA9IGN1cnJlbnREaXIgKyB1bnF1b3RlZE9yaWdVcmwucmVwbGFjZSgvXlxcLlxcLy8sIFwiXCIpOyAvLyBTdHJpcCBsZWFkaW5nICcuLydcblx0XHR9XG5cblx0XHQvLyBzZW5kIGJhY2sgdGhlIGZpeGVkIHVybCguLi4pXG5cdFx0cmV0dXJuIFwidXJsKFwiICsgSlNPTi5zdHJpbmdpZnkobmV3VXJsKSArIFwiKVwiO1xuXHR9KTtcblxuXHQvLyBzZW5kIGJhY2sgdGhlIGZpeGVkIGNzc1xuXHRyZXR1cm4gZml4ZWRDc3M7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2xpYi91cmxzLmpzXG4vLyBtb2R1bGUgaWQgPSAxNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBzdHlsZS1sb2FkZXI6IEFkZHMgc29tZSBjc3MgdG8gdGhlIERPTSBieSBhZGRpbmcgYSA8c3R5bGU+IHRhZ1xuXG4vLyBsb2FkIHRoZSBzdHlsZXNcbnZhciBjb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9ub3Vpc2xpZGVyLm1pbi5jc3NcIik7XG5pZih0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIGNvbnRlbnQgPSBbW21vZHVsZS5pZCwgY29udGVudCwgJyddXTtcbi8vIFByZXBhcmUgY3NzVHJhbnNmb3JtYXRpb25cbnZhciB0cmFuc2Zvcm07XG5cbnZhciBvcHRpb25zID0ge1wiaG1yXCI6dHJ1ZX1cbm9wdGlvbnMudHJhbnNmb3JtID0gdHJhbnNmb3JtXG4vLyBhZGQgdGhlIHN0eWxlcyB0byB0aGUgRE9NXG52YXIgdXBkYXRlID0gcmVxdWlyZShcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2xpYi9hZGRTdHlsZXMuanNcIikoY29udGVudCwgb3B0aW9ucyk7XG5pZihjb250ZW50LmxvY2FscykgbW9kdWxlLmV4cG9ydHMgPSBjb250ZW50LmxvY2Fscztcbi8vIEhvdCBNb2R1bGUgUmVwbGFjZW1lbnRcbmlmKG1vZHVsZS5ob3QpIHtcblx0Ly8gV2hlbiB0aGUgc3R5bGVzIGNoYW5nZSwgdXBkYXRlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0aWYoIWNvbnRlbnQubG9jYWxzKSB7XG5cdFx0bW9kdWxlLmhvdC5hY2NlcHQoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vbm91aXNsaWRlci5taW4uY3NzXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIG5ld0NvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL25vdWlzbGlkZXIubWluLmNzc1wiKTtcblx0XHRcdGlmKHR5cGVvZiBuZXdDb250ZW50ID09PSAnc3RyaW5nJykgbmV3Q29udGVudCA9IFtbbW9kdWxlLmlkLCBuZXdDb250ZW50LCAnJ11dO1xuXHRcdFx0dXBkYXRlKG5ld0NvbnRlbnQpO1xuXHRcdH0pO1xuXHR9XG5cdC8vIFdoZW4gdGhlIG1vZHVsZSBpcyBkaXNwb3NlZCwgcmVtb3ZlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0bW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uKCkgeyB1cGRhdGUoKTsgfSk7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvdmVuZG9yL25vdWlzbGlkZXIubWluLmNzc1xuLy8gbW9kdWxlIGlkID0gMTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qc1wiKSh1bmRlZmluZWQpO1xuLy8gaW1wb3J0c1xuXG5cbi8vIG1vZHVsZVxuZXhwb3J0cy5wdXNoKFttb2R1bGUuaWQsIFwiLyohIG5vdWlzbGlkZXIgLSAxMC4wLjAgLSAyMDE3LTA1LTI4IDE0OjUyOjQ4ICovLm5vVWktdGFyZ2V0LC5ub1VpLXRhcmdldCAqey13ZWJraXQtdG91Y2gtY2FsbG91dDpub25lOy13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjp0cmFuc3BhcmVudDstd2Via2l0LXVzZXItc2VsZWN0Om5vbmU7LW1zLXRvdWNoLWFjdGlvbjpub25lO3RvdWNoLWFjdGlvbjpub25lOy1tcy11c2VyLXNlbGVjdDpub25lOy1tb3otdXNlci1zZWxlY3Q6bm9uZTt1c2VyLXNlbGVjdDpub25lOy1tb3otYm94LXNpemluZzpib3JkZXItYm94O2JveC1zaXppbmc6Ym9yZGVyLWJveH0ubm9VaS10YXJnZXR7cG9zaXRpb246cmVsYXRpdmU7ZGlyZWN0aW9uOmx0cn0ubm9VaS1iYXNle3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7cG9zaXRpb246cmVsYXRpdmU7ei1pbmRleDoxfS5ub1VpLWNvbm5lY3R7cG9zaXRpb246YWJzb2x1dGU7cmlnaHQ6MDt0b3A6MDtsZWZ0OjA7Ym90dG9tOjB9Lm5vVWktb3JpZ2lue3Bvc2l0aW9uOmFic29sdXRlO2hlaWdodDowO3dpZHRoOjB9Lm5vVWktaGFuZGxle3Bvc2l0aW9uOnJlbGF0aXZlO3otaW5kZXg6MX0ubm9VaS1zdGF0ZS10YXAgLm5vVWktY29ubmVjdCwubm9VaS1zdGF0ZS10YXAgLm5vVWktb3JpZ2luey13ZWJraXQtdHJhbnNpdGlvbjp0b3AgLjNzLHJpZ2h0IC4zcyxib3R0b20gLjNzLGxlZnQgLjNzO3RyYW5zaXRpb246dG9wIC4zcyxyaWdodCAuM3MsYm90dG9tIC4zcyxsZWZ0IC4zc30ubm9VaS1zdGF0ZS1kcmFnICp7Y3Vyc29yOmluaGVyaXQhaW1wb3J0YW50fS5ub1VpLWJhc2UsLm5vVWktaGFuZGxley13ZWJraXQtdHJhbnNmb3JtOnRyYW5zbGF0ZTNkKDAsMCwwKTt0cmFuc2Zvcm06dHJhbnNsYXRlM2QoMCwwLDApfS5ub1VpLWhvcml6b250YWx7aGVpZ2h0OjE4cHh9Lm5vVWktaG9yaXpvbnRhbCAubm9VaS1oYW5kbGV7d2lkdGg6MzRweDtoZWlnaHQ6MjhweDtsZWZ0Oi0xN3B4O3RvcDotNnB4fS5ub1VpLXZlcnRpY2Fse3dpZHRoOjE4cHh9Lm5vVWktdmVydGljYWwgLm5vVWktaGFuZGxle3dpZHRoOjI4cHg7aGVpZ2h0OjM0cHg7bGVmdDotNnB4O3RvcDotMTdweH0ubm9VaS10YXJnZXR7YmFja2dyb3VuZDojRkFGQUZBO2JvcmRlci1yYWRpdXM6NHB4O2JvcmRlcjoxcHggc29saWQgI0QzRDNEMztib3gtc2hhZG93Omluc2V0IDAgMXB4IDFweCAjRjBGMEYwLDAgM3B4IDZweCAtNXB4ICNCQkJ9Lm5vVWktY29ubmVjdHtiYWNrZ3JvdW5kOiMzRkI4QUY7Ym9yZGVyLXJhZGl1czo0cHg7Ym94LXNoYWRvdzppbnNldCAwIDAgM3B4IHJnYmEoNTEsNTEsNTEsLjQ1KTstd2Via2l0LXRyYW5zaXRpb246YmFja2dyb3VuZCA0NTBtczt0cmFuc2l0aW9uOmJhY2tncm91bmQgNDUwbXM7fS5ub1VpLWRyYWdnYWJsZXtjdXJzb3I6ZXctcmVzaXplfS5ub1VpLXZlcnRpY2FsIC5ub1VpLWRyYWdnYWJsZXtjdXJzb3I6bnMtcmVzaXplfS5ub1VpLWhhbmRsZXtib3JkZXI6MXB4IHNvbGlkICNEOUQ5RDk7Ym9yZGVyLXJhZGl1czozcHg7YmFja2dyb3VuZDojRkZGO2N1cnNvcjpkZWZhdWx0O2JveC1zaGFkb3c6IGluc2V0IDAgMCAxcHggI0ZGRixpbnNldCAwIDFweCA3cHggI0VCRUJFQiwwIDNweCA2cHggLTNweCAjQkJCO30ubm9VaS1hY3RpdmV7Ym94LXNoYWRvdzppbnNldCAwIDAgMXB4ICNGRkYsaW5zZXQgMCAxcHggN3B4ICNEREQsMCAzcHggNnB4IC0zcHggI0JCQn0ubm9VaS1oYW5kbGU6YWZ0ZXIsLm5vVWktaGFuZGxlOmJlZm9yZXtjb250ZW50OlxcXCJcXFwiO2Rpc3BsYXk6YmxvY2s7cG9zaXRpb246YWJzb2x1dGU7aGVpZ2h0OjE0cHg7d2lkdGg6MXB4O2JhY2tncm91bmQ6I0U4RTdFNjtsZWZ0OjE0cHg7dG9wOjZweH0ubm9VaS1oYW5kbGU6YWZ0ZXJ7bGVmdDoxN3B4fS5ub1VpLXZlcnRpY2FsIC5ub1VpLWhhbmRsZTphZnRlciwubm9VaS12ZXJ0aWNhbCAubm9VaS1oYW5kbGU6YmVmb3Jle3dpZHRoOjE0cHg7aGVpZ2h0OjFweDtsZWZ0OjZweDt0b3A6MTRweH0ubm9VaS12ZXJ0aWNhbCAubm9VaS1oYW5kbGU6YWZ0ZXJ7dG9wOjE3cHh9W2Rpc2FibGVkXSAubm9VaS1jb25uZWN0e2JhY2tncm91bmQ6I0I4QjhCOH1bZGlzYWJsZWRdIC5ub1VpLWhhbmRsZSxbZGlzYWJsZWRdLm5vVWktaGFuZGxlLFtkaXNhYmxlZF0ubm9VaS10YXJnZXR7Y3Vyc29yOm5vdC1hbGxvd2VkfS5ub1VpLXBpcHMsLm5vVWktcGlwcyAqey1tb3otYm94LXNpemluZzpib3JkZXItYm94O2JveC1zaXppbmc6Ym9yZGVyLWJveH0ubm9VaS1waXBze3Bvc2l0aW9uOmFic29sdXRlO2NvbG9yOiM5OTk7fS5ub1VpLXZhbHVle3Bvc2l0aW9uOmFic29sdXRlO3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LWFsaWduOmNlbnRlcn0ubm9VaS12YWx1ZS1zdWJ7Y29sb3I6I2NjYztmb250LXNpemU6MTBweH0ubm9VaS1tYXJrZXJ7cG9zaXRpb246YWJzb2x1dGU7YmFja2dyb3VuZDojQ0NDfS5ub1VpLW1hcmtlci1sYXJnZSwubm9VaS1tYXJrZXItc3Vie2JhY2tncm91bmQ6I0FBQX0ubm9VaS1waXBzLWhvcml6b250YWx7cGFkZGluZzoxMHB4IDA7aGVpZ2h0OjgwcHg7dG9wOjEwMCU7bGVmdDowO3dpZHRoOjEwMCV9Lm5vVWktdmFsdWUtaG9yaXpvbnRhbHstd2Via2l0LXRyYW5zZm9ybTp0cmFuc2xhdGUzZCgtNTAlLDUwJSwwKTt0cmFuc2Zvcm06dHJhbnNsYXRlM2QoLTUwJSw1MCUsMCl9Lm5vVWktbWFya2VyLWhvcml6b250YWwubm9VaS1tYXJrZXJ7bWFyZ2luLWxlZnQ6LTFweDt3aWR0aDoycHg7aGVpZ2h0OjVweH0ubm9VaS1tYXJrZXItaG9yaXpvbnRhbC5ub1VpLW1hcmtlci1zdWJ7aGVpZ2h0OjEwcHh9Lm5vVWktbWFya2VyLWhvcml6b250YWwubm9VaS1tYXJrZXItbGFyZ2V7aGVpZ2h0OjE1cHh9Lm5vVWktcGlwcy12ZXJ0aWNhbHtwYWRkaW5nOjAgMTBweDtoZWlnaHQ6MTAwJTt0b3A6MDtsZWZ0OjEwMCV9Lm5vVWktdmFsdWUtdmVydGljYWx7LXdlYmtpdC10cmFuc2Zvcm06dHJhbnNsYXRlM2QoMCw1MCUsMCk7dHJhbnNmb3JtOnRyYW5zbGF0ZTNkKDAsNTAlLDApO3BhZGRpbmctbGVmdDoyNXB4fS5ub1VpLW1hcmtlci12ZXJ0aWNhbC5ub1VpLW1hcmtlcnt3aWR0aDo1cHg7aGVpZ2h0OjJweDttYXJnaW4tdG9wOi0xcHh9Lm5vVWktbWFya2VyLXZlcnRpY2FsLm5vVWktbWFya2VyLXN1Ynt3aWR0aDoxMHB4fS5ub1VpLW1hcmtlci12ZXJ0aWNhbC5ub1VpLW1hcmtlci1sYXJnZXt3aWR0aDoxNXB4fS5ub1VpLXRvb2x0aXB7ZGlzcGxheTpibG9jaztwb3NpdGlvbjphYnNvbHV0ZTtib3JkZXI6MXB4IHNvbGlkICNEOUQ5RDk7Ym9yZGVyLXJhZGl1czozcHg7YmFja2dyb3VuZDojZmZmO2NvbG9yOiMwMDA7cGFkZGluZzo1cHg7dGV4dC1hbGlnbjpjZW50ZXI7d2hpdGUtc3BhY2U6bm93cmFwfS5ub1VpLWhvcml6b250YWwgLm5vVWktdG9vbHRpcHstd2Via2l0LXRyYW5zZm9ybTp0cmFuc2xhdGUoLTUwJSwwKTt0cmFuc2Zvcm06dHJhbnNsYXRlKC01MCUsMCk7bGVmdDo1MCU7Ym90dG9tOjEyMCV9Lm5vVWktdmVydGljYWwgLm5vVWktdG9vbHRpcHstd2Via2l0LXRyYW5zZm9ybTp0cmFuc2xhdGUoMCwtNTAlKTt0cmFuc2Zvcm06dHJhbnNsYXRlKDAsLTUwJSk7dG9wOjUwJTtyaWdodDoxMjAlfVwiLCBcIlwiXSk7XG5cbi8vIGV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIhLi9zcmMvdmVuZG9yL25vdWlzbGlkZXIubWluLmNzc1xuLy8gbW9kdWxlIGlkID0gMTZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiZmF2aWNvbi5pY29cIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9mYXZpY29uLmljb1xuLy8gbW9kdWxlIGlkID0gMTdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyogRGlyZWN0aW9ucyBjb250cm9scyAqKioqKioqKioqKioqKioqKioqKioqICovXG5cbmltcG9ydCBpbml0RGlzdGFuY2VTbGlkZXIgZnJvbSAnLi9kaXN0YW5jZVNsaWRlcic7XG5pbXBvcnQgaW5pdE9yaWdpbkxvY2F0b3JCdG4gZnJvbSAnLi9vcmlnaW5Mb2NhdG9yQnV0dG9uJztcbmltcG9ydCBpbml0RGlyZWN0aW9uSW5wdXQgZnJvbSAnLi9kaXJlY3Rpb25JbnB1dCc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGluaXREaXJlY3Rpb25zQ29udHJvbHMoKSB7XG4gIGluaXREaXN0YW5jZVNsaWRlcigpO1xuICBpbml0T3JpZ2luTG9jYXRvckJ0bigpO1xuICBpbml0RGlyZWN0aW9uSW5wdXQoJ29yaWdpbklucHV0JywgJ29yaWdpbicpO1xuICBpbml0RGlyZWN0aW9uSW5wdXQoJ2Rlc3RpbmF0aW9uSW5wdXQnLCAnZGVzdGluYXRpb24nKTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9kaXJlY3Rpb25zQ29udHJvbHMuanMiLCJpbXBvcnQgbm9VaVNsaWRlciBmcm9tICcuL3ZlbmRvci9ub3Vpc2xpZGVyJztcbmltcG9ydCBzdGF0ZSBmcm9tICcuL3N0YXRlJztcbmltcG9ydCB7IG1hcFVwZGF0ZU5lYXJieSB9IGZyb20gJy4vbWFwJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW5pdERpc3RhbmNlU2xpZGVyKCkge1xuICBjb25zdCByYW5nZSA9IHtcbiAgICBtaW46IFswXSxcbiAgICAnMTAwJSc6IFsyLCAyXSxcbiAgICBtYXg6IFsyXSxcbiAgfTtcblxuICBjb25zdCBzbGlkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGlyZWN0aW9ucy0tZGlzdGFuY2UtcmFuZ2UnKTtcblxuICBjb25zdCBkaXN0Rm9ybWF0dGVyID0ge1xuICAgIC8vIEludGVnZXJzIHN0YXkgaW50ZWdlcnMsIG90aGVyIHZhbHVlcyBnZXQgdHdvIGRlY2ltYWxzLlxuICAgIC8vIGV4OiAxIC0+IFwiMVwiIGFuZCAxLjUgLT4gXCIxLjUwXCJcbiAgICAvLyB0bzogKG4pID0+IE51bWJlci5pc0ludGVnZXIobikgPyBuIDogKG4pLnRvRml4ZWQoMilcbiAgICAvLyB3ZSBwcm92aWRlIHRoZSAndG8nIGZ1bmN0aW9uIGJlY2F1c2Ugbm9VaVNsaWRlciBleHBlY3RzIHRoYXRcbiAgICAvLyAocHJvdG90eXBlIGNvbXBhdGlibGUgdy8gd051bWIgZm9ybWF0dGluZyBsaWJyYXJ5J3Mgb2JqZWN0cykuXG4gICAgdG86IChuKSA9PiB7XG4gICAgICBpZiAobiA9PT0gMSkgeyAvLyBkb24ndCBuZWVkIHRpY2sgb24gJzEnLCB1c2VyIGNhbiBmaWd1cmUgaXQgb3V0LlxuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9IGVsc2UgaWYgKE51bWJlci5pc0ludGVnZXIobikpIHtcbiAgICAgICAgcmV0dXJuIG4gPyBgJHtufSBtaWAgOiBuOyAvLyAwIGRvZXNuJ3QgbmVlZCB1bml0cy5cbiAgICAgIH0gZWxzZSBpZiAobiAlIDAuNSA9PT0gMCkge1xuICAgICAgICByZXR1cm4gKG4pLnRvRml4ZWQoMik7XG4gICAgICB9XG4gICAgICByZXR1cm4gJyc7IC8vIGRvbid0IG5lZWQgbGFiZWxzIG9uIGV2ZXJ5IHRpY2sgbWFya1xuICAgIH0sXG4gIH07XG5cbiAgbm9VaVNsaWRlci5jcmVhdGUoc2xpZGVyLCB7XG4gICAgcmFuZ2UsXG4gICAgc3RhcnQ6IHN0YXRlLm1heFdhbGtEaXN0YW5jZSxcbiAgICBzdGVwOiAwLjI1LFxuICAgIGNvbm5lY3Q6IFt0cnVlLCBmYWxzZV0sXG4gICAgcGlwczoge1xuICAgICAgbW9kZTogJ2NvdW50JyxcbiAgICAgIHZhbHVlczogMywgLy8gMyBtYWpvciB0aWNrc1xuICAgICAgZGVuc2l0eTogMTIuNSwgLy8gMSBzbWFsbCB0aWNrIGV2ZXJ5IDEyLjUlIChldmVyeSAwLjI1IGJ0d24gMCBhbmQgMilcbiAgICAgIGZvcm1hdDogZGlzdEZvcm1hdHRlcixcbiAgICB9LFxuICB9KTtcblxuICBzbGlkZXIubm9VaVNsaWRlci5vbigndXBkYXRlJywgKHZhbHVlcywgaGFuZGxlKSA9PiB7XG4gICAgY29uc3QgdmFsdWUgPSB2YWx1ZXNbaGFuZGxlXTtcbiAgICAvLyBjb25zb2xlLmxvZyhgU2VhcmNoaW5nIHdpdGhpbiAke3ZhbHVlfSBtaWxlcy5gKTtcbiAgICBjb25zdCBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXJlY3Rpb25zLS1kaXN0YW5jZS12YWx1ZScpO1xuICAgIGVsLmlubmVyVGV4dCA9IGAke051bWJlcih2YWx1ZSkudG9GaXhlZCgyKX0gbWkuYDtcbiAgICBzdGF0ZS5tYXhXYWxrRGlzdGFuY2UgPSBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICBtYXBVcGRhdGVOZWFyYnkoKTtcbiAgfSk7XG59XG5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9kaXN0YW5jZVNsaWRlci5qcyIsIi8qISBub3Vpc2xpZGVyIC0gMTAuMC4wIC0gMjAxNy0wNS0yOCAxNDo1Mjo0OCAqL1xyXG5cclxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XHJcblxyXG4gICAgaWYgKCB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XHJcblxyXG4gICAgICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cclxuICAgICAgICBkZWZpbmUoW10sIGZhY3RvcnkpO1xyXG5cclxuICAgIH0gZWxzZSBpZiAoIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyApIHtcclxuXHJcbiAgICAgICAgLy8gTm9kZS9Db21tb25KU1xyXG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xyXG4gICAgICAgIHdpbmRvdy5ub1VpU2xpZGVyID0gZmFjdG9yeSgpO1xyXG4gICAgfVxyXG5cclxufShmdW5jdGlvbiggKXtcclxuXHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHR2YXIgVkVSU0lPTiA9ICcxMC4wLjAnO1xyXG5cclxuXHJcblx0ZnVuY3Rpb24gaXNWYWxpZEZvcm1hdHRlciAoIGVudHJ5ICkge1xyXG5cdFx0cmV0dXJuIHR5cGVvZiBlbnRyeSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGVudHJ5LnRvID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBlbnRyeS5mcm9tID09PSAnZnVuY3Rpb24nO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcmVtb3ZlRWxlbWVudCAoIGVsICkge1xyXG5cdFx0ZWwucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChlbCk7XHJcblx0fVxyXG5cclxuXHQvLyBCaW5kYWJsZSB2ZXJzaW9uXHJcblx0ZnVuY3Rpb24gcHJldmVudERlZmF1bHQgKCBlICkge1xyXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdH1cclxuXHJcblx0Ly8gUmVtb3ZlcyBkdXBsaWNhdGVzIGZyb20gYW4gYXJyYXkuXHJcblx0ZnVuY3Rpb24gdW5pcXVlICggYXJyYXkgKSB7XHJcblx0XHRyZXR1cm4gYXJyYXkuZmlsdGVyKGZ1bmN0aW9uKGEpe1xyXG5cdFx0XHRyZXR1cm4gIXRoaXNbYV0gPyB0aGlzW2FdID0gdHJ1ZSA6IGZhbHNlO1xyXG5cdFx0fSwge30pO1xyXG5cdH1cclxuXHJcblx0Ly8gUm91bmQgYSB2YWx1ZSB0byB0aGUgY2xvc2VzdCAndG8nLlxyXG5cdGZ1bmN0aW9uIGNsb3Nlc3QgKCB2YWx1ZSwgdG8gKSB7XHJcblx0XHRyZXR1cm4gTWF0aC5yb3VuZCh2YWx1ZSAvIHRvKSAqIHRvO1xyXG5cdH1cclxuXHJcblx0Ly8gQ3VycmVudCBwb3NpdGlvbiBvZiBhbiBlbGVtZW50IHJlbGF0aXZlIHRvIHRoZSBkb2N1bWVudC5cclxuXHRmdW5jdGlvbiBvZmZzZXQgKCBlbGVtLCBvcmllbnRhdGlvbiApIHtcclxuXHJcblx0XHR2YXIgcmVjdCA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblx0XHR2YXIgZG9jID0gZWxlbS5vd25lckRvY3VtZW50O1xyXG5cdFx0dmFyIGRvY0VsZW0gPSBkb2MuZG9jdW1lbnRFbGVtZW50O1xyXG5cdFx0dmFyIHBhZ2VPZmZzZXQgPSBnZXRQYWdlT2Zmc2V0KGRvYyk7XHJcblxyXG5cdFx0Ly8gZ2V0Qm91bmRpbmdDbGllbnRSZWN0IGNvbnRhaW5zIGxlZnQgc2Nyb2xsIGluIENocm9tZSBvbiBBbmRyb2lkLlxyXG5cdFx0Ly8gSSBoYXZlbid0IGZvdW5kIGEgZmVhdHVyZSBkZXRlY3Rpb24gdGhhdCBwcm92ZXMgdGhpcy4gV29yc3QgY2FzZVxyXG5cdFx0Ly8gc2NlbmFyaW8gb24gbWlzLW1hdGNoOiB0aGUgJ3RhcCcgZmVhdHVyZSBvbiBob3Jpem9udGFsIHNsaWRlcnMgYnJlYWtzLlxyXG5cdFx0aWYgKCAvd2Via2l0LipDaHJvbWUuKk1vYmlsZS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgKSB7XHJcblx0XHRcdHBhZ2VPZmZzZXQueCA9IDA7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG9yaWVudGF0aW9uID8gKHJlY3QudG9wICsgcGFnZU9mZnNldC55IC0gZG9jRWxlbS5jbGllbnRUb3ApIDogKHJlY3QubGVmdCArIHBhZ2VPZmZzZXQueCAtIGRvY0VsZW0uY2xpZW50TGVmdCk7XHJcblx0fVxyXG5cclxuXHQvLyBDaGVja3Mgd2hldGhlciBhIHZhbHVlIGlzIG51bWVyaWNhbC5cclxuXHRmdW5jdGlvbiBpc051bWVyaWMgKCBhICkge1xyXG5cdFx0cmV0dXJuIHR5cGVvZiBhID09PSAnbnVtYmVyJyAmJiAhaXNOYU4oIGEgKSAmJiBpc0Zpbml0ZSggYSApO1xyXG5cdH1cclxuXHJcblx0Ly8gU2V0cyBhIGNsYXNzIGFuZCByZW1vdmVzIGl0IGFmdGVyIFtkdXJhdGlvbl0gbXMuXHJcblx0ZnVuY3Rpb24gYWRkQ2xhc3NGb3IgKCBlbGVtZW50LCBjbGFzc05hbWUsIGR1cmF0aW9uICkge1xyXG5cdFx0aWYgKGR1cmF0aW9uID4gMCkge1xyXG5cdFx0YWRkQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lKTtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHJlbW92ZUNsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZSk7XHJcblx0XHRcdH0sIGR1cmF0aW9uKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIExpbWl0cyBhIHZhbHVlIHRvIDAgLSAxMDBcclxuXHRmdW5jdGlvbiBsaW1pdCAoIGEgKSB7XHJcblx0XHRyZXR1cm4gTWF0aC5tYXgoTWF0aC5taW4oYSwgMTAwKSwgMCk7XHJcblx0fVxyXG5cclxuXHQvLyBXcmFwcyBhIHZhcmlhYmxlIGFzIGFuIGFycmF5LCBpZiBpdCBpc24ndCBvbmUgeWV0LlxyXG5cdC8vIE5vdGUgdGhhdCBhbiBpbnB1dCBhcnJheSBpcyByZXR1cm5lZCBieSByZWZlcmVuY2UhXHJcblx0ZnVuY3Rpb24gYXNBcnJheSAoIGEgKSB7XHJcblx0XHRyZXR1cm4gQXJyYXkuaXNBcnJheShhKSA/IGEgOiBbYV07XHJcblx0fVxyXG5cclxuXHQvLyBDb3VudHMgZGVjaW1hbHNcclxuXHRmdW5jdGlvbiBjb3VudERlY2ltYWxzICggbnVtU3RyICkge1xyXG5cdFx0bnVtU3RyID0gU3RyaW5nKG51bVN0cik7XHJcblx0XHR2YXIgcGllY2VzID0gbnVtU3RyLnNwbGl0KFwiLlwiKTtcclxuXHRcdHJldHVybiBwaWVjZXMubGVuZ3RoID4gMSA/IHBpZWNlc1sxXS5sZW5ndGggOiAwO1xyXG5cdH1cclxuXHJcblx0Ly8gaHR0cDovL3lvdW1pZ2h0bm90bmVlZGpxdWVyeS5jb20vI2FkZF9jbGFzc1xyXG5cdGZ1bmN0aW9uIGFkZENsYXNzICggZWwsIGNsYXNzTmFtZSApIHtcclxuXHRcdGlmICggZWwuY2xhc3NMaXN0ICkge1xyXG5cdFx0XHRlbC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRlbC5jbGFzc05hbWUgKz0gJyAnICsgY2xhc3NOYW1lO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gaHR0cDovL3lvdW1pZ2h0bm90bmVlZGpxdWVyeS5jb20vI3JlbW92ZV9jbGFzc1xyXG5cdGZ1bmN0aW9uIHJlbW92ZUNsYXNzICggZWwsIGNsYXNzTmFtZSApIHtcclxuXHRcdGlmICggZWwuY2xhc3NMaXN0ICkge1xyXG5cdFx0XHRlbC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWUucmVwbGFjZShuZXcgUmVnRXhwKCcoXnxcXFxcYiknICsgY2xhc3NOYW1lLnNwbGl0KCcgJykuam9pbignfCcpICsgJyhcXFxcYnwkKScsICdnaScpLCAnICcpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gaHR0cHM6Ly9wbGFpbmpzLmNvbS9qYXZhc2NyaXB0L2F0dHJpYnV0ZXMvYWRkaW5nLXJlbW92aW5nLWFuZC10ZXN0aW5nLWZvci1jbGFzc2VzLTkvXHJcblx0ZnVuY3Rpb24gaGFzQ2xhc3MgKCBlbCwgY2xhc3NOYW1lICkge1xyXG5cdFx0cmV0dXJuIGVsLmNsYXNzTGlzdCA/IGVsLmNsYXNzTGlzdC5jb250YWlucyhjbGFzc05hbWUpIDogbmV3IFJlZ0V4cCgnXFxcXGInICsgY2xhc3NOYW1lICsgJ1xcXFxiJykudGVzdChlbC5jbGFzc05hbWUpO1xyXG5cdH1cclxuXHJcblx0Ly8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1dpbmRvdy9zY3JvbGxZI05vdGVzXHJcblx0ZnVuY3Rpb24gZ2V0UGFnZU9mZnNldCAoIGRvYyApIHtcclxuXHJcblx0XHR2YXIgc3VwcG9ydFBhZ2VPZmZzZXQgPSB3aW5kb3cucGFnZVhPZmZzZXQgIT09IHVuZGVmaW5lZDtcclxuXHRcdHZhciBpc0NTUzFDb21wYXQgPSAoKGRvYy5jb21wYXRNb2RlIHx8IFwiXCIpID09PSBcIkNTUzFDb21wYXRcIik7XHJcblx0XHR2YXIgeCA9IHN1cHBvcnRQYWdlT2Zmc2V0ID8gd2luZG93LnBhZ2VYT2Zmc2V0IDogaXNDU1MxQ29tcGF0ID8gZG9jLmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0IDogZG9jLmJvZHkuc2Nyb2xsTGVmdDtcclxuXHRcdHZhciB5ID0gc3VwcG9ydFBhZ2VPZmZzZXQgPyB3aW5kb3cucGFnZVlPZmZzZXQgOiBpc0NTUzFDb21wYXQgPyBkb2MuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCA6IGRvYy5ib2R5LnNjcm9sbFRvcDtcclxuXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHR4OiB4LFxyXG5cdFx0XHR5OiB5XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0Ly8gd2UgcHJvdmlkZSBhIGZ1bmN0aW9uIHRvIGNvbXB1dGUgY29uc3RhbnRzIGluc3RlYWRcclxuXHQvLyBvZiBhY2Nlc3Npbmcgd2luZG93LiogYXMgc29vbiBhcyB0aGUgbW9kdWxlIG5lZWRzIGl0XHJcblx0Ly8gc28gdGhhdCB3ZSBkbyBub3QgY29tcHV0ZSBhbnl0aGluZyBpZiBub3QgbmVlZGVkXHJcblx0ZnVuY3Rpb24gZ2V0QWN0aW9ucyAoICkge1xyXG5cclxuXHRcdC8vIERldGVybWluZSB0aGUgZXZlbnRzIHRvIGJpbmQuIElFMTEgaW1wbGVtZW50cyBwb2ludGVyRXZlbnRzIHdpdGhvdXRcclxuXHRcdC8vIGEgcHJlZml4LCB3aGljaCBicmVha3MgY29tcGF0aWJpbGl0eSB3aXRoIHRoZSBJRTEwIGltcGxlbWVudGF0aW9uLlxyXG5cdFx0cmV0dXJuIHdpbmRvdy5uYXZpZ2F0b3IucG9pbnRlckVuYWJsZWQgPyB7XHJcblx0XHRcdHN0YXJ0OiAncG9pbnRlcmRvd24nLFxyXG5cdFx0XHRtb3ZlOiAncG9pbnRlcm1vdmUnLFxyXG5cdFx0XHRlbmQ6ICdwb2ludGVydXAnXHJcblx0XHR9IDogd2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkID8ge1xyXG5cdFx0XHRzdGFydDogJ01TUG9pbnRlckRvd24nLFxyXG5cdFx0XHRtb3ZlOiAnTVNQb2ludGVyTW92ZScsXHJcblx0XHRcdGVuZDogJ01TUG9pbnRlclVwJ1xyXG5cdFx0fSA6IHtcclxuXHRcdFx0c3RhcnQ6ICdtb3VzZWRvd24gdG91Y2hzdGFydCcsXHJcblx0XHRcdG1vdmU6ICdtb3VzZW1vdmUgdG91Y2htb3ZlJyxcclxuXHRcdFx0ZW5kOiAnbW91c2V1cCB0b3VjaGVuZCdcclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHQvLyBodHRwczovL2dpdGh1Yi5jb20vV0lDRy9FdmVudExpc3RlbmVyT3B0aW9ucy9ibG9iL2doLXBhZ2VzL2V4cGxhaW5lci5tZFxyXG5cdC8vIElzc3VlICM3ODVcclxuXHRmdW5jdGlvbiBnZXRTdXBwb3J0c1Bhc3NpdmUgKCApIHtcclxuXHJcblx0XHR2YXIgc3VwcG9ydHNQYXNzaXZlID0gZmFsc2U7XHJcblxyXG5cdFx0dHJ5IHtcclxuXHJcblx0XHRcdHZhciBvcHRzID0gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAncGFzc2l2ZScsIHtcclxuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0c3VwcG9ydHNQYXNzaXZlID0gdHJ1ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCBudWxsLCBvcHRzKTtcclxuXHJcblx0XHR9IGNhdGNoIChlKSB7fVxyXG5cclxuXHRcdHJldHVybiBzdXBwb3J0c1Bhc3NpdmU7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXRTdXBwb3J0c1RvdWNoQWN0aW9uTm9uZSAoICkge1xyXG5cdFx0cmV0dXJuIHdpbmRvdy5DU1MgJiYgQ1NTLnN1cHBvcnRzICYmIENTUy5zdXBwb3J0cygndG91Y2gtYWN0aW9uJywgJ25vbmUnKTtcclxuXHR9XHJcblxyXG5cclxuLy8gVmFsdWUgY2FsY3VsYXRpb25cclxuXHJcblx0Ly8gRGV0ZXJtaW5lIHRoZSBzaXplIG9mIGEgc3ViLXJhbmdlIGluIHJlbGF0aW9uIHRvIGEgZnVsbCByYW5nZS5cclxuXHRmdW5jdGlvbiBzdWJSYW5nZVJhdGlvICggcGEsIHBiICkge1xyXG5cdFx0cmV0dXJuICgxMDAgLyAocGIgLSBwYSkpO1xyXG5cdH1cclxuXHJcblx0Ly8gKHBlcmNlbnRhZ2UpIEhvdyBtYW55IHBlcmNlbnQgaXMgdGhpcyB2YWx1ZSBvZiB0aGlzIHJhbmdlP1xyXG5cdGZ1bmN0aW9uIGZyb21QZXJjZW50YWdlICggcmFuZ2UsIHZhbHVlICkge1xyXG5cdFx0cmV0dXJuICh2YWx1ZSAqIDEwMCkgLyAoIHJhbmdlWzFdIC0gcmFuZ2VbMF0gKTtcclxuXHR9XHJcblxyXG5cdC8vIChwZXJjZW50YWdlKSBXaGVyZSBpcyB0aGlzIHZhbHVlIG9uIHRoaXMgcmFuZ2U/XHJcblx0ZnVuY3Rpb24gdG9QZXJjZW50YWdlICggcmFuZ2UsIHZhbHVlICkge1xyXG5cdFx0cmV0dXJuIGZyb21QZXJjZW50YWdlKCByYW5nZSwgcmFuZ2VbMF0gPCAwID9cclxuXHRcdFx0dmFsdWUgKyBNYXRoLmFicyhyYW5nZVswXSkgOlxyXG5cdFx0XHRcdHZhbHVlIC0gcmFuZ2VbMF0gKTtcclxuXHR9XHJcblxyXG5cdC8vICh2YWx1ZSkgSG93IG11Y2ggaXMgdGhpcyBwZXJjZW50YWdlIG9uIHRoaXMgcmFuZ2U/XHJcblx0ZnVuY3Rpb24gaXNQZXJjZW50YWdlICggcmFuZ2UsIHZhbHVlICkge1xyXG5cdFx0cmV0dXJuICgodmFsdWUgKiAoIHJhbmdlWzFdIC0gcmFuZ2VbMF0gKSkgLyAxMDApICsgcmFuZ2VbMF07XHJcblx0fVxyXG5cclxuXHJcbi8vIFJhbmdlIGNvbnZlcnNpb25cclxuXHJcblx0ZnVuY3Rpb24gZ2V0SiAoIHZhbHVlLCBhcnIgKSB7XHJcblxyXG5cdFx0dmFyIGogPSAxO1xyXG5cclxuXHRcdHdoaWxlICggdmFsdWUgPj0gYXJyW2pdICl7XHJcblx0XHRcdGogKz0gMTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gajtcclxuXHR9XHJcblxyXG5cdC8vIChwZXJjZW50YWdlKSBJbnB1dCBhIHZhbHVlLCBmaW5kIHdoZXJlLCBvbiBhIHNjYWxlIG9mIDAtMTAwLCBpdCBhcHBsaWVzLlxyXG5cdGZ1bmN0aW9uIHRvU3RlcHBpbmcgKCB4VmFsLCB4UGN0LCB2YWx1ZSApIHtcclxuXHJcblx0XHRpZiAoIHZhbHVlID49IHhWYWwuc2xpY2UoLTEpWzBdICl7XHJcblx0XHRcdHJldHVybiAxMDA7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGogPSBnZXRKKCB2YWx1ZSwgeFZhbCApLCB2YSwgdmIsIHBhLCBwYjtcclxuXHJcblx0XHR2YSA9IHhWYWxbai0xXTtcclxuXHRcdHZiID0geFZhbFtqXTtcclxuXHRcdHBhID0geFBjdFtqLTFdO1xyXG5cdFx0cGIgPSB4UGN0W2pdO1xyXG5cclxuXHRcdHJldHVybiBwYSArICh0b1BlcmNlbnRhZ2UoW3ZhLCB2Yl0sIHZhbHVlKSAvIHN1YlJhbmdlUmF0aW8gKHBhLCBwYikpO1xyXG5cdH1cclxuXHJcblx0Ly8gKHZhbHVlKSBJbnB1dCBhIHBlcmNlbnRhZ2UsIGZpbmQgd2hlcmUgaXQgaXMgb24gdGhlIHNwZWNpZmllZCByYW5nZS5cclxuXHRmdW5jdGlvbiBmcm9tU3RlcHBpbmcgKCB4VmFsLCB4UGN0LCB2YWx1ZSApIHtcclxuXHJcblx0XHQvLyBUaGVyZSBpcyBubyByYW5nZSBncm91cCB0aGF0IGZpdHMgMTAwXHJcblx0XHRpZiAoIHZhbHVlID49IDEwMCApe1xyXG5cdFx0XHRyZXR1cm4geFZhbC5zbGljZSgtMSlbMF07XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGogPSBnZXRKKCB2YWx1ZSwgeFBjdCApLCB2YSwgdmIsIHBhLCBwYjtcclxuXHJcblx0XHR2YSA9IHhWYWxbai0xXTtcclxuXHRcdHZiID0geFZhbFtqXTtcclxuXHRcdHBhID0geFBjdFtqLTFdO1xyXG5cdFx0cGIgPSB4UGN0W2pdO1xyXG5cclxuXHRcdHJldHVybiBpc1BlcmNlbnRhZ2UoW3ZhLCB2Yl0sICh2YWx1ZSAtIHBhKSAqIHN1YlJhbmdlUmF0aW8gKHBhLCBwYikpO1xyXG5cdH1cclxuXHJcblx0Ly8gKHBlcmNlbnRhZ2UpIEdldCB0aGUgc3RlcCB0aGF0IGFwcGxpZXMgYXQgYSBjZXJ0YWluIHZhbHVlLlxyXG5cdGZ1bmN0aW9uIGdldFN0ZXAgKCB4UGN0LCB4U3RlcHMsIHNuYXAsIHZhbHVlICkge1xyXG5cclxuXHRcdGlmICggdmFsdWUgPT09IDEwMCApIHtcclxuXHRcdFx0cmV0dXJuIHZhbHVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBqID0gZ2V0SiggdmFsdWUsIHhQY3QgKSwgYSwgYjtcclxuXHJcblx0XHQvLyBJZiAnc25hcCcgaXMgc2V0LCBzdGVwcyBhcmUgdXNlZCBhcyBmaXhlZCBwb2ludHMgb24gdGhlIHNsaWRlci5cclxuXHRcdGlmICggc25hcCApIHtcclxuXHJcblx0XHRcdGEgPSB4UGN0W2otMV07XHJcblx0XHRcdGIgPSB4UGN0W2pdO1xyXG5cclxuXHRcdFx0Ly8gRmluZCB0aGUgY2xvc2VzdCBwb3NpdGlvbiwgYSBvciBiLlxyXG5cdFx0XHRpZiAoKHZhbHVlIC0gYSkgPiAoKGItYSkvMikpe1xyXG5cdFx0XHRcdHJldHVybiBiO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gYTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoICF4U3RlcHNbai0xXSApe1xyXG5cdFx0XHRyZXR1cm4gdmFsdWU7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHhQY3Rbai0xXSArIGNsb3Nlc3QoXHJcblx0XHRcdHZhbHVlIC0geFBjdFtqLTFdLFxyXG5cdFx0XHR4U3RlcHNbai0xXVxyXG5cdFx0KTtcclxuXHR9XHJcblxyXG5cclxuLy8gRW50cnkgcGFyc2luZ1xyXG5cclxuXHRmdW5jdGlvbiBoYW5kbGVFbnRyeVBvaW50ICggaW5kZXgsIHZhbHVlLCB0aGF0ICkge1xyXG5cclxuXHRcdHZhciBwZXJjZW50YWdlO1xyXG5cclxuXHRcdC8vIFdyYXAgbnVtZXJpY2FsIGlucHV0IGluIGFuIGFycmF5LlxyXG5cdFx0aWYgKCB0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIgKSB7XHJcblx0XHRcdHZhbHVlID0gW3ZhbHVlXTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBSZWplY3QgYW55IGludmFsaWQgaW5wdXQsIGJ5IHRlc3Rpbmcgd2hldGhlciB2YWx1ZSBpcyBhbiBhcnJheS5cclxuXHRcdGlmICggT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKCB2YWx1ZSApICE9PSAnW29iamVjdCBBcnJheV0nICl7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXIgKFwiICsgVkVSU0lPTiArIFwiKTogJ3JhbmdlJyBjb250YWlucyBpbnZhbGlkIHZhbHVlLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBDb3ZlcnQgbWluL21heCBzeW50YXggdG8gMCBhbmQgMTAwLlxyXG5cdFx0aWYgKCBpbmRleCA9PT0gJ21pbicgKSB7XHJcblx0XHRcdHBlcmNlbnRhZ2UgPSAwO1xyXG5cdFx0fSBlbHNlIGlmICggaW5kZXggPT09ICdtYXgnICkge1xyXG5cdFx0XHRwZXJjZW50YWdlID0gMTAwO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cGVyY2VudGFnZSA9IHBhcnNlRmxvYXQoIGluZGV4ICk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gQ2hlY2sgZm9yIGNvcnJlY3QgaW5wdXQuXHJcblx0XHRpZiAoICFpc051bWVyaWMoIHBlcmNlbnRhZ2UgKSB8fCAhaXNOdW1lcmljKCB2YWx1ZVswXSApICkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6ICdyYW5nZScgdmFsdWUgaXNuJ3QgbnVtZXJpYy5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU3RvcmUgdmFsdWVzLlxyXG5cdFx0dGhhdC54UGN0LnB1c2goIHBlcmNlbnRhZ2UgKTtcclxuXHRcdHRoYXQueFZhbC5wdXNoKCB2YWx1ZVswXSApO1xyXG5cclxuXHRcdC8vIE5hTiB3aWxsIGV2YWx1YXRlIHRvIGZhbHNlIHRvbywgYnV0IHRvIGtlZXBcclxuXHRcdC8vIGxvZ2dpbmcgY2xlYXIsIHNldCBzdGVwIGV4cGxpY2l0bHkuIE1ha2Ugc3VyZVxyXG5cdFx0Ly8gbm90IHRvIG92ZXJyaWRlIHRoZSAnc3RlcCcgc2V0dGluZyB3aXRoIGZhbHNlLlxyXG5cdFx0aWYgKCAhcGVyY2VudGFnZSApIHtcclxuXHRcdFx0aWYgKCAhaXNOYU4oIHZhbHVlWzFdICkgKSB7XHJcblx0XHRcdFx0dGhhdC54U3RlcHNbMF0gPSB2YWx1ZVsxXTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhhdC54U3RlcHMucHVzaCggaXNOYU4odmFsdWVbMV0pID8gZmFsc2UgOiB2YWx1ZVsxXSApO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoYXQueEhpZ2hlc3RDb21wbGV0ZVN0ZXAucHVzaCgwKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGhhbmRsZVN0ZXBQb2ludCAoIGksIG4sIHRoYXQgKSB7XHJcblxyXG5cdFx0Ly8gSWdub3JlICdmYWxzZScgc3RlcHBpbmcuXHJcblx0XHRpZiAoICFuICkge1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBGYWN0b3IgdG8gcmFuZ2UgcmF0aW9cclxuXHRcdHRoYXQueFN0ZXBzW2ldID0gZnJvbVBlcmNlbnRhZ2UoW1xyXG5cdFx0XHQgdGhhdC54VmFsW2ldXHJcblx0XHRcdCx0aGF0LnhWYWxbaSsxXVxyXG5cdFx0XSwgbikgLyBzdWJSYW5nZVJhdGlvIChcclxuXHRcdFx0dGhhdC54UGN0W2ldLFxyXG5cdFx0XHR0aGF0LnhQY3RbaSsxXSApO1xyXG5cclxuXHRcdHZhciB0b3RhbFN0ZXBzID0gKHRoYXQueFZhbFtpKzFdIC0gdGhhdC54VmFsW2ldKSAvIHRoYXQueE51bVN0ZXBzW2ldO1xyXG5cdFx0dmFyIGhpZ2hlc3RTdGVwID0gTWF0aC5jZWlsKE51bWJlcih0b3RhbFN0ZXBzLnRvRml4ZWQoMykpIC0gMSk7XHJcblx0XHR2YXIgc3RlcCA9IHRoYXQueFZhbFtpXSArICh0aGF0LnhOdW1TdGVwc1tpXSAqIGhpZ2hlc3RTdGVwKTtcclxuXHJcblx0XHR0aGF0LnhIaWdoZXN0Q29tcGxldGVTdGVwW2ldID0gc3RlcDtcclxuXHR9XHJcblxyXG5cclxuLy8gSW50ZXJmYWNlXHJcblxyXG5cdGZ1bmN0aW9uIFNwZWN0cnVtICggZW50cnksIHNuYXAsIHNpbmdsZVN0ZXAgKSB7XHJcblxyXG5cdFx0dGhpcy54UGN0ID0gW107XHJcblx0XHR0aGlzLnhWYWwgPSBbXTtcclxuXHRcdHRoaXMueFN0ZXBzID0gWyBzaW5nbGVTdGVwIHx8IGZhbHNlIF07XHJcblx0XHR0aGlzLnhOdW1TdGVwcyA9IFsgZmFsc2UgXTtcclxuXHRcdHRoaXMueEhpZ2hlc3RDb21wbGV0ZVN0ZXAgPSBbXTtcclxuXHJcblx0XHR0aGlzLnNuYXAgPSBzbmFwO1xyXG5cclxuXHRcdHZhciBpbmRleCwgb3JkZXJlZCA9IFsgLyogWzAsICdtaW4nXSwgWzEsICc1MCUnXSwgWzIsICdtYXgnXSAqLyBdO1xyXG5cclxuXHRcdC8vIE1hcCB0aGUgb2JqZWN0IGtleXMgdG8gYW4gYXJyYXkuXHJcblx0XHRmb3IgKCBpbmRleCBpbiBlbnRyeSApIHtcclxuXHRcdFx0aWYgKCBlbnRyeS5oYXNPd25Qcm9wZXJ0eShpbmRleCkgKSB7XHJcblx0XHRcdFx0b3JkZXJlZC5wdXNoKFtlbnRyeVtpbmRleF0sIGluZGV4XSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvLyBTb3J0IGFsbCBlbnRyaWVzIGJ5IHZhbHVlIChudW1lcmljIHNvcnQpLlxyXG5cdFx0aWYgKCBvcmRlcmVkLmxlbmd0aCAmJiB0eXBlb2Ygb3JkZXJlZFswXVswXSA9PT0gXCJvYmplY3RcIiApIHtcclxuXHRcdFx0b3JkZXJlZC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIGFbMF1bMF0gLSBiWzBdWzBdOyB9KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdG9yZGVyZWQuc29ydChmdW5jdGlvbihhLCBiKSB7IHJldHVybiBhWzBdIC0gYlswXTsgfSk7XHJcblx0XHR9XHJcblxyXG5cclxuXHRcdC8vIENvbnZlcnQgYWxsIGVudHJpZXMgdG8gc3VicmFuZ2VzLlxyXG5cdFx0Zm9yICggaW5kZXggPSAwOyBpbmRleCA8IG9yZGVyZWQubGVuZ3RoOyBpbmRleCsrICkge1xyXG5cdFx0XHRoYW5kbGVFbnRyeVBvaW50KG9yZGVyZWRbaW5kZXhdWzFdLCBvcmRlcmVkW2luZGV4XVswXSwgdGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU3RvcmUgdGhlIGFjdHVhbCBzdGVwIHZhbHVlcy5cclxuXHRcdC8vIHhTdGVwcyBpcyBzb3J0ZWQgaW4gdGhlIHNhbWUgb3JkZXIgYXMgeFBjdCBhbmQgeFZhbC5cclxuXHRcdHRoaXMueE51bVN0ZXBzID0gdGhpcy54U3RlcHMuc2xpY2UoMCk7XHJcblxyXG5cdFx0Ly8gQ29udmVydCBhbGwgbnVtZXJpYyBzdGVwcyB0byB0aGUgcGVyY2VudGFnZSBvZiB0aGUgc3VicmFuZ2UgdGhleSByZXByZXNlbnQuXHJcblx0XHRmb3IgKCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy54TnVtU3RlcHMubGVuZ3RoOyBpbmRleCsrICkge1xyXG5cdFx0XHRoYW5kbGVTdGVwUG9pbnQoaW5kZXgsIHRoaXMueE51bVN0ZXBzW2luZGV4XSwgdGhpcyk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRTcGVjdHJ1bS5wcm90b3R5cGUuZ2V0TWFyZ2luID0gZnVuY3Rpb24gKCB2YWx1ZSApIHtcclxuXHJcblx0XHR2YXIgc3RlcCA9IHRoaXMueE51bVN0ZXBzWzBdO1xyXG5cclxuXHRcdGlmICggc3RlcCAmJiAoKHZhbHVlIC8gc3RlcCkgJSAxKSAhPT0gMCApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlciAoXCIgKyBWRVJTSU9OICsgXCIpOiAnbGltaXQnLCAnbWFyZ2luJyBhbmQgJ3BhZGRpbmcnIG11c3QgYmUgZGl2aXNpYmxlIGJ5IHN0ZXAuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzLnhQY3QubGVuZ3RoID09PSAyID8gZnJvbVBlcmNlbnRhZ2UodGhpcy54VmFsLCB2YWx1ZSkgOiBmYWxzZTtcclxuXHR9O1xyXG5cclxuXHRTcGVjdHJ1bS5wcm90b3R5cGUudG9TdGVwcGluZyA9IGZ1bmN0aW9uICggdmFsdWUgKSB7XHJcblxyXG5cdFx0dmFsdWUgPSB0b1N0ZXBwaW5nKCB0aGlzLnhWYWwsIHRoaXMueFBjdCwgdmFsdWUgKTtcclxuXHJcblx0XHRyZXR1cm4gdmFsdWU7XHJcblx0fTtcclxuXHJcblx0U3BlY3RydW0ucHJvdG90eXBlLmZyb21TdGVwcGluZyA9IGZ1bmN0aW9uICggdmFsdWUgKSB7XHJcblxyXG5cdFx0cmV0dXJuIGZyb21TdGVwcGluZyggdGhpcy54VmFsLCB0aGlzLnhQY3QsIHZhbHVlICk7XHJcblx0fTtcclxuXHJcblx0U3BlY3RydW0ucHJvdG90eXBlLmdldFN0ZXAgPSBmdW5jdGlvbiAoIHZhbHVlICkge1xyXG5cclxuXHRcdHZhbHVlID0gZ2V0U3RlcCh0aGlzLnhQY3QsIHRoaXMueFN0ZXBzLCB0aGlzLnNuYXAsIHZhbHVlICk7XHJcblxyXG5cdFx0cmV0dXJuIHZhbHVlO1xyXG5cdH07XHJcblxyXG5cdFNwZWN0cnVtLnByb3RvdHlwZS5nZXROZWFyYnlTdGVwcyA9IGZ1bmN0aW9uICggdmFsdWUgKSB7XHJcblxyXG5cdFx0dmFyIGogPSBnZXRKKHZhbHVlLCB0aGlzLnhQY3QpO1xyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHN0ZXBCZWZvcmU6IHsgc3RhcnRWYWx1ZTogdGhpcy54VmFsW2otMl0sIHN0ZXA6IHRoaXMueE51bVN0ZXBzW2otMl0sIGhpZ2hlc3RTdGVwOiB0aGlzLnhIaWdoZXN0Q29tcGxldGVTdGVwW2otMl0gfSxcclxuXHRcdFx0dGhpc1N0ZXA6IHsgc3RhcnRWYWx1ZTogdGhpcy54VmFsW2otMV0sIHN0ZXA6IHRoaXMueE51bVN0ZXBzW2otMV0sIGhpZ2hlc3RTdGVwOiB0aGlzLnhIaWdoZXN0Q29tcGxldGVTdGVwW2otMV0gfSxcclxuXHRcdFx0c3RlcEFmdGVyOiB7IHN0YXJ0VmFsdWU6IHRoaXMueFZhbFtqLTBdLCBzdGVwOiB0aGlzLnhOdW1TdGVwc1tqLTBdLCBoaWdoZXN0U3RlcDogdGhpcy54SGlnaGVzdENvbXBsZXRlU3RlcFtqLTBdIH1cclxuXHRcdH07XHJcblx0fTtcclxuXHJcblx0U3BlY3RydW0ucHJvdG90eXBlLmNvdW50U3RlcERlY2ltYWxzID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIHN0ZXBEZWNpbWFscyA9IHRoaXMueE51bVN0ZXBzLm1hcChjb3VudERlY2ltYWxzKTtcclxuXHRcdHJldHVybiBNYXRoLm1heC5hcHBseShudWxsLCBzdGVwRGVjaW1hbHMpO1xyXG4gXHR9O1xyXG5cclxuXHQvLyBPdXRzaWRlIHRlc3RpbmdcclxuXHRTcGVjdHJ1bS5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uICggdmFsdWUgKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRTdGVwKHRoaXMudG9TdGVwcGluZyh2YWx1ZSkpO1xyXG5cdH07XHJcblxyXG4vKlx0RXZlcnkgaW5wdXQgb3B0aW9uIGlzIHRlc3RlZCBhbmQgcGFyc2VkLiBUaGlzJ2xsIHByZXZlbnRcclxuXHRlbmRsZXNzIHZhbGlkYXRpb24gaW4gaW50ZXJuYWwgbWV0aG9kcy4gVGhlc2UgdGVzdHMgYXJlXHJcblx0c3RydWN0dXJlZCB3aXRoIGFuIGl0ZW0gZm9yIGV2ZXJ5IG9wdGlvbiBhdmFpbGFibGUuIEFuXHJcblx0b3B0aW9uIGNhbiBiZSBtYXJrZWQgYXMgcmVxdWlyZWQgYnkgc2V0dGluZyB0aGUgJ3InIGZsYWcuXHJcblx0VGhlIHRlc3RpbmcgZnVuY3Rpb24gaXMgcHJvdmlkZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM6XHJcblx0XHQtIFRoZSBwcm92aWRlZCB2YWx1ZSBmb3IgdGhlIG9wdGlvbjtcclxuXHRcdC0gQSByZWZlcmVuY2UgdG8gdGhlIG9wdGlvbnMgb2JqZWN0O1xyXG5cdFx0LSBUaGUgbmFtZSBmb3IgdGhlIG9wdGlvbjtcclxuXHJcblx0VGhlIHRlc3RpbmcgZnVuY3Rpb24gcmV0dXJucyBmYWxzZSB3aGVuIGFuIGVycm9yIGlzIGRldGVjdGVkLFxyXG5cdG9yIHRydWUgd2hlbiBldmVyeXRoaW5nIGlzIE9LLiBJdCBjYW4gYWxzbyBtb2RpZnkgdGhlIG9wdGlvblxyXG5cdG9iamVjdCwgdG8gbWFrZSBzdXJlIGFsbCB2YWx1ZXMgY2FuIGJlIGNvcnJlY3RseSBsb29wZWQgZWxzZXdoZXJlLiAqL1xyXG5cclxuXHR2YXIgZGVmYXVsdEZvcm1hdHRlciA9IHsgJ3RvJzogZnVuY3Rpb24oIHZhbHVlICl7XHJcblx0XHRyZXR1cm4gdmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZS50b0ZpeGVkKDIpO1xyXG5cdH0sICdmcm9tJzogTnVtYmVyIH07XHJcblxyXG5cdGZ1bmN0aW9uIHZhbGlkYXRlRm9ybWF0ICggZW50cnkgKSB7XHJcblxyXG5cdFx0Ly8gQW55IG9iamVjdCB3aXRoIGEgdG8gYW5kIGZyb20gbWV0aG9kIGlzIHN1cHBvcnRlZC5cclxuXHRcdGlmICggaXNWYWxpZEZvcm1hdHRlcihlbnRyeSkgKSB7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXIgKFwiICsgVkVSU0lPTiArIFwiKTogJ2Zvcm1hdCcgcmVxdWlyZXMgJ3RvJyBhbmQgJ2Zyb20nIG1ldGhvZHMuXCIpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdGVzdFN0ZXAgKCBwYXJzZWQsIGVudHJ5ICkge1xyXG5cclxuXHRcdGlmICggIWlzTnVtZXJpYyggZW50cnkgKSApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlciAoXCIgKyBWRVJTSU9OICsgXCIpOiAnc3RlcCcgaXMgbm90IG51bWVyaWMuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFRoZSBzdGVwIG9wdGlvbiBjYW4gc3RpbGwgYmUgdXNlZCB0byBzZXQgc3RlcHBpbmdcclxuXHRcdC8vIGZvciBsaW5lYXIgc2xpZGVycy4gT3ZlcndyaXR0ZW4gaWYgc2V0IGluICdyYW5nZScuXHJcblx0XHRwYXJzZWQuc2luZ2xlU3RlcCA9IGVudHJ5O1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdGVzdFJhbmdlICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHQvLyBGaWx0ZXIgaW5jb3JyZWN0IGlucHV0LlxyXG5cdFx0aWYgKCB0eXBlb2YgZW50cnkgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoZW50cnkpICkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6ICdyYW5nZScgaXMgbm90IGFuIG9iamVjdC5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gQ2F0Y2ggbWlzc2luZyBzdGFydCBvciBlbmQuXHJcblx0XHRpZiAoIGVudHJ5Lm1pbiA9PT0gdW5kZWZpbmVkIHx8IGVudHJ5Lm1heCA9PT0gdW5kZWZpbmVkICkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6IE1pc3NpbmcgJ21pbicgb3IgJ21heCcgaW4gJ3JhbmdlJy5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gQ2F0Y2ggZXF1YWwgc3RhcnQgb3IgZW5kLlxyXG5cdFx0aWYgKCBlbnRyeS5taW4gPT09IGVudHJ5Lm1heCApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlciAoXCIgKyBWRVJTSU9OICsgXCIpOiAncmFuZ2UnICdtaW4nIGFuZCAnbWF4JyBjYW5ub3QgYmUgZXF1YWwuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHBhcnNlZC5zcGVjdHJ1bSA9IG5ldyBTcGVjdHJ1bShlbnRyeSwgcGFyc2VkLnNuYXAsIHBhcnNlZC5zaW5nbGVTdGVwKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RTdGFydCAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblxyXG5cdFx0ZW50cnkgPSBhc0FycmF5KGVudHJ5KTtcclxuXHJcblx0XHQvLyBWYWxpZGF0ZSBpbnB1dC4gVmFsdWVzIGFyZW4ndCB0ZXN0ZWQsIGFzIHRoZSBwdWJsaWMgLnZhbCBtZXRob2RcclxuXHRcdC8vIHdpbGwgYWx3YXlzIHByb3ZpZGUgYSB2YWxpZCBsb2NhdGlvbi5cclxuXHRcdGlmICggIUFycmF5LmlzQXJyYXkoIGVudHJ5ICkgfHwgIWVudHJ5Lmxlbmd0aCApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlciAoXCIgKyBWRVJTSU9OICsgXCIpOiAnc3RhcnQnIG9wdGlvbiBpcyBpbmNvcnJlY3QuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFN0b3JlIHRoZSBudW1iZXIgb2YgaGFuZGxlcy5cclxuXHRcdHBhcnNlZC5oYW5kbGVzID0gZW50cnkubGVuZ3RoO1xyXG5cclxuXHRcdC8vIFdoZW4gdGhlIHNsaWRlciBpcyBpbml0aWFsaXplZCwgdGhlIC52YWwgbWV0aG9kIHdpbGxcclxuXHRcdC8vIGJlIGNhbGxlZCB3aXRoIHRoZSBzdGFydCBvcHRpb25zLlxyXG5cdFx0cGFyc2VkLnN0YXJ0ID0gZW50cnk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0ZXN0U25hcCAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblxyXG5cdFx0Ly8gRW5mb3JjZSAxMDAlIHN0ZXBwaW5nIHdpdGhpbiBzdWJyYW5nZXMuXHJcblx0XHRwYXJzZWQuc25hcCA9IGVudHJ5O1xyXG5cclxuXHRcdGlmICggdHlwZW9mIGVudHJ5ICE9PSAnYm9vbGVhbicgKXtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlciAoXCIgKyBWRVJTSU9OICsgXCIpOiAnc25hcCcgb3B0aW9uIG11c3QgYmUgYSBib29sZWFuLlwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RBbmltYXRlICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHQvLyBFbmZvcmNlIDEwMCUgc3RlcHBpbmcgd2l0aGluIHN1YnJhbmdlcy5cclxuXHRcdHBhcnNlZC5hbmltYXRlID0gZW50cnk7XHJcblxyXG5cdFx0aWYgKCB0eXBlb2YgZW50cnkgIT09ICdib29sZWFuJyApe1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6ICdhbmltYXRlJyBvcHRpb24gbXVzdCBiZSBhIGJvb2xlYW4uXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdGVzdEFuaW1hdGlvbkR1cmF0aW9uICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHRwYXJzZWQuYW5pbWF0aW9uRHVyYXRpb24gPSBlbnRyeTtcclxuXHJcblx0XHRpZiAoIHR5cGVvZiBlbnRyeSAhPT0gJ251bWJlcicgKXtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlciAoXCIgKyBWRVJTSU9OICsgXCIpOiAnYW5pbWF0aW9uRHVyYXRpb24nIG9wdGlvbiBtdXN0IGJlIGEgbnVtYmVyLlwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RDb25uZWN0ICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHR2YXIgY29ubmVjdCA9IFtmYWxzZV07XHJcblx0XHR2YXIgaTtcclxuXHJcblx0XHQvLyBNYXAgbGVnYWN5IG9wdGlvbnNcclxuXHRcdGlmICggZW50cnkgPT09ICdsb3dlcicgKSB7XHJcblx0XHRcdGVudHJ5ID0gW3RydWUsIGZhbHNlXTtcclxuXHRcdH1cclxuXHJcblx0XHRlbHNlIGlmICggZW50cnkgPT09ICd1cHBlcicgKSB7XHJcblx0XHRcdGVudHJ5ID0gW2ZhbHNlLCB0cnVlXTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBIYW5kbGUgYm9vbGVhbiBvcHRpb25zXHJcblx0XHRpZiAoIGVudHJ5ID09PSB0cnVlIHx8IGVudHJ5ID09PSBmYWxzZSApIHtcclxuXHJcblx0XHRcdGZvciAoIGkgPSAxOyBpIDwgcGFyc2VkLmhhbmRsZXM7IGkrKyApIHtcclxuXHRcdFx0XHRjb25uZWN0LnB1c2goZW50cnkpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRjb25uZWN0LnB1c2goZmFsc2UpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFJlamVjdCBpbnZhbGlkIGlucHV0XHJcblx0XHRlbHNlIGlmICggIUFycmF5LmlzQXJyYXkoIGVudHJ5ICkgfHwgIWVudHJ5Lmxlbmd0aCB8fCBlbnRyeS5sZW5ndGggIT09IHBhcnNlZC5oYW5kbGVzICsgMSApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlciAoXCIgKyBWRVJTSU9OICsgXCIpOiAnY29ubmVjdCcgb3B0aW9uIGRvZXNuJ3QgbWF0Y2ggaGFuZGxlIGNvdW50LlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHRlbHNlIHtcclxuXHRcdFx0Y29ubmVjdCA9IGVudHJ5O1xyXG5cdFx0fVxyXG5cclxuXHRcdHBhcnNlZC5jb25uZWN0ID0gY29ubmVjdDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RPcmllbnRhdGlvbiAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblxyXG5cdFx0Ly8gU2V0IG9yaWVudGF0aW9uIHRvIGFuIGEgbnVtZXJpY2FsIHZhbHVlIGZvciBlYXN5XHJcblx0XHQvLyBhcnJheSBzZWxlY3Rpb24uXHJcblx0XHRzd2l0Y2ggKCBlbnRyeSApe1xyXG5cdFx0ICBjYXNlICdob3Jpem9udGFsJzpcclxuXHRcdFx0cGFyc2VkLm9ydCA9IDA7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0ICBjYXNlICd2ZXJ0aWNhbCc6XHJcblx0XHRcdHBhcnNlZC5vcnQgPSAxO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdCAgZGVmYXVsdDpcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlciAoXCIgKyBWRVJTSU9OICsgXCIpOiAnb3JpZW50YXRpb24nIG9wdGlvbiBpcyBpbnZhbGlkLlwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RNYXJnaW4gKCBwYXJzZWQsIGVudHJ5ICkge1xyXG5cclxuXHRcdGlmICggIWlzTnVtZXJpYyhlbnRyeSkgKXtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlciAoXCIgKyBWRVJTSU9OICsgXCIpOiAnbWFyZ2luJyBvcHRpb24gbXVzdCBiZSBudW1lcmljLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBJc3N1ZSAjNTgyXHJcblx0XHRpZiAoIGVudHJ5ID09PSAwICkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0cGFyc2VkLm1hcmdpbiA9IHBhcnNlZC5zcGVjdHJ1bS5nZXRNYXJnaW4oZW50cnkpO1xyXG5cclxuXHRcdGlmICggIXBhcnNlZC5tYXJnaW4gKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXIgKFwiICsgVkVSU0lPTiArIFwiKTogJ21hcmdpbicgb3B0aW9uIGlzIG9ubHkgc3VwcG9ydGVkIG9uIGxpbmVhciBzbGlkZXJzLlwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RMaW1pdCAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblxyXG5cdFx0aWYgKCAhaXNOdW1lcmljKGVudHJ5KSApe1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6ICdsaW1pdCcgb3B0aW9uIG11c3QgYmUgbnVtZXJpYy5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0cGFyc2VkLmxpbWl0ID0gcGFyc2VkLnNwZWN0cnVtLmdldE1hcmdpbihlbnRyeSk7XHJcblxyXG5cdFx0aWYgKCAhcGFyc2VkLmxpbWl0IHx8IHBhcnNlZC5oYW5kbGVzIDwgMiApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlciAoXCIgKyBWRVJTSU9OICsgXCIpOiAnbGltaXQnIG9wdGlvbiBpcyBvbmx5IHN1cHBvcnRlZCBvbiBsaW5lYXIgc2xpZGVycyB3aXRoIDIgb3IgbW9yZSBoYW5kbGVzLlwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RQYWRkaW5nICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHRpZiAoICFpc051bWVyaWMoZW50cnkpICl7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXIgKFwiICsgVkVSU0lPTiArIFwiKTogJ3BhZGRpbmcnIG9wdGlvbiBtdXN0IGJlIG51bWVyaWMuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICggZW50cnkgPT09IDAgKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRwYXJzZWQucGFkZGluZyA9IHBhcnNlZC5zcGVjdHJ1bS5nZXRNYXJnaW4oZW50cnkpO1xyXG5cclxuXHRcdGlmICggIXBhcnNlZC5wYWRkaW5nICkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6ICdwYWRkaW5nJyBvcHRpb24gaXMgb25seSBzdXBwb3J0ZWQgb24gbGluZWFyIHNsaWRlcnMuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICggcGFyc2VkLnBhZGRpbmcgPCAwICkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6ICdwYWRkaW5nJyBvcHRpb24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlci5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCBwYXJzZWQucGFkZGluZyA+PSA1MCApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlciAoXCIgKyBWRVJTSU9OICsgXCIpOiAncGFkZGluZycgb3B0aW9uIG11c3QgYmUgbGVzcyB0aGFuIGhhbGYgdGhlIHJhbmdlLlwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3REaXJlY3Rpb24gKCBwYXJzZWQsIGVudHJ5ICkge1xyXG5cclxuXHRcdC8vIFNldCBkaXJlY3Rpb24gYXMgYSBudW1lcmljYWwgdmFsdWUgZm9yIGVhc3kgcGFyc2luZy5cclxuXHRcdC8vIEludmVydCBjb25uZWN0aW9uIGZvciBSVEwgc2xpZGVycywgc28gdGhhdCB0aGUgcHJvcGVyXHJcblx0XHQvLyBoYW5kbGVzIGdldCB0aGUgY29ubmVjdC9iYWNrZ3JvdW5kIGNsYXNzZXMuXHJcblx0XHRzd2l0Y2ggKCBlbnRyeSApIHtcclxuXHRcdCAgY2FzZSAnbHRyJzpcclxuXHRcdFx0cGFyc2VkLmRpciA9IDA7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0ICBjYXNlICdydGwnOlxyXG5cdFx0XHRwYXJzZWQuZGlyID0gMTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHQgIGRlZmF1bHQ6XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXIgKFwiICsgVkVSU0lPTiArIFwiKTogJ2RpcmVjdGlvbicgb3B0aW9uIHdhcyBub3QgcmVjb2duaXplZC5cIik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0ZXN0QmVoYXZpb3VyICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHQvLyBNYWtlIHN1cmUgdGhlIGlucHV0IGlzIGEgc3RyaW5nLlxyXG5cdFx0aWYgKCB0eXBlb2YgZW50cnkgIT09ICdzdHJpbmcnICkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6ICdiZWhhdmlvdXInIG11c3QgYmUgYSBzdHJpbmcgY29udGFpbmluZyBvcHRpb25zLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBDaGVjayBpZiB0aGUgc3RyaW5nIGNvbnRhaW5zIGFueSBrZXl3b3Jkcy5cclxuXHRcdC8vIE5vbmUgYXJlIHJlcXVpcmVkLlxyXG5cdFx0dmFyIHRhcCA9IGVudHJ5LmluZGV4T2YoJ3RhcCcpID49IDA7XHJcblx0XHR2YXIgZHJhZyA9IGVudHJ5LmluZGV4T2YoJ2RyYWcnKSA+PSAwO1xyXG5cdFx0dmFyIGZpeGVkID0gZW50cnkuaW5kZXhPZignZml4ZWQnKSA+PSAwO1xyXG5cdFx0dmFyIHNuYXAgPSBlbnRyeS5pbmRleE9mKCdzbmFwJykgPj0gMDtcclxuXHRcdHZhciBob3ZlciA9IGVudHJ5LmluZGV4T2YoJ2hvdmVyJykgPj0gMDtcclxuXHJcblx0XHRpZiAoIGZpeGVkICkge1xyXG5cclxuXHRcdFx0aWYgKCBwYXJzZWQuaGFuZGxlcyAhPT0gMiApIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6ICdmaXhlZCcgYmVoYXZpb3VyIG11c3QgYmUgdXNlZCB3aXRoIDIgaGFuZGxlc1wiKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gVXNlIG1hcmdpbiB0byBlbmZvcmNlIGZpeGVkIHN0YXRlXHJcblx0XHRcdHRlc3RNYXJnaW4ocGFyc2VkLCBwYXJzZWQuc3RhcnRbMV0gLSBwYXJzZWQuc3RhcnRbMF0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdHBhcnNlZC5ldmVudHMgPSB7XHJcblx0XHRcdHRhcDogdGFwIHx8IHNuYXAsXHJcblx0XHRcdGRyYWc6IGRyYWcsXHJcblx0XHRcdGZpeGVkOiBmaXhlZCxcclxuXHRcdFx0c25hcDogc25hcCxcclxuXHRcdFx0aG92ZXI6IGhvdmVyXHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdGVzdFRvb2x0aXBzICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHRpZiAoIGVudHJ5ID09PSBmYWxzZSApIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGVsc2UgaWYgKCBlbnRyeSA9PT0gdHJ1ZSApIHtcclxuXHJcblx0XHRcdHBhcnNlZC50b29sdGlwcyA9IFtdO1xyXG5cclxuXHRcdFx0Zm9yICggdmFyIGkgPSAwOyBpIDwgcGFyc2VkLmhhbmRsZXM7IGkrKyApIHtcclxuXHRcdFx0XHRwYXJzZWQudG9vbHRpcHMucHVzaCh0cnVlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGVsc2Uge1xyXG5cclxuXHRcdFx0cGFyc2VkLnRvb2x0aXBzID0gYXNBcnJheShlbnRyeSk7XHJcblxyXG5cdFx0XHRpZiAoIHBhcnNlZC50b29sdGlwcy5sZW5ndGggIT09IHBhcnNlZC5oYW5kbGVzICkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXIgKFwiICsgVkVSU0lPTiArIFwiKTogbXVzdCBwYXNzIGEgZm9ybWF0dGVyIGZvciBhbGwgaGFuZGxlcy5cIik7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHBhcnNlZC50b29sdGlwcy5mb3JFYWNoKGZ1bmN0aW9uKGZvcm1hdHRlcil7XHJcblx0XHRcdFx0aWYgKCB0eXBlb2YgZm9ybWF0dGVyICE9PSAnYm9vbGVhbicgJiYgKHR5cGVvZiBmb3JtYXR0ZXIgIT09ICdvYmplY3QnIHx8IHR5cGVvZiBmb3JtYXR0ZXIudG8gIT09ICdmdW5jdGlvbicpICkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlciAoXCIgKyBWRVJTSU9OICsgXCIpOiAndG9vbHRpcHMnIG11c3QgYmUgcGFzc2VkIGEgZm9ybWF0dGVyIG9yICdmYWxzZScuXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0ZXN0QXJpYUZvcm1hdCAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblx0XHRwYXJzZWQuYXJpYUZvcm1hdCA9IGVudHJ5O1xyXG5cdFx0dmFsaWRhdGVGb3JtYXQoZW50cnkpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdGVzdEZvcm1hdCAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblx0XHRwYXJzZWQuZm9ybWF0ID0gZW50cnk7XHJcblx0XHR2YWxpZGF0ZUZvcm1hdChlbnRyeSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0ZXN0Q3NzUHJlZml4ICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHRpZiAoIGVudHJ5ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGVudHJ5ICE9PSAnc3RyaW5nJyAmJiBlbnRyeSAhPT0gZmFsc2UgKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXIgKFwiICsgVkVSU0lPTiArIFwiKTogJ2Nzc1ByZWZpeCcgbXVzdCBiZSBhIHN0cmluZyBvciBgZmFsc2VgLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHRwYXJzZWQuY3NzUHJlZml4ID0gZW50cnk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0ZXN0Q3NzQ2xhc3NlcyAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblxyXG5cdFx0aWYgKCBlbnRyeSAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBlbnRyeSAhPT0gJ29iamVjdCcgKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXIgKFwiICsgVkVSU0lPTiArIFwiKTogJ2Nzc0NsYXNzZXMnIG11c3QgYmUgYW4gb2JqZWN0LlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIHR5cGVvZiBwYXJzZWQuY3NzUHJlZml4ID09PSAnc3RyaW5nJyApIHtcclxuXHRcdFx0cGFyc2VkLmNzc0NsYXNzZXMgPSB7fTtcclxuXHJcblx0XHRcdGZvciAoIHZhciBrZXkgaW4gZW50cnkgKSB7XHJcblx0XHRcdFx0aWYgKCAhZW50cnkuaGFzT3duUHJvcGVydHkoa2V5KSApIHsgY29udGludWU7IH1cclxuXHJcblx0XHRcdFx0cGFyc2VkLmNzc0NsYXNzZXNba2V5XSA9IHBhcnNlZC5jc3NQcmVmaXggKyBlbnRyeVtrZXldO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRwYXJzZWQuY3NzQ2xhc3NlcyA9IGVudHJ5O1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdGVzdFVzZVJhZiAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblx0XHRpZiAoIGVudHJ5ID09PSB0cnVlIHx8IGVudHJ5ID09PSBmYWxzZSApIHtcclxuXHRcdFx0cGFyc2VkLnVzZVJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGVudHJ5O1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlciAoXCIgKyBWRVJTSU9OICsgXCIpOiAndXNlUmVxdWVzdEFuaW1hdGlvbkZyYW1lJyBvcHRpb24gc2hvdWxkIGJlIHRydWUgKGRlZmF1bHQpIG9yIGZhbHNlLlwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIFRlc3QgYWxsIGRldmVsb3BlciBzZXR0aW5ncyBhbmQgcGFyc2UgdG8gYXNzdW1wdGlvbi1zYWZlIHZhbHVlcy5cclxuXHRmdW5jdGlvbiB0ZXN0T3B0aW9ucyAoIG9wdGlvbnMgKSB7XHJcblxyXG5cdFx0Ly8gVG8gcHJvdmUgYSBmaXggZm9yICM1MzcsIGZyZWV6ZSBvcHRpb25zIGhlcmUuXHJcblx0XHQvLyBJZiB0aGUgb2JqZWN0IGlzIG1vZGlmaWVkLCBhbiBlcnJvciB3aWxsIGJlIHRocm93bi5cclxuXHRcdC8vIE9iamVjdC5mcmVlemUob3B0aW9ucyk7XHJcblxyXG5cdFx0dmFyIHBhcnNlZCA9IHtcclxuXHRcdFx0bWFyZ2luOiAwLFxyXG5cdFx0XHRsaW1pdDogMCxcclxuXHRcdFx0cGFkZGluZzogMCxcclxuXHRcdFx0YW5pbWF0ZTogdHJ1ZSxcclxuXHRcdFx0YW5pbWF0aW9uRHVyYXRpb246IDMwMCxcclxuXHRcdFx0YXJpYUZvcm1hdDogZGVmYXVsdEZvcm1hdHRlcixcclxuXHRcdFx0Zm9ybWF0OiBkZWZhdWx0Rm9ybWF0dGVyXHJcblx0XHR9O1xyXG5cclxuXHRcdC8vIFRlc3RzIGFyZSBleGVjdXRlZCBpbiB0aGUgb3JkZXIgdGhleSBhcmUgcHJlc2VudGVkIGhlcmUuXHJcblx0XHR2YXIgdGVzdHMgPSB7XHJcblx0XHRcdCdzdGVwJzogeyByOiBmYWxzZSwgdDogdGVzdFN0ZXAgfSxcclxuXHRcdFx0J3N0YXJ0JzogeyByOiB0cnVlLCB0OiB0ZXN0U3RhcnQgfSxcclxuXHRcdFx0J2Nvbm5lY3QnOiB7IHI6IHRydWUsIHQ6IHRlc3RDb25uZWN0IH0sXHJcblx0XHRcdCdkaXJlY3Rpb24nOiB7IHI6IHRydWUsIHQ6IHRlc3REaXJlY3Rpb24gfSxcclxuXHRcdFx0J3NuYXAnOiB7IHI6IGZhbHNlLCB0OiB0ZXN0U25hcCB9LFxyXG5cdFx0XHQnYW5pbWF0ZSc6IHsgcjogZmFsc2UsIHQ6IHRlc3RBbmltYXRlIH0sXHJcblx0XHRcdCdhbmltYXRpb25EdXJhdGlvbic6IHsgcjogZmFsc2UsIHQ6IHRlc3RBbmltYXRpb25EdXJhdGlvbiB9LFxyXG5cdFx0XHQncmFuZ2UnOiB7IHI6IHRydWUsIHQ6IHRlc3RSYW5nZSB9LFxyXG5cdFx0XHQnb3JpZW50YXRpb24nOiB7IHI6IGZhbHNlLCB0OiB0ZXN0T3JpZW50YXRpb24gfSxcclxuXHRcdFx0J21hcmdpbic6IHsgcjogZmFsc2UsIHQ6IHRlc3RNYXJnaW4gfSxcclxuXHRcdFx0J2xpbWl0JzogeyByOiBmYWxzZSwgdDogdGVzdExpbWl0IH0sXHJcblx0XHRcdCdwYWRkaW5nJzogeyByOiBmYWxzZSwgdDogdGVzdFBhZGRpbmcgfSxcclxuXHRcdFx0J2JlaGF2aW91cic6IHsgcjogdHJ1ZSwgdDogdGVzdEJlaGF2aW91ciB9LFxyXG5cdFx0XHQnYXJpYUZvcm1hdCc6IHsgcjogZmFsc2UsIHQ6IHRlc3RBcmlhRm9ybWF0IH0sXHJcblx0XHRcdCdmb3JtYXQnOiB7IHI6IGZhbHNlLCB0OiB0ZXN0Rm9ybWF0IH0sXHJcblx0XHRcdCd0b29sdGlwcyc6IHsgcjogZmFsc2UsIHQ6IHRlc3RUb29sdGlwcyB9LFxyXG5cdFx0XHQnY3NzUHJlZml4JzogeyByOiBmYWxzZSwgdDogdGVzdENzc1ByZWZpeCB9LFxyXG5cdFx0XHQnY3NzQ2xhc3Nlcyc6IHsgcjogZmFsc2UsIHQ6IHRlc3RDc3NDbGFzc2VzIH0sXHJcblx0XHRcdCd1c2VSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnOiB7IHI6IGZhbHNlLCB0OiB0ZXN0VXNlUmFmIH1cclxuXHRcdH07XHJcblxyXG5cdFx0dmFyIGRlZmF1bHRzID0ge1xyXG5cdFx0XHQnY29ubmVjdCc6IGZhbHNlLFxyXG5cdFx0XHQnZGlyZWN0aW9uJzogJ2x0cicsXHJcblx0XHRcdCdiZWhhdmlvdXInOiAndGFwJyxcclxuXHRcdFx0J29yaWVudGF0aW9uJzogJ2hvcml6b250YWwnLFxyXG5cdFx0XHQnY3NzUHJlZml4JyA6ICdub1VpLScsXHJcblx0XHRcdCdjc3NDbGFzc2VzJzoge1xyXG5cdFx0XHRcdHRhcmdldDogJ3RhcmdldCcsXHJcblx0XHRcdFx0YmFzZTogJ2Jhc2UnLFxyXG5cdFx0XHRcdG9yaWdpbjogJ29yaWdpbicsXHJcblx0XHRcdFx0aGFuZGxlOiAnaGFuZGxlJyxcclxuXHRcdFx0XHRoYW5kbGVMb3dlcjogJ2hhbmRsZS1sb3dlcicsXHJcblx0XHRcdFx0aGFuZGxlVXBwZXI6ICdoYW5kbGUtdXBwZXInLFxyXG5cdFx0XHRcdGhvcml6b250YWw6ICdob3Jpem9udGFsJyxcclxuXHRcdFx0XHR2ZXJ0aWNhbDogJ3ZlcnRpY2FsJyxcclxuXHRcdFx0XHRiYWNrZ3JvdW5kOiAnYmFja2dyb3VuZCcsXHJcblx0XHRcdFx0Y29ubmVjdDogJ2Nvbm5lY3QnLFxyXG5cdFx0XHRcdGx0cjogJ2x0cicsXHJcblx0XHRcdFx0cnRsOiAncnRsJyxcclxuXHRcdFx0XHRkcmFnZ2FibGU6ICdkcmFnZ2FibGUnLFxyXG5cdFx0XHRcdGRyYWc6ICdzdGF0ZS1kcmFnJyxcclxuXHRcdFx0XHR0YXA6ICdzdGF0ZS10YXAnLFxyXG5cdFx0XHRcdGFjdGl2ZTogJ2FjdGl2ZScsXHJcblx0XHRcdFx0dG9vbHRpcDogJ3Rvb2x0aXAnLFxyXG5cdFx0XHRcdHBpcHM6ICdwaXBzJyxcclxuXHRcdFx0XHRwaXBzSG9yaXpvbnRhbDogJ3BpcHMtaG9yaXpvbnRhbCcsXHJcblx0XHRcdFx0cGlwc1ZlcnRpY2FsOiAncGlwcy12ZXJ0aWNhbCcsXHJcblx0XHRcdFx0bWFya2VyOiAnbWFya2VyJyxcclxuXHRcdFx0XHRtYXJrZXJIb3Jpem9udGFsOiAnbWFya2VyLWhvcml6b250YWwnLFxyXG5cdFx0XHRcdG1hcmtlclZlcnRpY2FsOiAnbWFya2VyLXZlcnRpY2FsJyxcclxuXHRcdFx0XHRtYXJrZXJOb3JtYWw6ICdtYXJrZXItbm9ybWFsJyxcclxuXHRcdFx0XHRtYXJrZXJMYXJnZTogJ21hcmtlci1sYXJnZScsXHJcblx0XHRcdFx0bWFya2VyU3ViOiAnbWFya2VyLXN1YicsXHJcblx0XHRcdFx0dmFsdWU6ICd2YWx1ZScsXHJcblx0XHRcdFx0dmFsdWVIb3Jpem9udGFsOiAndmFsdWUtaG9yaXpvbnRhbCcsXHJcblx0XHRcdFx0dmFsdWVWZXJ0aWNhbDogJ3ZhbHVlLXZlcnRpY2FsJyxcclxuXHRcdFx0XHR2YWx1ZU5vcm1hbDogJ3ZhbHVlLW5vcm1hbCcsXHJcblx0XHRcdFx0dmFsdWVMYXJnZTogJ3ZhbHVlLWxhcmdlJyxcclxuXHRcdFx0XHR2YWx1ZVN1YjogJ3ZhbHVlLXN1YidcclxuXHRcdFx0fSxcclxuXHRcdFx0J3VzZVJlcXVlc3RBbmltYXRpb25GcmFtZSc6IHRydWVcclxuXHRcdH07XHJcblxyXG5cdFx0Ly8gQXJpYUZvcm1hdCBkZWZhdWx0cyB0byByZWd1bGFyIGZvcm1hdCwgaWYgYW55LlxyXG5cdFx0aWYgKCBvcHRpb25zLmZvcm1hdCAmJiAhb3B0aW9ucy5hcmlhRm9ybWF0ICkge1xyXG5cdFx0XHRvcHRpb25zLmFyaWFGb3JtYXQgPSBvcHRpb25zLmZvcm1hdDtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBSdW4gYWxsIG9wdGlvbnMgdGhyb3VnaCBhIHRlc3RpbmcgbWVjaGFuaXNtIHRvIGVuc3VyZSBjb3JyZWN0XHJcblx0XHQvLyBpbnB1dC4gSXQgc2hvdWxkIGJlIG5vdGVkIHRoYXQgb3B0aW9ucyBtaWdodCBnZXQgbW9kaWZpZWQgdG9cclxuXHRcdC8vIGJlIGhhbmRsZWQgcHJvcGVybHkuIEUuZy4gd3JhcHBpbmcgaW50ZWdlcnMgaW4gYXJyYXlzLlxyXG5cdFx0T2JqZWN0LmtleXModGVzdHMpLmZvckVhY2goZnVuY3Rpb24oIG5hbWUgKXtcclxuXHJcblx0XHRcdC8vIElmIHRoZSBvcHRpb24gaXNuJ3Qgc2V0LCBidXQgaXQgaXMgcmVxdWlyZWQsIHRocm93IGFuIGVycm9yLlxyXG5cdFx0XHRpZiAoIG9wdGlvbnNbbmFtZV0gPT09IHVuZGVmaW5lZCAmJiBkZWZhdWx0c1tuYW1lXSA9PT0gdW5kZWZpbmVkICkge1xyXG5cclxuXHRcdFx0XHRpZiAoIHRlc3RzW25hbWVdLnIgKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6ICdcIiArIG5hbWUgKyBcIicgaXMgcmVxdWlyZWQuXCIpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRlc3RzW25hbWVdLnQoIHBhcnNlZCwgb3B0aW9uc1tuYW1lXSA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdHNbbmFtZV0gOiBvcHRpb25zW25hbWVdICk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBGb3J3YXJkIHBpcHMgb3B0aW9uc1xyXG5cdFx0cGFyc2VkLnBpcHMgPSBvcHRpb25zLnBpcHM7XHJcblxyXG5cdFx0dmFyIHN0eWxlcyA9IFtbJ2xlZnQnLCAndG9wJ10sIFsncmlnaHQnLCAnYm90dG9tJ11dO1xyXG5cclxuXHRcdC8vIFByZS1kZWZpbmUgdGhlIHN0eWxlcy5cclxuXHRcdHBhcnNlZC5zdHlsZSA9IHN0eWxlc1twYXJzZWQuZGlyXVtwYXJzZWQub3J0XTtcclxuXHRcdHBhcnNlZC5zdHlsZU9wb3NpdGUgPSBzdHlsZXNbcGFyc2VkLmRpcj8wOjFdW3BhcnNlZC5vcnRdO1xyXG5cclxuXHRcdHJldHVybiBwYXJzZWQ7XHJcblx0fVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNsb3N1cmUgKCB0YXJnZXQsIG9wdGlvbnMsIG9yaWdpbmFsT3B0aW9ucyApe1xyXG5cclxuXHR2YXIgYWN0aW9ucyA9IGdldEFjdGlvbnMoKTtcclxuXHR2YXIgc3VwcG9ydHNUb3VjaEFjdGlvbk5vbmUgPSBnZXRTdXBwb3J0c1RvdWNoQWN0aW9uTm9uZSgpO1xyXG5cdHZhciBzdXBwb3J0c1Bhc3NpdmUgPSBzdXBwb3J0c1RvdWNoQWN0aW9uTm9uZSAmJiBnZXRTdXBwb3J0c1Bhc3NpdmUoKTtcclxuXHJcblx0Ly8gQWxsIHZhcmlhYmxlcyBsb2NhbCB0byAnY2xvc3VyZScgYXJlIHByZWZpeGVkIHdpdGggJ3Njb3BlXydcclxuXHR2YXIgc2NvcGVfVGFyZ2V0ID0gdGFyZ2V0O1xyXG5cdHZhciBzY29wZV9Mb2NhdGlvbnMgPSBbXTtcclxuXHR2YXIgc2NvcGVfQmFzZTtcclxuXHR2YXIgc2NvcGVfSGFuZGxlcztcclxuXHR2YXIgc2NvcGVfSGFuZGxlTnVtYmVycyA9IFtdO1xyXG5cdHZhciBzY29wZV9BY3RpdmVIYW5kbGUgPSBmYWxzZTtcclxuXHR2YXIgc2NvcGVfQ29ubmVjdHM7XHJcblx0dmFyIHNjb3BlX1NwZWN0cnVtID0gb3B0aW9ucy5zcGVjdHJ1bTtcclxuXHR2YXIgc2NvcGVfVmFsdWVzID0gW107XHJcblx0dmFyIHNjb3BlX0V2ZW50cyA9IHt9O1xyXG5cdHZhciBzY29wZV9TZWxmO1xyXG5cdHZhciBzY29wZV9QaXBzO1xyXG5cdHZhciBzY29wZV9MaXN0ZW5lcnMgPSBudWxsO1xyXG5cdHZhciBzY29wZV9Eb2N1bWVudCA9IHRhcmdldC5vd25lckRvY3VtZW50O1xyXG5cdHZhciBzY29wZV9Eb2N1bWVudEVsZW1lbnQgPSBzY29wZV9Eb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XHJcblx0dmFyIHNjb3BlX0JvZHkgPSBzY29wZV9Eb2N1bWVudC5ib2R5O1xyXG5cclxuXHJcblx0Ly8gQ3JlYXRlcyBhIG5vZGUsIGFkZHMgaXQgdG8gdGFyZ2V0LCByZXR1cm5zIHRoZSBuZXcgbm9kZS5cclxuXHRmdW5jdGlvbiBhZGROb2RlVG8gKCB0YXJnZXQsIGNsYXNzTmFtZSApIHtcclxuXHJcblx0XHR2YXIgZGl2ID0gc2NvcGVfRG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG5cdFx0aWYgKCBjbGFzc05hbWUgKSB7XHJcblx0XHRcdGFkZENsYXNzKGRpdiwgY2xhc3NOYW1lKTtcclxuXHRcdH1cclxuXHJcblx0XHR0YXJnZXQuYXBwZW5kQ2hpbGQoZGl2KTtcclxuXHJcblx0XHRyZXR1cm4gZGl2O1xyXG5cdH1cclxuXHJcblx0Ly8gQXBwZW5kIGEgb3JpZ2luIHRvIHRoZSBiYXNlXHJcblx0ZnVuY3Rpb24gYWRkT3JpZ2luICggYmFzZSwgaGFuZGxlTnVtYmVyICkge1xyXG5cclxuXHRcdHZhciBvcmlnaW4gPSBhZGROb2RlVG8oYmFzZSwgb3B0aW9ucy5jc3NDbGFzc2VzLm9yaWdpbik7XHJcblx0XHR2YXIgaGFuZGxlID0gYWRkTm9kZVRvKG9yaWdpbiwgb3B0aW9ucy5jc3NDbGFzc2VzLmhhbmRsZSk7XHJcblxyXG5cdFx0aGFuZGxlLnNldEF0dHJpYnV0ZSgnZGF0YS1oYW5kbGUnLCBoYW5kbGVOdW1iZXIpO1xyXG5cclxuXHRcdC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0hUTUwvR2xvYmFsX2F0dHJpYnV0ZXMvdGFiaW5kZXhcclxuXHRcdC8vIDAgPSBmb2N1c2FibGUgYW5kIHJlYWNoYWJsZVxyXG5cdFx0aGFuZGxlLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnMCcpO1xyXG5cdFx0aGFuZGxlLnNldEF0dHJpYnV0ZSgncm9sZScsICdzbGlkZXInKTtcclxuXHRcdGhhbmRsZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtb3JpZW50YXRpb24nLCBvcHRpb25zLm9ydCA/ICd2ZXJ0aWNhbCcgOiAnaG9yaXpvbnRhbCcpO1xyXG5cclxuXHRcdGlmICggaGFuZGxlTnVtYmVyID09PSAwICkge1xyXG5cdFx0XHRhZGRDbGFzcyhoYW5kbGUsIG9wdGlvbnMuY3NzQ2xhc3Nlcy5oYW5kbGVMb3dlcik7XHJcblx0XHR9XHJcblxyXG5cdFx0ZWxzZSBpZiAoIGhhbmRsZU51bWJlciA9PT0gb3B0aW9ucy5oYW5kbGVzIC0gMSApIHtcclxuXHRcdFx0YWRkQ2xhc3MoaGFuZGxlLCBvcHRpb25zLmNzc0NsYXNzZXMuaGFuZGxlVXBwZXIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvcmlnaW47XHJcblx0fVxyXG5cclxuXHQvLyBJbnNlcnQgbm9kZXMgZm9yIGNvbm5lY3QgZWxlbWVudHNcclxuXHRmdW5jdGlvbiBhZGRDb25uZWN0ICggYmFzZSwgYWRkICkge1xyXG5cclxuXHRcdGlmICggIWFkZCApIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBhZGROb2RlVG8oYmFzZSwgb3B0aW9ucy5jc3NDbGFzc2VzLmNvbm5lY3QpO1xyXG5cdH1cclxuXHJcblx0Ly8gQWRkIGhhbmRsZXMgdG8gdGhlIHNsaWRlciBiYXNlLlxyXG5cdGZ1bmN0aW9uIGFkZEVsZW1lbnRzICggY29ubmVjdE9wdGlvbnMsIGJhc2UgKSB7XHJcblxyXG5cdFx0c2NvcGVfSGFuZGxlcyA9IFtdO1xyXG5cdFx0c2NvcGVfQ29ubmVjdHMgPSBbXTtcclxuXHJcblx0XHRzY29wZV9Db25uZWN0cy5wdXNoKGFkZENvbm5lY3QoYmFzZSwgY29ubmVjdE9wdGlvbnNbMF0pKTtcclxuXHJcblx0XHQvLyBbOjo6Ok89PT09Tz09PT1PPT09PV1cclxuXHRcdC8vIGNvbm5lY3RPcHRpb25zID0gWzAsIDEsIDEsIDFdXHJcblxyXG5cdFx0Zm9yICggdmFyIGkgPSAwOyBpIDwgb3B0aW9ucy5oYW5kbGVzOyBpKysgKSB7XHJcblx0XHRcdC8vIEtlZXAgYSBsaXN0IG9mIGFsbCBhZGRlZCBoYW5kbGVzLlxyXG5cdFx0XHRzY29wZV9IYW5kbGVzLnB1c2goYWRkT3JpZ2luKGJhc2UsIGkpKTtcclxuXHRcdFx0c2NvcGVfSGFuZGxlTnVtYmVyc1tpXSA9IGk7XHJcblx0XHRcdHNjb3BlX0Nvbm5lY3RzLnB1c2goYWRkQ29ubmVjdChiYXNlLCBjb25uZWN0T3B0aW9uc1tpICsgMV0pKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIEluaXRpYWxpemUgYSBzaW5nbGUgc2xpZGVyLlxyXG5cdGZ1bmN0aW9uIGFkZFNsaWRlciAoIHRhcmdldCApIHtcclxuXHJcblx0XHQvLyBBcHBseSBjbGFzc2VzIGFuZCBkYXRhIHRvIHRoZSB0YXJnZXQuXHJcblx0XHRhZGRDbGFzcyh0YXJnZXQsIG9wdGlvbnMuY3NzQ2xhc3Nlcy50YXJnZXQpO1xyXG5cclxuXHRcdGlmICggb3B0aW9ucy5kaXIgPT09IDAgKSB7XHJcblx0XHRcdGFkZENsYXNzKHRhcmdldCwgb3B0aW9ucy5jc3NDbGFzc2VzLmx0cik7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRhZGRDbGFzcyh0YXJnZXQsIG9wdGlvbnMuY3NzQ2xhc3Nlcy5ydGwpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICggb3B0aW9ucy5vcnQgPT09IDAgKSB7XHJcblx0XHRcdGFkZENsYXNzKHRhcmdldCwgb3B0aW9ucy5jc3NDbGFzc2VzLmhvcml6b250YWwpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0YWRkQ2xhc3ModGFyZ2V0LCBvcHRpb25zLmNzc0NsYXNzZXMudmVydGljYWwpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHNjb3BlX0Jhc2UgPSBhZGROb2RlVG8odGFyZ2V0LCBvcHRpb25zLmNzc0NsYXNzZXMuYmFzZSk7XHJcblx0fVxyXG5cclxuXHJcblx0ZnVuY3Rpb24gYWRkVG9vbHRpcCAoIGhhbmRsZSwgaGFuZGxlTnVtYmVyICkge1xyXG5cclxuXHRcdGlmICggIW9wdGlvbnMudG9vbHRpcHNbaGFuZGxlTnVtYmVyXSApIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBhZGROb2RlVG8oaGFuZGxlLmZpcnN0Q2hpbGQsIG9wdGlvbnMuY3NzQ2xhc3Nlcy50b29sdGlwKTtcclxuXHR9XHJcblxyXG5cdC8vIFRoZSB0b29sdGlwcyBvcHRpb24gaXMgYSBzaG9ydGhhbmQgZm9yIHVzaW5nIHRoZSAndXBkYXRlJyBldmVudC5cclxuXHRmdW5jdGlvbiB0b29sdGlwcyAoICkge1xyXG5cclxuXHRcdC8vIFRvb2x0aXBzIGFyZSBhZGRlZCB3aXRoIG9wdGlvbnMudG9vbHRpcHMgaW4gb3JpZ2luYWwgb3JkZXIuXHJcblx0XHR2YXIgdGlwcyA9IHNjb3BlX0hhbmRsZXMubWFwKGFkZFRvb2x0aXApO1xyXG5cclxuXHRcdGJpbmRFdmVudCgndXBkYXRlJywgZnVuY3Rpb24odmFsdWVzLCBoYW5kbGVOdW1iZXIsIHVuZW5jb2RlZCkge1xyXG5cclxuXHRcdFx0aWYgKCAhdGlwc1toYW5kbGVOdW1iZXJdICkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dmFyIGZvcm1hdHRlZFZhbHVlID0gdmFsdWVzW2hhbmRsZU51bWJlcl07XHJcblxyXG5cdFx0XHRpZiAoIG9wdGlvbnMudG9vbHRpcHNbaGFuZGxlTnVtYmVyXSAhPT0gdHJ1ZSApIHtcclxuXHRcdFx0XHRmb3JtYXR0ZWRWYWx1ZSA9IG9wdGlvbnMudG9vbHRpcHNbaGFuZGxlTnVtYmVyXS50byh1bmVuY29kZWRbaGFuZGxlTnVtYmVyXSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRpcHNbaGFuZGxlTnVtYmVyXS5pbm5lckhUTUwgPSBmb3JtYXR0ZWRWYWx1ZTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblxyXG5cdGZ1bmN0aW9uIGFyaWEgKCApIHtcclxuXHJcblx0XHRiaW5kRXZlbnQoJ3VwZGF0ZScsIGZ1bmN0aW9uICggdmFsdWVzLCBoYW5kbGVOdW1iZXIsIHVuZW5jb2RlZCwgdGFwLCBwb3NpdGlvbnMgKSB7XHJcblxyXG5cdFx0XHQvLyBVcGRhdGUgQXJpYSBWYWx1ZXMgZm9yIGFsbCBoYW5kbGVzLCBhcyBhIGNoYW5nZSBpbiBvbmUgY2hhbmdlcyBtaW4gYW5kIG1heCB2YWx1ZXMgZm9yIHRoZSBuZXh0LlxyXG5cdFx0XHRzY29wZV9IYW5kbGVOdW1iZXJzLmZvckVhY2goZnVuY3Rpb24oIGhhbmRsZU51bWJlciApe1xyXG5cclxuXHRcdFx0XHR2YXIgaGFuZGxlID0gc2NvcGVfSGFuZGxlc1toYW5kbGVOdW1iZXJdO1xyXG5cclxuXHRcdFx0XHR2YXIgbWluID0gY2hlY2tIYW5kbGVQb3NpdGlvbihzY29wZV9Mb2NhdGlvbnMsIGhhbmRsZU51bWJlciwgMCwgdHJ1ZSwgdHJ1ZSwgdHJ1ZSk7XHJcblx0XHRcdFx0dmFyIG1heCA9IGNoZWNrSGFuZGxlUG9zaXRpb24oc2NvcGVfTG9jYXRpb25zLCBoYW5kbGVOdW1iZXIsIDEwMCwgdHJ1ZSwgdHJ1ZSwgdHJ1ZSk7XHJcblxyXG5cdFx0XHRcdHZhciBub3cgPSBwb3NpdGlvbnNbaGFuZGxlTnVtYmVyXTtcclxuXHRcdFx0XHR2YXIgdGV4dCA9IG9wdGlvbnMuYXJpYUZvcm1hdC50byh1bmVuY29kZWRbaGFuZGxlTnVtYmVyXSk7XHJcblxyXG5cdFx0XHRcdGhhbmRsZS5jaGlsZHJlblswXS5zZXRBdHRyaWJ1dGUoJ2FyaWEtdmFsdWVtaW4nLCBtaW4udG9GaXhlZCgxKSk7XHJcblx0XHRcdFx0aGFuZGxlLmNoaWxkcmVuWzBdLnNldEF0dHJpYnV0ZSgnYXJpYS12YWx1ZW1heCcsIG1heC50b0ZpeGVkKDEpKTtcclxuXHRcdFx0XHRoYW5kbGUuY2hpbGRyZW5bMF0uc2V0QXR0cmlidXRlKCdhcmlhLXZhbHVlbm93Jywgbm93LnRvRml4ZWQoMSkpO1xyXG5cdFx0XHRcdGhhbmRsZS5jaGlsZHJlblswXS5zZXRBdHRyaWJ1dGUoJ2FyaWEtdmFsdWV0ZXh0JywgdGV4dCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHJcblx0ZnVuY3Rpb24gZ2V0R3JvdXAgKCBtb2RlLCB2YWx1ZXMsIHN0ZXBwZWQgKSB7XHJcblxyXG5cdFx0Ly8gVXNlIHRoZSByYW5nZS5cclxuXHRcdGlmICggbW9kZSA9PT0gJ3JhbmdlJyB8fCBtb2RlID09PSAnc3RlcHMnICkge1xyXG5cdFx0XHRyZXR1cm4gc2NvcGVfU3BlY3RydW0ueFZhbDtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIG1vZGUgPT09ICdjb3VudCcgKSB7XHJcblxyXG5cdFx0XHRpZiAoICF2YWx1ZXMgKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlciAoXCIgKyBWRVJTSU9OICsgXCIpOiAndmFsdWVzJyByZXF1aXJlZCBmb3IgbW9kZSAnY291bnQnLlwiKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gRGl2aWRlIDAgLSAxMDAgaW4gJ2NvdW50JyBwYXJ0cy5cclxuXHRcdFx0dmFyIHNwcmVhZCA9ICggMTAwIC8gKHZhbHVlcyAtIDEpICk7XHJcblx0XHRcdHZhciB2O1xyXG5cdFx0XHR2YXIgaSA9IDA7XHJcblxyXG5cdFx0XHR2YWx1ZXMgPSBbXTtcclxuXHJcblx0XHRcdC8vIExpc3QgdGhlc2UgcGFydHMgYW5kIGhhdmUgdGhlbSBoYW5kbGVkIGFzICdwb3NpdGlvbnMnLlxyXG5cdFx0XHR3aGlsZSAoICh2ID0gaSsrICogc3ByZWFkKSA8PSAxMDAgKSB7XHJcblx0XHRcdFx0dmFsdWVzLnB1c2godik7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdG1vZGUgPSAncG9zaXRpb25zJztcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIG1vZGUgPT09ICdwb3NpdGlvbnMnICkge1xyXG5cclxuXHRcdFx0Ly8gTWFwIGFsbCBwZXJjZW50YWdlcyB0byBvbi1yYW5nZSB2YWx1ZXMuXHJcblx0XHRcdHJldHVybiB2YWx1ZXMubWFwKGZ1bmN0aW9uKCB2YWx1ZSApe1xyXG5cdFx0XHRcdHJldHVybiBzY29wZV9TcGVjdHJ1bS5mcm9tU3RlcHBpbmcoIHN0ZXBwZWQgPyBzY29wZV9TcGVjdHJ1bS5nZXRTdGVwKCB2YWx1ZSApIDogdmFsdWUgKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCBtb2RlID09PSAndmFsdWVzJyApIHtcclxuXHJcblx0XHRcdC8vIElmIHRoZSB2YWx1ZSBtdXN0IGJlIHN0ZXBwZWQsIGl0IG5lZWRzIHRvIGJlIGNvbnZlcnRlZCB0byBhIHBlcmNlbnRhZ2UgZmlyc3QuXHJcblx0XHRcdGlmICggc3RlcHBlZCApIHtcclxuXHJcblx0XHRcdFx0cmV0dXJuIHZhbHVlcy5tYXAoZnVuY3Rpb24oIHZhbHVlICl7XHJcblxyXG5cdFx0XHRcdFx0Ly8gQ29udmVydCB0byBwZXJjZW50YWdlLCBhcHBseSBzdGVwLCByZXR1cm4gdG8gdmFsdWUuXHJcblx0XHRcdFx0XHRyZXR1cm4gc2NvcGVfU3BlY3RydW0uZnJvbVN0ZXBwaW5nKCBzY29wZV9TcGVjdHJ1bS5nZXRTdGVwKCBzY29wZV9TcGVjdHJ1bS50b1N0ZXBwaW5nKCB2YWx1ZSApICkgKTtcclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIE90aGVyd2lzZSwgd2UgY2FuIHNpbXBseSB1c2UgdGhlIHZhbHVlcy5cclxuXHRcdFx0cmV0dXJuIHZhbHVlcztcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdlbmVyYXRlU3ByZWFkICggZGVuc2l0eSwgbW9kZSwgZ3JvdXAgKSB7XHJcblxyXG5cdFx0ZnVuY3Rpb24gc2FmZUluY3JlbWVudCh2YWx1ZSwgaW5jcmVtZW50KSB7XHJcblx0XHRcdC8vIEF2b2lkIGZsb2F0aW5nIHBvaW50IHZhcmlhbmNlIGJ5IGRyb3BwaW5nIHRoZSBzbWFsbGVzdCBkZWNpbWFsIHBsYWNlcy5cclxuXHRcdFx0cmV0dXJuICh2YWx1ZSArIGluY3JlbWVudCkudG9GaXhlZCg3KSAvIDE7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGluZGV4ZXMgPSB7fTtcclxuXHRcdHZhciBmaXJzdEluUmFuZ2UgPSBzY29wZV9TcGVjdHJ1bS54VmFsWzBdO1xyXG5cdFx0dmFyIGxhc3RJblJhbmdlID0gc2NvcGVfU3BlY3RydW0ueFZhbFtzY29wZV9TcGVjdHJ1bS54VmFsLmxlbmd0aC0xXTtcclxuXHRcdHZhciBpZ25vcmVGaXJzdCA9IGZhbHNlO1xyXG5cdFx0dmFyIGlnbm9yZUxhc3QgPSBmYWxzZTtcclxuXHRcdHZhciBwcmV2UGN0ID0gMDtcclxuXHJcblx0XHQvLyBDcmVhdGUgYSBjb3B5IG9mIHRoZSBncm91cCwgc29ydCBpdCBhbmQgZmlsdGVyIGF3YXkgYWxsIGR1cGxpY2F0ZXMuXHJcblx0XHRncm91cCA9IHVuaXF1ZShncm91cC5zbGljZSgpLnNvcnQoZnVuY3Rpb24oYSwgYil7IHJldHVybiBhIC0gYjsgfSkpO1xyXG5cclxuXHRcdC8vIE1ha2Ugc3VyZSB0aGUgcmFuZ2Ugc3RhcnRzIHdpdGggdGhlIGZpcnN0IGVsZW1lbnQuXHJcblx0XHRpZiAoIGdyb3VwWzBdICE9PSBmaXJzdEluUmFuZ2UgKSB7XHJcblx0XHRcdGdyb3VwLnVuc2hpZnQoZmlyc3RJblJhbmdlKTtcclxuXHRcdFx0aWdub3JlRmlyc3QgPSB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIExpa2V3aXNlIGZvciB0aGUgbGFzdCBvbmUuXHJcblx0XHRpZiAoIGdyb3VwW2dyb3VwLmxlbmd0aCAtIDFdICE9PSBsYXN0SW5SYW5nZSApIHtcclxuXHRcdFx0Z3JvdXAucHVzaChsYXN0SW5SYW5nZSk7XHJcblx0XHRcdGlnbm9yZUxhc3QgPSB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdGdyb3VwLmZvckVhY2goZnVuY3Rpb24gKCBjdXJyZW50LCBpbmRleCApIHtcclxuXHJcblx0XHRcdC8vIEdldCB0aGUgY3VycmVudCBzdGVwIGFuZCB0aGUgbG93ZXIgKyB1cHBlciBwb3NpdGlvbnMuXHJcblx0XHRcdHZhciBzdGVwO1xyXG5cdFx0XHR2YXIgaTtcclxuXHRcdFx0dmFyIHE7XHJcblx0XHRcdHZhciBsb3cgPSBjdXJyZW50O1xyXG5cdFx0XHR2YXIgaGlnaCA9IGdyb3VwW2luZGV4KzFdO1xyXG5cdFx0XHR2YXIgbmV3UGN0O1xyXG5cdFx0XHR2YXIgcGN0RGlmZmVyZW5jZTtcclxuXHRcdFx0dmFyIHBjdFBvcztcclxuXHRcdFx0dmFyIHR5cGU7XHJcblx0XHRcdHZhciBzdGVwcztcclxuXHRcdFx0dmFyIHJlYWxTdGVwcztcclxuXHRcdFx0dmFyIHN0ZXBzaXplO1xyXG5cclxuXHRcdFx0Ly8gV2hlbiB1c2luZyAnc3RlcHMnIG1vZGUsIHVzZSB0aGUgcHJvdmlkZWQgc3RlcHMuXHJcblx0XHRcdC8vIE90aGVyd2lzZSwgd2UnbGwgc3RlcCBvbiB0byB0aGUgbmV4dCBzdWJyYW5nZS5cclxuXHRcdFx0aWYgKCBtb2RlID09PSAnc3RlcHMnICkge1xyXG5cdFx0XHRcdHN0ZXAgPSBzY29wZV9TcGVjdHJ1bS54TnVtU3RlcHNbIGluZGV4IF07XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIERlZmF1bHQgdG8gYSAnZnVsbCcgc3RlcC5cclxuXHRcdFx0aWYgKCAhc3RlcCApIHtcclxuXHRcdFx0XHRzdGVwID0gaGlnaC1sb3c7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIExvdyBjYW4gYmUgMCwgc28gdGVzdCBmb3IgZmFsc2UuIElmIGhpZ2ggaXMgdW5kZWZpbmVkLFxyXG5cdFx0XHQvLyB3ZSBhcmUgYXQgdGhlIGxhc3Qgc3VicmFuZ2UuIEluZGV4IDAgaXMgYWxyZWFkeSBoYW5kbGVkLlxyXG5cdFx0XHRpZiAoIGxvdyA9PT0gZmFsc2UgfHwgaGlnaCA9PT0gdW5kZWZpbmVkICkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gTWFrZSBzdXJlIHN0ZXAgaXNuJ3QgMCwgd2hpY2ggd291bGQgY2F1c2UgYW4gaW5maW5pdGUgbG9vcCAoIzY1NClcclxuXHRcdFx0c3RlcCA9IE1hdGgubWF4KHN0ZXAsIDAuMDAwMDAwMSk7XHJcblxyXG5cdFx0XHQvLyBGaW5kIGFsbCBzdGVwcyBpbiB0aGUgc3VicmFuZ2UuXHJcblx0XHRcdGZvciAoIGkgPSBsb3c7IGkgPD0gaGlnaDsgaSA9IHNhZmVJbmNyZW1lbnQoaSwgc3RlcCkgKSB7XHJcblxyXG5cdFx0XHRcdC8vIEdldCB0aGUgcGVyY2VudGFnZSB2YWx1ZSBmb3IgdGhlIGN1cnJlbnQgc3RlcCxcclxuXHRcdFx0XHQvLyBjYWxjdWxhdGUgdGhlIHNpemUgZm9yIHRoZSBzdWJyYW5nZS5cclxuXHRcdFx0XHRuZXdQY3QgPSBzY29wZV9TcGVjdHJ1bS50b1N0ZXBwaW5nKCBpICk7XHJcblx0XHRcdFx0cGN0RGlmZmVyZW5jZSA9IG5ld1BjdCAtIHByZXZQY3Q7XHJcblxyXG5cdFx0XHRcdHN0ZXBzID0gcGN0RGlmZmVyZW5jZSAvIGRlbnNpdHk7XHJcblx0XHRcdFx0cmVhbFN0ZXBzID0gTWF0aC5yb3VuZChzdGVwcyk7XHJcblxyXG5cdFx0XHRcdC8vIFRoaXMgcmF0aW8gcmVwcmVzZW50cyB0aGUgYW1tb3VudCBvZiBwZXJjZW50YWdlLXNwYWNlIGEgcG9pbnQgaW5kaWNhdGVzLlxyXG5cdFx0XHRcdC8vIEZvciBhIGRlbnNpdHkgMSB0aGUgcG9pbnRzL3BlcmNlbnRhZ2UgPSAxLiBGb3IgZGVuc2l0eSAyLCB0aGF0IHBlcmNlbnRhZ2UgbmVlZHMgdG8gYmUgcmUtZGV2aWRlZC5cclxuXHRcdFx0XHQvLyBSb3VuZCB0aGUgcGVyY2VudGFnZSBvZmZzZXQgdG8gYW4gZXZlbiBudW1iZXIsIHRoZW4gZGl2aWRlIGJ5IHR3b1xyXG5cdFx0XHRcdC8vIHRvIHNwcmVhZCB0aGUgb2Zmc2V0IG9uIGJvdGggc2lkZXMgb2YgdGhlIHJhbmdlLlxyXG5cdFx0XHRcdHN0ZXBzaXplID0gcGN0RGlmZmVyZW5jZS9yZWFsU3RlcHM7XHJcblxyXG5cdFx0XHRcdC8vIERpdmlkZSBhbGwgcG9pbnRzIGV2ZW5seSwgYWRkaW5nIHRoZSBjb3JyZWN0IG51bWJlciB0byB0aGlzIHN1YnJhbmdlLlxyXG5cdFx0XHRcdC8vIFJ1biB1cCB0byA8PSBzbyB0aGF0IDEwMCUgZ2V0cyBhIHBvaW50LCBldmVudCBpZiBpZ25vcmVMYXN0IGlzIHNldC5cclxuXHRcdFx0XHRmb3IgKCBxID0gMTsgcSA8PSByZWFsU3RlcHM7IHEgKz0gMSApIHtcclxuXHJcblx0XHRcdFx0XHQvLyBUaGUgcmF0aW8gYmV0d2VlbiB0aGUgcm91bmRlZCB2YWx1ZSBhbmQgdGhlIGFjdHVhbCBzaXplIG1pZ2h0IGJlIH4xJSBvZmYuXHJcblx0XHRcdFx0XHQvLyBDb3JyZWN0IHRoZSBwZXJjZW50YWdlIG9mZnNldCBieSB0aGUgbnVtYmVyIG9mIHBvaW50c1xyXG5cdFx0XHRcdFx0Ly8gcGVyIHN1YnJhbmdlLiBkZW5zaXR5ID0gMSB3aWxsIHJlc3VsdCBpbiAxMDAgcG9pbnRzIG9uIHRoZVxyXG5cdFx0XHRcdFx0Ly8gZnVsbCByYW5nZSwgMiBmb3IgNTAsIDQgZm9yIDI1LCBldGMuXHJcblx0XHRcdFx0XHRwY3RQb3MgPSBwcmV2UGN0ICsgKCBxICogc3RlcHNpemUgKTtcclxuXHRcdFx0XHRcdGluZGV4ZXNbcGN0UG9zLnRvRml4ZWQoNSldID0gWyd4JywgMF07XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQvLyBEZXRlcm1pbmUgdGhlIHBvaW50IHR5cGUuXHJcblx0XHRcdFx0dHlwZSA9IChncm91cC5pbmRleE9mKGkpID4gLTEpID8gMSA6ICggbW9kZSA9PT0gJ3N0ZXBzJyA/IDIgOiAwICk7XHJcblxyXG5cdFx0XHRcdC8vIEVuZm9yY2UgdGhlICdpZ25vcmVGaXJzdCcgb3B0aW9uIGJ5IG92ZXJ3cml0aW5nIHRoZSB0eXBlIGZvciAwLlxyXG5cdFx0XHRcdGlmICggIWluZGV4ICYmIGlnbm9yZUZpcnN0ICkge1xyXG5cdFx0XHRcdFx0dHlwZSA9IDA7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAoICEoaSA9PT0gaGlnaCAmJiBpZ25vcmVMYXN0KSkge1xyXG5cdFx0XHRcdFx0Ly8gTWFyayB0aGUgJ3R5cGUnIG9mIHRoaXMgcG9pbnQuIDAgPSBwbGFpbiwgMSA9IHJlYWwgdmFsdWUsIDIgPSBzdGVwIHZhbHVlLlxyXG5cdFx0XHRcdFx0aW5kZXhlc1tuZXdQY3QudG9GaXhlZCg1KV0gPSBbaSwgdHlwZV07XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQvLyBVcGRhdGUgdGhlIHBlcmNlbnRhZ2UgY291bnQuXHJcblx0XHRcdFx0cHJldlBjdCA9IG5ld1BjdDtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0cmV0dXJuIGluZGV4ZXM7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBhZGRNYXJraW5nICggc3ByZWFkLCBmaWx0ZXJGdW5jLCBmb3JtYXR0ZXIgKSB7XHJcblxyXG5cdFx0dmFyIGVsZW1lbnQgPSBzY29wZV9Eb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcblx0XHR2YXIgdmFsdWVTaXplQ2xhc3NlcyA9IFtcclxuXHRcdFx0b3B0aW9ucy5jc3NDbGFzc2VzLnZhbHVlTm9ybWFsLFxyXG5cdFx0XHRvcHRpb25zLmNzc0NsYXNzZXMudmFsdWVMYXJnZSxcclxuXHRcdFx0b3B0aW9ucy5jc3NDbGFzc2VzLnZhbHVlU3ViXHJcblx0XHRdO1xyXG5cdFx0dmFyIG1hcmtlclNpemVDbGFzc2VzID0gW1xyXG5cdFx0XHRvcHRpb25zLmNzc0NsYXNzZXMubWFya2VyTm9ybWFsLFxyXG5cdFx0XHRvcHRpb25zLmNzc0NsYXNzZXMubWFya2VyTGFyZ2UsXHJcblx0XHRcdG9wdGlvbnMuY3NzQ2xhc3Nlcy5tYXJrZXJTdWJcclxuXHRcdF07XHJcblx0XHR2YXIgdmFsdWVPcmllbnRhdGlvbkNsYXNzZXMgPSBbXHJcblx0XHRcdG9wdGlvbnMuY3NzQ2xhc3Nlcy52YWx1ZUhvcml6b250YWwsXHJcblx0XHRcdG9wdGlvbnMuY3NzQ2xhc3Nlcy52YWx1ZVZlcnRpY2FsXHJcblx0XHRdO1xyXG5cdFx0dmFyIG1hcmtlck9yaWVudGF0aW9uQ2xhc3NlcyA9IFtcclxuXHRcdFx0b3B0aW9ucy5jc3NDbGFzc2VzLm1hcmtlckhvcml6b250YWwsXHJcblx0XHRcdG9wdGlvbnMuY3NzQ2xhc3Nlcy5tYXJrZXJWZXJ0aWNhbFxyXG5cdFx0XTtcclxuXHJcblx0XHRhZGRDbGFzcyhlbGVtZW50LCBvcHRpb25zLmNzc0NsYXNzZXMucGlwcyk7XHJcblx0XHRhZGRDbGFzcyhlbGVtZW50LCBvcHRpb25zLm9ydCA9PT0gMCA/IG9wdGlvbnMuY3NzQ2xhc3Nlcy5waXBzSG9yaXpvbnRhbCA6IG9wdGlvbnMuY3NzQ2xhc3Nlcy5waXBzVmVydGljYWwpO1xyXG5cclxuXHRcdGZ1bmN0aW9uIGdldENsYXNzZXMoIHR5cGUsIHNvdXJjZSApe1xyXG5cdFx0XHR2YXIgYSA9IHNvdXJjZSA9PT0gb3B0aW9ucy5jc3NDbGFzc2VzLnZhbHVlO1xyXG5cdFx0XHR2YXIgb3JpZW50YXRpb25DbGFzc2VzID0gYSA/IHZhbHVlT3JpZW50YXRpb25DbGFzc2VzIDogbWFya2VyT3JpZW50YXRpb25DbGFzc2VzO1xyXG5cdFx0XHR2YXIgc2l6ZUNsYXNzZXMgPSBhID8gdmFsdWVTaXplQ2xhc3NlcyA6IG1hcmtlclNpemVDbGFzc2VzO1xyXG5cclxuXHRcdFx0cmV0dXJuIHNvdXJjZSArICcgJyArIG9yaWVudGF0aW9uQ2xhc3Nlc1tvcHRpb25zLm9ydF0gKyAnICcgKyBzaXplQ2xhc3Nlc1t0eXBlXTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBhZGRTcHJlYWQgKCBvZmZzZXQsIHZhbHVlcyApe1xyXG5cclxuXHRcdFx0Ly8gQXBwbHkgdGhlIGZpbHRlciBmdW5jdGlvbiwgaWYgaXQgaXMgc2V0LlxyXG5cdFx0XHR2YWx1ZXNbMV0gPSAodmFsdWVzWzFdICYmIGZpbHRlckZ1bmMpID8gZmlsdGVyRnVuYyh2YWx1ZXNbMF0sIHZhbHVlc1sxXSkgOiB2YWx1ZXNbMV07XHJcblxyXG5cdFx0XHQvLyBBZGQgYSBtYXJrZXIgZm9yIGV2ZXJ5IHBvaW50XHJcblx0XHRcdHZhciBub2RlID0gYWRkTm9kZVRvKGVsZW1lbnQsIGZhbHNlKTtcclxuXHRcdFx0XHRub2RlLmNsYXNzTmFtZSA9IGdldENsYXNzZXModmFsdWVzWzFdLCBvcHRpb25zLmNzc0NsYXNzZXMubWFya2VyKTtcclxuXHRcdFx0XHRub2RlLnN0eWxlW29wdGlvbnMuc3R5bGVdID0gb2Zmc2V0ICsgJyUnO1xyXG5cclxuXHRcdFx0Ly8gVmFsdWVzIGFyZSBvbmx5IGFwcGVuZGVkIGZvciBwb2ludHMgbWFya2VkICcxJyBvciAnMicuXHJcblx0XHRcdGlmICggdmFsdWVzWzFdICkge1xyXG5cdFx0XHRcdG5vZGUgPSBhZGROb2RlVG8oZWxlbWVudCwgZmFsc2UpO1xyXG5cdFx0XHRcdG5vZGUuY2xhc3NOYW1lID0gZ2V0Q2xhc3Nlcyh2YWx1ZXNbMV0sIG9wdGlvbnMuY3NzQ2xhc3Nlcy52YWx1ZSk7XHJcblx0XHRcdFx0bm9kZS5zdHlsZVtvcHRpb25zLnN0eWxlXSA9IG9mZnNldCArICclJztcclxuXHRcdFx0XHRub2RlLmlubmVyVGV4dCA9IGZvcm1hdHRlci50byh2YWx1ZXNbMF0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gQXBwZW5kIGFsbCBwb2ludHMuXHJcblx0XHRPYmplY3Qua2V5cyhzcHJlYWQpLmZvckVhY2goZnVuY3Rpb24oYSl7XHJcblx0XHRcdGFkZFNwcmVhZChhLCBzcHJlYWRbYV0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0cmV0dXJuIGVsZW1lbnQ7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiByZW1vdmVQaXBzICggKSB7XHJcblx0XHRpZiAoIHNjb3BlX1BpcHMgKSB7XHJcblx0XHRcdHJlbW92ZUVsZW1lbnQoc2NvcGVfUGlwcyk7XHJcblx0XHRcdHNjb3BlX1BpcHMgPSBudWxsO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcGlwcyAoIGdyaWQgKSB7XHJcblxyXG5cdFx0Ly8gRml4ICM2NjlcclxuXHRcdHJlbW92ZVBpcHMoKTtcclxuXHJcblx0XHR2YXIgbW9kZSA9IGdyaWQubW9kZTtcclxuXHRcdHZhciBkZW5zaXR5ID0gZ3JpZC5kZW5zaXR5IHx8IDE7XHJcblx0XHR2YXIgZmlsdGVyID0gZ3JpZC5maWx0ZXIgfHwgZmFsc2U7XHJcblx0XHR2YXIgdmFsdWVzID0gZ3JpZC52YWx1ZXMgfHwgZmFsc2U7XHJcblx0XHR2YXIgc3RlcHBlZCA9IGdyaWQuc3RlcHBlZCB8fCBmYWxzZTtcclxuXHRcdHZhciBncm91cCA9IGdldEdyb3VwKCBtb2RlLCB2YWx1ZXMsIHN0ZXBwZWQgKTtcclxuXHRcdHZhciBzcHJlYWQgPSBnZW5lcmF0ZVNwcmVhZCggZGVuc2l0eSwgbW9kZSwgZ3JvdXAgKTtcclxuXHRcdHZhciBmb3JtYXQgPSBncmlkLmZvcm1hdCB8fCB7XHJcblx0XHRcdHRvOiBNYXRoLnJvdW5kXHJcblx0XHR9O1xyXG5cclxuXHRcdHNjb3BlX1BpcHMgPSBzY29wZV9UYXJnZXQuYXBwZW5kQ2hpbGQoYWRkTWFya2luZyhcclxuXHRcdFx0c3ByZWFkLFxyXG5cdFx0XHRmaWx0ZXIsXHJcblx0XHRcdGZvcm1hdFxyXG5cdFx0KSk7XHJcblxyXG5cdFx0cmV0dXJuIHNjb3BlX1BpcHM7XHJcblx0fVxyXG5cclxuXHJcblx0Ly8gU2hvcnRoYW5kIGZvciBiYXNlIGRpbWVuc2lvbnMuXHJcblx0ZnVuY3Rpb24gYmFzZVNpemUgKCApIHtcclxuXHRcdHZhciByZWN0ID0gc2NvcGVfQmFzZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSwgYWx0ID0gJ29mZnNldCcgKyBbJ1dpZHRoJywgJ0hlaWdodCddW29wdGlvbnMub3J0XTtcclxuXHRcdHJldHVybiBvcHRpb25zLm9ydCA9PT0gMCA/IChyZWN0LndpZHRofHxzY29wZV9CYXNlW2FsdF0pIDogKHJlY3QuaGVpZ2h0fHxzY29wZV9CYXNlW2FsdF0pO1xyXG5cdH1cclxuXHJcblx0Ly8gSGFuZGxlciBmb3IgYXR0YWNoaW5nIGV2ZW50cyB0cm91Z2ggYSBwcm94eS5cclxuXHRmdW5jdGlvbiBhdHRhY2hFdmVudCAoIGV2ZW50cywgZWxlbWVudCwgY2FsbGJhY2ssIGRhdGEgKSB7XHJcblxyXG5cdFx0Ly8gVGhpcyBmdW5jdGlvbiBjYW4gYmUgdXNlZCB0byAnZmlsdGVyJyBldmVudHMgdG8gdGhlIHNsaWRlci5cclxuXHRcdC8vIGVsZW1lbnQgaXMgYSBub2RlLCBub3QgYSBub2RlTGlzdFxyXG5cclxuXHRcdHZhciBtZXRob2QgPSBmdW5jdGlvbiAoIGUgKXtcclxuXHJcblx0XHRcdGlmICggc2NvcGVfVGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGlzYWJsZWQnKSApIHtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIFN0b3AgaWYgYW4gYWN0aXZlICd0YXAnIHRyYW5zaXRpb24gaXMgdGFraW5nIHBsYWNlLlxyXG5cdFx0XHRpZiAoIGhhc0NsYXNzKHNjb3BlX1RhcmdldCwgb3B0aW9ucy5jc3NDbGFzc2VzLnRhcCkgKSB7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRlID0gZml4RXZlbnQoZSwgZGF0YS5wYWdlT2Zmc2V0KTtcclxuXHJcblx0XHRcdC8vIEhhbmRsZSByZWplY3Qgb2YgbXVsdGl0b3VjaFxyXG5cdFx0XHRpZiAoICFlICkge1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gSWdub3JlIHJpZ2h0IG9yIG1pZGRsZSBjbGlja3Mgb24gc3RhcnQgIzQ1NFxyXG5cdFx0XHRpZiAoIGV2ZW50cyA9PT0gYWN0aW9ucy5zdGFydCAmJiBlLmJ1dHRvbnMgIT09IHVuZGVmaW5lZCAmJiBlLmJ1dHRvbnMgPiAxICkge1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gSWdub3JlIHJpZ2h0IG9yIG1pZGRsZSBjbGlja3Mgb24gc3RhcnQgIzQ1NFxyXG5cdFx0XHRpZiAoIGRhdGEuaG92ZXIgJiYgZS5idXR0b25zICkge1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gJ3N1cHBvcnRzUGFzc2l2ZScgaXMgb25seSB0cnVlIGlmIGEgYnJvd3NlciBhbHNvIHN1cHBvcnRzIHRvdWNoLWFjdGlvbjogbm9uZSBpbiBDU1MuXHJcblx0XHRcdC8vIGlPUyBzYWZhcmkgZG9lcyBub3QsIHNvIGl0IGRvZXNuJ3QgZ2V0IHRvIGJlbmVmaXQgZnJvbSBwYXNzaXZlIHNjcm9sbGluZy4gaU9TIGRvZXMgc3VwcG9ydFxyXG5cdFx0XHQvLyB0b3VjaC1hY3Rpb246IG1hbmlwdWxhdGlvbiwgYnV0IHRoYXQgYWxsb3dzIHBhbm5pbmcsIHdoaWNoIGJyZWFrc1xyXG5cdFx0XHQvLyBzbGlkZXJzIGFmdGVyIHpvb21pbmcvb24gbm9uLXJlc3BvbnNpdmUgcGFnZXMuXHJcblx0XHRcdC8vIFNlZTogaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTEzMzExMlxyXG5cdFx0XHRpZiAoICFzdXBwb3J0c1Bhc3NpdmUgKSB7XHJcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRlLmNhbGNQb2ludCA9IGUucG9pbnRzWyBvcHRpb25zLm9ydCBdO1xyXG5cclxuXHRcdFx0Ly8gQ2FsbCB0aGUgZXZlbnQgaGFuZGxlciB3aXRoIHRoZSBldmVudCBbIGFuZCBhZGRpdGlvbmFsIGRhdGEgXS5cclxuXHRcdFx0Y2FsbGJhY2sgKCBlLCBkYXRhICk7XHJcblx0XHR9O1xyXG5cclxuXHRcdHZhciBtZXRob2RzID0gW107XHJcblxyXG5cdFx0Ly8gQmluZCBhIGNsb3N1cmUgb24gdGhlIHRhcmdldCBmb3IgZXZlcnkgZXZlbnQgdHlwZS5cclxuXHRcdGV2ZW50cy5zcGxpdCgnICcpLmZvckVhY2goZnVuY3Rpb24oIGV2ZW50TmFtZSApe1xyXG5cdFx0XHRlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBtZXRob2QsIHN1cHBvcnRzUGFzc2l2ZSA/IHsgcGFzc2l2ZTogdHJ1ZSB9IDogZmFsc2UpO1xyXG5cdFx0XHRtZXRob2RzLnB1c2goW2V2ZW50TmFtZSwgbWV0aG9kXSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRyZXR1cm4gbWV0aG9kcztcclxuXHR9XHJcblxyXG5cdC8vIFByb3ZpZGUgYSBjbGVhbiBldmVudCB3aXRoIHN0YW5kYXJkaXplZCBvZmZzZXQgdmFsdWVzLlxyXG5cdGZ1bmN0aW9uIGZpeEV2ZW50ICggZSwgcGFnZU9mZnNldCApIHtcclxuXHJcblx0XHQvLyBGaWx0ZXIgdGhlIGV2ZW50IHRvIHJlZ2lzdGVyIHRoZSB0eXBlLCB3aGljaCBjYW4gYmVcclxuXHRcdC8vIHRvdWNoLCBtb3VzZSBvciBwb2ludGVyLiBPZmZzZXQgY2hhbmdlcyBuZWVkIHRvIGJlXHJcblx0XHQvLyBtYWRlIG9uIGFuIGV2ZW50IHNwZWNpZmljIGJhc2lzLlxyXG5cdFx0dmFyIHRvdWNoID0gZS50eXBlLmluZGV4T2YoJ3RvdWNoJykgPT09IDA7XHJcblx0XHR2YXIgbW91c2UgPSBlLnR5cGUuaW5kZXhPZignbW91c2UnKSA9PT0gMDtcclxuXHRcdHZhciBwb2ludGVyID0gZS50eXBlLmluZGV4T2YoJ3BvaW50ZXInKSA9PT0gMDtcclxuXHJcblx0XHR2YXIgeDtcclxuXHRcdHZhciB5O1xyXG5cclxuXHRcdC8vIElFMTAgaW1wbGVtZW50ZWQgcG9pbnRlciBldmVudHMgd2l0aCBhIHByZWZpeDtcclxuXHRcdGlmICggZS50eXBlLmluZGV4T2YoJ01TUG9pbnRlcicpID09PSAwICkge1xyXG5cdFx0XHRwb2ludGVyID0gdHJ1ZTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIHRvdWNoICkge1xyXG5cclxuXHRcdFx0Ly8gRml4IGJ1ZyB3aGVuIHVzZXIgdG91Y2hlcyB3aXRoIHR3byBvciBtb3JlIGZpbmdlcnMgb24gbW9iaWxlIGRldmljZXMuXHJcblx0XHRcdC8vIEl0J3MgdXNlZnVsIHdoZW4geW91IGhhdmUgdHdvIG9yIG1vcmUgc2xpZGVycyBvbiBvbmUgcGFnZSxcclxuXHRcdFx0Ly8gdGhhdCBjYW4gYmUgdG91Y2hlZCBzaW11bHRhbmVvdXNseS5cclxuXHRcdFx0Ly8gIzY0OSwgIzY2MywgIzY2OFxyXG5cdFx0XHRpZiAoIGUudG91Y2hlcy5sZW5ndGggPiAxICkge1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gbm9VaVNsaWRlciBzdXBwb3J0cyBvbmUgbW92ZW1lbnQgYXQgYSB0aW1lLFxyXG5cdFx0XHQvLyBzbyB3ZSBjYW4gc2VsZWN0IHRoZSBmaXJzdCAnY2hhbmdlZFRvdWNoJy5cclxuXHRcdFx0eCA9IGUuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVg7XHJcblx0XHRcdHkgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VZO1xyXG5cdFx0fVxyXG5cclxuXHRcdHBhZ2VPZmZzZXQgPSBwYWdlT2Zmc2V0IHx8IGdldFBhZ2VPZmZzZXQoc2NvcGVfRG9jdW1lbnQpO1xyXG5cclxuXHRcdGlmICggbW91c2UgfHwgcG9pbnRlciApIHtcclxuXHRcdFx0eCA9IGUuY2xpZW50WCArIHBhZ2VPZmZzZXQueDtcclxuXHRcdFx0eSA9IGUuY2xpZW50WSArIHBhZ2VPZmZzZXQueTtcclxuXHRcdH1cclxuXHJcblx0XHRlLnBhZ2VPZmZzZXQgPSBwYWdlT2Zmc2V0O1xyXG5cdFx0ZS5wb2ludHMgPSBbeCwgeV07XHJcblx0XHRlLmN1cnNvciA9IG1vdXNlIHx8IHBvaW50ZXI7IC8vIEZpeCAjNDM1XHJcblxyXG5cdFx0cmV0dXJuIGU7XHJcblx0fVxyXG5cclxuXHQvLyBUcmFuc2xhdGUgYSBjb29yZGluYXRlIGluIHRoZSBkb2N1bWVudCB0byBhIHBlcmNlbnRhZ2Ugb24gdGhlIHNsaWRlclxyXG5cdGZ1bmN0aW9uIGNhbGNQb2ludFRvUGVyY2VudGFnZSAoIGNhbGNQb2ludCApIHtcclxuXHRcdHZhciBsb2NhdGlvbiA9IGNhbGNQb2ludCAtIG9mZnNldChzY29wZV9CYXNlLCBvcHRpb25zLm9ydCk7XHJcblx0XHR2YXIgcHJvcG9zYWwgPSAoIGxvY2F0aW9uICogMTAwICkgLyBiYXNlU2l6ZSgpO1xyXG5cdFx0cmV0dXJuIG9wdGlvbnMuZGlyID8gMTAwIC0gcHJvcG9zYWwgOiBwcm9wb3NhbDtcclxuXHR9XHJcblxyXG5cdC8vIEZpbmQgaGFuZGxlIGNsb3Nlc3QgdG8gYSBjZXJ0YWluIHBlcmNlbnRhZ2Ugb24gdGhlIHNsaWRlclxyXG5cdGZ1bmN0aW9uIGdldENsb3Nlc3RIYW5kbGUgKCBwcm9wb3NhbCApIHtcclxuXHJcblx0XHR2YXIgY2xvc2VzdCA9IDEwMDtcclxuXHRcdHZhciBoYW5kbGVOdW1iZXIgPSBmYWxzZTtcclxuXHJcblx0XHRzY29wZV9IYW5kbGVzLmZvckVhY2goZnVuY3Rpb24oaGFuZGxlLCBpbmRleCl7XHJcblxyXG5cdFx0XHQvLyBEaXNhYmxlZCBoYW5kbGVzIGFyZSBpZ25vcmVkXHJcblx0XHRcdGlmICggaGFuZGxlLmhhc0F0dHJpYnV0ZSgnZGlzYWJsZWQnKSApIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHZhciBwb3MgPSBNYXRoLmFicyhzY29wZV9Mb2NhdGlvbnNbaW5kZXhdIC0gcHJvcG9zYWwpO1xyXG5cclxuXHRcdFx0aWYgKCBwb3MgPCBjbG9zZXN0ICkge1xyXG5cdFx0XHRcdGhhbmRsZU51bWJlciA9IGluZGV4O1xyXG5cdFx0XHRcdGNsb3Nlc3QgPSBwb3M7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdHJldHVybiBoYW5kbGVOdW1iZXI7XHJcblx0fVxyXG5cclxuXHQvLyBNb3ZlcyBoYW5kbGUocykgYnkgYSBwZXJjZW50YWdlXHJcblx0Ly8gKGJvb2wsICUgdG8gbW92ZSwgWyUgd2hlcmUgaGFuZGxlIHN0YXJ0ZWQsIC4uLl0sIFtpbmRleCBpbiBzY29wZV9IYW5kbGVzLCAuLi5dKVxyXG5cdGZ1bmN0aW9uIG1vdmVIYW5kbGVzICggdXB3YXJkLCBwcm9wb3NhbCwgbG9jYXRpb25zLCBoYW5kbGVOdW1iZXJzICkge1xyXG5cclxuXHRcdHZhciBwcm9wb3NhbHMgPSBsb2NhdGlvbnMuc2xpY2UoKTtcclxuXHJcblx0XHR2YXIgYiA9IFshdXB3YXJkLCB1cHdhcmRdO1xyXG5cdFx0dmFyIGYgPSBbdXB3YXJkLCAhdXB3YXJkXTtcclxuXHJcblx0XHQvLyBDb3B5IGhhbmRsZU51bWJlcnMgc28gd2UgZG9uJ3QgY2hhbmdlIHRoZSBkYXRhc2V0XHJcblx0XHRoYW5kbGVOdW1iZXJzID0gaGFuZGxlTnVtYmVycy5zbGljZSgpO1xyXG5cclxuXHRcdC8vIENoZWNrIHRvIHNlZSB3aGljaCBoYW5kbGUgaXMgJ2xlYWRpbmcnLlxyXG5cdFx0Ly8gSWYgdGhhdCBvbmUgY2FuJ3QgbW92ZSB0aGUgc2Vjb25kIGNhbid0IGVpdGhlci5cclxuXHRcdGlmICggdXB3YXJkICkge1xyXG5cdFx0XHRoYW5kbGVOdW1iZXJzLnJldmVyc2UoKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBTdGVwIDE6IGdldCB0aGUgbWF4aW11bSBwZXJjZW50YWdlIHRoYXQgYW55IG9mIHRoZSBoYW5kbGVzIGNhbiBtb3ZlXHJcblx0XHRpZiAoIGhhbmRsZU51bWJlcnMubGVuZ3RoID4gMSApIHtcclxuXHJcblx0XHRcdGhhbmRsZU51bWJlcnMuZm9yRWFjaChmdW5jdGlvbihoYW5kbGVOdW1iZXIsIG8pIHtcclxuXHJcblx0XHRcdFx0dmFyIHRvID0gY2hlY2tIYW5kbGVQb3NpdGlvbihwcm9wb3NhbHMsIGhhbmRsZU51bWJlciwgcHJvcG9zYWxzW2hhbmRsZU51bWJlcl0gKyBwcm9wb3NhbCwgYltvXSwgZltvXSwgZmFsc2UpO1xyXG5cclxuXHRcdFx0XHQvLyBTdG9wIGlmIG9uZSBvZiB0aGUgaGFuZGxlcyBjYW4ndCBtb3ZlLlxyXG5cdFx0XHRcdGlmICggdG8gPT09IGZhbHNlICkge1xyXG5cdFx0XHRcdFx0cHJvcG9zYWwgPSAwO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRwcm9wb3NhbCA9IHRvIC0gcHJvcG9zYWxzW2hhbmRsZU51bWJlcl07XHJcblx0XHRcdFx0XHRwcm9wb3NhbHNbaGFuZGxlTnVtYmVyXSA9IHRvO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gSWYgdXNpbmcgb25lIGhhbmRsZSwgY2hlY2sgYmFja3dhcmQgQU5EIGZvcndhcmRcclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRiID0gZiA9IFt0cnVlXTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgc3RhdGUgPSBmYWxzZTtcclxuXHJcblx0XHQvLyBTdGVwIDI6IFRyeSB0byBzZXQgdGhlIGhhbmRsZXMgd2l0aCB0aGUgZm91bmQgcGVyY2VudGFnZVxyXG5cdFx0aGFuZGxlTnVtYmVycy5mb3JFYWNoKGZ1bmN0aW9uKGhhbmRsZU51bWJlciwgbykge1xyXG5cdFx0XHRzdGF0ZSA9IHNldEhhbmRsZShoYW5kbGVOdW1iZXIsIGxvY2F0aW9uc1toYW5kbGVOdW1iZXJdICsgcHJvcG9zYWwsIGJbb10sIGZbb10pIHx8IHN0YXRlO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gU3RlcCAzOiBJZiBhIGhhbmRsZSBtb3ZlZCwgZmlyZSBldmVudHNcclxuXHRcdGlmICggc3RhdGUgKSB7XHJcblx0XHRcdGhhbmRsZU51bWJlcnMuZm9yRWFjaChmdW5jdGlvbihoYW5kbGVOdW1iZXIpe1xyXG5cdFx0XHRcdGZpcmVFdmVudCgndXBkYXRlJywgaGFuZGxlTnVtYmVyKTtcclxuXHRcdFx0XHRmaXJlRXZlbnQoJ3NsaWRlJywgaGFuZGxlTnVtYmVyKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBFeHRlcm5hbCBldmVudCBoYW5kbGluZ1xyXG5cdGZ1bmN0aW9uIGZpcmVFdmVudCAoIGV2ZW50TmFtZSwgaGFuZGxlTnVtYmVyLCB0YXAgKSB7XHJcblxyXG5cdFx0T2JqZWN0LmtleXMoc2NvcGVfRXZlbnRzKS5mb3JFYWNoKGZ1bmN0aW9uKCB0YXJnZXRFdmVudCApIHtcclxuXHJcblx0XHRcdHZhciBldmVudFR5cGUgPSB0YXJnZXRFdmVudC5zcGxpdCgnLicpWzBdO1xyXG5cclxuXHRcdFx0aWYgKCBldmVudE5hbWUgPT09IGV2ZW50VHlwZSApIHtcclxuXHRcdFx0XHRzY29wZV9FdmVudHNbdGFyZ2V0RXZlbnRdLmZvckVhY2goZnVuY3Rpb24oIGNhbGxiYWNrICkge1xyXG5cclxuXHRcdFx0XHRcdGNhbGxiYWNrLmNhbGwoXHJcblx0XHRcdFx0XHRcdC8vIFVzZSB0aGUgc2xpZGVyIHB1YmxpYyBBUEkgYXMgdGhlIHNjb3BlICgndGhpcycpXHJcblx0XHRcdFx0XHRcdHNjb3BlX1NlbGYsXHJcblx0XHRcdFx0XHRcdC8vIFJldHVybiB2YWx1ZXMgYXMgYXJyYXksIHNvIGFyZ18xW2FyZ18yXSBpcyBhbHdheXMgdmFsaWQuXHJcblx0XHRcdFx0XHRcdHNjb3BlX1ZhbHVlcy5tYXAob3B0aW9ucy5mb3JtYXQudG8pLFxyXG5cdFx0XHRcdFx0XHQvLyBIYW5kbGUgaW5kZXgsIDAgb3IgMVxyXG5cdFx0XHRcdFx0XHRoYW5kbGVOdW1iZXIsXHJcblx0XHRcdFx0XHRcdC8vIFVuZm9ybWF0dGVkIHNsaWRlciB2YWx1ZXNcclxuXHRcdFx0XHRcdFx0c2NvcGVfVmFsdWVzLnNsaWNlKCksXHJcblx0XHRcdFx0XHRcdC8vIEV2ZW50IGlzIGZpcmVkIGJ5IHRhcCwgdHJ1ZSBvciBmYWxzZVxyXG5cdFx0XHRcdFx0XHR0YXAgfHwgZmFsc2UsXHJcblx0XHRcdFx0XHRcdC8vIExlZnQgb2Zmc2V0IG9mIHRoZSBoYW5kbGUsIGluIHJlbGF0aW9uIHRvIHRoZSBzbGlkZXJcclxuXHRcdFx0XHRcdFx0c2NvcGVfTG9jYXRpb25zLnNsaWNlKClcclxuXHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblxyXG5cdC8vIEZpcmUgJ2VuZCcgd2hlbiBhIG1vdXNlIG9yIHBlbiBsZWF2ZXMgdGhlIGRvY3VtZW50LlxyXG5cdGZ1bmN0aW9uIGRvY3VtZW50TGVhdmUgKCBldmVudCwgZGF0YSApIHtcclxuXHRcdGlmICggZXZlbnQudHlwZSA9PT0gXCJtb3VzZW91dFwiICYmIGV2ZW50LnRhcmdldC5ub2RlTmFtZSA9PT0gXCJIVE1MXCIgJiYgZXZlbnQucmVsYXRlZFRhcmdldCA9PT0gbnVsbCApe1xyXG5cdFx0XHRldmVudEVuZCAoZXZlbnQsIGRhdGEpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gSGFuZGxlIG1vdmVtZW50IG9uIGRvY3VtZW50IGZvciBoYW5kbGUgYW5kIHJhbmdlIGRyYWcuXHJcblx0ZnVuY3Rpb24gZXZlbnRNb3ZlICggZXZlbnQsIGRhdGEgKSB7XHJcblxyXG5cdFx0Ly8gRml4ICM0OThcclxuXHRcdC8vIENoZWNrIHZhbHVlIG9mIC5idXR0b25zIGluICdzdGFydCcgdG8gd29yayBhcm91bmQgYSBidWcgaW4gSUUxMCBtb2JpbGUgKGRhdGEuYnV0dG9uc1Byb3BlcnR5KS5cclxuXHRcdC8vIGh0dHBzOi8vY29ubmVjdC5taWNyb3NvZnQuY29tL0lFL2ZlZWRiYWNrL2RldGFpbHMvOTI3MDA1L21vYmlsZS1pZTEwLXdpbmRvd3MtcGhvbmUtYnV0dG9ucy1wcm9wZXJ0eS1vZi1wb2ludGVybW92ZS1ldmVudC1hbHdheXMtemVyb1xyXG5cdFx0Ly8gSUU5IGhhcyAuYnV0dG9ucyBhbmQgLndoaWNoIHplcm8gb24gbW91c2Vtb3ZlLlxyXG5cdFx0Ly8gRmlyZWZveCBicmVha3MgdGhlIHNwZWMgTUROIGRlZmluZXMuXHJcblx0XHRpZiAoIG5hdmlnYXRvci5hcHBWZXJzaW9uLmluZGV4T2YoXCJNU0lFIDlcIikgPT09IC0xICYmIGV2ZW50LmJ1dHRvbnMgPT09IDAgJiYgZGF0YS5idXR0b25zUHJvcGVydHkgIT09IDAgKSB7XHJcblx0XHRcdHJldHVybiBldmVudEVuZChldmVudCwgZGF0YSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gQ2hlY2sgaWYgd2UgYXJlIG1vdmluZyB1cCBvciBkb3duXHJcblx0XHR2YXIgbW92ZW1lbnQgPSAob3B0aW9ucy5kaXIgPyAtMSA6IDEpICogKGV2ZW50LmNhbGNQb2ludCAtIGRhdGEuc3RhcnRDYWxjUG9pbnQpO1xyXG5cclxuXHRcdC8vIENvbnZlcnQgdGhlIG1vdmVtZW50IGludG8gYSBwZXJjZW50YWdlIG9mIHRoZSBzbGlkZXIgd2lkdGgvaGVpZ2h0XHJcblx0XHR2YXIgcHJvcG9zYWwgPSAobW92ZW1lbnQgKiAxMDApIC8gZGF0YS5iYXNlU2l6ZTtcclxuXHJcblx0XHRtb3ZlSGFuZGxlcyhtb3ZlbWVudCA+IDAsIHByb3Bvc2FsLCBkYXRhLmxvY2F0aW9ucywgZGF0YS5oYW5kbGVOdW1iZXJzKTtcclxuXHR9XHJcblxyXG5cdC8vIFVuYmluZCBtb3ZlIGV2ZW50cyBvbiBkb2N1bWVudCwgY2FsbCBjYWxsYmFja3MuXHJcblx0ZnVuY3Rpb24gZXZlbnRFbmQgKCBldmVudCwgZGF0YSApIHtcclxuXHJcblx0XHQvLyBUaGUgaGFuZGxlIGlzIG5vIGxvbmdlciBhY3RpdmUsIHNvIHJlbW92ZSB0aGUgY2xhc3MuXHJcblx0XHRpZiAoIHNjb3BlX0FjdGl2ZUhhbmRsZSApIHtcclxuXHRcdFx0cmVtb3ZlQ2xhc3Moc2NvcGVfQWN0aXZlSGFuZGxlLCBvcHRpb25zLmNzc0NsYXNzZXMuYWN0aXZlKTtcclxuXHRcdFx0c2NvcGVfQWN0aXZlSGFuZGxlID0gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gUmVtb3ZlIGN1cnNvciBzdHlsZXMgYW5kIHRleHQtc2VsZWN0aW9uIGV2ZW50cyBib3VuZCB0byB0aGUgYm9keS5cclxuXHRcdGlmICggZXZlbnQuY3Vyc29yICkge1xyXG5cdFx0XHRzY29wZV9Cb2R5LnN0eWxlLmN1cnNvciA9ICcnO1xyXG5cdFx0XHRzY29wZV9Cb2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3NlbGVjdHN0YXJ0JywgcHJldmVudERlZmF1bHQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFVuYmluZCB0aGUgbW92ZSBhbmQgZW5kIGV2ZW50cywgd2hpY2ggYXJlIGFkZGVkIG9uICdzdGFydCcuXHJcblx0XHRzY29wZV9MaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiggYyApIHtcclxuXHRcdFx0c2NvcGVfRG9jdW1lbnRFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoY1swXSwgY1sxXSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBSZW1vdmUgZHJhZ2dpbmcgY2xhc3MuXHJcblx0XHRyZW1vdmVDbGFzcyhzY29wZV9UYXJnZXQsIG9wdGlvbnMuY3NzQ2xhc3Nlcy5kcmFnKTtcclxuXHJcblx0XHRzZXRaaW5kZXgoKTtcclxuXHJcblx0XHRkYXRhLmhhbmRsZU51bWJlcnMuZm9yRWFjaChmdW5jdGlvbihoYW5kbGVOdW1iZXIpe1xyXG5cdFx0XHRmaXJlRXZlbnQoJ2NoYW5nZScsIGhhbmRsZU51bWJlcik7XHJcblx0XHRcdGZpcmVFdmVudCgnc2V0JywgaGFuZGxlTnVtYmVyKTtcclxuXHRcdFx0ZmlyZUV2ZW50KCdlbmQnLCBoYW5kbGVOdW1iZXIpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvLyBCaW5kIG1vdmUgZXZlbnRzIG9uIGRvY3VtZW50LlxyXG5cdGZ1bmN0aW9uIGV2ZW50U3RhcnQgKCBldmVudCwgZGF0YSApIHtcclxuXHJcblx0XHRpZiAoIGRhdGEuaGFuZGxlTnVtYmVycy5sZW5ndGggPT09IDEgKSB7XHJcblxyXG5cdFx0XHR2YXIgaGFuZGxlID0gc2NvcGVfSGFuZGxlc1tkYXRhLmhhbmRsZU51bWJlcnNbMF1dO1xyXG5cclxuXHRcdFx0Ly8gSWdub3JlICdkaXNhYmxlZCcgaGFuZGxlc1xyXG5cdFx0XHRpZiAoIGhhbmRsZS5oYXNBdHRyaWJ1dGUoJ2Rpc2FibGVkJykgKSB7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBNYXJrIHRoZSBoYW5kbGUgYXMgJ2FjdGl2ZScgc28gaXQgY2FuIGJlIHN0eWxlZC5cclxuXHRcdFx0c2NvcGVfQWN0aXZlSGFuZGxlID0gaGFuZGxlLmNoaWxkcmVuWzBdO1xyXG5cdFx0XHRhZGRDbGFzcyhzY29wZV9BY3RpdmVIYW5kbGUsIG9wdGlvbnMuY3NzQ2xhc3Nlcy5hY3RpdmUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEEgZHJhZyBzaG91bGQgbmV2ZXIgcHJvcGFnYXRlIHVwIHRvIHRoZSAndGFwJyBldmVudC5cclxuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuXHRcdC8vIEF0dGFjaCB0aGUgbW92ZSBhbmQgZW5kIGV2ZW50cy5cclxuXHRcdHZhciBtb3ZlRXZlbnQgPSBhdHRhY2hFdmVudChhY3Rpb25zLm1vdmUsIHNjb3BlX0RvY3VtZW50RWxlbWVudCwgZXZlbnRNb3ZlLCB7XHJcblx0XHRcdHN0YXJ0Q2FsY1BvaW50OiBldmVudC5jYWxjUG9pbnQsXHJcblx0XHRcdGJhc2VTaXplOiBiYXNlU2l6ZSgpLFxyXG5cdFx0XHRwYWdlT2Zmc2V0OiBldmVudC5wYWdlT2Zmc2V0LFxyXG5cdFx0XHRoYW5kbGVOdW1iZXJzOiBkYXRhLmhhbmRsZU51bWJlcnMsXHJcblx0XHRcdGJ1dHRvbnNQcm9wZXJ0eTogZXZlbnQuYnV0dG9ucyxcclxuXHRcdFx0bG9jYXRpb25zOiBzY29wZV9Mb2NhdGlvbnMuc2xpY2UoKVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0dmFyIGVuZEV2ZW50ID0gYXR0YWNoRXZlbnQoYWN0aW9ucy5lbmQsIHNjb3BlX0RvY3VtZW50RWxlbWVudCwgZXZlbnRFbmQsIHtcclxuXHRcdFx0aGFuZGxlTnVtYmVyczogZGF0YS5oYW5kbGVOdW1iZXJzXHJcblx0XHR9KTtcclxuXHJcblx0XHR2YXIgb3V0RXZlbnQgPSBhdHRhY2hFdmVudChcIm1vdXNlb3V0XCIsIHNjb3BlX0RvY3VtZW50RWxlbWVudCwgZG9jdW1lbnRMZWF2ZSwge1xyXG5cdFx0XHRoYW5kbGVOdW1iZXJzOiBkYXRhLmhhbmRsZU51bWJlcnNcclxuXHRcdH0pO1xyXG5cclxuXHRcdHNjb3BlX0xpc3RlbmVycyA9IG1vdmVFdmVudC5jb25jYXQoZW5kRXZlbnQsIG91dEV2ZW50KTtcclxuXHJcblx0XHQvLyBUZXh0IHNlbGVjdGlvbiBpc24ndCBhbiBpc3N1ZSBvbiB0b3VjaCBkZXZpY2VzLFxyXG5cdFx0Ly8gc28gYWRkaW5nIGN1cnNvciBzdHlsZXMgY2FuIGJlIHNraXBwZWQuXHJcblx0XHRpZiAoIGV2ZW50LmN1cnNvciApIHtcclxuXHJcblx0XHRcdC8vIFByZXZlbnQgdGhlICdJJyBjdXJzb3IgYW5kIGV4dGVuZCB0aGUgcmFuZ2UtZHJhZyBjdXJzb3IuXHJcblx0XHRcdHNjb3BlX0JvZHkuc3R5bGUuY3Vyc29yID0gZ2V0Q29tcHV0ZWRTdHlsZShldmVudC50YXJnZXQpLmN1cnNvcjtcclxuXHJcblx0XHRcdC8vIE1hcmsgdGhlIHRhcmdldCB3aXRoIGEgZHJhZ2dpbmcgc3RhdGUuXHJcblx0XHRcdGlmICggc2NvcGVfSGFuZGxlcy5sZW5ndGggPiAxICkge1xyXG5cdFx0XHRcdGFkZENsYXNzKHNjb3BlX1RhcmdldCwgb3B0aW9ucy5jc3NDbGFzc2VzLmRyYWcpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBQcmV2ZW50IHRleHQgc2VsZWN0aW9uIHdoZW4gZHJhZ2dpbmcgdGhlIGhhbmRsZXMuXHJcblx0XHRcdC8vIEluIG5vVWlTbGlkZXIgPD0gOS4yLjAsIHRoaXMgd2FzIGhhbmRsZWQgYnkgY2FsbGluZyBwcmV2ZW50RGVmYXVsdCBvbiBtb3VzZS90b3VjaCBzdGFydC9tb3ZlLFxyXG5cdFx0XHQvLyB3aGljaCBpcyBzY3JvbGwgYmxvY2tpbmcuIFRoZSBzZWxlY3RzdGFydCBldmVudCBpcyBzdXBwb3J0ZWQgYnkgRmlyZUZveCBzdGFydGluZyBmcm9tIHZlcnNpb24gNTIsXHJcblx0XHRcdC8vIG1lYW5pbmcgdGhlIG9ubHkgaG9sZG91dCBpcyBpT1MgU2FmYXJpLiBUaGlzIGRvZXNuJ3QgbWF0dGVyOiB0ZXh0IHNlbGVjdGlvbiBpc24ndCB0cmlnZ2VyZWQgdGhlcmUuXHJcblx0XHRcdC8vIFRoZSAnY3Vyc29yJyBmbGFnIGlzIGZhbHNlLlxyXG5cdFx0XHQvLyBTZWU6IGh0dHA6Ly9jYW5pdXNlLmNvbS8jc2VhcmNoPXNlbGVjdHN0YXJ0XHJcblx0XHRcdHNjb3BlX0JvZHkuYWRkRXZlbnRMaXN0ZW5lcignc2VsZWN0c3RhcnQnLCBwcmV2ZW50RGVmYXVsdCwgZmFsc2UpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGRhdGEuaGFuZGxlTnVtYmVycy5mb3JFYWNoKGZ1bmN0aW9uKGhhbmRsZU51bWJlcil7XHJcblx0XHRcdGZpcmVFdmVudCgnc3RhcnQnLCBoYW5kbGVOdW1iZXIpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvLyBNb3ZlIGNsb3Nlc3QgaGFuZGxlIHRvIHRhcHBlZCBsb2NhdGlvbi5cclxuXHRmdW5jdGlvbiBldmVudFRhcCAoIGV2ZW50ICkge1xyXG5cclxuXHRcdC8vIFRoZSB0YXAgZXZlbnQgc2hvdWxkbid0IHByb3BhZ2F0ZSB1cFxyXG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG5cdFx0dmFyIHByb3Bvc2FsID0gY2FsY1BvaW50VG9QZXJjZW50YWdlKGV2ZW50LmNhbGNQb2ludCk7XHJcblx0XHR2YXIgaGFuZGxlTnVtYmVyID0gZ2V0Q2xvc2VzdEhhbmRsZShwcm9wb3NhbCk7XHJcblxyXG5cdFx0Ly8gVGFja2xlIHRoZSBjYXNlIHRoYXQgYWxsIGhhbmRsZXMgYXJlICdkaXNhYmxlZCcuXHJcblx0XHRpZiAoIGhhbmRsZU51bWJlciA9PT0gZmFsc2UgKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBGbGFnIHRoZSBzbGlkZXIgYXMgaXQgaXMgbm93IGluIGEgdHJhbnNpdGlvbmFsIHN0YXRlLlxyXG5cdFx0Ly8gVHJhbnNpdGlvbiB0YWtlcyBhIGNvbmZpZ3VyYWJsZSBhbW91bnQgb2YgbXMgKGRlZmF1bHQgMzAwKS4gUmUtZW5hYmxlIHRoZSBzbGlkZXIgYWZ0ZXIgdGhhdC5cclxuXHRcdGlmICggIW9wdGlvbnMuZXZlbnRzLnNuYXAgKSB7XHJcblx0XHRcdGFkZENsYXNzRm9yKHNjb3BlX1RhcmdldCwgb3B0aW9ucy5jc3NDbGFzc2VzLnRhcCwgb3B0aW9ucy5hbmltYXRpb25EdXJhdGlvbik7XHJcblx0XHR9XHJcblxyXG5cdFx0c2V0SGFuZGxlKGhhbmRsZU51bWJlciwgcHJvcG9zYWwsIHRydWUsIHRydWUpO1xyXG5cclxuXHRcdHNldFppbmRleCgpO1xyXG5cclxuXHRcdGZpcmVFdmVudCgnc2xpZGUnLCBoYW5kbGVOdW1iZXIsIHRydWUpO1xyXG5cdFx0ZmlyZUV2ZW50KCd1cGRhdGUnLCBoYW5kbGVOdW1iZXIsIHRydWUpO1xyXG5cdFx0ZmlyZUV2ZW50KCdjaGFuZ2UnLCBoYW5kbGVOdW1iZXIsIHRydWUpO1xyXG5cdFx0ZmlyZUV2ZW50KCdzZXQnLCBoYW5kbGVOdW1iZXIsIHRydWUpO1xyXG5cclxuXHRcdGlmICggb3B0aW9ucy5ldmVudHMuc25hcCApIHtcclxuXHRcdFx0ZXZlbnRTdGFydChldmVudCwgeyBoYW5kbGVOdW1iZXJzOiBbaGFuZGxlTnVtYmVyXSB9KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIEZpcmVzIGEgJ2hvdmVyJyBldmVudCBmb3IgYSBob3ZlcmVkIG1vdXNlL3BlbiBwb3NpdGlvbi5cclxuXHRmdW5jdGlvbiBldmVudEhvdmVyICggZXZlbnQgKSB7XHJcblxyXG5cdFx0dmFyIHByb3Bvc2FsID0gY2FsY1BvaW50VG9QZXJjZW50YWdlKGV2ZW50LmNhbGNQb2ludCk7XHJcblxyXG5cdFx0dmFyIHRvID0gc2NvcGVfU3BlY3RydW0uZ2V0U3RlcChwcm9wb3NhbCk7XHJcblx0XHR2YXIgdmFsdWUgPSBzY29wZV9TcGVjdHJ1bS5mcm9tU3RlcHBpbmcodG8pO1xyXG5cclxuXHRcdE9iamVjdC5rZXlzKHNjb3BlX0V2ZW50cykuZm9yRWFjaChmdW5jdGlvbiggdGFyZ2V0RXZlbnQgKSB7XHJcblx0XHRcdGlmICggJ2hvdmVyJyA9PT0gdGFyZ2V0RXZlbnQuc3BsaXQoJy4nKVswXSApIHtcclxuXHRcdFx0XHRzY29wZV9FdmVudHNbdGFyZ2V0RXZlbnRdLmZvckVhY2goZnVuY3Rpb24oIGNhbGxiYWNrICkge1xyXG5cdFx0XHRcdFx0Y2FsbGJhY2suY2FsbCggc2NvcGVfU2VsZiwgdmFsdWUgKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvLyBBdHRhY2ggZXZlbnRzIHRvIHNldmVyYWwgc2xpZGVyIHBhcnRzLlxyXG5cdGZ1bmN0aW9uIGJpbmRTbGlkZXJFdmVudHMgKCBiZWhhdmlvdXIgKSB7XHJcblxyXG5cdFx0Ly8gQXR0YWNoIHRoZSBzdGFuZGFyZCBkcmFnIGV2ZW50IHRvIHRoZSBoYW5kbGVzLlxyXG5cdFx0aWYgKCAhYmVoYXZpb3VyLmZpeGVkICkge1xyXG5cclxuXHRcdFx0c2NvcGVfSGFuZGxlcy5mb3JFYWNoKGZ1bmN0aW9uKCBoYW5kbGUsIGluZGV4ICl7XHJcblxyXG5cdFx0XHRcdC8vIFRoZXNlIGV2ZW50cyBhcmUgb25seSBib3VuZCB0byB0aGUgdmlzdWFsIGhhbmRsZVxyXG5cdFx0XHRcdC8vIGVsZW1lbnQsIG5vdCB0aGUgJ3JlYWwnIG9yaWdpbiBlbGVtZW50LlxyXG5cdFx0XHRcdGF0dGFjaEV2ZW50ICggYWN0aW9ucy5zdGFydCwgaGFuZGxlLmNoaWxkcmVuWzBdLCBldmVudFN0YXJ0LCB7XHJcblx0XHRcdFx0XHRoYW5kbGVOdW1iZXJzOiBbaW5kZXhdXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEF0dGFjaCB0aGUgdGFwIGV2ZW50IHRvIHRoZSBzbGlkZXIgYmFzZS5cclxuXHRcdGlmICggYmVoYXZpb3VyLnRhcCApIHtcclxuXHRcdFx0YXR0YWNoRXZlbnQgKGFjdGlvbnMuc3RhcnQsIHNjb3BlX0Jhc2UsIGV2ZW50VGFwLCB7fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gRmlyZSBob3ZlciBldmVudHNcclxuXHRcdGlmICggYmVoYXZpb3VyLmhvdmVyICkge1xyXG5cdFx0XHRhdHRhY2hFdmVudCAoYWN0aW9ucy5tb3ZlLCBzY29wZV9CYXNlLCBldmVudEhvdmVyLCB7IGhvdmVyOiB0cnVlIH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIE1ha2UgdGhlIHJhbmdlIGRyYWdnYWJsZS5cclxuXHRcdGlmICggYmVoYXZpb3VyLmRyYWcgKXtcclxuXHJcblx0XHRcdHNjb3BlX0Nvbm5lY3RzLmZvckVhY2goZnVuY3Rpb24oIGNvbm5lY3QsIGluZGV4ICl7XHJcblxyXG5cdFx0XHRcdGlmICggY29ubmVjdCA9PT0gZmFsc2UgfHwgaW5kZXggPT09IDAgfHwgaW5kZXggPT09IHNjb3BlX0Nvbm5lY3RzLmxlbmd0aCAtIDEgKSB7XHJcblx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR2YXIgaGFuZGxlQmVmb3JlID0gc2NvcGVfSGFuZGxlc1tpbmRleCAtIDFdO1xyXG5cdFx0XHRcdHZhciBoYW5kbGVBZnRlciA9IHNjb3BlX0hhbmRsZXNbaW5kZXhdO1xyXG5cdFx0XHRcdHZhciBldmVudEhvbGRlcnMgPSBbY29ubmVjdF07XHJcblxyXG5cdFx0XHRcdGFkZENsYXNzKGNvbm5lY3QsIG9wdGlvbnMuY3NzQ2xhc3Nlcy5kcmFnZ2FibGUpO1xyXG5cclxuXHRcdFx0XHQvLyBXaGVuIHRoZSByYW5nZSBpcyBmaXhlZCwgdGhlIGVudGlyZSByYW5nZSBjYW5cclxuXHRcdFx0XHQvLyBiZSBkcmFnZ2VkIGJ5IHRoZSBoYW5kbGVzLiBUaGUgaGFuZGxlIGluIHRoZSBmaXJzdFxyXG5cdFx0XHRcdC8vIG9yaWdpbiB3aWxsIHByb3BhZ2F0ZSB0aGUgc3RhcnQgZXZlbnQgdXB3YXJkLFxyXG5cdFx0XHRcdC8vIGJ1dCBpdCBuZWVkcyB0byBiZSBib3VuZCBtYW51YWxseSBvbiB0aGUgb3RoZXIuXHJcblx0XHRcdFx0aWYgKCBiZWhhdmlvdXIuZml4ZWQgKSB7XHJcblx0XHRcdFx0XHRldmVudEhvbGRlcnMucHVzaChoYW5kbGVCZWZvcmUuY2hpbGRyZW5bMF0pO1xyXG5cdFx0XHRcdFx0ZXZlbnRIb2xkZXJzLnB1c2goaGFuZGxlQWZ0ZXIuY2hpbGRyZW5bMF0pO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0ZXZlbnRIb2xkZXJzLmZvckVhY2goZnVuY3Rpb24oIGV2ZW50SG9sZGVyICkge1xyXG5cdFx0XHRcdFx0YXR0YWNoRXZlbnQgKCBhY3Rpb25zLnN0YXJ0LCBldmVudEhvbGRlciwgZXZlbnRTdGFydCwge1xyXG5cdFx0XHRcdFx0XHRoYW5kbGVzOiBbaGFuZGxlQmVmb3JlLCBoYW5kbGVBZnRlcl0sXHJcblx0XHRcdFx0XHRcdGhhbmRsZU51bWJlcnM6IFtpbmRleCAtIDEsIGluZGV4XVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblxyXG5cdC8vIFNwbGl0IG91dCB0aGUgaGFuZGxlIHBvc2l0aW9uaW5nIGxvZ2ljIHNvIHRoZSBNb3ZlIGV2ZW50IGNhbiB1c2UgaXQsIHRvb1xyXG5cdGZ1bmN0aW9uIGNoZWNrSGFuZGxlUG9zaXRpb24gKCByZWZlcmVuY2UsIGhhbmRsZU51bWJlciwgdG8sIGxvb2tCYWNrd2FyZCwgbG9va0ZvcndhcmQsIGdldFZhbHVlICkge1xyXG5cclxuXHRcdC8vIEZvciBzbGlkZXJzIHdpdGggbXVsdGlwbGUgaGFuZGxlcywgbGltaXQgbW92ZW1lbnQgdG8gdGhlIG90aGVyIGhhbmRsZS5cclxuXHRcdC8vIEFwcGx5IHRoZSBtYXJnaW4gb3B0aW9uIGJ5IGFkZGluZyBpdCB0byB0aGUgaGFuZGxlIHBvc2l0aW9ucy5cclxuXHRcdGlmICggc2NvcGVfSGFuZGxlcy5sZW5ndGggPiAxICkge1xyXG5cclxuXHRcdFx0aWYgKCBsb29rQmFja3dhcmQgJiYgaGFuZGxlTnVtYmVyID4gMCApIHtcclxuXHRcdFx0XHR0byA9IE1hdGgubWF4KHRvLCByZWZlcmVuY2VbaGFuZGxlTnVtYmVyIC0gMV0gKyBvcHRpb25zLm1hcmdpbik7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICggbG9va0ZvcndhcmQgJiYgaGFuZGxlTnVtYmVyIDwgc2NvcGVfSGFuZGxlcy5sZW5ndGggLSAxICkge1xyXG5cdFx0XHRcdHRvID0gTWF0aC5taW4odG8sIHJlZmVyZW5jZVtoYW5kbGVOdW1iZXIgKyAxXSAtIG9wdGlvbnMubWFyZ2luKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFRoZSBsaW1pdCBvcHRpb24gaGFzIHRoZSBvcHBvc2l0ZSBlZmZlY3QsIGxpbWl0aW5nIGhhbmRsZXMgdG8gYVxyXG5cdFx0Ly8gbWF4aW11bSBkaXN0YW5jZSBmcm9tIGFub3RoZXIuIExpbWl0IG11c3QgYmUgPiAwLCBhcyBvdGhlcndpc2VcclxuXHRcdC8vIGhhbmRsZXMgd291bGQgYmUgdW5tb3ZlYWJsZS5cclxuXHRcdGlmICggc2NvcGVfSGFuZGxlcy5sZW5ndGggPiAxICYmIG9wdGlvbnMubGltaXQgKSB7XHJcblxyXG5cdFx0XHRpZiAoIGxvb2tCYWNrd2FyZCAmJiBoYW5kbGVOdW1iZXIgPiAwICkge1xyXG5cdFx0XHRcdHRvID0gTWF0aC5taW4odG8sIHJlZmVyZW5jZVtoYW5kbGVOdW1iZXIgLSAxXSArIG9wdGlvbnMubGltaXQpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoIGxvb2tGb3J3YXJkICYmIGhhbmRsZU51bWJlciA8IHNjb3BlX0hhbmRsZXMubGVuZ3RoIC0gMSApIHtcclxuXHRcdFx0XHR0byA9IE1hdGgubWF4KHRvLCByZWZlcmVuY2VbaGFuZGxlTnVtYmVyICsgMV0gLSBvcHRpb25zLmxpbWl0KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFRoZSBwYWRkaW5nIG9wdGlvbiBrZWVwcyB0aGUgaGFuZGxlcyBhIGNlcnRhaW4gZGlzdGFuY2UgZnJvbSB0aGVcclxuXHRcdC8vIGVkZ2VzIG9mIHRoZSBzbGlkZXIuIFBhZGRpbmcgbXVzdCBiZSA+IDAuXHJcblx0XHRpZiAoIG9wdGlvbnMucGFkZGluZyApIHtcclxuXHJcblx0XHRcdGlmICggaGFuZGxlTnVtYmVyID09PSAwICkge1xyXG5cdFx0XHRcdHRvID0gTWF0aC5tYXgodG8sIG9wdGlvbnMucGFkZGluZyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICggaGFuZGxlTnVtYmVyID09PSBzY29wZV9IYW5kbGVzLmxlbmd0aCAtIDEgKSB7XHJcblx0XHRcdFx0dG8gPSBNYXRoLm1pbih0bywgMTAwIC0gb3B0aW9ucy5wYWRkaW5nKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHRvID0gc2NvcGVfU3BlY3RydW0uZ2V0U3RlcCh0byk7XHJcblxyXG5cdFx0Ly8gTGltaXQgcGVyY2VudGFnZSB0byB0aGUgMCAtIDEwMCByYW5nZVxyXG5cdFx0dG8gPSBsaW1pdCh0byk7XHJcblxyXG5cdFx0Ly8gUmV0dXJuIGZhbHNlIGlmIGhhbmRsZSBjYW4ndCBtb3ZlXHJcblx0XHRpZiAoIHRvID09PSByZWZlcmVuY2VbaGFuZGxlTnVtYmVyXSAmJiAhZ2V0VmFsdWUgKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdG87XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0b1BjdCAoIHBjdCApIHtcclxuXHRcdHJldHVybiBwY3QgKyAnJSc7XHJcblx0fVxyXG5cclxuXHQvLyBVcGRhdGVzIHNjb3BlX0xvY2F0aW9ucyBhbmQgc2NvcGVfVmFsdWVzLCB1cGRhdGVzIHZpc3VhbCBzdGF0ZVxyXG5cdGZ1bmN0aW9uIHVwZGF0ZUhhbmRsZVBvc2l0aW9uICggaGFuZGxlTnVtYmVyLCB0byApIHtcclxuXHJcblx0XHQvLyBVcGRhdGUgbG9jYXRpb25zLlxyXG5cdFx0c2NvcGVfTG9jYXRpb25zW2hhbmRsZU51bWJlcl0gPSB0bztcclxuXHJcblx0XHQvLyBDb252ZXJ0IHRoZSB2YWx1ZSB0byB0aGUgc2xpZGVyIHN0ZXBwaW5nL3JhbmdlLlxyXG5cdFx0c2NvcGVfVmFsdWVzW2hhbmRsZU51bWJlcl0gPSBzY29wZV9TcGVjdHJ1bS5mcm9tU3RlcHBpbmcodG8pO1xyXG5cclxuXHRcdC8vIENhbGxlZCBzeW5jaHJvbm91c2x5IG9yIG9uIHRoZSBuZXh0IGFuaW1hdGlvbkZyYW1lXHJcblx0XHR2YXIgc3RhdGVVcGRhdGUgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0c2NvcGVfSGFuZGxlc1toYW5kbGVOdW1iZXJdLnN0eWxlW29wdGlvbnMuc3R5bGVdID0gdG9QY3QodG8pO1xyXG5cdFx0XHR1cGRhdGVDb25uZWN0KGhhbmRsZU51bWJlcik7XHJcblx0XHRcdHVwZGF0ZUNvbm5lY3QoaGFuZGxlTnVtYmVyICsgMSk7XHJcblx0XHR9O1xyXG5cclxuXHRcdC8vIFNldCB0aGUgaGFuZGxlIHRvIHRoZSBuZXcgcG9zaXRpb24uXHJcblx0XHQvLyBVc2UgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIGZvciBlZmZpY2llbnQgcGFpbnRpbmcuXHJcblx0XHQvLyBObyBzaWduaWZpY2FudCBlZmZlY3QgaW4gQ2hyb21lLCBFZGdlIHNlZXMgZHJhbWF0aWMgcGVyZm9ybWFjZSBpbXByb3ZlbWVudHMuXHJcblx0XHQvLyBPcHRpb24gdG8gZGlzYWJsZSBpcyB1c2VmdWwgZm9yIHVuaXQgdGVzdHMsIGFuZCBzaW5nbGUtc3RlcCBkZWJ1Z2dpbmcuXHJcblx0XHRpZiAoIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgJiYgb3B0aW9ucy51c2VSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgKSB7XHJcblx0XHRcdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc3RhdGVVcGRhdGUpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0c3RhdGVVcGRhdGUoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldFppbmRleCAoICkge1xyXG5cclxuXHRcdHNjb3BlX0hhbmRsZU51bWJlcnMuZm9yRWFjaChmdW5jdGlvbihoYW5kbGVOdW1iZXIpe1xyXG5cdFx0XHQvLyBIYW5kbGVzIGJlZm9yZSB0aGUgc2xpZGVyIG1pZGRsZSBhcmUgc3RhY2tlZCBsYXRlciA9IGhpZ2hlcixcclxuXHRcdFx0Ly8gSGFuZGxlcyBhZnRlciB0aGUgbWlkZGxlIGxhdGVyIGlzIGxvd2VyXHJcblx0XHRcdC8vIFtbN10gWzhdIC4uLi4uLi4uLi4gfCAuLi4uLi4uLi4uIFs1XSBbNF1cclxuXHRcdFx0dmFyIGRpciA9IChzY29wZV9Mb2NhdGlvbnNbaGFuZGxlTnVtYmVyXSA+IDUwID8gLTEgOiAxKTtcclxuXHRcdFx0dmFyIHpJbmRleCA9IDMgKyAoc2NvcGVfSGFuZGxlcy5sZW5ndGggKyAoZGlyICogaGFuZGxlTnVtYmVyKSk7XHJcblx0XHRcdHNjb3BlX0hhbmRsZXNbaGFuZGxlTnVtYmVyXS5jaGlsZE5vZGVzWzBdLnN0eWxlLnpJbmRleCA9IHpJbmRleDtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Ly8gVGVzdCBzdWdnZXN0ZWQgdmFsdWVzIGFuZCBhcHBseSBtYXJnaW4sIHN0ZXAuXHJcblx0ZnVuY3Rpb24gc2V0SGFuZGxlICggaGFuZGxlTnVtYmVyLCB0bywgbG9va0JhY2t3YXJkLCBsb29rRm9yd2FyZCApIHtcclxuXHJcblx0XHR0byA9IGNoZWNrSGFuZGxlUG9zaXRpb24oc2NvcGVfTG9jYXRpb25zLCBoYW5kbGVOdW1iZXIsIHRvLCBsb29rQmFja3dhcmQsIGxvb2tGb3J3YXJkLCBmYWxzZSk7XHJcblxyXG5cdFx0aWYgKCB0byA9PT0gZmFsc2UgKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHR1cGRhdGVIYW5kbGVQb3NpdGlvbihoYW5kbGVOdW1iZXIsIHRvKTtcclxuXHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdC8vIFVwZGF0ZXMgc3R5bGUgYXR0cmlidXRlIGZvciBjb25uZWN0IG5vZGVzXHJcblx0ZnVuY3Rpb24gdXBkYXRlQ29ubmVjdCAoIGluZGV4ICkge1xyXG5cclxuXHRcdC8vIFNraXAgY29ubmVjdHMgc2V0IHRvIGZhbHNlXHJcblx0XHRpZiAoICFzY29wZV9Db25uZWN0c1tpbmRleF0gKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgbCA9IDA7XHJcblx0XHR2YXIgaCA9IDEwMDtcclxuXHJcblx0XHRpZiAoIGluZGV4ICE9PSAwICkge1xyXG5cdFx0XHRsID0gc2NvcGVfTG9jYXRpb25zW2luZGV4IC0gMV07XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCBpbmRleCAhPT0gc2NvcGVfQ29ubmVjdHMubGVuZ3RoIC0gMSApIHtcclxuXHRcdFx0aCA9IHNjb3BlX0xvY2F0aW9uc1tpbmRleF07XHJcblx0XHR9XHJcblxyXG5cdFx0c2NvcGVfQ29ubmVjdHNbaW5kZXhdLnN0eWxlW29wdGlvbnMuc3R5bGVdID0gdG9QY3QobCk7XHJcblx0XHRzY29wZV9Db25uZWN0c1tpbmRleF0uc3R5bGVbb3B0aW9ucy5zdHlsZU9wb3NpdGVdID0gdG9QY3QoMTAwIC0gaCk7XHJcblx0fVxyXG5cclxuXHQvLyAuLi5cclxuXHRmdW5jdGlvbiBzZXRWYWx1ZSAoIHRvLCBoYW5kbGVOdW1iZXIgKSB7XHJcblxyXG5cdFx0Ly8gU2V0dGluZyB3aXRoIG51bGwgaW5kaWNhdGVzIGFuICdpZ25vcmUnLlxyXG5cdFx0Ly8gSW5wdXR0aW5nICdmYWxzZScgaXMgaW52YWxpZC5cclxuXHRcdGlmICggdG8gPT09IG51bGwgfHwgdG8gPT09IGZhbHNlICkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gSWYgYSBmb3JtYXR0ZWQgbnVtYmVyIHdhcyBwYXNzZWQsIGF0dGVtdCB0byBkZWNvZGUgaXQuXHJcblx0XHRpZiAoIHR5cGVvZiB0byA9PT0gJ251bWJlcicgKSB7XHJcblx0XHRcdHRvID0gU3RyaW5nKHRvKTtcclxuXHRcdH1cclxuXHJcblx0XHR0byA9IG9wdGlvbnMuZm9ybWF0LmZyb20odG8pO1xyXG5cclxuXHRcdC8vIFJlcXVlc3QgYW4gdXBkYXRlIGZvciBhbGwgbGlua3MgaWYgdGhlIHZhbHVlIHdhcyBpbnZhbGlkLlxyXG5cdFx0Ly8gRG8gc28gdG9vIGlmIHNldHRpbmcgdGhlIGhhbmRsZSBmYWlscy5cclxuXHRcdGlmICggdG8gIT09IGZhbHNlICYmICFpc05hTih0bykgKSB7XHJcblx0XHRcdHNldEhhbmRsZShoYW5kbGVOdW1iZXIsIHNjb3BlX1NwZWN0cnVtLnRvU3RlcHBpbmcodG8pLCBmYWxzZSwgZmFsc2UpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gU2V0IHRoZSBzbGlkZXIgdmFsdWUuXHJcblx0ZnVuY3Rpb24gdmFsdWVTZXQgKCBpbnB1dCwgZmlyZVNldEV2ZW50ICkge1xyXG5cclxuXHRcdHZhciB2YWx1ZXMgPSBhc0FycmF5KGlucHV0KTtcclxuXHRcdHZhciBpc0luaXQgPSBzY29wZV9Mb2NhdGlvbnNbMF0gPT09IHVuZGVmaW5lZDtcclxuXHJcblx0XHQvLyBFdmVudCBmaXJlcyBieSBkZWZhdWx0XHJcblx0XHRmaXJlU2V0RXZlbnQgPSAoZmlyZVNldEV2ZW50ID09PSB1bmRlZmluZWQgPyB0cnVlIDogISFmaXJlU2V0RXZlbnQpO1xyXG5cclxuXHRcdHZhbHVlcy5mb3JFYWNoKHNldFZhbHVlKTtcclxuXHJcblx0XHQvLyBBbmltYXRpb24gaXMgb3B0aW9uYWwuXHJcblx0XHQvLyBNYWtlIHN1cmUgdGhlIGluaXRpYWwgdmFsdWVzIHdlcmUgc2V0IGJlZm9yZSB1c2luZyBhbmltYXRlZCBwbGFjZW1lbnQuXHJcblx0XHRpZiAoIG9wdGlvbnMuYW5pbWF0ZSAmJiAhaXNJbml0ICkge1xyXG5cdFx0XHRhZGRDbGFzc0ZvcihzY29wZV9UYXJnZXQsIG9wdGlvbnMuY3NzQ2xhc3Nlcy50YXAsIG9wdGlvbnMuYW5pbWF0aW9uRHVyYXRpb24pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIE5vdyB0aGF0IGFsbCBiYXNlIHZhbHVlcyBhcmUgc2V0LCBhcHBseSBjb25zdHJhaW50c1xyXG5cdFx0c2NvcGVfSGFuZGxlTnVtYmVycy5mb3JFYWNoKGZ1bmN0aW9uKGhhbmRsZU51bWJlcil7XHJcblx0XHRcdHNldEhhbmRsZShoYW5kbGVOdW1iZXIsIHNjb3BlX0xvY2F0aW9uc1toYW5kbGVOdW1iZXJdLCB0cnVlLCBmYWxzZSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRzZXRaaW5kZXgoKTtcclxuXHJcblx0XHRzY29wZV9IYW5kbGVOdW1iZXJzLmZvckVhY2goZnVuY3Rpb24oaGFuZGxlTnVtYmVyKXtcclxuXHJcblx0XHRcdGZpcmVFdmVudCgndXBkYXRlJywgaGFuZGxlTnVtYmVyKTtcclxuXHJcblx0XHRcdC8vIEZpcmUgdGhlIGV2ZW50IG9ubHkgZm9yIGhhbmRsZXMgdGhhdCByZWNlaXZlZCBhIG5ldyB2YWx1ZSwgYXMgcGVyICM1NzlcclxuXHRcdFx0aWYgKCB2YWx1ZXNbaGFuZGxlTnVtYmVyXSAhPT0gbnVsbCAmJiBmaXJlU2V0RXZlbnQgKSB7XHJcblx0XHRcdFx0ZmlyZUV2ZW50KCdzZXQnLCBoYW5kbGVOdW1iZXIpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8vIFJlc2V0IHNsaWRlciB0byBpbml0aWFsIHZhbHVlc1xyXG5cdGZ1bmN0aW9uIHZhbHVlUmVzZXQgKCBmaXJlU2V0RXZlbnQgKSB7XHJcblx0XHR2YWx1ZVNldChvcHRpb25zLnN0YXJ0LCBmaXJlU2V0RXZlbnQpO1xyXG5cdH1cclxuXHJcblx0Ly8gR2V0IHRoZSBzbGlkZXIgdmFsdWUuXHJcblx0ZnVuY3Rpb24gdmFsdWVHZXQgKCApIHtcclxuXHJcblx0XHR2YXIgdmFsdWVzID0gc2NvcGVfVmFsdWVzLm1hcChvcHRpb25zLmZvcm1hdC50byk7XHJcblxyXG5cdFx0Ly8gSWYgb25seSBvbmUgaGFuZGxlIGlzIHVzZWQsIHJldHVybiBhIHNpbmdsZSB2YWx1ZS5cclxuXHRcdGlmICggdmFsdWVzLmxlbmd0aCA9PT0gMSApe1xyXG5cdFx0XHRyZXR1cm4gdmFsdWVzWzBdO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB2YWx1ZXM7XHJcblx0fVxyXG5cclxuXHQvLyBSZW1vdmVzIGNsYXNzZXMgZnJvbSB0aGUgcm9vdCBhbmQgZW1wdGllcyBpdC5cclxuXHRmdW5jdGlvbiBkZXN0cm95ICggKSB7XHJcblxyXG5cdFx0Zm9yICggdmFyIGtleSBpbiBvcHRpb25zLmNzc0NsYXNzZXMgKSB7XHJcblx0XHRcdGlmICggIW9wdGlvbnMuY3NzQ2xhc3Nlcy5oYXNPd25Qcm9wZXJ0eShrZXkpICkgeyBjb250aW51ZTsgfVxyXG5cdFx0XHRyZW1vdmVDbGFzcyhzY29wZV9UYXJnZXQsIG9wdGlvbnMuY3NzQ2xhc3Nlc1trZXldKTtcclxuXHRcdH1cclxuXHJcblx0XHR3aGlsZSAoc2NvcGVfVGFyZ2V0LmZpcnN0Q2hpbGQpIHtcclxuXHRcdFx0c2NvcGVfVGFyZ2V0LnJlbW92ZUNoaWxkKHNjb3BlX1RhcmdldC5maXJzdENoaWxkKTtcclxuXHRcdH1cclxuXHJcblx0XHRkZWxldGUgc2NvcGVfVGFyZ2V0Lm5vVWlTbGlkZXI7XHJcblx0fVxyXG5cclxuXHQvLyBHZXQgdGhlIGN1cnJlbnQgc3RlcCBzaXplIGZvciB0aGUgc2xpZGVyLlxyXG5cdGZ1bmN0aW9uIGdldEN1cnJlbnRTdGVwICggKSB7XHJcblxyXG5cdFx0Ly8gQ2hlY2sgYWxsIGxvY2F0aW9ucywgbWFwIHRoZW0gdG8gdGhlaXIgc3RlcHBpbmcgcG9pbnQuXHJcblx0XHQvLyBHZXQgdGhlIHN0ZXAgcG9pbnQsIHRoZW4gZmluZCBpdCBpbiB0aGUgaW5wdXQgbGlzdC5cclxuXHRcdHJldHVybiBzY29wZV9Mb2NhdGlvbnMubWFwKGZ1bmN0aW9uKCBsb2NhdGlvbiwgaW5kZXggKXtcclxuXHJcblx0XHRcdHZhciBuZWFyYnlTdGVwcyA9IHNjb3BlX1NwZWN0cnVtLmdldE5lYXJieVN0ZXBzKCBsb2NhdGlvbiApO1xyXG5cdFx0XHR2YXIgdmFsdWUgPSBzY29wZV9WYWx1ZXNbaW5kZXhdO1xyXG5cdFx0XHR2YXIgaW5jcmVtZW50ID0gbmVhcmJ5U3RlcHMudGhpc1N0ZXAuc3RlcDtcclxuXHRcdFx0dmFyIGRlY3JlbWVudCA9IG51bGw7XHJcblxyXG5cdFx0XHQvLyBJZiB0aGUgbmV4dCB2YWx1ZSBpbiB0aGlzIHN0ZXAgbW92ZXMgaW50byB0aGUgbmV4dCBzdGVwLFxyXG5cdFx0XHQvLyB0aGUgaW5jcmVtZW50IGlzIHRoZSBzdGFydCBvZiB0aGUgbmV4dCBzdGVwIC0gdGhlIGN1cnJlbnQgdmFsdWVcclxuXHRcdFx0aWYgKCBpbmNyZW1lbnQgIT09IGZhbHNlICkge1xyXG5cdFx0XHRcdGlmICggdmFsdWUgKyBpbmNyZW1lbnQgPiBuZWFyYnlTdGVwcy5zdGVwQWZ0ZXIuc3RhcnRWYWx1ZSApIHtcclxuXHRcdFx0XHRcdGluY3JlbWVudCA9IG5lYXJieVN0ZXBzLnN0ZXBBZnRlci5zdGFydFZhbHVlIC0gdmFsdWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cclxuXHRcdFx0Ly8gSWYgdGhlIHZhbHVlIGlzIGJleW9uZCB0aGUgc3RhcnRpbmcgcG9pbnRcclxuXHRcdFx0aWYgKCB2YWx1ZSA+IG5lYXJieVN0ZXBzLnRoaXNTdGVwLnN0YXJ0VmFsdWUgKSB7XHJcblx0XHRcdFx0ZGVjcmVtZW50ID0gbmVhcmJ5U3RlcHMudGhpc1N0ZXAuc3RlcDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZWxzZSBpZiAoIG5lYXJieVN0ZXBzLnN0ZXBCZWZvcmUuc3RlcCA9PT0gZmFsc2UgKSB7XHJcblx0XHRcdFx0ZGVjcmVtZW50ID0gZmFsc2U7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIElmIGEgaGFuZGxlIGlzIGF0IHRoZSBzdGFydCBvZiBhIHN0ZXAsIGl0IGFsd2F5cyBzdGVwcyBiYWNrIGludG8gdGhlIHByZXZpb3VzIHN0ZXAgZmlyc3RcclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0ZGVjcmVtZW50ID0gdmFsdWUgLSBuZWFyYnlTdGVwcy5zdGVwQmVmb3JlLmhpZ2hlc3RTdGVwO1xyXG5cdFx0XHR9XHJcblxyXG5cclxuXHRcdFx0Ly8gTm93LCBpZiBhdCB0aGUgc2xpZGVyIGVkZ2VzLCB0aGVyZSBpcyBub3QgaW4vZGVjcmVtZW50XHJcblx0XHRcdGlmICggbG9jYXRpb24gPT09IDEwMCApIHtcclxuXHRcdFx0XHRpbmNyZW1lbnQgPSBudWxsO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRlbHNlIGlmICggbG9jYXRpb24gPT09IDAgKSB7XHJcblx0XHRcdFx0ZGVjcmVtZW50ID0gbnVsbDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gQXMgcGVyICMzOTEsIHRoZSBjb21wYXJpc29uIGZvciB0aGUgZGVjcmVtZW50IHN0ZXAgY2FuIGhhdmUgc29tZSByb3VuZGluZyBpc3N1ZXMuXHJcblx0XHRcdHZhciBzdGVwRGVjaW1hbHMgPSBzY29wZV9TcGVjdHJ1bS5jb3VudFN0ZXBEZWNpbWFscygpO1xyXG5cclxuXHRcdFx0Ly8gUm91bmQgcGVyICMzOTFcclxuXHRcdFx0aWYgKCBpbmNyZW1lbnQgIT09IG51bGwgJiYgaW5jcmVtZW50ICE9PSBmYWxzZSApIHtcclxuXHRcdFx0XHRpbmNyZW1lbnQgPSBOdW1iZXIoaW5jcmVtZW50LnRvRml4ZWQoc3RlcERlY2ltYWxzKSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICggZGVjcmVtZW50ICE9PSBudWxsICYmIGRlY3JlbWVudCAhPT0gZmFsc2UgKSB7XHJcblx0XHRcdFx0ZGVjcmVtZW50ID0gTnVtYmVyKGRlY3JlbWVudC50b0ZpeGVkKHN0ZXBEZWNpbWFscykpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gW2RlY3JlbWVudCwgaW5jcmVtZW50XTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Ly8gQXR0YWNoIGFuIGV2ZW50IHRvIHRoaXMgc2xpZGVyLCBwb3NzaWJseSBpbmNsdWRpbmcgYSBuYW1lc3BhY2VcclxuXHRmdW5jdGlvbiBiaW5kRXZlbnQgKCBuYW1lc3BhY2VkRXZlbnQsIGNhbGxiYWNrICkge1xyXG5cdFx0c2NvcGVfRXZlbnRzW25hbWVzcGFjZWRFdmVudF0gPSBzY29wZV9FdmVudHNbbmFtZXNwYWNlZEV2ZW50XSB8fCBbXTtcclxuXHRcdHNjb3BlX0V2ZW50c1tuYW1lc3BhY2VkRXZlbnRdLnB1c2goY2FsbGJhY2spO1xyXG5cclxuXHRcdC8vIElmIHRoZSBldmVudCBib3VuZCBpcyAndXBkYXRlLCcgZmlyZSBpdCBpbW1lZGlhdGVseSBmb3IgYWxsIGhhbmRsZXMuXHJcblx0XHRpZiAoIG5hbWVzcGFjZWRFdmVudC5zcGxpdCgnLicpWzBdID09PSAndXBkYXRlJyApIHtcclxuXHRcdFx0c2NvcGVfSGFuZGxlcy5mb3JFYWNoKGZ1bmN0aW9uKGEsIGluZGV4KXtcclxuXHRcdFx0XHRmaXJlRXZlbnQoJ3VwZGF0ZScsIGluZGV4KTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBVbmRvIGF0dGFjaG1lbnQgb2YgZXZlbnRcclxuXHRmdW5jdGlvbiByZW1vdmVFdmVudCAoIG5hbWVzcGFjZWRFdmVudCApIHtcclxuXHJcblx0XHR2YXIgZXZlbnQgPSBuYW1lc3BhY2VkRXZlbnQgJiYgbmFtZXNwYWNlZEV2ZW50LnNwbGl0KCcuJylbMF07XHJcblx0XHR2YXIgbmFtZXNwYWNlID0gZXZlbnQgJiYgbmFtZXNwYWNlZEV2ZW50LnN1YnN0cmluZyhldmVudC5sZW5ndGgpO1xyXG5cclxuXHRcdE9iamVjdC5rZXlzKHNjb3BlX0V2ZW50cykuZm9yRWFjaChmdW5jdGlvbiggYmluZCApe1xyXG5cclxuXHRcdFx0dmFyIHRFdmVudCA9IGJpbmQuc3BsaXQoJy4nKVswXSxcclxuXHRcdFx0XHR0TmFtZXNwYWNlID0gYmluZC5zdWJzdHJpbmcodEV2ZW50Lmxlbmd0aCk7XHJcblxyXG5cdFx0XHRpZiAoICghZXZlbnQgfHwgZXZlbnQgPT09IHRFdmVudCkgJiYgKCFuYW1lc3BhY2UgfHwgbmFtZXNwYWNlID09PSB0TmFtZXNwYWNlKSApIHtcclxuXHRcdFx0XHRkZWxldGUgc2NvcGVfRXZlbnRzW2JpbmRdO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8vIFVwZGF0ZWFibGU6IG1hcmdpbiwgbGltaXQsIHBhZGRpbmcsIHN0ZXAsIHJhbmdlLCBhbmltYXRlLCBzbmFwXHJcblx0ZnVuY3Rpb24gdXBkYXRlT3B0aW9ucyAoIG9wdGlvbnNUb1VwZGF0ZSwgZmlyZVNldEV2ZW50ICkge1xyXG5cclxuXHRcdC8vIFNwZWN0cnVtIGlzIGNyZWF0ZWQgdXNpbmcgdGhlIHJhbmdlLCBzbmFwLCBkaXJlY3Rpb24gYW5kIHN0ZXAgb3B0aW9ucy5cclxuXHRcdC8vICdzbmFwJyBhbmQgJ3N0ZXAnIGNhbiBiZSB1cGRhdGVkLlxyXG5cdFx0Ly8gSWYgJ3NuYXAnIGFuZCAnc3RlcCcgYXJlIG5vdCBwYXNzZWQsIHRoZXkgc2hvdWxkIHJlbWFpbiB1bmNoYW5nZWQuXHJcblx0XHR2YXIgdiA9IHZhbHVlR2V0KCk7XHJcblxyXG5cdFx0dmFyIHVwZGF0ZUFibGUgPSBbJ21hcmdpbicsICdsaW1pdCcsICdwYWRkaW5nJywgJ3JhbmdlJywgJ2FuaW1hdGUnLCAnc25hcCcsICdzdGVwJywgJ2Zvcm1hdCddO1xyXG5cclxuXHRcdC8vIE9ubHkgY2hhbmdlIG9wdGlvbnMgdGhhdCB3ZSdyZSBhY3R1YWxseSBwYXNzZWQgdG8gdXBkYXRlLlxyXG5cdFx0dXBkYXRlQWJsZS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpe1xyXG5cdFx0XHRpZiAoIG9wdGlvbnNUb1VwZGF0ZVtuYW1lXSAhPT0gdW5kZWZpbmVkICkge1xyXG5cdFx0XHRcdG9yaWdpbmFsT3B0aW9uc1tuYW1lXSA9IG9wdGlvbnNUb1VwZGF0ZVtuYW1lXTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0dmFyIG5ld09wdGlvbnMgPSB0ZXN0T3B0aW9ucyhvcmlnaW5hbE9wdGlvbnMpO1xyXG5cclxuXHRcdC8vIExvYWQgbmV3IG9wdGlvbnMgaW50byB0aGUgc2xpZGVyIHN0YXRlXHJcblx0XHR1cGRhdGVBYmxlLmZvckVhY2goZnVuY3Rpb24obmFtZSl7XHJcblx0XHRcdGlmICggb3B0aW9uc1RvVXBkYXRlW25hbWVdICE9PSB1bmRlZmluZWQgKSB7XHJcblx0XHRcdFx0b3B0aW9uc1tuYW1lXSA9IG5ld09wdGlvbnNbbmFtZV07XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdHNjb3BlX1NwZWN0cnVtID0gbmV3T3B0aW9ucy5zcGVjdHJ1bTtcclxuXHJcblx0XHQvLyBMaW1pdCwgbWFyZ2luIGFuZCBwYWRkaW5nIGRlcGVuZCBvbiB0aGUgc3BlY3RydW0gYnV0IGFyZSBzdG9yZWQgb3V0c2lkZSBvZiBpdC4gKCM2NzcpXHJcblx0XHRvcHRpb25zLm1hcmdpbiA9IG5ld09wdGlvbnMubWFyZ2luO1xyXG5cdFx0b3B0aW9ucy5saW1pdCA9IG5ld09wdGlvbnMubGltaXQ7XHJcblx0XHRvcHRpb25zLnBhZGRpbmcgPSBuZXdPcHRpb25zLnBhZGRpbmc7XHJcblxyXG5cdFx0Ly8gVXBkYXRlIHBpcHMsIHJlbW92ZXMgZXhpc3RpbmcuXHJcblx0XHRpZiAoIG9wdGlvbnMucGlwcyApIHtcclxuXHRcdFx0cGlwcyhvcHRpb25zLnBpcHMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEludmFsaWRhdGUgdGhlIGN1cnJlbnQgcG9zaXRpb25pbmcgc28gdmFsdWVTZXQgZm9yY2VzIGFuIHVwZGF0ZS5cclxuXHRcdHNjb3BlX0xvY2F0aW9ucyA9IFtdO1xyXG5cdFx0dmFsdWVTZXQob3B0aW9uc1RvVXBkYXRlLnN0YXJ0IHx8IHYsIGZpcmVTZXRFdmVudCk7XHJcblx0fVxyXG5cclxuXHQvLyBUaHJvdyBhbiBlcnJvciBpZiB0aGUgc2xpZGVyIHdhcyBhbHJlYWR5IGluaXRpYWxpemVkLlxyXG5cdGlmICggc2NvcGVfVGFyZ2V0Lm5vVWlTbGlkZXIgKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6IFNsaWRlciB3YXMgYWxyZWFkeSBpbml0aWFsaXplZC5cIik7XHJcblx0fVxyXG5cclxuXHQvLyBDcmVhdGUgdGhlIGJhc2UgZWxlbWVudCwgaW5pdGlhbGlzZSBIVE1MIGFuZCBzZXQgY2xhc3Nlcy5cclxuXHQvLyBBZGQgaGFuZGxlcyBhbmQgY29ubmVjdCBlbGVtZW50cy5cclxuXHRhZGRTbGlkZXIoc2NvcGVfVGFyZ2V0KTtcclxuXHRhZGRFbGVtZW50cyhvcHRpb25zLmNvbm5lY3QsIHNjb3BlX0Jhc2UpO1xyXG5cclxuXHRzY29wZV9TZWxmID0ge1xyXG5cdFx0ZGVzdHJveTogZGVzdHJveSxcclxuXHRcdHN0ZXBzOiBnZXRDdXJyZW50U3RlcCxcclxuXHRcdG9uOiBiaW5kRXZlbnQsXHJcblx0XHRvZmY6IHJlbW92ZUV2ZW50LFxyXG5cdFx0Z2V0OiB2YWx1ZUdldCxcclxuXHRcdHNldDogdmFsdWVTZXQsXHJcblx0XHRyZXNldDogdmFsdWVSZXNldCxcclxuXHRcdC8vIEV4cG9zZWQgZm9yIHVuaXQgdGVzdGluZywgZG9uJ3QgdXNlIHRoaXMgaW4geW91ciBhcHBsaWNhdGlvbi5cclxuXHRcdF9fbW92ZUhhbmRsZXM6IGZ1bmN0aW9uKGEsIGIsIGMpIHsgbW92ZUhhbmRsZXMoYSwgYiwgc2NvcGVfTG9jYXRpb25zLCBjKTsgfSxcclxuXHRcdG9wdGlvbnM6IG9yaWdpbmFsT3B0aW9ucywgLy8gSXNzdWUgIzYwMCwgIzY3OFxyXG5cdFx0dXBkYXRlT3B0aW9uczogdXBkYXRlT3B0aW9ucyxcclxuXHRcdHRhcmdldDogc2NvcGVfVGFyZ2V0LCAvLyBJc3N1ZSAjNTk3XHJcblx0XHRyZW1vdmVQaXBzOiByZW1vdmVQaXBzLFxyXG5cdFx0cGlwczogcGlwcyAvLyBJc3N1ZSAjNTk0XHJcblx0fTtcclxuXHJcblx0Ly8gQXR0YWNoIHVzZXIgZXZlbnRzLlxyXG5cdGJpbmRTbGlkZXJFdmVudHMob3B0aW9ucy5ldmVudHMpO1xyXG5cclxuXHQvLyBVc2UgdGhlIHB1YmxpYyB2YWx1ZSBtZXRob2QgdG8gc2V0IHRoZSBzdGFydCB2YWx1ZXMuXHJcblx0dmFsdWVTZXQob3B0aW9ucy5zdGFydCk7XHJcblxyXG5cdGlmICggb3B0aW9ucy5waXBzICkge1xyXG5cdFx0cGlwcyhvcHRpb25zLnBpcHMpO1xyXG5cdH1cclxuXHJcblx0aWYgKCBvcHRpb25zLnRvb2x0aXBzICkge1xyXG5cdFx0dG9vbHRpcHMoKTtcclxuXHR9XHJcblxyXG5cdGFyaWEoKTtcclxuXHJcblx0cmV0dXJuIHNjb3BlX1NlbGY7XHJcblxyXG59XHJcblxyXG5cclxuXHQvLyBSdW4gdGhlIHN0YW5kYXJkIGluaXRpYWxpemVyXHJcblx0ZnVuY3Rpb24gaW5pdGlhbGl6ZSAoIHRhcmdldCwgb3JpZ2luYWxPcHRpb25zICkge1xyXG5cclxuXHRcdGlmICggIXRhcmdldCB8fCAhdGFyZ2V0Lm5vZGVOYW1lICkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6IGNyZWF0ZSByZXF1aXJlcyBhIHNpbmdsZSBlbGVtZW50LCBnb3Q6IFwiICsgdGFyZ2V0KTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBUZXN0IHRoZSBvcHRpb25zIGFuZCBjcmVhdGUgdGhlIHNsaWRlciBlbnZpcm9ubWVudDtcclxuXHRcdHZhciBvcHRpb25zID0gdGVzdE9wdGlvbnMoIG9yaWdpbmFsT3B0aW9ucywgdGFyZ2V0ICk7XHJcblx0XHR2YXIgYXBpID0gY2xvc3VyZSggdGFyZ2V0LCBvcHRpb25zLCBvcmlnaW5hbE9wdGlvbnMgKTtcclxuXHJcblx0XHR0YXJnZXQubm9VaVNsaWRlciA9IGFwaTtcclxuXHJcblx0XHRyZXR1cm4gYXBpO1xyXG5cdH1cclxuXHJcblx0Ly8gVXNlIGFuIG9iamVjdCBpbnN0ZWFkIG9mIGEgZnVuY3Rpb24gZm9yIGZ1dHVyZSBleHBhbnNpYmlsaXR5O1xyXG5cdHJldHVybiB7XHJcblx0XHR2ZXJzaW9uOiBWRVJTSU9OLFxyXG5cdFx0Y3JlYXRlOiBpbml0aWFsaXplXHJcblx0fTtcclxuXHJcbn0pKTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmVuZG9yL25vdWlzbGlkZXIuanMiLCJpbXBvcnQgZGVzdGluYXRpb24gZnJvbSAnQHR1cmYvZGVzdGluYXRpb24nO1xuaW1wb3J0IHsgcG9seWdvbiB9IGZyb20gJ0B0dXJmL2hlbHBlcnMnO1xuXG4vKipcbiAqIFRha2VzIGEge0BsaW5rIFBvaW50fSBhbmQgY2FsY3VsYXRlcyB0aGUgY2lyY2xlIHBvbHlnb24gZ2l2ZW4gYSByYWRpdXMgaW4gZGVncmVlcywgcmFkaWFucywgbWlsZXMsIG9yIGtpbG9tZXRlcnM7IGFuZCBzdGVwcyBmb3IgcHJlY2lzaW9uLlxuICpcbiAqIEBuYW1lIGNpcmNsZVxuICogQHBhcmFtIHtGZWF0dXJlPFBvaW50PnxudW1iZXJbXX0gY2VudGVyIGNlbnRlciBwb2ludFxuICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1cyByYWRpdXMgb2YgdGhlIGNpcmNsZVxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBPcHRpb25hbCBwYXJhbWV0ZXJzXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc3RlcHM9NjRdIG51bWJlciBvZiBzdGVwc1xuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuaXRzPSdraWxvbWV0ZXJzJ10gbWlsZXMsIGtpbG9tZXRlcnMsIGRlZ3JlZXMsIG9yIHJhZGlhbnNcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucy5wcm9wZXJ0aWVzPXt9XSBwcm9wZXJ0aWVzXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxQb2x5Z29uPn0gY2lyY2xlIHBvbHlnb25cbiAqIEBleGFtcGxlXG4gKiB2YXIgY2VudGVyID0gWy03NS4zNDMsIDM5Ljk4NF07XG4gKiB2YXIgcmFkaXVzID0gNTtcbiAqIHZhciBzdGVwcyA9IDEwO1xuICogdmFyIHVuaXRzID0gJ2tpbG9tZXRlcnMnO1xuICogdmFyIHByb3BlcnRpZXMgPSB7Zm9vOiAnYmFyJ307XG4gKlxuICogdmFyIGNpcmNsZSA9IHR1cmYuY2lyY2xlKGNlbnRlciwgcmFkaXVzLCBzdGVwcywgdW5pdHMsIHByb3BlcnRpZXMpO1xuICpcbiAqIC8vYWRkVG9NYXBcbiAqIHZhciBhZGRUb01hcCA9IFt0dXJmLnBvaW50KGNlbnRlciksIGNpcmNsZV1cbiAqL1xuZnVuY3Rpb24gY2lyY2xlKGNlbnRlciwgcmFkaXVzLCBvcHRpb25zKSB7XG4gICAgLy8gT3B0aW9uYWwgcGFyYW1zXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIHN0ZXBzID0gb3B0aW9ucy5zdGVwcyB8fCA2NDtcbiAgICB2YXIgdW5pdHMgPSBvcHRpb25zLnVuaXRzO1xuICAgIHZhciBwcm9wZXJ0aWVzID0gb3B0aW9ucy5wcm9wZXJ0aWVzO1xuXG4gICAgLy8gdmFsaWRhdGlvblxuICAgIGlmICghY2VudGVyKSB0aHJvdyBuZXcgRXJyb3IoJ2NlbnRlciBpcyByZXF1aXJlZCcpO1xuICAgIGlmICghcmFkaXVzKSB0aHJvdyBuZXcgRXJyb3IoJ3JhZGl1cyBpcyByZXF1aXJlZCcpO1xuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpIHRocm93IG5ldyBFcnJvcignb3B0aW9ucyBtdXN0IGJlIGFuIG9iamVjdCcpO1xuICAgIGlmICh0eXBlb2Ygc3RlcHMgIT09ICdudW1iZXInKSB0aHJvdyBuZXcgRXJyb3IoJ3N0ZXBzIG11c3QgYmUgYSBudW1iZXInKTtcblxuICAgIC8vIGRlZmF1bHQgcGFyYW1zXG4gICAgc3RlcHMgPSBzdGVwcyB8fCA2NDtcbiAgICBwcm9wZXJ0aWVzID0gcHJvcGVydGllcyB8fCBjZW50ZXIucHJvcGVydGllcyB8fCB7fTtcblxuICAgIHZhciBjb29yZGluYXRlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RlcHM7IGkrKykge1xuICAgICAgICBjb29yZGluYXRlcy5wdXNoKGRlc3RpbmF0aW9uKGNlbnRlciwgcmFkaXVzLCBpICogMzYwIC8gc3RlcHMsIHVuaXRzKS5nZW9tZXRyeS5jb29yZGluYXRlcyk7XG4gICAgfVxuICAgIGNvb3JkaW5hdGVzLnB1c2goY29vcmRpbmF0ZXNbMF0pO1xuXG4gICAgcmV0dXJuIHBvbHlnb24oW2Nvb3JkaW5hdGVzXSwgcHJvcGVydGllcyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNpcmNsZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0B0dXJmL2NpcmNsZS9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMjFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy9odHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0hhdmVyc2luZV9mb3JtdWxhXG4vL2h0dHA6Ly93d3cubW92YWJsZS10eXBlLmNvLnVrL3NjcmlwdHMvbGF0bG9uZy5odG1sXG5pbXBvcnQgeyBnZXRDb29yZCB9IGZyb20gJ0B0dXJmL2ludmFyaWFudCc7XG5pbXBvcnQgeyBwb2ludCwgZGlzdGFuY2VUb1JhZGlhbnMgfSBmcm9tICdAdHVyZi9oZWxwZXJzJztcblxuLyoqXG4gKiBUYWtlcyBhIHtAbGluayBQb2ludH0gYW5kIGNhbGN1bGF0ZXMgdGhlIGxvY2F0aW9uIG9mIGEgZGVzdGluYXRpb24gcG9pbnQgZ2l2ZW4gYSBkaXN0YW5jZSBpbiBkZWdyZWVzLCByYWRpYW5zLCBtaWxlcywgb3Iga2lsb21ldGVyczsgYW5kIGJlYXJpbmcgaW4gZGVncmVlcy4gVGhpcyB1c2VzIHRoZSBbSGF2ZXJzaW5lIGZvcm11bGFdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSGF2ZXJzaW5lX2Zvcm11bGEpIHRvIGFjY291bnQgZm9yIGdsb2JhbCBjdXJ2YXR1cmUuXG4gKlxuICogQG5hbWUgZGVzdGluYXRpb25cbiAqIEBwYXJhbSB7R2VvbWV0cnl8RmVhdHVyZTxQb2ludD58QXJyYXk8bnVtYmVyPn0gb3JpZ2luIHN0YXJ0aW5nIHBvaW50XG4gKiBAcGFyYW0ge251bWJlcn0gZGlzdGFuY2UgZGlzdGFuY2UgZnJvbSB0aGUgb3JpZ2luIHBvaW50XG4gKiBAcGFyYW0ge251bWJlcn0gYmVhcmluZyByYW5naW5nIGZyb20gLTE4MCB0byAxODBcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIE9wdGlvbmFsIHBhcmFtZXRlcnNcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy51bml0cz0na2lsb21ldGVycyddIG1pbGVzLCBraWxvbWV0ZXJzLCBkZWdyZWVzLCBvciByYWRpYW5zXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxQb2ludD59IGRlc3RpbmF0aW9uIHBvaW50XG4gKiBAZXhhbXBsZVxuICogdmFyIHBvaW50ID0gdHVyZi5wb2ludChbLTc1LjM0MywgMzkuOTg0XSk7XG4gKiB2YXIgZGlzdGFuY2UgPSA1MDtcbiAqIHZhciBiZWFyaW5nID0gOTA7XG4gKiB2YXIgdW5pdHMgPSAnbWlsZXMnO1xuICpcbiAqIHZhciBkZXN0aW5hdGlvbiA9IHR1cmYuZGVzdGluYXRpb24ocG9pbnQsIGRpc3RhbmNlLCBiZWFyaW5nLCB1bml0cyk7XG4gKlxuICogLy9hZGRUb01hcFxuICogdmFyIGFkZFRvTWFwID0gW3BvaW50LCBkZXN0aW5hdGlvbl1cbiAqIGRlc3RpbmF0aW9uLnByb3BlcnRpZXNbJ21hcmtlci1jb2xvciddID0gJyNmMDAnO1xuICogcG9pbnQucHJvcGVydGllc1snbWFya2VyLWNvbG9yJ10gPSAnIzBmMCc7XG4gKi9cbmZ1bmN0aW9uIGRlc3RpbmF0aW9uKG9yaWdpbiwgZGlzdGFuY2UsIGJlYXJpbmcsIG9wdGlvbnMpIHtcbiAgICAvLyBCYWNrd2FyZHMgY29tcGF0aWJsZSB3aXRoIHY0LjBcbiAgICB2YXIgdW5pdHMgPSAodHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnKSA/IG9wdGlvbnMudW5pdHMgOiBvcHRpb25zO1xuXG4gICAgdmFyIGRlZ3JlZXMycmFkaWFucyA9IE1hdGguUEkgLyAxODA7XG4gICAgdmFyIHJhZGlhbnMyZGVncmVlcyA9IDE4MCAvIE1hdGguUEk7XG4gICAgdmFyIGNvb3JkaW5hdGVzMSA9IGdldENvb3JkKG9yaWdpbik7XG4gICAgdmFyIGxvbmdpdHVkZTEgPSBkZWdyZWVzMnJhZGlhbnMgKiBjb29yZGluYXRlczFbMF07XG4gICAgdmFyIGxhdGl0dWRlMSA9IGRlZ3JlZXMycmFkaWFucyAqIGNvb3JkaW5hdGVzMVsxXTtcbiAgICB2YXIgYmVhcmluZ19yYWQgPSBkZWdyZWVzMnJhZGlhbnMgKiBiZWFyaW5nO1xuXG4gICAgdmFyIHJhZGlhbnMgPSBkaXN0YW5jZVRvUmFkaWFucyhkaXN0YW5jZSwgdW5pdHMpO1xuXG4gICAgdmFyIGxhdGl0dWRlMiA9IE1hdGguYXNpbihNYXRoLnNpbihsYXRpdHVkZTEpICogTWF0aC5jb3MocmFkaWFucykgK1xuICAgICAgICBNYXRoLmNvcyhsYXRpdHVkZTEpICogTWF0aC5zaW4ocmFkaWFucykgKiBNYXRoLmNvcyhiZWFyaW5nX3JhZCkpO1xuICAgIHZhciBsb25naXR1ZGUyID0gbG9uZ2l0dWRlMSArIE1hdGguYXRhbjIoTWF0aC5zaW4oYmVhcmluZ19yYWQpICogTWF0aC5zaW4ocmFkaWFucykgKiBNYXRoLmNvcyhsYXRpdHVkZTEpLFxuICAgICAgICBNYXRoLmNvcyhyYWRpYW5zKSAtIE1hdGguc2luKGxhdGl0dWRlMSkgKiBNYXRoLnNpbihsYXRpdHVkZTIpKTtcblxuICAgIHJldHVybiBwb2ludChbcmFkaWFuczJkZWdyZWVzICogbG9uZ2l0dWRlMiwgcmFkaWFuczJkZWdyZWVzICogbGF0aXR1ZGUyXSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRlc3RpbmF0aW9uO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQHR1cmYvZGVzdGluYXRpb24vaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDIyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogVW53cmFwIGEgY29vcmRpbmF0ZSBmcm9tIGEgUG9pbnQgRmVhdHVyZSwgR2VvbWV0cnkgb3IgYSBzaW5nbGUgY29vcmRpbmF0ZS5cbiAqXG4gKiBAbmFtZSBnZXRDb29yZFxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fEdlb21ldHJ5PFBvaW50PnxGZWF0dXJlPFBvaW50Pn0gb2JqIE9iamVjdFxuICogQHJldHVybnMge0FycmF5PG51bWJlcj59IGNvb3JkaW5hdGVzXG4gKiBAZXhhbXBsZVxuICogdmFyIHB0ID0gdHVyZi5wb2ludChbMTAsIDEwXSk7XG4gKlxuICogdmFyIGNvb3JkID0gdHVyZi5nZXRDb29yZChwdCk7XG4gKiAvLz0gWzEwLCAxMF1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvb3JkKG9iaikge1xuICAgIGlmICghb2JqKSB0aHJvdyBuZXcgRXJyb3IoJ29iaiBpcyByZXF1aXJlZCcpO1xuXG4gICAgdmFyIGNvb3JkaW5hdGVzID0gZ2V0Q29vcmRzKG9iaik7XG5cbiAgICAvLyBnZXRDb29yZCgpIG11c3QgY29udGFpbiBhdCBsZWFzdCB0d28gbnVtYmVycyAoUG9pbnQpXG4gICAgaWYgKGNvb3JkaW5hdGVzLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgdHlwZW9mIGNvb3JkaW5hdGVzWzBdID09PSAnbnVtYmVyJyAmJlxuICAgICAgICB0eXBlb2YgY29vcmRpbmF0ZXNbMV0gPT09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiBjb29yZGluYXRlcztcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nvb3JkaW5hdGUgaXMgbm90IGEgdmFsaWQgUG9pbnQnKTtcbiAgICB9XG59XG5cbi8qKlxuICogVW53cmFwIGNvb3JkaW5hdGVzIGZyb20gYSBGZWF0dXJlLCBHZW9tZXRyeSBPYmplY3Qgb3IgYW4gQXJyYXkgb2YgbnVtYmVyc1xuICpcbiAqIEBuYW1lIGdldENvb3Jkc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fEdlb21ldHJ5fEZlYXR1cmV9IG9iaiBPYmplY3RcbiAqIEByZXR1cm5zIHtBcnJheTxudW1iZXI+fSBjb29yZGluYXRlc1xuICogQGV4YW1wbGVcbiAqIHZhciBwb2x5ID0gdHVyZi5wb2x5Z29uKFtbWzExOS4zMiwgLTguN10sIFsxMTkuNTUsIC04LjY5XSwgWzExOS41MSwgLTguNTRdLCBbMTE5LjMyLCAtOC43XV1dKTtcbiAqXG4gKiB2YXIgY29vcmQgPSB0dXJmLmdldENvb3Jkcyhwb2x5KTtcbiAqIC8vPSBbW1sxMTkuMzIsIC04LjddLCBbMTE5LjU1LCAtOC42OV0sIFsxMTkuNTEsIC04LjU0XSwgWzExOS4zMiwgLTguN11dXVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29vcmRzKG9iaikge1xuICAgIGlmICghb2JqKSB0aHJvdyBuZXcgRXJyb3IoJ29iaiBpcyByZXF1aXJlZCcpO1xuICAgIHZhciBjb29yZGluYXRlcztcblxuICAgIC8vIEFycmF5IG9mIG51bWJlcnNcbiAgICBpZiAob2JqLmxlbmd0aCkge1xuICAgICAgICBjb29yZGluYXRlcyA9IG9iajtcblxuICAgIC8vIEdlb21ldHJ5IE9iamVjdFxuICAgIH0gZWxzZSBpZiAob2JqLmNvb3JkaW5hdGVzKSB7XG4gICAgICAgIGNvb3JkaW5hdGVzID0gb2JqLmNvb3JkaW5hdGVzO1xuXG4gICAgLy8gRmVhdHVyZVxuICAgIH0gZWxzZSBpZiAob2JqLmdlb21ldHJ5ICYmIG9iai5nZW9tZXRyeS5jb29yZGluYXRlcykge1xuICAgICAgICBjb29yZGluYXRlcyA9IG9iai5nZW9tZXRyeS5jb29yZGluYXRlcztcbiAgICB9XG4gICAgLy8gQ2hlY2tzIGlmIGNvb3JkaW5hdGVzIGNvbnRhaW5zIGEgbnVtYmVyXG4gICAgaWYgKGNvb3JkaW5hdGVzKSB7XG4gICAgICAgIGNvbnRhaW5zTnVtYmVyKGNvb3JkaW5hdGVzKTtcbiAgICAgICAgcmV0dXJuIGNvb3JkaW5hdGVzO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHZhbGlkIGNvb3JkaW5hdGVzJyk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGNvb3JkaW5hdGVzIGNvbnRhaW5zIGEgbnVtYmVyXG4gKlxuICogQG5hbWUgY29udGFpbnNOdW1iZXJcbiAqIEBwYXJhbSB7QXJyYXk8YW55Pn0gY29vcmRpbmF0ZXMgR2VvSlNPTiBDb29yZGluYXRlc1xuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgQXJyYXkgY29udGFpbnMgYSBudW1iZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnRhaW5zTnVtYmVyKGNvb3JkaW5hdGVzKSB7XG4gICAgaWYgKGNvb3JkaW5hdGVzLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgdHlwZW9mIGNvb3JkaW5hdGVzWzBdID09PSAnbnVtYmVyJyAmJlxuICAgICAgICB0eXBlb2YgY29vcmRpbmF0ZXNbMV0gPT09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmIChBcnJheS5pc0FycmF5KGNvb3JkaW5hdGVzWzBdKSAmJiBjb29yZGluYXRlc1swXS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGNvbnRhaW5zTnVtYmVyKGNvb3JkaW5hdGVzWzBdKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjb29yZGluYXRlcyBtdXN0IG9ubHkgY29udGFpbiBudW1iZXJzJyk7XG59XG5cbi8qKlxuICogRW5mb3JjZSBleHBlY3RhdGlvbnMgYWJvdXQgdHlwZXMgb2YgR2VvSlNPTiBvYmplY3RzIGZvciBUdXJmLlxuICpcbiAqIEBuYW1lIGdlb2pzb25UeXBlXG4gKiBAcGFyYW0ge0dlb0pTT059IHZhbHVlIGFueSBHZW9KU09OIG9iamVjdFxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgZXhwZWN0ZWQgR2VvSlNPTiB0eXBlXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBuYW1lIG9mIGNhbGxpbmcgZnVuY3Rpb25cbiAqIEB0aHJvd3Mge0Vycm9yfSBpZiB2YWx1ZSBpcyBub3QgdGhlIGV4cGVjdGVkIHR5cGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW9qc29uVHlwZSh2YWx1ZSwgdHlwZSwgbmFtZSkge1xuICAgIGlmICghdHlwZSB8fCAhbmFtZSkgdGhyb3cgbmV3IEVycm9yKCd0eXBlIGFuZCBuYW1lIHJlcXVpcmVkJyk7XG5cbiAgICBpZiAoIXZhbHVlIHx8IHZhbHVlLnR5cGUgIT09IHR5cGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGlucHV0IHRvICcgKyBuYW1lICsgJzogbXVzdCBiZSBhICcgKyB0eXBlICsgJywgZ2l2ZW4gJyArIHZhbHVlLnR5cGUpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBFbmZvcmNlIGV4cGVjdGF0aW9ucyBhYm91dCB0eXBlcyBvZiB7QGxpbmsgRmVhdHVyZX0gaW5wdXRzIGZvciBUdXJmLlxuICogSW50ZXJuYWxseSB0aGlzIHVzZXMge0BsaW5rIGdlb2pzb25UeXBlfSB0byBqdWRnZSBnZW9tZXRyeSB0eXBlcy5cbiAqXG4gKiBAbmFtZSBmZWF0dXJlT2ZcbiAqIEBwYXJhbSB7RmVhdHVyZX0gZmVhdHVyZSBhIGZlYXR1cmUgd2l0aCBhbiBleHBlY3RlZCBnZW9tZXRyeSB0eXBlXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBleHBlY3RlZCBHZW9KU09OIHR5cGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWUgb2YgY2FsbGluZyBmdW5jdGlvblxuICogQHRocm93cyB7RXJyb3J9IGVycm9yIGlmIHZhbHVlIGlzIG5vdCB0aGUgZXhwZWN0ZWQgdHlwZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZlYXR1cmVPZihmZWF0dXJlLCB0eXBlLCBuYW1lKSB7XG4gICAgaWYgKCFmZWF0dXJlKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGZlYXR1cmUgcGFzc2VkJyk7XG4gICAgaWYgKCFuYW1lKSB0aHJvdyBuZXcgRXJyb3IoJy5mZWF0dXJlT2YoKSByZXF1aXJlcyBhIG5hbWUnKTtcbiAgICBpZiAoIWZlYXR1cmUgfHwgZmVhdHVyZS50eXBlICE9PSAnRmVhdHVyZScgfHwgIWZlYXR1cmUuZ2VvbWV0cnkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGlucHV0IHRvICcgKyBuYW1lICsgJywgRmVhdHVyZSB3aXRoIGdlb21ldHJ5IHJlcXVpcmVkJyk7XG4gICAgfVxuICAgIGlmICghZmVhdHVyZS5nZW9tZXRyeSB8fCBmZWF0dXJlLmdlb21ldHJ5LnR5cGUgIT09IHR5cGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGlucHV0IHRvICcgKyBuYW1lICsgJzogbXVzdCBiZSBhICcgKyB0eXBlICsgJywgZ2l2ZW4gJyArIGZlYXR1cmUuZ2VvbWV0cnkudHlwZSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEVuZm9yY2UgZXhwZWN0YXRpb25zIGFib3V0IHR5cGVzIG9mIHtAbGluayBGZWF0dXJlQ29sbGVjdGlvbn0gaW5wdXRzIGZvciBUdXJmLlxuICogSW50ZXJuYWxseSB0aGlzIHVzZXMge0BsaW5rIGdlb2pzb25UeXBlfSB0byBqdWRnZSBnZW9tZXRyeSB0eXBlcy5cbiAqXG4gKiBAbmFtZSBjb2xsZWN0aW9uT2ZcbiAqIEBwYXJhbSB7RmVhdHVyZUNvbGxlY3Rpb259IGZlYXR1cmVDb2xsZWN0aW9uIGEgRmVhdHVyZUNvbGxlY3Rpb24gZm9yIHdoaWNoIGZlYXR1cmVzIHdpbGwgYmUganVkZ2VkXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBleHBlY3RlZCBHZW9KU09OIHR5cGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWUgb2YgY2FsbGluZyBmdW5jdGlvblxuICogQHRocm93cyB7RXJyb3J9IGlmIHZhbHVlIGlzIG5vdCB0aGUgZXhwZWN0ZWQgdHlwZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbGxlY3Rpb25PZihmZWF0dXJlQ29sbGVjdGlvbiwgdHlwZSwgbmFtZSkge1xuICAgIGlmICghZmVhdHVyZUNvbGxlY3Rpb24pIHRocm93IG5ldyBFcnJvcignTm8gZmVhdHVyZUNvbGxlY3Rpb24gcGFzc2VkJyk7XG4gICAgaWYgKCFuYW1lKSB0aHJvdyBuZXcgRXJyb3IoJy5jb2xsZWN0aW9uT2YoKSByZXF1aXJlcyBhIG5hbWUnKTtcbiAgICBpZiAoIWZlYXR1cmVDb2xsZWN0aW9uIHx8IGZlYXR1cmVDb2xsZWN0aW9uLnR5cGUgIT09ICdGZWF0dXJlQ29sbGVjdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGlucHV0IHRvICcgKyBuYW1lICsgJywgRmVhdHVyZUNvbGxlY3Rpb24gcmVxdWlyZWQnKTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZmVhdHVyZSA9IGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzW2ldO1xuICAgICAgICBpZiAoIWZlYXR1cmUgfHwgZmVhdHVyZS50eXBlICE9PSAnRmVhdHVyZScgfHwgIWZlYXR1cmUuZ2VvbWV0cnkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBpbnB1dCB0byAnICsgbmFtZSArICcsIEZlYXR1cmUgd2l0aCBnZW9tZXRyeSByZXF1aXJlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZmVhdHVyZS5nZW9tZXRyeSB8fCBmZWF0dXJlLmdlb21ldHJ5LnR5cGUgIT09IHR5cGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBpbnB1dCB0byAnICsgbmFtZSArICc6IG11c3QgYmUgYSAnICsgdHlwZSArICcsIGdpdmVuICcgKyBmZWF0dXJlLmdlb21ldHJ5LnR5cGUpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEdldCBHZW9tZXRyeSBmcm9tIEZlYXR1cmUgb3IgR2VvbWV0cnkgT2JqZWN0XG4gKlxuICogQHBhcmFtIHtGZWF0dXJlfEdlb21ldHJ5fSBnZW9qc29uIEdlb0pTT04gRmVhdHVyZSBvciBHZW9tZXRyeSBPYmplY3RcbiAqIEByZXR1cm5zIHtHZW9tZXRyeXxudWxsfSBHZW9KU09OIEdlb21ldHJ5IE9iamVjdFxuICogQHRocm93cyB7RXJyb3J9IGlmIGdlb2pzb24gaXMgbm90IGEgRmVhdHVyZSBvciBHZW9tZXRyeSBPYmplY3RcbiAqIEBleGFtcGxlXG4gKiB2YXIgcG9pbnQgPSB7XG4gKiAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAqICAgXCJwcm9wZXJ0aWVzXCI6IHt9LFxuICogICBcImdlb21ldHJ5XCI6IHtcbiAqICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICogICAgIFwiY29vcmRpbmF0ZXNcIjogWzExMCwgNDBdXG4gKiAgIH1cbiAqIH1cbiAqIHZhciBnZW9tID0gdHVyZi5nZXRHZW9tKHBvaW50KVxuICogLy89e1widHlwZVwiOiBcIlBvaW50XCIsIFwiY29vcmRpbmF0ZXNcIjogWzExMCwgNDBdfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0R2VvbShnZW9qc29uKSB7XG4gICAgaWYgKCFnZW9qc29uKSB0aHJvdyBuZXcgRXJyb3IoJ2dlb2pzb24gaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAoZ2VvanNvbi5nZW9tZXRyeSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gZ2VvanNvbi5nZW9tZXRyeTtcbiAgICBpZiAoZ2VvanNvbi5jb29yZGluYXRlcyB8fCBnZW9qc29uLmdlb21ldHJpZXMpIHJldHVybiBnZW9qc29uO1xuICAgIHRocm93IG5ldyBFcnJvcignZ2VvanNvbiBtdXN0IGJlIGEgdmFsaWQgRmVhdHVyZSBvciBHZW9tZXRyeSBPYmplY3QnKTtcbn1cblxuLyoqXG4gKiBHZXQgR2VvbWV0cnkgVHlwZSBmcm9tIEZlYXR1cmUgb3IgR2VvbWV0cnkgT2JqZWN0XG4gKlxuICogQHRocm93cyB7RXJyb3J9ICoqREVQUkVDQVRFRCoqIGluIHY1LjAuMCBpbiBmYXZvciBvZiBnZXRUeXBlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRHZW9tVHlwZSgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFyaWFudC5nZXRHZW9tVHlwZSBoYXMgYmVlbiBkZXByZWNhdGVkIGluIHY1LjAgaW4gZmF2b3Igb2YgaW52YXJpYW50LmdldFR5cGUnKTtcbn1cblxuLyoqXG4gKiBHZXQgR2VvSlNPTiBvYmplY3QncyB0eXBlLCBHZW9tZXRyeSB0eXBlIGlzIHByaW9yaXRpemUuXG4gKlxuICogQHBhcmFtIHtHZW9KU09OfSBnZW9qc29uIEdlb0pTT04gb2JqZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gW25hbWVdIG5hbWUgb2YgdGhlIHZhcmlhYmxlIHRvIGRpc3BsYXkgaW4gZXJyb3IgbWVzc2FnZVxuICogQHJldHVybnMge3N0cmluZ30gR2VvSlNPTiB0eXBlXG4gKiBAZXhhbXBsZVxuICogdmFyIHBvaW50ID0ge1xuICogICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gKiAgIFwicHJvcGVydGllc1wiOiB7fSxcbiAqICAgXCJnZW9tZXRyeVwiOiB7XG4gKiAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAqICAgICBcImNvb3JkaW5hdGVzXCI6IFsxMTAsIDQwXVxuICogICB9XG4gKiB9XG4gKiB2YXIgZ2VvbSA9IHR1cmYuZ2V0VHlwZShwb2ludClcbiAqIC8vPVwiUG9pbnRcIlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHlwZShnZW9qc29uLCBuYW1lKSB7XG4gICAgaWYgKCFnZW9qc29uKSB0aHJvdyBuZXcgRXJyb3IoKG5hbWUgfHwgJ2dlb2pzb24nKSArICcgaXMgcmVxdWlyZWQnKTtcbiAgICAvLyBHZW9KU09OIEZlYXR1cmUgJiBHZW9tZXRyeUNvbGxlY3Rpb25cbiAgICBpZiAoZ2VvanNvbi5nZW9tZXRyeSAmJiBnZW9qc29uLmdlb21ldHJ5LnR5cGUpIHJldHVybiBnZW9qc29uLmdlb21ldHJ5LnR5cGU7XG4gICAgLy8gR2VvSlNPTiBHZW9tZXRyeSAmIEZlYXR1cmVDb2xsZWN0aW9uXG4gICAgaWYgKGdlb2pzb24udHlwZSkgcmV0dXJuIGdlb2pzb24udHlwZTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoKG5hbWUgfHwgJ2dlb2pzb24nKSArICcgaXMgaW52YWxpZCcpO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQHR1cmYvaW52YXJpYW50L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIFdyYXBzIGEgR2VvSlNPTiB7QGxpbmsgR2VvbWV0cnl9IGluIGEgR2VvSlNPTiB7QGxpbmsgRmVhdHVyZX0uXG4gKlxuICogQG5hbWUgZmVhdHVyZVxuICogQHBhcmFtIHtHZW9tZXRyeX0gZ2VvbWV0cnkgaW5wdXQgZ2VvbWV0cnlcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV0gYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlfSBhIEdlb0pTT04gRmVhdHVyZVxuICogQGV4YW1wbGVcbiAqIHZhciBnZW9tZXRyeSA9IHtcbiAqICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAqICAgXCJjb29yZGluYXRlc1wiOiBbMTEwLCA1MF1cbiAqIH07XG4gKlxuICogdmFyIGZlYXR1cmUgPSB0dXJmLmZlYXR1cmUoZ2VvbWV0cnkpO1xuICpcbiAqIC8vPWZlYXR1cmVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZlYXR1cmUoZ2VvbWV0cnksIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKGdlb21ldHJ5ID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcignZ2VvbWV0cnkgaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAocHJvcGVydGllcyAmJiBwcm9wZXJ0aWVzLmNvbnN0cnVjdG9yICE9PSBPYmplY3QpIHRocm93IG5ldyBFcnJvcigncHJvcGVydGllcyBtdXN0IGJlIGFuIE9iamVjdCcpO1xuICAgIGlmIChiYm94ICYmIGJib3gubGVuZ3RoICE9PSA0KSB0aHJvdyBuZXcgRXJyb3IoJ2Jib3ggbXVzdCBiZSBhbiBBcnJheSBvZiA0IG51bWJlcnMnKTtcbiAgICBpZiAoaWQgJiYgWydzdHJpbmcnLCAnbnVtYmVyJ10uaW5kZXhPZih0eXBlb2YgaWQpID09PSAtMSkgdGhyb3cgbmV3IEVycm9yKCdpZCBtdXN0IGJlIGEgbnVtYmVyIG9yIGEgc3RyaW5nJyk7XG5cbiAgICB2YXIgZmVhdCA9IHt0eXBlOiAnRmVhdHVyZSd9O1xuICAgIGlmIChpZCkgZmVhdC5pZCA9IGlkO1xuICAgIGlmIChiYm94KSBmZWF0LmJib3ggPSBiYm94O1xuICAgIGZlYXQucHJvcGVydGllcyA9IHByb3BlcnRpZXMgfHwge307XG4gICAgZmVhdC5nZW9tZXRyeSA9IGdlb21ldHJ5O1xuICAgIHJldHVybiBmZWF0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBHZW9KU09OIHtAbGluayBHZW9tZXRyeX0gZnJvbSBhIEdlb21ldHJ5IHN0cmluZyB0eXBlICYgY29vcmRpbmF0ZXMuXG4gKiBGb3IgR2VvbWV0cnlDb2xsZWN0aW9uIHR5cGUgdXNlIGBoZWxwZXJzLmdlb21ldHJ5Q29sbGVjdGlvbmBcbiAqXG4gKiBAbmFtZSBnZW9tZXRyeVxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgR2VvbWV0cnkgVHlwZVxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBjb29yZGluYXRlcyBDb29yZGluYXRlc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHJldHVybnMge0dlb21ldHJ5fSBhIEdlb0pTT04gR2VvbWV0cnlcbiAqIEBleGFtcGxlXG4gKiB2YXIgdHlwZSA9ICdQb2ludCc7XG4gKiB2YXIgY29vcmRpbmF0ZXMgPSBbMTEwLCA1MF07XG4gKlxuICogdmFyIGdlb21ldHJ5ID0gdHVyZi5nZW9tZXRyeSh0eXBlLCBjb29yZGluYXRlcyk7XG4gKlxuICogLy89Z2VvbWV0cnlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlb21ldHJ5KHR5cGUsIGNvb3JkaW5hdGVzLCBiYm94KSB7XG4gICAgLy8gVmFsaWRhdGlvblxuICAgIGlmICghdHlwZSkgdGhyb3cgbmV3IEVycm9yKCd0eXBlIGlzIHJlcXVpcmVkJyk7XG4gICAgaWYgKCFjb29yZGluYXRlcykgdGhyb3cgbmV3IEVycm9yKCdjb29yZGluYXRlcyBpcyByZXF1aXJlZCcpO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShjb29yZGluYXRlcykpIHRocm93IG5ldyBFcnJvcignY29vcmRpbmF0ZXMgbXVzdCBiZSBhbiBBcnJheScpO1xuICAgIGlmIChiYm94ICYmIGJib3gubGVuZ3RoICE9PSA0KSB0aHJvdyBuZXcgRXJyb3IoJ2Jib3ggbXVzdCBiZSBhbiBBcnJheSBvZiA0IG51bWJlcnMnKTtcblxuICAgIHZhciBnZW9tO1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ1BvaW50JzogZ2VvbSA9IHBvaW50KGNvb3JkaW5hdGVzKS5nZW9tZXRyeTsgYnJlYWs7XG4gICAgY2FzZSAnTGluZVN0cmluZyc6IGdlb20gPSBsaW5lU3RyaW5nKGNvb3JkaW5hdGVzKS5nZW9tZXRyeTsgYnJlYWs7XG4gICAgY2FzZSAnUG9seWdvbic6IGdlb20gPSBwb2x5Z29uKGNvb3JkaW5hdGVzKS5nZW9tZXRyeTsgYnJlYWs7XG4gICAgY2FzZSAnTXVsdGlQb2ludCc6IGdlb20gPSBtdWx0aVBvaW50KGNvb3JkaW5hdGVzKS5nZW9tZXRyeTsgYnJlYWs7XG4gICAgY2FzZSAnTXVsdGlMaW5lU3RyaW5nJzogZ2VvbSA9IG11bHRpTGluZVN0cmluZyhjb29yZGluYXRlcykuZ2VvbWV0cnk7IGJyZWFrO1xuICAgIGNhc2UgJ011bHRpUG9seWdvbic6IGdlb20gPSBtdWx0aVBvbHlnb24oY29vcmRpbmF0ZXMpLmdlb21ldHJ5OyBicmVhaztcbiAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IodHlwZSArICcgaXMgaW52YWxpZCcpO1xuICAgIH1cbiAgICBpZiAoYmJveCkgZ2VvbS5iYm94ID0gYmJveDtcbiAgICByZXR1cm4gZ2VvbTtcbn1cblxuLyoqXG4gKiBUYWtlcyBjb29yZGluYXRlcyBhbmQgcHJvcGVydGllcyAob3B0aW9uYWwpIGFuZCByZXR1cm5zIGEgbmV3IHtAbGluayBQb2ludH0gZmVhdHVyZS5cbiAqXG4gKiBAbmFtZSBwb2ludFxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBjb29yZGluYXRlcyBsb25naXR1ZGUsIGxhdGl0dWRlIHBvc2l0aW9uIChlYWNoIGluIGRlY2ltYWwgZGVncmVlcylcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV0gYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlPFBvaW50Pn0gYSBQb2ludCBmZWF0dXJlXG4gKiBAZXhhbXBsZVxuICogdmFyIHBvaW50ID0gdHVyZi5wb2ludChbLTc1LjM0MywgMzkuOTg0XSk7XG4gKlxuICogLy89cG9pbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBvaW50KGNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzLCBiYm94LCBpZCkge1xuICAgIGlmICghY29vcmRpbmF0ZXMpIHRocm93IG5ldyBFcnJvcignTm8gY29vcmRpbmF0ZXMgcGFzc2VkJyk7XG4gICAgaWYgKGNvb3JkaW5hdGVzLmxlbmd0aCA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoJ0Nvb3JkaW5hdGVzIG11c3QgYmUgYW4gYXJyYXknKTtcbiAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoIDwgMikgdGhyb3cgbmV3IEVycm9yKCdDb29yZGluYXRlcyBtdXN0IGJlIGF0IGxlYXN0IDIgbnVtYmVycyBsb25nJyk7XG4gICAgaWYgKCFpc051bWJlcihjb29yZGluYXRlc1swXSkgfHwgIWlzTnVtYmVyKGNvb3JkaW5hdGVzWzFdKSkgdGhyb3cgbmV3IEVycm9yKCdDb29yZGluYXRlcyBtdXN0IGNvbnRhaW4gbnVtYmVycycpO1xuXG4gICAgcmV0dXJuIGZlYXR1cmUoe1xuICAgICAgICB0eXBlOiAnUG9pbnQnLFxuICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXNcbiAgICB9LCBwcm9wZXJ0aWVzLCBiYm94LCBpZCk7XG59XG5cbi8qKlxuICogVGFrZXMgYW4gYXJyYXkgb2YgTGluZWFyUmluZ3MgYW5kIG9wdGlvbmFsbHkgYW4ge0BsaW5rIE9iamVjdH0gd2l0aCBwcm9wZXJ0aWVzIGFuZCByZXR1cm5zIGEge0BsaW5rIFBvbHlnb259IGZlYXR1cmUuXG4gKlxuICogQG5hbWUgcG9seWdvblxuICogQHBhcmFtIHtBcnJheTxBcnJheTxBcnJheTxudW1iZXI+Pj59IGNvb3JkaW5hdGVzIGFuIGFycmF5IG9mIExpbmVhclJpbmdzXG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2lkXSBJZGVudGlmaWVyXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxQb2x5Z29uPn0gYSBQb2x5Z29uIGZlYXR1cmVcbiAqIEB0aHJvd3Mge0Vycm9yfSB0aHJvdyBhbiBlcnJvciBpZiBhIExpbmVhclJpbmcgb2YgdGhlIHBvbHlnb24gaGFzIHRvbyBmZXcgcG9zaXRpb25zXG4gKiBvciBpZiBhIExpbmVhclJpbmcgb2YgdGhlIFBvbHlnb24gZG9lcyBub3QgaGF2ZSBtYXRjaGluZyBQb3NpdGlvbnMgYXQgdGhlIGJlZ2lubmluZyAmIGVuZC5cbiAqIEBleGFtcGxlXG4gKiB2YXIgcG9seWdvbiA9IHR1cmYucG9seWdvbihbW1xuICogICBbLTIuMjc1NTQzLCA1My40NjQ1NDddLFxuICogICBbLTIuMjc1NTQzLCA1My40ODkyNzFdLFxuICogICBbLTIuMjE1MTE4LCA1My40ODkyNzFdLFxuICogICBbLTIuMjE1MTE4LCA1My40NjQ1NDddLFxuICogICBbLTIuMjc1NTQzLCA1My40NjQ1NDddXG4gKiBdXSwgeyBuYW1lOiAncG9seTEnLCBwb3B1bGF0aW9uOiA0MDB9KTtcbiAqXG4gKiAvLz1wb2x5Z29uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwb2x5Z29uKGNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzLCBiYm94LCBpZCkge1xuICAgIGlmICghY29vcmRpbmF0ZXMpIHRocm93IG5ldyBFcnJvcignTm8gY29vcmRpbmF0ZXMgcGFzc2VkJyk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3JkaW5hdGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciByaW5nID0gY29vcmRpbmF0ZXNbaV07XG4gICAgICAgIGlmIChyaW5nLmxlbmd0aCA8IDQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRWFjaCBMaW5lYXJSaW5nIG9mIGEgUG9seWdvbiBtdXN0IGhhdmUgNCBvciBtb3JlIFBvc2l0aW9ucy4nKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJpbmdbcmluZy5sZW5ndGggLSAxXS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgZmlyc3QgcG9pbnQgb2YgUG9seWdvbiBjb250YWlucyB0d28gbnVtYmVyc1xuICAgICAgICAgICAgaWYgKGkgPT09IDAgJiYgaiA9PT0gMCAmJiAhaXNOdW1iZXIocmluZ1swXVswXSkgfHwgIWlzTnVtYmVyKHJpbmdbMF1bMV0pKSB0aHJvdyBuZXcgRXJyb3IoJ0Nvb3JkaW5hdGVzIG11c3QgY29udGFpbiBudW1iZXJzJyk7XG4gICAgICAgICAgICBpZiAocmluZ1tyaW5nLmxlbmd0aCAtIDFdW2pdICE9PSByaW5nWzBdW2pdKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhbmQgbGFzdCBQb3NpdGlvbiBhcmUgbm90IGVxdWl2YWxlbnQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmVhdHVyZSh7XG4gICAgICAgIHR5cGU6ICdQb2x5Z29uJyxcbiAgICAgICAgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzXG4gICAgfSwgcHJvcGVydGllcywgYmJveCwgaWQpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgTGluZVN0cmluZ30gYmFzZWQgb24gYVxuICogY29vcmRpbmF0ZSBhcnJheS4gUHJvcGVydGllcyBjYW4gYmUgYWRkZWQgb3B0aW9uYWxseS5cbiAqXG4gKiBAbmFtZSBsaW5lU3RyaW5nXG4gKiBAcGFyYW0ge0FycmF5PEFycmF5PG51bWJlcj4+fSBjb29yZGluYXRlcyBhbiBhcnJheSBvZiBQb3NpdGlvbnNcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV0gYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlPExpbmVTdHJpbmc+fSBhIExpbmVTdHJpbmcgZmVhdHVyZVxuICogQHRocm93cyB7RXJyb3J9IGlmIG5vIGNvb3JkaW5hdGVzIGFyZSBwYXNzZWRcbiAqIEBleGFtcGxlXG4gKiB2YXIgbGluZXN0cmluZzEgPSB0dXJmLmxpbmVTdHJpbmcoW1xuICogICBbLTIxLjk2NDQxNiwgNjQuMTQ4MjAzXSxcbiAqICAgWy0yMS45NTYxNzYsIDY0LjE0MTMxNl0sXG4gKiAgIFstMjEuOTM5MDEsIDY0LjEzNTkyNF0sXG4gKiAgIFstMjEuOTI3MzM3LCA2NC4xMzY2NzNdXG4gKiBdKTtcbiAqIHZhciBsaW5lc3RyaW5nMiA9IHR1cmYubGluZVN0cmluZyhbXG4gKiAgIFstMjEuOTI5MDU0LCA2NC4xMjc5ODVdLFxuICogICBbLTIxLjkxMjkxOCwgNjQuMTM0NzI2XSxcbiAqICAgWy0yMS45MTYwMDcsIDY0LjE0MTAxNl0sXG4gKiAgIFstMjEuOTMwMDg0LCA2NC4xNDQ0Nl1cbiAqIF0sIHtuYW1lOiAnbGluZSAxJywgZGlzdGFuY2U6IDE0NX0pO1xuICpcbiAqIC8vPWxpbmVzdHJpbmcxXG4gKlxuICogLy89bGluZXN0cmluZzJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpbmVTdHJpbmcoY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFjb29yZGluYXRlcykgdGhyb3cgbmV3IEVycm9yKCdObyBjb29yZGluYXRlcyBwYXNzZWQnKTtcbiAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoIDwgMikgdGhyb3cgbmV3IEVycm9yKCdDb29yZGluYXRlcyBtdXN0IGJlIGFuIGFycmF5IG9mIHR3byBvciBtb3JlIHBvc2l0aW9ucycpO1xuICAgIC8vIENoZWNrIGlmIGZpcnN0IHBvaW50IG9mIExpbmVTdHJpbmcgY29udGFpbnMgdHdvIG51bWJlcnNcbiAgICBpZiAoIWlzTnVtYmVyKGNvb3JkaW5hdGVzWzBdWzFdKSB8fCAhaXNOdW1iZXIoY29vcmRpbmF0ZXNbMF1bMV0pKSB0aHJvdyBuZXcgRXJyb3IoJ0Nvb3JkaW5hdGVzIG11c3QgY29udGFpbiBudW1iZXJzJyk7XG5cbiAgICByZXR1cm4gZmVhdHVyZSh7XG4gICAgICAgIHR5cGU6ICdMaW5lU3RyaW5nJyxcbiAgICAgICAgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzXG4gICAgfSwgcHJvcGVydGllcywgYmJveCwgaWQpO1xufVxuXG4vKipcbiAqIFRha2VzIG9uZSBvciBtb3JlIHtAbGluayBGZWF0dXJlfEZlYXR1cmVzfSBhbmQgY3JlYXRlcyBhIHtAbGluayBGZWF0dXJlQ29sbGVjdGlvbn0uXG4gKlxuICogQG5hbWUgZmVhdHVyZUNvbGxlY3Rpb25cbiAqIEBwYXJhbSB7RmVhdHVyZVtdfSBmZWF0dXJlcyBpbnB1dCBmZWF0dXJlc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlQ29sbGVjdGlvbn0gYSBGZWF0dXJlQ29sbGVjdGlvbiBvZiBpbnB1dCBmZWF0dXJlc1xuICogQGV4YW1wbGVcbiAqIHZhciBmZWF0dXJlcyA9IFtcbiAqICB0dXJmLnBvaW50KFstNzUuMzQzLCAzOS45ODRdLCB7bmFtZTogJ0xvY2F0aW9uIEEnfSksXG4gKiAgdHVyZi5wb2ludChbLTc1LjgzMywgMzkuMjg0XSwge25hbWU6ICdMb2NhdGlvbiBCJ30pLFxuICogIHR1cmYucG9pbnQoWy03NS41MzQsIDM5LjEyM10sIHtuYW1lOiAnTG9jYXRpb24gQyd9KVxuICogXTtcbiAqXG4gKiB2YXIgY29sbGVjdGlvbiA9IHR1cmYuZmVhdHVyZUNvbGxlY3Rpb24oZmVhdHVyZXMpO1xuICpcbiAqIC8vPWNvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZlYXR1cmVDb2xsZWN0aW9uKGZlYXR1cmVzLCBiYm94LCBpZCkge1xuICAgIGlmICghZmVhdHVyZXMpIHRocm93IG5ldyBFcnJvcignTm8gZmVhdHVyZXMgcGFzc2VkJyk7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGZlYXR1cmVzKSkgdGhyb3cgbmV3IEVycm9yKCdmZWF0dXJlcyBtdXN0IGJlIGFuIEFycmF5Jyk7XG4gICAgaWYgKGJib3ggJiYgYmJveC5sZW5ndGggIT09IDQpIHRocm93IG5ldyBFcnJvcignYmJveCBtdXN0IGJlIGFuIEFycmF5IG9mIDQgbnVtYmVycycpO1xuICAgIGlmIChpZCAmJiBbJ3N0cmluZycsICdudW1iZXInXS5pbmRleE9mKHR5cGVvZiBpZCkgPT09IC0xKSB0aHJvdyBuZXcgRXJyb3IoJ2lkIG11c3QgYmUgYSBudW1iZXIgb3IgYSBzdHJpbmcnKTtcblxuICAgIHZhciBmYyA9IHt0eXBlOiAnRmVhdHVyZUNvbGxlY3Rpb24nfTtcbiAgICBpZiAoaWQpIGZjLmlkID0gaWQ7XG4gICAgaWYgKGJib3gpIGZjLmJib3ggPSBiYm94O1xuICAgIGZjLmZlYXR1cmVzID0gZmVhdHVyZXM7XG4gICAgcmV0dXJuIGZjO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgRmVhdHVyZTxNdWx0aUxpbmVTdHJpbmc+fSBiYXNlZCBvbiBhXG4gKiBjb29yZGluYXRlIGFycmF5LiBQcm9wZXJ0aWVzIGNhbiBiZSBhZGRlZCBvcHRpb25hbGx5LlxuICpcbiAqIEBuYW1lIG11bHRpTGluZVN0cmluZ1xuICogQHBhcmFtIHtBcnJheTxBcnJheTxBcnJheTxudW1iZXI+Pj59IGNvb3JkaW5hdGVzIGFuIGFycmF5IG9mIExpbmVTdHJpbmdzXG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2lkXSBJZGVudGlmaWVyXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxNdWx0aUxpbmVTdHJpbmc+fSBhIE11bHRpTGluZVN0cmluZyBmZWF0dXJlXG4gKiBAdGhyb3dzIHtFcnJvcn0gaWYgbm8gY29vcmRpbmF0ZXMgYXJlIHBhc3NlZFxuICogQGV4YW1wbGVcbiAqIHZhciBtdWx0aUxpbmUgPSB0dXJmLm11bHRpTGluZVN0cmluZyhbW1swLDBdLFsxMCwxMF1dXSk7XG4gKlxuICogLy89bXVsdGlMaW5lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aUxpbmVTdHJpbmcoY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFjb29yZGluYXRlcykgdGhyb3cgbmV3IEVycm9yKCdObyBjb29yZGluYXRlcyBwYXNzZWQnKTtcblxuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ011bHRpTGluZVN0cmluZycsXG4gICAgICAgIGNvb3JkaW5hdGVzOiBjb29yZGluYXRlc1xuICAgIH0sIHByb3BlcnRpZXMsIGJib3gsIGlkKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEge0BsaW5rIEZlYXR1cmU8TXVsdGlQb2ludD59IGJhc2VkIG9uIGFcbiAqIGNvb3JkaW5hdGUgYXJyYXkuIFByb3BlcnRpZXMgY2FuIGJlIGFkZGVkIG9wdGlvbmFsbHkuXG4gKlxuICogQG5hbWUgbXVsdGlQb2ludFxuICogQHBhcmFtIHtBcnJheTxBcnJheTxudW1iZXI+Pn0gY29vcmRpbmF0ZXMgYW4gYXJyYXkgb2YgUG9zaXRpb25zXG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2lkXSBJZGVudGlmaWVyXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxNdWx0aVBvaW50Pn0gYSBNdWx0aVBvaW50IGZlYXR1cmVcbiAqIEB0aHJvd3Mge0Vycm9yfSBpZiBubyBjb29yZGluYXRlcyBhcmUgcGFzc2VkXG4gKiBAZXhhbXBsZVxuICogdmFyIG11bHRpUHQgPSB0dXJmLm11bHRpUG9pbnQoW1swLDBdLFsxMCwxMF1dKTtcbiAqXG4gKiAvLz1tdWx0aVB0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aVBvaW50KGNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzLCBiYm94LCBpZCkge1xuICAgIGlmICghY29vcmRpbmF0ZXMpIHRocm93IG5ldyBFcnJvcignTm8gY29vcmRpbmF0ZXMgcGFzc2VkJyk7XG5cbiAgICByZXR1cm4gZmVhdHVyZSh7XG4gICAgICAgIHR5cGU6ICdNdWx0aVBvaW50JyxcbiAgICAgICAgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzXG4gICAgfSwgcHJvcGVydGllcywgYmJveCwgaWQpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgRmVhdHVyZTxNdWx0aVBvbHlnb24+fSBiYXNlZCBvbiBhXG4gKiBjb29yZGluYXRlIGFycmF5LiBQcm9wZXJ0aWVzIGNhbiBiZSBhZGRlZCBvcHRpb25hbGx5LlxuICpcbiAqIEBuYW1lIG11bHRpUG9seWdvblxuICogQHBhcmFtIHtBcnJheTxBcnJheTxBcnJheTxBcnJheTxudW1iZXI+Pj4+fSBjb29yZGluYXRlcyBhbiBhcnJheSBvZiBQb2x5Z29uc1xuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtpZF0gSWRlbnRpZmllclxuICogQHJldHVybnMge0ZlYXR1cmU8TXVsdGlQb2x5Z29uPn0gYSBtdWx0aXBvbHlnb24gZmVhdHVyZVxuICogQHRocm93cyB7RXJyb3J9IGlmIG5vIGNvb3JkaW5hdGVzIGFyZSBwYXNzZWRcbiAqIEBleGFtcGxlXG4gKiB2YXIgbXVsdGlQb2x5ID0gdHVyZi5tdWx0aVBvbHlnb24oW1tbWzAsMF0sWzAsMTBdLFsxMCwxMF0sWzEwLDBdLFswLDBdXV1dKTtcbiAqXG4gKiAvLz1tdWx0aVBvbHlcbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aVBvbHlnb24oY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFjb29yZGluYXRlcykgdGhyb3cgbmV3IEVycm9yKCdObyBjb29yZGluYXRlcyBwYXNzZWQnKTtcblxuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ011bHRpUG9seWdvbicsXG4gICAgICAgIGNvb3JkaW5hdGVzOiBjb29yZGluYXRlc1xuICAgIH0sIHByb3BlcnRpZXMsIGJib3gsIGlkKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEge0BsaW5rIEZlYXR1cmU8R2VvbWV0cnlDb2xsZWN0aW9uPn0gYmFzZWQgb24gYVxuICogY29vcmRpbmF0ZSBhcnJheS4gUHJvcGVydGllcyBjYW4gYmUgYWRkZWQgb3B0aW9uYWxseS5cbiAqXG4gKiBAbmFtZSBnZW9tZXRyeUNvbGxlY3Rpb25cbiAqIEBwYXJhbSB7QXJyYXk8R2VvbWV0cnk+fSBnZW9tZXRyaWVzIGFuIGFycmF5IG9mIEdlb0pTT04gR2VvbWV0cmllc1xuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtpZF0gSWRlbnRpZmllclxuICogQHJldHVybnMge0ZlYXR1cmU8R2VvbWV0cnlDb2xsZWN0aW9uPn0gYSBHZW9KU09OIEdlb21ldHJ5Q29sbGVjdGlvbiBGZWF0dXJlXG4gKiBAZXhhbXBsZVxuICogdmFyIHB0ID0ge1xuICogICAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gKiAgICAgICBcImNvb3JkaW5hdGVzXCI6IFsxMDAsIDBdXG4gKiAgICAgfTtcbiAqIHZhciBsaW5lID0ge1xuICogICAgIFwidHlwZVwiOiBcIkxpbmVTdHJpbmdcIixcbiAqICAgICBcImNvb3JkaW5hdGVzXCI6IFsgWzEwMSwgMF0sIFsxMDIsIDFdIF1cbiAqICAgfTtcbiAqIHZhciBjb2xsZWN0aW9uID0gdHVyZi5nZW9tZXRyeUNvbGxlY3Rpb24oW3B0LCBsaW5lXSk7XG4gKlxuICogLy89Y29sbGVjdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VvbWV0cnlDb2xsZWN0aW9uKGdlb21ldHJpZXMsIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFnZW9tZXRyaWVzKSB0aHJvdyBuZXcgRXJyb3IoJ2dlb21ldHJpZXMgaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZ2VvbWV0cmllcykpIHRocm93IG5ldyBFcnJvcignZ2VvbWV0cmllcyBtdXN0IGJlIGFuIEFycmF5Jyk7XG5cbiAgICByZXR1cm4gZmVhdHVyZSh7XG4gICAgICAgIHR5cGU6ICdHZW9tZXRyeUNvbGxlY3Rpb24nLFxuICAgICAgICBnZW9tZXRyaWVzOiBnZW9tZXRyaWVzXG4gICAgfSwgcHJvcGVydGllcywgYmJveCwgaWQpO1xufVxuXG4vLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9HcmVhdC1jaXJjbGVfZGlzdGFuY2UjUmFkaXVzX2Zvcl9zcGhlcmljYWxfRWFydGhcbnZhciBmYWN0b3JzID0ge1xuICAgIG1pbGVzOiAzOTYwLFxuICAgIG5hdXRpY2FsbWlsZXM6IDM0NDEuMTQ1LFxuICAgIGRlZ3JlZXM6IDU3LjI5NTc3OTUsXG4gICAgcmFkaWFuczogMSxcbiAgICBpbmNoZXM6IDI1MDkwNTYwMCxcbiAgICB5YXJkczogNjk2OTYwMCxcbiAgICBtZXRlcnM6IDYzNzMwMDAsXG4gICAgbWV0cmVzOiA2MzczMDAwLFxuICAgIGNlbnRpbWV0ZXJzOiA2LjM3M2UrOCxcbiAgICBjZW50aW1ldHJlczogNi4zNzNlKzgsXG4gICAga2lsb21ldGVyczogNjM3MyxcbiAgICBraWxvbWV0cmVzOiA2MzczLFxuICAgIGZlZXQ6IDIwOTA4NzkyLjY1XG59O1xuXG52YXIgYXJlYUZhY3RvcnMgPSB7XG4gICAga2lsb21ldGVyczogMC4wMDAwMDEsXG4gICAga2lsb21ldHJlczogMC4wMDAwMDEsXG4gICAgbWV0ZXJzOiAxLFxuICAgIG1ldHJlczogMSxcbiAgICBjZW50aW1ldHJlczogMTAwMDAsXG4gICAgbWlsbGltZXRlcjogMTAwMDAwMCxcbiAgICBhY3JlczogMC4wMDAyNDcxMDUsXG4gICAgbWlsZXM6IDMuODZlLTcsXG4gICAgeWFyZHM6IDEuMTk1OTkwMDQ2LFxuICAgIGZlZXQ6IDEwLjc2MzkxMDQxNyxcbiAgICBpbmNoZXM6IDE1NTAuMDAzMTAwMDA2XG59O1xuXG4vKipcbiAqIFJvdW5kIG51bWJlciB0byBwcmVjaXNpb25cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gbnVtIE51bWJlclxuICogQHBhcmFtIHtudW1iZXJ9IFtwcmVjaXNpb249MF0gUHJlY2lzaW9uXG4gKiBAcmV0dXJucyB7bnVtYmVyfSByb3VuZGVkIG51bWJlclxuICogQGV4YW1wbGVcbiAqIHR1cmYucm91bmQoMTIwLjQzMjEpXG4gKiAvLz0xMjBcbiAqXG4gKiB0dXJmLnJvdW5kKDEyMC40MzIxLCAyKVxuICogLy89MTIwLjQzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3VuZChudW0sIHByZWNpc2lvbikge1xuICAgIGlmIChudW0gPT09IHVuZGVmaW5lZCB8fCBudW0gPT09IG51bGwgfHwgaXNOYU4obnVtKSkgdGhyb3cgbmV3IEVycm9yKCdudW0gaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAocHJlY2lzaW9uICYmICEocHJlY2lzaW9uID49IDApKSB0aHJvdyBuZXcgRXJyb3IoJ3ByZWNpc2lvbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gICAgdmFyIG11bHRpcGxpZXIgPSBNYXRoLnBvdygxMCwgcHJlY2lzaW9uIHx8IDApO1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG51bSAqIG11bHRpcGxpZXIpIC8gbXVsdGlwbGllcjtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgZGlzdGFuY2UgbWVhc3VyZW1lbnQgKGFzc3VtaW5nIGEgc3BoZXJpY2FsIEVhcnRoKSBmcm9tIHJhZGlhbnMgdG8gYSBtb3JlIGZyaWVuZGx5IHVuaXQuXG4gKiBWYWxpZCB1bml0czogbWlsZXMsIG5hdXRpY2FsbWlsZXMsIGluY2hlcywgeWFyZHMsIG1ldGVycywgbWV0cmVzLCBraWxvbWV0ZXJzLCBjZW50aW1ldGVycywgZmVldFxuICpcbiAqIEBuYW1lIHJhZGlhbnNUb0Rpc3RhbmNlXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkaWFucyBpbiByYWRpYW5zIGFjcm9zcyB0aGUgc3BoZXJlXG4gKiBAcGFyYW0ge3N0cmluZ30gW3VuaXRzPVwia2lsb21ldGVyc1wiXSBjYW4gYmUgZGVncmVlcywgcmFkaWFucywgbWlsZXMsIG9yIGtpbG9tZXRlcnMgaW5jaGVzLCB5YXJkcywgbWV0cmVzLCBtZXRlcnMsIGtpbG9tZXRyZXMsIGtpbG9tZXRlcnMuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBkaXN0YW5jZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmFkaWFuc1RvRGlzdGFuY2UocmFkaWFucywgdW5pdHMpIHtcbiAgICBpZiAocmFkaWFucyA9PT0gdW5kZWZpbmVkIHx8IHJhZGlhbnMgPT09IG51bGwpIHRocm93IG5ldyBFcnJvcigncmFkaWFucyBpcyByZXF1aXJlZCcpO1xuXG4gICAgaWYgKHVuaXRzICYmIHR5cGVvZiB1bml0cyAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcigndW5pdHMgbXVzdCBiZSBhIHN0cmluZycpO1xuICAgIHZhciBmYWN0b3IgPSBmYWN0b3JzW3VuaXRzIHx8ICdraWxvbWV0ZXJzJ107XG4gICAgaWYgKCFmYWN0b3IpIHRocm93IG5ldyBFcnJvcih1bml0cyArICcgdW5pdHMgaXMgaW52YWxpZCcpO1xuICAgIHJldHVybiByYWRpYW5zICogZmFjdG9yO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBkaXN0YW5jZSBtZWFzdXJlbWVudCAoYXNzdW1pbmcgYSBzcGhlcmljYWwgRWFydGgpIGZyb20gYSByZWFsLXdvcmxkIHVuaXQgaW50byByYWRpYW5zXG4gKiBWYWxpZCB1bml0czogbWlsZXMsIG5hdXRpY2FsbWlsZXMsIGluY2hlcywgeWFyZHMsIG1ldGVycywgbWV0cmVzLCBraWxvbWV0ZXJzLCBjZW50aW1ldGVycywgZmVldFxuICpcbiAqIEBuYW1lIGRpc3RhbmNlVG9SYWRpYW5zXG4gKiBAcGFyYW0ge251bWJlcn0gZGlzdGFuY2UgaW4gcmVhbCB1bml0c1xuICogQHBhcmFtIHtzdHJpbmd9IFt1bml0cz1raWxvbWV0ZXJzXSBjYW4gYmUgZGVncmVlcywgcmFkaWFucywgbWlsZXMsIG9yIGtpbG9tZXRlcnMgaW5jaGVzLCB5YXJkcywgbWV0cmVzLCBtZXRlcnMsIGtpbG9tZXRyZXMsIGtpbG9tZXRlcnMuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSByYWRpYW5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZVRvUmFkaWFucyhkaXN0YW5jZSwgdW5pdHMpIHtcbiAgICBpZiAoZGlzdGFuY2UgPT09IHVuZGVmaW5lZCB8fCBkaXN0YW5jZSA9PT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKCdkaXN0YW5jZSBpcyByZXF1aXJlZCcpO1xuXG4gICAgaWYgKHVuaXRzICYmIHR5cGVvZiB1bml0cyAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcigndW5pdHMgbXVzdCBiZSBhIHN0cmluZycpO1xuICAgIHZhciBmYWN0b3IgPSBmYWN0b3JzW3VuaXRzIHx8ICdraWxvbWV0ZXJzJ107XG4gICAgaWYgKCFmYWN0b3IpIHRocm93IG5ldyBFcnJvcih1bml0cyArICcgdW5pdHMgaXMgaW52YWxpZCcpO1xuICAgIHJldHVybiBkaXN0YW5jZSAvIGZhY3Rvcjtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgZGlzdGFuY2UgbWVhc3VyZW1lbnQgKGFzc3VtaW5nIGEgc3BoZXJpY2FsIEVhcnRoKSBmcm9tIGEgcmVhbC13b3JsZCB1bml0IGludG8gZGVncmVlc1xuICogVmFsaWQgdW5pdHM6IG1pbGVzLCBuYXV0aWNhbG1pbGVzLCBpbmNoZXMsIHlhcmRzLCBtZXRlcnMsIG1ldHJlcywgY2VudGltZXRlcnMsIGtpbG9tZXRyZXMsIGZlZXRcbiAqXG4gKiBAbmFtZSBkaXN0YW5jZVRvRGVncmVlc1xuICogQHBhcmFtIHtudW1iZXJ9IGRpc3RhbmNlIGluIHJlYWwgdW5pdHNcbiAqIEBwYXJhbSB7c3RyaW5nfSBbdW5pdHM9a2lsb21ldGVyc10gY2FuIGJlIGRlZ3JlZXMsIHJhZGlhbnMsIG1pbGVzLCBvciBraWxvbWV0ZXJzIGluY2hlcywgeWFyZHMsIG1ldHJlcywgbWV0ZXJzLCBraWxvbWV0cmVzLCBraWxvbWV0ZXJzLlxuICogQHJldHVybnMge251bWJlcn0gZGVncmVlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzdGFuY2VUb0RlZ3JlZXMoZGlzdGFuY2UsIHVuaXRzKSB7XG4gICAgcmV0dXJuIHJhZGlhbnMyZGVncmVlcyhkaXN0YW5jZVRvUmFkaWFucyhkaXN0YW5jZSwgdW5pdHMpKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhbnkgYmVhcmluZyBhbmdsZSBmcm9tIHRoZSBub3J0aCBsaW5lIGRpcmVjdGlvbiAocG9zaXRpdmUgY2xvY2t3aXNlKVxuICogYW5kIHJldHVybnMgYW4gYW5nbGUgYmV0d2VlbiAwLTM2MCBkZWdyZWVzIChwb3NpdGl2ZSBjbG9ja3dpc2UpLCAwIGJlaW5nIHRoZSBub3J0aCBsaW5lXG4gKlxuICogQG5hbWUgYmVhcmluZ1RvQW5nbGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBiZWFyaW5nIGFuZ2xlLCBiZXR3ZWVuIC0xODAgYW5kICsxODAgZGVncmVlc1xuICogQHJldHVybnMge251bWJlcn0gYW5nbGUgYmV0d2VlbiAwIGFuZCAzNjAgZGVncmVlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gYmVhcmluZ1RvQW5nbGUoYmVhcmluZykge1xuICAgIGlmIChiZWFyaW5nID09PSBudWxsIHx8IGJlYXJpbmcgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKCdiZWFyaW5nIGlzIHJlcXVpcmVkJyk7XG5cbiAgICB2YXIgYW5nbGUgPSBiZWFyaW5nICUgMzYwO1xuICAgIGlmIChhbmdsZSA8IDApIGFuZ2xlICs9IDM2MDtcbiAgICByZXR1cm4gYW5nbGU7XG59XG5cbi8qKlxuICogQ29udmVydHMgYW4gYW5nbGUgaW4gcmFkaWFucyB0byBkZWdyZWVzXG4gKlxuICogQG5hbWUgcmFkaWFuczJkZWdyZWVzXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkaWFucyBhbmdsZSBpbiByYWRpYW5zXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBkZWdyZWVzIGJldHdlZW4gMCBhbmQgMzYwIGRlZ3JlZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJhZGlhbnMyZGVncmVlcyhyYWRpYW5zKSB7XG4gICAgaWYgKHJhZGlhbnMgPT09IG51bGwgfHwgcmFkaWFucyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoJ3JhZGlhbnMgaXMgcmVxdWlyZWQnKTtcblxuICAgIHZhciBkZWdyZWVzID0gcmFkaWFucyAlICgyICogTWF0aC5QSSk7XG4gICAgcmV0dXJuIGRlZ3JlZXMgKiAxODAgLyBNYXRoLlBJO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGFuIGFuZ2xlIGluIGRlZ3JlZXMgdG8gcmFkaWFuc1xuICpcbiAqIEBuYW1lIGRlZ3JlZXMycmFkaWFuc1xuICogQHBhcmFtIHtudW1iZXJ9IGRlZ3JlZXMgYW5nbGUgYmV0d2VlbiAwIGFuZCAzNjAgZGVncmVlc1xuICogQHJldHVybnMge251bWJlcn0gYW5nbGUgaW4gcmFkaWFuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZGVncmVlczJyYWRpYW5zKGRlZ3JlZXMpIHtcbiAgICBpZiAoZGVncmVlcyA9PT0gbnVsbCB8fCBkZWdyZWVzID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcignZGVncmVlcyBpcyByZXF1aXJlZCcpO1xuXG4gICAgdmFyIHJhZGlhbnMgPSBkZWdyZWVzICUgMzYwO1xuICAgIHJldHVybiByYWRpYW5zICogTWF0aC5QSSAvIDE4MDtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIGRpc3RhbmNlIHRvIHRoZSByZXF1ZXN0ZWQgdW5pdC5cbiAqIFZhbGlkIHVuaXRzOiBtaWxlcywgbmF1dGljYWxtaWxlcywgaW5jaGVzLCB5YXJkcywgbWV0ZXJzLCBtZXRyZXMsIGtpbG9tZXRlcnMsIGNlbnRpbWV0ZXJzLCBmZWV0XG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IGRpc3RhbmNlIHRvIGJlIGNvbnZlcnRlZFxuICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpbmFsVW5pdCBvZiB0aGUgZGlzdGFuY2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBbZmluYWxVbml0PWtpbG9tZXRlcnNdIHJldHVybmVkIHVuaXRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHRoZSBjb252ZXJ0ZWQgZGlzdGFuY2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnREaXN0YW5jZShkaXN0YW5jZSwgb3JpZ2luYWxVbml0LCBmaW5hbFVuaXQpIHtcbiAgICBpZiAoZGlzdGFuY2UgPT09IG51bGwgfHwgZGlzdGFuY2UgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKCdkaXN0YW5jZSBpcyByZXF1aXJlZCcpO1xuICAgIGlmICghKGRpc3RhbmNlID49IDApKSB0aHJvdyBuZXcgRXJyb3IoJ2Rpc3RhbmNlIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcblxuICAgIHZhciBjb252ZXJ0ZWREaXN0YW5jZSA9IHJhZGlhbnNUb0Rpc3RhbmNlKGRpc3RhbmNlVG9SYWRpYW5zKGRpc3RhbmNlLCBvcmlnaW5hbFVuaXQpLCBmaW5hbFVuaXQgfHwgJ2tpbG9tZXRlcnMnKTtcbiAgICByZXR1cm4gY29udmVydGVkRGlzdGFuY2U7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBhcmVhIHRvIHRoZSByZXF1ZXN0ZWQgdW5pdC5cbiAqIFZhbGlkIHVuaXRzOiBraWxvbWV0ZXJzLCBraWxvbWV0cmVzLCBtZXRlcnMsIG1ldHJlcywgY2VudGltZXRyZXMsIG1pbGxpbWV0ZXIsIGFjcmUsIG1pbGUsIHlhcmQsIGZvb3QsIGluY2hcbiAqIEBwYXJhbSB7bnVtYmVyfSBhcmVhIHRvIGJlIGNvbnZlcnRlZFxuICogQHBhcmFtIHtzdHJpbmd9IFtvcmlnaW5hbFVuaXQ9bWV0ZXJzXSBvZiB0aGUgZGlzdGFuY2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBbZmluYWxVbml0PWtpbG9tZXRlcnNdIHJldHVybmVkIHVuaXRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHRoZSBjb252ZXJ0ZWQgZGlzdGFuY2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRBcmVhKGFyZWEsIG9yaWdpbmFsVW5pdCwgZmluYWxVbml0KSB7XG4gICAgaWYgKGFyZWEgPT09IG51bGwgfHwgYXJlYSA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoJ2FyZWEgaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAoIShhcmVhID49IDApKSB0aHJvdyBuZXcgRXJyb3IoJ2FyZWEgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuXG4gICAgdmFyIHN0YXJ0RmFjdG9yID0gYXJlYUZhY3RvcnNbb3JpZ2luYWxVbml0IHx8ICdtZXRlcnMnXTtcbiAgICBpZiAoIXN0YXJ0RmFjdG9yKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgb3JpZ2luYWwgdW5pdHMnKTtcblxuICAgIHZhciBmaW5hbEZhY3RvciA9IGFyZWFGYWN0b3JzW2ZpbmFsVW5pdCB8fCAna2lsb21ldGVycyddO1xuICAgIGlmICghZmluYWxGYWN0b3IpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBmaW5hbCB1bml0cycpO1xuXG4gICAgcmV0dXJuIChhcmVhIC8gc3RhcnRGYWN0b3IpICogZmluYWxGYWN0b3I7XG59XG5cbi8qKlxuICogaXNOdW1iZXJcbiAqXG4gKiBAcGFyYW0geyp9IG51bSBOdW1iZXIgdG8gdmFsaWRhdGVcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlL2ZhbHNlXG4gKiBAZXhhbXBsZVxuICogdHVyZi5pc051bWJlcigxMjMpXG4gKiAvLz10cnVlXG4gKiB0dXJmLmlzTnVtYmVyKCdmb28nKVxuICogLy89ZmFsc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTnVtYmVyKG51bSkge1xuICAgIHJldHVybiAhaXNOYU4obnVtKSAmJiBudW0gIT09IG51bGwgJiYgIUFycmF5LmlzQXJyYXkobnVtKTtcbn1cblxuLyoqXG4gKiBpc09iamVjdFxuICpcbiAqIEBwYXJhbSB7Kn0gaW5wdXQgdmFyaWFibGUgdG8gdmFsaWRhdGVcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlL2ZhbHNlXG4gKiBAZXhhbXBsZVxuICogdHVyZi5pc09iamVjdCh7ZWxldmF0aW9uOiAxMH0pXG4gKiAvLz10cnVlXG4gKiB0dXJmLmlzT2JqZWN0KCdmb28nKVxuICogLy89ZmFsc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzT2JqZWN0KGlucHV0KSB7XG4gICAgcmV0dXJuICghIWlucHV0KSAmJiAoaW5wdXQuY29uc3RydWN0b3IgPT09IE9iamVjdCk7XG59XG5cbi8qKlxuICogRWFydGggUmFkaXVzIHVzZWQgd2l0aCB0aGUgSGFydmVzaW5lIGZvcm11bGEgYW5kIGFwcHJveGltYXRlcyB1c2luZyBhIHNwaGVyaWNhbCAobm9uLWVsbGlwc29pZCkgRWFydGguXG4gKi9cbmV4cG9ydCB2YXIgZWFydGhSYWRpdXMgPSA2MzcxMDA4Ljg7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AdHVyZi9kZXN0aW5hdGlvbi9ub2RlX21vZHVsZXMvQHR1cmYvaGVscGVycy9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMjRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBXcmFwcyBhIEdlb0pTT04ge0BsaW5rIEdlb21ldHJ5fSBpbiBhIEdlb0pTT04ge0BsaW5rIEZlYXR1cmV9LlxuICpcbiAqIEBuYW1lIGZlYXR1cmVcbiAqIEBwYXJhbSB7R2VvbWV0cnl9IGdlb21ldHJ5IGlucHV0IGdlb21ldHJ5XG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2lkXSBJZGVudGlmaWVyXG4gKiBAcmV0dXJucyB7RmVhdHVyZX0gYSBHZW9KU09OIEZlYXR1cmVcbiAqIEBleGFtcGxlXG4gKiB2YXIgZ2VvbWV0cnkgPSB7XG4gKiAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gKiAgIFwiY29vcmRpbmF0ZXNcIjogWzExMCwgNTBdXG4gKiB9O1xuICpcbiAqIHZhciBmZWF0dXJlID0gdHVyZi5mZWF0dXJlKGdlb21ldHJ5KTtcbiAqXG4gKiAvLz1mZWF0dXJlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmZWF0dXJlKGdlb21ldHJ5LCBwcm9wZXJ0aWVzLCBiYm94LCBpZCkge1xuICAgIGlmIChnZW9tZXRyeSA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoJ2dlb21ldHJ5IGlzIHJlcXVpcmVkJyk7XG4gICAgaWYgKHByb3BlcnRpZXMgJiYgcHJvcGVydGllcy5jb25zdHJ1Y3RvciAhPT0gT2JqZWN0KSB0aHJvdyBuZXcgRXJyb3IoJ3Byb3BlcnRpZXMgbXVzdCBiZSBhbiBPYmplY3QnKTtcbiAgICBpZiAoYmJveCAmJiBiYm94Lmxlbmd0aCAhPT0gNCkgdGhyb3cgbmV3IEVycm9yKCdiYm94IG11c3QgYmUgYW4gQXJyYXkgb2YgNCBudW1iZXJzJyk7XG4gICAgaWYgKGlkICYmIFsnc3RyaW5nJywgJ251bWJlciddLmluZGV4T2YodHlwZW9mIGlkKSA9PT0gLTEpIHRocm93IG5ldyBFcnJvcignaWQgbXVzdCBiZSBhIG51bWJlciBvciBhIHN0cmluZycpO1xuXG4gICAgdmFyIGZlYXQgPSB7dHlwZTogJ0ZlYXR1cmUnfTtcbiAgICBpZiAoaWQpIGZlYXQuaWQgPSBpZDtcbiAgICBpZiAoYmJveCkgZmVhdC5iYm94ID0gYmJveDtcbiAgICBmZWF0LnByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzIHx8IHt9O1xuICAgIGZlYXQuZ2VvbWV0cnkgPSBnZW9tZXRyeTtcbiAgICByZXR1cm4gZmVhdDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgR2VvSlNPTiB7QGxpbmsgR2VvbWV0cnl9IGZyb20gYSBHZW9tZXRyeSBzdHJpbmcgdHlwZSAmIGNvb3JkaW5hdGVzLlxuICogRm9yIEdlb21ldHJ5Q29sbGVjdGlvbiB0eXBlIHVzZSBgaGVscGVycy5nZW9tZXRyeUNvbGxlY3Rpb25gXG4gKlxuICogQG5hbWUgZ2VvbWV0cnlcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIEdlb21ldHJ5IFR5cGVcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gY29vcmRpbmF0ZXMgQ29vcmRpbmF0ZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEByZXR1cm5zIHtHZW9tZXRyeX0gYSBHZW9KU09OIEdlb21ldHJ5XG4gKiBAZXhhbXBsZVxuICogdmFyIHR5cGUgPSAnUG9pbnQnO1xuICogdmFyIGNvb3JkaW5hdGVzID0gWzExMCwgNTBdO1xuICpcbiAqIHZhciBnZW9tZXRyeSA9IHR1cmYuZ2VvbWV0cnkodHlwZSwgY29vcmRpbmF0ZXMpO1xuICpcbiAqIC8vPWdlb21ldHJ5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW9tZXRyeSh0eXBlLCBjb29yZGluYXRlcywgYmJveCkge1xuICAgIC8vIFZhbGlkYXRpb25cbiAgICBpZiAoIXR5cGUpIHRocm93IG5ldyBFcnJvcigndHlwZSBpcyByZXF1aXJlZCcpO1xuICAgIGlmICghY29vcmRpbmF0ZXMpIHRocm93IG5ldyBFcnJvcignY29vcmRpbmF0ZXMgaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoY29vcmRpbmF0ZXMpKSB0aHJvdyBuZXcgRXJyb3IoJ2Nvb3JkaW5hdGVzIG11c3QgYmUgYW4gQXJyYXknKTtcbiAgICBpZiAoYmJveCAmJiBiYm94Lmxlbmd0aCAhPT0gNCkgdGhyb3cgbmV3IEVycm9yKCdiYm94IG11c3QgYmUgYW4gQXJyYXkgb2YgNCBudW1iZXJzJyk7XG5cbiAgICB2YXIgZ2VvbTtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdQb2ludCc6IGdlb20gPSBwb2ludChjb29yZGluYXRlcykuZ2VvbWV0cnk7IGJyZWFrO1xuICAgIGNhc2UgJ0xpbmVTdHJpbmcnOiBnZW9tID0gbGluZVN0cmluZyhjb29yZGluYXRlcykuZ2VvbWV0cnk7IGJyZWFrO1xuICAgIGNhc2UgJ1BvbHlnb24nOiBnZW9tID0gcG9seWdvbihjb29yZGluYXRlcykuZ2VvbWV0cnk7IGJyZWFrO1xuICAgIGNhc2UgJ011bHRpUG9pbnQnOiBnZW9tID0gbXVsdGlQb2ludChjb29yZGluYXRlcykuZ2VvbWV0cnk7IGJyZWFrO1xuICAgIGNhc2UgJ011bHRpTGluZVN0cmluZyc6IGdlb20gPSBtdWx0aUxpbmVTdHJpbmcoY29vcmRpbmF0ZXMpLmdlb21ldHJ5OyBicmVhaztcbiAgICBjYXNlICdNdWx0aVBvbHlnb24nOiBnZW9tID0gbXVsdGlQb2x5Z29uKGNvb3JkaW5hdGVzKS5nZW9tZXRyeTsgYnJlYWs7XG4gICAgZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKHR5cGUgKyAnIGlzIGludmFsaWQnKTtcbiAgICB9XG4gICAgaWYgKGJib3gpIGdlb20uYmJveCA9IGJib3g7XG4gICAgcmV0dXJuIGdlb207XG59XG5cbi8qKlxuICogVGFrZXMgY29vcmRpbmF0ZXMgYW5kIHByb3BlcnRpZXMgKG9wdGlvbmFsKSBhbmQgcmV0dXJucyBhIG5ldyB7QGxpbmsgUG9pbnR9IGZlYXR1cmUuXG4gKlxuICogQG5hbWUgcG9pbnRcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gY29vcmRpbmF0ZXMgbG9uZ2l0dWRlLCBsYXRpdHVkZSBwb3NpdGlvbiAoZWFjaCBpbiBkZWNpbWFsIGRlZ3JlZXMpXG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2lkXSBJZGVudGlmaWVyXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxQb2ludD59IGEgUG9pbnQgZmVhdHVyZVxuICogQGV4YW1wbGVcbiAqIHZhciBwb2ludCA9IHR1cmYucG9pbnQoWy03NS4zNDMsIDM5Ljk4NF0pO1xuICpcbiAqIC8vPXBvaW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwb2ludChjb29yZGluYXRlcywgcHJvcGVydGllcywgYmJveCwgaWQpIHtcbiAgICBpZiAoIWNvb3JkaW5hdGVzKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGNvb3JkaW5hdGVzIHBhc3NlZCcpO1xuICAgIGlmIChjb29yZGluYXRlcy5sZW5ndGggPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKCdDb29yZGluYXRlcyBtdXN0IGJlIGFuIGFycmF5Jyk7XG4gICAgaWYgKGNvb3JkaW5hdGVzLmxlbmd0aCA8IDIpIHRocm93IG5ldyBFcnJvcignQ29vcmRpbmF0ZXMgbXVzdCBiZSBhdCBsZWFzdCAyIG51bWJlcnMgbG9uZycpO1xuICAgIGlmICghaXNOdW1iZXIoY29vcmRpbmF0ZXNbMF0pIHx8ICFpc051bWJlcihjb29yZGluYXRlc1sxXSkpIHRocm93IG5ldyBFcnJvcignQ29vcmRpbmF0ZXMgbXVzdCBjb250YWluIG51bWJlcnMnKTtcblxuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ1BvaW50JyxcbiAgICAgICAgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzXG4gICAgfSwgcHJvcGVydGllcywgYmJveCwgaWQpO1xufVxuXG4vKipcbiAqIFRha2VzIGFuIGFycmF5IG9mIExpbmVhclJpbmdzIGFuZCBvcHRpb25hbGx5IGFuIHtAbGluayBPYmplY3R9IHdpdGggcHJvcGVydGllcyBhbmQgcmV0dXJucyBhIHtAbGluayBQb2x5Z29ufSBmZWF0dXJlLlxuICpcbiAqIEBuYW1lIHBvbHlnb25cbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk8QXJyYXk8bnVtYmVyPj4+fSBjb29yZGluYXRlcyBhbiBhcnJheSBvZiBMaW5lYXJSaW5nc1xuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtpZF0gSWRlbnRpZmllclxuICogQHJldHVybnMge0ZlYXR1cmU8UG9seWdvbj59IGEgUG9seWdvbiBmZWF0dXJlXG4gKiBAdGhyb3dzIHtFcnJvcn0gdGhyb3cgYW4gZXJyb3IgaWYgYSBMaW5lYXJSaW5nIG9mIHRoZSBwb2x5Z29uIGhhcyB0b28gZmV3IHBvc2l0aW9uc1xuICogb3IgaWYgYSBMaW5lYXJSaW5nIG9mIHRoZSBQb2x5Z29uIGRvZXMgbm90IGhhdmUgbWF0Y2hpbmcgUG9zaXRpb25zIGF0IHRoZSBiZWdpbm5pbmcgJiBlbmQuXG4gKiBAZXhhbXBsZVxuICogdmFyIHBvbHlnb24gPSB0dXJmLnBvbHlnb24oW1tcbiAqICAgWy0yLjI3NTU0MywgNTMuNDY0NTQ3XSxcbiAqICAgWy0yLjI3NTU0MywgNTMuNDg5MjcxXSxcbiAqICAgWy0yLjIxNTExOCwgNTMuNDg5MjcxXSxcbiAqICAgWy0yLjIxNTExOCwgNTMuNDY0NTQ3XSxcbiAqICAgWy0yLjI3NTU0MywgNTMuNDY0NTQ3XVxuICogXV0sIHsgbmFtZTogJ3BvbHkxJywgcG9wdWxhdGlvbjogNDAwfSk7XG4gKlxuICogLy89cG9seWdvblxuICovXG5leHBvcnQgZnVuY3Rpb24gcG9seWdvbihjb29yZGluYXRlcywgcHJvcGVydGllcywgYmJveCwgaWQpIHtcbiAgICBpZiAoIWNvb3JkaW5hdGVzKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGNvb3JkaW5hdGVzIHBhc3NlZCcpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb29yZGluYXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcmluZyA9IGNvb3JkaW5hdGVzW2ldO1xuICAgICAgICBpZiAocmluZy5sZW5ndGggPCA0KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VhY2ggTGluZWFyUmluZyBvZiBhIFBvbHlnb24gbXVzdCBoYXZlIDQgb3IgbW9yZSBQb3NpdGlvbnMuJyk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCByaW5nW3JpbmcubGVuZ3RoIC0gMV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIGZpcnN0IHBvaW50IG9mIFBvbHlnb24gY29udGFpbnMgdHdvIG51bWJlcnNcbiAgICAgICAgICAgIGlmIChpID09PSAwICYmIGogPT09IDAgJiYgIWlzTnVtYmVyKHJpbmdbMF1bMF0pIHx8ICFpc051bWJlcihyaW5nWzBdWzFdKSkgdGhyb3cgbmV3IEVycm9yKCdDb29yZGluYXRlcyBtdXN0IGNvbnRhaW4gbnVtYmVycycpO1xuICAgICAgICAgICAgaWYgKHJpbmdbcmluZy5sZW5ndGggLSAxXVtqXSAhPT0gcmluZ1swXVtqXSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmlyc3QgYW5kIGxhc3QgUG9zaXRpb24gYXJlIG5vdCBlcXVpdmFsZW50LicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZlYXR1cmUoe1xuICAgICAgICB0eXBlOiAnUG9seWdvbicsXG4gICAgICAgIGNvb3JkaW5hdGVzOiBjb29yZGluYXRlc1xuICAgIH0sIHByb3BlcnRpZXMsIGJib3gsIGlkKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEge0BsaW5rIExpbmVTdHJpbmd9IGJhc2VkIG9uIGFcbiAqIGNvb3JkaW5hdGUgYXJyYXkuIFByb3BlcnRpZXMgY2FuIGJlIGFkZGVkIG9wdGlvbmFsbHkuXG4gKlxuICogQG5hbWUgbGluZVN0cmluZ1xuICogQHBhcmFtIHtBcnJheTxBcnJheTxudW1iZXI+Pn0gY29vcmRpbmF0ZXMgYW4gYXJyYXkgb2YgUG9zaXRpb25zXG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2lkXSBJZGVudGlmaWVyXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxMaW5lU3RyaW5nPn0gYSBMaW5lU3RyaW5nIGZlYXR1cmVcbiAqIEB0aHJvd3Mge0Vycm9yfSBpZiBubyBjb29yZGluYXRlcyBhcmUgcGFzc2VkXG4gKiBAZXhhbXBsZVxuICogdmFyIGxpbmVzdHJpbmcxID0gdHVyZi5saW5lU3RyaW5nKFtcbiAqICAgWy0yMS45NjQ0MTYsIDY0LjE0ODIwM10sXG4gKiAgIFstMjEuOTU2MTc2LCA2NC4xNDEzMTZdLFxuICogICBbLTIxLjkzOTAxLCA2NC4xMzU5MjRdLFxuICogICBbLTIxLjkyNzMzNywgNjQuMTM2NjczXVxuICogXSk7XG4gKiB2YXIgbGluZXN0cmluZzIgPSB0dXJmLmxpbmVTdHJpbmcoW1xuICogICBbLTIxLjkyOTA1NCwgNjQuMTI3OTg1XSxcbiAqICAgWy0yMS45MTI5MTgsIDY0LjEzNDcyNl0sXG4gKiAgIFstMjEuOTE2MDA3LCA2NC4xNDEwMTZdLFxuICogICBbLTIxLjkzMDA4NCwgNjQuMTQ0NDZdXG4gKiBdLCB7bmFtZTogJ2xpbmUgMScsIGRpc3RhbmNlOiAxNDV9KTtcbiAqXG4gKiAvLz1saW5lc3RyaW5nMVxuICpcbiAqIC8vPWxpbmVzdHJpbmcyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaW5lU3RyaW5nKGNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzLCBiYm94LCBpZCkge1xuICAgIGlmICghY29vcmRpbmF0ZXMpIHRocm93IG5ldyBFcnJvcignTm8gY29vcmRpbmF0ZXMgcGFzc2VkJyk7XG4gICAgaWYgKGNvb3JkaW5hdGVzLmxlbmd0aCA8IDIpIHRocm93IG5ldyBFcnJvcignQ29vcmRpbmF0ZXMgbXVzdCBiZSBhbiBhcnJheSBvZiB0d28gb3IgbW9yZSBwb3NpdGlvbnMnKTtcbiAgICAvLyBDaGVjayBpZiBmaXJzdCBwb2ludCBvZiBMaW5lU3RyaW5nIGNvbnRhaW5zIHR3byBudW1iZXJzXG4gICAgaWYgKCFpc051bWJlcihjb29yZGluYXRlc1swXVsxXSkgfHwgIWlzTnVtYmVyKGNvb3JkaW5hdGVzWzBdWzFdKSkgdGhyb3cgbmV3IEVycm9yKCdDb29yZGluYXRlcyBtdXN0IGNvbnRhaW4gbnVtYmVycycpO1xuXG4gICAgcmV0dXJuIGZlYXR1cmUoe1xuICAgICAgICB0eXBlOiAnTGluZVN0cmluZycsXG4gICAgICAgIGNvb3JkaW5hdGVzOiBjb29yZGluYXRlc1xuICAgIH0sIHByb3BlcnRpZXMsIGJib3gsIGlkKTtcbn1cblxuLyoqXG4gKiBUYWtlcyBvbmUgb3IgbW9yZSB7QGxpbmsgRmVhdHVyZXxGZWF0dXJlc30gYW5kIGNyZWF0ZXMgYSB7QGxpbmsgRmVhdHVyZUNvbGxlY3Rpb259LlxuICpcbiAqIEBuYW1lIGZlYXR1cmVDb2xsZWN0aW9uXG4gKiBAcGFyYW0ge0ZlYXR1cmVbXX0gZmVhdHVyZXMgaW5wdXQgZmVhdHVyZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2lkXSBJZGVudGlmaWVyXG4gKiBAcmV0dXJucyB7RmVhdHVyZUNvbGxlY3Rpb259IGEgRmVhdHVyZUNvbGxlY3Rpb24gb2YgaW5wdXQgZmVhdHVyZXNcbiAqIEBleGFtcGxlXG4gKiB2YXIgZmVhdHVyZXMgPSBbXG4gKiAgdHVyZi5wb2ludChbLTc1LjM0MywgMzkuOTg0XSwge25hbWU6ICdMb2NhdGlvbiBBJ30pLFxuICogIHR1cmYucG9pbnQoWy03NS44MzMsIDM5LjI4NF0sIHtuYW1lOiAnTG9jYXRpb24gQid9KSxcbiAqICB0dXJmLnBvaW50KFstNzUuNTM0LCAzOS4xMjNdLCB7bmFtZTogJ0xvY2F0aW9uIEMnfSlcbiAqIF07XG4gKlxuICogdmFyIGNvbGxlY3Rpb24gPSB0dXJmLmZlYXR1cmVDb2xsZWN0aW9uKGZlYXR1cmVzKTtcbiAqXG4gKiAvLz1jb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmZWF0dXJlQ29sbGVjdGlvbihmZWF0dXJlcywgYmJveCwgaWQpIHtcbiAgICBpZiAoIWZlYXR1cmVzKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGZlYXR1cmVzIHBhc3NlZCcpO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShmZWF0dXJlcykpIHRocm93IG5ldyBFcnJvcignZmVhdHVyZXMgbXVzdCBiZSBhbiBBcnJheScpO1xuICAgIGlmIChiYm94ICYmIGJib3gubGVuZ3RoICE9PSA0KSB0aHJvdyBuZXcgRXJyb3IoJ2Jib3ggbXVzdCBiZSBhbiBBcnJheSBvZiA0IG51bWJlcnMnKTtcbiAgICBpZiAoaWQgJiYgWydzdHJpbmcnLCAnbnVtYmVyJ10uaW5kZXhPZih0eXBlb2YgaWQpID09PSAtMSkgdGhyb3cgbmV3IEVycm9yKCdpZCBtdXN0IGJlIGEgbnVtYmVyIG9yIGEgc3RyaW5nJyk7XG5cbiAgICB2YXIgZmMgPSB7dHlwZTogJ0ZlYXR1cmVDb2xsZWN0aW9uJ307XG4gICAgaWYgKGlkKSBmYy5pZCA9IGlkO1xuICAgIGlmIChiYm94KSBmYy5iYm94ID0gYmJveDtcbiAgICBmYy5mZWF0dXJlcyA9IGZlYXR1cmVzO1xuICAgIHJldHVybiBmYztcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEge0BsaW5rIEZlYXR1cmU8TXVsdGlMaW5lU3RyaW5nPn0gYmFzZWQgb24gYVxuICogY29vcmRpbmF0ZSBhcnJheS4gUHJvcGVydGllcyBjYW4gYmUgYWRkZWQgb3B0aW9uYWxseS5cbiAqXG4gKiBAbmFtZSBtdWx0aUxpbmVTdHJpbmdcbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk8QXJyYXk8bnVtYmVyPj4+fSBjb29yZGluYXRlcyBhbiBhcnJheSBvZiBMaW5lU3RyaW5nc1xuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtpZF0gSWRlbnRpZmllclxuICogQHJldHVybnMge0ZlYXR1cmU8TXVsdGlMaW5lU3RyaW5nPn0gYSBNdWx0aUxpbmVTdHJpbmcgZmVhdHVyZVxuICogQHRocm93cyB7RXJyb3J9IGlmIG5vIGNvb3JkaW5hdGVzIGFyZSBwYXNzZWRcbiAqIEBleGFtcGxlXG4gKiB2YXIgbXVsdGlMaW5lID0gdHVyZi5tdWx0aUxpbmVTdHJpbmcoW1tbMCwwXSxbMTAsMTBdXV0pO1xuICpcbiAqIC8vPW11bHRpTGluZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlMaW5lU3RyaW5nKGNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzLCBiYm94LCBpZCkge1xuICAgIGlmICghY29vcmRpbmF0ZXMpIHRocm93IG5ldyBFcnJvcignTm8gY29vcmRpbmF0ZXMgcGFzc2VkJyk7XG5cbiAgICByZXR1cm4gZmVhdHVyZSh7XG4gICAgICAgIHR5cGU6ICdNdWx0aUxpbmVTdHJpbmcnLFxuICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXNcbiAgICB9LCBwcm9wZXJ0aWVzLCBiYm94LCBpZCk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHtAbGluayBGZWF0dXJlPE11bHRpUG9pbnQ+fSBiYXNlZCBvbiBhXG4gKiBjb29yZGluYXRlIGFycmF5LiBQcm9wZXJ0aWVzIGNhbiBiZSBhZGRlZCBvcHRpb25hbGx5LlxuICpcbiAqIEBuYW1lIG11bHRpUG9pbnRcbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk8bnVtYmVyPj59IGNvb3JkaW5hdGVzIGFuIGFycmF5IG9mIFBvc2l0aW9uc1xuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtpZF0gSWRlbnRpZmllclxuICogQHJldHVybnMge0ZlYXR1cmU8TXVsdGlQb2ludD59IGEgTXVsdGlQb2ludCBmZWF0dXJlXG4gKiBAdGhyb3dzIHtFcnJvcn0gaWYgbm8gY29vcmRpbmF0ZXMgYXJlIHBhc3NlZFxuICogQGV4YW1wbGVcbiAqIHZhciBtdWx0aVB0ID0gdHVyZi5tdWx0aVBvaW50KFtbMCwwXSxbMTAsMTBdXSk7XG4gKlxuICogLy89bXVsdGlQdFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlQb2ludChjb29yZGluYXRlcywgcHJvcGVydGllcywgYmJveCwgaWQpIHtcbiAgICBpZiAoIWNvb3JkaW5hdGVzKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGNvb3JkaW5hdGVzIHBhc3NlZCcpO1xuXG4gICAgcmV0dXJuIGZlYXR1cmUoe1xuICAgICAgICB0eXBlOiAnTXVsdGlQb2ludCcsXG4gICAgICAgIGNvb3JkaW5hdGVzOiBjb29yZGluYXRlc1xuICAgIH0sIHByb3BlcnRpZXMsIGJib3gsIGlkKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEge0BsaW5rIEZlYXR1cmU8TXVsdGlQb2x5Z29uPn0gYmFzZWQgb24gYVxuICogY29vcmRpbmF0ZSBhcnJheS4gUHJvcGVydGllcyBjYW4gYmUgYWRkZWQgb3B0aW9uYWxseS5cbiAqXG4gKiBAbmFtZSBtdWx0aVBvbHlnb25cbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk8QXJyYXk8QXJyYXk8bnVtYmVyPj4+Pn0gY29vcmRpbmF0ZXMgYW4gYXJyYXkgb2YgUG9seWdvbnNcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV0gYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlPE11bHRpUG9seWdvbj59IGEgbXVsdGlwb2x5Z29uIGZlYXR1cmVcbiAqIEB0aHJvd3Mge0Vycm9yfSBpZiBubyBjb29yZGluYXRlcyBhcmUgcGFzc2VkXG4gKiBAZXhhbXBsZVxuICogdmFyIG11bHRpUG9seSA9IHR1cmYubXVsdGlQb2x5Z29uKFtbW1swLDBdLFswLDEwXSxbMTAsMTBdLFsxMCwwXSxbMCwwXV1dXSk7XG4gKlxuICogLy89bXVsdGlQb2x5XG4gKlxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlQb2x5Z29uKGNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzLCBiYm94LCBpZCkge1xuICAgIGlmICghY29vcmRpbmF0ZXMpIHRocm93IG5ldyBFcnJvcignTm8gY29vcmRpbmF0ZXMgcGFzc2VkJyk7XG5cbiAgICByZXR1cm4gZmVhdHVyZSh7XG4gICAgICAgIHR5cGU6ICdNdWx0aVBvbHlnb24nLFxuICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXNcbiAgICB9LCBwcm9wZXJ0aWVzLCBiYm94LCBpZCk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHtAbGluayBGZWF0dXJlPEdlb21ldHJ5Q29sbGVjdGlvbj59IGJhc2VkIG9uIGFcbiAqIGNvb3JkaW5hdGUgYXJyYXkuIFByb3BlcnRpZXMgY2FuIGJlIGFkZGVkIG9wdGlvbmFsbHkuXG4gKlxuICogQG5hbWUgZ2VvbWV0cnlDb2xsZWN0aW9uXG4gKiBAcGFyYW0ge0FycmF5PEdlb21ldHJ5Pn0gZ2VvbWV0cmllcyBhbiBhcnJheSBvZiBHZW9KU09OIEdlb21ldHJpZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV0gYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlPEdlb21ldHJ5Q29sbGVjdGlvbj59IGEgR2VvSlNPTiBHZW9tZXRyeUNvbGxlY3Rpb24gRmVhdHVyZVxuICogQGV4YW1wbGVcbiAqIHZhciBwdCA9IHtcbiAqICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICogICAgICAgXCJjb29yZGluYXRlc1wiOiBbMTAwLCAwXVxuICogICAgIH07XG4gKiB2YXIgbGluZSA9IHtcbiAqICAgICBcInR5cGVcIjogXCJMaW5lU3RyaW5nXCIsXG4gKiAgICAgXCJjb29yZGluYXRlc1wiOiBbIFsxMDEsIDBdLCBbMTAyLCAxXSBdXG4gKiAgIH07XG4gKiB2YXIgY29sbGVjdGlvbiA9IHR1cmYuZ2VvbWV0cnlDb2xsZWN0aW9uKFtwdCwgbGluZV0pO1xuICpcbiAqIC8vPWNvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlb21ldHJ5Q29sbGVjdGlvbihnZW9tZXRyaWVzLCBwcm9wZXJ0aWVzLCBiYm94LCBpZCkge1xuICAgIGlmICghZ2VvbWV0cmllcykgdGhyb3cgbmV3IEVycm9yKCdnZW9tZXRyaWVzIGlzIHJlcXVpcmVkJyk7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGdlb21ldHJpZXMpKSB0aHJvdyBuZXcgRXJyb3IoJ2dlb21ldHJpZXMgbXVzdCBiZSBhbiBBcnJheScpO1xuXG4gICAgcmV0dXJuIGZlYXR1cmUoe1xuICAgICAgICB0eXBlOiAnR2VvbWV0cnlDb2xsZWN0aW9uJyxcbiAgICAgICAgZ2VvbWV0cmllczogZ2VvbWV0cmllc1xuICAgIH0sIHByb3BlcnRpZXMsIGJib3gsIGlkKTtcbn1cblxuLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvR3JlYXQtY2lyY2xlX2Rpc3RhbmNlI1JhZGl1c19mb3Jfc3BoZXJpY2FsX0VhcnRoXG52YXIgZmFjdG9ycyA9IHtcbiAgICBtaWxlczogMzk2MCxcbiAgICBuYXV0aWNhbG1pbGVzOiAzNDQxLjE0NSxcbiAgICBkZWdyZWVzOiA1Ny4yOTU3Nzk1LFxuICAgIHJhZGlhbnM6IDEsXG4gICAgaW5jaGVzOiAyNTA5MDU2MDAsXG4gICAgeWFyZHM6IDY5Njk2MDAsXG4gICAgbWV0ZXJzOiA2MzczMDAwLFxuICAgIG1ldHJlczogNjM3MzAwMCxcbiAgICBjZW50aW1ldGVyczogNi4zNzNlKzgsXG4gICAgY2VudGltZXRyZXM6IDYuMzczZSs4LFxuICAgIGtpbG9tZXRlcnM6IDYzNzMsXG4gICAga2lsb21ldHJlczogNjM3MyxcbiAgICBmZWV0OiAyMDkwODc5Mi42NVxufTtcblxudmFyIGFyZWFGYWN0b3JzID0ge1xuICAgIGtpbG9tZXRlcnM6IDAuMDAwMDAxLFxuICAgIGtpbG9tZXRyZXM6IDAuMDAwMDAxLFxuICAgIG1ldGVyczogMSxcbiAgICBtZXRyZXM6IDEsXG4gICAgY2VudGltZXRyZXM6IDEwMDAwLFxuICAgIG1pbGxpbWV0ZXI6IDEwMDAwMDAsXG4gICAgYWNyZXM6IDAuMDAwMjQ3MTA1LFxuICAgIG1pbGVzOiAzLjg2ZS03LFxuICAgIHlhcmRzOiAxLjE5NTk5MDA0NixcbiAgICBmZWV0OiAxMC43NjM5MTA0MTcsXG4gICAgaW5jaGVzOiAxNTUwLjAwMzEwMDAwNlxufTtcblxuLyoqXG4gKiBSb3VuZCBudW1iZXIgdG8gcHJlY2lzaW9uXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IG51bSBOdW1iZXJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbcHJlY2lzaW9uPTBdIFByZWNpc2lvblxuICogQHJldHVybnMge251bWJlcn0gcm91bmRlZCBudW1iZXJcbiAqIEBleGFtcGxlXG4gKiB0dXJmLnJvdW5kKDEyMC40MzIxKVxuICogLy89MTIwXG4gKlxuICogdHVyZi5yb3VuZCgxMjAuNDMyMSwgMilcbiAqIC8vPTEyMC40M1xuICovXG5leHBvcnQgZnVuY3Rpb24gcm91bmQobnVtLCBwcmVjaXNpb24pIHtcbiAgICBpZiAobnVtID09PSB1bmRlZmluZWQgfHwgbnVtID09PSBudWxsIHx8IGlzTmFOKG51bSkpIHRocm93IG5ldyBFcnJvcignbnVtIGlzIHJlcXVpcmVkJyk7XG4gICAgaWYgKHByZWNpc2lvbiAmJiAhKHByZWNpc2lvbiA+PSAwKSkgdGhyb3cgbmV3IEVycm9yKCdwcmVjaXNpb24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICAgIHZhciBtdWx0aXBsaWVyID0gTWF0aC5wb3coMTAsIHByZWNpc2lvbiB8fCAwKTtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChudW0gKiBtdWx0aXBsaWVyKSAvIG11bHRpcGxpZXI7XG59XG5cbi8qKlxuICogQ29udmVydCBhIGRpc3RhbmNlIG1lYXN1cmVtZW50IChhc3N1bWluZyBhIHNwaGVyaWNhbCBFYXJ0aCkgZnJvbSByYWRpYW5zIHRvIGEgbW9yZSBmcmllbmRseSB1bml0LlxuICogVmFsaWQgdW5pdHM6IG1pbGVzLCBuYXV0aWNhbG1pbGVzLCBpbmNoZXMsIHlhcmRzLCBtZXRlcnMsIG1ldHJlcywga2lsb21ldGVycywgY2VudGltZXRlcnMsIGZlZXRcbiAqXG4gKiBAbmFtZSByYWRpYW5zVG9EaXN0YW5jZVxuICogQHBhcmFtIHtudW1iZXJ9IHJhZGlhbnMgaW4gcmFkaWFucyBhY3Jvc3MgdGhlIHNwaGVyZVxuICogQHBhcmFtIHtzdHJpbmd9IFt1bml0cz1cImtpbG9tZXRlcnNcIl0gY2FuIGJlIGRlZ3JlZXMsIHJhZGlhbnMsIG1pbGVzLCBvciBraWxvbWV0ZXJzIGluY2hlcywgeWFyZHMsIG1ldHJlcywgbWV0ZXJzLCBraWxvbWV0cmVzLCBraWxvbWV0ZXJzLlxuICogQHJldHVybnMge251bWJlcn0gZGlzdGFuY2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJhZGlhbnNUb0Rpc3RhbmNlKHJhZGlhbnMsIHVuaXRzKSB7XG4gICAgaWYgKHJhZGlhbnMgPT09IHVuZGVmaW5lZCB8fCByYWRpYW5zID09PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoJ3JhZGlhbnMgaXMgcmVxdWlyZWQnKTtcblxuICAgIGlmICh1bml0cyAmJiB0eXBlb2YgdW5pdHMgIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgRXJyb3IoJ3VuaXRzIG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgICB2YXIgZmFjdG9yID0gZmFjdG9yc1t1bml0cyB8fCAna2lsb21ldGVycyddO1xuICAgIGlmICghZmFjdG9yKSB0aHJvdyBuZXcgRXJyb3IodW5pdHMgKyAnIHVuaXRzIGlzIGludmFsaWQnKTtcbiAgICByZXR1cm4gcmFkaWFucyAqIGZhY3Rvcjtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgZGlzdGFuY2UgbWVhc3VyZW1lbnQgKGFzc3VtaW5nIGEgc3BoZXJpY2FsIEVhcnRoKSBmcm9tIGEgcmVhbC13b3JsZCB1bml0IGludG8gcmFkaWFuc1xuICogVmFsaWQgdW5pdHM6IG1pbGVzLCBuYXV0aWNhbG1pbGVzLCBpbmNoZXMsIHlhcmRzLCBtZXRlcnMsIG1ldHJlcywga2lsb21ldGVycywgY2VudGltZXRlcnMsIGZlZXRcbiAqXG4gKiBAbmFtZSBkaXN0YW5jZVRvUmFkaWFuc1xuICogQHBhcmFtIHtudW1iZXJ9IGRpc3RhbmNlIGluIHJlYWwgdW5pdHNcbiAqIEBwYXJhbSB7c3RyaW5nfSBbdW5pdHM9a2lsb21ldGVyc10gY2FuIGJlIGRlZ3JlZXMsIHJhZGlhbnMsIG1pbGVzLCBvciBraWxvbWV0ZXJzIGluY2hlcywgeWFyZHMsIG1ldHJlcywgbWV0ZXJzLCBraWxvbWV0cmVzLCBraWxvbWV0ZXJzLlxuICogQHJldHVybnMge251bWJlcn0gcmFkaWFuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzdGFuY2VUb1JhZGlhbnMoZGlzdGFuY2UsIHVuaXRzKSB7XG4gICAgaWYgKGRpc3RhbmNlID09PSB1bmRlZmluZWQgfHwgZGlzdGFuY2UgPT09IG51bGwpIHRocm93IG5ldyBFcnJvcignZGlzdGFuY2UgaXMgcmVxdWlyZWQnKTtcblxuICAgIGlmICh1bml0cyAmJiB0eXBlb2YgdW5pdHMgIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgRXJyb3IoJ3VuaXRzIG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgICB2YXIgZmFjdG9yID0gZmFjdG9yc1t1bml0cyB8fCAna2lsb21ldGVycyddO1xuICAgIGlmICghZmFjdG9yKSB0aHJvdyBuZXcgRXJyb3IodW5pdHMgKyAnIHVuaXRzIGlzIGludmFsaWQnKTtcbiAgICByZXR1cm4gZGlzdGFuY2UgLyBmYWN0b3I7XG59XG5cbi8qKlxuICogQ29udmVydCBhIGRpc3RhbmNlIG1lYXN1cmVtZW50IChhc3N1bWluZyBhIHNwaGVyaWNhbCBFYXJ0aCkgZnJvbSBhIHJlYWwtd29ybGQgdW5pdCBpbnRvIGRlZ3JlZXNcbiAqIFZhbGlkIHVuaXRzOiBtaWxlcywgbmF1dGljYWxtaWxlcywgaW5jaGVzLCB5YXJkcywgbWV0ZXJzLCBtZXRyZXMsIGNlbnRpbWV0ZXJzLCBraWxvbWV0cmVzLCBmZWV0XG4gKlxuICogQG5hbWUgZGlzdGFuY2VUb0RlZ3JlZXNcbiAqIEBwYXJhbSB7bnVtYmVyfSBkaXN0YW5jZSBpbiByZWFsIHVuaXRzXG4gKiBAcGFyYW0ge3N0cmluZ30gW3VuaXRzPWtpbG9tZXRlcnNdIGNhbiBiZSBkZWdyZWVzLCByYWRpYW5zLCBtaWxlcywgb3Iga2lsb21ldGVycyBpbmNoZXMsIHlhcmRzLCBtZXRyZXMsIG1ldGVycywga2lsb21ldHJlcywga2lsb21ldGVycy5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IGRlZ3JlZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3RhbmNlVG9EZWdyZWVzKGRpc3RhbmNlLCB1bml0cykge1xuICAgIHJldHVybiByYWRpYW5zMmRlZ3JlZXMoZGlzdGFuY2VUb1JhZGlhbnMoZGlzdGFuY2UsIHVuaXRzKSk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYW55IGJlYXJpbmcgYW5nbGUgZnJvbSB0aGUgbm9ydGggbGluZSBkaXJlY3Rpb24gKHBvc2l0aXZlIGNsb2Nrd2lzZSlcbiAqIGFuZCByZXR1cm5zIGFuIGFuZ2xlIGJldHdlZW4gMC0zNjAgZGVncmVlcyAocG9zaXRpdmUgY2xvY2t3aXNlKSwgMCBiZWluZyB0aGUgbm9ydGggbGluZVxuICpcbiAqIEBuYW1lIGJlYXJpbmdUb0FuZ2xlXG4gKiBAcGFyYW0ge251bWJlcn0gYmVhcmluZyBhbmdsZSwgYmV0d2VlbiAtMTgwIGFuZCArMTgwIGRlZ3JlZXNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGFuZ2xlIGJldHdlZW4gMCBhbmQgMzYwIGRlZ3JlZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJlYXJpbmdUb0FuZ2xlKGJlYXJpbmcpIHtcbiAgICBpZiAoYmVhcmluZyA9PT0gbnVsbCB8fCBiZWFyaW5nID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcignYmVhcmluZyBpcyByZXF1aXJlZCcpO1xuXG4gICAgdmFyIGFuZ2xlID0gYmVhcmluZyAlIDM2MDtcbiAgICBpZiAoYW5nbGUgPCAwKSBhbmdsZSArPSAzNjA7XG4gICAgcmV0dXJuIGFuZ2xlO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGFuIGFuZ2xlIGluIHJhZGlhbnMgdG8gZGVncmVlc1xuICpcbiAqIEBuYW1lIHJhZGlhbnMyZGVncmVlc1xuICogQHBhcmFtIHtudW1iZXJ9IHJhZGlhbnMgYW5nbGUgaW4gcmFkaWFuc1xuICogQHJldHVybnMge251bWJlcn0gZGVncmVlcyBiZXR3ZWVuIDAgYW5kIDM2MCBkZWdyZWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByYWRpYW5zMmRlZ3JlZXMocmFkaWFucykge1xuICAgIGlmIChyYWRpYW5zID09PSBudWxsIHx8IHJhZGlhbnMgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKCdyYWRpYW5zIGlzIHJlcXVpcmVkJyk7XG5cbiAgICB2YXIgZGVncmVlcyA9IHJhZGlhbnMgJSAoMiAqIE1hdGguUEkpO1xuICAgIHJldHVybiBkZWdyZWVzICogMTgwIC8gTWF0aC5QSTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhbiBhbmdsZSBpbiBkZWdyZWVzIHRvIHJhZGlhbnNcbiAqXG4gKiBAbmFtZSBkZWdyZWVzMnJhZGlhbnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBkZWdyZWVzIGFuZ2xlIGJldHdlZW4gMCBhbmQgMzYwIGRlZ3JlZXNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGFuZ2xlIGluIHJhZGlhbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZ3JlZXMycmFkaWFucyhkZWdyZWVzKSB7XG4gICAgaWYgKGRlZ3JlZXMgPT09IG51bGwgfHwgZGVncmVlcyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoJ2RlZ3JlZXMgaXMgcmVxdWlyZWQnKTtcblxuICAgIHZhciByYWRpYW5zID0gZGVncmVlcyAlIDM2MDtcbiAgICByZXR1cm4gcmFkaWFucyAqIE1hdGguUEkgLyAxODA7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBkaXN0YW5jZSB0byB0aGUgcmVxdWVzdGVkIHVuaXQuXG4gKiBWYWxpZCB1bml0czogbWlsZXMsIG5hdXRpY2FsbWlsZXMsIGluY2hlcywgeWFyZHMsIG1ldGVycywgbWV0cmVzLCBraWxvbWV0ZXJzLCBjZW50aW1ldGVycywgZmVldFxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBkaXN0YW5jZSB0byBiZSBjb252ZXJ0ZWRcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcmlnaW5hbFVuaXQgb2YgdGhlIGRpc3RhbmNlXG4gKiBAcGFyYW0ge3N0cmluZ30gW2ZpbmFsVW5pdD1raWxvbWV0ZXJzXSByZXR1cm5lZCB1bml0XG4gKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgY29udmVydGVkIGRpc3RhbmNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0RGlzdGFuY2UoZGlzdGFuY2UsIG9yaWdpbmFsVW5pdCwgZmluYWxVbml0KSB7XG4gICAgaWYgKGRpc3RhbmNlID09PSBudWxsIHx8IGRpc3RhbmNlID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcignZGlzdGFuY2UgaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAoIShkaXN0YW5jZSA+PSAwKSkgdGhyb3cgbmV3IEVycm9yKCdkaXN0YW5jZSBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG5cbiAgICB2YXIgY29udmVydGVkRGlzdGFuY2UgPSByYWRpYW5zVG9EaXN0YW5jZShkaXN0YW5jZVRvUmFkaWFucyhkaXN0YW5jZSwgb3JpZ2luYWxVbml0KSwgZmluYWxVbml0IHx8ICdraWxvbWV0ZXJzJyk7XG4gICAgcmV0dXJuIGNvbnZlcnRlZERpc3RhbmNlO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgYXJlYSB0byB0aGUgcmVxdWVzdGVkIHVuaXQuXG4gKiBWYWxpZCB1bml0czoga2lsb21ldGVycywga2lsb21ldHJlcywgbWV0ZXJzLCBtZXRyZXMsIGNlbnRpbWV0cmVzLCBtaWxsaW1ldGVyLCBhY3JlLCBtaWxlLCB5YXJkLCBmb290LCBpbmNoXG4gKiBAcGFyYW0ge251bWJlcn0gYXJlYSB0byBiZSBjb252ZXJ0ZWRcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3JpZ2luYWxVbml0PW1ldGVyc10gb2YgdGhlIGRpc3RhbmNlXG4gKiBAcGFyYW0ge3N0cmluZ30gW2ZpbmFsVW5pdD1raWxvbWV0ZXJzXSByZXR1cm5lZCB1bml0XG4gKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgY29udmVydGVkIGRpc3RhbmNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0QXJlYShhcmVhLCBvcmlnaW5hbFVuaXQsIGZpbmFsVW5pdCkge1xuICAgIGlmIChhcmVhID09PSBudWxsIHx8IGFyZWEgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKCdhcmVhIGlzIHJlcXVpcmVkJyk7XG4gICAgaWYgKCEoYXJlYSA+PSAwKSkgdGhyb3cgbmV3IEVycm9yKCdhcmVhIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcblxuICAgIHZhciBzdGFydEZhY3RvciA9IGFyZWFGYWN0b3JzW29yaWdpbmFsVW5pdCB8fCAnbWV0ZXJzJ107XG4gICAgaWYgKCFzdGFydEZhY3RvcikgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIG9yaWdpbmFsIHVuaXRzJyk7XG5cbiAgICB2YXIgZmluYWxGYWN0b3IgPSBhcmVhRmFjdG9yc1tmaW5hbFVuaXQgfHwgJ2tpbG9tZXRlcnMnXTtcbiAgICBpZiAoIWZpbmFsRmFjdG9yKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZmluYWwgdW5pdHMnKTtcblxuICAgIHJldHVybiAoYXJlYSAvIHN0YXJ0RmFjdG9yKSAqIGZpbmFsRmFjdG9yO1xufVxuXG4vKipcbiAqIGlzTnVtYmVyXG4gKlxuICogQHBhcmFtIHsqfSBudW0gTnVtYmVyIHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZS9mYWxzZVxuICogQGV4YW1wbGVcbiAqIHR1cmYuaXNOdW1iZXIoMTIzKVxuICogLy89dHJ1ZVxuICogdHVyZi5pc051bWJlcignZm9vJylcbiAqIC8vPWZhbHNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc051bWJlcihudW0pIHtcbiAgICByZXR1cm4gIWlzTmFOKG51bSkgJiYgbnVtICE9PSBudWxsICYmICFBcnJheS5pc0FycmF5KG51bSk7XG59XG5cbi8qKlxuICogaXNPYmplY3RcbiAqXG4gKiBAcGFyYW0geyp9IGlucHV0IHZhcmlhYmxlIHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZS9mYWxzZVxuICogQGV4YW1wbGVcbiAqIHR1cmYuaXNPYmplY3Qoe2VsZXZhdGlvbjogMTB9KVxuICogLy89dHJ1ZVxuICogdHVyZi5pc09iamVjdCgnZm9vJylcbiAqIC8vPWZhbHNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdChpbnB1dCkge1xuICAgIHJldHVybiAoISFpbnB1dCkgJiYgKGlucHV0LmNvbnN0cnVjdG9yID09PSBPYmplY3QpO1xufVxuXG4vKipcbiAqIEVhcnRoIFJhZGl1cyB1c2VkIHdpdGggdGhlIEhhcnZlc2luZSBmb3JtdWxhIGFuZCBhcHByb3hpbWF0ZXMgdXNpbmcgYSBzcGhlcmljYWwgKG5vbi1lbGxpcHNvaWQpIEVhcnRoLlxuICovXG5leHBvcnQgdmFyIGVhcnRoUmFkaXVzID0gNjM3MTAwOC44O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQHR1cmYvY2lyY2xlL25vZGVfbW9kdWxlcy9AdHVyZi9oZWxwZXJzL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIEVhcnRoIFJhZGl1cyB1c2VkIHdpdGggdGhlIEhhcnZlc2luZSBmb3JtdWxhIGFuZCBhcHByb3hpbWF0ZXMgdXNpbmcgYSBzcGhlcmljYWwgKG5vbi1lbGxpcHNvaWQpIEVhcnRoLlxuICovXG5leHBvcnQgdmFyIGVhcnRoUmFkaXVzID0gNjM3MTAwOC44O1xuXG4vKipcbiAqIFVuaXQgb2YgbWVhc3VyZW1lbnQgZmFjdG9ycyB1c2luZyBhIHNwaGVyaWNhbCAobm9uLWVsbGlwc29pZCkgZWFydGggcmFkaXVzLlxuICovXG5leHBvcnQgdmFyIGZhY3RvcnMgPSB7XG4gICAgbWV0ZXJzOiBlYXJ0aFJhZGl1cyxcbiAgICBtZXRyZXM6IGVhcnRoUmFkaXVzLFxuICAgIG1pbGxpbWV0ZXJzOiBlYXJ0aFJhZGl1cyAqIDEwMDAsXG4gICAgbWlsbGltZXRyZXM6IGVhcnRoUmFkaXVzICogMTAwMCxcbiAgICBjZW50aW1ldGVyczogZWFydGhSYWRpdXMgKiAxMDAsXG4gICAgY2VudGltZXRyZXM6IGVhcnRoUmFkaXVzICogMTAwLFxuICAgIGtpbG9tZXRlcnM6IGVhcnRoUmFkaXVzIC8gMTAwMCxcbiAgICBraWxvbWV0cmVzOiBlYXJ0aFJhZGl1cyAvIDEwMDAsXG4gICAgbWlsZXM6IGVhcnRoUmFkaXVzIC8gMTYwOS4zNDQsXG4gICAgbmF1dGljYWxtaWxlczogZWFydGhSYWRpdXMgLyAxODUyLFxuICAgIGluY2hlczogZWFydGhSYWRpdXMgKiAzOS4zNzAsXG4gICAgeWFyZHM6IGVhcnRoUmFkaXVzIC8gMS4wOTM2LFxuICAgIGZlZXQ6IGVhcnRoUmFkaXVzICogMy4yODA4NCxcbiAgICByYWRpYW5zOiAxLFxuICAgIGRlZ3JlZXM6IGVhcnRoUmFkaXVzIC8gMTExMzI1LFxufTtcblxuLyoqXG4gKiBVbml0cyBvZiBtZWFzdXJlbWVudCBmYWN0b3JzIGJhc2VkIG9uIDEgbWV0ZXIuXG4gKi9cbmV4cG9ydCB2YXIgdW5pdHNGYWN0b3JzID0ge1xuICAgIG1ldGVyczogMSxcbiAgICBtZXRyZXM6IDEsXG4gICAgbWlsbGltZXRlcnM6IDEwMDAsXG4gICAgbWlsbGltZXRyZXM6IDEwMDAsXG4gICAgY2VudGltZXRlcnM6IDEwMCxcbiAgICBjZW50aW1ldHJlczogMTAwLFxuICAgIGtpbG9tZXRlcnM6IDEgLyAxMDAwLFxuICAgIGtpbG9tZXRyZXM6IDEgLyAxMDAwLFxuICAgIG1pbGVzOiAxIC8gMTYwOS4zNDQsXG4gICAgbmF1dGljYWxtaWxlczogMSAvIDE4NTIsXG4gICAgaW5jaGVzOiAzOS4zNzAsXG4gICAgeWFyZHM6IDEgLyAxLjA5MzYsXG4gICAgZmVldDogMy4yODA4NCxcbiAgICByYWRpYW5zOiAxIC8gZWFydGhSYWRpdXMsXG4gICAgZGVncmVlczogMSAvIDExMTMyNSxcbn07XG5cbi8qKlxuICogQXJlYSBvZiBtZWFzdXJlbWVudCBmYWN0b3JzIGJhc2VkIG9uIDEgc3F1YXJlIG1ldGVyLlxuICovXG5leHBvcnQgdmFyIGFyZWFGYWN0b3JzID0ge1xuICAgIG1ldGVyczogMSxcbiAgICBtZXRyZXM6IDEsXG4gICAgbWlsbGltZXRlcnM6IDEwMDAwMDAsXG4gICAgbWlsbGltZXRyZXM6IDEwMDAwMDAsXG4gICAgY2VudGltZXRlcnM6IDEwMDAwLFxuICAgIGNlbnRpbWV0cmVzOiAxMDAwMCxcbiAgICBraWxvbWV0ZXJzOiAwLjAwMDAwMSxcbiAgICBraWxvbWV0cmVzOiAwLjAwMDAwMSxcbiAgICBhY3JlczogMC4wMDAyNDcxMDUsXG4gICAgbWlsZXM6IDMuODZlLTcsXG4gICAgeWFyZHM6IDEuMTk1OTkwMDQ2LFxuICAgIGZlZXQ6IDEwLjc2MzkxMDQxNyxcbiAgICBpbmNoZXM6IDE1NTAuMDAzMTAwMDA2XG59O1xuXG4vKipcbiAqIFdyYXBzIGEgR2VvSlNPTiB7QGxpbmsgR2VvbWV0cnl9IGluIGEgR2VvSlNPTiB7QGxpbmsgRmVhdHVyZX0uXG4gKlxuICogQG5hbWUgZmVhdHVyZVxuICogQHBhcmFtIHtHZW9tZXRyeX0gZ2VvbWV0cnkgaW5wdXQgZ2VvbWV0cnlcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV0gYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlfSBhIEdlb0pTT04gRmVhdHVyZVxuICogQGV4YW1wbGVcbiAqIHZhciBnZW9tZXRyeSA9IHtcbiAqICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAqICAgXCJjb29yZGluYXRlc1wiOiBbMTEwLCA1MF1cbiAqIH07XG4gKlxuICogdmFyIGZlYXR1cmUgPSB0dXJmLmZlYXR1cmUoZ2VvbWV0cnkpO1xuICpcbiAqIC8vPWZlYXR1cmVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZlYXR1cmUoZ2VvbWV0cnksIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKGdlb21ldHJ5ID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcignZ2VvbWV0cnkgaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAocHJvcGVydGllcyAmJiBwcm9wZXJ0aWVzLmNvbnN0cnVjdG9yICE9PSBPYmplY3QpIHRocm93IG5ldyBFcnJvcigncHJvcGVydGllcyBtdXN0IGJlIGFuIE9iamVjdCcpO1xuICAgIGlmIChiYm94ICYmIGJib3gubGVuZ3RoICE9PSA0KSB0aHJvdyBuZXcgRXJyb3IoJ2Jib3ggbXVzdCBiZSBhbiBBcnJheSBvZiA0IG51bWJlcnMnKTtcbiAgICBpZiAoaWQgJiYgWydzdHJpbmcnLCAnbnVtYmVyJ10uaW5kZXhPZih0eXBlb2YgaWQpID09PSAtMSkgdGhyb3cgbmV3IEVycm9yKCdpZCBtdXN0IGJlIGEgbnVtYmVyIG9yIGEgc3RyaW5nJyk7XG5cbiAgICB2YXIgZmVhdCA9IHt0eXBlOiAnRmVhdHVyZSd9O1xuICAgIGlmIChpZCkgZmVhdC5pZCA9IGlkO1xuICAgIGlmIChiYm94KSBmZWF0LmJib3ggPSBiYm94O1xuICAgIGZlYXQucHJvcGVydGllcyA9IHByb3BlcnRpZXMgfHwge307XG4gICAgZmVhdC5nZW9tZXRyeSA9IGdlb21ldHJ5O1xuICAgIHJldHVybiBmZWF0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBHZW9KU09OIHtAbGluayBHZW9tZXRyeX0gZnJvbSBhIEdlb21ldHJ5IHN0cmluZyB0eXBlICYgY29vcmRpbmF0ZXMuXG4gKiBGb3IgR2VvbWV0cnlDb2xsZWN0aW9uIHR5cGUgdXNlIGBoZWxwZXJzLmdlb21ldHJ5Q29sbGVjdGlvbmBcbiAqXG4gKiBAbmFtZSBnZW9tZXRyeVxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgR2VvbWV0cnkgVHlwZVxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBjb29yZGluYXRlcyBDb29yZGluYXRlc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHJldHVybnMge0dlb21ldHJ5fSBhIEdlb0pTT04gR2VvbWV0cnlcbiAqIEBleGFtcGxlXG4gKiB2YXIgdHlwZSA9ICdQb2ludCc7XG4gKiB2YXIgY29vcmRpbmF0ZXMgPSBbMTEwLCA1MF07XG4gKlxuICogdmFyIGdlb21ldHJ5ID0gdHVyZi5nZW9tZXRyeSh0eXBlLCBjb29yZGluYXRlcyk7XG4gKlxuICogLy89Z2VvbWV0cnlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlb21ldHJ5KHR5cGUsIGNvb3JkaW5hdGVzLCBiYm94KSB7XG4gICAgLy8gVmFsaWRhdGlvblxuICAgIGlmICghdHlwZSkgdGhyb3cgbmV3IEVycm9yKCd0eXBlIGlzIHJlcXVpcmVkJyk7XG4gICAgaWYgKCFjb29yZGluYXRlcykgdGhyb3cgbmV3IEVycm9yKCdjb29yZGluYXRlcyBpcyByZXF1aXJlZCcpO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShjb29yZGluYXRlcykpIHRocm93IG5ldyBFcnJvcignY29vcmRpbmF0ZXMgbXVzdCBiZSBhbiBBcnJheScpO1xuICAgIGlmIChiYm94ICYmIGJib3gubGVuZ3RoICE9PSA0KSB0aHJvdyBuZXcgRXJyb3IoJ2Jib3ggbXVzdCBiZSBhbiBBcnJheSBvZiA0IG51bWJlcnMnKTtcblxuICAgIHZhciBnZW9tO1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ1BvaW50JzogZ2VvbSA9IHBvaW50KGNvb3JkaW5hdGVzKS5nZW9tZXRyeTsgYnJlYWs7XG4gICAgY2FzZSAnTGluZVN0cmluZyc6IGdlb20gPSBsaW5lU3RyaW5nKGNvb3JkaW5hdGVzKS5nZW9tZXRyeTsgYnJlYWs7XG4gICAgY2FzZSAnUG9seWdvbic6IGdlb20gPSBwb2x5Z29uKGNvb3JkaW5hdGVzKS5nZW9tZXRyeTsgYnJlYWs7XG4gICAgY2FzZSAnTXVsdGlQb2ludCc6IGdlb20gPSBtdWx0aVBvaW50KGNvb3JkaW5hdGVzKS5nZW9tZXRyeTsgYnJlYWs7XG4gICAgY2FzZSAnTXVsdGlMaW5lU3RyaW5nJzogZ2VvbSA9IG11bHRpTGluZVN0cmluZyhjb29yZGluYXRlcykuZ2VvbWV0cnk7IGJyZWFrO1xuICAgIGNhc2UgJ011bHRpUG9seWdvbic6IGdlb20gPSBtdWx0aVBvbHlnb24oY29vcmRpbmF0ZXMpLmdlb21ldHJ5OyBicmVhaztcbiAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IodHlwZSArICcgaXMgaW52YWxpZCcpO1xuICAgIH1cbiAgICBpZiAoYmJveCkgZ2VvbS5iYm94ID0gYmJveDtcbiAgICByZXR1cm4gZ2VvbTtcbn1cblxuLyoqXG4gKiBUYWtlcyBjb29yZGluYXRlcyBhbmQgcHJvcGVydGllcyAob3B0aW9uYWwpIGFuZCByZXR1cm5zIGEgbmV3IHtAbGluayBQb2ludH0gZmVhdHVyZS5cbiAqXG4gKiBAbmFtZSBwb2ludFxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBjb29yZGluYXRlcyBsb25naXR1ZGUsIGxhdGl0dWRlIHBvc2l0aW9uIChlYWNoIGluIGRlY2ltYWwgZGVncmVlcylcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV0gYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlPFBvaW50Pn0gYSBQb2ludCBmZWF0dXJlXG4gKiBAZXhhbXBsZVxuICogdmFyIHBvaW50ID0gdHVyZi5wb2ludChbLTc1LjM0MywgMzkuOTg0XSk7XG4gKlxuICogLy89cG9pbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBvaW50KGNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzLCBiYm94LCBpZCkge1xuICAgIGlmICghY29vcmRpbmF0ZXMpIHRocm93IG5ldyBFcnJvcignTm8gY29vcmRpbmF0ZXMgcGFzc2VkJyk7XG4gICAgaWYgKGNvb3JkaW5hdGVzLmxlbmd0aCA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoJ0Nvb3JkaW5hdGVzIG11c3QgYmUgYW4gYXJyYXknKTtcbiAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoIDwgMikgdGhyb3cgbmV3IEVycm9yKCdDb29yZGluYXRlcyBtdXN0IGJlIGF0IGxlYXN0IDIgbnVtYmVycyBsb25nJyk7XG4gICAgaWYgKCFpc051bWJlcihjb29yZGluYXRlc1swXSkgfHwgIWlzTnVtYmVyKGNvb3JkaW5hdGVzWzFdKSkgdGhyb3cgbmV3IEVycm9yKCdDb29yZGluYXRlcyBtdXN0IGNvbnRhaW4gbnVtYmVycycpO1xuXG4gICAgcmV0dXJuIGZlYXR1cmUoe1xuICAgICAgICB0eXBlOiAnUG9pbnQnLFxuICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXNcbiAgICB9LCBwcm9wZXJ0aWVzLCBiYm94LCBpZCk7XG59XG5cbi8qKlxuICogVGFrZXMgYW4gYXJyYXkgb2YgTGluZWFyUmluZ3MgYW5kIG9wdGlvbmFsbHkgYW4ge0BsaW5rIE9iamVjdH0gd2l0aCBwcm9wZXJ0aWVzIGFuZCByZXR1cm5zIGEge0BsaW5rIFBvbHlnb259IGZlYXR1cmUuXG4gKlxuICogQG5hbWUgcG9seWdvblxuICogQHBhcmFtIHtBcnJheTxBcnJheTxBcnJheTxudW1iZXI+Pj59IGNvb3JkaW5hdGVzIGFuIGFycmF5IG9mIExpbmVhclJpbmdzXG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2lkXSBJZGVudGlmaWVyXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxQb2x5Z29uPn0gYSBQb2x5Z29uIGZlYXR1cmVcbiAqIEB0aHJvd3Mge0Vycm9yfSB0aHJvdyBhbiBlcnJvciBpZiBhIExpbmVhclJpbmcgb2YgdGhlIHBvbHlnb24gaGFzIHRvbyBmZXcgcG9zaXRpb25zXG4gKiBvciBpZiBhIExpbmVhclJpbmcgb2YgdGhlIFBvbHlnb24gZG9lcyBub3QgaGF2ZSBtYXRjaGluZyBQb3NpdGlvbnMgYXQgdGhlIGJlZ2lubmluZyAmIGVuZC5cbiAqIEBleGFtcGxlXG4gKiB2YXIgcG9seWdvbiA9IHR1cmYucG9seWdvbihbW1xuICogICBbLTIuMjc1NTQzLCA1My40NjQ1NDddLFxuICogICBbLTIuMjc1NTQzLCA1My40ODkyNzFdLFxuICogICBbLTIuMjE1MTE4LCA1My40ODkyNzFdLFxuICogICBbLTIuMjE1MTE4LCA1My40NjQ1NDddLFxuICogICBbLTIuMjc1NTQzLCA1My40NjQ1NDddXG4gKiBdXSwgeyBuYW1lOiAncG9seTEnLCBwb3B1bGF0aW9uOiA0MDB9KTtcbiAqXG4gKiAvLz1wb2x5Z29uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwb2x5Z29uKGNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzLCBiYm94LCBpZCkge1xuICAgIGlmICghY29vcmRpbmF0ZXMpIHRocm93IG5ldyBFcnJvcignTm8gY29vcmRpbmF0ZXMgcGFzc2VkJyk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3JkaW5hdGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciByaW5nID0gY29vcmRpbmF0ZXNbaV07XG4gICAgICAgIGlmIChyaW5nLmxlbmd0aCA8IDQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRWFjaCBMaW5lYXJSaW5nIG9mIGEgUG9seWdvbiBtdXN0IGhhdmUgNCBvciBtb3JlIFBvc2l0aW9ucy4nKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJpbmdbcmluZy5sZW5ndGggLSAxXS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgZmlyc3QgcG9pbnQgb2YgUG9seWdvbiBjb250YWlucyB0d28gbnVtYmVyc1xuICAgICAgICAgICAgaWYgKGkgPT09IDAgJiYgaiA9PT0gMCAmJiAhaXNOdW1iZXIocmluZ1swXVswXSkgfHwgIWlzTnVtYmVyKHJpbmdbMF1bMV0pKSB0aHJvdyBuZXcgRXJyb3IoJ0Nvb3JkaW5hdGVzIG11c3QgY29udGFpbiBudW1iZXJzJyk7XG4gICAgICAgICAgICBpZiAocmluZ1tyaW5nLmxlbmd0aCAtIDFdW2pdICE9PSByaW5nWzBdW2pdKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhbmQgbGFzdCBQb3NpdGlvbiBhcmUgbm90IGVxdWl2YWxlbnQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmVhdHVyZSh7XG4gICAgICAgIHR5cGU6ICdQb2x5Z29uJyxcbiAgICAgICAgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzXG4gICAgfSwgcHJvcGVydGllcywgYmJveCwgaWQpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgTGluZVN0cmluZ30gYmFzZWQgb24gYVxuICogY29vcmRpbmF0ZSBhcnJheS4gUHJvcGVydGllcyBjYW4gYmUgYWRkZWQgb3B0aW9uYWxseS5cbiAqXG4gKiBAbmFtZSBsaW5lU3RyaW5nXG4gKiBAcGFyYW0ge0FycmF5PEFycmF5PG51bWJlcj4+fSBjb29yZGluYXRlcyBhbiBhcnJheSBvZiBQb3NpdGlvbnNcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV0gYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlPExpbmVTdHJpbmc+fSBhIExpbmVTdHJpbmcgZmVhdHVyZVxuICogQHRocm93cyB7RXJyb3J9IGlmIG5vIGNvb3JkaW5hdGVzIGFyZSBwYXNzZWRcbiAqIEBleGFtcGxlXG4gKiB2YXIgbGluZXN0cmluZzEgPSB0dXJmLmxpbmVTdHJpbmcoW1xuICogICBbLTIxLjk2NDQxNiwgNjQuMTQ4MjAzXSxcbiAqICAgWy0yMS45NTYxNzYsIDY0LjE0MTMxNl0sXG4gKiAgIFstMjEuOTM5MDEsIDY0LjEzNTkyNF0sXG4gKiAgIFstMjEuOTI3MzM3LCA2NC4xMzY2NzNdXG4gKiBdKTtcbiAqIHZhciBsaW5lc3RyaW5nMiA9IHR1cmYubGluZVN0cmluZyhbXG4gKiAgIFstMjEuOTI5MDU0LCA2NC4xMjc5ODVdLFxuICogICBbLTIxLjkxMjkxOCwgNjQuMTM0NzI2XSxcbiAqICAgWy0yMS45MTYwMDcsIDY0LjE0MTAxNl0sXG4gKiAgIFstMjEuOTMwMDg0LCA2NC4xNDQ0Nl1cbiAqIF0sIHtuYW1lOiAnbGluZSAxJywgZGlzdGFuY2U6IDE0NX0pO1xuICpcbiAqIC8vPWxpbmVzdHJpbmcxXG4gKlxuICogLy89bGluZXN0cmluZzJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpbmVTdHJpbmcoY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFjb29yZGluYXRlcykgdGhyb3cgbmV3IEVycm9yKCdObyBjb29yZGluYXRlcyBwYXNzZWQnKTtcbiAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoIDwgMikgdGhyb3cgbmV3IEVycm9yKCdDb29yZGluYXRlcyBtdXN0IGJlIGFuIGFycmF5IG9mIHR3byBvciBtb3JlIHBvc2l0aW9ucycpO1xuICAgIC8vIENoZWNrIGlmIGZpcnN0IHBvaW50IG9mIExpbmVTdHJpbmcgY29udGFpbnMgdHdvIG51bWJlcnNcbiAgICBpZiAoIWlzTnVtYmVyKGNvb3JkaW5hdGVzWzBdWzFdKSB8fCAhaXNOdW1iZXIoY29vcmRpbmF0ZXNbMF1bMV0pKSB0aHJvdyBuZXcgRXJyb3IoJ0Nvb3JkaW5hdGVzIG11c3QgY29udGFpbiBudW1iZXJzJyk7XG5cbiAgICByZXR1cm4gZmVhdHVyZSh7XG4gICAgICAgIHR5cGU6ICdMaW5lU3RyaW5nJyxcbiAgICAgICAgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzXG4gICAgfSwgcHJvcGVydGllcywgYmJveCwgaWQpO1xufVxuXG4vKipcbiAqIFRha2VzIG9uZSBvciBtb3JlIHtAbGluayBGZWF0dXJlfEZlYXR1cmVzfSBhbmQgY3JlYXRlcyBhIHtAbGluayBGZWF0dXJlQ29sbGVjdGlvbn0uXG4gKlxuICogQG5hbWUgZmVhdHVyZUNvbGxlY3Rpb25cbiAqIEBwYXJhbSB7RmVhdHVyZVtdfSBmZWF0dXJlcyBpbnB1dCBmZWF0dXJlc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlQ29sbGVjdGlvbn0gYSBGZWF0dXJlQ29sbGVjdGlvbiBvZiBpbnB1dCBmZWF0dXJlc1xuICogQGV4YW1wbGVcbiAqIHZhciBmZWF0dXJlcyA9IFtcbiAqICB0dXJmLnBvaW50KFstNzUuMzQzLCAzOS45ODRdLCB7bmFtZTogJ0xvY2F0aW9uIEEnfSksXG4gKiAgdHVyZi5wb2ludChbLTc1LjgzMywgMzkuMjg0XSwge25hbWU6ICdMb2NhdGlvbiBCJ30pLFxuICogIHR1cmYucG9pbnQoWy03NS41MzQsIDM5LjEyM10sIHtuYW1lOiAnTG9jYXRpb24gQyd9KVxuICogXTtcbiAqXG4gKiB2YXIgY29sbGVjdGlvbiA9IHR1cmYuZmVhdHVyZUNvbGxlY3Rpb24oZmVhdHVyZXMpO1xuICpcbiAqIC8vPWNvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZlYXR1cmVDb2xsZWN0aW9uKGZlYXR1cmVzLCBiYm94LCBpZCkge1xuICAgIGlmICghZmVhdHVyZXMpIHRocm93IG5ldyBFcnJvcignTm8gZmVhdHVyZXMgcGFzc2VkJyk7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGZlYXR1cmVzKSkgdGhyb3cgbmV3IEVycm9yKCdmZWF0dXJlcyBtdXN0IGJlIGFuIEFycmF5Jyk7XG4gICAgaWYgKGJib3ggJiYgYmJveC5sZW5ndGggIT09IDQpIHRocm93IG5ldyBFcnJvcignYmJveCBtdXN0IGJlIGFuIEFycmF5IG9mIDQgbnVtYmVycycpO1xuICAgIGlmIChpZCAmJiBbJ3N0cmluZycsICdudW1iZXInXS5pbmRleE9mKHR5cGVvZiBpZCkgPT09IC0xKSB0aHJvdyBuZXcgRXJyb3IoJ2lkIG11c3QgYmUgYSBudW1iZXIgb3IgYSBzdHJpbmcnKTtcblxuICAgIHZhciBmYyA9IHt0eXBlOiAnRmVhdHVyZUNvbGxlY3Rpb24nfTtcbiAgICBpZiAoaWQpIGZjLmlkID0gaWQ7XG4gICAgaWYgKGJib3gpIGZjLmJib3ggPSBiYm94O1xuICAgIGZjLmZlYXR1cmVzID0gZmVhdHVyZXM7XG4gICAgcmV0dXJuIGZjO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgRmVhdHVyZTxNdWx0aUxpbmVTdHJpbmc+fSBiYXNlZCBvbiBhXG4gKiBjb29yZGluYXRlIGFycmF5LiBQcm9wZXJ0aWVzIGNhbiBiZSBhZGRlZCBvcHRpb25hbGx5LlxuICpcbiAqIEBuYW1lIG11bHRpTGluZVN0cmluZ1xuICogQHBhcmFtIHtBcnJheTxBcnJheTxBcnJheTxudW1iZXI+Pj59IGNvb3JkaW5hdGVzIGFuIGFycmF5IG9mIExpbmVTdHJpbmdzXG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2lkXSBJZGVudGlmaWVyXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxNdWx0aUxpbmVTdHJpbmc+fSBhIE11bHRpTGluZVN0cmluZyBmZWF0dXJlXG4gKiBAdGhyb3dzIHtFcnJvcn0gaWYgbm8gY29vcmRpbmF0ZXMgYXJlIHBhc3NlZFxuICogQGV4YW1wbGVcbiAqIHZhciBtdWx0aUxpbmUgPSB0dXJmLm11bHRpTGluZVN0cmluZyhbW1swLDBdLFsxMCwxMF1dXSk7XG4gKlxuICogLy89bXVsdGlMaW5lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aUxpbmVTdHJpbmcoY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFjb29yZGluYXRlcykgdGhyb3cgbmV3IEVycm9yKCdObyBjb29yZGluYXRlcyBwYXNzZWQnKTtcblxuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ011bHRpTGluZVN0cmluZycsXG4gICAgICAgIGNvb3JkaW5hdGVzOiBjb29yZGluYXRlc1xuICAgIH0sIHByb3BlcnRpZXMsIGJib3gsIGlkKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEge0BsaW5rIEZlYXR1cmU8TXVsdGlQb2ludD59IGJhc2VkIG9uIGFcbiAqIGNvb3JkaW5hdGUgYXJyYXkuIFByb3BlcnRpZXMgY2FuIGJlIGFkZGVkIG9wdGlvbmFsbHkuXG4gKlxuICogQG5hbWUgbXVsdGlQb2ludFxuICogQHBhcmFtIHtBcnJheTxBcnJheTxudW1iZXI+Pn0gY29vcmRpbmF0ZXMgYW4gYXJyYXkgb2YgUG9zaXRpb25zXG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2lkXSBJZGVudGlmaWVyXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxNdWx0aVBvaW50Pn0gYSBNdWx0aVBvaW50IGZlYXR1cmVcbiAqIEB0aHJvd3Mge0Vycm9yfSBpZiBubyBjb29yZGluYXRlcyBhcmUgcGFzc2VkXG4gKiBAZXhhbXBsZVxuICogdmFyIG11bHRpUHQgPSB0dXJmLm11bHRpUG9pbnQoW1swLDBdLFsxMCwxMF1dKTtcbiAqXG4gKiAvLz1tdWx0aVB0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aVBvaW50KGNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzLCBiYm94LCBpZCkge1xuICAgIGlmICghY29vcmRpbmF0ZXMpIHRocm93IG5ldyBFcnJvcignTm8gY29vcmRpbmF0ZXMgcGFzc2VkJyk7XG5cbiAgICByZXR1cm4gZmVhdHVyZSh7XG4gICAgICAgIHR5cGU6ICdNdWx0aVBvaW50JyxcbiAgICAgICAgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzXG4gICAgfSwgcHJvcGVydGllcywgYmJveCwgaWQpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgRmVhdHVyZTxNdWx0aVBvbHlnb24+fSBiYXNlZCBvbiBhXG4gKiBjb29yZGluYXRlIGFycmF5LiBQcm9wZXJ0aWVzIGNhbiBiZSBhZGRlZCBvcHRpb25hbGx5LlxuICpcbiAqIEBuYW1lIG11bHRpUG9seWdvblxuICogQHBhcmFtIHtBcnJheTxBcnJheTxBcnJheTxBcnJheTxudW1iZXI+Pj4+fSBjb29yZGluYXRlcyBhbiBhcnJheSBvZiBQb2x5Z29uc1xuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtpZF0gSWRlbnRpZmllclxuICogQHJldHVybnMge0ZlYXR1cmU8TXVsdGlQb2x5Z29uPn0gYSBtdWx0aXBvbHlnb24gZmVhdHVyZVxuICogQHRocm93cyB7RXJyb3J9IGlmIG5vIGNvb3JkaW5hdGVzIGFyZSBwYXNzZWRcbiAqIEBleGFtcGxlXG4gKiB2YXIgbXVsdGlQb2x5ID0gdHVyZi5tdWx0aVBvbHlnb24oW1tbWzAsMF0sWzAsMTBdLFsxMCwxMF0sWzEwLDBdLFswLDBdXV1dKTtcbiAqXG4gKiAvLz1tdWx0aVBvbHlcbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aVBvbHlnb24oY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFjb29yZGluYXRlcykgdGhyb3cgbmV3IEVycm9yKCdObyBjb29yZGluYXRlcyBwYXNzZWQnKTtcblxuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ011bHRpUG9seWdvbicsXG4gICAgICAgIGNvb3JkaW5hdGVzOiBjb29yZGluYXRlc1xuICAgIH0sIHByb3BlcnRpZXMsIGJib3gsIGlkKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEge0BsaW5rIEZlYXR1cmU8R2VvbWV0cnlDb2xsZWN0aW9uPn0gYmFzZWQgb24gYVxuICogY29vcmRpbmF0ZSBhcnJheS4gUHJvcGVydGllcyBjYW4gYmUgYWRkZWQgb3B0aW9uYWxseS5cbiAqXG4gKiBAbmFtZSBnZW9tZXRyeUNvbGxlY3Rpb25cbiAqIEBwYXJhbSB7QXJyYXk8R2VvbWV0cnk+fSBnZW9tZXRyaWVzIGFuIGFycmF5IG9mIEdlb0pTT04gR2VvbWV0cmllc1xuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtpZF0gSWRlbnRpZmllclxuICogQHJldHVybnMge0ZlYXR1cmU8R2VvbWV0cnlDb2xsZWN0aW9uPn0gYSBHZW9KU09OIEdlb21ldHJ5Q29sbGVjdGlvbiBGZWF0dXJlXG4gKiBAZXhhbXBsZVxuICogdmFyIHB0ID0ge1xuICogICAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gKiAgICAgICBcImNvb3JkaW5hdGVzXCI6IFsxMDAsIDBdXG4gKiAgICAgfTtcbiAqIHZhciBsaW5lID0ge1xuICogICAgIFwidHlwZVwiOiBcIkxpbmVTdHJpbmdcIixcbiAqICAgICBcImNvb3JkaW5hdGVzXCI6IFsgWzEwMSwgMF0sIFsxMDIsIDFdIF1cbiAqICAgfTtcbiAqIHZhciBjb2xsZWN0aW9uID0gdHVyZi5nZW9tZXRyeUNvbGxlY3Rpb24oW3B0LCBsaW5lXSk7XG4gKlxuICogLy89Y29sbGVjdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VvbWV0cnlDb2xsZWN0aW9uKGdlb21ldHJpZXMsIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFnZW9tZXRyaWVzKSB0aHJvdyBuZXcgRXJyb3IoJ2dlb21ldHJpZXMgaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZ2VvbWV0cmllcykpIHRocm93IG5ldyBFcnJvcignZ2VvbWV0cmllcyBtdXN0IGJlIGFuIEFycmF5Jyk7XG5cbiAgICByZXR1cm4gZmVhdHVyZSh7XG4gICAgICAgIHR5cGU6ICdHZW9tZXRyeUNvbGxlY3Rpb24nLFxuICAgICAgICBnZW9tZXRyaWVzOiBnZW9tZXRyaWVzXG4gICAgfSwgcHJvcGVydGllcywgYmJveCwgaWQpO1xufVxuXG4vKipcbiAqIFJvdW5kIG51bWJlciB0byBwcmVjaXNpb25cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gbnVtIE51bWJlclxuICogQHBhcmFtIHtudW1iZXJ9IFtwcmVjaXNpb249MF0gUHJlY2lzaW9uXG4gKiBAcmV0dXJucyB7bnVtYmVyfSByb3VuZGVkIG51bWJlclxuICogQGV4YW1wbGVcbiAqIHR1cmYucm91bmQoMTIwLjQzMjEpXG4gKiAvLz0xMjBcbiAqXG4gKiB0dXJmLnJvdW5kKDEyMC40MzIxLCAyKVxuICogLy89MTIwLjQzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3VuZChudW0sIHByZWNpc2lvbikge1xuICAgIGlmIChudW0gPT09IHVuZGVmaW5lZCB8fCBudW0gPT09IG51bGwgfHwgaXNOYU4obnVtKSkgdGhyb3cgbmV3IEVycm9yKCdudW0gaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAocHJlY2lzaW9uICYmICEocHJlY2lzaW9uID49IDApKSB0aHJvdyBuZXcgRXJyb3IoJ3ByZWNpc2lvbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gICAgdmFyIG11bHRpcGxpZXIgPSBNYXRoLnBvdygxMCwgcHJlY2lzaW9uIHx8IDApO1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG51bSAqIG11bHRpcGxpZXIpIC8gbXVsdGlwbGllcjtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgZGlzdGFuY2UgbWVhc3VyZW1lbnQgKGFzc3VtaW5nIGEgc3BoZXJpY2FsIEVhcnRoKSBmcm9tIHJhZGlhbnMgdG8gYSBtb3JlIGZyaWVuZGx5IHVuaXQuXG4gKiBWYWxpZCB1bml0czogbWlsZXMsIG5hdXRpY2FsbWlsZXMsIGluY2hlcywgeWFyZHMsIG1ldGVycywgbWV0cmVzLCBraWxvbWV0ZXJzLCBjZW50aW1ldGVycywgZmVldFxuICpcbiAqIEBuYW1lIHJhZGlhbnNUb0Rpc3RhbmNlXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkaWFucyBpbiByYWRpYW5zIGFjcm9zcyB0aGUgc3BoZXJlXG4gKiBAcGFyYW0ge3N0cmluZ30gW3VuaXRzPSdraWxvbWV0ZXJzJ10gY2FuIGJlIGRlZ3JlZXMsIHJhZGlhbnMsIG1pbGVzLCBvciBraWxvbWV0ZXJzIGluY2hlcywgeWFyZHMsIG1ldHJlcywgbWV0ZXJzLCBraWxvbWV0cmVzLCBraWxvbWV0ZXJzLlxuICogQHJldHVybnMge251bWJlcn0gZGlzdGFuY2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJhZGlhbnNUb0Rpc3RhbmNlKHJhZGlhbnMsIHVuaXRzKSB7XG4gICAgaWYgKHJhZGlhbnMgPT09IHVuZGVmaW5lZCB8fCByYWRpYW5zID09PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoJ3JhZGlhbnMgaXMgcmVxdWlyZWQnKTtcblxuICAgIGlmICh1bml0cyAmJiB0eXBlb2YgdW5pdHMgIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgRXJyb3IoJ3VuaXRzIG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgICB2YXIgZmFjdG9yID0gZmFjdG9yc1t1bml0cyB8fCAna2lsb21ldGVycyddO1xuICAgIGlmICghZmFjdG9yKSB0aHJvdyBuZXcgRXJyb3IodW5pdHMgKyAnIHVuaXRzIGlzIGludmFsaWQnKTtcbiAgICByZXR1cm4gcmFkaWFucyAqIGZhY3Rvcjtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgZGlzdGFuY2UgbWVhc3VyZW1lbnQgKGFzc3VtaW5nIGEgc3BoZXJpY2FsIEVhcnRoKSBmcm9tIGEgcmVhbC13b3JsZCB1bml0IGludG8gcmFkaWFuc1xuICogVmFsaWQgdW5pdHM6IG1pbGVzLCBuYXV0aWNhbG1pbGVzLCBpbmNoZXMsIHlhcmRzLCBtZXRlcnMsIG1ldHJlcywga2lsb21ldGVycywgY2VudGltZXRlcnMsIGZlZXRcbiAqXG4gKiBAbmFtZSBkaXN0YW5jZVRvUmFkaWFuc1xuICogQHBhcmFtIHtudW1iZXJ9IGRpc3RhbmNlIGluIHJlYWwgdW5pdHNcbiAqIEBwYXJhbSB7c3RyaW5nfSBbdW5pdHM9J2tpbG9tZXRlcnMnXSBjYW4gYmUgZGVncmVlcywgcmFkaWFucywgbWlsZXMsIG9yIGtpbG9tZXRlcnMgaW5jaGVzLCB5YXJkcywgbWV0cmVzLCBtZXRlcnMsIGtpbG9tZXRyZXMsIGtpbG9tZXRlcnMuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSByYWRpYW5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZVRvUmFkaWFucyhkaXN0YW5jZSwgdW5pdHMpIHtcbiAgICBpZiAoZGlzdGFuY2UgPT09IHVuZGVmaW5lZCB8fCBkaXN0YW5jZSA9PT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKCdkaXN0YW5jZSBpcyByZXF1aXJlZCcpO1xuXG4gICAgaWYgKHVuaXRzICYmIHR5cGVvZiB1bml0cyAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcigndW5pdHMgbXVzdCBiZSBhIHN0cmluZycpO1xuICAgIHZhciBmYWN0b3IgPSBmYWN0b3JzW3VuaXRzIHx8ICdraWxvbWV0ZXJzJ107XG4gICAgaWYgKCFmYWN0b3IpIHRocm93IG5ldyBFcnJvcih1bml0cyArICcgdW5pdHMgaXMgaW52YWxpZCcpO1xuICAgIHJldHVybiBkaXN0YW5jZSAvIGZhY3Rvcjtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgZGlzdGFuY2UgbWVhc3VyZW1lbnQgKGFzc3VtaW5nIGEgc3BoZXJpY2FsIEVhcnRoKSBmcm9tIGEgcmVhbC13b3JsZCB1bml0IGludG8gZGVncmVlc1xuICogVmFsaWQgdW5pdHM6IG1pbGVzLCBuYXV0aWNhbG1pbGVzLCBpbmNoZXMsIHlhcmRzLCBtZXRlcnMsIG1ldHJlcywgY2VudGltZXRlcnMsIGtpbG9tZXRyZXMsIGZlZXRcbiAqXG4gKiBAbmFtZSBkaXN0YW5jZVRvRGVncmVlc1xuICogQHBhcmFtIHtudW1iZXJ9IGRpc3RhbmNlIGluIHJlYWwgdW5pdHNcbiAqIEBwYXJhbSB7c3RyaW5nfSBbdW5pdHM9J2tpbG9tZXRlcnMnXSBjYW4gYmUgZGVncmVlcywgcmFkaWFucywgbWlsZXMsIG9yIGtpbG9tZXRlcnMgaW5jaGVzLCB5YXJkcywgbWV0cmVzLCBtZXRlcnMsIGtpbG9tZXRyZXMsIGtpbG9tZXRlcnMuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBkZWdyZWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZVRvRGVncmVlcyhkaXN0YW5jZSwgdW5pdHMpIHtcbiAgICByZXR1cm4gcmFkaWFuczJkZWdyZWVzKGRpc3RhbmNlVG9SYWRpYW5zKGRpc3RhbmNlLCB1bml0cykpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGFueSBiZWFyaW5nIGFuZ2xlIGZyb20gdGhlIG5vcnRoIGxpbmUgZGlyZWN0aW9uIChwb3NpdGl2ZSBjbG9ja3dpc2UpXG4gKiBhbmQgcmV0dXJucyBhbiBhbmdsZSBiZXR3ZWVuIDAtMzYwIGRlZ3JlZXMgKHBvc2l0aXZlIGNsb2Nrd2lzZSksIDAgYmVpbmcgdGhlIG5vcnRoIGxpbmVcbiAqXG4gKiBAbmFtZSBiZWFyaW5nVG9BbmdsZVxuICogQHBhcmFtIHtudW1iZXJ9IGJlYXJpbmcgYW5nbGUsIGJldHdlZW4gLTE4MCBhbmQgKzE4MCBkZWdyZWVzXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBhbmdsZSBiZXR3ZWVuIDAgYW5kIDM2MCBkZWdyZWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZWFyaW5nVG9BbmdsZShiZWFyaW5nKSB7XG4gICAgaWYgKGJlYXJpbmcgPT09IG51bGwgfHwgYmVhcmluZyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoJ2JlYXJpbmcgaXMgcmVxdWlyZWQnKTtcblxuICAgIHZhciBhbmdsZSA9IGJlYXJpbmcgJSAzNjA7XG4gICAgaWYgKGFuZ2xlIDwgMCkgYW5nbGUgKz0gMzYwO1xuICAgIHJldHVybiBhbmdsZTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhbiBhbmdsZSBpbiByYWRpYW5zIHRvIGRlZ3JlZXNcbiAqXG4gKiBAbmFtZSByYWRpYW5zMmRlZ3JlZXNcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWRpYW5zIGFuZ2xlIGluIHJhZGlhbnNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGRlZ3JlZXMgYmV0d2VlbiAwIGFuZCAzNjAgZGVncmVlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmFkaWFuczJkZWdyZWVzKHJhZGlhbnMpIHtcbiAgICBpZiAocmFkaWFucyA9PT0gbnVsbCB8fCByYWRpYW5zID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcigncmFkaWFucyBpcyByZXF1aXJlZCcpO1xuXG4gICAgdmFyIGRlZ3JlZXMgPSByYWRpYW5zICUgKDIgKiBNYXRoLlBJKTtcbiAgICByZXR1cm4gZGVncmVlcyAqIDE4MCAvIE1hdGguUEk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYW4gYW5nbGUgaW4gZGVncmVlcyB0byByYWRpYW5zXG4gKlxuICogQG5hbWUgZGVncmVlczJyYWRpYW5zXG4gKiBAcGFyYW0ge251bWJlcn0gZGVncmVlcyBhbmdsZSBiZXR3ZWVuIDAgYW5kIDM2MCBkZWdyZWVzXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBhbmdsZSBpbiByYWRpYW5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWdyZWVzMnJhZGlhbnMoZGVncmVlcykge1xuICAgIGlmIChkZWdyZWVzID09PSBudWxsIHx8IGRlZ3JlZXMgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKCdkZWdyZWVzIGlzIHJlcXVpcmVkJyk7XG5cbiAgICB2YXIgcmFkaWFucyA9IGRlZ3JlZXMgJSAzNjA7XG4gICAgcmV0dXJuIHJhZGlhbnMgKiBNYXRoLlBJIC8gMTgwO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgZGlzdGFuY2UgdG8gdGhlIHJlcXVlc3RlZCB1bml0LlxuICogVmFsaWQgdW5pdHM6IG1pbGVzLCBuYXV0aWNhbG1pbGVzLCBpbmNoZXMsIHlhcmRzLCBtZXRlcnMsIG1ldHJlcywga2lsb21ldGVycywgY2VudGltZXRlcnMsIGZlZXRcbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gZGlzdGFuY2UgdG8gYmUgY29udmVydGVkXG4gKiBAcGFyYW0ge3N0cmluZ30gb3JpZ2luYWxVbml0IG9mIHRoZSBkaXN0YW5jZVxuICogQHBhcmFtIHtzdHJpbmd9IFtmaW5hbFVuaXQ9J2tpbG9tZXRlcnMnXSByZXR1cm5lZCB1bml0XG4gKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgY29udmVydGVkIGRpc3RhbmNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0RGlzdGFuY2UoZGlzdGFuY2UsIG9yaWdpbmFsVW5pdCwgZmluYWxVbml0KSB7XG4gICAgaWYgKGRpc3RhbmNlID09PSBudWxsIHx8IGRpc3RhbmNlID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcignZGlzdGFuY2UgaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAoIShkaXN0YW5jZSA+PSAwKSkgdGhyb3cgbmV3IEVycm9yKCdkaXN0YW5jZSBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG5cbiAgICB2YXIgY29udmVydGVkRGlzdGFuY2UgPSByYWRpYW5zVG9EaXN0YW5jZShkaXN0YW5jZVRvUmFkaWFucyhkaXN0YW5jZSwgb3JpZ2luYWxVbml0KSwgZmluYWxVbml0IHx8ICdraWxvbWV0ZXJzJyk7XG4gICAgcmV0dXJuIGNvbnZlcnRlZERpc3RhbmNlO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgYXJlYSB0byB0aGUgcmVxdWVzdGVkIHVuaXQuXG4gKiBWYWxpZCB1bml0czoga2lsb21ldGVycywga2lsb21ldHJlcywgbWV0ZXJzLCBtZXRyZXMsIGNlbnRpbWV0cmVzLCBtaWxsaW1ldGVyLCBhY3JlLCBtaWxlLCB5YXJkLCBmb290LCBpbmNoXG4gKiBAcGFyYW0ge251bWJlcn0gYXJlYSB0byBiZSBjb252ZXJ0ZWRcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3JpZ2luYWxVbml0PSdtZXRlcnMnXSBvZiB0aGUgZGlzdGFuY2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBbZmluYWxVbml0PSdraWxvbWV0ZXJzJ10gcmV0dXJuZWQgdW5pdFxuICogQHJldHVybnMge251bWJlcn0gdGhlIGNvbnZlcnRlZCBkaXN0YW5jZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udmVydEFyZWEoYXJlYSwgb3JpZ2luYWxVbml0LCBmaW5hbFVuaXQpIHtcbiAgICBpZiAoYXJlYSA9PT0gbnVsbCB8fCBhcmVhID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcignYXJlYSBpcyByZXF1aXJlZCcpO1xuICAgIGlmICghKGFyZWEgPj0gMCkpIHRocm93IG5ldyBFcnJvcignYXJlYSBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG5cbiAgICB2YXIgc3RhcnRGYWN0b3IgPSBhcmVhRmFjdG9yc1tvcmlnaW5hbFVuaXQgfHwgJ21ldGVycyddO1xuICAgIGlmICghc3RhcnRGYWN0b3IpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBvcmlnaW5hbCB1bml0cycpO1xuXG4gICAgdmFyIGZpbmFsRmFjdG9yID0gYXJlYUZhY3RvcnNbZmluYWxVbml0IHx8ICdraWxvbWV0ZXJzJ107XG4gICAgaWYgKCFmaW5hbEZhY3RvcikgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZpbmFsIHVuaXRzJyk7XG5cbiAgICByZXR1cm4gKGFyZWEgLyBzdGFydEZhY3RvcikgKiBmaW5hbEZhY3Rvcjtcbn1cblxuLyoqXG4gKiBpc051bWJlclxuICpcbiAqIEBwYXJhbSB7Kn0gbnVtIE51bWJlciB0byB2YWxpZGF0ZVxuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUvZmFsc2VcbiAqIEBleGFtcGxlXG4gKiB0dXJmLmlzTnVtYmVyKDEyMylcbiAqIC8vPXRydWVcbiAqIHR1cmYuaXNOdW1iZXIoJ2ZvbycpXG4gKiAvLz1mYWxzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNOdW1iZXIobnVtKSB7XG4gICAgcmV0dXJuICFpc05hTihudW0pICYmIG51bSAhPT0gbnVsbCAmJiAhQXJyYXkuaXNBcnJheShudW0pO1xufVxuXG4vKipcbiAqIGlzT2JqZWN0XG4gKlxuICogQHBhcmFtIHsqfSBpbnB1dCB2YXJpYWJsZSB0byB2YWxpZGF0ZVxuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUvZmFsc2VcbiAqIEBleGFtcGxlXG4gKiB0dXJmLmlzT2JqZWN0KHtlbGV2YXRpb246IDEwfSlcbiAqIC8vPXRydWVcbiAqIHR1cmYuaXNPYmplY3QoJ2ZvbycpXG4gKiAvLz1mYWxzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNPYmplY3QoaW5wdXQpIHtcbiAgICByZXR1cm4gKCEhaW5wdXQpICYmIChpbnB1dC5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0B0dXJmL2hlbHBlcnMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDI2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBpbnNpZGUgPSByZXF1aXJlKCdAdHVyZi9pbnNpZGUnKTtcbnZhciBmZWF0dXJlQ29sbGVjdGlvbiA9IHJlcXVpcmUoJ0B0dXJmL2hlbHBlcnMnKS5mZWF0dXJlQ29sbGVjdGlvbjtcblxuLyoqXG4gKiBUYWtlcyBhIHNldCBvZiB7QGxpbmsgUG9pbnR8cG9pbnRzfSBhbmQgYSBzZXQgb2Yge0BsaW5rIFBvbHlnb258cG9seWdvbnN9IGFuZCByZXR1cm5zIHRoZSBwb2ludHMgdGhhdCBmYWxsIHdpdGhpbiB0aGUgcG9seWdvbnMuXG4gKlxuICogQG5hbWUgd2l0aGluXG4gKiBAcGFyYW0ge0ZlYXR1cmVDb2xsZWN0aW9uPFBvaW50Pn0gcG9pbnRzIGlucHV0IHBvaW50c1xuICogQHBhcmFtIHtGZWF0dXJlQ29sbGVjdGlvbjxQb2x5Z29uPn0gcG9seWdvbnMgaW5wdXQgcG9seWdvbnNcbiAqIEByZXR1cm5zIHtGZWF0dXJlQ29sbGVjdGlvbjxQb2ludD59IHBvaW50cyB0aGF0IGxhbmQgd2l0aGluIGF0IGxlYXN0IG9uZSBwb2x5Z29uXG4gKiBAZXhhbXBsZVxuICogdmFyIHNlYXJjaFdpdGhpbiA9IHR1cmYuZmVhdHVyZUNvbGxlY3Rpb24oW1xuICogICAgIHR1cmYucG9seWdvbihbW1xuICogICAgICAgICBbLTQ2LjY1MywtMjMuNTQzXSxcbiAqICAgICAgICAgWy00Ni42MzQsLTIzLjUzNDZdLFxuICogICAgICAgICBbLTQ2LjYxMywtMjMuNTQzXSxcbiAqICAgICAgICAgWy00Ni42MTQsLTIzLjU1OV0sXG4gKiAgICAgICAgIFstNDYuNjMxLC0yMy41NjddLFxuICogICAgICAgICBbLTQ2LjY1MywtMjMuNTYwXSxcbiAqICAgICAgICAgWy00Ni42NTMsLTIzLjU0M11cbiAqICAgICBdXSlcbiAqIF0pO1xuICogdmFyIHBvaW50cyA9IHR1cmYuZmVhdHVyZUNvbGxlY3Rpb24oW1xuICogICAgIHR1cmYucG9pbnQoWy00Ni42MzE4LCAtMjMuNTUyM10pLFxuICogICAgIHR1cmYucG9pbnQoWy00Ni42MjQ2LCAtMjMuNTMyNV0pLFxuICogICAgIHR1cmYucG9pbnQoWy00Ni42MDYyLCAtMjMuNTUxM10pLFxuICogICAgIHR1cmYucG9pbnQoWy00Ni42NjMsIC0yMy41NTRdKSxcbiAqICAgICB0dXJmLnBvaW50KFstNDYuNjQzLCAtMjMuNTU3XSlcbiAqIF0pO1xuICpcbiAqIHZhciBwdHNXaXRoaW4gPSB0dXJmLndpdGhpbihwb2ludHMsIHNlYXJjaFdpdGhpbik7XG4gKlxuICogLy9hZGRUb01hcFxuICogdmFyIGFkZFRvTWFwID0gW3BvaW50cywgc2VhcmNoV2l0aGluLCBwdHNXaXRoaW5dXG4gKiB0dXJmLmZlYXR1cmVFYWNoKHB0c1dpdGhpbiwgZnVuY3Rpb24gKGN1cnJlbnRGZWF0dXJlKSB7XG4gKiAgIGN1cnJlbnRGZWF0dXJlLnByb3BlcnRpZXNbJ21hcmtlci1zaXplJ10gPSAnbGFyZ2UnO1xuICogICBjdXJyZW50RmVhdHVyZS5wcm9wZXJ0aWVzWydtYXJrZXItY29sb3InXSA9ICcjMDAwJztcbiAqIH0pO1xuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwb2ludHMsIHBvbHlnb25zKSB7XG4gICAgdmFyIHBvaW50c1dpdGhpbiA9IGZlYXR1cmVDb2xsZWN0aW9uKFtdKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvbHlnb25zLmZlYXR1cmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcG9pbnRzLmZlYXR1cmVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICB2YXIgaXNJbnNpZGUgPSBpbnNpZGUocG9pbnRzLmZlYXR1cmVzW2pdLCBwb2x5Z29ucy5mZWF0dXJlc1tpXSk7XG4gICAgICAgICAgICBpZiAoaXNJbnNpZGUpIHtcbiAgICAgICAgICAgICAgICBwb2ludHNXaXRoaW4uZmVhdHVyZXMucHVzaChwb2ludHMuZmVhdHVyZXNbal0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwb2ludHNXaXRoaW47XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQHR1cmYvd2l0aGluL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgaW52YXJpYW50ID0gcmVxdWlyZSgnQHR1cmYvaW52YXJpYW50Jyk7XG52YXIgZ2V0Q29vcmQgPSBpbnZhcmlhbnQuZ2V0Q29vcmQ7XG52YXIgZ2V0Q29vcmRzID0gaW52YXJpYW50LmdldENvb3JkcztcblxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9FdmVuJUUyJTgwJTkzb2RkX3J1bGVcbi8vIG1vZGlmaWVkIGZyb206IGh0dHBzOi8vZ2l0aHViLmNvbS9zdWJzdGFjay9wb2ludC1pbi1wb2x5Z29uL2Jsb2IvbWFzdGVyL2luZGV4LmpzXG4vLyB3aGljaCB3YXMgbW9kaWZpZWQgZnJvbSBodHRwOi8vd3d3LmVjc2UucnBpLmVkdS9Ib21lcGFnZXMvd3JmL1Jlc2VhcmNoL1Nob3J0X05vdGVzL3BucG9seS5odG1sXG5cbi8qKlxuICogVGFrZXMgYSB7QGxpbmsgUG9pbnR9IGFuZCBhIHtAbGluayBQb2x5Z29ufSBvciB7QGxpbmsgTXVsdGlQb2x5Z29ufSBhbmQgZGV0ZXJtaW5lcyBpZiB0aGUgcG9pbnQgcmVzaWRlcyBpbnNpZGUgdGhlIHBvbHlnb24uIFRoZSBwb2x5Z29uIGNhblxuICogYmUgY29udmV4IG9yIGNvbmNhdmUuIFRoZSBmdW5jdGlvbiBhY2NvdW50cyBmb3IgaG9sZXMuXG4gKlxuICogQG5hbWUgaW5zaWRlXG4gKiBAcGFyYW0ge0ZlYXR1cmU8UG9pbnQ+fSBwb2ludCBpbnB1dCBwb2ludFxuICogQHBhcmFtIHtGZWF0dXJlPFBvbHlnb258TXVsdGlQb2x5Z29uPn0gcG9seWdvbiBpbnB1dCBwb2x5Z29uIG9yIG11bHRpcG9seWdvblxuICogQHBhcmFtIHtib29sZWFufSBbaWdub3JlQm91bmRhcnk9ZmFsc2VdIFRydWUgaWYgcG9seWdvbiBib3VuZGFyeSBzaG91bGQgYmUgaWdub3JlZCB3aGVuIGRldGVybWluaW5nIGlmIHRoZSBwb2ludCBpcyBpbnNpZGUgdGhlIHBvbHlnb24gb3RoZXJ3aXNlIGZhbHNlLlxuICogQHJldHVybnMge2Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgUG9pbnQgaXMgaW5zaWRlIHRoZSBQb2x5Z29uOyBgZmFsc2VgIGlmIHRoZSBQb2ludCBpcyBub3QgaW5zaWRlIHRoZSBQb2x5Z29uXG4gKiBAZXhhbXBsZVxuICogdmFyIHB0ID0gdHVyZi5wb2ludChbLTc3LCA0NF0pO1xuICogdmFyIHBvbHkgPSB0dXJmLnBvbHlnb24oW1tcbiAqICAgWy04MSwgNDFdLFxuICogICBbLTgxLCA0N10sXG4gKiAgIFstNzIsIDQ3XSxcbiAqICAgWy03MiwgNDFdLFxuICogICBbLTgxLCA0MV1cbiAqIF1dKTtcbiAqXG4gKiB0dXJmLmluc2lkZShwdCwgcG9seSk7XG4gKiAvLz0gdHJ1ZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwb2ludCwgcG9seWdvbiwgaWdub3JlQm91bmRhcnkpIHtcbiAgICAvLyB2YWxpZGF0aW9uXG4gICAgaWYgKCFwb2ludCkgdGhyb3cgbmV3IEVycm9yKCdwb2ludCBpcyByZXF1aXJlZCcpO1xuICAgIGlmICghcG9seWdvbikgdGhyb3cgbmV3IEVycm9yKCdwb2x5Z29uIGlzIHJlcXVpcmVkJyk7XG5cbiAgICB2YXIgcHQgPSBnZXRDb29yZChwb2ludCk7XG4gICAgdmFyIHBvbHlzID0gZ2V0Q29vcmRzKHBvbHlnb24pO1xuICAgIHZhciB0eXBlID0gKHBvbHlnb24uZ2VvbWV0cnkpID8gcG9seWdvbi5nZW9tZXRyeS50eXBlIDogcG9seWdvbi50eXBlO1xuICAgIHZhciBiYm94ID0gcG9seWdvbi5iYm94O1xuXG4gICAgLy8gUXVpY2sgZWxpbWluYXRpb24gaWYgcG9pbnQgaXMgbm90IGluc2lkZSBiYm94XG4gICAgaWYgKGJib3ggJiYgaW5CQm94KHB0LCBiYm94KSA9PT0gZmFsc2UpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIG5vcm1hbGl6ZSB0byBtdWx0aXBvbHlnb25cbiAgICBpZiAodHlwZSA9PT0gJ1BvbHlnb24nKSBwb2x5cyA9IFtwb2x5c107XG5cbiAgICBmb3IgKHZhciBpID0gMCwgaW5zaWRlUG9seSA9IGZhbHNlOyBpIDwgcG9seXMubGVuZ3RoICYmICFpbnNpZGVQb2x5OyBpKyspIHtcbiAgICAgICAgLy8gY2hlY2sgaWYgaXQgaXMgaW4gdGhlIG91dGVyIHJpbmcgZmlyc3RcbiAgICAgICAgaWYgKGluUmluZyhwdCwgcG9seXNbaV1bMF0sIGlnbm9yZUJvdW5kYXJ5KSkge1xuICAgICAgICAgICAgdmFyIGluSG9sZSA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIGsgPSAxO1xuICAgICAgICAgICAgLy8gY2hlY2sgZm9yIHRoZSBwb2ludCBpbiBhbnkgb2YgdGhlIGhvbGVzXG4gICAgICAgICAgICB3aGlsZSAoayA8IHBvbHlzW2ldLmxlbmd0aCAmJiAhaW5Ib2xlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGluUmluZyhwdCwgcG9seXNbaV1ba10sICFpZ25vcmVCb3VuZGFyeSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5Ib2xlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaysrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpbkhvbGUpIGluc2lkZVBvbHkgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpbnNpZGVQb2x5O1xufTtcblxuLyoqXG4gKiBpblJpbmdcbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtbbnVtYmVyLCBudW1iZXJdfSBwdCBbeCx5XVxuICogQHBhcmFtIHtBcnJheTxbbnVtYmVyLCBudW1iZXJdPn0gcmluZyBbW3gseV0sIFt4LHldLC4uXVxuICogQHBhcmFtIHtib29sZWFufSBpZ25vcmVCb3VuZGFyeSBpZ25vcmVCb3VuZGFyeVxuICogQHJldHVybnMge2Jvb2xlYW59IGluUmluZ1xuICovXG5mdW5jdGlvbiBpblJpbmcocHQsIHJpbmcsIGlnbm9yZUJvdW5kYXJ5KSB7XG4gICAgdmFyIGlzSW5zaWRlID0gZmFsc2U7XG4gICAgaWYgKHJpbmdbMF1bMF0gPT09IHJpbmdbcmluZy5sZW5ndGggLSAxXVswXSAmJiByaW5nWzBdWzFdID09PSByaW5nW3JpbmcubGVuZ3RoIC0gMV1bMV0pIHJpbmcgPSByaW5nLnNsaWNlKDAsIHJpbmcubGVuZ3RoIC0gMSk7XG5cbiAgICBmb3IgKHZhciBpID0gMCwgaiA9IHJpbmcubGVuZ3RoIC0gMTsgaSA8IHJpbmcubGVuZ3RoOyBqID0gaSsrKSB7XG4gICAgICAgIHZhciB4aSA9IHJpbmdbaV1bMF0sIHlpID0gcmluZ1tpXVsxXTtcbiAgICAgICAgdmFyIHhqID0gcmluZ1tqXVswXSwgeWogPSByaW5nW2pdWzFdO1xuICAgICAgICB2YXIgb25Cb3VuZGFyeSA9IChwdFsxXSAqICh4aSAtIHhqKSArIHlpICogKHhqIC0gcHRbMF0pICsgeWogKiAocHRbMF0gLSB4aSkgPT09IDApICYmXG4gICAgICAgICAgICAoKHhpIC0gcHRbMF0pICogKHhqIC0gcHRbMF0pIDw9IDApICYmICgoeWkgLSBwdFsxXSkgKiAoeWogLSBwdFsxXSkgPD0gMCk7XG4gICAgICAgIGlmIChvbkJvdW5kYXJ5KSByZXR1cm4gIWlnbm9yZUJvdW5kYXJ5O1xuICAgICAgICB2YXIgaW50ZXJzZWN0ID0gKCh5aSA+IHB0WzFdKSAhPT0gKHlqID4gcHRbMV0pKSAmJlxuICAgICAgICAocHRbMF0gPCAoeGogLSB4aSkgKiAocHRbMV0gLSB5aSkgLyAoeWogLSB5aSkgKyB4aSk7XG4gICAgICAgIGlmIChpbnRlcnNlY3QpIGlzSW5zaWRlID0gIWlzSW5zaWRlO1xuICAgIH1cbiAgICByZXR1cm4gaXNJbnNpZGU7XG59XG5cbi8qKlxuICogaW5CQm94XG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7W251bWJlciwgbnVtYmVyXX0gcHQgcG9pbnQgW3gseV1cbiAqIEBwYXJhbSB7W251bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl19IGJib3ggQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUvZmFsc2UgaWYgcG9pbnQgaXMgaW5zaWRlIEJCb3hcbiAqL1xuZnVuY3Rpb24gaW5CQm94KHB0LCBiYm94KSB7XG4gICAgcmV0dXJuIGJib3hbMF0gPD0gcHRbMF0gJiZcbiAgICAgICAgICAgYmJveFsxXSA8PSBwdFsxXSAmJlxuICAgICAgICAgICBiYm94WzJdID49IHB0WzBdICYmXG4gICAgICAgICAgIGJib3hbM10gPj0gcHRbMV07XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AdHVyZi9pbnNpZGUvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDI4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogVW53cmFwIGEgY29vcmRpbmF0ZSBmcm9tIGEgUG9pbnQgRmVhdHVyZSwgR2VvbWV0cnkgb3IgYSBzaW5nbGUgY29vcmRpbmF0ZS5cbiAqXG4gKiBAbmFtZSBnZXRDb29yZFxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fEdlb21ldHJ5PFBvaW50PnxGZWF0dXJlPFBvaW50Pn0gb2JqIE9iamVjdFxuICogQHJldHVybnMge0FycmF5PG51bWJlcj59IGNvb3JkaW5hdGVzXG4gKiBAZXhhbXBsZVxuICogdmFyIHB0ID0gdHVyZi5wb2ludChbMTAsIDEwXSk7XG4gKlxuICogdmFyIGNvb3JkID0gdHVyZi5nZXRDb29yZChwdCk7XG4gKiAvLz0gWzEwLCAxMF1cbiAqL1xuZnVuY3Rpb24gZ2V0Q29vcmQob2JqKSB7XG4gICAgaWYgKCFvYmopIHRocm93IG5ldyBFcnJvcignb2JqIGlzIHJlcXVpcmVkJyk7XG5cbiAgICB2YXIgY29vcmRpbmF0ZXMgPSBnZXRDb29yZHMob2JqKTtcblxuICAgIC8vIGdldENvb3JkKCkgbXVzdCBjb250YWluIGF0IGxlYXN0IHR3byBudW1iZXJzIChQb2ludClcbiAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoID4gMSAmJlxuICAgICAgICB0eXBlb2YgY29vcmRpbmF0ZXNbMF0gPT09ICdudW1iZXInICYmXG4gICAgICAgIHR5cGVvZiBjb29yZGluYXRlc1sxXSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcmV0dXJuIGNvb3JkaW5hdGVzO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ29vcmRpbmF0ZSBpcyBub3QgYSB2YWxpZCBQb2ludCcpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBVbndyYXAgY29vcmRpbmF0ZXMgZnJvbSBhIEZlYXR1cmUsIEdlb21ldHJ5IE9iamVjdCBvciBhbiBBcnJheSBvZiBudW1iZXJzXG4gKlxuICogQG5hbWUgZ2V0Q29vcmRzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj58R2VvbWV0cnl8RmVhdHVyZX0gb2JqIE9iamVjdFxuICogQHJldHVybnMge0FycmF5PG51bWJlcj59IGNvb3JkaW5hdGVzXG4gKiBAZXhhbXBsZVxuICogdmFyIHBvbHkgPSB0dXJmLnBvbHlnb24oW1tbMTE5LjMyLCAtOC43XSwgWzExOS41NSwgLTguNjldLCBbMTE5LjUxLCAtOC41NF0sIFsxMTkuMzIsIC04LjddXV0pO1xuICpcbiAqIHZhciBjb29yZCA9IHR1cmYuZ2V0Q29vcmRzKHBvbHkpO1xuICogLy89IFtbWzExOS4zMiwgLTguN10sIFsxMTkuNTUsIC04LjY5XSwgWzExOS41MSwgLTguNTRdLCBbMTE5LjMyLCAtOC43XV1dXG4gKi9cbmZ1bmN0aW9uIGdldENvb3JkcyhvYmopIHtcbiAgICBpZiAoIW9iaikgdGhyb3cgbmV3IEVycm9yKCdvYmogaXMgcmVxdWlyZWQnKTtcbiAgICB2YXIgY29vcmRpbmF0ZXM7XG5cbiAgICAvLyBBcnJheSBvZiBudW1iZXJzXG4gICAgaWYgKG9iai5sZW5ndGgpIHtcbiAgICAgICAgY29vcmRpbmF0ZXMgPSBvYmo7XG5cbiAgICAvLyBHZW9tZXRyeSBPYmplY3RcbiAgICB9IGVsc2UgaWYgKG9iai5jb29yZGluYXRlcykge1xuICAgICAgICBjb29yZGluYXRlcyA9IG9iai5jb29yZGluYXRlcztcblxuICAgIC8vIEZlYXR1cmVcbiAgICB9IGVsc2UgaWYgKG9iai5nZW9tZXRyeSAmJiBvYmouZ2VvbWV0cnkuY29vcmRpbmF0ZXMpIHtcbiAgICAgICAgY29vcmRpbmF0ZXMgPSBvYmouZ2VvbWV0cnkuY29vcmRpbmF0ZXM7XG4gICAgfVxuICAgIC8vIENoZWNrcyBpZiBjb29yZGluYXRlcyBjb250YWlucyBhIG51bWJlclxuICAgIGlmIChjb29yZGluYXRlcykge1xuICAgICAgICBjb250YWluc051bWJlcihjb29yZGluYXRlcyk7XG4gICAgICAgIHJldHVybiBjb29yZGluYXRlcztcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyB2YWxpZCBjb29yZGluYXRlcycpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBjb29yZGluYXRlcyBjb250YWlucyBhIG51bWJlclxuICpcbiAqIEBuYW1lIGNvbnRhaW5zTnVtYmVyXG4gKiBAcGFyYW0ge0FycmF5PGFueT59IGNvb3JkaW5hdGVzIEdlb0pTT04gQ29vcmRpbmF0ZXNcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIEFycmF5IGNvbnRhaW5zIGEgbnVtYmVyXG4gKi9cbmZ1bmN0aW9uIGNvbnRhaW5zTnVtYmVyKGNvb3JkaW5hdGVzKSB7XG4gICAgaWYgKGNvb3JkaW5hdGVzLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgdHlwZW9mIGNvb3JkaW5hdGVzWzBdID09PSAnbnVtYmVyJyAmJlxuICAgICAgICB0eXBlb2YgY29vcmRpbmF0ZXNbMV0gPT09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmIChBcnJheS5pc0FycmF5KGNvb3JkaW5hdGVzWzBdKSAmJiBjb29yZGluYXRlc1swXS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGNvbnRhaW5zTnVtYmVyKGNvb3JkaW5hdGVzWzBdKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjb29yZGluYXRlcyBtdXN0IG9ubHkgY29udGFpbiBudW1iZXJzJyk7XG59XG5cbi8qKlxuICogRW5mb3JjZSBleHBlY3RhdGlvbnMgYWJvdXQgdHlwZXMgb2YgR2VvSlNPTiBvYmplY3RzIGZvciBUdXJmLlxuICpcbiAqIEBuYW1lIGdlb2pzb25UeXBlXG4gKiBAcGFyYW0ge0dlb0pTT059IHZhbHVlIGFueSBHZW9KU09OIG9iamVjdFxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgZXhwZWN0ZWQgR2VvSlNPTiB0eXBlXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBuYW1lIG9mIGNhbGxpbmcgZnVuY3Rpb25cbiAqIEB0aHJvd3Mge0Vycm9yfSBpZiB2YWx1ZSBpcyBub3QgdGhlIGV4cGVjdGVkIHR5cGUuXG4gKi9cbmZ1bmN0aW9uIGdlb2pzb25UeXBlKHZhbHVlLCB0eXBlLCBuYW1lKSB7XG4gICAgaWYgKCF0eXBlIHx8ICFuYW1lKSB0aHJvdyBuZXcgRXJyb3IoJ3R5cGUgYW5kIG5hbWUgcmVxdWlyZWQnKTtcblxuICAgIGlmICghdmFsdWUgfHwgdmFsdWUudHlwZSAhPT0gdHlwZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaW5wdXQgdG8gJyArIG5hbWUgKyAnOiBtdXN0IGJlIGEgJyArIHR5cGUgKyAnLCBnaXZlbiAnICsgdmFsdWUudHlwZSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEVuZm9yY2UgZXhwZWN0YXRpb25zIGFib3V0IHR5cGVzIG9mIHtAbGluayBGZWF0dXJlfSBpbnB1dHMgZm9yIFR1cmYuXG4gKiBJbnRlcm5hbGx5IHRoaXMgdXNlcyB7QGxpbmsgZ2VvanNvblR5cGV9IHRvIGp1ZGdlIGdlb21ldHJ5IHR5cGVzLlxuICpcbiAqIEBuYW1lIGZlYXR1cmVPZlxuICogQHBhcmFtIHtGZWF0dXJlfSBmZWF0dXJlIGEgZmVhdHVyZSB3aXRoIGFuIGV4cGVjdGVkIGdlb21ldHJ5IHR5cGVcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIGV4cGVjdGVkIEdlb0pTT04gdHlwZVxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgbmFtZSBvZiBjYWxsaW5nIGZ1bmN0aW9uXG4gKiBAdGhyb3dzIHtFcnJvcn0gZXJyb3IgaWYgdmFsdWUgaXMgbm90IHRoZSBleHBlY3RlZCB0eXBlLlxuICovXG5mdW5jdGlvbiBmZWF0dXJlT2YoZmVhdHVyZSwgdHlwZSwgbmFtZSkge1xuICAgIGlmICghZmVhdHVyZSkgdGhyb3cgbmV3IEVycm9yKCdObyBmZWF0dXJlIHBhc3NlZCcpO1xuICAgIGlmICghbmFtZSkgdGhyb3cgbmV3IEVycm9yKCcuZmVhdHVyZU9mKCkgcmVxdWlyZXMgYSBuYW1lJyk7XG4gICAgaWYgKCFmZWF0dXJlIHx8IGZlYXR1cmUudHlwZSAhPT0gJ0ZlYXR1cmUnIHx8ICFmZWF0dXJlLmdlb21ldHJ5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBpbnB1dCB0byAnICsgbmFtZSArICcsIEZlYXR1cmUgd2l0aCBnZW9tZXRyeSByZXF1aXJlZCcpO1xuICAgIH1cbiAgICBpZiAoIWZlYXR1cmUuZ2VvbWV0cnkgfHwgZmVhdHVyZS5nZW9tZXRyeS50eXBlICE9PSB0eXBlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBpbnB1dCB0byAnICsgbmFtZSArICc6IG11c3QgYmUgYSAnICsgdHlwZSArICcsIGdpdmVuICcgKyBmZWF0dXJlLmdlb21ldHJ5LnR5cGUpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBFbmZvcmNlIGV4cGVjdGF0aW9ucyBhYm91dCB0eXBlcyBvZiB7QGxpbmsgRmVhdHVyZUNvbGxlY3Rpb259IGlucHV0cyBmb3IgVHVyZi5cbiAqIEludGVybmFsbHkgdGhpcyB1c2VzIHtAbGluayBnZW9qc29uVHlwZX0gdG8ganVkZ2UgZ2VvbWV0cnkgdHlwZXMuXG4gKlxuICogQG5hbWUgY29sbGVjdGlvbk9mXG4gKiBAcGFyYW0ge0ZlYXR1cmVDb2xsZWN0aW9ufSBmZWF0dXJlQ29sbGVjdGlvbiBhIEZlYXR1cmVDb2xsZWN0aW9uIGZvciB3aGljaCBmZWF0dXJlcyB3aWxsIGJlIGp1ZGdlZFxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgZXhwZWN0ZWQgR2VvSlNPTiB0eXBlXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBuYW1lIG9mIGNhbGxpbmcgZnVuY3Rpb25cbiAqIEB0aHJvd3Mge0Vycm9yfSBpZiB2YWx1ZSBpcyBub3QgdGhlIGV4cGVjdGVkIHR5cGUuXG4gKi9cbmZ1bmN0aW9uIGNvbGxlY3Rpb25PZihmZWF0dXJlQ29sbGVjdGlvbiwgdHlwZSwgbmFtZSkge1xuICAgIGlmICghZmVhdHVyZUNvbGxlY3Rpb24pIHRocm93IG5ldyBFcnJvcignTm8gZmVhdHVyZUNvbGxlY3Rpb24gcGFzc2VkJyk7XG4gICAgaWYgKCFuYW1lKSB0aHJvdyBuZXcgRXJyb3IoJy5jb2xsZWN0aW9uT2YoKSByZXF1aXJlcyBhIG5hbWUnKTtcbiAgICBpZiAoIWZlYXR1cmVDb2xsZWN0aW9uIHx8IGZlYXR1cmVDb2xsZWN0aW9uLnR5cGUgIT09ICdGZWF0dXJlQ29sbGVjdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGlucHV0IHRvICcgKyBuYW1lICsgJywgRmVhdHVyZUNvbGxlY3Rpb24gcmVxdWlyZWQnKTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZmVhdHVyZSA9IGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzW2ldO1xuICAgICAgICBpZiAoIWZlYXR1cmUgfHwgZmVhdHVyZS50eXBlICE9PSAnRmVhdHVyZScgfHwgIWZlYXR1cmUuZ2VvbWV0cnkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBpbnB1dCB0byAnICsgbmFtZSArICcsIEZlYXR1cmUgd2l0aCBnZW9tZXRyeSByZXF1aXJlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZmVhdHVyZS5nZW9tZXRyeSB8fCBmZWF0dXJlLmdlb21ldHJ5LnR5cGUgIT09IHR5cGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBpbnB1dCB0byAnICsgbmFtZSArICc6IG11c3QgYmUgYSAnICsgdHlwZSArICcsIGdpdmVuICcgKyBmZWF0dXJlLmdlb21ldHJ5LnR5cGUpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEdldCBHZW9tZXRyeSBmcm9tIEZlYXR1cmUgb3IgR2VvbWV0cnkgT2JqZWN0XG4gKlxuICogQHBhcmFtIHtGZWF0dXJlfEdlb21ldHJ5fSBnZW9qc29uIEdlb0pTT04gRmVhdHVyZSBvciBHZW9tZXRyeSBPYmplY3RcbiAqIEByZXR1cm5zIHtHZW9tZXRyeXxudWxsfSBHZW9KU09OIEdlb21ldHJ5IE9iamVjdFxuICogQHRocm93cyB7RXJyb3J9IGlmIGdlb2pzb24gaXMgbm90IGEgRmVhdHVyZSBvciBHZW9tZXRyeSBPYmplY3RcbiAqIEBleGFtcGxlXG4gKiB2YXIgcG9pbnQgPSB7XG4gKiAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAqICAgXCJwcm9wZXJ0aWVzXCI6IHt9LFxuICogICBcImdlb21ldHJ5XCI6IHtcbiAqICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICogICAgIFwiY29vcmRpbmF0ZXNcIjogWzExMCwgNDBdXG4gKiAgIH1cbiAqIH1cbiAqIHZhciBnZW9tID0gdHVyZi5nZXRHZW9tKHBvaW50KVxuICogLy89e1widHlwZVwiOiBcIlBvaW50XCIsIFwiY29vcmRpbmF0ZXNcIjogWzExMCwgNDBdfVxuICovXG5mdW5jdGlvbiBnZXRHZW9tKGdlb2pzb24pIHtcbiAgICBpZiAoIWdlb2pzb24pIHRocm93IG5ldyBFcnJvcignZ2VvanNvbiBpcyByZXF1aXJlZCcpO1xuICAgIGlmIChnZW9qc29uLmdlb21ldHJ5ICE9PSB1bmRlZmluZWQpIHJldHVybiBnZW9qc29uLmdlb21ldHJ5O1xuICAgIGlmIChnZW9qc29uLmNvb3JkaW5hdGVzIHx8IGdlb2pzb24uZ2VvbWV0cmllcykgcmV0dXJuIGdlb2pzb247XG4gICAgdGhyb3cgbmV3IEVycm9yKCdnZW9qc29uIG11c3QgYmUgYSB2YWxpZCBGZWF0dXJlIG9yIEdlb21ldHJ5IE9iamVjdCcpO1xufVxuXG4vKipcbiAqIEdldCBHZW9tZXRyeSBUeXBlIGZyb20gRmVhdHVyZSBvciBHZW9tZXRyeSBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge0ZlYXR1cmV8R2VvbWV0cnl9IGdlb2pzb24gR2VvSlNPTiBGZWF0dXJlIG9yIEdlb21ldHJ5IE9iamVjdFxuICogQHJldHVybnMge3N0cmluZ30gR2VvSlNPTiBHZW9tZXRyeSBUeXBlXG4gKiBAdGhyb3dzIHtFcnJvcn0gaWYgZ2VvanNvbiBpcyBub3QgYSBGZWF0dXJlIG9yIEdlb21ldHJ5IE9iamVjdFxuICogQGV4YW1wbGVcbiAqIHZhciBwb2ludCA9IHtcbiAqICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICogICBcInByb3BlcnRpZXNcIjoge30sXG4gKiAgIFwiZ2VvbWV0cnlcIjoge1xuICogICAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gKiAgICAgXCJjb29yZGluYXRlc1wiOiBbMTEwLCA0MF1cbiAqICAgfVxuICogfVxuICogdmFyIGdlb20gPSB0dXJmLmdldEdlb21UeXBlKHBvaW50KVxuICogLy89XCJQb2ludFwiXG4gKi9cbmZ1bmN0aW9uIGdldEdlb21UeXBlKGdlb2pzb24pIHtcbiAgICBpZiAoIWdlb2pzb24pIHRocm93IG5ldyBFcnJvcignZ2VvanNvbiBpcyByZXF1aXJlZCcpO1xuICAgIHZhciBnZW9tID0gZ2V0R2VvbShnZW9qc29uKTtcbiAgICBpZiAoZ2VvbSkgcmV0dXJuIGdlb20udHlwZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZ2VvanNvblR5cGU6IGdlb2pzb25UeXBlLFxuICAgIGNvbGxlY3Rpb25PZjogY29sbGVjdGlvbk9mLFxuICAgIGZlYXR1cmVPZjogZmVhdHVyZU9mLFxuICAgIGdldENvb3JkOiBnZXRDb29yZCxcbiAgICBnZXRDb29yZHM6IGdldENvb3JkcyxcbiAgICBjb250YWluc051bWJlcjogY29udGFpbnNOdW1iZXIsXG4gICAgZ2V0R2VvbTogZ2V0R2VvbSxcbiAgICBnZXRHZW9tVHlwZTogZ2V0R2VvbVR5cGVcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AdHVyZi9pbnNpZGUvbm9kZV9tb2R1bGVzL0B0dXJmL2ludmFyaWFudC9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMjlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBXcmFwcyBhIEdlb0pTT04ge0BsaW5rIEdlb21ldHJ5fSBpbiBhIEdlb0pTT04ge0BsaW5rIEZlYXR1cmV9LlxuICpcbiAqIEBuYW1lIGZlYXR1cmVcbiAqIEBwYXJhbSB7R2VvbWV0cnl9IGdlb21ldHJ5IGlucHV0IGdlb21ldHJ5XG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2lkXSBJZGVudGlmaWVyXG4gKiBAcmV0dXJucyB7RmVhdHVyZX0gYSBHZW9KU09OIEZlYXR1cmVcbiAqIEBleGFtcGxlXG4gKiB2YXIgZ2VvbWV0cnkgPSB7XG4gKiAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gKiAgIFwiY29vcmRpbmF0ZXNcIjogWzExMCwgNTBdXG4gKiB9O1xuICpcbiAqIHZhciBmZWF0dXJlID0gdHVyZi5mZWF0dXJlKGdlb21ldHJ5KTtcbiAqXG4gKiAvLz1mZWF0dXJlXG4gKi9cbmZ1bmN0aW9uIGZlYXR1cmUoZ2VvbWV0cnksIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKGdlb21ldHJ5ID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcignZ2VvbWV0cnkgaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAocHJvcGVydGllcyAmJiBwcm9wZXJ0aWVzLmNvbnN0cnVjdG9yICE9PSBPYmplY3QpIHRocm93IG5ldyBFcnJvcigncHJvcGVydGllcyBtdXN0IGJlIGFuIE9iamVjdCcpO1xuICAgIGlmIChiYm94ICYmIGJib3gubGVuZ3RoICE9PSA0KSB0aHJvdyBuZXcgRXJyb3IoJ2Jib3ggbXVzdCBiZSBhbiBBcnJheSBvZiA0IG51bWJlcnMnKTtcbiAgICBpZiAoaWQgJiYgWydzdHJpbmcnLCAnbnVtYmVyJ10uaW5kZXhPZih0eXBlb2YgaWQpID09PSAtMSkgdGhyb3cgbmV3IEVycm9yKCdpZCBtdXN0IGJlIGEgbnVtYmVyIG9yIGEgc3RyaW5nJyk7XG5cbiAgICB2YXIgZmVhdCA9IHt0eXBlOiAnRmVhdHVyZSd9O1xuICAgIGlmIChpZCkgZmVhdC5pZCA9IGlkO1xuICAgIGlmIChiYm94KSBmZWF0LmJib3ggPSBiYm94O1xuICAgIGZlYXQucHJvcGVydGllcyA9IHByb3BlcnRpZXMgfHwge307XG4gICAgZmVhdC5nZW9tZXRyeSA9IGdlb21ldHJ5O1xuICAgIHJldHVybiBmZWF0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBHZW9KU09OIHtAbGluayBHZW9tZXRyeX0gZnJvbSBhIEdlb21ldHJ5IHN0cmluZyB0eXBlICYgY29vcmRpbmF0ZXMuXG4gKiBGb3IgR2VvbWV0cnlDb2xsZWN0aW9uIHR5cGUgdXNlIGBoZWxwZXJzLmdlb21ldHJ5Q29sbGVjdGlvbmBcbiAqXG4gKiBAbmFtZSBnZW9tZXRyeVxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgR2VvbWV0cnkgVHlwZVxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBjb29yZGluYXRlcyBDb29yZGluYXRlc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHJldHVybnMge0dlb21ldHJ5fSBhIEdlb0pTT04gR2VvbWV0cnlcbiAqIEBleGFtcGxlXG4gKiB2YXIgdHlwZSA9ICdQb2ludCc7XG4gKiB2YXIgY29vcmRpbmF0ZXMgPSBbMTEwLCA1MF07XG4gKlxuICogdmFyIGdlb21ldHJ5ID0gdHVyZi5nZW9tZXRyeSh0eXBlLCBjb29yZGluYXRlcyk7XG4gKlxuICogLy89Z2VvbWV0cnlcbiAqL1xuZnVuY3Rpb24gZ2VvbWV0cnkodHlwZSwgY29vcmRpbmF0ZXMsIGJib3gpIHtcbiAgICAvLyBWYWxpZGF0aW9uXG4gICAgaWYgKCF0eXBlKSB0aHJvdyBuZXcgRXJyb3IoJ3R5cGUgaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAoIWNvb3JkaW5hdGVzKSB0aHJvdyBuZXcgRXJyb3IoJ2Nvb3JkaW5hdGVzIGlzIHJlcXVpcmVkJyk7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGNvb3JkaW5hdGVzKSkgdGhyb3cgbmV3IEVycm9yKCdjb29yZGluYXRlcyBtdXN0IGJlIGFuIEFycmF5Jyk7XG4gICAgaWYgKGJib3ggJiYgYmJveC5sZW5ndGggIT09IDQpIHRocm93IG5ldyBFcnJvcignYmJveCBtdXN0IGJlIGFuIEFycmF5IG9mIDQgbnVtYmVycycpO1xuXG4gICAgdmFyIGdlb207XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAnUG9pbnQnOiBnZW9tID0gcG9pbnQoY29vcmRpbmF0ZXMpLmdlb21ldHJ5OyBicmVhaztcbiAgICBjYXNlICdMaW5lU3RyaW5nJzogZ2VvbSA9IGxpbmVTdHJpbmcoY29vcmRpbmF0ZXMpLmdlb21ldHJ5OyBicmVhaztcbiAgICBjYXNlICdQb2x5Z29uJzogZ2VvbSA9IHBvbHlnb24oY29vcmRpbmF0ZXMpLmdlb21ldHJ5OyBicmVhaztcbiAgICBjYXNlICdNdWx0aVBvaW50JzogZ2VvbSA9IG11bHRpUG9pbnQoY29vcmRpbmF0ZXMpLmdlb21ldHJ5OyBicmVhaztcbiAgICBjYXNlICdNdWx0aUxpbmVTdHJpbmcnOiBnZW9tID0gbXVsdGlMaW5lU3RyaW5nKGNvb3JkaW5hdGVzKS5nZW9tZXRyeTsgYnJlYWs7XG4gICAgY2FzZSAnTXVsdGlQb2x5Z29uJzogZ2VvbSA9IG11bHRpUG9seWdvbihjb29yZGluYXRlcykuZ2VvbWV0cnk7IGJyZWFrO1xuICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcih0eXBlICsgJyBpcyBpbnZhbGlkJyk7XG4gICAgfVxuICAgIGlmIChiYm94KSBnZW9tLmJib3ggPSBiYm94O1xuICAgIHJldHVybiBnZW9tO1xufVxuXG4vKipcbiAqIFRha2VzIGNvb3JkaW5hdGVzIGFuZCBwcm9wZXJ0aWVzIChvcHRpb25hbCkgYW5kIHJldHVybnMgYSBuZXcge0BsaW5rIFBvaW50fSBmZWF0dXJlLlxuICpcbiAqIEBuYW1lIHBvaW50XG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IGNvb3JkaW5hdGVzIGxvbmdpdHVkZSwgbGF0aXR1ZGUgcG9zaXRpb24gKGVhY2ggaW4gZGVjaW1hbCBkZWdyZWVzKVxuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtpZF0gSWRlbnRpZmllclxuICogQHJldHVybnMge0ZlYXR1cmU8UG9pbnQ+fSBhIFBvaW50IGZlYXR1cmVcbiAqIEBleGFtcGxlXG4gKiB2YXIgcG9pbnQgPSB0dXJmLnBvaW50KFstNzUuMzQzLCAzOS45ODRdKTtcbiAqXG4gKiAvLz1wb2ludFxuICovXG5mdW5jdGlvbiBwb2ludChjb29yZGluYXRlcywgcHJvcGVydGllcywgYmJveCwgaWQpIHtcbiAgICBpZiAoIWNvb3JkaW5hdGVzKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGNvb3JkaW5hdGVzIHBhc3NlZCcpO1xuICAgIGlmIChjb29yZGluYXRlcy5sZW5ndGggPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKCdDb29yZGluYXRlcyBtdXN0IGJlIGFuIGFycmF5Jyk7XG4gICAgaWYgKGNvb3JkaW5hdGVzLmxlbmd0aCA8IDIpIHRocm93IG5ldyBFcnJvcignQ29vcmRpbmF0ZXMgbXVzdCBiZSBhdCBsZWFzdCAyIG51bWJlcnMgbG9uZycpO1xuICAgIGlmICghaXNOdW1iZXIoY29vcmRpbmF0ZXNbMF0pIHx8ICFpc051bWJlcihjb29yZGluYXRlc1sxXSkpIHRocm93IG5ldyBFcnJvcignQ29vcmRpbmF0ZXMgbXVzdCBjb250YWluIG51bWJlcnMnKTtcblxuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ1BvaW50JyxcbiAgICAgICAgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzXG4gICAgfSwgcHJvcGVydGllcywgYmJveCwgaWQpO1xufVxuXG4vKipcbiAqIFRha2VzIGFuIGFycmF5IG9mIExpbmVhclJpbmdzIGFuZCBvcHRpb25hbGx5IGFuIHtAbGluayBPYmplY3R9IHdpdGggcHJvcGVydGllcyBhbmQgcmV0dXJucyBhIHtAbGluayBQb2x5Z29ufSBmZWF0dXJlLlxuICpcbiAqIEBuYW1lIHBvbHlnb25cbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk8QXJyYXk8bnVtYmVyPj4+fSBjb29yZGluYXRlcyBhbiBhcnJheSBvZiBMaW5lYXJSaW5nc1xuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtpZF0gSWRlbnRpZmllclxuICogQHJldHVybnMge0ZlYXR1cmU8UG9seWdvbj59IGEgUG9seWdvbiBmZWF0dXJlXG4gKiBAdGhyb3dzIHtFcnJvcn0gdGhyb3cgYW4gZXJyb3IgaWYgYSBMaW5lYXJSaW5nIG9mIHRoZSBwb2x5Z29uIGhhcyB0b28gZmV3IHBvc2l0aW9uc1xuICogb3IgaWYgYSBMaW5lYXJSaW5nIG9mIHRoZSBQb2x5Z29uIGRvZXMgbm90IGhhdmUgbWF0Y2hpbmcgUG9zaXRpb25zIGF0IHRoZSBiZWdpbm5pbmcgJiBlbmQuXG4gKiBAZXhhbXBsZVxuICogdmFyIHBvbHlnb24gPSB0dXJmLnBvbHlnb24oW1tcbiAqICAgWy0yLjI3NTU0MywgNTMuNDY0NTQ3XSxcbiAqICAgWy0yLjI3NTU0MywgNTMuNDg5MjcxXSxcbiAqICAgWy0yLjIxNTExOCwgNTMuNDg5MjcxXSxcbiAqICAgWy0yLjIxNTExOCwgNTMuNDY0NTQ3XSxcbiAqICAgWy0yLjI3NTU0MywgNTMuNDY0NTQ3XVxuICogXV0sIHsgbmFtZTogJ3BvbHkxJywgcG9wdWxhdGlvbjogNDAwfSk7XG4gKlxuICogLy89cG9seWdvblxuICovXG5mdW5jdGlvbiBwb2x5Z29uKGNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzLCBiYm94LCBpZCkge1xuICAgIGlmICghY29vcmRpbmF0ZXMpIHRocm93IG5ldyBFcnJvcignTm8gY29vcmRpbmF0ZXMgcGFzc2VkJyk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3JkaW5hdGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciByaW5nID0gY29vcmRpbmF0ZXNbaV07XG4gICAgICAgIGlmIChyaW5nLmxlbmd0aCA8IDQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRWFjaCBMaW5lYXJSaW5nIG9mIGEgUG9seWdvbiBtdXN0IGhhdmUgNCBvciBtb3JlIFBvc2l0aW9ucy4nKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJpbmdbcmluZy5sZW5ndGggLSAxXS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgZmlyc3QgcG9pbnQgb2YgUG9seWdvbiBjb250YWlucyB0d28gbnVtYmVyc1xuICAgICAgICAgICAgaWYgKGkgPT09IDAgJiYgaiA9PT0gMCAmJiAhaXNOdW1iZXIocmluZ1swXVswXSkgfHwgIWlzTnVtYmVyKHJpbmdbMF1bMV0pKSB0aHJvdyBuZXcgRXJyb3IoJ0Nvb3JkaW5hdGVzIG11c3QgY29udGFpbiBudW1iZXJzJyk7XG4gICAgICAgICAgICBpZiAocmluZ1tyaW5nLmxlbmd0aCAtIDFdW2pdICE9PSByaW5nWzBdW2pdKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhbmQgbGFzdCBQb3NpdGlvbiBhcmUgbm90IGVxdWl2YWxlbnQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmVhdHVyZSh7XG4gICAgICAgIHR5cGU6ICdQb2x5Z29uJyxcbiAgICAgICAgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzXG4gICAgfSwgcHJvcGVydGllcywgYmJveCwgaWQpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgTGluZVN0cmluZ30gYmFzZWQgb24gYVxuICogY29vcmRpbmF0ZSBhcnJheS4gUHJvcGVydGllcyBjYW4gYmUgYWRkZWQgb3B0aW9uYWxseS5cbiAqXG4gKiBAbmFtZSBsaW5lU3RyaW5nXG4gKiBAcGFyYW0ge0FycmF5PEFycmF5PG51bWJlcj4+fSBjb29yZGluYXRlcyBhbiBhcnJheSBvZiBQb3NpdGlvbnNcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV0gYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlPExpbmVTdHJpbmc+fSBhIExpbmVTdHJpbmcgZmVhdHVyZVxuICogQHRocm93cyB7RXJyb3J9IGlmIG5vIGNvb3JkaW5hdGVzIGFyZSBwYXNzZWRcbiAqIEBleGFtcGxlXG4gKiB2YXIgbGluZXN0cmluZzEgPSB0dXJmLmxpbmVTdHJpbmcoW1xuICogICBbLTIxLjk2NDQxNiwgNjQuMTQ4MjAzXSxcbiAqICAgWy0yMS45NTYxNzYsIDY0LjE0MTMxNl0sXG4gKiAgIFstMjEuOTM5MDEsIDY0LjEzNTkyNF0sXG4gKiAgIFstMjEuOTI3MzM3LCA2NC4xMzY2NzNdXG4gKiBdKTtcbiAqIHZhciBsaW5lc3RyaW5nMiA9IHR1cmYubGluZVN0cmluZyhbXG4gKiAgIFstMjEuOTI5MDU0LCA2NC4xMjc5ODVdLFxuICogICBbLTIxLjkxMjkxOCwgNjQuMTM0NzI2XSxcbiAqICAgWy0yMS45MTYwMDcsIDY0LjE0MTAxNl0sXG4gKiAgIFstMjEuOTMwMDg0LCA2NC4xNDQ0Nl1cbiAqIF0sIHtuYW1lOiAnbGluZSAxJywgZGlzdGFuY2U6IDE0NX0pO1xuICpcbiAqIC8vPWxpbmVzdHJpbmcxXG4gKlxuICogLy89bGluZXN0cmluZzJcbiAqL1xuZnVuY3Rpb24gbGluZVN0cmluZyhjb29yZGluYXRlcywgcHJvcGVydGllcywgYmJveCwgaWQpIHtcbiAgICBpZiAoIWNvb3JkaW5hdGVzKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGNvb3JkaW5hdGVzIHBhc3NlZCcpO1xuICAgIGlmIChjb29yZGluYXRlcy5sZW5ndGggPCAyKSB0aHJvdyBuZXcgRXJyb3IoJ0Nvb3JkaW5hdGVzIG11c3QgYmUgYW4gYXJyYXkgb2YgdHdvIG9yIG1vcmUgcG9zaXRpb25zJyk7XG4gICAgLy8gQ2hlY2sgaWYgZmlyc3QgcG9pbnQgb2YgTGluZVN0cmluZyBjb250YWlucyB0d28gbnVtYmVyc1xuICAgIGlmICghaXNOdW1iZXIoY29vcmRpbmF0ZXNbMF1bMV0pIHx8ICFpc051bWJlcihjb29yZGluYXRlc1swXVsxXSkpIHRocm93IG5ldyBFcnJvcignQ29vcmRpbmF0ZXMgbXVzdCBjb250YWluIG51bWJlcnMnKTtcblxuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ0xpbmVTdHJpbmcnLFxuICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXNcbiAgICB9LCBwcm9wZXJ0aWVzLCBiYm94LCBpZCk7XG59XG5cbi8qKlxuICogVGFrZXMgb25lIG9yIG1vcmUge0BsaW5rIEZlYXR1cmV8RmVhdHVyZXN9IGFuZCBjcmVhdGVzIGEge0BsaW5rIEZlYXR1cmVDb2xsZWN0aW9ufS5cbiAqXG4gKiBAbmFtZSBmZWF0dXJlQ29sbGVjdGlvblxuICogQHBhcmFtIHtGZWF0dXJlW119IGZlYXR1cmVzIGlucHV0IGZlYXR1cmVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtpZF0gSWRlbnRpZmllclxuICogQHJldHVybnMge0ZlYXR1cmVDb2xsZWN0aW9ufSBhIEZlYXR1cmVDb2xsZWN0aW9uIG9mIGlucHV0IGZlYXR1cmVzXG4gKiBAZXhhbXBsZVxuICogdmFyIGZlYXR1cmVzID0gW1xuICogIHR1cmYucG9pbnQoWy03NS4zNDMsIDM5Ljk4NF0sIHtuYW1lOiAnTG9jYXRpb24gQSd9KSxcbiAqICB0dXJmLnBvaW50KFstNzUuODMzLCAzOS4yODRdLCB7bmFtZTogJ0xvY2F0aW9uIEInfSksXG4gKiAgdHVyZi5wb2ludChbLTc1LjUzNCwgMzkuMTIzXSwge25hbWU6ICdMb2NhdGlvbiBDJ30pXG4gKiBdO1xuICpcbiAqIHZhciBjb2xsZWN0aW9uID0gdHVyZi5mZWF0dXJlQ29sbGVjdGlvbihmZWF0dXJlcyk7XG4gKlxuICogLy89Y29sbGVjdGlvblxuICovXG5mdW5jdGlvbiBmZWF0dXJlQ29sbGVjdGlvbihmZWF0dXJlcywgYmJveCwgaWQpIHtcbiAgICBpZiAoIWZlYXR1cmVzKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGZlYXR1cmVzIHBhc3NlZCcpO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShmZWF0dXJlcykpIHRocm93IG5ldyBFcnJvcignZmVhdHVyZXMgbXVzdCBiZSBhbiBBcnJheScpO1xuICAgIGlmIChiYm94ICYmIGJib3gubGVuZ3RoICE9PSA0KSB0aHJvdyBuZXcgRXJyb3IoJ2Jib3ggbXVzdCBiZSBhbiBBcnJheSBvZiA0IG51bWJlcnMnKTtcbiAgICBpZiAoaWQgJiYgWydzdHJpbmcnLCAnbnVtYmVyJ10uaW5kZXhPZih0eXBlb2YgaWQpID09PSAtMSkgdGhyb3cgbmV3IEVycm9yKCdpZCBtdXN0IGJlIGEgbnVtYmVyIG9yIGEgc3RyaW5nJyk7XG5cbiAgICB2YXIgZmMgPSB7dHlwZTogJ0ZlYXR1cmVDb2xsZWN0aW9uJ307XG4gICAgaWYgKGlkKSBmYy5pZCA9IGlkO1xuICAgIGlmIChiYm94KSBmYy5iYm94ID0gYmJveDtcbiAgICBmYy5mZWF0dXJlcyA9IGZlYXR1cmVzO1xuICAgIHJldHVybiBmYztcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEge0BsaW5rIEZlYXR1cmU8TXVsdGlMaW5lU3RyaW5nPn0gYmFzZWQgb24gYVxuICogY29vcmRpbmF0ZSBhcnJheS4gUHJvcGVydGllcyBjYW4gYmUgYWRkZWQgb3B0aW9uYWxseS5cbiAqXG4gKiBAbmFtZSBtdWx0aUxpbmVTdHJpbmdcbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk8QXJyYXk8bnVtYmVyPj4+fSBjb29yZGluYXRlcyBhbiBhcnJheSBvZiBMaW5lU3RyaW5nc1xuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtpZF0gSWRlbnRpZmllclxuICogQHJldHVybnMge0ZlYXR1cmU8TXVsdGlMaW5lU3RyaW5nPn0gYSBNdWx0aUxpbmVTdHJpbmcgZmVhdHVyZVxuICogQHRocm93cyB7RXJyb3J9IGlmIG5vIGNvb3JkaW5hdGVzIGFyZSBwYXNzZWRcbiAqIEBleGFtcGxlXG4gKiB2YXIgbXVsdGlMaW5lID0gdHVyZi5tdWx0aUxpbmVTdHJpbmcoW1tbMCwwXSxbMTAsMTBdXV0pO1xuICpcbiAqIC8vPW11bHRpTGluZVxuICovXG5mdW5jdGlvbiBtdWx0aUxpbmVTdHJpbmcoY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFjb29yZGluYXRlcykgdGhyb3cgbmV3IEVycm9yKCdObyBjb29yZGluYXRlcyBwYXNzZWQnKTtcblxuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ011bHRpTGluZVN0cmluZycsXG4gICAgICAgIGNvb3JkaW5hdGVzOiBjb29yZGluYXRlc1xuICAgIH0sIHByb3BlcnRpZXMsIGJib3gsIGlkKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEge0BsaW5rIEZlYXR1cmU8TXVsdGlQb2ludD59IGJhc2VkIG9uIGFcbiAqIGNvb3JkaW5hdGUgYXJyYXkuIFByb3BlcnRpZXMgY2FuIGJlIGFkZGVkIG9wdGlvbmFsbHkuXG4gKlxuICogQG5hbWUgbXVsdGlQb2ludFxuICogQHBhcmFtIHtBcnJheTxBcnJheTxudW1iZXI+Pn0gY29vcmRpbmF0ZXMgYW4gYXJyYXkgb2YgUG9zaXRpb25zXG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2lkXSBJZGVudGlmaWVyXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxNdWx0aVBvaW50Pn0gYSBNdWx0aVBvaW50IGZlYXR1cmVcbiAqIEB0aHJvd3Mge0Vycm9yfSBpZiBubyBjb29yZGluYXRlcyBhcmUgcGFzc2VkXG4gKiBAZXhhbXBsZVxuICogdmFyIG11bHRpUHQgPSB0dXJmLm11bHRpUG9pbnQoW1swLDBdLFsxMCwxMF1dKTtcbiAqXG4gKiAvLz1tdWx0aVB0XG4gKi9cbmZ1bmN0aW9uIG11bHRpUG9pbnQoY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFjb29yZGluYXRlcykgdGhyb3cgbmV3IEVycm9yKCdObyBjb29yZGluYXRlcyBwYXNzZWQnKTtcblxuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ011bHRpUG9pbnQnLFxuICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXNcbiAgICB9LCBwcm9wZXJ0aWVzLCBiYm94LCBpZCk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHtAbGluayBGZWF0dXJlPE11bHRpUG9seWdvbj59IGJhc2VkIG9uIGFcbiAqIGNvb3JkaW5hdGUgYXJyYXkuIFByb3BlcnRpZXMgY2FuIGJlIGFkZGVkIG9wdGlvbmFsbHkuXG4gKlxuICogQG5hbWUgbXVsdGlQb2x5Z29uXG4gKiBAcGFyYW0ge0FycmF5PEFycmF5PEFycmF5PEFycmF5PG51bWJlcj4+Pj59IGNvb3JkaW5hdGVzIGFuIGFycmF5IG9mIFBvbHlnb25zXG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2lkXSBJZGVudGlmaWVyXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxNdWx0aVBvbHlnb24+fSBhIG11bHRpcG9seWdvbiBmZWF0dXJlXG4gKiBAdGhyb3dzIHtFcnJvcn0gaWYgbm8gY29vcmRpbmF0ZXMgYXJlIHBhc3NlZFxuICogQGV4YW1wbGVcbiAqIHZhciBtdWx0aVBvbHkgPSB0dXJmLm11bHRpUG9seWdvbihbW1tbMCwwXSxbMCwxMF0sWzEwLDEwXSxbMTAsMF0sWzAsMF1dXV0pO1xuICpcbiAqIC8vPW11bHRpUG9seVxuICpcbiAqL1xuZnVuY3Rpb24gbXVsdGlQb2x5Z29uKGNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzLCBiYm94LCBpZCkge1xuICAgIGlmICghY29vcmRpbmF0ZXMpIHRocm93IG5ldyBFcnJvcignTm8gY29vcmRpbmF0ZXMgcGFzc2VkJyk7XG5cbiAgICByZXR1cm4gZmVhdHVyZSh7XG4gICAgICAgIHR5cGU6ICdNdWx0aVBvbHlnb24nLFxuICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXNcbiAgICB9LCBwcm9wZXJ0aWVzLCBiYm94LCBpZCk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHtAbGluayBGZWF0dXJlPEdlb21ldHJ5Q29sbGVjdGlvbj59IGJhc2VkIG9uIGFcbiAqIGNvb3JkaW5hdGUgYXJyYXkuIFByb3BlcnRpZXMgY2FuIGJlIGFkZGVkIG9wdGlvbmFsbHkuXG4gKlxuICogQG5hbWUgZ2VvbWV0cnlDb2xsZWN0aW9uXG4gKiBAcGFyYW0ge0FycmF5PEdlb21ldHJ5Pn0gZ2VvbWV0cmllcyBhbiBhcnJheSBvZiBHZW9KU09OIEdlb21ldHJpZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV0gYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlPEdlb21ldHJ5Q29sbGVjdGlvbj59IGEgR2VvSlNPTiBHZW9tZXRyeUNvbGxlY3Rpb24gRmVhdHVyZVxuICogQGV4YW1wbGVcbiAqIHZhciBwdCA9IHtcbiAqICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICogICAgICAgXCJjb29yZGluYXRlc1wiOiBbMTAwLCAwXVxuICogICAgIH07XG4gKiB2YXIgbGluZSA9IHtcbiAqICAgICBcInR5cGVcIjogXCJMaW5lU3RyaW5nXCIsXG4gKiAgICAgXCJjb29yZGluYXRlc1wiOiBbIFsxMDEsIDBdLCBbMTAyLCAxXSBdXG4gKiAgIH07XG4gKiB2YXIgY29sbGVjdGlvbiA9IHR1cmYuZ2VvbWV0cnlDb2xsZWN0aW9uKFtwdCwgbGluZV0pO1xuICpcbiAqIC8vPWNvbGxlY3Rpb25cbiAqL1xuZnVuY3Rpb24gZ2VvbWV0cnlDb2xsZWN0aW9uKGdlb21ldHJpZXMsIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFnZW9tZXRyaWVzKSB0aHJvdyBuZXcgRXJyb3IoJ2dlb21ldHJpZXMgaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZ2VvbWV0cmllcykpIHRocm93IG5ldyBFcnJvcignZ2VvbWV0cmllcyBtdXN0IGJlIGFuIEFycmF5Jyk7XG5cbiAgICByZXR1cm4gZmVhdHVyZSh7XG4gICAgICAgIHR5cGU6ICdHZW9tZXRyeUNvbGxlY3Rpb24nLFxuICAgICAgICBnZW9tZXRyaWVzOiBnZW9tZXRyaWVzXG4gICAgfSwgcHJvcGVydGllcywgYmJveCwgaWQpO1xufVxuXG4vLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9HcmVhdC1jaXJjbGVfZGlzdGFuY2UjUmFkaXVzX2Zvcl9zcGhlcmljYWxfRWFydGhcbnZhciBmYWN0b3JzID0ge1xuICAgIG1pbGVzOiAzOTYwLFxuICAgIG5hdXRpY2FsbWlsZXM6IDM0NDEuMTQ1LFxuICAgIGRlZ3JlZXM6IDU3LjI5NTc3OTUsXG4gICAgcmFkaWFuczogMSxcbiAgICBpbmNoZXM6IDI1MDkwNTYwMCxcbiAgICB5YXJkczogNjk2OTYwMCxcbiAgICBtZXRlcnM6IDYzNzMwMDAsXG4gICAgbWV0cmVzOiA2MzczMDAwLFxuICAgIGNlbnRpbWV0ZXJzOiA2LjM3M2UrOCxcbiAgICBjZW50aW1ldHJlczogNi4zNzNlKzgsXG4gICAga2lsb21ldGVyczogNjM3MyxcbiAgICBraWxvbWV0cmVzOiA2MzczLFxuICAgIGZlZXQ6IDIwOTA4NzkyLjY1XG59O1xuXG52YXIgYXJlYUZhY3RvcnMgPSB7XG4gICAga2lsb21ldGVyczogMC4wMDAwMDEsXG4gICAga2lsb21ldHJlczogMC4wMDAwMDEsXG4gICAgbWV0ZXJzOiAxLFxuICAgIG1ldHJlczogMSxcbiAgICBjZW50aW1ldHJlczogMTAwMDAsXG4gICAgbWlsbGltZXRlcjogMTAwMDAwMCxcbiAgICBhY3JlczogMC4wMDAyNDcxMDUsXG4gICAgbWlsZXM6IDMuODZlLTcsXG4gICAgeWFyZHM6IDEuMTk1OTkwMDQ2LFxuICAgIGZlZXQ6IDEwLjc2MzkxMDQxNyxcbiAgICBpbmNoZXM6IDE1NTAuMDAzMTAwMDA2XG59O1xuLyoqXG4gKiBSb3VuZCBudW1iZXIgdG8gcHJlY2lzaW9uXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IG51bSBOdW1iZXJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbcHJlY2lzaW9uPTBdIFByZWNpc2lvblxuICogQHJldHVybnMge251bWJlcn0gcm91bmRlZCBudW1iZXJcbiAqIEBleGFtcGxlXG4gKiB0dXJmLnJvdW5kKDEyMC40MzIxKVxuICogLy89MTIwXG4gKlxuICogdHVyZi5yb3VuZCgxMjAuNDMyMSwgMilcbiAqIC8vPTEyMC40M1xuICovXG5mdW5jdGlvbiByb3VuZChudW0sIHByZWNpc2lvbikge1xuICAgIGlmIChudW0gPT09IHVuZGVmaW5lZCB8fCBudW0gPT09IG51bGwgfHwgaXNOYU4obnVtKSkgdGhyb3cgbmV3IEVycm9yKCdudW0gaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAocHJlY2lzaW9uICYmICEocHJlY2lzaW9uID49IDApKSB0aHJvdyBuZXcgRXJyb3IoJ3ByZWNpc2lvbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gICAgdmFyIG11bHRpcGxpZXIgPSBNYXRoLnBvdygxMCwgcHJlY2lzaW9uIHx8IDApO1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG51bSAqIG11bHRpcGxpZXIpIC8gbXVsdGlwbGllcjtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgZGlzdGFuY2UgbWVhc3VyZW1lbnQgKGFzc3VtaW5nIGEgc3BoZXJpY2FsIEVhcnRoKSBmcm9tIHJhZGlhbnMgdG8gYSBtb3JlIGZyaWVuZGx5IHVuaXQuXG4gKiBWYWxpZCB1bml0czogbWlsZXMsIG5hdXRpY2FsbWlsZXMsIGluY2hlcywgeWFyZHMsIG1ldGVycywgbWV0cmVzLCBraWxvbWV0ZXJzLCBjZW50aW1ldGVycywgZmVldFxuICpcbiAqIEBuYW1lIHJhZGlhbnNUb0Rpc3RhbmNlXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkaWFucyBpbiByYWRpYW5zIGFjcm9zcyB0aGUgc3BoZXJlXG4gKiBAcGFyYW0ge3N0cmluZ30gW3VuaXRzPWtpbG9tZXRlcnNdIGNhbiBiZSBkZWdyZWVzLCByYWRpYW5zLCBtaWxlcywgb3Iga2lsb21ldGVycyBpbmNoZXMsIHlhcmRzLCBtZXRyZXMsIG1ldGVycywga2lsb21ldHJlcywga2lsb21ldGVycy5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IGRpc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIHJhZGlhbnNUb0Rpc3RhbmNlKHJhZGlhbnMsIHVuaXRzKSB7XG4gICAgaWYgKHJhZGlhbnMgPT09IHVuZGVmaW5lZCB8fCByYWRpYW5zID09PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoJ3JhZGlhbnMgaXMgcmVxdWlyZWQnKTtcblxuICAgIHZhciBmYWN0b3IgPSBmYWN0b3JzW3VuaXRzIHx8ICdraWxvbWV0ZXJzJ107XG4gICAgaWYgKCFmYWN0b3IpIHRocm93IG5ldyBFcnJvcigndW5pdHMgaXMgaW52YWxpZCcpO1xuICAgIHJldHVybiByYWRpYW5zICogZmFjdG9yO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBkaXN0YW5jZSBtZWFzdXJlbWVudCAoYXNzdW1pbmcgYSBzcGhlcmljYWwgRWFydGgpIGZyb20gYSByZWFsLXdvcmxkIHVuaXQgaW50byByYWRpYW5zXG4gKiBWYWxpZCB1bml0czogbWlsZXMsIG5hdXRpY2FsbWlsZXMsIGluY2hlcywgeWFyZHMsIG1ldGVycywgbWV0cmVzLCBraWxvbWV0ZXJzLCBjZW50aW1ldGVycywgZmVldFxuICpcbiAqIEBuYW1lIGRpc3RhbmNlVG9SYWRpYW5zXG4gKiBAcGFyYW0ge251bWJlcn0gZGlzdGFuY2UgaW4gcmVhbCB1bml0c1xuICogQHBhcmFtIHtzdHJpbmd9IFt1bml0cz1raWxvbWV0ZXJzXSBjYW4gYmUgZGVncmVlcywgcmFkaWFucywgbWlsZXMsIG9yIGtpbG9tZXRlcnMgaW5jaGVzLCB5YXJkcywgbWV0cmVzLCBtZXRlcnMsIGtpbG9tZXRyZXMsIGtpbG9tZXRlcnMuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSByYWRpYW5zXG4gKi9cbmZ1bmN0aW9uIGRpc3RhbmNlVG9SYWRpYW5zKGRpc3RhbmNlLCB1bml0cykge1xuICAgIGlmIChkaXN0YW5jZSA9PT0gdW5kZWZpbmVkIHx8IGRpc3RhbmNlID09PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoJ2Rpc3RhbmNlIGlzIHJlcXVpcmVkJyk7XG5cbiAgICB2YXIgZmFjdG9yID0gZmFjdG9yc1t1bml0cyB8fCAna2lsb21ldGVycyddO1xuICAgIGlmICghZmFjdG9yKSB0aHJvdyBuZXcgRXJyb3IoJ3VuaXRzIGlzIGludmFsaWQnKTtcbiAgICByZXR1cm4gZGlzdGFuY2UgLyBmYWN0b3I7XG59XG5cbi8qKlxuICogQ29udmVydCBhIGRpc3RhbmNlIG1lYXN1cmVtZW50IChhc3N1bWluZyBhIHNwaGVyaWNhbCBFYXJ0aCkgZnJvbSBhIHJlYWwtd29ybGQgdW5pdCBpbnRvIGRlZ3JlZXNcbiAqIFZhbGlkIHVuaXRzOiBtaWxlcywgbmF1dGljYWxtaWxlcywgaW5jaGVzLCB5YXJkcywgbWV0ZXJzLCBtZXRyZXMsIGNlbnRpbWV0ZXJzLCBraWxvbWV0cmVzLCBmZWV0XG4gKlxuICogQG5hbWUgZGlzdGFuY2VUb0RlZ3JlZXNcbiAqIEBwYXJhbSB7bnVtYmVyfSBkaXN0YW5jZSBpbiByZWFsIHVuaXRzXG4gKiBAcGFyYW0ge3N0cmluZ30gW3VuaXRzPWtpbG9tZXRlcnNdIGNhbiBiZSBkZWdyZWVzLCByYWRpYW5zLCBtaWxlcywgb3Iga2lsb21ldGVycyBpbmNoZXMsIHlhcmRzLCBtZXRyZXMsIG1ldGVycywga2lsb21ldHJlcywga2lsb21ldGVycy5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IGRlZ3JlZXNcbiAqL1xuZnVuY3Rpb24gZGlzdGFuY2VUb0RlZ3JlZXMoZGlzdGFuY2UsIHVuaXRzKSB7XG4gICAgcmV0dXJuIHJhZGlhbnMyZGVncmVlcyhkaXN0YW5jZVRvUmFkaWFucyhkaXN0YW5jZSwgdW5pdHMpKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhbnkgYmVhcmluZyBhbmdsZSBmcm9tIHRoZSBub3J0aCBsaW5lIGRpcmVjdGlvbiAocG9zaXRpdmUgY2xvY2t3aXNlKVxuICogYW5kIHJldHVybnMgYW4gYW5nbGUgYmV0d2VlbiAwLTM2MCBkZWdyZWVzIChwb3NpdGl2ZSBjbG9ja3dpc2UpLCAwIGJlaW5nIHRoZSBub3J0aCBsaW5lXG4gKlxuICogQG5hbWUgYmVhcmluZ1RvQW5nbGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBiZWFyaW5nIGFuZ2xlLCBiZXR3ZWVuIC0xODAgYW5kICsxODAgZGVncmVlc1xuICogQHJldHVybnMge251bWJlcn0gYW5nbGUgYmV0d2VlbiAwIGFuZCAzNjAgZGVncmVlc1xuICovXG5mdW5jdGlvbiBiZWFyaW5nVG9BbmdsZShiZWFyaW5nKSB7XG4gICAgaWYgKGJlYXJpbmcgPT09IG51bGwgfHwgYmVhcmluZyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoJ2JlYXJpbmcgaXMgcmVxdWlyZWQnKTtcblxuICAgIHZhciBhbmdsZSA9IGJlYXJpbmcgJSAzNjA7XG4gICAgaWYgKGFuZ2xlIDwgMCkgYW5nbGUgKz0gMzYwO1xuICAgIHJldHVybiBhbmdsZTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhbiBhbmdsZSBpbiByYWRpYW5zIHRvIGRlZ3JlZXNcbiAqXG4gKiBAbmFtZSByYWRpYW5zMmRlZ3JlZXNcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWRpYW5zIGFuZ2xlIGluIHJhZGlhbnNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGRlZ3JlZXMgYmV0d2VlbiAwIGFuZCAzNjAgZGVncmVlc1xuICovXG5mdW5jdGlvbiByYWRpYW5zMmRlZ3JlZXMocmFkaWFucykge1xuICAgIGlmIChyYWRpYW5zID09PSBudWxsIHx8IHJhZGlhbnMgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKCdyYWRpYW5zIGlzIHJlcXVpcmVkJyk7XG5cbiAgICB2YXIgZGVncmVlcyA9IHJhZGlhbnMgJSAoMiAqIE1hdGguUEkpO1xuICAgIHJldHVybiBkZWdyZWVzICogMTgwIC8gTWF0aC5QSTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhbiBhbmdsZSBpbiBkZWdyZWVzIHRvIHJhZGlhbnNcbiAqXG4gKiBAbmFtZSBkZWdyZWVzMnJhZGlhbnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBkZWdyZWVzIGFuZ2xlIGJldHdlZW4gMCBhbmQgMzYwIGRlZ3JlZXNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGFuZ2xlIGluIHJhZGlhbnNcbiAqL1xuZnVuY3Rpb24gZGVncmVlczJyYWRpYW5zKGRlZ3JlZXMpIHtcbiAgICBpZiAoZGVncmVlcyA9PT0gbnVsbCB8fCBkZWdyZWVzID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcignZGVncmVlcyBpcyByZXF1aXJlZCcpO1xuXG4gICAgdmFyIHJhZGlhbnMgPSBkZWdyZWVzICUgMzYwO1xuICAgIHJldHVybiByYWRpYW5zICogTWF0aC5QSSAvIDE4MDtcbn1cblxuXG4vKipcbiAqIENvbnZlcnRzIGEgZGlzdGFuY2UgdG8gdGhlIHJlcXVlc3RlZCB1bml0LlxuICogVmFsaWQgdW5pdHM6IG1pbGVzLCBuYXV0aWNhbG1pbGVzLCBpbmNoZXMsIHlhcmRzLCBtZXRlcnMsIG1ldHJlcywga2lsb21ldGVycywgY2VudGltZXRlcnMsIGZlZXRcbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gZGlzdGFuY2UgdG8gYmUgY29udmVydGVkXG4gKiBAcGFyYW0ge3N0cmluZ30gb3JpZ2luYWxVbml0IG9mIHRoZSBkaXN0YW5jZVxuICogQHBhcmFtIHtzdHJpbmd9IFtmaW5hbFVuaXQ9a2lsb21ldGVyc10gcmV0dXJuZWQgdW5pdFxuICogQHJldHVybnMge251bWJlcn0gdGhlIGNvbnZlcnRlZCBkaXN0YW5jZVxuICovXG5mdW5jdGlvbiBjb252ZXJ0RGlzdGFuY2UoZGlzdGFuY2UsIG9yaWdpbmFsVW5pdCwgZmluYWxVbml0KSB7XG4gICAgaWYgKGRpc3RhbmNlID09PSBudWxsIHx8IGRpc3RhbmNlID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcignZGlzdGFuY2UgaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAoIShkaXN0YW5jZSA+PSAwKSkgdGhyb3cgbmV3IEVycm9yKCdkaXN0YW5jZSBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG5cbiAgICB2YXIgY29udmVydGVkRGlzdGFuY2UgPSByYWRpYW5zVG9EaXN0YW5jZShkaXN0YW5jZVRvUmFkaWFucyhkaXN0YW5jZSwgb3JpZ2luYWxVbml0KSwgZmluYWxVbml0IHx8ICdraWxvbWV0ZXJzJyk7XG4gICAgcmV0dXJuIGNvbnZlcnRlZERpc3RhbmNlO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgYXJlYSB0byB0aGUgcmVxdWVzdGVkIHVuaXQuXG4gKiBWYWxpZCB1bml0czoga2lsb21ldGVycywga2lsb21ldHJlcywgbWV0ZXJzLCBtZXRyZXMsIGNlbnRpbWV0cmVzLCBtaWxsaW1ldGVyLCBhY3JlLCBtaWxlLCB5YXJkLCBmb290LCBpbmNoXG4gKiBAcGFyYW0ge251bWJlcn0gYXJlYSB0byBiZSBjb252ZXJ0ZWRcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3JpZ2luYWxVbml0PW1ldGVyc10gb2YgdGhlIGRpc3RhbmNlXG4gKiBAcGFyYW0ge3N0cmluZ30gW2ZpbmFsVW5pdD1raWxvbWV0ZXJzXSByZXR1cm5lZCB1bml0XG4gKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgY29udmVydGVkIGRpc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRBcmVhKGFyZWEsIG9yaWdpbmFsVW5pdCwgZmluYWxVbml0KSB7XG4gICAgaWYgKGFyZWEgPT09IG51bGwgfHwgYXJlYSA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoJ2FyZWEgaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAoIShhcmVhID49IDApKSB0aHJvdyBuZXcgRXJyb3IoJ2FyZWEgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuXG4gICAgdmFyIHN0YXJ0RmFjdG9yID0gYXJlYUZhY3RvcnNbb3JpZ2luYWxVbml0IHx8ICdtZXRlcnMnXTtcbiAgICBpZiAoIXN0YXJ0RmFjdG9yKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgb3JpZ2luYWwgdW5pdHMnKTtcblxuICAgIHZhciBmaW5hbEZhY3RvciA9IGFyZWFGYWN0b3JzW2ZpbmFsVW5pdCB8fCAna2lsb21ldGVycyddO1xuICAgIGlmICghZmluYWxGYWN0b3IpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBmaW5hbCB1bml0cycpO1xuXG4gICAgcmV0dXJuIChhcmVhIC8gc3RhcnRGYWN0b3IpICogZmluYWxGYWN0b3I7XG59XG5cbi8qKlxuICogaXNOdW1iZXJcbiAqXG4gKiBAcGFyYW0geyp9IG51bSBOdW1iZXIgdG8gdmFsaWRhdGVcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlL2ZhbHNlXG4gKiBAZXhhbXBsZVxuICogdHVyZi5pc051bWJlcigxMjMpXG4gKiAvLz10cnVlXG4gKiB0dXJmLmlzTnVtYmVyKCdmb28nKVxuICogLy89ZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNOdW1iZXIobnVtKSB7XG4gICAgcmV0dXJuICFpc05hTihudW0pICYmIG51bSAhPT0gbnVsbCAmJiAhQXJyYXkuaXNBcnJheShudW0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBmZWF0dXJlOiBmZWF0dXJlLFxuICAgIGdlb21ldHJ5OiBnZW9tZXRyeSxcbiAgICBmZWF0dXJlQ29sbGVjdGlvbjogZmVhdHVyZUNvbGxlY3Rpb24sXG4gICAgZ2VvbWV0cnlDb2xsZWN0aW9uOiBnZW9tZXRyeUNvbGxlY3Rpb24sXG4gICAgcG9pbnQ6IHBvaW50LFxuICAgIG11bHRpUG9pbnQ6IG11bHRpUG9pbnQsXG4gICAgbGluZVN0cmluZzogbGluZVN0cmluZyxcbiAgICBtdWx0aUxpbmVTdHJpbmc6IG11bHRpTGluZVN0cmluZyxcbiAgICBwb2x5Z29uOiBwb2x5Z29uLFxuICAgIG11bHRpUG9seWdvbjogbXVsdGlQb2x5Z29uLFxuICAgIHJhZGlhbnNUb0Rpc3RhbmNlOiByYWRpYW5zVG9EaXN0YW5jZSxcbiAgICBkaXN0YW5jZVRvUmFkaWFuczogZGlzdGFuY2VUb1JhZGlhbnMsXG4gICAgZGlzdGFuY2VUb0RlZ3JlZXM6IGRpc3RhbmNlVG9EZWdyZWVzLFxuICAgIHJhZGlhbnMyZGVncmVlczogcmFkaWFuczJkZWdyZWVzLFxuICAgIGRlZ3JlZXMycmFkaWFuczogZGVncmVlczJyYWRpYW5zLFxuICAgIGJlYXJpbmdUb0FuZ2xlOiBiZWFyaW5nVG9BbmdsZSxcbiAgICBjb252ZXJ0RGlzdGFuY2U6IGNvbnZlcnREaXN0YW5jZSxcbiAgICBjb252ZXJ0QXJlYTogY29udmVydEFyZWEsXG4gICAgcm91bmQ6IHJvdW5kLFxuICAgIGlzTnVtYmVyOiBpc051bWJlclxufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0B0dXJmL3dpdGhpbi9ub2RlX21vZHVsZXMvQHR1cmYvaGVscGVycy9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMzBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5cbi8vIGJlY2F1c2Ugd2UgY2FuJ3QgZWFzaWx5IGdyYWIgZGF0YSBmcm9tIG1hcCwgYW5kXG4vLyBxdWVyeVNvdXJjZUZlYXR1cmVzIG9ubHkgcmV0dXJucyB0aGluZ3MgdGhhdCBhcmUgd2l0aGluIHZpZXcuXG5jbGFzcyBTdGF0aW9uRmVlZCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGxldCBzdGF0aW9ucyA9IFtdO1xuXG4gICAgLy8gcmV0dXJucyBnZW9qc29uXG4gICAgdGhpcy5nZXRTdGF0aW9ucyA9IGZ1bmN0aW9uIGdldFN0YXRpb25zKCkgeyByZXR1cm4gc3RhdGlvbnM7IH07XG5cbiAgICAvLyByZXR1cm5zIGFycmF5XG4gICAgdGhpcy5nZXRTdGF0aW9uc0FycmF5ID0gZnVuY3Rpb24gZ2V0U3RhdGlvbnNBcnJheSgpIHtcbiAgICAgIHJldHVybiBzdGF0aW9ucy5mZWF0dXJlcyA/IHN0YXRpb25zLmZlYXR1cmVzIDogW107XG4gICAgfTtcbiAgICAvLyBjb25zdCBzZXRTdGF0aW9ucyA9IGZ1bmN0aW9uIHNldFN0YXRpb25zKGRhdGEpIHsgc3RhdGlvbnMgPSBkYXRhOyB9XG4gICAgLy8gZnVuY3Rpb24gc2V0U3RhdGlvbnMoZGF0YSkgeyBzdGF0aW9ucyA9IGRhdGE7IH1cblxuICAgIGNvbnN0IGRvRmV0Y2ggPSAoKSA9PiB7XG4gICAgICBmZXRjaChjb25maWcuc3RhdGlvbnNVcmwpXG4gICAgICAgIC50aGVuKHJlc3AgPT4gcmVzcC5qc29uKCkpXG4gICAgICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coJ2ZldGNoZWQgc3RhdGlvbnM6ICcsIGRhdGEpO1xuICAgICAgICAgIHN0YXRpb25zID0gZGF0YTtcbiAgICAgICAgICAvLyBzZXRTdGF0aW9ucyhkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGRvRmV0Y2goKTtcbiAgICB3aW5kb3cuc2V0VGltZW91dChkb0ZldGNoLCAzMCAvKiBzZWNvbmRzICovICogMTAwMCk7XG4gIH1cbn1cblxuY29uc3QgZmVlZCA9IG5ldyBTdGF0aW9uRmVlZCgpO1xuZXhwb3J0IGRlZmF1bHQgZmVlZDsgLy8gZXhwb3J0IHNpbmdsZXRvblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL1N0YXRpb25GZWVkLmpzIiwiLyoqXG4gKiBHZXQgVVJMIGZvciBHb29nbGUgZGlyZWN0aW9ucyB0byBvciBmcm9tIGEgZ2l2ZW4gcGxhY2UuXG4gKiBAcGFyYW0geyp9IGRpciAtIGVpdGhlciAndG8nIChkZWZhdWx0KSBvciAnZnJvbSdcbiAqIEBwYXJhbSB7Kn0gYWRkciAtIGFkZHJlc3NcbiAqIEBwYXJhbSB7Kn0gbGF0IC0gbGF0aXR1ZGVcbiAqIEBwYXJhbSB7Kn0gbG5nIC0gbG9uZ2l0dWRlXG4gKi9cbmZ1bmN0aW9uIGdldERpcmVjdGlvbnNMaW5rKHRvQWRkciA9ICcnLCBmcm9tQWRkciA9ICcnLCB0b0xhdCwgdG9MbmcpIHtcbiAgLy8gVE9ETyAvIEJVRzogXCJhZGRyZXNzZXNcIiB3aXRoIGEgJy8nIGluIHRoZW0gZG9uJ3Qgd29yaywgbGlrZVxuICAvLyBcIkNpdmljIENlbnRlci9VTiBQbGF6YSBCQVJUIFN0YXRpb24gKE1hcmtldCBTdCBhdCBNY0FsbGlzdGVyIFN0KVwiIC0gY3VycmVudGx5IHRoYXQgcmVzdWx0c1xuICAvLyBpbiBkaXJlY3Rpb25zIGZyb20gY2l2aWMgY2VudGVyIHRvIFVOIHBsYXphIChiL2MgZy1tYXBzIHNlcGFyYXRlcyBsb2NhdGlvbnMgd2l0aCBhICcvJylcbiAgY29uc3QgYmFzZVVSTCA9ICdodHRwczovL3d3dy5nb29nbGUuY29tL21hcHMvZGlyJztcbiAgY29uc3QgY29vcmRzID0gdG9MYXQgPyBgJHt0b0xhdH0sJHt0b0xuZ30sYCA6ICcnO1xuICBjb25zdCB6b29tID0gMTc7XG4gIHJldHVybiBgJHtiYXNlVVJMfS8ke2Zyb21BZGRyfS8ke3RvQWRkcn0vQCR7Y29vcmRzfSR7em9vbX0vYDtcbiAgLy8gR29vZ2xlIG1hcHMgZXhwZWN0cyBhZGRyZXNzZXMgd2l0aCBuYW1lIGZpcnN0LCB0aGVuIHBsdXMtc2VwYXJhdGVkIGNvbXBvbmVudHMgbGlrZSB0aGlzOlxuICAvLyBOb2lzZWJyaWRnZSwrMjE2OStNaXNzaW9uK1N0LCtTYW4rRnJhbmNpc2NvLCtDQSs5NDExMFxufVxuXG4vKipcbiAqIEdldCBIVE1MIGNvbnRlbnQgZGVzY3JpYmluZyBhIHN0YXRpb24uXG4gKiBAcGFyYW0gc3RhdGlvbiAtIG9uZSBzdGF0aW9uIGZyb20gdGhlIEFQSVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRQb3B1cENvbnRlbnQoc3RhdGlvbikge1xuICBjb25zdCB7XG4gICAgc3RBZGRyZXNzMTogYWRkcixcbiAgICBsYXRpdHVkZTogbGF0LFxuICAgIGxvbmdpdHVkZTogbG5nLFxuICAgIGF2YWlsYWJsZUJpa2VzOiBiaWtlcyxcbiAgICBhdmFpbGFibGVEb2NrczogZG9ja3MsXG4gICAgc3RhdHVzVmFsdWU6IHN0YXR1cyxcbiAgfSA9IHN0YXRpb24ucHJvcGVydGllcztcbiAgY29uc3QgZGlyZWN0aW9uc1VSTCA9IGdldERpcmVjdGlvbnNMaW5rKGFkZHIsIHVuZGVmaW5lZCwgbGF0LCBsbmcpO1xuICBjb25zdCByb3VuZCA9IG4gPT4gTnVtYmVyKG4pLnRvRml4ZWQoMik7XG5cbiAgY29uc3QgYWxlcnRNc2cgPSAoc3RhdHVzID09PSAnTm90IEluIFNlcnZpY2UnKSA/IGA8ZGl2IGNsYXNzPVwic3RhdGlvbi1wb3B1cC0tYWxlcnRcIj4ke3N0YXR1c308L2Rpdj5gIDogJyc7XG5cbiAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPVwic3RhdGlvbi1wb3B1cFwiPlxuICAgICAgPGgzPiR7YWRkcn08L2gzPlxuICAgICAgJHthbGVydE1zZ31cbiAgICAgIDxkaXYgY2xhc3M9XCJjb2x1bW5zIHN0YXRpb24tcG9wdXAtLXN0YXRzXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjb2x1bW4gc3RhdGlvbi1wb3B1cC0tYmlrZXNcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdGlvbi1wb3B1cC0tYmlrZXMtbnVtYmVyXCI+JHtiaWtlc308L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdGlvbi1wb3B1cC0tYmlrZXMtdGV4dFwiPmJpa2VzPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29sdW1uIHN0YXRpb24tcG9wdXAtLWRvY2tzXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInN0YXRpb24tcG9wdXAtLWRvY2tzLW51bWJlclwiPiR7ZG9ja3N9PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInN0YXRpb24tcG9wdXAtLWRvY2tzLXRleHRcIj5kb2NrczwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInN0YXRpb24tcG9wdXAtLWRpcmVjdGlvbnNcIj5cbiAgICAgICAgPGEgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCIke2RpcmVjdGlvbnNVUkx9XCI+RGlyZWN0aW9ucyB0byBoZXJlPC9hPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwic3RhdGlvbi1wb3B1cC0tY29vcmRpbmF0ZXNcIj5MYXQvTG9uZzogPGFiYnIgdGl0bGU9XCIke2xhdH0sICR7bG5nfVwiPiR7cm91bmQobGF0KX0sICR7cm91bmQobG5nKX08L2FiYnI+PC9kaXY+XG4gICAgPC9kaXY+YDtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9wb3B1cHMuanMiLCJcbmltcG9ydCBzdGF0ZSBmcm9tICcuL3N0YXRlJztcbmltcG9ydCB1c2VyUmV2ZXJzZUdlb2NvZGUgZnJvbSAnLi91c2VyUmV2ZXJzZUdlb2NvZGUnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB1c2VyR2VvbG9jYXRlKHBvc2l0aW9uKSB7XG4gIC8vIGNvbnNvbGUubG9nKCdjb29yZHM6ICcsIHBvc2l0aW9uLmNvb3Jkcyk7XG4gIGNvbnN0IHsgbGF0aXR1ZGUsIGxvbmdpdHVkZSB9ID0gcG9zaXRpb24uY29vcmRzO1xuICBzdGF0ZS51c2VyLmxhdGl0dWRlID0gbGF0aXR1ZGU7XG4gIHN0YXRlLnVzZXIubG9uZ2l0dWRlID0gbG9uZ2l0dWRlO1xuICB1c2VyUmV2ZXJzZUdlb2NvZGUoKTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy91c2VyR2VvbG9jYXRlLmpzIiwiLyoqXG4gKiBAbW9kdWxlIG1hcGJveC1nZW9jb2RpbmdcbiAqL1xudmFyIHJlcXVlc3QgPSByZXF1aXJlKCdicm93c2VyLXJlcXVlc3QnKTtcbi8vIHZhciByZXF1ZXN0ID0gcmVxdWlyZSgncmVxdWVzdCcpO1xuLy8gdmFyIHJlcXVlc3QgPSBmdW5jdGlvbigpIHt9O1xuXG52YXIgQkFTRV9VUkwgPSAnaHR0cHM6Ly9hcGkubWFwYm94LmNvbS9nZW9jb2RpbmcvdjUvJztcbnZhciBBQ0NFU1NfVE9LRU4gPSBudWxsO1xudmFyIENFTlRFUiA9IG51bGw7XG52YXIgQkJPWCA9IG51bGw7XG5cbi8qKlxuICogQ29uc3RyYWN0cyB0aGUgZ2VvY29kZS9yZXZlcnNlIGdlb2NvZGUgdXJsIGZvciB0aGUgcXVlcnkgdG8gbWFwYm94LlxuICpcbiAqIEBwYXJhbSAge3N0cmluZ30gICBkYXRhc2V0IC0gVGhlIG1hcGJveCBkYXRhc2V0ICgnbWFwYm94LnBsYWNlcycgb3IgJ21hcGJveC5wbGFjZXMtcGVybWFuZW50JylcbiAqIEBwYXJhbSAge3N0cmluZ30gICBhZGRyZXNzIC0gVGhlIGFkZHJlc3MgdG8gZ2VvY29kZVxuICogQHBhcmFtICB7RnVuY3Rpb259IGRvbmUgICAgLSBDYWxsYmFjayBmdW5jdGlvbiB3aXRoIGFuIGVycm9yIGFuZCB0aGUgcmV0dXJuZWQgZGF0YSBhcyBwYXJhbWV0ZXJcbiAqL1xudmFyIF9fZ2VvY29kZVF1ZXJ5ID0gZnVuY3Rpb24gKGRhdGFzZXQsIHF1ZXJ5LCBkb25lKSB7XG4gICAgaWYgKCFBQ0NFU1NfVE9LRU4pIHtcbiAgICAgICAgcmV0dXJuIGRvbmUoJ1lvdSBoYXZlIHRvIHNldCB5b3VyIG1hcGJveCBwdWJsaWMgYWNjZXNzIHRva2VuIGZpcnN0LicpO1xuICAgIH1cblxuICAgIGlmICghZGF0YXNldCkge1xuICAgICAgICByZXR1cm4gZG9uZSgnQSBtYXBib3ggZGF0YXNldCBpcyByZXF1aXJlZC4nKTtcbiAgICB9XG5cbiAgICBpZiAoIXF1ZXJ5KSB7XG4gICAgICAgIHJldHVybiBkb25lKCdZb3UgaGF2ZSB0byBzcGVjaWZ5IHRoZSBsb2NhdGlvbiB0byBnZW9jb2RlLicpO1xuICAgIH1cblxuICAgIHZhciB1cmwgPSBCQVNFX1VSTCArXG4gICAgICAgICAgICAgIGRhdGFzZXQgKyAnLycgK1xuICAgICAgICAgICAgICBxdWVyeSArICcuanNvbicgK1xuICAgICAgICAgICAgICAnP2FjY2Vzc190b2tlbj0nICsgQUNDRVNTX1RPS0VOICtcbiAgICAgICAgICAgICAgJyZjb3VudHJ5PVVTJyArXG4gICAgICAgICAgICAgIChCQk9YID8gYCZiYm94PSR7QkJPWH1gIDogJycpICsgLy8gbWluWCxtaW5ZLG1heFgsbWF4WVxuICAgICAgICAgICAgICAoQ0VOVEVSID8gYCYke0NFTlRFUlswXX0sJHtDRU5URVJbMV19YCA6ICcnKTtcblxuXG4gICAgLy8gZmV0Y2godXJsKVxuICAgIC8vICAgICAudGhlbihyZXNwID0+IHtcbiAgICAvLyAgICAgICAgIGlmIChyZXNwLnN0YXR1cyAhPT0gMjAwKSB7XG4gICAgLy8gICAgICAgICAgICAgcmVzcC5qc29uKCkudGhlbihkYXRhID0+IHtcbiAgICAvLyAgICAgICAgICAgICAgICAgcmV0dXJuIGRvbmUoJ0ludmFsaWQgUmVzcG9uc2UnLCBkYXRhKTtcbiAgICAvLyAgICAgICAgICAgICB9KTtcbiAgICAvLyAgICAgICAgIH0gZWxzZSB7XG4gICAgLy8gICAgICAgICAgICAgcmVzcC5qc29uKCkudGhlbihkYXRhID0+IHtcbiAgICAvLyAgICAgICAgICAgICAgICAgZG9uZShudWxsLCBkYXRhKTtcbiAgICAvLyAgICAgICAgICAgICB9KTtcbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgKVxuICAgIC8vICAgICAuY2F0Y2goZXJyb3IpIHtcbiAgICAvLyAgICAgICAgIGRvbmUoZXJyb3IpO1xuICAgIC8vICAgICB9XG5cbiAgICAvLyByZWltcGxlbWVudGVkIGFib3ZlIHcvbyByZXF1ZXN0IGJlY2F1c2UgaXQncyBodWdlXG4gICAgcmVxdWVzdCh1cmwgLCBmdW5jdGlvbiAoZXJyLCByZXNwb25zZSwgYm9keSkge1xuICAgICAgICBpZiAoZXJyIHx8IHJlc3BvbnNlLnN0YXR1c0NvZGUgIT09IDIwMCkge1xuICAgICAgICAgICAgcmV0dXJuIGRvbmUoZXJyIHx8IEpTT04ucGFyc2UoYm9keSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZG9uZShudWxsLCBKU09OLnBhcnNlKGJvZHkpKTtcbiAgICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIG1hcGJveCBhY2Nlc3MgdG9rZW4gd2l0aCB0aGUgZ2l2ZW4gb25lLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGFjY2Vzc1Rva2VuIC0gVGhlIG1hcGJveCBwdWJsaWMgYWNjZXNzIHRva2VuXG4gICAgICovXG4gICAgc2V0QWNjZXNzVG9rZW46IGZ1bmN0aW9uIChhY2Nlc3NUb2tlbikge1xuICAgICAgICBBQ0NFU1NfVE9LRU4gPSBhY2Nlc3NUb2tlbjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgbG9jYXRpb24gdG8gdXNlIGZvciBwcm94aW1pdHkgZ2VvY29kaW5nIHNlYXJjaC5cbiAgICAgKiBAcGFyYW0ge1tsb25naXR1ZGUsIGxhdGl0dWRlXX1cbiAgICAgKlxuICAgICAqL1xuICAgIHNldFNlYXJjaENlbnRlcjogZnVuY3Rpb24gKGNlbnRlcikge1xuICAgICAgICBDRU5URVIgPSBjZW50ZXI7XG4gICAgfSxcblxuICAgIHNldFNlYXJjaEJvdW5kczogZnVuY3Rpb24gKGJib3gpIHtcbiAgICAgICAgQkJPWCA9IGJib3g7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdlb2NvZGVzIHRoZSBnaXZlbiBhZGRyZXNzLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSAgIGRhdGFzZXQgLSBUaGUgbWFwYm94IGRhdGFzZXQgKCdtYXBib3gucGxhY2VzJyBvciAnbWFwYm94LnBsYWNlcy1wZXJtYW5lbnQnKVxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gICBhZGRyZXNzIC0gVGhlIGFkZHJlc3MgdG8gZ2VvY29kZVxuICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBkb25lICAgIC0gQ2FsbGJhY2sgZnVuY3Rpb24gd2l0aCBhbiBlcnJvciBhbmQgdGhlIHJldHVybmVkIGRhdGEgYXMgcGFyYW1ldGVyXG4gICAgICovXG4gICAgZ2VvY29kZTogZnVuY3Rpb24gKGRhdGFzZXQsIGFkZHJlc3MsIGRvbmUpIHtcbiAgICAgICAgX19nZW9jb2RlUXVlcnkoZGF0YXNldCwgYWRkcmVzcywgZG9uZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldmVyc2UgZ2VvY29kZXMgdGhlIGdpdmVuIGxvbmdpdHVkZSBhbmQgbGF0aXR1ZGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9ICAgZGF0YXNldCAtIFRoZSBtYXBib3ggZGF0YXNldCAoJ21hcGJveC5wbGFjZXMnIG9yICdtYXBib3gucGxhY2VzLXBlcm1hbmVudCcpXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSAgIGFkZHJlc3MgLSBUaGUgYWRkcmVzcyB0byBnZW9jb2RlXG4gICAgICogQHBhcmFtICB7RnVuY3Rpb259IGRvbmUgICAgLSBDYWxsYmFjayBmdW5jdGlvbiB3aXRoIGFuIGVycm9yIGFuZCB0aGUgcmV0dXJuZWQgZGF0YSBhcyBwYXJhbWV0ZXJcbiAgICAgKi9cbiAgICByZXZlcnNlR2VvY29kZTogZnVuY3Rpb24gKGRhdGFzZXQsIGxuZywgbGF0LCBkb25lKSB7XG4gICAgICAgIHZhciBxdWVyeSA9IGxuZyArICcsJyArIGxhdDtcblxuICAgICAgICBfX2dlb2NvZGVRdWVyeShkYXRhc2V0LCBxdWVyeSwgZG9uZSk7XG4gICAgfVxufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL21hcGJveC1nZW9jb2RpbmcvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDM0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIEJyb3dzZXIgUmVxdWVzdFxuLy9cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vXG4vLyAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vL1xuLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuLy8gVU1EIEhFQURFUiBTVEFSVCBcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgICAgICBkZWZpbmUoW10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIC8vIE5vZGUuIERvZXMgbm90IHdvcmsgd2l0aCBzdHJpY3QgQ29tbW9uSlMsIGJ1dFxuICAgICAgICAvLyBvbmx5IENvbW1vbkpTLWxpa2UgZW52aXJvbWVudHMgdGhhdCBzdXBwb3J0IG1vZHVsZS5leHBvcnRzLFxuICAgICAgICAvLyBsaWtlIE5vZGUuXG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgICAgIHJvb3QucmV0dXJuRXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG4vLyBVTUQgSEVBREVSIEVORFxuXG52YXIgWEhSID0gWE1MSHR0cFJlcXVlc3RcbmlmICghWEhSKSB0aHJvdyBuZXcgRXJyb3IoJ21pc3NpbmcgWE1MSHR0cFJlcXVlc3QnKVxucmVxdWVzdC5sb2cgPSB7XG4gICd0cmFjZSc6IG5vb3AsICdkZWJ1Zyc6IG5vb3AsICdpbmZvJzogbm9vcCwgJ3dhcm4nOiBub29wLCAnZXJyb3InOiBub29wXG59XG5cbnZhciBERUZBVUxUX1RJTUVPVVQgPSAzICogNjAgKiAxMDAwIC8vIDMgbWludXRlc1xuXG4vL1xuLy8gcmVxdWVzdFxuLy9cblxuZnVuY3Rpb24gcmVxdWVzdChvcHRpb25zLCBjYWxsYmFjaykge1xuICAvLyBUaGUgZW50cnktcG9pbnQgdG8gdGhlIEFQSTogcHJlcCB0aGUgb3B0aW9ucyBvYmplY3QgYW5kIHBhc3MgdGhlIHJlYWwgd29yayB0byBydW5feGhyLlxuICBpZih0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdCYWQgY2FsbGJhY2sgZ2l2ZW46ICcgKyBjYWxsYmFjaylcblxuICBpZighb3B0aW9ucylcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIG9wdGlvbnMgZ2l2ZW4nKVxuXG4gIHZhciBvcHRpb25zX29uUmVzcG9uc2UgPSBvcHRpb25zLm9uUmVzcG9uc2U7IC8vIFNhdmUgdGhpcyBmb3IgbGF0ZXIuXG5cbiAgaWYodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKVxuICAgIG9wdGlvbnMgPSB7J3VyaSc6b3B0aW9uc307XG4gIGVsc2VcbiAgICBvcHRpb25zID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHRpb25zKSk7IC8vIFVzZSBhIGR1cGxpY2F0ZSBmb3IgbXV0YXRpbmcuXG5cbiAgb3B0aW9ucy5vblJlc3BvbnNlID0gb3B0aW9uc19vblJlc3BvbnNlIC8vIEFuZCBwdXQgaXQgYmFjay5cblxuICBpZiAob3B0aW9ucy52ZXJib3NlKSByZXF1ZXN0LmxvZyA9IGdldExvZ2dlcigpO1xuXG4gIGlmKG9wdGlvbnMudXJsKSB7XG4gICAgb3B0aW9ucy51cmkgPSBvcHRpb25zLnVybDtcbiAgICBkZWxldGUgb3B0aW9ucy51cmw7XG4gIH1cblxuICBpZighb3B0aW9ucy51cmkgJiYgb3B0aW9ucy51cmkgIT09IFwiXCIpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwib3B0aW9ucy51cmkgaXMgYSByZXF1aXJlZCBhcmd1bWVudFwiKTtcblxuICBpZih0eXBlb2Ygb3B0aW9ucy51cmkgIT0gXCJzdHJpbmdcIilcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJvcHRpb25zLnVyaSBtdXN0IGJlIGEgc3RyaW5nXCIpO1xuXG4gIHZhciB1bnN1cHBvcnRlZF9vcHRpb25zID0gWydwcm94eScsICdfcmVkaXJlY3RzRm9sbG93ZWQnLCAnbWF4UmVkaXJlY3RzJywgJ2ZvbGxvd1JlZGlyZWN0J11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB1bnN1cHBvcnRlZF9vcHRpb25zLmxlbmd0aDsgaSsrKVxuICAgIGlmKG9wdGlvbnNbIHVuc3VwcG9ydGVkX29wdGlvbnNbaV0gXSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9wdGlvbnMuXCIgKyB1bnN1cHBvcnRlZF9vcHRpb25zW2ldICsgXCIgaXMgbm90IHN1cHBvcnRlZFwiKVxuXG4gIG9wdGlvbnMuY2FsbGJhY2sgPSBjYWxsYmFja1xuICBvcHRpb25zLm1ldGhvZCA9IG9wdGlvbnMubWV0aG9kIHx8ICdHRVQnO1xuICBvcHRpb25zLmhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgfHwge307XG4gIG9wdGlvbnMuYm9keSAgICA9IG9wdGlvbnMuYm9keSB8fCBudWxsXG4gIG9wdGlvbnMudGltZW91dCA9IG9wdGlvbnMudGltZW91dCB8fCByZXF1ZXN0LkRFRkFVTFRfVElNRU9VVFxuXG4gIGlmKG9wdGlvbnMuaGVhZGVycy5ob3N0KVxuICAgIHRocm93IG5ldyBFcnJvcihcIk9wdGlvbnMuaGVhZGVycy5ob3N0IGlzIG5vdCBzdXBwb3J0ZWRcIik7XG5cbiAgaWYob3B0aW9ucy5qc29uKSB7XG4gICAgb3B0aW9ucy5oZWFkZXJzLmFjY2VwdCA9IG9wdGlvbnMuaGVhZGVycy5hY2NlcHQgfHwgJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgaWYob3B0aW9ucy5tZXRob2QgIT09ICdHRVQnKVxuICAgICAgb3B0aW9ucy5oZWFkZXJzWydjb250ZW50LXR5cGUnXSA9ICdhcHBsaWNhdGlvbi9qc29uJ1xuXG4gICAgaWYodHlwZW9mIG9wdGlvbnMuanNvbiAhPT0gJ2Jvb2xlYW4nKVxuICAgICAgb3B0aW9ucy5ib2R5ID0gSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5qc29uKVxuICAgIGVsc2UgaWYodHlwZW9mIG9wdGlvbnMuYm9keSAhPT0gJ3N0cmluZycpXG4gICAgICBvcHRpb25zLmJvZHkgPSBKU09OLnN0cmluZ2lmeShvcHRpb25zLmJvZHkpXG4gIH1cbiAgXG4gIC8vQkVHSU4gUVMgSGFja1xuICB2YXIgc2VyaWFsaXplID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHN0ciA9IFtdO1xuICAgIGZvcih2YXIgcCBpbiBvYmopXG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KHApKSB7XG4gICAgICAgIHN0ci5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChwKSArIFwiPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KG9ialtwXSkpO1xuICAgICAgfVxuICAgIHJldHVybiBzdHIuam9pbihcIiZcIik7XG4gIH1cbiAgXG4gIGlmKG9wdGlvbnMucXMpe1xuICAgIHZhciBxcyA9ICh0eXBlb2Ygb3B0aW9ucy5xcyA9PSAnc3RyaW5nJyk/IG9wdGlvbnMucXMgOiBzZXJpYWxpemUob3B0aW9ucy5xcyk7XG4gICAgaWYob3B0aW9ucy51cmkuaW5kZXhPZignPycpICE9PSAtMSl7IC8vbm8gZ2V0IHBhcmFtc1xuICAgICAgICBvcHRpb25zLnVyaSA9IG9wdGlvbnMudXJpKycmJytxcztcbiAgICB9ZWxzZXsgLy9leGlzdGluZyBnZXQgcGFyYW1zXG4gICAgICAgIG9wdGlvbnMudXJpID0gb3B0aW9ucy51cmkrJz8nK3FzO1xuICAgIH1cbiAgfVxuICAvL0VORCBRUyBIYWNrXG4gIFxuICAvL0JFR0lOIEZPUk0gSGFja1xuICB2YXIgbXVsdGlwYXJ0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgLy90b2RvOiBzdXBwb3J0IGZpbGUgdHlwZSAodXNlZnVsPylcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgcmVzdWx0LmJvdW5kcnkgPSAnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScrTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjEwMDAwMDAwMDApO1xuICAgIHZhciBsaW5lcyA9IFtdO1xuICAgIGZvcih2YXIgcCBpbiBvYmope1xuICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KHApKSB7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKFxuICAgICAgICAgICAgICAgICctLScrcmVzdWx0LmJvdW5kcnkrXCJcXG5cIitcbiAgICAgICAgICAgICAgICAnQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPVwiJytwKydcIicrXCJcXG5cIitcbiAgICAgICAgICAgICAgICBcIlxcblwiK1xuICAgICAgICAgICAgICAgIG9ialtwXStcIlxcblwiXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuICAgIGxpbmVzLnB1c2goICctLScrcmVzdWx0LmJvdW5kcnkrJy0tJyApO1xuICAgIHJlc3VsdC5ib2R5ID0gbGluZXMuam9pbignJyk7XG4gICAgcmVzdWx0Lmxlbmd0aCA9IHJlc3VsdC5ib2R5Lmxlbmd0aDtcbiAgICByZXN1bHQudHlwZSA9ICdtdWx0aXBhcnQvZm9ybS1kYXRhOyBib3VuZGFyeT0nK3Jlc3VsdC5ib3VuZHJ5O1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgXG4gIGlmKG9wdGlvbnMuZm9ybSl7XG4gICAgaWYodHlwZW9mIG9wdGlvbnMuZm9ybSA9PSAnc3RyaW5nJykgdGhyb3coJ2Zvcm0gbmFtZSB1bnN1cHBvcnRlZCcpO1xuICAgIGlmKG9wdGlvbnMubWV0aG9kID09PSAnUE9TVCcpe1xuICAgICAgICB2YXIgZW5jb2RpbmcgPSAob3B0aW9ucy5lbmNvZGluZyB8fCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgb3B0aW9ucy5oZWFkZXJzWydjb250ZW50LXR5cGUnXSA9IGVuY29kaW5nO1xuICAgICAgICBzd2l0Y2goZW5jb2Rpbmcpe1xuICAgICAgICAgICAgY2FzZSAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJzpcbiAgICAgICAgICAgICAgICBvcHRpb25zLmJvZHkgPSBzZXJpYWxpemUob3B0aW9ucy5mb3JtKS5yZXBsYWNlKC8lMjAvZywgXCIrXCIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbXVsdGlwYXJ0L2Zvcm0tZGF0YSc6XG4gICAgICAgICAgICAgICAgdmFyIG11bHRpID0gbXVsdGlwYXJ0KG9wdGlvbnMuZm9ybSk7XG4gICAgICAgICAgICAgICAgLy9vcHRpb25zLmhlYWRlcnNbJ2NvbnRlbnQtbGVuZ3RoJ10gPSBtdWx0aS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5ib2R5ID0gbXVsdGkuYm9keTtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddID0gbXVsdGkudHlwZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQgOiB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIGVuY29kaW5nOicrZW5jb2RpbmcpO1xuICAgICAgICB9XG4gICAgfVxuICB9XG4gIC8vRU5EIEZPUk0gSGFja1xuXG4gIC8vIElmIG9uUmVzcG9uc2UgaXMgYm9vbGVhbiB0cnVlLCBjYWxsIGJhY2sgaW1tZWRpYXRlbHkgd2hlbiB0aGUgcmVzcG9uc2UgaXMga25vd24sXG4gIC8vIG5vdCB3aGVuIHRoZSBmdWxsIHJlcXVlc3QgaXMgY29tcGxldGUuXG4gIG9wdGlvbnMub25SZXNwb25zZSA9IG9wdGlvbnMub25SZXNwb25zZSB8fCBub29wXG4gIGlmKG9wdGlvbnMub25SZXNwb25zZSA9PT0gdHJ1ZSkge1xuICAgIG9wdGlvbnMub25SZXNwb25zZSA9IGNhbGxiYWNrXG4gICAgb3B0aW9ucy5jYWxsYmFjayA9IG5vb3BcbiAgfVxuXG4gIC8vIFhYWCBCcm93c2VycyBkbyBub3QgbGlrZSB0aGlzLlxuICAvL2lmKG9wdGlvbnMuYm9keSlcbiAgLy8gIG9wdGlvbnMuaGVhZGVyc1snY29udGVudC1sZW5ndGgnXSA9IG9wdGlvbnMuYm9keS5sZW5ndGg7XG5cbiAgLy8gSFRUUCBiYXNpYyBhdXRoZW50aWNhdGlvblxuICBpZighb3B0aW9ucy5oZWFkZXJzLmF1dGhvcml6YXRpb24gJiYgb3B0aW9ucy5hdXRoKVxuICAgIG9wdGlvbnMuaGVhZGVycy5hdXRob3JpemF0aW9uID0gJ0Jhc2ljICcgKyBiNjRfZW5jKG9wdGlvbnMuYXV0aC51c2VybmFtZSArICc6JyArIG9wdGlvbnMuYXV0aC5wYXNzd29yZCk7XG5cbiAgcmV0dXJuIHJ1bl94aHIob3B0aW9ucylcbn1cblxudmFyIHJlcV9zZXEgPSAwXG5mdW5jdGlvbiBydW5feGhyKG9wdGlvbnMpIHtcbiAgdmFyIHhociA9IG5ldyBYSFJcbiAgICAsIHRpbWVkX291dCA9IGZhbHNlXG4gICAgLCBpc19jb3JzID0gaXNfY3Jvc3NEb21haW4ob3B0aW9ucy51cmkpXG4gICAgLCBzdXBwb3J0c19jb3JzID0gKCd3aXRoQ3JlZGVudGlhbHMnIGluIHhocilcblxuICByZXFfc2VxICs9IDFcbiAgeGhyLnNlcV9pZCA9IHJlcV9zZXFcbiAgeGhyLmlkID0gcmVxX3NlcSArICc6ICcgKyBvcHRpb25zLm1ldGhvZCArICcgJyArIG9wdGlvbnMudXJpXG4gIHhoci5faWQgPSB4aHIuaWQgLy8gSSBrbm93IEkgd2lsbCB0eXBlIFwiX2lkXCIgZnJvbSBoYWJpdCBhbGwgdGhlIHRpbWUuXG5cbiAgaWYoaXNfY29ycyAmJiAhc3VwcG9ydHNfY29ycykge1xuICAgIHZhciBjb3JzX2VyciA9IG5ldyBFcnJvcignQnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGNyb3NzLW9yaWdpbiByZXF1ZXN0OiAnICsgb3B0aW9ucy51cmkpXG4gICAgY29yc19lcnIuY29ycyA9ICd1bnN1cHBvcnRlZCdcbiAgICByZXR1cm4gb3B0aW9ucy5jYWxsYmFjayhjb3JzX2VyciwgeGhyKVxuICB9XG5cbiAgeGhyLnRpbWVvdXRUaW1lciA9IHNldFRpbWVvdXQodG9vX2xhdGUsIG9wdGlvbnMudGltZW91dClcbiAgZnVuY3Rpb24gdG9vX2xhdGUoKSB7XG4gICAgdGltZWRfb3V0ID0gdHJ1ZVxuICAgIHZhciBlciA9IG5ldyBFcnJvcignRVRJTUVET1VUJylcbiAgICBlci5jb2RlID0gJ0VUSU1FRE9VVCdcbiAgICBlci5kdXJhdGlvbiA9IG9wdGlvbnMudGltZW91dFxuXG4gICAgcmVxdWVzdC5sb2cuZXJyb3IoJ1RpbWVvdXQnLCB7ICdpZCc6eGhyLl9pZCwgJ21pbGxpc2Vjb25kcyc6b3B0aW9ucy50aW1lb3V0IH0pXG4gICAgcmV0dXJuIG9wdGlvbnMuY2FsbGJhY2soZXIsIHhocilcbiAgfVxuXG4gIC8vIFNvbWUgc3RhdGVzIGNhbiBiZSBza2lwcGVkIG92ZXIsIHNvIHJlbWVtYmVyIHdoYXQgaXMgc3RpbGwgaW5jb21wbGV0ZS5cbiAgdmFyIGRpZCA9IHsncmVzcG9uc2UnOmZhbHNlLCAnbG9hZGluZyc6ZmFsc2UsICdlbmQnOmZhbHNlfVxuXG4gIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBvbl9zdGF0ZV9jaGFuZ2VcbiAgeGhyLm9wZW4ob3B0aW9ucy5tZXRob2QsIG9wdGlvbnMudXJpLCB0cnVlKSAvLyBhc3luY2hyb25vdXNcbiAgaWYoaXNfY29ycylcbiAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gISEgb3B0aW9ucy53aXRoQ3JlZGVudGlhbHNcbiAgeGhyLnNlbmQob3B0aW9ucy5ib2R5KVxuICByZXR1cm4geGhyXG5cbiAgZnVuY3Rpb24gb25fc3RhdGVfY2hhbmdlKGV2ZW50KSB7XG4gICAgaWYodGltZWRfb3V0KVxuICAgICAgcmV0dXJuIHJlcXVlc3QubG9nLmRlYnVnKCdJZ25vcmluZyB0aW1lZCBvdXQgc3RhdGUgY2hhbmdlJywgeydzdGF0ZSc6eGhyLnJlYWR5U3RhdGUsICdpZCc6eGhyLmlkfSlcblxuICAgIHJlcXVlc3QubG9nLmRlYnVnKCdTdGF0ZSBjaGFuZ2UnLCB7J3N0YXRlJzp4aHIucmVhZHlTdGF0ZSwgJ2lkJzp4aHIuaWQsICd0aW1lZF9vdXQnOnRpbWVkX291dH0pXG5cbiAgICBpZih4aHIucmVhZHlTdGF0ZSA9PT0gWEhSLk9QRU5FRCkge1xuICAgICAgcmVxdWVzdC5sb2cuZGVidWcoJ1JlcXVlc3Qgc3RhcnRlZCcsIHsnaWQnOnhoci5pZH0pXG4gICAgICBmb3IgKHZhciBrZXkgaW4gb3B0aW9ucy5oZWFkZXJzKVxuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihrZXksIG9wdGlvbnMuaGVhZGVyc1trZXldKVxuICAgIH1cblxuICAgIGVsc2UgaWYoeGhyLnJlYWR5U3RhdGUgPT09IFhIUi5IRUFERVJTX1JFQ0VJVkVEKVxuICAgICAgb25fcmVzcG9uc2UoKVxuXG4gICAgZWxzZSBpZih4aHIucmVhZHlTdGF0ZSA9PT0gWEhSLkxPQURJTkcpIHtcbiAgICAgIG9uX3Jlc3BvbnNlKClcbiAgICAgIG9uX2xvYWRpbmcoKVxuICAgIH1cblxuICAgIGVsc2UgaWYoeGhyLnJlYWR5U3RhdGUgPT09IFhIUi5ET05FKSB7XG4gICAgICBvbl9yZXNwb25zZSgpXG4gICAgICBvbl9sb2FkaW5nKClcbiAgICAgIG9uX2VuZCgpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25fcmVzcG9uc2UoKSB7XG4gICAgaWYoZGlkLnJlc3BvbnNlKVxuICAgICAgcmV0dXJuXG5cbiAgICBkaWQucmVzcG9uc2UgPSB0cnVlXG4gICAgcmVxdWVzdC5sb2cuZGVidWcoJ0dvdCByZXNwb25zZScsIHsnaWQnOnhoci5pZCwgJ3N0YXR1cyc6eGhyLnN0YXR1c30pXG4gICAgY2xlYXJUaW1lb3V0KHhoci50aW1lb3V0VGltZXIpXG4gICAgeGhyLnN0YXR1c0NvZGUgPSB4aHIuc3RhdHVzIC8vIE5vZGUgcmVxdWVzdCBjb21wYXRpYmlsaXR5XG5cbiAgICAvLyBEZXRlY3QgZmFpbGVkIENPUlMgcmVxdWVzdHMuXG4gICAgaWYoaXNfY29ycyAmJiB4aHIuc3RhdHVzQ29kZSA9PSAwKSB7XG4gICAgICB2YXIgY29yc19lcnIgPSBuZXcgRXJyb3IoJ0NPUlMgcmVxdWVzdCByZWplY3RlZDogJyArIG9wdGlvbnMudXJpKVxuICAgICAgY29yc19lcnIuY29ycyA9ICdyZWplY3RlZCdcblxuICAgICAgLy8gRG8gbm90IHByb2Nlc3MgdGhpcyByZXF1ZXN0IGZ1cnRoZXIuXG4gICAgICBkaWQubG9hZGluZyA9IHRydWVcbiAgICAgIGRpZC5lbmQgPSB0cnVlXG5cbiAgICAgIHJldHVybiBvcHRpb25zLmNhbGxiYWNrKGNvcnNfZXJyLCB4aHIpXG4gICAgfVxuXG4gICAgb3B0aW9ucy5vblJlc3BvbnNlKG51bGwsIHhocilcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uX2xvYWRpbmcoKSB7XG4gICAgaWYoZGlkLmxvYWRpbmcpXG4gICAgICByZXR1cm5cblxuICAgIGRpZC5sb2FkaW5nID0gdHJ1ZVxuICAgIHJlcXVlc3QubG9nLmRlYnVnKCdSZXNwb25zZSBib2R5IGxvYWRpbmcnLCB7J2lkJzp4aHIuaWR9KVxuICAgIC8vIFRPRE86IE1heWJlIHNpbXVsYXRlIFwiZGF0YVwiIGV2ZW50cyBieSB3YXRjaGluZyB4aHIucmVzcG9uc2VUZXh0XG4gIH1cblxuICBmdW5jdGlvbiBvbl9lbmQoKSB7XG4gICAgaWYoZGlkLmVuZClcbiAgICAgIHJldHVyblxuXG4gICAgZGlkLmVuZCA9IHRydWVcbiAgICByZXF1ZXN0LmxvZy5kZWJ1ZygnUmVxdWVzdCBkb25lJywgeydpZCc6eGhyLmlkfSlcblxuICAgIHhoci5ib2R5ID0geGhyLnJlc3BvbnNlVGV4dFxuICAgIGlmKG9wdGlvbnMuanNvbikge1xuICAgICAgdHJ5ICAgICAgICB7IHhoci5ib2R5ID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KSB9XG4gICAgICBjYXRjaCAoZXIpIHsgcmV0dXJuIG9wdGlvbnMuY2FsbGJhY2soZXIsIHhocikgICAgICAgIH1cbiAgICB9XG5cbiAgICBvcHRpb25zLmNhbGxiYWNrKG51bGwsIHhociwgeGhyLmJvZHkpXG4gIH1cblxufSAvLyByZXF1ZXN0XG5cbnJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID0gZmFsc2U7XG5yZXF1ZXN0LkRFRkFVTFRfVElNRU9VVCA9IERFRkFVTFRfVElNRU9VVDtcblxuLy9cbi8vIGRlZmF1bHRzXG4vL1xuXG5yZXF1ZXN0LmRlZmF1bHRzID0gZnVuY3Rpb24ob3B0aW9ucywgcmVxdWVzdGVyKSB7XG4gIHZhciBkZWYgPSBmdW5jdGlvbiAobWV0aG9kKSB7XG4gICAgdmFyIGQgPSBmdW5jdGlvbiAocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgaWYodHlwZW9mIHBhcmFtcyA9PT0gJ3N0cmluZycpXG4gICAgICAgIHBhcmFtcyA9IHsndXJpJzogcGFyYW1zfTtcbiAgICAgIGVsc2Uge1xuICAgICAgICBwYXJhbXMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHBhcmFtcykpO1xuICAgICAgfVxuICAgICAgZm9yICh2YXIgaSBpbiBvcHRpb25zKSB7XG4gICAgICAgIGlmIChwYXJhbXNbaV0gPT09IHVuZGVmaW5lZCkgcGFyYW1zW2ldID0gb3B0aW9uc1tpXVxuICAgICAgfVxuICAgICAgcmV0dXJuIG1ldGhvZChwYXJhbXMsIGNhbGxiYWNrKVxuICAgIH1cbiAgICByZXR1cm4gZFxuICB9XG4gIHZhciBkZSA9IGRlZihyZXF1ZXN0KVxuICBkZS5nZXQgPSBkZWYocmVxdWVzdC5nZXQpXG4gIGRlLnBvc3QgPSBkZWYocmVxdWVzdC5wb3N0KVxuICBkZS5wdXQgPSBkZWYocmVxdWVzdC5wdXQpXG4gIGRlLmhlYWQgPSBkZWYocmVxdWVzdC5oZWFkKVxuICByZXR1cm4gZGVcbn1cblxuLy9cbi8vIEhUVFAgbWV0aG9kIHNob3J0Y3V0c1xuLy9cblxudmFyIHNob3J0Y3V0cyA9IFsgJ2dldCcsICdwdXQnLCAncG9zdCcsICdoZWFkJyBdO1xuc2hvcnRjdXRzLmZvckVhY2goZnVuY3Rpb24oc2hvcnRjdXQpIHtcbiAgdmFyIG1ldGhvZCA9IHNob3J0Y3V0LnRvVXBwZXJDYXNlKCk7XG4gIHZhciBmdW5jICAgPSBzaG9ydGN1dC50b0xvd2VyQ2FzZSgpO1xuXG4gIHJlcXVlc3RbZnVuY10gPSBmdW5jdGlvbihvcHRzKSB7XG4gICAgaWYodHlwZW9mIG9wdHMgPT09ICdzdHJpbmcnKVxuICAgICAgb3B0cyA9IHsnbWV0aG9kJzptZXRob2QsICd1cmknOm9wdHN9O1xuICAgIGVsc2Uge1xuICAgICAgb3B0cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3B0cykpO1xuICAgICAgb3B0cy5tZXRob2QgPSBtZXRob2Q7XG4gICAgfVxuXG4gICAgdmFyIGFyZ3MgPSBbb3B0c10uY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5hcHBseShhcmd1bWVudHMsIFsxXSkpO1xuICAgIHJldHVybiByZXF1ZXN0LmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG59KVxuXG4vL1xuLy8gQ291Y2hEQiBzaG9ydGN1dFxuLy9cblxucmVxdWVzdC5jb3VjaCA9IGZ1bmN0aW9uKG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gIGlmKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJylcbiAgICBvcHRpb25zID0geyd1cmknOm9wdGlvbnN9XG5cbiAgLy8gSnVzdCB1c2UgdGhlIHJlcXVlc3QgQVBJIHRvIGRvIEpTT04uXG4gIG9wdGlvbnMuanNvbiA9IHRydWVcbiAgaWYob3B0aW9ucy5ib2R5KVxuICAgIG9wdGlvbnMuanNvbiA9IG9wdGlvbnMuYm9keVxuICBkZWxldGUgb3B0aW9ucy5ib2R5XG5cbiAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wXG5cbiAgdmFyIHhociA9IHJlcXVlc3Qob3B0aW9ucywgY291Y2hfaGFuZGxlcilcbiAgcmV0dXJuIHhoclxuXG4gIGZ1bmN0aW9uIGNvdWNoX2hhbmRsZXIoZXIsIHJlc3AsIGJvZHkpIHtcbiAgICBpZihlcilcbiAgICAgIHJldHVybiBjYWxsYmFjayhlciwgcmVzcCwgYm9keSlcblxuICAgIGlmKChyZXNwLnN0YXR1c0NvZGUgPCAyMDAgfHwgcmVzcC5zdGF0dXNDb2RlID4gMjk5KSAmJiBib2R5LmVycm9yKSB7XG4gICAgICAvLyBUaGUgYm9keSBpcyBhIENvdWNoIEpTT04gb2JqZWN0IGluZGljYXRpbmcgdGhlIGVycm9yLlxuICAgICAgZXIgPSBuZXcgRXJyb3IoJ0NvdWNoREIgZXJyb3I6ICcgKyAoYm9keS5lcnJvci5yZWFzb24gfHwgYm9keS5lcnJvci5lcnJvcikpXG4gICAgICBmb3IgKHZhciBrZXkgaW4gYm9keSlcbiAgICAgICAgZXJba2V5XSA9IGJvZHlba2V5XVxuICAgICAgcmV0dXJuIGNhbGxiYWNrKGVyLCByZXNwLCBib2R5KTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2FsbGJhY2soZXIsIHJlc3AsIGJvZHkpO1xuICB9XG59XG5cbi8vXG4vLyBVdGlsaXR5XG4vL1xuXG5mdW5jdGlvbiBub29wKCkge31cblxuZnVuY3Rpb24gZ2V0TG9nZ2VyKCkge1xuICB2YXIgbG9nZ2VyID0ge31cbiAgICAsIGxldmVscyA9IFsndHJhY2UnLCAnZGVidWcnLCAnaW5mbycsICd3YXJuJywgJ2Vycm9yJ11cbiAgICAsIGxldmVsLCBpXG5cbiAgZm9yKGkgPSAwOyBpIDwgbGV2ZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV2ZWwgPSBsZXZlbHNbaV1cblxuICAgIGxvZ2dlcltsZXZlbF0gPSBub29wXG4gICAgaWYodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGUgJiYgY29uc29sZVtsZXZlbF0pXG4gICAgICBsb2dnZXJbbGV2ZWxdID0gZm9ybWF0dGVkKGNvbnNvbGUsIGxldmVsKVxuICB9XG5cbiAgcmV0dXJuIGxvZ2dlclxufVxuXG5mdW5jdGlvbiBmb3JtYXR0ZWQob2JqLCBtZXRob2QpIHtcbiAgcmV0dXJuIGZvcm1hdHRlZF9sb2dnZXJcblxuICBmdW5jdGlvbiBmb3JtYXR0ZWRfbG9nZ2VyKHN0ciwgY29udGV4dCkge1xuICAgIGlmKHR5cGVvZiBjb250ZXh0ID09PSAnb2JqZWN0JylcbiAgICAgIHN0ciArPSAnICcgKyBKU09OLnN0cmluZ2lmeShjb250ZXh0KVxuXG4gICAgcmV0dXJuIG9ialttZXRob2RdLmNhbGwob2JqLCBzdHIpXG4gIH1cbn1cblxuLy8gUmV0dXJuIHdoZXRoZXIgYSBVUkwgaXMgYSBjcm9zcy1kb21haW4gcmVxdWVzdC5cbmZ1bmN0aW9uIGlzX2Nyb3NzRG9tYWluKHVybCkge1xuICB2YXIgcnVybCA9IC9eKFtcXHdcXCtcXC5cXC1dKzopKD86XFwvXFwvKFteXFwvPyM6XSopKD86OihcXGQrKSk/KT8vXG5cbiAgLy8galF1ZXJ5ICM4MTM4LCBJRSBtYXkgdGhyb3cgYW4gZXhjZXB0aW9uIHdoZW4gYWNjZXNzaW5nXG4gIC8vIGEgZmllbGQgZnJvbSB3aW5kb3cubG9jYXRpb24gaWYgZG9jdW1lbnQuZG9tYWluIGhhcyBiZWVuIHNldFxuICB2YXIgYWpheExvY2F0aW9uXG4gIHRyeSB7IGFqYXhMb2NhdGlvbiA9IGxvY2F0aW9uLmhyZWYgfVxuICBjYXRjaCAoZSkge1xuICAgIC8vIFVzZSB0aGUgaHJlZiBhdHRyaWJ1dGUgb2YgYW4gQSBlbGVtZW50IHNpbmNlIElFIHdpbGwgbW9kaWZ5IGl0IGdpdmVuIGRvY3VtZW50LmxvY2F0aW9uXG4gICAgYWpheExvY2F0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggXCJhXCIgKTtcbiAgICBhamF4TG9jYXRpb24uaHJlZiA9IFwiXCI7XG4gICAgYWpheExvY2F0aW9uID0gYWpheExvY2F0aW9uLmhyZWY7XG4gIH1cblxuICB2YXIgYWpheExvY1BhcnRzID0gcnVybC5leGVjKGFqYXhMb2NhdGlvbi50b0xvd2VyQ2FzZSgpKSB8fCBbXVxuICAgICwgcGFydHMgPSBydXJsLmV4ZWModXJsLnRvTG93ZXJDYXNlKCkgKVxuXG4gIHZhciByZXN1bHQgPSAhIShcbiAgICBwYXJ0cyAmJlxuICAgICggIHBhcnRzWzFdICE9IGFqYXhMb2NQYXJ0c1sxXVxuICAgIHx8IHBhcnRzWzJdICE9IGFqYXhMb2NQYXJ0c1syXVxuICAgIHx8IChwYXJ0c1szXSB8fCAocGFydHNbMV0gPT09IFwiaHR0cDpcIiA/IDgwIDogNDQzKSkgIT0gKGFqYXhMb2NQYXJ0c1szXSB8fCAoYWpheExvY1BhcnRzWzFdID09PSBcImh0dHA6XCIgPyA4MCA6IDQ0MykpXG4gICAgKVxuICApXG5cbiAgLy9jb25zb2xlLmRlYnVnKCdpc19jcm9zc0RvbWFpbignK3VybCsnKSAtPiAnICsgcmVzdWx0KVxuICByZXR1cm4gcmVzdWx0XG59XG5cbi8vIE1JVCBMaWNlbnNlIGZyb20gaHR0cDovL3BocGpzLm9yZy9mdW5jdGlvbnMvYmFzZTY0X2VuY29kZTozNThcbmZ1bmN0aW9uIGI2NF9lbmMgKGRhdGEpIHtcbiAgICAvLyBFbmNvZGVzIHN0cmluZyB1c2luZyBNSU1FIGJhc2U2NCBhbGdvcml0aG1cbiAgICB2YXIgYjY0ID0gXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPVwiO1xuICAgIHZhciBvMSwgbzIsIG8zLCBoMSwgaDIsIGgzLCBoNCwgYml0cywgaSA9IDAsIGFjID0gMCwgZW5jPVwiXCIsIHRtcF9hcnIgPSBbXTtcblxuICAgIGlmICghZGF0YSkge1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG5cbiAgICAvLyBhc3N1bWUgdXRmOCBkYXRhXG4gICAgLy8gZGF0YSA9IHRoaXMudXRmOF9lbmNvZGUoZGF0YSsnJyk7XG5cbiAgICBkbyB7IC8vIHBhY2sgdGhyZWUgb2N0ZXRzIGludG8gZm91ciBoZXhldHNcbiAgICAgICAgbzEgPSBkYXRhLmNoYXJDb2RlQXQoaSsrKTtcbiAgICAgICAgbzIgPSBkYXRhLmNoYXJDb2RlQXQoaSsrKTtcbiAgICAgICAgbzMgPSBkYXRhLmNoYXJDb2RlQXQoaSsrKTtcblxuICAgICAgICBiaXRzID0gbzE8PDE2IHwgbzI8PDggfCBvMztcblxuICAgICAgICBoMSA9IGJpdHM+PjE4ICYgMHgzZjtcbiAgICAgICAgaDIgPSBiaXRzPj4xMiAmIDB4M2Y7XG4gICAgICAgIGgzID0gYml0cz4+NiAmIDB4M2Y7XG4gICAgICAgIGg0ID0gYml0cyAmIDB4M2Y7XG5cbiAgICAgICAgLy8gdXNlIGhleGV0cyB0byBpbmRleCBpbnRvIGI2NCwgYW5kIGFwcGVuZCByZXN1bHQgdG8gZW5jb2RlZCBzdHJpbmdcbiAgICAgICAgdG1wX2FyclthYysrXSA9IGI2NC5jaGFyQXQoaDEpICsgYjY0LmNoYXJBdChoMikgKyBiNjQuY2hhckF0KGgzKSArIGI2NC5jaGFyQXQoaDQpO1xuICAgIH0gd2hpbGUgKGkgPCBkYXRhLmxlbmd0aCk7XG5cbiAgICBlbmMgPSB0bXBfYXJyLmpvaW4oJycpO1xuXG4gICAgc3dpdGNoIChkYXRhLmxlbmd0aCAlIDMpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgZW5jID0gZW5jLnNsaWNlKDAsIC0yKSArICc9PSc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBlbmMgPSBlbmMuc2xpY2UoMCwgLTEpICsgJz0nO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gZW5jO1xufVxuICAgIHJldHVybiByZXF1ZXN0O1xuLy9VTUQgRk9PVEVSIFNUQVJUXG59KSk7XG4vL1VNRCBGT09URVIgRU5EXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9icm93c2VyLXJlcXVlc3QvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDM1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnO1xuXG5pbXBvcnQgcG9seWxpbmUgZnJvbSAnLi92ZW5kb3IvcG9seWxpbmUnO1xuXG4vLyBjb25zdCBwb2x5bGluZSA9IHJlcXVpcmUoJ0BtYXBib3gvcG9seWxpbmUnKTtcblxuXG5mdW5jdGlvbiBsYXRMbmdQYWlyVG9HZW9Kc29uUG9pbnQocGFpcikge1xuICAvLyBHZW9KU09OIGlzIGluIHRoZSBvcHBvc2l0ZSBvcmRlcjogTG9uZ2l0dWRlLCB0aGVuIExhdGl0dWRlXG4gIHJldHVybiBbcGFpclsxXSwgcGFpclswXV07XG59XG5cbi8qKlxuICogRmV0Y2ggcm91dGUgcG9pbnQgYSB0byBwb2ludCBiLCBjYWxsIGNhbGxiYWNrIHdoZW4gZG9uZS5cbiAqIEBwYXJhbSB7UG9pbnR9IGZyb21cbiAqIEBwYXJhbSB7UG9pbnR9IHRvXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmZXRjaFJvdXRlKGEsIGIsIGNhbGxiYWNrKSB7XG4gIC8vIGJ1aWxkIGFuZCBzdWJtaXQgcmVxdWVzdCwgdGhlbiBjYWxsIGNhbGxiYWNrLlxuXG4gIGNvbnN0IGJhc2VVcmwgPSAnaHR0cHM6Ly92YWxoYWxsYS5tYXB6ZW4uY29tL3JvdXRlJztcblxuICBjb25zdCByb3V0ZUNvbmZpZyA9IHtcbiAgICBsb2NhdGlvbnM6XG4gICAgICBbXG4gICAgICAgIHsgbGF0OiBhLmxhdGl0dWRlLCBsb246IGEubG9uZ2l0dWRlLCBzdHJlZXQ6IGEuYWRkcmVzcyB9LFxuICAgICAgICB7IGxhdDogYi5sYXRpdHVkZSwgbG9uOiBiLmxvbmdpdHVkZSwgc3RyZWV0OiBiLmFkZHJlc3MgfSxcbiAgICAgIF0sXG4gICAgY29zdGluZzogJ2JpY3ljbGUnLFxuICAgIGNvc3Rpbmdfb3B0aW9uczoge1xuICAgICAgYmljeWNsZToge1xuICAgICAgICBiaWN5Y2xlX3R5cGU6ICdNb3VudGFpbicsIC8vIGJpa2Ugc2hhcmU6IGJpZ2dlciBhbmQgc2xvd2VyLlxuICAgICAgICB1c2Vfcm9hZHM6IDAuMjUsXG4gICAgICAgIHVzZV9oaWxsczogMC4xLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGRpcmVjdGlvbnNfb3B0aW9uczoge1xuICAgICAgdW5pdHM6ICdtaWxlcycsXG4gICAgfSxcbiAgICBpZDogJ3JvdXRlJyxcbiAgfTtcblxuICBjb25zdCByb3V0ZVByb3ZpZGVyVVJMID0gYCR7YmFzZVVybH0/anNvbj0ke0pTT04uc3RyaW5naWZ5KHJvdXRlQ29uZmlnKX0mYXBpX2tleT0ke2NvbmZpZy5tYXB6ZW5LZXl9YDtcblxuICBmZXRjaChyb3V0ZVByb3ZpZGVyVVJMKVxuICAgIC50aGVuKHJlc3AgPT4gcmVzcC5qc29uKCkpXG4gICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCdnb3Qgcm91dGUgZGF0YTogJywgZGF0YSk7XG4gICAgICBpZiAoZGF0YS50cmlwICYmIGRhdGEudHJpcC5sZWdzKSB7XG4gICAgICAgIC8vIGdlbmVyYXRlIGEgTXVsdGlMaW5lU3RyaW5nIChlYWNoIGxlZyBiZWNvbWVzIGEgbGluZSlcbiAgICAgICAgY29uc3QgbXVsdGlMaW5lQ29vcmRzID0gZGF0YS50cmlwLmxlZ3MubWFwKChsZWcpID0+IHtcbiAgICAgICAgICBjb25zdCBhcnIgPSBwb2x5bGluZS5kZWNvZGUobGVnLnNoYXBlKTsgLy8gcmV0dXJucyBhcnJheSBvZiBsYXQsIGxvbiBwYWlyc1xuICAgICAgICAgIC8vIGVhY2ggbGVnIGJlY29tZXMgdGhlIGNvb3JkaW5hdGVzIGZvciBhIExpbmVTdHJpbmcsXG4gICAgICAgICAgcmV0dXJuIGFyci5tYXAobGF0TG5nUGFpclRvR2VvSnNvblBvaW50KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IG11bHRpTGluZVN0cmluZyA9IHtcbiAgICAgICAgICB0eXBlOiAnRmVhdHVyZScsXG4gICAgICAgICAgcHJvcGVydGllczoge30sXG4gICAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICAgIHR5cGU6ICdNdWx0aUxpbmVTdHJpbmcnLFxuICAgICAgICAgICAgY29vcmRpbmF0ZXM6IG11bHRpTGluZUNvb3JkcyxcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgICBjb25zb2xlLmxvZygnZmV0Y2hlZCByb3V0ZSBhcyBtYXBwYWJsZSBmZWF0dXJlOiAnLCBtdWx0aUxpbmVTdHJpbmcpO1xuICAgICAgICBjYWxsYmFjayhtdWx0aUxpbmVTdHJpbmcpO1xuICAgICAgfVxuICAgIH0pXG4gICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ2Vycm9yIGZldGNoaW5nIHJvdXRlOiAnLCBlcnJvcik7XG4gICAgfSk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcm91dGVyLmpzIiwiXG4vLyBGcm9tOiBodHRwczovL21hcHplbi5jb20vZG9jdW1lbnRhdGlvbi9tb2JpbGl0eS9kZWNvZGluZy9cbmNvbnN0IHBvbHlsaW5lID0ge307XG5cbi8vIFRoaXMgaXMgYWRhcHRlZCBmcm9tIHRoZSBpbXBsZW1lbnRhdGlvbiBpbiBQcm9qZWN0LU9TUk1cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9EZW5uaXNPU1JNL1Byb2plY3QtT1NSTS1XZWIvYmxvYi9tYXN0ZXIvV2ViQ29udGVudC9yb3V0aW5nL09TUk0uUm91dGluZ0dlb21ldHJ5LmpzXG5wb2x5bGluZS5kZWNvZGUgPSBmdW5jdGlvbiAoc3RyLCBwcmVjaXNpb24pIHtcbiAgbGV0IGluZGV4ID0gMCxcbiAgICBsYXQgPSAwLFxuICAgIGxuZyA9IDAsXG4gICAgY29vcmRpbmF0ZXMgPSBbXSxcbiAgICBzaGlmdCA9IDAsXG4gICAgcmVzdWx0ID0gMCxcbiAgICBieXRlID0gbnVsbCxcbiAgICBsYXRpdHVkZV9jaGFuZ2UsXG4gICAgbG9uZ2l0dWRlX2NoYW5nZSxcbiAgICBmYWN0b3IgPSBNYXRoLnBvdygxMCwgcHJlY2lzaW9uIHx8IDYpO1xuXG4gICAgLy8gQ29vcmRpbmF0ZXMgaGF2ZSB2YXJpYWJsZSBsZW5ndGggd2hlbiBlbmNvZGVkLCBzbyBqdXN0IGtlZXBcbiAgICAvLyB0cmFjayBvZiB3aGV0aGVyIHdlJ3ZlIGhpdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcuIEluIGVhY2hcbiAgICAvLyBsb29wIGl0ZXJhdGlvbiwgYSBzaW5nbGUgY29vcmRpbmF0ZSBpcyBkZWNvZGVkLlxuICB3aGlsZSAoaW5kZXggPCBzdHIubGVuZ3RoKSB7XG4gICAgLy8gUmVzZXQgc2hpZnQsIHJlc3VsdCwgYW5kIGJ5dGVcbiAgICBieXRlID0gbnVsbDtcbiAgICBzaGlmdCA9IDA7XG4gICAgcmVzdWx0ID0gMDtcblxuICAgIGRvIHtcbiAgICAgIGJ5dGUgPSBzdHIuY2hhckNvZGVBdChpbmRleCsrKSAtIDYzO1xuICAgICAgcmVzdWx0IHw9IChieXRlICYgMHgxZikgPDwgc2hpZnQ7XG4gICAgICBzaGlmdCArPSA1O1xuICAgIH0gd2hpbGUgKGJ5dGUgPj0gMHgyMCk7XG5cbiAgICBsYXRpdHVkZV9jaGFuZ2UgPSAoKHJlc3VsdCAmIDEpID8gfihyZXN1bHQgPj4gMSkgOiAocmVzdWx0ID4+IDEpKTtcblxuICAgIHNoaWZ0ID0gcmVzdWx0ID0gMDtcblxuICAgIGRvIHtcbiAgICAgIGJ5dGUgPSBzdHIuY2hhckNvZGVBdChpbmRleCsrKSAtIDYzO1xuICAgICAgcmVzdWx0IHw9IChieXRlICYgMHgxZikgPDwgc2hpZnQ7XG4gICAgICBzaGlmdCArPSA1O1xuICAgIH0gd2hpbGUgKGJ5dGUgPj0gMHgyMCk7XG5cbiAgICBsb25naXR1ZGVfY2hhbmdlID0gKChyZXN1bHQgJiAxKSA/IH4ocmVzdWx0ID4+IDEpIDogKHJlc3VsdCA+PiAxKSk7XG5cbiAgICBsYXQgKz0gbGF0aXR1ZGVfY2hhbmdlO1xuICAgIGxuZyArPSBsb25naXR1ZGVfY2hhbmdlO1xuXG4gICAgY29vcmRpbmF0ZXMucHVzaChbbGF0IC8gZmFjdG9yLCBsbmcgLyBmYWN0b3JdKTtcbiAgfVxuXG4gIHJldHVybiBjb29yZGluYXRlcztcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHBvbHlsaW5lO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92ZW5kb3IvcG9seWxpbmUuanMiLCJcbmltcG9ydCBzdGF0ZSBmcm9tICcuL3N0YXRlJztcbmltcG9ydCB7IG1hcFVwZGF0ZURpcmVjdGlvbnNFbmRwb2ludCB9IGZyb20gJy4vbWFwJztcblxuaW1wb3J0IHVzZXJSZXZlcnNlR2VvY29kZSBmcm9tICcuL3VzZXJSZXZlcnNlR2VvY29kZSc7XG5cbi8qKlxuICogVGhlIG9yaWdpbiBsb2NhdG9yIGJ1dHRvbiB1cGRhdGVzIHRoZSBvcmlnaW4gaW5wdXQgYmFzZWRcbiAqIG9uIHRoZSB1c2VyJ3MgbG9jYXRpb24uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGluaXRPcmlnaW5Mb2NhdG9yQnRuKCkge1xuICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdkaXJlY3Rpb25zLS1sb2NhdGUtb3JpZ2luJylbMF07XG4gIC8vIGNvbnNvbGUubG9nKCdpbiBidG4gaW5pdCcpO1xuICBidG4ub25jbGljayA9IGZ1bmN0aW9uIG9uT3JpZ2luTG9jYXRvckJ0bkhhbmRsZXIoKSB7XG4gICAgLy8gY29uc29sZS5sb2coJ2luIGJ0biBjbGljayBoYW5kbGVyJyk7XG4gICAgY29uc3Qgb3JpZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvcmlnaW5JbnB1dCcpO1xuICAgIG9yaWcudmFsdWUgPSAnU2VhcmNoaW5nLi4uJztcbiAgICBpZiAoc3RhdGUudXNlci5hZGRyZXNzKSB7XG4gICAgICBvcmlnLnZhbHVlID0gc3RhdGUudXNlci5hZGRyZXNzO1xuICAgICAgc3RhdGUub3JpZ2luID0geyAuLi5zdGF0ZS51c2VyIH07XG4gICAgICBtYXBVcGRhdGVEaXJlY3Rpb25zRW5kcG9pbnQoJ29yaWdpbicpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnZmV0Y2hpbmcgeW91ciBhZGRyZXNzLi4uJyk7XG4gICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKChwb3NpdGlvbikgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhwb3NpdGlvbik7XG4gICAgICAgIGNvbnN0IHsgbGF0aXR1ZGUsIGxvbmdpdHVkZSB9ID0gcG9zaXRpb24uY29vcmRzO1xuICAgICAgICBzdGF0ZS51c2VyLmxhdGl0dWRlID0gbGF0aXR1ZGU7XG4gICAgICAgIHN0YXRlLnVzZXIubG9uZ2l0dWRlID0gbG9uZ2l0dWRlO1xuICAgICAgICBzdGF0ZS5vcmlnaW4gPSB7IC4uLnN0YXRlLnVzZXIgfTtcbiAgICAgICAgbWFwVXBkYXRlRGlyZWN0aW9uc0VuZHBvaW50KCdvcmlnaW4nKTtcbiAgICAgICAgdXNlclJldmVyc2VHZW9jb2RlKChlcnIsIGRhdGEsIGFkZHJlc3MpID0+IHtcbiAgICAgICAgICBvcmlnLnZhbHVlID0gYWRkcmVzcztcbiAgICAgICAgICBzdGF0ZS51c2VyLmFkZHJlc3MgPSBhZGRyZXNzO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9vcmlnaW5Mb2NhdG9yQnV0dG9uLmpzIiwiaW1wb3J0IGF1dG9jb21wbGV0ZSBmcm9tICdhdXRvY29tcGxldGVyJztcblxuaW1wb3J0IHsgZ2VvY29kZSB9IGZyb20gJy4vZ2VvY29kZXInO1xuaW1wb3J0IHsgbWFwVXBkYXRlRGlyZWN0aW9uc0VuZHBvaW50IH0gZnJvbSAnLi9tYXAnO1xuXG5pbXBvcnQgc3RhdGUgZnJvbSAnLi9zdGF0ZSc7XG5cbi8qKlxuICogSG9va3MgYW4gaW5wdXQgdXAgdG8gYW4gYXV0b2NvbXBsZXRlIHNlcnZpY2VcbiAqIEBwYXJhbSB7U3RyaW5nfSBlbElkIGVsZW1lbnQgaWQgb2YgdGhlIGlucHV0IHdoaWNoIHNob3VsZCBiZSBhdXRvY29tcGxldGVkXG4gKi9cbmZ1bmN0aW9uIGluaXRBdXRvY29tcGxldGUoZWxJZCkge1xuICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsSWQpO1xuXG4gIGF1dG9jb21wbGV0ZSh7XG4gICAgaW5wdXQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsSWQpLFxuICAgIGZldGNoOiAodGV4dCwgdXBkYXRlKSA9PiB7XG4gICAgICBnZW9jb2RlKHRleHQsIChlcnIsIGdlb0RhdGEpID0+IHtcbiAgICAgICAgaWYgKCFlcnIpIHtcbiAgICAgICAgICBjb25zdCBkID0gZ2VvRGF0YTtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgcmVzdWx0IGZyb20gZ2VvY29kaW5nICR7dGV4dH06IGAsIGQpO1xuICAgICAgICAgIC8vIGVuc3VyZSByZXN1bHQgbG9va3MgYXMgd2UgZXhwZWN0IGZyb20gdGhlIEFQSVxuICAgICAgICAgIGlmIChkLnR5cGUgPT09ICdGZWF0dXJlQ29sbGVjdGlvbicgJiYgZC5mZWF0dXJlcyAmJiBkLmZlYXR1cmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIC8vIG1hcCBkLmZlYXR1cmVzIGludG8gdXNlZnVsIGZvcm1hdC5cbiAgICAgICAgICAgIC8vIHJldHVybiB7bGFiZWw6Li4uLCBpdGVtOi4ufSBvYmogLSB0aGUgZm9ybWF0XG4gICAgICAgICAgICAvLyBzcGVjaWZpZWQgaGVyZTogaHR0cHM6Ly9naXRodWIuY29tL2tyYWFkZW4vYXV0b2NvbXBsZXRlXG4gICAgICAgICAgICBjb25zdCBmZWF0dXJlVG9TdWdnZXN0aW9uID0gZmVhdHVyZSA9PlxuICAgICAgICAgICAgICAoeyBsYWJlbDogZmVhdHVyZS5wbGFjZV9uYW1lLCBpdGVtOiBmZWF0dXJlIH0pO1xuICAgICAgICAgICAgY29uc3Qgc3VnZ2VzdGlvbnMgPSBkLmZlYXR1cmVzLm1hcChmZWF0dXJlVG9TdWdnZXN0aW9uKTtcbiAgICAgICAgICAgIHVwZGF0ZShzdWdnZXN0aW9ucyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBlcnJvciBnZW9jb2RpbmcgJHt0ZXh0fTogJHtlcnJ9YCk7IC8vZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuICAgIG9uU2VsZWN0OiAoaXRlbSkgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2coJ1NFTEVDVEVEIGl0ZW06JywgaXRlbSk7XG4gICAgICBpbnB1dC52YWx1ZSA9IGl0ZW0ucGxhY2VfbmFtZTtcbiAgICB9LFxuICB9KTtcbn1cblxuXG4vKipcbiAqIHJldHVybnMgYSBjaGFuZ2UgaGFuZGxlciB3aGljaCB1cGRhdGVzIGdsb2JhbCBzdGF0ZSBsb2NhdGlvblxuICogQHBhcmFtIHtTdHJpbmd9IGxvY2F0aW9uIC0gJ29yaWdpbicgb3IgJ2Rlc3RpbmF0aW9uJzsgcmVxdWlyZXMgc3RhdGVbZGVzdGluYXRpb25dIHRvIGV4aXN0LlxuICovXG5mdW5jdGlvbiBnZW9jb2RpbmdDaGFuZ2VIYW5kbGVyKGxvY2F0aW9uKSB7XG4gIHJldHVybiBmdW5jdGlvbiBjaGFuZ2VFdmVudEhhbmRsZXIoZXZlbnQpIHtcbiAgICBjb25zdCBhZGRyID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgIGlmIChhZGRyID09PSAnJykge1xuICAgICAgLy8gdXNlciBjbGVhcmVkIGlucHV0IC0gZXJhc2Uga25vd24gcG9pbnQgZm9yIGxvY2F0aW9uXG4gICAgICBzdGF0ZVtsb2NhdGlvbl0ubG9uZ2l0dWRlID0gbnVsbDtcbiAgICAgIHN0YXRlW2xvY2F0aW9uXS5sYXRpdHVkZSA9IG51bGw7XG4gICAgICBzdGF0ZVtsb2NhdGlvbl0uYWRkcmVzcyA9IG51bGw7XG4gICAgICBtYXBVcGRhdGVEaXJlY3Rpb25zRW5kcG9pbnQobG9jYXRpb24pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZygnZ2VvY29kaW5nIGFkZHJlc3M6ICcsIGFkZHIpO1xuICAgIGdlb2NvZGUoYWRkciwgKGVyciwgZ2VvRGF0YSkgPT4ge1xuICAgICAgaWYgKCFlcnIpIHtcbiAgICAgICAgY29uc3QgZCA9IGdlb0RhdGE7XG4gICAgICAgIGNvbnNvbGUubG9nKGByZXN1bHQgZnJvbSBnZW9jb2RpbmcgJHthZGRyfTogYCwgZCk7XG4gICAgICAgIGlmICggLy8gZW5zdXJlIHJlc3VsdCBsb29rcyBhcyB3ZSBleHBlY3QgZnJvbSB0aGUgQVBJXG4gICAgICAgICAgZC50eXBlID09PSAnRmVhdHVyZUNvbGxlY3Rpb24nICYmIGQuZmVhdHVyZXMgJiYgZC5mZWF0dXJlcy5sZW5ndGggPiAwXG4gICAgICAgICkge1xuICAgICAgICAgIGlmIChkLmZlYXR1cmVzWzBdLnBsYWNlX25hbWUpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGB1cGRhdGluZyBhZGRyZXNzIGZvciAke2xvY2F0aW9ufSBmcm9tXG4gICAgICAgICAgICAvLyAgICR7c3RhdGVbbG9jYXRpb25dLmFkZHJlc3N9IHRvXG4gICAgICAgICAgICAvLyAgICR7ZC5mZWF0dXJlc1swXS5wbGFjZV9uYW1lfWApO1xuICAgICAgICAgICAgc3RhdGVbbG9jYXRpb25dLmFkZHJlc3MgPSBkLmZlYXR1cmVzWzBdLnBsYWNlX25hbWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChkLmZlYXR1cmVzWzBdLmNlbnRlcikge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYHVwZGF0aW5nIGxvbiBmb3IgJHtsb2NhdGlvbn0gZnJvbVxuICAgICAgICAgICAgLy8gICAke3N0YXRlW2xvY2F0aW9uXS5sb25naXR1ZGV9LCR7c3RhdGVbbG9jYXRpb25dLmxhdGl0dWRlfSB0b1xuICAgICAgICAgICAgLy8gICAke2QuZmVhdHVyZXNbMF0uY2VudGVyfWApO1xuICAgICAgICAgICAgW3N0YXRlW2xvY2F0aW9uXS5sb25naXR1ZGUsIHN0YXRlW2xvY2F0aW9uXS5sYXRpdHVkZV0gPSBkLmZlYXR1cmVzWzBdLmNlbnRlcjtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdnZWNvZGVyIHJldHVybmVkIGNvb3JkczonLCBbc3RhdGVbbG9jYXRpb25dLmxvbmdpdHVkZSwgc3RhdGVbbG9jYXRpb25dLmxhdGl0dWRlXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdhcHAgc3RhdGU6Jywgc3RhdGUpO1xuICAgICAgICAgIG1hcFVwZGF0ZURpcmVjdGlvbnNFbmRwb2ludChsb2NhdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY2FsbGJhY2soZXJyLCBnZW9EYXRhLCBzdGF0ZS5kZXN0aW5hdGlvbkFkZHIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coYGVycm9yIGdlb2NvZGluZyAke2FkZHJ9OiAke2Vycn1gKTsgLy9lc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGUgaW5wdXQgaGFuZGxlciBmb3Igb25lIG9mIHRoZSBkaXJlY3Rpb24gaW5wdXRzXG4gKiBAcGFyYW0ge1N0cmluZ30gZWxJZCAtIElEIG9mIHRoZSBpbnB1dCBlbGVtZW50IHRvIGluaXRpYWxpemVcbiAqIEBwYXJhbSB7U3RyaW5nfSBsb2NhdGlvbiAtICdvcmlnaW4nIG9yICdkZXN0aW5hdGlvbidcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW5pdERpcmVjdGlvbklucHV0KGVsSWQsIGxvY2F0aW9uKSB7XG4gIC8vIHJ1biBnZW9jb2RlIG9uIGFkZHJlc3Mgd2hlbiBpbnB1dCBjaGFuZ2VzXG4gIGNvbnN0IGlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWxJZCk7XG4gIGlucHV0Lm9uY2hhbmdlID0gZ2VvY29kaW5nQ2hhbmdlSGFuZGxlcihsb2NhdGlvbik7XG5cbiAgLy8gZW5hYmxlIGF1dG9jb21wbGV0ZVxuICBpbml0QXV0b2NvbXBsZXRlKGVsSWQpO1xufVxuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvZGlyZWN0aW9uSW5wdXQuanMiLCIhZnVuY3Rpb24oZSl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kKWRlZmluZShlKTtlbHNlIGlmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGUmJnZvaWQgMCE9PW1vZHVsZS5leHBvcnRzKXt2YXIgdD1lKCk7T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksZXhwb3J0cy5hdXRvY29tcGxldGU9dCxleHBvcnRzLmRlZmF1bHQ9dH1lbHNlIHdpbmRvdy5hdXRvY29tcGxldGU9ZSgpfShmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIGUoZSl7ZnVuY3Rpb24gdCgpe3JldHVyblwibm9uZVwiIT09aC5kaXNwbGF5fWZ1bmN0aW9uIG4oKXt5KyssbT1bXSxwPXZvaWQgMCxoLmRpc3BsYXk9XCJub25lXCJ9ZnVuY3Rpb24gbygpe2Zvcig7di5maXJzdENoaWxkOyl2LnJlbW92ZUNoaWxkKHYuZmlyc3RDaGlsZCk7dmFyIHQ9ITEsbz1cIiM5PyRcIjttLmZvckVhY2goZnVuY3Rpb24oZSl7ZS5ncm91cCYmKHQ9ITApfSk7dmFyIGk9ZnVuY3Rpb24oZSl7dmFyIHQ9Yy5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO3JldHVybiB0LnRleHRDb250ZW50PWUubGFiZWwsdH07ZS5yZW5kZXImJihpPWUucmVuZGVyKTt2YXIgbD1mdW5jdGlvbihlKXt2YXIgdD1jLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7cmV0dXJuIHQudGV4dENvbnRlbnQ9ZSx0fTtpZihlLnJlbmRlckdyb3VwJiYobD1lLnJlbmRlckdyb3VwKSxtLmZvckVhY2goZnVuY3Rpb24odCl7aWYodC5ncm91cCYmdC5ncm91cCE9PW8pe289dC5ncm91cDt2YXIgcj1sKHQuZ3JvdXApO3ImJihyLmNsYXNzTmFtZSs9XCIgZ3JvdXBcIix2LmFwcGVuZENoaWxkKHIpKX12YXIgYT1pKHQpO2EmJihhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLGZ1bmN0aW9uKG8pe2Uub25TZWxlY3QodC5pdGVtLHUpLG4oKSxvLnByZXZlbnREZWZhdWx0KCksby5zdG9wUHJvcGFnYXRpb24oKX0pLHQ9PT1wJiYoYS5jbGFzc05hbWUrPVwiIHNlbGVjdGVkXCIpLHYuYXBwZW5kQ2hpbGQoYSkpfSksbS5sZW5ndGg8MSl7aWYoIWUuZW1wdHlNc2cpcmV0dXJuIHZvaWQgbigpO3ZhciBhPWMuY3JlYXRlRWxlbWVudChcImRpdlwiKTthLmNsYXNzTmFtZT1cImVtcHR5XCIsYS50ZXh0Q29udGVudD1lLmVtcHR5TXNnLHYuYXBwZW5kQ2hpbGQoYSl9dmFyIGY9dS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxkPWYudG9wK3Uub2Zmc2V0SGVpZ2h0K2MuYm9keS5zY3JvbGxUb3A7aC50b3A9ZCtcInB4XCIsaC5sZWZ0PWYubGVmdCtcInB4XCIsaC53aWR0aD11Lm9mZnNldFdpZHRoK1wicHhcIixoLm1heEhlaWdodD13aW5kb3cuaW5uZXJIZWlnaHQtKGYudG9wK3Uub2Zmc2V0SGVpZ2h0KStcInB4XCIsaC5oZWlnaHQ9XCJhdXRvXCIsaC5kaXNwbGF5PVwiYmxvY2tcIixyKCl9ZnVuY3Rpb24gaShpKXt2YXIgcj1pLndoaWNofHxpLmtleUNvZGV8fDAsbD0rK3k7MzghPT1yJiYxMyE9PXImJjI3IT09ciYmMzkhPT1yJiYzNyE9PXImJig0MD09PXImJnQoKXx8KHUudmFsdWUubGVuZ3RoPj1nP2UuZmV0Y2godS52YWx1ZSxmdW5jdGlvbihlKXt5PT09bCYmZSYmKG09ZSxwPW0ubGVuZ3RoPjA/bVswXTp2b2lkIDAsbygpKX0pOm4oKSkpfWZ1bmN0aW9uIHIoKXt2YXIgZT12LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJzZWxlY3RlZFwiKTtpZihlLmxlbmd0aD4wKXt2YXIgdD1lWzBdLG49dC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO2lmKG4mJi0xIT09bi5jbGFzc05hbWUuaW5kZXhPZihcImdyb3VwXCIpJiYhbi5wcmV2aW91c0VsZW1lbnRTaWJsaW5nJiYodD1uKSx0Lm9mZnNldFRvcDx2LnNjcm9sbFRvcCl2LnNjcm9sbFRvcD10Lm9mZnNldFRvcDtlbHNle3ZhciBvPXQub2Zmc2V0VG9wK3Qub2Zmc2V0SGVpZ2h0LGk9di5zY3JvbGxUb3Ardi5vZmZzZXRIZWlnaHQ7bz5pJiYodi5zY3JvbGxUb3ArPW8taSl9fX1mdW5jdGlvbiBsKCl7aWYobS5sZW5ndGg8MSlwPXZvaWQgMDtlbHNlIGlmKHA9PT1tWzBdKXA9bVttLmxlbmd0aC0xXTtlbHNlIGZvcih2YXIgZT1tLmxlbmd0aC0xO2U+MDtlLS0paWYocD09PW1bZV18fDE9PT1lKXtwPW1bZS0xXTticmVha319ZnVuY3Rpb24gYSgpe2lmKG0ubGVuZ3RoPDEmJihwPXZvaWQgMCksIXB8fHA9PT1tW20ubGVuZ3RoLTFdKXJldHVybiB2b2lkKHA9bVswXSk7Zm9yKHZhciBlPTA7ZTxtLmxlbmd0aC0xO2UrKylpZihwPT09bVtlXSl7cD1tW2UrMV07YnJlYWt9fWZ1bmN0aW9uIGYoaSl7dmFyIHI9aS53aGljaHx8aS5rZXlDb2RlfHwwO2lmKDM4PT09cnx8NDA9PT1yfHwyNz09PXIpe3ZhciBmPXQoKTtpZigyNz09PXIpbigpO2Vsc2V7aWYoIXR8fG0ubGVuZ3RoPDEpcmV0dXJuOzM4PT09cj9sKCk6YSgpLG8oKX1yZXR1cm4gaS5wcmV2ZW50RGVmYXVsdCgpLHZvaWQoZiYmaS5zdG9wUHJvcGFnYXRpb24oKSl9MTM9PT1yJiZwJiYoZS5vblNlbGVjdChwLml0ZW0sdSksbigpKX1mdW5jdGlvbiBkKCl7c2V0VGltZW91dChmdW5jdGlvbigpe2MuYWN0aXZlRWxlbWVudCE9PXUmJm4oKX0sMjAwKX1mdW5jdGlvbiBzKCl7dS5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLGYpLHUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsaSksdS5yZW1vdmVFdmVudExpc3RlbmVyKFwiYmx1clwiLGQpLHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsbyksbigpO3ZhciBlPXYucGFyZW50Tm9kZTtlJiZlLnJlbW92ZUNoaWxkKHYpfXZhciB1LHAsYz1kb2N1bWVudCx2PWMuY3JlYXRlRWxlbWVudChcImRpdlwiKSxoPXYuc3R5bGUsbT1bXSxnPWUubWluTGVuZ3RofHwyLHk9MDtpZighZS5pbnB1dCl0aHJvdyBuZXcgRXJyb3IoXCJpbnB1dCB1bmRlZmluZWRcIik7cmV0dXJuIHU9ZS5pbnB1dCxjLmJvZHkuYXBwZW5kQ2hpbGQodiksdi5jbGFzc05hbWU9XCJhdXRvY29tcGxldGUgXCIrKGUuY2xhc3NOYW1lfHxcIlwiKSxoLnBvc2l0aW9uPVwiYWJzb2x1dGVcIixoLmRpc3BsYXk9XCJub25lXCIsdS5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLGYpLHUuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsaSksdS5hZGRFdmVudExpc3RlbmVyKFwiYmx1clwiLGQpLHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsbykse2Rlc3Ryb3k6c319cmV0dXJuIGV9KTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9hdXRvY29tcGxldGVyL2F1dG9jb21wbGV0ZS5qc1xuLy8gbW9kdWxlIGlkID0gNDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==