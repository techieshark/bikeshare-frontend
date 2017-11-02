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

var _circle = __webpack_require__(23);

var _circle2 = _interopRequireDefault(_circle);

var _helpers = __webpack_require__(28);

var _within = __webpack_require__(29);

var _within2 = _interopRequireDefault(_within);

var _StationFeed = __webpack_require__(33);

var _StationFeed2 = _interopRequireDefault(_StationFeed);

var _popups = __webpack_require__(34);

var _popups2 = _interopRequireDefault(_popups);

var _userGeolocate = __webpack_require__(35);

var _userGeolocate2 = _interopRequireDefault(_userGeolocate);

var _router = __webpack_require__(38);

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
  // const geolocateControl = new mapboxgl.GeolocateControl({
  //   positionOptions: {
  //     enableHighAccuracy: true,
  //   },
  //   trackUserLocation: true,
  // });
  // map.addControl(geolocateControl);
  // geolocateControl.on('geolocate', userGeolocate);

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

var _mapboxGeocoding = __webpack_require__(36);

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

var	fixUrls = __webpack_require__(16);

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

__webpack_require__(17);

__webpack_require__(19);

var _directionsControls = __webpack_require__(20);

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
exports.push([module.i, "canvas.mapboxgl-canvas {\n  background: lightgray;\n}\n\n.marker {\n  background-image: url(" + __webpack_require__(10) + ");\n  background-size: cover;\n  width: 50px;\n  height: 50px;\n  border-radius: 50%;\n  cursor: pointer;\n}\n\n.map-marker-directions {\n  background-repeat: no-repeat;\n  background-position: center;\n  background-size: 12px;\n  width: 20px;\n}\n\n.map-marker-directions.is-origin {\n  background-image: url(" + __webpack_require__(11) + ");\n}\n.map-marker-directions.is-destination {\n  background-image: url(" + __webpack_require__(12) + ");\n}\n\n\n\n/********** Directions Input ****************************************/\n\n.directions {\n  position: absolute;\n  margin: 1em;\n  background: rgba(255, 255, 255, 0.85);\n}\n\n.directions--content {\n  padding: 1em;\n}\n\n.directions--toggle-button {\n  background: #4AB2F7;\n  background-repeat: no-repeat;\n  background-position: center;\n  background-size: 60px;\n  cursor: pointer;\n}\n\n.directions--toggle-button.shown {\n  background-image: url(" + __webpack_require__(13) + ");\n}\n.directions--toggle-button.hidden {\n  background-image: url(" + __webpack_require__(14) + ");\n}\n\n.directions--toggle-button {\n  height: 2em;\n}\n\n#directions--distance-range {\n  /* width: 157px; */\n  width: 100%;\n}\n\n.directions--distance-picker {\n  margin-bottom: 2em;\n  padding: 0.5em;\n}\n\n#directions--distance-range .noUi-connect {\n  background-color: rgb(222, 224, 224);\n  box-shadow: inset 0 0 1px rgba(51,51,51,.2);\n}\n\n.noUi-pips.noUi-pips-horizontal {\n  height: 50px; /* was 80 which ate into button below */\n}\n\n.directions--locate-origin.column {\n  padding-left: 0;\n}\n\n.directions--locate-origin button{\n  background-image: url(" + __webpack_require__(15) + ");\n  background-repeat: no-repeat;\n  background-position: center;\n  background-size: 20px;\n  width: 38px;\n}\n\n/* .directions--locate-origin button.is-light:hover {\n  border-color: black;\n} */\n\n\n@media screen and (max-width: 780px) {\n  .directions {\n    margin: 0;\n  }\n}\n\n\n/********** Directions Autocomplete **********************************/\n\n.autocomplete {\n  background: white;\n  z-index: 100;\n  border: 1px solid #e4e2e2;\n}\n\n.autocomplete div {\n  border-top: 1px solid #adadad;\n  padding: 1em;\n  cursor: pointer;\n}\n\n.autocomplete div:hover, .autocomplete div:focus {\n  background: rgb(202, 206, 227);\n}\n\n\n/********** Station Popup *******************************************/\n\n.station-popup--container .mapboxgl-popup-content {\n  padding-bottom: 6px;\n}\n\n.station-popup {\n  text-align: center;\n}\n\n.station-popup h3 {\n  margin-bottom: 1em;\n}\n\n/* div.station-popup--directions {\n} */\n\ndiv.station-popup--directions a{\n  text-decoration: none;\n}\n\n.station-popup--coordinates {\n  border-top: 1px solid lightgrey;\n  text-align: right;\n  padding-top: 0.5em;\n  margin-top: 0.5em;\n\n  font-size: smaller;\n  color: lightgrey;\n}\n\n.station-popup--bikes-number, .station-popup--docks-number {\n  font-size: large;\n}\n\n/* .station-popup--bikes-text, .station-popup--docks-text {\n} */\n\ndiv.station-popup--stats {\n  margin-bottom: 0 !important;\n  font-weight: bold;\n}\n\n.station-popup--alert {\n  font-weight: bold;\n  font-size: large;\n  margin-bottom: 1em;\n}\n", ""]);

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

module.exports = __webpack_require__.p + "9f8d8013b95b47ff16a0bef615829383.svg";

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "1f7c29950ae1d733f2cfd41702f409b9.svg";

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "99c6879b01fe7fb27fb26cf2afc7360d.svg";

/***/ }),
/* 16 */
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
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(18);
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
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(undefined);
// imports


// module
exports.push([module.i, "/*! nouislider - 10.0.0 - 2017-05-28 14:52:48 */.noUi-target,.noUi-target *{-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;-ms-touch-action:none;touch-action:none;-ms-user-select:none;-moz-user-select:none;user-select:none;-moz-box-sizing:border-box;box-sizing:border-box}.noUi-target{position:relative;direction:ltr}.noUi-base{width:100%;height:100%;position:relative;z-index:1}.noUi-connect{position:absolute;right:0;top:0;left:0;bottom:0}.noUi-origin{position:absolute;height:0;width:0}.noUi-handle{position:relative;z-index:1}.noUi-state-tap .noUi-connect,.noUi-state-tap .noUi-origin{-webkit-transition:top .3s,right .3s,bottom .3s,left .3s;transition:top .3s,right .3s,bottom .3s,left .3s}.noUi-state-drag *{cursor:inherit!important}.noUi-base,.noUi-handle{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}.noUi-horizontal{height:18px}.noUi-horizontal .noUi-handle{width:34px;height:28px;left:-17px;top:-6px}.noUi-vertical{width:18px}.noUi-vertical .noUi-handle{width:28px;height:34px;left:-6px;top:-17px}.noUi-target{background:#FAFAFA;border-radius:4px;border:1px solid #D3D3D3;box-shadow:inset 0 1px 1px #F0F0F0,0 3px 6px -5px #BBB}.noUi-connect{background:#3FB8AF;border-radius:4px;box-shadow:inset 0 0 3px rgba(51,51,51,.45);-webkit-transition:background 450ms;transition:background 450ms;}.noUi-draggable{cursor:ew-resize}.noUi-vertical .noUi-draggable{cursor:ns-resize}.noUi-handle{border:1px solid #D9D9D9;border-radius:3px;background:#FFF;cursor:default;box-shadow: inset 0 0 1px #FFF,inset 0 1px 7px #EBEBEB,0 3px 6px -3px #BBB;}.noUi-active{box-shadow:inset 0 0 1px #FFF,inset 0 1px 7px #DDD,0 3px 6px -3px #BBB}.noUi-handle:after,.noUi-handle:before{content:\"\";display:block;position:absolute;height:14px;width:1px;background:#E8E7E6;left:14px;top:6px}.noUi-handle:after{left:17px}.noUi-vertical .noUi-handle:after,.noUi-vertical .noUi-handle:before{width:14px;height:1px;left:6px;top:14px}.noUi-vertical .noUi-handle:after{top:17px}[disabled] .noUi-connect{background:#B8B8B8}[disabled] .noUi-handle,[disabled].noUi-handle,[disabled].noUi-target{cursor:not-allowed}.noUi-pips,.noUi-pips *{-moz-box-sizing:border-box;box-sizing:border-box}.noUi-pips{position:absolute;color:#999;}.noUi-value{position:absolute;white-space:nowrap;text-align:center}.noUi-value-sub{color:#ccc;font-size:10px}.noUi-marker{position:absolute;background:#CCC}.noUi-marker-large,.noUi-marker-sub{background:#AAA}.noUi-pips-horizontal{padding:10px 0;height:80px;top:100%;left:0;width:100%}.noUi-value-horizontal{-webkit-transform:translate3d(-50%,50%,0);transform:translate3d(-50%,50%,0)}.noUi-marker-horizontal.noUi-marker{margin-left:-1px;width:2px;height:5px}.noUi-marker-horizontal.noUi-marker-sub{height:10px}.noUi-marker-horizontal.noUi-marker-large{height:15px}.noUi-pips-vertical{padding:0 10px;height:100%;top:0;left:100%}.noUi-value-vertical{-webkit-transform:translate3d(0,50%,0);transform:translate3d(0,50%,0);padding-left:25px}.noUi-marker-vertical.noUi-marker{width:5px;height:2px;margin-top:-1px}.noUi-marker-vertical.noUi-marker-sub{width:10px}.noUi-marker-vertical.noUi-marker-large{width:15px}.noUi-tooltip{display:block;position:absolute;border:1px solid #D9D9D9;border-radius:3px;background:#fff;color:#000;padding:5px;text-align:center;white-space:nowrap}.noUi-horizontal .noUi-tooltip{-webkit-transform:translate(-50%,0);transform:translate(-50%,0);left:50%;bottom:120%}.noUi-vertical .noUi-tooltip{-webkit-transform:translate(0,-50%);transform:translate(0,-50%);top:50%;right:120%}", ""]);

// exports


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "favicon.ico";

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initDirectionsControls;

var _distanceSlider = __webpack_require__(21);

var _distanceSlider2 = _interopRequireDefault(_distanceSlider);

var _originLocatorButton = __webpack_require__(40);

var _originLocatorButton2 = _interopRequireDefault(_originLocatorButton);

var _directionInput = __webpack_require__(41);

var _directionInput2 = _interopRequireDefault(_directionInput);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initDirectionsToggle() {
  var toggle = document.getElementById('directions-toggle');
  var shown = true;
  toggle.onclick = function () {
    var content = document.getElementsByClassName('directions--content')[0];
    if (shown) {
      // first ensure the toggle button doesn't disappear
      toggle.style.width = content.offsetWidth + 'px';
      content.style.display = 'none';
    } else {
      toggle.style.width = '100%';
      content.style.display = 'block';
    }
    shown = !shown;
    toggle.classList.toggle('shown');
    toggle.classList.toggle('hidden');
  };
} /* Directions controls ********************** */

function initDirectionsControls() {
  (0, _distanceSlider2.default)();
  (0, _originLocatorButton2.default)();
  (0, _directionInput2.default)('originInput', 'origin');
  (0, _directionInput2.default)('destinationInput', 'destination');
  initDirectionsToggle();
}

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initDistanceSlider;

var _nouislider = __webpack_require__(22);

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
/* 22 */
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
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__turf_destination__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__turf_helpers__ = __webpack_require__(27);



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
/* 24 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__turf_invariant__ = __webpack_require__(25);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__turf_helpers__ = __webpack_require__(26);
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
/* 25 */
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
/* 26 */
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
/* 27 */
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
/* 28 */
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
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

var inside = __webpack_require__(30);
var featureCollection = __webpack_require__(32).featureCollection;

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
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

var invariant = __webpack_require__(31);
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
/* 31 */
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
/* 32 */
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
/* 33 */
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
/* 34 */
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
/* 35 */
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
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * @module mapbox-geocoding
 */
var request = __webpack_require__(37);

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
              (BBOX ? '&bbox=' + BBOX : '') + // minX,minY,maxX,maxY
              (CENTER ? '&' + CENTER[0] + ',' + CENTER[1] : '');

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
/* 37 */
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
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fetchRoute;

var _config = __webpack_require__(2);

var _config2 = _interopRequireDefault(_config);

var _polyline = __webpack_require__(39);

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
/* 39 */
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
/* 40 */
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
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = initDirectionInput;

var _autocompleter = __webpack_require__(42);

var _autocompleter2 = _interopRequireDefault(_autocompleter);

var _geocoder = __webpack_require__(3);

var _map = __webpack_require__(1);

var _state = __webpack_require__(0);

var _state2 = _interopRequireDefault(_state);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var lastAutocompleteSelection = null;

/**
 * Hooks an input up to an autocomplete service
 * @param {String} elId element id of the input which should be autocompleted
 */
function initAutocomplete(elId) {
  var input = document.getElementById(elId);

  (0, _autocompleter2.default)({
    input: document.getElementById(elId),
    fetch: function fetch(text, update) {
      console.log('on fetch for input');
      (0, _geocoder.geocode)(text, function (err, geoData) {
        if (!err) {
          var d = geoData;
          console.log('result from geocoding ' + text + ': ', d);
          // ensure result looks as we expect from the API
          if (d.type === 'FeatureCollection' && d.features && d.features.length > 0) {
            // map d.features into useful format.
            // return {label:..., item:..} obj - the format
            // specified here: https://github.com/kraaden/autocomplete
            var featureToSuggestion = function featureToSuggestion(feature) {
              return {
                label: feature.place_name,
                item: {
                  feature: feature,
                  // make text and label available to onSelect():
                  label: feature.place_name,
                  text: text
                }
              };
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
      lastAutocompleteSelection = item;
      console.log('SELECTED item:', item);
      input.value = item.feature.place_name;
    }
  });
}

/**
 * Update state from feature returned by geocoder.
 * @param {string} location origin or destination.
 * @param {GeoJSON Feature} feature A valid geojson feature.
 */
function updateLocationFromFeature(location, feature) {
  if (feature.place_name) {
    _state2.default[location].address = feature.place_name;
  }
  if (feature.center) {
    var _feature$center = _slicedToArray(feature.center, 2);

    _state2.default[location].longitude = _feature$center[0];
    _state2.default[location].latitude = _feature$center[1];
  }
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
        if (lastAutocompleteSelection) {
          console.log('we should not have run geocoder');
          // hold on - user selected an autocomplete suggestion,
          // we should use that instead of this result based on a partial text.
          updateLocationFromFeature(location, lastAutocompleteSelection.feature);
          // handled, can reset:
          lastAutocompleteSelection = null;
        } else {
          var d = geoData;
          console.log('result from geocoding ' + addr + ': ', d);
          // ensure result looks as we expect from the API
          if (d.type === 'FeatureCollection' && d.features && d.features.length > 0) {
            updateLocationFromFeature(location, d.features[0]);
          }
        }
        // console.log('app state:', state);
        (0, _map.mapUpdateDirectionsEndpoint)(location);
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
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;!function(e){if(true)!(__WEBPACK_AMD_DEFINE_FACTORY__ = (e),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));else if("undefined"!=typeof module&&void 0!==module.exports){var t=e();Object.defineProperty(exports,"__esModule",{value:!0}),exports.autocomplete=t,exports.default=t}else window.autocomplete=e()}(function(){"use strict";function e(e){function t(){return"none"!==h.display}function n(){y++,m=[],p=void 0,h.display="none"}function o(){for(;v.firstChild;)v.removeChild(v.firstChild);var t=!1,o="#9?$";m.forEach(function(e){e.group&&(t=!0)});var i=function(e){var t=c.createElement("div");return t.textContent=e.label,t};e.render&&(i=e.render);var l=function(e){var t=c.createElement("div");return t.textContent=e,t};if(e.renderGroup&&(l=e.renderGroup),m.forEach(function(t){if(t.group&&t.group!==o){o=t.group;var r=l(t.group);r&&(r.className+=" group",v.appendChild(r))}var a=i(t);a&&(a.addEventListener("click",function(o){e.onSelect(t.item,u),n(),o.preventDefault(),o.stopPropagation()}),t===p&&(a.className+=" selected"),v.appendChild(a))}),m.length<1){if(!e.emptyMsg)return void n();var a=c.createElement("div");a.className="empty",a.textContent=e.emptyMsg,v.appendChild(a)}var f=u.getBoundingClientRect(),d=f.top+u.offsetHeight+c.body.scrollTop;h.top=d+"px",h.left=f.left+"px",h.width=u.offsetWidth+"px",h.maxHeight=window.innerHeight-(f.top+u.offsetHeight)+"px",h.height="auto",h.display="block",r()}function i(i){var r=i.which||i.keyCode||0,l=++y;38!==r&&13!==r&&27!==r&&39!==r&&37!==r&&(40===r&&t()||(u.value.length>=g?e.fetch(u.value,function(e){y===l&&e&&(m=e,p=m.length>0?m[0]:void 0,o())}):n()))}function r(){var e=v.getElementsByClassName("selected");if(e.length>0){var t=e[0],n=t.previousElementSibling;if(n&&-1!==n.className.indexOf("group")&&!n.previousElementSibling&&(t=n),t.offsetTop<v.scrollTop)v.scrollTop=t.offsetTop;else{var o=t.offsetTop+t.offsetHeight,i=v.scrollTop+v.offsetHeight;o>i&&(v.scrollTop+=o-i)}}}function l(){if(m.length<1)p=void 0;else if(p===m[0])p=m[m.length-1];else for(var e=m.length-1;e>0;e--)if(p===m[e]||1===e){p=m[e-1];break}}function a(){if(m.length<1&&(p=void 0),!p||p===m[m.length-1])return void(p=m[0]);for(var e=0;e<m.length-1;e++)if(p===m[e]){p=m[e+1];break}}function f(i){var r=i.which||i.keyCode||0;if(38===r||40===r||27===r){var f=t();if(27===r)n();else{if(!t||m.length<1)return;38===r?l():a(),o()}return i.preventDefault(),void(f&&i.stopPropagation())}13===r&&p&&(e.onSelect(p.item,u),n())}function d(){setTimeout(function(){c.activeElement!==u&&n()},200)}function s(){u.removeEventListener("keydown",f),u.removeEventListener("keyup",i),u.removeEventListener("blur",d),window.removeEventListener("resize",o),n();var e=v.parentNode;e&&e.removeChild(v)}var u,p,c=document,v=c.createElement("div"),h=v.style,m=[],g=e.minLength||2,y=0;if(!e.input)throw new Error("input undefined");return u=e.input,c.body.appendChild(v),v.className="autocomplete "+(e.className||""),h.position="absolute",h.display="none",u.addEventListener("keydown",f),u.addEventListener("keyup",i),u.addEventListener("blur",d),window.addEventListener("resize",o),{destroy:s}}return e});

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYzk1ZjkxMzNlMGVkM2ZiMzlhODAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3N0YXRlLmpzIiwid2VicGFjazovLy8uL3NyYy9tYXAuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbmZpZy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZ2VvY29kZXIuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL2FkZFN0eWxlcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXNlclJldmVyc2VHZW9jb2RlLmpzIiwid2VicGFjazovLy8uL3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvc3R5bGUuY3NzP2JkODQiLCJ3ZWJwYWNrOi8vLy4vc3JjL3N0eWxlLmNzcyIsIndlYnBhY2s6Ly8vLi9zcmMvbm91bl84MDA2MDAucG5nIiwid2VicGFjazovLy8uL3NyYy9tYXAtZG90LW9yaWdpbi5zdmciLCJ3ZWJwYWNrOi8vLy4vc3JjL21hcC1kb3QtZGVzdGluYXRpb24uc3ZnIiwid2VicGFjazovLy8uL3NyYy9kaXJlY3Rpb25zLXVwLnN2ZyIsIndlYnBhY2s6Ly8vLi9zcmMvZGlyZWN0aW9ucy1kb3duLnN2ZyIsIndlYnBhY2s6Ly8vLi9zcmMvbG9jYXRlLXBlcnNvbi5zdmciLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9saWIvdXJscy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdmVuZG9yL25vdWlzbGlkZXIubWluLmNzcz82MWMwIiwid2VicGFjazovLy8uL3NyYy92ZW5kb3Ivbm91aXNsaWRlci5taW4uY3NzIiwid2VicGFjazovLy8uL3NyYy9mYXZpY29uLmljbyIsIndlYnBhY2s6Ly8vLi9zcmMvZGlyZWN0aW9uc0NvbnRyb2xzLmpzIiwid2VicGFjazovLy8uL3NyYy9kaXN0YW5jZVNsaWRlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdmVuZG9yL25vdWlzbGlkZXIuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0B0dXJmL2NpcmNsZS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQHR1cmYvZGVzdGluYXRpb24vaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0B0dXJmL2ludmFyaWFudC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQHR1cmYvZGVzdGluYXRpb24vbm9kZV9tb2R1bGVzL0B0dXJmL2hlbHBlcnMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0B0dXJmL2NpcmNsZS9ub2RlX21vZHVsZXMvQHR1cmYvaGVscGVycy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQHR1cmYvaGVscGVycy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQHR1cmYvd2l0aGluL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AdHVyZi9pbnNpZGUvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0B0dXJmL2luc2lkZS9ub2RlX21vZHVsZXMvQHR1cmYvaW52YXJpYW50L2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AdHVyZi93aXRoaW4vbm9kZV9tb2R1bGVzL0B0dXJmL2hlbHBlcnMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL1N0YXRpb25GZWVkLmpzIiwid2VicGFjazovLy8uL3NyYy9wb3B1cHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3VzZXJHZW9sb2NhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL21hcGJveC1nZW9jb2RpbmcvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVxdWVzdC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcm91dGVyLmpzIiwid2VicGFjazovLy8uL3NyYy92ZW5kb3IvcG9seWxpbmUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL29yaWdpbkxvY2F0b3JCdXR0b24uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2RpcmVjdGlvbklucHV0LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9hdXRvY29tcGxldGVyL2F1dG9jb21wbGV0ZS5qcyJdLCJuYW1lcyI6WyJtYXhXYWxrRGlzdGFuY2UiLCJ1c2VyIiwibG9uZ2l0dWRlIiwibGF0aXR1ZGUiLCJhZGRyZXNzIiwib3JpZ2luIiwiZGVzdGluYXRpb24iLCJpbml0TWFwIiwiZmx5VG8iLCJyZW5kZXJEaXJlY3Rpb25zTWFya2VyIiwibWFwVXBkYXRlTmVhcmJ5IiwibWFwVXBkYXRlRGlyZWN0aW9uc0VuZHBvaW50Iiwic3RhdGlvbnNVUkwiLCJzdGF0aW9uc1VybCIsIm1hcCIsImFkZFN0YXRpb25zIiwib24iLCJ3aW5kb3ciLCJzZXRJbnRlcnZhbCIsImdldFNvdXJjZSIsInNldERhdGEiLCJnZXRTdGF0aW9ucyIsImNvbnNvbGUiLCJsb2ciLCJhZGRTb3VyY2UiLCJ0eXBlIiwiZGF0YSIsImFkZExheWVyIiwiaWQiLCJzb3VyY2UiLCJwYWludCIsImdldENhbnZhcyIsInN0eWxlIiwiY3Vyc29yIiwiYWRkUG9wdXBzIiwiZSIsImZlYXR1cmVzIiwicXVlcnlSZW5kZXJlZEZlYXR1cmVzIiwicG9pbnQiLCJsYXllcnMiLCJsZW5ndGgiLCJmZWF0dXJlIiwicG9wdXAiLCJtYXBib3hnbCIsIlBvcHVwIiwib2Zmc2V0Iiwic2V0TG5nTGF0IiwiZ2VvbWV0cnkiLCJjb29yZGluYXRlcyIsInNldEhUTUwiLCJhZGRUbyIsIl9jb250YWluZXIiLCJjbGFzc0xpc3QiLCJhZGQiLCJhZGRFbXB0eVN0YXRpb25zTmVhcmJ5U291cmNlcyIsImVtcHR5RmVhdHVyZVNldCIsIm1heHpvb20iLCJjZW50ZXIiLCJ6b29tIiwiTWFwIiwiY29udGFpbmVyIiwibWFwU3R5bGUiLCJsb2NhdGlvbiIsImVuZHBvaW50TWFya2VycyIsImVsIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiY2xhc3NOYW1lIiwiTWFya2VyIiwiZ2V0U3RhdGlvbnNOZWFyIiwic3RhdGlvbnMiLCJnZXRTdGF0aW9uc0FycmF5Iiwic2VhcmNoV2l0aGluRmVhdHVyZXMiLCJ1bml0cyIsInN0YXRpb25Db2xsZWN0aW9uIiwibmVhcmJ5U3RhdGlvbnMiLCJnZXRMYXllcklkRm9yU3RhdGlvbnNOZWFyIiwic2hvd1N0YXRpb25zTmVhciIsImxheWVyQW5kU291cmNlSWQiLCJhdmFpbGFibGVDcml0ZXJhIiwibGF5ZXIiLCJnZXRMYXllciIsInByb3BlcnR5Iiwic3RvcHMiLCJjbGVhclN0YXRpb25zTmVhciIsImxheWVySUQiLCJyZW1vdmVMYXllciIsImZvckVhY2giLCJtYXBDbGVhclJvdXRlIiwicm91dGVMYXllciIsIm1hcFVwZGF0ZVJvdXRlIiwicm91dGVMaW5lU3RyaW5nIiwibGF5ZXJBYm92ZSIsImxheW91dCIsInJlbW92ZSIsIm1hcHplbktleSIsIm1hcGJveFRva2VuIiwicmV2ZXJzZUdlb2NvZGUiLCJnZW9jb2RlIiwic2V0R2VvY2RlckNlbnRlciIsInNldEdlb2NvZGVyQm91bmRzIiwic2V0QWNjZXNzVG9rZW4iLCJsYXQiLCJsbmciLCJjYWxsYmFjayIsImVyciIsImdlb0RhdGEiLCJzZXRTZWFyY2hDZW50ZXIiLCJiYm94Iiwic2V0U2VhcmNoQm91bmRzIiwidXNlclJldmVyc2VHZW9jb2RlIiwiZCIsInBsYWNlX25hbWUiLCJhcHBTdGF0ZSIsImluaXRQYWdlIiwibG5nTGF0IiwiZG9Jbml0IiwicmVhZHlTdGF0ZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJpbml0IiwibG9uIiwiTnVtYmVyIiwicHJvdG90eXBlIiwiYmV0d2VlbiIsIm1pbiIsIm1heCIsImdlb0xvY2F0aW9uUHJvdmlkZXJVUkwiLCJmZXRjaCIsInRoZW4iLCJyZXNwIiwianNvbiIsImNhdGNoIiwiZXJyb3IiLCJpbml0RGlyZWN0aW9uc0NvbnRyb2xzIiwiaW5pdERpcmVjdGlvbnNUb2dnbGUiLCJ0b2dnbGUiLCJnZXRFbGVtZW50QnlJZCIsInNob3duIiwib25jbGljayIsImNvbnRlbnQiLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwid2lkdGgiLCJvZmZzZXRXaWR0aCIsImRpc3BsYXkiLCJpbml0RGlzdGFuY2VTbGlkZXIiLCJyYW5nZSIsInNsaWRlciIsImRpc3RGb3JtYXR0ZXIiLCJ0byIsIm4iLCJpc0ludGVnZXIiLCJ0b0ZpeGVkIiwiY3JlYXRlIiwic3RhcnQiLCJzdGVwIiwiY29ubmVjdCIsInBpcHMiLCJtb2RlIiwidmFsdWVzIiwiZGVuc2l0eSIsImZvcm1hdCIsIm5vVWlTbGlkZXIiLCJoYW5kbGUiLCJ2YWx1ZSIsImlubmVyVGV4dCIsInBhcnNlRmxvYXQiLCJmYWN0b3J5IiwiZGVmaW5lIiwiZXhwb3J0cyIsIm1vZHVsZSIsIlZFUlNJT04iLCJpc1ZhbGlkRm9ybWF0dGVyIiwiZW50cnkiLCJmcm9tIiwicmVtb3ZlRWxlbWVudCIsInBhcmVudEVsZW1lbnQiLCJyZW1vdmVDaGlsZCIsInByZXZlbnREZWZhdWx0IiwidW5pcXVlIiwiYXJyYXkiLCJmaWx0ZXIiLCJhIiwiY2xvc2VzdCIsIk1hdGgiLCJyb3VuZCIsImVsZW0iLCJvcmllbnRhdGlvbiIsInJlY3QiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJkb2MiLCJvd25lckRvY3VtZW50IiwiZG9jRWxlbSIsImRvY3VtZW50RWxlbWVudCIsInBhZ2VPZmZzZXQiLCJnZXRQYWdlT2Zmc2V0IiwidGVzdCIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsIngiLCJ0b3AiLCJ5IiwiY2xpZW50VG9wIiwibGVmdCIsImNsaWVudExlZnQiLCJpc051bWVyaWMiLCJpc05hTiIsImlzRmluaXRlIiwiYWRkQ2xhc3NGb3IiLCJlbGVtZW50IiwiZHVyYXRpb24iLCJhZGRDbGFzcyIsInNldFRpbWVvdXQiLCJyZW1vdmVDbGFzcyIsImxpbWl0IiwiYXNBcnJheSIsIkFycmF5IiwiaXNBcnJheSIsImNvdW50RGVjaW1hbHMiLCJudW1TdHIiLCJTdHJpbmciLCJwaWVjZXMiLCJzcGxpdCIsInJlcGxhY2UiLCJSZWdFeHAiLCJqb2luIiwiaGFzQ2xhc3MiLCJjb250YWlucyIsInN1cHBvcnRQYWdlT2Zmc2V0IiwicGFnZVhPZmZzZXQiLCJ1bmRlZmluZWQiLCJpc0NTUzFDb21wYXQiLCJjb21wYXRNb2RlIiwic2Nyb2xsTGVmdCIsImJvZHkiLCJwYWdlWU9mZnNldCIsInNjcm9sbFRvcCIsImdldEFjdGlvbnMiLCJwb2ludGVyRW5hYmxlZCIsIm1vdmUiLCJlbmQiLCJtc1BvaW50ZXJFbmFibGVkIiwiZ2V0U3VwcG9ydHNQYXNzaXZlIiwic3VwcG9ydHNQYXNzaXZlIiwib3B0cyIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwiZ2V0IiwiZ2V0U3VwcG9ydHNUb3VjaEFjdGlvbk5vbmUiLCJDU1MiLCJzdXBwb3J0cyIsInN1YlJhbmdlUmF0aW8iLCJwYSIsInBiIiwiZnJvbVBlcmNlbnRhZ2UiLCJ0b1BlcmNlbnRhZ2UiLCJhYnMiLCJpc1BlcmNlbnRhZ2UiLCJnZXRKIiwiYXJyIiwiaiIsInRvU3RlcHBpbmciLCJ4VmFsIiwieFBjdCIsInNsaWNlIiwidmEiLCJ2YiIsImZyb21TdGVwcGluZyIsImdldFN0ZXAiLCJ4U3RlcHMiLCJzbmFwIiwiYiIsImhhbmRsZUVudHJ5UG9pbnQiLCJpbmRleCIsInRoYXQiLCJwZXJjZW50YWdlIiwidG9TdHJpbmciLCJjYWxsIiwiRXJyb3IiLCJwdXNoIiwieEhpZ2hlc3RDb21wbGV0ZVN0ZXAiLCJoYW5kbGVTdGVwUG9pbnQiLCJpIiwidG90YWxTdGVwcyIsInhOdW1TdGVwcyIsImhpZ2hlc3RTdGVwIiwiY2VpbCIsIlNwZWN0cnVtIiwic2luZ2xlU3RlcCIsIm9yZGVyZWQiLCJoYXNPd25Qcm9wZXJ0eSIsInNvcnQiLCJnZXRNYXJnaW4iLCJnZXROZWFyYnlTdGVwcyIsInN0ZXBCZWZvcmUiLCJzdGFydFZhbHVlIiwidGhpc1N0ZXAiLCJzdGVwQWZ0ZXIiLCJjb3VudFN0ZXBEZWNpbWFscyIsInN0ZXBEZWNpbWFscyIsImFwcGx5IiwiY29udmVydCIsImRlZmF1bHRGb3JtYXR0ZXIiLCJ2YWxpZGF0ZUZvcm1hdCIsInRlc3RTdGVwIiwicGFyc2VkIiwidGVzdFJhbmdlIiwic3BlY3RydW0iLCJ0ZXN0U3RhcnQiLCJoYW5kbGVzIiwidGVzdFNuYXAiLCJ0ZXN0QW5pbWF0ZSIsImFuaW1hdGUiLCJ0ZXN0QW5pbWF0aW9uRHVyYXRpb24iLCJhbmltYXRpb25EdXJhdGlvbiIsInRlc3RDb25uZWN0IiwidGVzdE9yaWVudGF0aW9uIiwib3J0IiwidGVzdE1hcmdpbiIsIm1hcmdpbiIsInRlc3RMaW1pdCIsInRlc3RQYWRkaW5nIiwicGFkZGluZyIsInRlc3REaXJlY3Rpb24iLCJkaXIiLCJ0ZXN0QmVoYXZpb3VyIiwidGFwIiwiaW5kZXhPZiIsImRyYWciLCJmaXhlZCIsImhvdmVyIiwiZXZlbnRzIiwidGVzdFRvb2x0aXBzIiwidG9vbHRpcHMiLCJmb3JtYXR0ZXIiLCJ0ZXN0QXJpYUZvcm1hdCIsImFyaWFGb3JtYXQiLCJ0ZXN0Rm9ybWF0IiwidGVzdENzc1ByZWZpeCIsImNzc1ByZWZpeCIsInRlc3RDc3NDbGFzc2VzIiwiY3NzQ2xhc3NlcyIsImtleSIsInRlc3RVc2VSYWYiLCJ1c2VSZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJ0ZXN0T3B0aW9ucyIsIm9wdGlvbnMiLCJ0ZXN0cyIsInIiLCJ0IiwiZGVmYXVsdHMiLCJ0YXJnZXQiLCJiYXNlIiwiaGFuZGxlTG93ZXIiLCJoYW5kbGVVcHBlciIsImhvcml6b250YWwiLCJ2ZXJ0aWNhbCIsImJhY2tncm91bmQiLCJsdHIiLCJydGwiLCJkcmFnZ2FibGUiLCJhY3RpdmUiLCJ0b29sdGlwIiwicGlwc0hvcml6b250YWwiLCJwaXBzVmVydGljYWwiLCJtYXJrZXIiLCJtYXJrZXJIb3Jpem9udGFsIiwibWFya2VyVmVydGljYWwiLCJtYXJrZXJOb3JtYWwiLCJtYXJrZXJMYXJnZSIsIm1hcmtlclN1YiIsInZhbHVlSG9yaXpvbnRhbCIsInZhbHVlVmVydGljYWwiLCJ2YWx1ZU5vcm1hbCIsInZhbHVlTGFyZ2UiLCJ2YWx1ZVN1YiIsImtleXMiLCJuYW1lIiwic3R5bGVzIiwic3R5bGVPcG9zaXRlIiwiY2xvc3VyZSIsIm9yaWdpbmFsT3B0aW9ucyIsImFjdGlvbnMiLCJzdXBwb3J0c1RvdWNoQWN0aW9uTm9uZSIsInNjb3BlX1RhcmdldCIsInNjb3BlX0xvY2F0aW9ucyIsInNjb3BlX0Jhc2UiLCJzY29wZV9IYW5kbGVzIiwic2NvcGVfSGFuZGxlTnVtYmVycyIsInNjb3BlX0FjdGl2ZUhhbmRsZSIsInNjb3BlX0Nvbm5lY3RzIiwic2NvcGVfU3BlY3RydW0iLCJzY29wZV9WYWx1ZXMiLCJzY29wZV9FdmVudHMiLCJzY29wZV9TZWxmIiwic2NvcGVfUGlwcyIsInNjb3BlX0xpc3RlbmVycyIsInNjb3BlX0RvY3VtZW50Iiwic2NvcGVfRG9jdW1lbnRFbGVtZW50Iiwic2NvcGVfQm9keSIsImFkZE5vZGVUbyIsImRpdiIsImFwcGVuZENoaWxkIiwiYWRkT3JpZ2luIiwiaGFuZGxlTnVtYmVyIiwic2V0QXR0cmlidXRlIiwiYWRkQ29ubmVjdCIsImFkZEVsZW1lbnRzIiwiY29ubmVjdE9wdGlvbnMiLCJhZGRTbGlkZXIiLCJhZGRUb29sdGlwIiwiZmlyc3RDaGlsZCIsInRpcHMiLCJiaW5kRXZlbnQiLCJ1bmVuY29kZWQiLCJmb3JtYXR0ZWRWYWx1ZSIsImlubmVySFRNTCIsImFyaWEiLCJwb3NpdGlvbnMiLCJjaGVja0hhbmRsZVBvc2l0aW9uIiwibm93IiwidGV4dCIsImNoaWxkcmVuIiwiZ2V0R3JvdXAiLCJzdGVwcGVkIiwic3ByZWFkIiwidiIsImdlbmVyYXRlU3ByZWFkIiwiZ3JvdXAiLCJzYWZlSW5jcmVtZW50IiwiaW5jcmVtZW50IiwiaW5kZXhlcyIsImZpcnN0SW5SYW5nZSIsImxhc3RJblJhbmdlIiwiaWdub3JlRmlyc3QiLCJpZ25vcmVMYXN0IiwicHJldlBjdCIsInVuc2hpZnQiLCJjdXJyZW50IiwicSIsImxvdyIsImhpZ2giLCJuZXdQY3QiLCJwY3REaWZmZXJlbmNlIiwicGN0UG9zIiwic3RlcHMiLCJyZWFsU3RlcHMiLCJzdGVwc2l6ZSIsImFkZE1hcmtpbmciLCJmaWx0ZXJGdW5jIiwidmFsdWVTaXplQ2xhc3NlcyIsIm1hcmtlclNpemVDbGFzc2VzIiwidmFsdWVPcmllbnRhdGlvbkNsYXNzZXMiLCJtYXJrZXJPcmllbnRhdGlvbkNsYXNzZXMiLCJnZXRDbGFzc2VzIiwib3JpZW50YXRpb25DbGFzc2VzIiwic2l6ZUNsYXNzZXMiLCJhZGRTcHJlYWQiLCJub2RlIiwicmVtb3ZlUGlwcyIsImdyaWQiLCJiYXNlU2l6ZSIsImFsdCIsImhlaWdodCIsImF0dGFjaEV2ZW50IiwibWV0aG9kIiwiaGFzQXR0cmlidXRlIiwiZml4RXZlbnQiLCJidXR0b25zIiwiY2FsY1BvaW50IiwicG9pbnRzIiwibWV0aG9kcyIsImV2ZW50TmFtZSIsInBhc3NpdmUiLCJ0b3VjaCIsIm1vdXNlIiwicG9pbnRlciIsInRvdWNoZXMiLCJjaGFuZ2VkVG91Y2hlcyIsInBhZ2VYIiwicGFnZVkiLCJjbGllbnRYIiwiY2xpZW50WSIsImNhbGNQb2ludFRvUGVyY2VudGFnZSIsInByb3Bvc2FsIiwiZ2V0Q2xvc2VzdEhhbmRsZSIsInBvcyIsIm1vdmVIYW5kbGVzIiwidXB3YXJkIiwibG9jYXRpb25zIiwiaGFuZGxlTnVtYmVycyIsInByb3Bvc2FscyIsImYiLCJyZXZlcnNlIiwibyIsInN0YXRlIiwic2V0SGFuZGxlIiwiZmlyZUV2ZW50IiwidGFyZ2V0RXZlbnQiLCJldmVudFR5cGUiLCJkb2N1bWVudExlYXZlIiwiZXZlbnQiLCJub2RlTmFtZSIsInJlbGF0ZWRUYXJnZXQiLCJldmVudEVuZCIsImV2ZW50TW92ZSIsImFwcFZlcnNpb24iLCJidXR0b25zUHJvcGVydHkiLCJtb3ZlbWVudCIsInN0YXJ0Q2FsY1BvaW50IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImMiLCJzZXRaaW5kZXgiLCJldmVudFN0YXJ0Iiwic3RvcFByb3BhZ2F0aW9uIiwibW92ZUV2ZW50IiwiZW5kRXZlbnQiLCJvdXRFdmVudCIsImNvbmNhdCIsImdldENvbXB1dGVkU3R5bGUiLCJldmVudFRhcCIsImV2ZW50SG92ZXIiLCJiaW5kU2xpZGVyRXZlbnRzIiwiYmVoYXZpb3VyIiwiaGFuZGxlQmVmb3JlIiwiaGFuZGxlQWZ0ZXIiLCJldmVudEhvbGRlcnMiLCJldmVudEhvbGRlciIsInJlZmVyZW5jZSIsImxvb2tCYWNrd2FyZCIsImxvb2tGb3J3YXJkIiwiZ2V0VmFsdWUiLCJ0b1BjdCIsInBjdCIsInVwZGF0ZUhhbmRsZVBvc2l0aW9uIiwic3RhdGVVcGRhdGUiLCJ1cGRhdGVDb25uZWN0IiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwiekluZGV4IiwiY2hpbGROb2RlcyIsImwiLCJoIiwic2V0VmFsdWUiLCJ2YWx1ZVNldCIsImlucHV0IiwiZmlyZVNldEV2ZW50IiwiaXNJbml0IiwidmFsdWVSZXNldCIsInZhbHVlR2V0IiwiZGVzdHJveSIsImdldEN1cnJlbnRTdGVwIiwibmVhcmJ5U3RlcHMiLCJkZWNyZW1lbnQiLCJuYW1lc3BhY2VkRXZlbnQiLCJyZW1vdmVFdmVudCIsIm5hbWVzcGFjZSIsInN1YnN0cmluZyIsImJpbmQiLCJ0RXZlbnQiLCJ0TmFtZXNwYWNlIiwidXBkYXRlT3B0aW9ucyIsIm9wdGlvbnNUb1VwZGF0ZSIsInVwZGF0ZUFibGUiLCJuZXdPcHRpb25zIiwib2ZmIiwic2V0IiwicmVzZXQiLCJfX21vdmVIYW5kbGVzIiwiaW5pdGlhbGl6ZSIsImFwaSIsInZlcnNpb24iLCJTdGF0aW9uRmVlZCIsImRvRmV0Y2giLCJmZWVkIiwiZ2V0UG9wdXBDb250ZW50IiwiZ2V0RGlyZWN0aW9uc0xpbmsiLCJ0b0FkZHIiLCJmcm9tQWRkciIsInRvTGF0IiwidG9MbmciLCJiYXNlVVJMIiwiY29vcmRzIiwic3RhdGlvbiIsInByb3BlcnRpZXMiLCJhZGRyIiwic3RBZGRyZXNzMSIsImJpa2VzIiwiYXZhaWxhYmxlQmlrZXMiLCJkb2NrcyIsImF2YWlsYWJsZURvY2tzIiwic3RhdHVzIiwic3RhdHVzVmFsdWUiLCJkaXJlY3Rpb25zVVJMIiwiYWxlcnRNc2ciLCJ1c2VyR2VvbG9jYXRlIiwicG9zaXRpb24iLCJmZXRjaFJvdXRlIiwibGF0TG5nUGFpclRvR2VvSnNvblBvaW50IiwicGFpciIsImJhc2VVcmwiLCJyb3V0ZUNvbmZpZyIsInN0cmVldCIsImNvc3RpbmciLCJjb3N0aW5nX29wdGlvbnMiLCJiaWN5Y2xlIiwiYmljeWNsZV90eXBlIiwidXNlX3JvYWRzIiwidXNlX2hpbGxzIiwiZGlyZWN0aW9uc19vcHRpb25zIiwicm91dGVQcm92aWRlclVSTCIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0cmlwIiwibGVncyIsIm11bHRpTGluZUNvb3JkcyIsImxlZyIsImRlY29kZSIsInNoYXBlIiwibXVsdGlMaW5lU3RyaW5nIiwicG9seWxpbmUiLCJzdHIiLCJwcmVjaXNpb24iLCJzaGlmdCIsInJlc3VsdCIsImJ5dGUiLCJsYXRpdHVkZV9jaGFuZ2UiLCJsb25naXR1ZGVfY2hhbmdlIiwiZmFjdG9yIiwicG93IiwiY2hhckNvZGVBdCIsImluaXRPcmlnaW5Mb2NhdG9yQnRuIiwiYnRuIiwib25PcmlnaW5Mb2NhdG9yQnRuSGFuZGxlciIsIm9yaWciLCJnZW9sb2NhdGlvbiIsImdldEN1cnJlbnRQb3NpdGlvbiIsImluaXREaXJlY3Rpb25JbnB1dCIsImxhc3RBdXRvY29tcGxldGVTZWxlY3Rpb24iLCJpbml0QXV0b2NvbXBsZXRlIiwiZWxJZCIsInVwZGF0ZSIsImZlYXR1cmVUb1N1Z2dlc3Rpb24iLCJsYWJlbCIsIml0ZW0iLCJzdWdnZXN0aW9ucyIsIm9uU2VsZWN0IiwidXBkYXRlTG9jYXRpb25Gcm9tRmVhdHVyZSIsImdlb2NvZGluZ0NoYW5nZUhhbmRsZXIiLCJjaGFuZ2VFdmVudEhhbmRsZXIiLCJvbmNoYW5nZSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtB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O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztBQUNsQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztBQUNsQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztB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O0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxnREFBZ0QsWUFBWTtBQUM1RDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHVDQUF1QyxZQUFZOztBQUVuRDtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCLGtCQUFrQjtBQUNsQjs7QUFFQTtBQUNBOztBQUVBLENBQUM7O0FBRUQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZUFBZTs7QUFFZjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsWUFBWSxtQkFBbUI7QUFDL0I7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7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QWpCOztBQUVBO0FBQ0ErakIsbUJBQWlCQyxJQUFqQjtBQUNELEM7Ozs7OztBQzNIRCwrRUFBYTtBQUFBO0FBQUE7QUFBQTtBQUFBLHFHQUFtRCw2REFBNkQsVUFBVSw0Q0FBNEMsU0FBUywyQ0FBMkMsNkJBQTZCLFlBQVksYUFBYSxjQUFjLGFBQWEseUJBQXlCLGFBQWEsbUNBQW1DLGFBQWEsS0FBSyxhQUFhLDZCQUE2QixrQkFBa0Isc0JBQXNCLGdCQUFnQixFQUFFLGtCQUFrQiw2QkFBNkIsZ0NBQWdDLHVCQUF1QixrQkFBa0IsNkJBQTZCLDBCQUEwQiwwREFBMEQseUJBQXlCLFVBQVUsaUJBQWlCLDRDQUE0QyxXQUFXLDJDQUEyQyxnRUFBZ0Usc0RBQXNELGNBQWMsK0JBQStCLDZCQUE2Qiw4REFBOEQsd0VBQXdFLDRKQUE0SixjQUFjLGtDQUFrQyxxR0FBcUcsNkNBQTZDLFFBQVEsYUFBYSwyQ0FBMkMsZUFBZSxzQ0FBc0MsMEhBQTBILEtBQUssOERBQThELDBCQUEwQixhQUFhLHVCQUF1QixpQ0FBaUMsMEJBQTBCLElBQUksd0JBQXdCLFNBQVMsT0FBTyxhQUFhLG9FQUFvRSxZQUFZLGFBQWEsaUJBQWlCLFNBQVMsT0FBTyxjQUFjLDRCQUE0QiwyQkFBMkIsVUFBVSxjQUFjLEtBQUsseUJBQXlCLG1CQUFtQix1REFBdUQsc0NBQXNDLGFBQWEsc0JBQXNCLHlCQUF5QixNQUFNLGFBQWEsK0lBQStJLG1CQUFtQixvQkFBb0IsZ0ZBQWdGLCtDQUErQyw0UEFBNFAsV0FBVyxTQUFTLEUiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gNyk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgYzk1ZjkxMzNlMGVkM2ZiMzlhODAiLCJcbi8vIEFwcGxpY2F0aW9uIHN0YXRlLlxuZXhwb3J0IGRlZmF1bHQge1xuICBtYXhXYWxrRGlzdGFuY2U6IDAuMjUsXG4gIHVzZXI6IHtcbiAgICBsb25naXR1ZGU6IG51bGwsXG4gICAgbGF0aXR1ZGU6IG51bGwsXG4gICAgYWRkcmVzczogbnVsbCxcbiAgfSxcbiAgb3JpZ2luOiB7XG4gICAgbG9uZ2l0dWRlOiBudWxsLFxuICAgIGxhdGl0dWRlOiBudWxsLFxuICAgIGFkZHJlc3M6IG51bGwsXG4gIH0sXG4gIGRlc3RpbmF0aW9uOiB7XG4gICAgbG9uZ2l0dWRlOiBudWxsLFxuICAgIGxhdGl0dWRlOiBudWxsLFxuICAgIGFkZHJlc3M6IG51bGwsXG4gIH0sXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3N0YXRlLmpzIiwiaW1wb3J0IHR1cmZDaXJjbGUgZnJvbSAnQHR1cmYvY2lyY2xlJztcbmltcG9ydCB7IGZlYXR1cmVDb2xsZWN0aW9uIGFzIHR1cmZGZWF0dXJlQ29sbGVjdGlvbiwgcG9pbnQgYXMgdHVyZlBvaW50IH0gZnJvbSAnQHR1cmYvaGVscGVycyc7XG5pbXBvcnQgdHVyZldpdGhpbiBmcm9tICdAdHVyZi93aXRoaW4nO1xuXG5pbXBvcnQgU3RhdGlvbkZlZWQgZnJvbSAnLi9TdGF0aW9uRmVlZCc7XG5pbXBvcnQgZ2V0UG9wdXBDb250ZW50IGZyb20gJy4vcG9wdXBzJztcbmltcG9ydCB1c2VyR2VvbG9jYXRlIGZyb20gJy4vdXNlckdlb2xvY2F0ZSc7XG5pbXBvcnQgZmV0Y2hSb3V0ZSBmcm9tICcuL3JvdXRlcic7XG5cbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHN0YXRlIGZyb20gJy4vc3RhdGUnO1xuXG5jb25zdCBzdGF0aW9uc1VSTCA9IGNvbmZpZy5zdGF0aW9uc1VybDtcblxubGV0IG1hcDtcblxuZnVuY3Rpb24gYWRkU3RhdGlvbnMoKSB7XG4gIG1hcC5vbignbG9hZCcsICgpID0+IHtcbiAgICB3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgbWFwLmdldFNvdXJjZSgnc3RhdGlvbnMtc291cmNlJykuc2V0RGF0YShTdGF0aW9uRmVlZC5nZXRTdGF0aW9ucygpKTtcbiAgICAgIC8vIG1hcC5nZXRTb3VyY2UoJ3N0YXRpb25zLXNvdXJjZScpLnNldERhdGEoc3RhdGlvbnNVUkwpO1xuICAgICAgY29uc29sZS5sb2coJ3JlZmV0Y2hpbmcgbGl2ZSBzdGF0aW9uIGRhdGEnKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIH0sIDMwICogMTAwMCk7IC8vIGV2ZXJ5IE4gc2Vjb25kcyAoaW4gbWlsbGlzZWNvbmRzKVxuXG4gICAgbWFwLmFkZFNvdXJjZSgnc3RhdGlvbnMtc291cmNlJywgeyB0eXBlOiAnZ2VvanNvbicsIGRhdGE6IHN0YXRpb25zVVJMIH0pO1xuICAgIG1hcC5hZGRMYXllcih7XG4gICAgICBpZDogJ3N0YXRpb25zLWxheWVyJyxcbiAgICAgIHR5cGU6ICdjaXJjbGUnLFxuICAgICAgc291cmNlOiAnc3RhdGlvbnMtc291cmNlJyxcbiAgICAgIHBhaW50OiB7XG4gICAgICAgICdjaXJjbGUtcmFkaXVzJzogMTIsXG4gICAgICAgICdjaXJjbGUtY29sb3InOiAnI0I0MjIyMicsXG4gICAgICAgICdjaXJjbGUtb3BhY2l0eSc6IDAsIC8vIHRyYW5zcGFyZW50IGRvdHMgc2l6ZWQgZm9yIGludGVyYWN0aW9uIC0gYWxsb3dzIHBvcHVwXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gQ2hhbmdlIHRoZSBjdXJzb3IgdG8gYSBwb2ludGVyIHdoZW4gdGhlIG1vdXNlIGlzIG92ZXIgdGhlIGxheWVyLlxuICAgIG1hcC5vbignbW91c2VlbnRlcicsICdzdGF0aW9ucy1sYXllcicsICgpID0+IHtcbiAgICAgIG1hcC5nZXRDYW52YXMoKS5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgfSk7XG5cbiAgICAvLyBDaGFuZ2UgaXQgYmFjayB0byBhIHBvaW50ZXIgd2hlbiBpdCBsZWF2ZXMuXG4gICAgbWFwLm9uKCdtb3VzZWxlYXZlJywgJ3N0YXRpb25zLWxheWVyJywgKCkgPT4ge1xuICAgICAgbWFwLmdldENhbnZhcygpLnN0eWxlLmN1cnNvciA9ICcnO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gYWRkUG9wdXBzKCkge1xuICBtYXAub24oJ2NsaWNrJywgKGUpID0+IHtcbiAgICBjb25zdCBmZWF0dXJlcyA9IG1hcC5xdWVyeVJlbmRlcmVkRmVhdHVyZXMoZS5wb2ludCwge1xuICAgICAgbGF5ZXJzOiBbJ3N0YXRpb25zLWxheWVyJ10sIC8vIHJlcGxhY2UgdGhpcyB3aXRoIHRoZSBuYW1lIG9mIHRoZSBsYXllclxuICAgIH0pO1xuXG4gICAgaWYgKCFmZWF0dXJlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBmZWF0dXJlID0gZmVhdHVyZXNbMF07XG5cbiAgICBjb25zdCBwb3B1cCA9IG5ldyBtYXBib3hnbC5Qb3B1cCh7IG9mZnNldDogWzAsIC0xNV0gfSlcbiAgICAgIC5zZXRMbmdMYXQoZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlcylcbiAgICAgIC5zZXRIVE1MKGdldFBvcHVwQ29udGVudChmZWF0dXJlKSlcbiAgICAgIC5zZXRMbmdMYXQoZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlcylcbiAgICAgIC5hZGRUbyhtYXApO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlcnNjb3JlLWRhbmdsZVxuICAgIHBvcHVwLl9jb250YWluZXIuY2xhc3NMaXN0LmFkZCgnc3RhdGlvbi1wb3B1cC0tY29udGFpbmVyJyk7IC8vIGZvciBzdHlsaW5nXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBhZGRFbXB0eVN0YXRpb25zTmVhcmJ5U291cmNlcygpIHtcbiAgbWFwLm9uKCdsb2FkJywgKCkgPT4ge1xuICAgIGNvbnN0IGVtcHR5RmVhdHVyZVNldCA9IHtcbiAgICAgIHR5cGU6ICdGZWF0dXJlQ29sbGVjdGlvbicsXG4gICAgICBmZWF0dXJlczogW10sXG4gICAgfTtcbiAgICBtYXAuYWRkU291cmNlKCdzdGF0aW9ucy1uZWFyLW9yaWdpbicsIHtcbiAgICAgIHR5cGU6ICdnZW9qc29uJyxcbiAgICAgIGRhdGE6IGVtcHR5RmVhdHVyZVNldCxcbiAgICAgIG1heHpvb206IDIyLCAvLyBvdGhlcndpc2Ugd2UgZ2V0IHByZWNpc2lvbiAvIG1pc2FsaWdubWVudCBlcnJvcnNcbiAgICAgIC8vIG1pZ2h0IHJlbGF0ZSB0bzpcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXBib3gvbWFwYm94LWdsLWpzL2lzc3Vlcy8yMjc5XG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L21hcGJveC1nbC1qcy9pc3N1ZXMvMTczM1xuICAgIH0pO1xuICAgIG1hcC5hZGRTb3VyY2UoJ3N0YXRpb25zLW5lYXItZGVzdGluYXRpb24nLCB7XG4gICAgICB0eXBlOiAnZ2VvanNvbicsXG4gICAgICBkYXRhOiBlbXB0eUZlYXR1cmVTZXQsXG4gICAgICBtYXh6b29tOiAyMixcbiAgICB9KTtcbiAgfSk7XG59XG5cblxuLyoqXG4gKiBJbnN0YW50aWF0ZSBtYXAgd2l0aCBzdGF0aW9ucy5cbiAqIEBwYXJhbSB7W2xvbixsYXRdfSBjZW50ZXI6IGxvbixsYXQgY29vcmRzIG9uIHdoaWNoIHRvIGNlbnRlciB0aGUgdmlld1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpbml0TWFwKGNlbnRlciwgem9vbSA9IDgpIHtcbiAgbWFwID0gbmV3IG1hcGJveGdsLk1hcCh7XG4gICAgY29udGFpbmVyOiAnbWFwJyxcbiAgICBzdHlsZTogY29uZmlnLm1hcFN0eWxlLFxuICAgIHpvb20sXG4gICAgY2VudGVyLFxuICB9KTtcblxuICAvLyBBZGQgZ2VvbG9jYXRlIGNvbnRyb2wgdG8gdGhlIG1hcC5cbiAgLy8gY29uc3QgZ2VvbG9jYXRlQ29udHJvbCA9IG5ldyBtYXBib3hnbC5HZW9sb2NhdGVDb250cm9sKHtcbiAgLy8gICBwb3NpdGlvbk9wdGlvbnM6IHtcbiAgLy8gICAgIGVuYWJsZUhpZ2hBY2N1cmFjeTogdHJ1ZSxcbiAgLy8gICB9LFxuICAvLyAgIHRyYWNrVXNlckxvY2F0aW9uOiB0cnVlLFxuICAvLyB9KTtcbiAgLy8gbWFwLmFkZENvbnRyb2woZ2VvbG9jYXRlQ29udHJvbCk7XG4gIC8vIGdlb2xvY2F0ZUNvbnRyb2wub24oJ2dlb2xvY2F0ZScsIHVzZXJHZW9sb2NhdGUpO1xuXG4gIGFkZEVtcHR5U3RhdGlvbnNOZWFyYnlTb3VyY2VzKCk7XG4gIC8vIGZldGNoU3RhdGlvbnMoKTtcbiAgYWRkU3RhdGlvbnMoKTtcbiAgYWRkUG9wdXBzKCk7XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBsb2NhdGlvbiAtIG9yaWdpbiBvciBkZXN0aW5hdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZmx5VG8obG9jYXRpb24pIHtcbiAgLy8gY29uc29sZS5sb2coYGZseWluZyB0bzpcbiAgLy8gJHtbc3RhdGVbbG9jYXRpb25dLmxvbmdpdHVkZSwgc3RhdGVbbG9jYXRpb25dLmxhdGl0dWRlXX0gKCR7c3RhdGVbbG9jYXRpb25dLmFkZHJlc3N9KWApO1xuICBtYXAuZmx5VG8oe1xuICAgIGNlbnRlcjogW3N0YXRlW2xvY2F0aW9uXS5sb25naXR1ZGUsIHN0YXRlW2xvY2F0aW9uXS5sYXRpdHVkZV0sXG4gICAgem9vbTogMTQsXG4gIH0pO1xufVxuXG5cbmNvbnN0IGVuZHBvaW50TWFya2VycyA9IHt9O1xuXG4vKipcbiAqIEFkZCBvciB1cGRhdGUgdGhlIG9yaWdpbiBvciBkZXN0aW5hdGlvbiBtYXJrZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSBsb2NhdGlvbiAtIG9yaWdpbiBvciBkZXN0aW5hdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyRGlyZWN0aW9uc01hcmtlcihsb2NhdGlvbikge1xuICBpZiAoZW5kcG9pbnRNYXJrZXJzW2xvY2F0aW9uXSkge1xuICAgIC8vIGNvbnNvbGUubG9nKGBzZXR0aW5nIGVuZHBvaW50IGZvciAke2xvY2F0aW9ufSB0b1xuICAgIC8vICR7W3N0YXRlW2xvY2F0aW9uXS5sb25naXR1ZGUsIHN0YXRlW2xvY2F0aW9uXS5sYXRpdHVkZV19YCk7XG4gICAgZW5kcG9pbnRNYXJrZXJzW2xvY2F0aW9uXS5zZXRMbmdMYXQoW3N0YXRlW2xvY2F0aW9uXS5sb25naXR1ZGUsIHN0YXRlW2xvY2F0aW9uXS5sYXRpdHVkZV0pO1xuICAgIC8vIGVuZHBvaW50TWFya2Vyc1tsb2NhdGlvbl0uYWRkVG8obWFwKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBjb25zb2xlLmxvZyhgY3JlYXRpbmcgJHtsb2NhdGlvbn0gbWFya2VyYCk7XG4gICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBlbC5jbGFzc05hbWUgPSBgbWFya2VyIG1hcC1tYXJrZXItZGlyZWN0aW9ucyBpcy0ke2xvY2F0aW9ufWA7XG4gICAgZW5kcG9pbnRNYXJrZXJzW2xvY2F0aW9uXSA9IG5ldyBtYXBib3hnbC5NYXJrZXIoZWwpXG4gICAgICAuc2V0TG5nTGF0KFtzdGF0ZVtsb2NhdGlvbl0ubG9uZ2l0dWRlLCBzdGF0ZVtsb2NhdGlvbl0ubGF0aXR1ZGVdKVxuICAgICAgLmFkZFRvKG1hcCk7XG4gIH1cbn1cblxuXG4vKipcbiAqIFJldHVybiBhIEZlYXR1cmVDb2xsZWN0aW9uIG9mIHN0YXRpb25zIHdpdGhpbiBzdGF0ZS5tYXhXYWxraW5nRGlzdGFuY2Ugb2YgbG9jYXRpb24uXG4gKiBAcGFyYW0ge1N0cmluZ30gbG9jYXRpb24gLSBvcmlnaW4gb3IgZGVzdGluYXRpb25cbiAqL1xuZnVuY3Rpb24gZ2V0U3RhdGlvbnNOZWFyKGxvY2F0aW9uKSB7XG4gIGlmIChzdGF0ZS5tYXhXYWxrRGlzdGFuY2UgPT09IDApIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogJ0ZlYXR1cmVDb2xsZWN0aW9uJyxcbiAgICAgIGZlYXR1cmVzOiBbXSxcbiAgICB9O1xuICB9XG5cbiAgLy8gZ2V0IGFsbCBzdGF0aW9uc1xuICBjb25zdCBzdGF0aW9ucyA9IFN0YXRpb25GZWVkLmdldFN0YXRpb25zQXJyYXkoKTtcbiAgLy8gY29uc3Qgc3RhdGlvbnMgPSBtYXAucXVlcnlTb3VyY2VGZWF0dXJlcygnc3RhdGlvbnMtc291cmNlJyk7XG4gIC8vIGNhbid0IHVzZSBxdWVyeVNvdXJjZUZlYXR1cmVzOiBvbmx5IGxvb2tzIGluIHZpc2libGUgYXJlYVxuICAvLyBpZiBuZWVkZWQsIHVzZSBmaWx0ZXIgdG8gbGltaXQgcmVzdWx0IHNldCAob25seSB0aG9zZSB3LyBhdmFpbGFibGUgYmlrZXMsIGV0YykuXG4gIC8vIGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLWpzL2FwaS8jbWFwI3F1ZXJ5c291cmNlZmVhdHVyZXNcblxuICBjb25zb2xlLmxvZyhgZ290IGFsbCBzdGF0aW9uczsgc2VhcmNoaW5nIHdpdGhpbiAke3N0YXRlLm1heFdhbGtEaXN0YW5jZX1gLCBzdGF0aW9ucyk7XG5cbiAgLy8gdXNlIFR1cmYgdG8gZG8gYSBwcm94aW1pdHkgc2VhcmNoLlxuICAvLyBUT0RPOiBvciBiZXR0ZXIsIHVzZSBNYXB6ZW4gdG8gZG8gYW4gaXNvY2hyb25lIHNlYXJjaFxuICBjb25zdCBjZW50ZXIgPSB0dXJmUG9pbnQoW3N0YXRlW2xvY2F0aW9uXS5sb25naXR1ZGUsIHN0YXRlW2xvY2F0aW9uXS5sYXRpdHVkZV0pO1xuICBjb25zdCBzZWFyY2hXaXRoaW5GZWF0dXJlcyA9IHR1cmZGZWF0dXJlQ29sbGVjdGlvbihbdHVyZkNpcmNsZShjZW50ZXIsIHN0YXRlLm1heFdhbGtEaXN0YW5jZSwgeyB1bml0czogJ21pbGVzJyB9KV0pO1xuICBjb25zdCBzdGF0aW9uQ29sbGVjdGlvbiA9IHR1cmZGZWF0dXJlQ29sbGVjdGlvbihzdGF0aW9ucyk7XG5cbiAgY29uc3QgbmVhcmJ5U3RhdGlvbnMgPSB0dXJmV2l0aGluKHN0YXRpb25Db2xsZWN0aW9uLCBzZWFyY2hXaXRoaW5GZWF0dXJlcyk7XG4gIHJldHVybiBuZWFyYnlTdGF0aW9ucztcbn1cblxuLyoqXG4gKiBTcGxpdHMgdGhlIGdpdmVuIGdyb3VwIG9mIHN0YXRpb25zIGJhc2VkIG9uIGF2YWlsYWJpbGl0eSBzdGF0dXMuXG4gKiBJZiBsb2NhdGlvbiBpcyBvcmlnaW4sIGNyaXRlcmlhIGlzIGJpa2VzOyBvdGhlcndpc2UgaXQncyBkb2Nrcy5cbiAqIFJldHVybnMgW2VtcHR5LCBhdmFpbGFibGVdIHdoZXJlIGVhY2ggaXMgYSBGLkMuXG4gKiBAcGFyYW0ge1N0cmluZ30gbG9jYXRpb24gLSBvcmlnaW4gb3IgZGVzdGluYXRpb25cbiAqIEBwYXJhbSB7fSBzdGF0aW9uc0NvbGxlY3Rpb24gLSBGZWF0dXJlQ29sbGVjdGlvbiBvZiBzdGF0aW9ucyBhbHJlYWR5IG5lYXIgbG9jYXRpb25cbiAqL1xuLy8gZnVuY3Rpb24gc3BsaXRFbXB0eU9yQXZhaWxhYmxlKGxvY2F0aW9uLCBzdGF0aW9uc0NvbGxlY3Rpb24pIHtcbi8vICAgLypcbi8vICAgQmlrZXNoYXJlIHN0YXRpb25zIHdpdGhpbiB0aGUgc3BlY2lmaWVkIGRpc3RhbmNlIG9mIHRoZSBvcmlnaW5cbi8vICAgICAgdGhhdCBoYXZlIGJpa2VzIGF2YWlsYWJsZSBzaG91bGQgYmUgbWFya2VkIGdyZWVuXG4vLyAgICAgIHdpdGggbm8gYXZhaWxhYmxlIGJpa2VzIHNob3VsZCBiZSBtYXJrZWQgcmVkXG5cbi8vICAgQmlrZXNoYXJlIHN0YXRpb25zIHdpdGhpbiB0aGUgc3BlY2lmaWVkIGRpc3RhbmNlIG9mIHRoZSBkZXN0aW5hdGlvblxuLy8gICAgIHRoYXQgaGF2ZSBkb2NrcyBhdmFpbGFibGUgc2hvdWxkIGJlIG1hcmtlZCBncmVlblxuLy8gICAgIHRoYXQgaGF2ZSBubyBkb2NrcyBhdmFpbGFibGUgc2hvdWxkIGJlIG1hcmtlZCByZWRcbi8vICAgKi9cblxuLy8gICBjb25zdCBzdGF0aW9ucyA9IHN0YXRpb25zQ29sbGVjdGlvbi5mZWF0dXJlcztcbi8vICAgY29uc3QgYXZhaWxhYmxlQ3JpdGVyYSA9IGxvY2F0aW9uID09PSAnb3JpZ2luJyA/ICdhdmFpbGFibGVCaWtlcycgOiAnYXZhaWxhYmxlRG9ja3MnO1xuXG4vLyAgIGNvbnN0IGVtcHR5ID0gW107XG4vLyAgIGNvbnN0IGF2YWlsYWJsZSA9IFtdO1xuXG4vLyAgIHN0YXRpb25zLmZvckVhY2goKHN0YXRpb24pID0+IHtcbi8vICAgICBpZiAoc3RhdGlvbi5wcm9wZXJ0aWVzW2F2YWlsYWJsZUNyaXRlcmFdID4gMCkge1xuLy8gICAgICAgYXZhaWxhYmxlLnB1c2goc3RhdGlvbik7XG4vLyAgICAgfSBlbHNlIHtcbi8vICAgICAgIGVtcHR5LnB1c2goc3RhdGlvbik7XG4vLyAgICAgfVxuLy8gICB9KTtcblxuLy8gICByZXR1cm4gW2VtcHR5LCBhdmFpbGFibGVdO1xuLy8gfVxuXG5cbmZ1bmN0aW9uIGdldExheWVySWRGb3JTdGF0aW9uc05lYXIobG9jYXRpb24pIHtcbiAgcmV0dXJuIGBzdGF0aW9ucy1uZWFyLSR7bG9jYXRpb259YDtcbn1cblxuXG4vKipcbiAqIEhpZ2hsaWdodCB0aGUgZ2l2ZW4gc3RhdGlvbnMgbmVhciB0aGUgZ2l2ZW4gbG9jYXRpb25cbiAqIEBwYXJhbSB7U3RyaW5nfSBsb2NhdGlvbiAtIG9yaWdpbiBvciBkZXN0aW5hdGlvblxuICogQHBhcmFtIHtGZWF0dXJlQ29sbGVjdGlvbn0gc3RhdGlvbnMgbmVhcmJ5IHRoZSBvcmlnaW4gb3IgZGVzdGluYXRpb24gdG8gaGlnaGxpZ2h0XG4gKi9cbmZ1bmN0aW9uIHNob3dTdGF0aW9uc05lYXIobG9jYXRpb24sIHN0YXRpb25zKSB7XG4gIC8vIGRyYXcgc3RhdGlvbnMgYXMgbWFya2VycyBvbiB0aGUgbWFwXG4gIGNvbnNvbGUubG9nKGBzaG93aW5nIHN0YXRpb25zIG5lYXJieSAke2xvY2F0aW9ufTogYCwgc3RhdGlvbnMpO1xuXG4gIGNvbnN0IGxheWVyQW5kU291cmNlSWQgPSBnZXRMYXllcklkRm9yU3RhdGlvbnNOZWFyKGxvY2F0aW9uKTtcbiAgY29uc3QgYXZhaWxhYmxlQ3JpdGVyYSA9IGxvY2F0aW9uID09PSAnb3JpZ2luJyA/ICdhdmFpbGFibGVCaWtlcycgOiAnYXZhaWxhYmxlRG9ja3MnO1xuXG4gIGNvbnNvbGUubG9nKCdhZGRpbmcgbWF0Y2hpbmcgbmVhcmJ5IHN0YXRpb25zJyk7XG4gIG1hcC5nZXRTb3VyY2UobGF5ZXJBbmRTb3VyY2VJZCkuc2V0RGF0YShzdGF0aW9ucyk7XG5cbiAgY29uc3QgbGF5ZXIgPSBtYXAuZ2V0TGF5ZXIobGF5ZXJBbmRTb3VyY2VJZCk7XG4gIGlmICghbGF5ZXIpIHsgLy8gc2hvdWxkIG9ubHkgbmVlZCB0byBkbyB0aGlzIG9uY2UuXG4gICAgLy8gQ3JlYXRlIGEgbmV3IGNpcmNsZSBsYXllciBmcm9tIHRoZSBkYXRhIHNvdXJjZVxuICAgIG1hcC5hZGRMYXllcih7XG4gICAgICBpZDogbGF5ZXJBbmRTb3VyY2VJZCxcbiAgICAgIHR5cGU6ICdjaXJjbGUnLFxuICAgICAgc291cmNlOiBsYXllckFuZFNvdXJjZUlkLFxuICAgICAgcGFpbnQ6IHtcbiAgICAgICAgJ2NpcmNsZS1yYWRpdXMnOiAxMiwgLy8gYmlrZXNoYXJlIGljb24gaXMgMjRweCAoc2NhbGVkIGJ5IDEvMiBzbyAxMilcbiAgICAgICAgJ2NpcmNsZS1jb2xvcic6IHtcbiAgICAgICAgICBwcm9wZXJ0eTogYXZhaWxhYmxlQ3JpdGVyYSxcbiAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgLy8gXCJhdmFpbGFibGVcIjogMCAgIC0+IGNpcmNsZSBjb2xvciB3aWxsIGJlIHJlZFxuICAgICAgICAgICAgWzAsICdyZWQnXSxcbiAgICAgICAgICAgIC8vIFwiYXZhaWxhYmxlXCI6IDEgb3IgbW9yZSAtPiBjaXJjbGUgY29sb3Igd2lsbCBiZSBncmVlblxuICAgICAgICAgICAgWzEsICdsaWdodHNlYWdyZWVuJ10sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSwgJ2Jpa2VzaGFyZS1zdGF0aW9ucycpOyAvLyBwbGFjZSBjb2xvciBiZW5lYXRoIGJpa2VzaGFyZSBpY29uc1xuICB9XG59XG5cblxuZnVuY3Rpb24gY2xlYXJTdGF0aW9uc05lYXIobG9jYXRpb24pIHtcbiAgY29uc3QgbGF5ZXJJRCA9IGdldExheWVySWRGb3JTdGF0aW9uc05lYXIobG9jYXRpb24pO1xuICBjb25zdCBsYXllciA9IG1hcC5nZXRMYXllcihsYXllcklEKTtcbiAgaWYgKGxheWVyKSB7XG4gICAgbWFwLnJlbW92ZUxheWVyKGxheWVySUQpO1xuICB9XG59XG5cblxuLyoqXG4gKiBVcGRhdGUgc3RhdGlvbiByZXN1bHRzIG5lYXJieS5cbiAqIFdoZW4gdGhlIG9yaWdpbiBvciBkZXN0aW5hdGlvbiBpcyBzZXQsXG4gKiBvciB3aGVuIHRoZSB1c2VyJ3MgbWF4IHdhbGtpbmcgZGlzdGFuY2UgcHJlZmVyZW5jZSBjaGFuZ2VzLFxuICogdXBkYXRlIG5lYXJieSByZXN1bHRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFwVXBkYXRlTmVhcmJ5KCkge1xuICAvLyBjb25zb2xlLmxvZygnbWFwdXBkYXRlbmVhcmJ5KCknKTtcblxuICBbJ29yaWdpbicsICdkZXN0aW5hdGlvbiddLmZvckVhY2goKGxvY2F0aW9uKSA9PiB7XG4gICAgaWYgKHN0YXRlW2xvY2F0aW9uXS5sYXRpdHVkZSAmJiBzdGF0ZVtsb2NhdGlvbl0ubG9uZ2l0dWRlKSB7XG4gICAgICBjb25zdCBuZWFyYnlTdGF0aW9ucyA9IGdldFN0YXRpb25zTmVhcihsb2NhdGlvbik7XG4gICAgICBjb25zb2xlLmxvZyhgZ290IHN0YXRpb25zIG5lYXIgJHtsb2NhdGlvbn1gLCBuZWFyYnlTdGF0aW9ucyk7XG5cbiAgICAgIC8vIGlmIChtYXAuaXNNb3ZpbmcoKSkge1xuICAgICAgLy8gICBjb25zb2xlLmxvZygnTk9URTogbWFwIHdhcyBtb3ZpbmcsIHJlc2NoZWR1bGluZyBzdGF0aW9uIHVwZGF0ZSB0byBlbmQgb2YgbW92ZScpO1xuICAgICAgLy8gICBtYXAub25jZSgnbW92ZWVuZCcsICgpID0+IHtcbiAgICAgIC8vICAgICBjb25zb2xlLmxvZygnc3RhdGlvbiB1cGRhdGUgYWZ0ZXIgbW92ZSBlbmQnKTtcbiAgICAgIC8vICAgICBzaG93U3RhdGlvbnNOZWFyKGxvY2F0aW9uLCBuZWFyYnlTdGF0aW9ucyk7XG4gICAgICAvLyAgIH0pO1xuICAgICAgLy8gfSBlbHNlIHtcbiAgICAgIC8vICAgY29uc29sZS5sb2coJ21hcCBub3QgbW92aW5nOyBkb2luZyBzdGF0aW9uIHVwZGF0ZScpO1xuICAgICAgLy8gICBzaG93U3RhdGlvbnNOZWFyKGxvY2F0aW9uLCBuZWFyYnlTdGF0aW9ucyk7XG4gICAgICAvLyB9XG4gICAgICBzaG93U3RhdGlvbnNOZWFyKGxvY2F0aW9uLCBuZWFyYnlTdGF0aW9ucyk7XG4gICAgfSBlbHNlIHsgLy8gaWYgd2UgKmRvbid0KiBoYXZlIGEgcGFydGljdWxhciBsb2NhdGlvbiBlbmRwb2ludCxcbiAgICAgIC8vIHRoZW4gd2UgbmVlZCB0byBjbGVhciB0aGUgbWFya2Vyc1xuICAgICAgY2xlYXJTdGF0aW9uc05lYXIobG9jYXRpb24pO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG1hcENsZWFyUm91dGUoKSB7XG4gIGNvbnN0IHJvdXRlTGF5ZXIgPSBtYXAuZ2V0TGF5ZXIoJ3JvdXRlJyk7XG4gIGlmIChyb3V0ZUxheWVyKSB7XG4gICAgbWFwLnJlbW92ZUxheWVyKCdyb3V0ZScpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1hcFVwZGF0ZVJvdXRlKCkge1xuICBpZiAoc3RhdGUub3JpZ2luLmxhdGl0dWRlICYmIHN0YXRlLmRlc3RpbmF0aW9uLmxhdGl0dWRlKSB7XG4gICAgZmV0Y2hSb3V0ZShzdGF0ZS5vcmlnaW4sIHN0YXRlLmRlc3RpbmF0aW9uLCAocm91dGVMaW5lU3RyaW5nKSA9PiB7XG4gICAgICBsZXQgc291cmNlID0gbWFwLmdldFNvdXJjZSgncm91dGUnKTtcbiAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgc291cmNlLnNldERhdGEocm91dGVMaW5lU3RyaW5nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNvdXJjZSA9IG1hcC5hZGRTb3VyY2UoJ3JvdXRlJywgeyB0eXBlOiAnZ2VvanNvbicsIGRhdGE6IHJvdXRlTGluZVN0cmluZyB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gcGxhY2Ugcm91dGUgYmVuZWF0aCBuZWFyYnkgbWFya2VycyAodGhlbXNlbHZlcyBiZW5lYXRoIHN0YXRpb25zKVxuICAgICAgY29uc3QgbGF5ZXJBYm92ZSA9IGdldExheWVySWRGb3JTdGF0aW9uc05lYXIoJ29yaWdpbicpO1xuXG4gICAgICAvLyBjcmVhdGluZyBzb3VyY2UgZm9yIHRoZSBmaXJzdCB0aW1lOyBhZGQgYSBsYXllciBmb3IgaXQuXG4gICAgICAvLyBoYXZlIHRvIGRvIHRoaXMgZXZlcnkgdGltZT9cbiAgICAgIG1hcC5hZGRMYXllcih7XG4gICAgICAgIGlkOiAncm91dGUnLFxuICAgICAgICB0eXBlOiAnbGluZScsXG4gICAgICAgIHNvdXJjZTogJ3JvdXRlJyxcbiAgICAgICAgLy8gIHtcbiAgICAgICAgLy8gICB0eXBlOiAnZ2VvanNvbicsXG4gICAgICAgIC8vICAgZGF0YTogcm91dGVMaW5lU3RyaW5nLFxuICAgICAgICAvLyB9LFxuICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAnbGluZS1qb2luJzogJ3JvdW5kJyxcbiAgICAgICAgICAnbGluZS1jYXAnOiAncm91bmQnLFxuICAgICAgICB9LFxuICAgICAgICBwYWludDoge1xuICAgICAgICAgICdsaW5lLWNvbG9yJzogJyM0QUIyRjcnLCAvLyBnb29nbGUgbWFwcyBibHVlICM4ODhcbiAgICAgICAgICAnbGluZS13aWR0aCc6IDgsXG4gICAgICAgIH0sXG4gICAgICB9LCBsYXllckFib3ZlKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICAvLyB3ZSBkb24ndCBoYXZlIGJvdGggZW5kIHBvaW50cyAtIGVuc3VyZSBubyByb3V0ZSBzaG93blxuICAgIG1hcENsZWFyUm91dGUoKTtcbiAgfVxufVxuXG5cbi8qKlxuICogQWRkIG9yIHJlbW92ZSBlbmRwb2ludCBtYXJrZXIgYW5kIHVwZGF0ZSBuZWFyYnkgc3RhdGlvbnMuXG4gKiBAcGFyYW0ge1N0cmluZ30gbG9jYXRpb24gb3JpZ2luIG9yIGRlc3RpbmF0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXBVcGRhdGVEaXJlY3Rpb25zRW5kcG9pbnQobG9jYXRpb24pIHtcbiAgLy8gY29uc29sZS5sb2coJ21hcFVwZGF0ZURpcmVjdGlvbnNFbmRwb2ludCgpJyk7XG4gIG1hcFVwZGF0ZVJvdXRlKCk7XG4gIGlmIChzdGF0ZVtsb2NhdGlvbl0ubGF0aXR1ZGUgPT09IG51bGwgJiYgZW5kcG9pbnRNYXJrZXJzW2xvY2F0aW9uXSkge1xuICAgIC8vIGNsZWFyIG1hcmtlclxuICAgIGNvbnNvbGUubG9nKGBjbGVhcmluZyAke2xvY2F0aW9ufSBtYXJrZXIgKG5vIGxhdGl0dWRlKWApO1xuICAgIGVuZHBvaW50TWFya2Vyc1tsb2NhdGlvbl0ucmVtb3ZlKCk7XG4gICAgZW5kcG9pbnRNYXJrZXJzW2xvY2F0aW9uXSA9IG51bGw7XG4gIH0gZWxzZSB7XG4gICAgcmVuZGVyRGlyZWN0aW9uc01hcmtlcihsb2NhdGlvbik7XG4gICAgZmx5VG8obG9jYXRpb24pO1xuICB9XG4gIG1hcFVwZGF0ZU5lYXJieSgpO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL21hcC5qcyIsImV4cG9ydCBkZWZhdWx0IHtcbiAgbWFwemVuS2V5OiAnbWFwemVuLWh6VmJTcjUnLFxuICBtYXBib3hUb2tlbjogJ3BrLmV5SjFJam9pZEdWamFHbGxjMmhoY21zaUxDSmhJam9pWXprMlpFRldUU0o5LjhaWTZyRzJCV1hrREJtdkFQdm5fbncnLFxuICBtYXBTdHlsZTogJ21hcGJveDovL3N0eWxlcy90ZWNoaWVzaGFyay9jajk3NjkwcjAwYmNjMnN0aGtxeG44ZjJ2JyxcbiAgc3RhdGlvbnNVcmw6ICdodHRwczovL2xpdC1iZWFjaC0yMTU4Ni5oZXJva3VhcHAuY29tLycsIC8vIGdlb2pzb24gbWlycm9yIG9mIHN0YXRpb25zIGFwaVxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb25maWcuanMiLCJpbXBvcnQgZ2VvIGZyb20gJ21hcGJveC1nZW9jb2RpbmcnO1xuLy8gdmFyIGdlbyA9IHJlcXVpcmUoJ21hcGJveC1nZW9jb2RpbmcnKTtcblxuaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5cbmdlby5zZXRBY2Nlc3NUb2tlbihjb25maWcubWFwYm94VG9rZW4pO1xuXG4vKipcbiAqIFJldmVyc2UgR2VvY29kZSBsYXQvbG5nIC0tIHVzaW5nIE1hcGJveCB1bmRlciB0aGUgaG9vZC5cbiAqIEBwYXJhbSB7Kn0gbGF0XG4gKiBAcGFyYW0geyp9IGxuZ1xuICogQHBhcmFtIHsqfSBjYWxsYmFjazogKGVyciwgZ2VvRGF0YSkgPT4gYW55XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXZlcnNlR2VvY29kZShsYXQsIGxuZywgY2FsbGJhY2spIHtcbiAgLy8gUmV2ZXJzZSBnZW9jb2RlIGNvb3JkaW5hdGVzIHRvIGFkZHJlc3MuXG4gIGdlby5yZXZlcnNlR2VvY29kZSgnbWFwYm94LnBsYWNlcycsIGxuZywgbGF0LCAoZXJyLCBnZW9EYXRhKSA9PiB7XG4gICAgLy8gY29uc29sZS5sb2coZ2VvRGF0YSk7XG4gICAgY2FsbGJhY2soZXJyLCBnZW9EYXRhKTtcbiAgfSk7XG59XG5cblxuLyoqXG4gKiBHZW9jb2RlIGFkZHJlc3MgLSB1c2luZyBNYXBib3ggdW5kZXIgdGhlIGhvb2QuXG4gKiBAcGFyYW0ge3N0cmluZ30gYWRkcmVzc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2s6IChlcnIsIGdlb0RhdGEpID0+IGFueVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VvY29kZShhZGRyZXNzLCBjYWxsYmFjaykge1xuICAvLyBHZW9jb2RlIGFuIGFkZHJlc3MgdG8gY29vcmRpbmF0ZXNcbiAgZ2VvLmdlb2NvZGUoJ21hcGJveC5wbGFjZXMnLCBhZGRyZXNzLCAoZXJyLCBnZW9EYXRhKSA9PiB7XG4gICAgLy8gY29uc29sZS5sb2coZ2VvRGF0YSk7XG4gICAgY2FsbGJhY2soZXJyLCBnZW9EYXRhKTtcbiAgfSk7XG59XG5cblxuLyoqXG4gKiBCaWFzIGdlb2NvZGluZyByZXN1bHRzIG5lYXIgdGhlIGNlbnRlci5cbiAqIEBwYXJhbSB7W2xvbmdpdHVkZSxsYXRpdHVkZV19IGNlbnRlciBmb3IgcHJveGltaXR5IGJpYXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEdlb2NkZXJDZW50ZXIoY2VudGVyKSB7XG4gIGdlby5zZXRTZWFyY2hDZW50ZXIoY2VudGVyKTtcbn1cblxuXG4vKipcbiAqIFNlYXJjaCB3aXRoaW5nIHRoZSBnaXZlbiBib3VuZGluZyBib3hcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYm94IGJvdW5kaW5nIGJveCBzdHJpbmcgaW4gZm9ybWF0IG1pblgsbWluWSxtYXhYLG1heFlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEdlb2NvZGVyQm91bmRzKGJib3gpIHtcbiAgZ2VvLnNldFNlYXJjaEJvdW5kcyhiYm94KTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9nZW9jb2Rlci5qcyIsIi8qXG5cdE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG5cdEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG4vLyBjc3MgYmFzZSBjb2RlLCBpbmplY3RlZCBieSB0aGUgY3NzLWxvYWRlclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih1c2VTb3VyY2VNYXApIHtcblx0dmFyIGxpc3QgPSBbXTtcblxuXHQvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG5cdGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0XHRyZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcblx0XHRcdHZhciBjb250ZW50ID0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtLCB1c2VTb3VyY2VNYXApO1xuXHRcdFx0aWYoaXRlbVsyXSkge1xuXHRcdFx0XHRyZXR1cm4gXCJAbWVkaWEgXCIgKyBpdGVtWzJdICsgXCJ7XCIgKyBjb250ZW50ICsgXCJ9XCI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gY29udGVudDtcblx0XHRcdH1cblx0XHR9KS5qb2luKFwiXCIpO1xuXHR9O1xuXG5cdC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG5cdGxpc3QuaSA9IGZ1bmN0aW9uKG1vZHVsZXMsIG1lZGlhUXVlcnkpIHtcblx0XHRpZih0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIilcblx0XHRcdG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIFwiXCJdXTtcblx0XHR2YXIgYWxyZWFkeUltcG9ydGVkTW9kdWxlcyA9IHt9O1xuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaWQgPSB0aGlzW2ldWzBdO1xuXHRcdFx0aWYodHlwZW9mIGlkID09PSBcIm51bWJlclwiKVxuXHRcdFx0XHRhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2lkXSA9IHRydWU7XG5cdFx0fVxuXHRcdGZvcihpID0gMDsgaSA8IG1vZHVsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBpdGVtID0gbW9kdWxlc1tpXTtcblx0XHRcdC8vIHNraXAgYWxyZWFkeSBpbXBvcnRlZCBtb2R1bGVcblx0XHRcdC8vIHRoaXMgaW1wbGVtZW50YXRpb24gaXMgbm90IDEwMCUgcGVyZmVjdCBmb3Igd2VpcmQgbWVkaWEgcXVlcnkgY29tYmluYXRpb25zXG5cdFx0XHQvLyAgd2hlbiBhIG1vZHVsZSBpcyBpbXBvcnRlZCBtdWx0aXBsZSB0aW1lcyB3aXRoIGRpZmZlcmVudCBtZWRpYSBxdWVyaWVzLlxuXHRcdFx0Ly8gIEkgaG9wZSB0aGlzIHdpbGwgbmV2ZXIgb2NjdXIgKEhleSB0aGlzIHdheSB3ZSBoYXZlIHNtYWxsZXIgYnVuZGxlcylcblx0XHRcdGlmKHR5cGVvZiBpdGVtWzBdICE9PSBcIm51bWJlclwiIHx8ICFhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG5cdFx0XHRcdGlmKG1lZGlhUXVlcnkgJiYgIWl0ZW1bMl0pIHtcblx0XHRcdFx0XHRpdGVtWzJdID0gbWVkaWFRdWVyeTtcblx0XHRcdFx0fSBlbHNlIGlmKG1lZGlhUXVlcnkpIHtcblx0XHRcdFx0XHRpdGVtWzJdID0gXCIoXCIgKyBpdGVtWzJdICsgXCIpIGFuZCAoXCIgKyBtZWRpYVF1ZXJ5ICsgXCIpXCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0bGlzdC5wdXNoKGl0ZW0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0cmV0dXJuIGxpc3Q7XG59O1xuXG5mdW5jdGlvbiBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0sIHVzZVNvdXJjZU1hcCkge1xuXHR2YXIgY29udGVudCA9IGl0ZW1bMV0gfHwgJyc7XG5cdHZhciBjc3NNYXBwaW5nID0gaXRlbVszXTtcblx0aWYgKCFjc3NNYXBwaW5nKSB7XG5cdFx0cmV0dXJuIGNvbnRlbnQ7XG5cdH1cblxuXHRpZiAodXNlU291cmNlTWFwICYmIHR5cGVvZiBidG9hID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0dmFyIHNvdXJjZU1hcHBpbmcgPSB0b0NvbW1lbnQoY3NzTWFwcGluZyk7XG5cdFx0dmFyIHNvdXJjZVVSTHMgPSBjc3NNYXBwaW5nLnNvdXJjZXMubWFwKGZ1bmN0aW9uIChzb3VyY2UpIHtcblx0XHRcdHJldHVybiAnLyojIHNvdXJjZVVSTD0nICsgY3NzTWFwcGluZy5zb3VyY2VSb290ICsgc291cmNlICsgJyAqLydcblx0XHR9KTtcblxuXHRcdHJldHVybiBbY29udGVudF0uY29uY2F0KHNvdXJjZVVSTHMpLmNvbmNhdChbc291cmNlTWFwcGluZ10pLmpvaW4oJ1xcbicpO1xuXHR9XG5cblx0cmV0dXJuIFtjb250ZW50XS5qb2luKCdcXG4nKTtcbn1cblxuLy8gQWRhcHRlZCBmcm9tIGNvbnZlcnQtc291cmNlLW1hcCAoTUlUKVxuZnVuY3Rpb24gdG9Db21tZW50KHNvdXJjZU1hcCkge1xuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcblx0dmFyIGJhc2U2NCA9IGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSk7XG5cdHZhciBkYXRhID0gJ3NvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LCcgKyBiYXNlNjQ7XG5cblx0cmV0dXJuICcvKiMgJyArIGRhdGEgKyAnICovJztcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXG4vLyBtb2R1bGUgaWQgPSA0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qXG5cdE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG5cdEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG5cbnZhciBzdHlsZXNJbkRvbSA9IHt9O1xuXG52YXJcdG1lbW9pemUgPSBmdW5jdGlvbiAoZm4pIHtcblx0dmFyIG1lbW87XG5cblx0cmV0dXJuIGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodHlwZW9mIG1lbW8gPT09IFwidW5kZWZpbmVkXCIpIG1lbW8gPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdHJldHVybiBtZW1vO1xuXHR9O1xufTtcblxudmFyIGlzT2xkSUUgPSBtZW1vaXplKGZ1bmN0aW9uICgpIHtcblx0Ly8gVGVzdCBmb3IgSUUgPD0gOSBhcyBwcm9wb3NlZCBieSBCcm93c2VyaGFja3Ncblx0Ly8gQHNlZSBodHRwOi8vYnJvd3NlcmhhY2tzLmNvbS8jaGFjay1lNzFkODY5MmY2NTMzNDE3M2ZlZTcxNWMyMjJjYjgwNVxuXHQvLyBUZXN0cyBmb3IgZXhpc3RlbmNlIG9mIHN0YW5kYXJkIGdsb2JhbHMgaXMgdG8gYWxsb3cgc3R5bGUtbG9hZGVyXG5cdC8vIHRvIG9wZXJhdGUgY29ycmVjdGx5IGludG8gbm9uLXN0YW5kYXJkIGVudmlyb25tZW50c1xuXHQvLyBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJwYWNrLWNvbnRyaWIvc3R5bGUtbG9hZGVyL2lzc3Vlcy8xNzdcblx0cmV0dXJuIHdpbmRvdyAmJiBkb2N1bWVudCAmJiBkb2N1bWVudC5hbGwgJiYgIXdpbmRvdy5hdG9iO1xufSk7XG5cbnZhciBnZXRFbGVtZW50ID0gKGZ1bmN0aW9uIChmbikge1xuXHR2YXIgbWVtbyA9IHt9O1xuXG5cdHJldHVybiBmdW5jdGlvbihzZWxlY3Rvcikge1xuXHRcdGlmICh0eXBlb2YgbWVtb1tzZWxlY3Rvcl0gPT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdHZhciBzdHlsZVRhcmdldCA9IGZuLmNhbGwodGhpcywgc2VsZWN0b3IpO1xuXHRcdFx0Ly8gU3BlY2lhbCBjYXNlIHRvIHJldHVybiBoZWFkIG9mIGlmcmFtZSBpbnN0ZWFkIG9mIGlmcmFtZSBpdHNlbGZcblx0XHRcdGlmIChzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdC8vIFRoaXMgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYWNjZXNzIHRvIGlmcmFtZSBpcyBibG9ja2VkXG5cdFx0XHRcdFx0Ly8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcblx0XHRcdFx0XHRzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuXHRcdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0XHRzdHlsZVRhcmdldCA9IG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdG1lbW9bc2VsZWN0b3JdID0gc3R5bGVUYXJnZXQ7XG5cdFx0fVxuXHRcdHJldHVybiBtZW1vW3NlbGVjdG9yXVxuXHR9O1xufSkoZnVuY3Rpb24gKHRhcmdldCkge1xuXHRyZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpXG59KTtcblxudmFyIHNpbmdsZXRvbiA9IG51bGw7XG52YXJcdHNpbmdsZXRvbkNvdW50ZXIgPSAwO1xudmFyXHRzdHlsZXNJbnNlcnRlZEF0VG9wID0gW107XG5cbnZhclx0Zml4VXJscyA9IHJlcXVpcmUoXCIuL3VybHNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGlzdCwgb3B0aW9ucykge1xuXHRpZiAodHlwZW9mIERFQlVHICE9PSBcInVuZGVmaW5lZFwiICYmIERFQlVHKSB7XG5cdFx0aWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gXCJvYmplY3RcIikgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHN0eWxlLWxvYWRlciBjYW5ub3QgYmUgdXNlZCBpbiBhIG5vbi1icm93c2VyIGVudmlyb25tZW50XCIpO1xuXHR9XG5cblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0b3B0aW9ucy5hdHRycyA9IHR5cGVvZiBvcHRpb25zLmF0dHJzID09PSBcIm9iamVjdFwiID8gb3B0aW9ucy5hdHRycyA6IHt9O1xuXG5cdC8vIEZvcmNlIHNpbmdsZS10YWcgc29sdXRpb24gb24gSUU2LTksIHdoaWNoIGhhcyBhIGhhcmQgbGltaXQgb24gdGhlICMgb2YgPHN0eWxlPlxuXHQvLyB0YWdzIGl0IHdpbGwgYWxsb3cgb24gYSBwYWdlXG5cdGlmICghb3B0aW9ucy5zaW5nbGV0b24pIG9wdGlvbnMuc2luZ2xldG9uID0gaXNPbGRJRSgpO1xuXG5cdC8vIEJ5IGRlZmF1bHQsIGFkZCA8c3R5bGU+IHRhZ3MgdG8gdGhlIDxoZWFkPiBlbGVtZW50XG5cdGlmICghb3B0aW9ucy5pbnNlcnRJbnRvKSBvcHRpb25zLmluc2VydEludG8gPSBcImhlYWRcIjtcblxuXHQvLyBCeSBkZWZhdWx0LCBhZGQgPHN0eWxlPiB0YWdzIHRvIHRoZSBib3R0b20gb2YgdGhlIHRhcmdldFxuXHRpZiAoIW9wdGlvbnMuaW5zZXJ0QXQpIG9wdGlvbnMuaW5zZXJ0QXQgPSBcImJvdHRvbVwiO1xuXG5cdHZhciBzdHlsZXMgPSBsaXN0VG9TdHlsZXMobGlzdCwgb3B0aW9ucyk7XG5cblx0YWRkU3R5bGVzVG9Eb20oc3R5bGVzLCBvcHRpb25zKTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gdXBkYXRlIChuZXdMaXN0KSB7XG5cdFx0dmFyIG1heVJlbW92ZSA9IFtdO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBpdGVtID0gc3R5bGVzW2ldO1xuXHRcdFx0dmFyIGRvbVN0eWxlID0gc3R5bGVzSW5Eb21baXRlbS5pZF07XG5cblx0XHRcdGRvbVN0eWxlLnJlZnMtLTtcblx0XHRcdG1heVJlbW92ZS5wdXNoKGRvbVN0eWxlKTtcblx0XHR9XG5cblx0XHRpZihuZXdMaXN0KSB7XG5cdFx0XHR2YXIgbmV3U3R5bGVzID0gbGlzdFRvU3R5bGVzKG5ld0xpc3QsIG9wdGlvbnMpO1xuXHRcdFx0YWRkU3R5bGVzVG9Eb20obmV3U3R5bGVzLCBvcHRpb25zKTtcblx0XHR9XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1heVJlbW92ZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGRvbVN0eWxlID0gbWF5UmVtb3ZlW2ldO1xuXG5cdFx0XHRpZihkb21TdHlsZS5yZWZzID09PSAwKSB7XG5cdFx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgZG9tU3R5bGUucGFydHMubGVuZ3RoOyBqKyspIGRvbVN0eWxlLnBhcnRzW2pdKCk7XG5cblx0XHRcdFx0ZGVsZXRlIHN0eWxlc0luRG9tW2RvbVN0eWxlLmlkXTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG59O1xuXG5mdW5jdGlvbiBhZGRTdHlsZXNUb0RvbSAoc3R5bGVzLCBvcHRpb25zKSB7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGl0ZW0gPSBzdHlsZXNbaV07XG5cdFx0dmFyIGRvbVN0eWxlID0gc3R5bGVzSW5Eb21baXRlbS5pZF07XG5cblx0XHRpZihkb21TdHlsZSkge1xuXHRcdFx0ZG9tU3R5bGUucmVmcysrO1xuXG5cdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgZG9tU3R5bGUucGFydHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0ZG9tU3R5bGUucGFydHNbal0oaXRlbS5wYXJ0c1tqXSk7XG5cdFx0XHR9XG5cblx0XHRcdGZvcig7IGogPCBpdGVtLnBhcnRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGRvbVN0eWxlLnBhcnRzLnB1c2goYWRkU3R5bGUoaXRlbS5wYXJ0c1tqXSwgb3B0aW9ucykpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgcGFydHMgPSBbXTtcblxuXHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IGl0ZW0ucGFydHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0cGFydHMucHVzaChhZGRTdHlsZShpdGVtLnBhcnRzW2pdLCBvcHRpb25zKSk7XG5cdFx0XHR9XG5cblx0XHRcdHN0eWxlc0luRG9tW2l0ZW0uaWRdID0ge2lkOiBpdGVtLmlkLCByZWZzOiAxLCBwYXJ0czogcGFydHN9O1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBsaXN0VG9TdHlsZXMgKGxpc3QsIG9wdGlvbnMpIHtcblx0dmFyIHN0eWxlcyA9IFtdO1xuXHR2YXIgbmV3U3R5bGVzID0ge307XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGl0ZW0gPSBsaXN0W2ldO1xuXHRcdHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuXHRcdHZhciBjc3MgPSBpdGVtWzFdO1xuXHRcdHZhciBtZWRpYSA9IGl0ZW1bMl07XG5cdFx0dmFyIHNvdXJjZU1hcCA9IGl0ZW1bM107XG5cdFx0dmFyIHBhcnQgPSB7Y3NzOiBjc3MsIG1lZGlhOiBtZWRpYSwgc291cmNlTWFwOiBzb3VyY2VNYXB9O1xuXG5cdFx0aWYoIW5ld1N0eWxlc1tpZF0pIHN0eWxlcy5wdXNoKG5ld1N0eWxlc1tpZF0gPSB7aWQ6IGlkLCBwYXJ0czogW3BhcnRdfSk7XG5cdFx0ZWxzZSBuZXdTdHlsZXNbaWRdLnBhcnRzLnB1c2gocGFydCk7XG5cdH1cblxuXHRyZXR1cm4gc3R5bGVzO1xufVxuXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQgKG9wdGlvbnMsIHN0eWxlKSB7XG5cdHZhciB0YXJnZXQgPSBnZXRFbGVtZW50KG9wdGlvbnMuaW5zZXJ0SW50bylcblxuXHRpZiAoIXRhcmdldCkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0SW50bycgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuXHR9XG5cblx0dmFyIGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wID0gc3R5bGVzSW5zZXJ0ZWRBdFRvcFtzdHlsZXNJbnNlcnRlZEF0VG9wLmxlbmd0aCAtIDFdO1xuXG5cdGlmIChvcHRpb25zLmluc2VydEF0ID09PSBcInRvcFwiKSB7XG5cdFx0aWYgKCFsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcCkge1xuXHRcdFx0dGFyZ2V0Lmluc2VydEJlZm9yZShzdHlsZSwgdGFyZ2V0LmZpcnN0Q2hpbGQpO1xuXHRcdH0gZWxzZSBpZiAobGFzdFN0eWxlRWxlbWVudEluc2VydGVkQXRUb3AubmV4dFNpYmxpbmcpIHtcblx0XHRcdHRhcmdldC5pbnNlcnRCZWZvcmUoc3R5bGUsIGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wLm5leHRTaWJsaW5nKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcblx0XHR9XG5cdFx0c3R5bGVzSW5zZXJ0ZWRBdFRvcC5wdXNoKHN0eWxlKTtcblx0fSBlbHNlIGlmIChvcHRpb25zLmluc2VydEF0ID09PSBcImJvdHRvbVwiKSB7XG5cdFx0dGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcblx0fSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJvYmplY3RcIiAmJiBvcHRpb25zLmluc2VydEF0LmJlZm9yZSkge1xuXHRcdHZhciBuZXh0U2libGluZyA9IGdldEVsZW1lbnQob3B0aW9ucy5pbnNlcnRJbnRvICsgXCIgXCIgKyBvcHRpb25zLmluc2VydEF0LmJlZm9yZSk7XG5cdFx0dGFyZ2V0Lmluc2VydEJlZm9yZShzdHlsZSwgbmV4dFNpYmxpbmcpO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIltTdHlsZSBMb2FkZXJdXFxuXFxuIEludmFsaWQgdmFsdWUgZm9yIHBhcmFtZXRlciAnaW5zZXJ0QXQnICgnb3B0aW9ucy5pbnNlcnRBdCcpIGZvdW5kLlxcbiBNdXN0IGJlICd0b3AnLCAnYm90dG9tJywgb3IgT2JqZWN0LlxcbiAoaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2stY29udHJpYi9zdHlsZS1sb2FkZXIjaW5zZXJ0YXQpXFxuXCIpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudCAoc3R5bGUpIHtcblx0aWYgKHN0eWxlLnBhcmVudE5vZGUgPT09IG51bGwpIHJldHVybiBmYWxzZTtcblx0c3R5bGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZSk7XG5cblx0dmFyIGlkeCA9IHN0eWxlc0luc2VydGVkQXRUb3AuaW5kZXhPZihzdHlsZSk7XG5cdGlmKGlkeCA+PSAwKSB7XG5cdFx0c3R5bGVzSW5zZXJ0ZWRBdFRvcC5zcGxpY2UoaWR4LCAxKTtcblx0fVxufVxuXG5mdW5jdGlvbiBjcmVhdGVTdHlsZUVsZW1lbnQgKG9wdGlvbnMpIHtcblx0dmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuXG5cdG9wdGlvbnMuYXR0cnMudHlwZSA9IFwidGV4dC9jc3NcIjtcblxuXHRhZGRBdHRycyhzdHlsZSwgb3B0aW9ucy5hdHRycyk7XG5cdGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zLCBzdHlsZSk7XG5cblx0cmV0dXJuIHN0eWxlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVMaW5rRWxlbWVudCAob3B0aW9ucykge1xuXHR2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaW5rXCIpO1xuXG5cdG9wdGlvbnMuYXR0cnMudHlwZSA9IFwidGV4dC9jc3NcIjtcblx0b3B0aW9ucy5hdHRycy5yZWwgPSBcInN0eWxlc2hlZXRcIjtcblxuXHRhZGRBdHRycyhsaW5rLCBvcHRpb25zLmF0dHJzKTtcblx0aW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMsIGxpbmspO1xuXG5cdHJldHVybiBsaW5rO1xufVxuXG5mdW5jdGlvbiBhZGRBdHRycyAoZWwsIGF0dHJzKSB7XG5cdE9iamVjdC5rZXlzKGF0dHJzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRlbC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGFkZFN0eWxlIChvYmosIG9wdGlvbnMpIHtcblx0dmFyIHN0eWxlLCB1cGRhdGUsIHJlbW92ZSwgcmVzdWx0O1xuXG5cdC8vIElmIGEgdHJhbnNmb3JtIGZ1bmN0aW9uIHdhcyBkZWZpbmVkLCBydW4gaXQgb24gdGhlIGNzc1xuXHRpZiAob3B0aW9ucy50cmFuc2Zvcm0gJiYgb2JqLmNzcykge1xuXHQgICAgcmVzdWx0ID0gb3B0aW9ucy50cmFuc2Zvcm0ob2JqLmNzcyk7XG5cblx0ICAgIGlmIChyZXN1bHQpIHtcblx0ICAgIFx0Ly8gSWYgdHJhbnNmb3JtIHJldHVybnMgYSB2YWx1ZSwgdXNlIHRoYXQgaW5zdGVhZCBvZiB0aGUgb3JpZ2luYWwgY3NzLlxuXHQgICAgXHQvLyBUaGlzIGFsbG93cyBydW5uaW5nIHJ1bnRpbWUgdHJhbnNmb3JtYXRpb25zIG9uIHRoZSBjc3MuXG5cdCAgICBcdG9iai5jc3MgPSByZXN1bHQ7XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgXHQvLyBJZiB0aGUgdHJhbnNmb3JtIGZ1bmN0aW9uIHJldHVybnMgYSBmYWxzeSB2YWx1ZSwgZG9uJ3QgYWRkIHRoaXMgY3NzLlxuXHQgICAgXHQvLyBUaGlzIGFsbG93cyBjb25kaXRpb25hbCBsb2FkaW5nIG9mIGNzc1xuXHQgICAgXHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdCAgICBcdFx0Ly8gbm9vcFxuXHQgICAgXHR9O1xuXHQgICAgfVxuXHR9XG5cblx0aWYgKG9wdGlvbnMuc2luZ2xldG9uKSB7XG5cdFx0dmFyIHN0eWxlSW5kZXggPSBzaW5nbGV0b25Db3VudGVyKys7XG5cblx0XHRzdHlsZSA9IHNpbmdsZXRvbiB8fCAoc2luZ2xldG9uID0gY3JlYXRlU3R5bGVFbGVtZW50KG9wdGlvbnMpKTtcblxuXHRcdHVwZGF0ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZSwgc3R5bGVJbmRleCwgZmFsc2UpO1xuXHRcdHJlbW92ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZSwgc3R5bGVJbmRleCwgdHJ1ZSk7XG5cblx0fSBlbHNlIGlmIChcblx0XHRvYmouc291cmNlTWFwICYmXG5cdFx0dHlwZW9mIFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIFVSTC5jcmVhdGVPYmplY3RVUkwgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBVUkwucmV2b2tlT2JqZWN0VVJMID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgQmxvYiA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIlxuXHQpIHtcblx0XHRzdHlsZSA9IGNyZWF0ZUxpbmtFbGVtZW50KG9wdGlvbnMpO1xuXHRcdHVwZGF0ZSA9IHVwZGF0ZUxpbmsuYmluZChudWxsLCBzdHlsZSwgb3B0aW9ucyk7XG5cdFx0cmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlKTtcblxuXHRcdFx0aWYoc3R5bGUuaHJlZikgVVJMLnJldm9rZU9iamVjdFVSTChzdHlsZS5ocmVmKTtcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdHN0eWxlID0gY3JlYXRlU3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuXHRcdHVwZGF0ZSA9IGFwcGx5VG9UYWcuYmluZChudWxsLCBzdHlsZSk7XG5cdFx0cmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlKTtcblx0XHR9O1xuXHR9XG5cblx0dXBkYXRlKG9iaik7XG5cblx0cmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZVN0eWxlIChuZXdPYmopIHtcblx0XHRpZiAobmV3T2JqKSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdG5ld09iai5jc3MgPT09IG9iai5jc3MgJiZcblx0XHRcdFx0bmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiZcblx0XHRcdFx0bmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcFxuXHRcdFx0KSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0dXBkYXRlKG9iaiA9IG5ld09iaik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlbW92ZSgpO1xuXHRcdH1cblx0fTtcbn1cblxudmFyIHJlcGxhY2VUZXh0ID0gKGZ1bmN0aW9uICgpIHtcblx0dmFyIHRleHRTdG9yZSA9IFtdO1xuXG5cdHJldHVybiBmdW5jdGlvbiAoaW5kZXgsIHJlcGxhY2VtZW50KSB7XG5cdFx0dGV4dFN0b3JlW2luZGV4XSA9IHJlcGxhY2VtZW50O1xuXG5cdFx0cmV0dXJuIHRleHRTdG9yZS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuJyk7XG5cdH07XG59KSgpO1xuXG5mdW5jdGlvbiBhcHBseVRvU2luZ2xldG9uVGFnIChzdHlsZSwgaW5kZXgsIHJlbW92ZSwgb2JqKSB7XG5cdHZhciBjc3MgPSByZW1vdmUgPyBcIlwiIDogb2JqLmNzcztcblxuXHRpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuXHRcdHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHJlcGxhY2VUZXh0KGluZGV4LCBjc3MpO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBjc3NOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKTtcblx0XHR2YXIgY2hpbGROb2RlcyA9IHN0eWxlLmNoaWxkTm9kZXM7XG5cblx0XHRpZiAoY2hpbGROb2Rlc1tpbmRleF0pIHN0eWxlLnJlbW92ZUNoaWxkKGNoaWxkTm9kZXNbaW5kZXhdKTtcblxuXHRcdGlmIChjaGlsZE5vZGVzLmxlbmd0aCkge1xuXHRcdFx0c3R5bGUuaW5zZXJ0QmVmb3JlKGNzc05vZGUsIGNoaWxkTm9kZXNbaW5kZXhdKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c3R5bGUuYXBwZW5kQ2hpbGQoY3NzTm9kZSk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGFwcGx5VG9UYWcgKHN0eWxlLCBvYmopIHtcblx0dmFyIGNzcyA9IG9iai5jc3M7XG5cdHZhciBtZWRpYSA9IG9iai5tZWRpYTtcblxuXHRpZihtZWRpYSkge1xuXHRcdHN0eWxlLnNldEF0dHJpYnV0ZShcIm1lZGlhXCIsIG1lZGlhKVxuXHR9XG5cblx0aWYoc3R5bGUuc3R5bGVTaGVldCkge1xuXHRcdHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcblx0fSBlbHNlIHtcblx0XHR3aGlsZShzdHlsZS5maXJzdENoaWxkKSB7XG5cdFx0XHRzdHlsZS5yZW1vdmVDaGlsZChzdHlsZS5maXJzdENoaWxkKTtcblx0XHR9XG5cblx0XHRzdHlsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcblx0fVxufVxuXG5mdW5jdGlvbiB1cGRhdGVMaW5rIChsaW5rLCBvcHRpb25zLCBvYmopIHtcblx0dmFyIGNzcyA9IG9iai5jc3M7XG5cdHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuXG5cdC8qXG5cdFx0SWYgY29udmVydFRvQWJzb2x1dGVVcmxzIGlzbid0IGRlZmluZWQsIGJ1dCBzb3VyY2VtYXBzIGFyZSBlbmFibGVkXG5cdFx0YW5kIHRoZXJlIGlzIG5vIHB1YmxpY1BhdGggZGVmaW5lZCB0aGVuIGxldHMgdHVybiBjb252ZXJ0VG9BYnNvbHV0ZVVybHNcblx0XHRvbiBieSBkZWZhdWx0LiAgT3RoZXJ3aXNlIGRlZmF1bHQgdG8gdGhlIGNvbnZlcnRUb0Fic29sdXRlVXJscyBvcHRpb25cblx0XHRkaXJlY3RseVxuXHQqL1xuXHR2YXIgYXV0b0ZpeFVybHMgPSBvcHRpb25zLmNvbnZlcnRUb0Fic29sdXRlVXJscyA9PT0gdW5kZWZpbmVkICYmIHNvdXJjZU1hcDtcblxuXHRpZiAob3B0aW9ucy5jb252ZXJ0VG9BYnNvbHV0ZVVybHMgfHwgYXV0b0ZpeFVybHMpIHtcblx0XHRjc3MgPSBmaXhVcmxzKGNzcyk7XG5cdH1cblxuXHRpZiAoc291cmNlTWFwKSB7XG5cdFx0Ly8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjY2MDM4NzVcblx0XHRjc3MgKz0gXCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiICsgYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSArIFwiICovXCI7XG5cdH1cblxuXHR2YXIgYmxvYiA9IG5ldyBCbG9iKFtjc3NdLCB7IHR5cGU6IFwidGV4dC9jc3NcIiB9KTtcblxuXHR2YXIgb2xkU3JjID0gbGluay5ocmVmO1xuXG5cdGxpbmsuaHJlZiA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG5cblx0aWYob2xkU3JjKSBVUkwucmV2b2tlT2JqZWN0VVJMKG9sZFNyYyk7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL2FkZFN0eWxlcy5qc1xuLy8gbW9kdWxlIGlkID0gNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcbmltcG9ydCBzdGF0ZSBmcm9tICcuL3N0YXRlJztcbmltcG9ydCB7IHJldmVyc2VHZW9jb2RlIH0gZnJvbSAnLi9nZW9jb2Rlcic7XG5cbi8qKlxuICogRmV0Y2ggdGhlIHVzZXIncyBhZGRyZXNzIGJhc2VkIG9uIHRoZSBsYXQvbG5nXG4gKiBAcGFyYW0gY2FsbGJhY2s6IChlcnIsIGdlb0RhdGEsIGFkZHJTdHJpbmcpXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHVzZXJSZXZlcnNlR2VvY29kZShjYWxsYmFjayA9ICgpID0+IHt9KSB7XG4gIGlmICghc3RhdGUudXNlci5sYXRpdHVkZSB8fCAhc3RhdGUudXNlci5sb25naXR1ZGUpIHJldHVybjsgLy8gbm90aGluZyB0byBkb1xuXG4gIHJldmVyc2VHZW9jb2RlKHN0YXRlLnVzZXIubGF0aXR1ZGUsIHN0YXRlLnVzZXIubG9uZ2l0dWRlLCAoZXJyLCBnZW9EYXRhKSA9PiB7XG4gICAgY29uc3QgZCA9IGdlb0RhdGE7XG4gICAgaWYgKFxuICAgICAgZC50eXBlID09PSAnRmVhdHVyZUNvbGxlY3Rpb24nICYmXG4gICAgICBkLmZlYXR1cmVzICYmIGQuZmVhdHVyZXMubGVuZ3RoID4gMCAmJlxuICAgICAgZC5mZWF0dXJlc1swXS5wbGFjZV9uYW1lXG4gICAgKSB7XG4gICAgICBzdGF0ZS51c2VyLmFkZHJlc3MgPSBkLmZlYXR1cmVzWzBdLnBsYWNlX25hbWU7XG4gICAgfVxuICAgIC8vIGNvbnNvbGUubG9nKCdmZXRjaGVkIHJldmVyc2UgZ2VvY29kZXIgcmVzcG9uc2UgZm9yIGNvb3JkczonLCBnZW9EYXRhKTtcbiAgICBjYWxsYmFjayhlcnIsIGdlb0RhdGEsIHN0YXRlLnVzZXIuYWRkcmVzcyk7XG4gIH0pO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3VzZXJSZXZlcnNlR2VvY29kZS5qcyIsImltcG9ydCAnLi9zdHlsZS5jc3MnO1xuaW1wb3J0ICcuL3ZlbmRvci9ub3Vpc2xpZGVyLm1pbi5jc3MnO1xuaW1wb3J0ICcuL2Zhdmljb24uaWNvJztcblxuaW1wb3J0IGluaXREaXJlY3Rpb25zQ29udHJvbHMgZnJvbSAnLi9kaXJlY3Rpb25zQ29udHJvbHMnO1xuaW1wb3J0IGluaXRNYXAgZnJvbSAnLi9tYXAnO1xuaW1wb3J0IHsgc2V0R2VvY29kZXJCb3VuZHMsIHNldEdlb2NkZXJDZW50ZXIgfSBmcm9tICcuL2dlb2NvZGVyJztcbmltcG9ydCBzdGF0ZSBmcm9tICcuL3N0YXRlJztcblxud2luZG93LmFwcFN0YXRlID0gc3RhdGU7IC8vIFhYWCBmb3IgY29uc29sZSBkZWJ1Z2dpbmcuXG5cbi8qIEluaXRpYWxpemF0aW9uICoqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5mdW5jdGlvbiBpbml0UGFnZShsbmdMYXQsIHpvb20pIHtcbiAgY29uc3QgZG9Jbml0ID0gKCkgPT4ge1xuICAgIGluaXRNYXAobG5nTGF0LCB6b29tKTtcbiAgICBpbml0RGlyZWN0aW9uc0NvbnRyb2xzKCk7XG4gIH07XG5cbiAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScgfHwgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2xvYWRlZCcpIHtcbiAgICAvLyBkb2N1bWVudCBpcyBhbHJlYWR5IHJlYWR5IHRvIGdvXG4gICAgZG9Jbml0KCk7XG4gIH0gZWxzZSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCdsb2FkaW5nIHBhZ2UnKTtcbiAgICAgIGRvSW5pdCgpO1xuICAgIH0sIGZhbHNlKTtcbiAgfVxufVxuXG4oZnVuY3Rpb24gaW5pdCgpIHtcbiAgY29uc29sZS5sb2coJ2luaXRpYWxpemluZyBhcHAnKTtcbiAgLy8gRmFsbGJhY2sgbG9jYXRpb246IGNlbnRlciBvZiBiYXkgYXJlYVxuICBsZXQgbGF0ID0gMzcuNjExO1xuICBsZXQgbG9uID0gLTEyMS43NTM7XG4gIGxldCB6b29tID0gODtcbiAgc2V0R2VvY2RlckNlbnRlcihbbG9uLCBsYXRdKTtcbiAgc2V0R2VvY29kZXJCb3VuZHMoJy0xMjMuNTMzNywzNi44OTMxLC0xMjEuMjA4MiwzOC44NjQzJyk7XG5cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tZXh0ZW5kLW5hdGl2ZVxuICBOdW1iZXIucHJvdG90eXBlLmJldHdlZW4gPSAobWluLCBtYXgpID0+IHRoaXMgPiBtaW4gJiYgdGhpcyA8IG1heDtcblxuICAvLyBHcmFiIElQIGxvY2F0aW9uIGZyb20gZnJlZWdlb2lwIEFQSVxuICBjb25zdCBnZW9Mb2NhdGlvblByb3ZpZGVyVVJMID0gJ2h0dHBzOi8vZnJlZWdlb2lwLm5ldC9qc29uLyc7XG4gIGZldGNoKGdlb0xvY2F0aW9uUHJvdmlkZXJVUkwpXG4gICAgLnRoZW4ocmVzcCA9PiByZXNwLmpzb24oKSlcbiAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgLy8gQmVjYXVzZSB0aGlzIGJpa2Ugc2hhcmUgb25seSBvcGVyYXRlcyBpbiB0aGUgU0YgYmF5IGFyZWEsIHdlXG4gICAgICAvLyBqdW1wIHRvIHRoZSB1c2VyJ3Mgc3BlY2lmaWMgbG9jYXRpb24gb25seSBpZiB0aGV5J3JlIGluc2lkZSBhXG4gICAgICAvLyBiYXktY2VudGVyZWQgYm91bmRpbmcgYXJlYS5cbiAgICAgIGlmICgoZGF0YS5sb25naXR1ZGUpLmJldHdlZW4oLTEyNCwgLTEyMSkgJiYgKGRhdGEubGF0aXR1ZGUpLmJldHdlZW4oMzYuNSwgMzguNCkpIHtcbiAgICAgICAgbGF0ID0gZGF0YS5sYXRpdHVkZTtcbiAgICAgICAgbG9uID0gZGF0YS5sb25naXR1ZGU7XG4gICAgICAgIHpvb20gPSAxMTsgLy8gem9vbSBtb3JlIHRoYW4gZGVmYXVsdCBzaW5jZSB3ZSBrbm93IGV4YWN0IGxvY2F0aW9uXG4gICAgICB9XG4gICAgICBpbml0UGFnZShbbG9uLCBsYXRdLCB6b29tKTtcbiAgICB9KVxuICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGBFcnJvciBmZXRjaGluZyBsb2NhdGlvbiBkYXRhOiAke2Vycm9yfWApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICBpZiAoZXJyb3IgPT09ICdFcnJvcjogQ29vcmRpbmF0ZXMgbXVzdCBjb250YWluIG51bWJlcnMnKSB7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5pdFBhZ2UoW2xvbiwgbGF0XSk7IC8vIGdvIGZvciBpdCBhbnl3YXksIHVzaW5nIGRlZmF1bHRzXG4gICAgICB9XG4gICAgfSk7XG59KCkpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2luZGV4LmpzIiwiLy8gc3R5bGUtbG9hZGVyOiBBZGRzIHNvbWUgY3NzIHRvIHRoZSBET00gYnkgYWRkaW5nIGEgPHN0eWxlPiB0YWdcblxuLy8gbG9hZCB0aGUgc3R5bGVzXG52YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vc3R5bGUuY3NzXCIpO1xuaWYodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSBjb250ZW50ID0gW1ttb2R1bGUuaWQsIGNvbnRlbnQsICcnXV07XG4vLyBQcmVwYXJlIGNzc1RyYW5zZm9ybWF0aW9uXG52YXIgdHJhbnNmb3JtO1xuXG52YXIgb3B0aW9ucyA9IHtcImhtclwiOnRydWV9XG5vcHRpb25zLnRyYW5zZm9ybSA9IHRyYW5zZm9ybVxuLy8gYWRkIHRoZSBzdHlsZXMgdG8gdGhlIERPTVxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9saWIvYWRkU3R5bGVzLmpzXCIpKGNvbnRlbnQsIG9wdGlvbnMpO1xuaWYoY29udGVudC5sb2NhbHMpIG1vZHVsZS5leHBvcnRzID0gY29udGVudC5sb2NhbHM7XG4vLyBIb3QgTW9kdWxlIFJlcGxhY2VtZW50XG5pZihtb2R1bGUuaG90KSB7XG5cdC8vIFdoZW4gdGhlIHN0eWxlcyBjaGFuZ2UsIHVwZGF0ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdGlmKCFjb250ZW50LmxvY2Fscykge1xuXHRcdG1vZHVsZS5ob3QuYWNjZXB0KFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL3N0eWxlLmNzc1wiLCBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBuZXdDb250ZW50ID0gcmVxdWlyZShcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9zdHlsZS5jc3NcIik7XG5cdFx0XHRpZih0eXBlb2YgbmV3Q29udGVudCA9PT0gJ3N0cmluZycpIG5ld0NvbnRlbnQgPSBbW21vZHVsZS5pZCwgbmV3Q29udGVudCwgJyddXTtcblx0XHRcdHVwZGF0ZShuZXdDb250ZW50KTtcblx0XHR9KTtcblx0fVxuXHQvLyBXaGVuIHRoZSBtb2R1bGUgaXMgZGlzcG9zZWQsIHJlbW92ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbigpIHsgdXBkYXRlKCk7IH0pO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3N0eWxlLmNzc1xuLy8gbW9kdWxlIGlkID0gOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXCIpKHVuZGVmaW5lZCk7XG4vLyBpbXBvcnRzXG5cblxuLy8gbW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCJjYW52YXMubWFwYm94Z2wtY2FudmFzIHtcXG4gIGJhY2tncm91bmQ6IGxpZ2h0Z3JheTtcXG59XFxuXFxuLm1hcmtlciB7XFxuICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCIgKyByZXF1aXJlKFwiLi9ub3VuXzgwMDYwMC5wbmdcIikgKyBcIik7XFxuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xcbiAgd2lkdGg6IDUwcHg7XFxuICBoZWlnaHQ6IDUwcHg7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcblxcbi5tYXAtbWFya2VyLWRpcmVjdGlvbnMge1xcbiAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gIGJhY2tncm91bmQtcG9zaXRpb246IGNlbnRlcjtcXG4gIGJhY2tncm91bmQtc2l6ZTogMTJweDtcXG4gIHdpZHRoOiAyMHB4O1xcbn1cXG5cXG4ubWFwLW1hcmtlci1kaXJlY3Rpb25zLmlzLW9yaWdpbiB7XFxuICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCIgKyByZXF1aXJlKFwiLi9tYXAtZG90LW9yaWdpbi5zdmdcIikgKyBcIik7XFxufVxcbi5tYXAtbWFya2VyLWRpcmVjdGlvbnMuaXMtZGVzdGluYXRpb24ge1xcbiAgYmFja2dyb3VuZC1pbWFnZTogdXJsKFwiICsgcmVxdWlyZShcIi4vbWFwLWRvdC1kZXN0aW5hdGlvbi5zdmdcIikgKyBcIik7XFxufVxcblxcblxcblxcbi8qKioqKioqKioqIERpcmVjdGlvbnMgSW5wdXQgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cXG5cXG4uZGlyZWN0aW9ucyB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBtYXJnaW46IDFlbTtcXG4gIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC44NSk7XFxufVxcblxcbi5kaXJlY3Rpb25zLS1jb250ZW50IHtcXG4gIHBhZGRpbmc6IDFlbTtcXG59XFxuXFxuLmRpcmVjdGlvbnMtLXRvZ2dsZS1idXR0b24ge1xcbiAgYmFja2dyb3VuZDogIzRBQjJGNztcXG4gIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiBjZW50ZXI7XFxuICBiYWNrZ3JvdW5kLXNpemU6IDYwcHg7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcblxcbi5kaXJlY3Rpb25zLS10b2dnbGUtYnV0dG9uLnNob3duIHtcXG4gIGJhY2tncm91bmQtaW1hZ2U6IHVybChcIiArIHJlcXVpcmUoXCIuL2RpcmVjdGlvbnMtdXAuc3ZnXCIpICsgXCIpO1xcbn1cXG4uZGlyZWN0aW9ucy0tdG9nZ2xlLWJ1dHRvbi5oaWRkZW4ge1xcbiAgYmFja2dyb3VuZC1pbWFnZTogdXJsKFwiICsgcmVxdWlyZShcIi4vZGlyZWN0aW9ucy1kb3duLnN2Z1wiKSArIFwiKTtcXG59XFxuXFxuLmRpcmVjdGlvbnMtLXRvZ2dsZS1idXR0b24ge1xcbiAgaGVpZ2h0OiAyZW07XFxufVxcblxcbiNkaXJlY3Rpb25zLS1kaXN0YW5jZS1yYW5nZSB7XFxuICAvKiB3aWR0aDogMTU3cHg7ICovXFxuICB3aWR0aDogMTAwJTtcXG59XFxuXFxuLmRpcmVjdGlvbnMtLWRpc3RhbmNlLXBpY2tlciB7XFxuICBtYXJnaW4tYm90dG9tOiAyZW07XFxuICBwYWRkaW5nOiAwLjVlbTtcXG59XFxuXFxuI2RpcmVjdGlvbnMtLWRpc3RhbmNlLXJhbmdlIC5ub1VpLWNvbm5lY3Qge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDIyMiwgMjI0LCAyMjQpO1xcbiAgYm94LXNoYWRvdzogaW5zZXQgMCAwIDFweCByZ2JhKDUxLDUxLDUxLC4yKTtcXG59XFxuXFxuLm5vVWktcGlwcy5ub1VpLXBpcHMtaG9yaXpvbnRhbCB7XFxuICBoZWlnaHQ6IDUwcHg7IC8qIHdhcyA4MCB3aGljaCBhdGUgaW50byBidXR0b24gYmVsb3cgKi9cXG59XFxuXFxuLmRpcmVjdGlvbnMtLWxvY2F0ZS1vcmlnaW4uY29sdW1uIHtcXG4gIHBhZGRpbmctbGVmdDogMDtcXG59XFxuXFxuLmRpcmVjdGlvbnMtLWxvY2F0ZS1vcmlnaW4gYnV0dG9ue1xcbiAgYmFja2dyb3VuZC1pbWFnZTogdXJsKFwiICsgcmVxdWlyZShcIi4vbG9jYXRlLXBlcnNvbi5zdmdcIikgKyBcIik7XFxuICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgYmFja2dyb3VuZC1wb3NpdGlvbjogY2VudGVyO1xcbiAgYmFja2dyb3VuZC1zaXplOiAyMHB4O1xcbiAgd2lkdGg6IDM4cHg7XFxufVxcblxcbi8qIC5kaXJlY3Rpb25zLS1sb2NhdGUtb3JpZ2luIGJ1dHRvbi5pcy1saWdodDpob3ZlciB7XFxuICBib3JkZXItY29sb3I6IGJsYWNrO1xcbn0gKi9cXG5cXG5cXG5AbWVkaWEgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA3ODBweCkge1xcbiAgLmRpcmVjdGlvbnMge1xcbiAgICBtYXJnaW46IDA7XFxuICB9XFxufVxcblxcblxcbi8qKioqKioqKioqIERpcmVjdGlvbnMgQXV0b2NvbXBsZXRlICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXFxuXFxuLmF1dG9jb21wbGV0ZSB7XFxuICBiYWNrZ3JvdW5kOiB3aGl0ZTtcXG4gIHotaW5kZXg6IDEwMDtcXG4gIGJvcmRlcjogMXB4IHNvbGlkICNlNGUyZTI7XFxufVxcblxcbi5hdXRvY29tcGxldGUgZGl2IHtcXG4gIGJvcmRlci10b3A6IDFweCBzb2xpZCAjYWRhZGFkO1xcbiAgcGFkZGluZzogMWVtO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG5cXG4uYXV0b2NvbXBsZXRlIGRpdjpob3ZlciwgLmF1dG9jb21wbGV0ZSBkaXY6Zm9jdXMge1xcbiAgYmFja2dyb3VuZDogcmdiKDIwMiwgMjA2LCAyMjcpO1xcbn1cXG5cXG5cXG4vKioqKioqKioqKiBTdGF0aW9uIFBvcHVwICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXFxuXFxuLnN0YXRpb24tcG9wdXAtLWNvbnRhaW5lciAubWFwYm94Z2wtcG9wdXAtY29udGVudCB7XFxuICBwYWRkaW5nLWJvdHRvbTogNnB4O1xcbn1cXG5cXG4uc3RhdGlvbi1wb3B1cCB7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxufVxcblxcbi5zdGF0aW9uLXBvcHVwIGgzIHtcXG4gIG1hcmdpbi1ib3R0b206IDFlbTtcXG59XFxuXFxuLyogZGl2LnN0YXRpb24tcG9wdXAtLWRpcmVjdGlvbnMge1xcbn0gKi9cXG5cXG5kaXYuc3RhdGlvbi1wb3B1cC0tZGlyZWN0aW9ucyBhe1xcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbn1cXG5cXG4uc3RhdGlvbi1wb3B1cC0tY29vcmRpbmF0ZXMge1xcbiAgYm9yZGVyLXRvcDogMXB4IHNvbGlkIGxpZ2h0Z3JleTtcXG4gIHRleHQtYWxpZ246IHJpZ2h0O1xcbiAgcGFkZGluZy10b3A6IDAuNWVtO1xcbiAgbWFyZ2luLXRvcDogMC41ZW07XFxuXFxuICBmb250LXNpemU6IHNtYWxsZXI7XFxuICBjb2xvcjogbGlnaHRncmV5O1xcbn1cXG5cXG4uc3RhdGlvbi1wb3B1cC0tYmlrZXMtbnVtYmVyLCAuc3RhdGlvbi1wb3B1cC0tZG9ja3MtbnVtYmVyIHtcXG4gIGZvbnQtc2l6ZTogbGFyZ2U7XFxufVxcblxcbi8qIC5zdGF0aW9uLXBvcHVwLS1iaWtlcy10ZXh0LCAuc3RhdGlvbi1wb3B1cC0tZG9ja3MtdGV4dCB7XFxufSAqL1xcblxcbmRpdi5zdGF0aW9uLXBvcHVwLS1zdGF0cyB7XFxuICBtYXJnaW4tYm90dG9tOiAwICFpbXBvcnRhbnQ7XFxuICBmb250LXdlaWdodDogYm9sZDtcXG59XFxuXFxuLnN0YXRpb24tcG9wdXAtLWFsZXJ0IHtcXG4gIGZvbnQtd2VpZ2h0OiBib2xkO1xcbiAgZm9udC1zaXplOiBsYXJnZTtcXG4gIG1hcmdpbi1ib3R0b206IDFlbTtcXG59XFxuXCIsIFwiXCJdKTtcblxuLy8gZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlciEuL3NyYy9zdHlsZS5jc3Ncbi8vIG1vZHVsZSBpZCA9IDlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiZDA0OTIwM2JjNzQ2OTZkNTg3YTNjZGIxZDBhNjYxZDIucG5nXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvbm91bl84MDA2MDAucG5nXG4vLyBtb2R1bGUgaWQgPSAxMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCIyZjY3YmQxNGY5ODcyZGFmNzcxM2E1MmNlMmU0NWY5YS5zdmdcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9tYXAtZG90LW9yaWdpbi5zdmdcbi8vIG1vZHVsZSBpZCA9IDExXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcIjk5ZGE5YTExMThiOGU0MzIyNWQzZGE2ZmVlNjQ1YWQwLnN2Z1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL21hcC1kb3QtZGVzdGluYXRpb24uc3ZnXG4vLyBtb2R1bGUgaWQgPSAxMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCI5ZjhkODAxM2I5NWI0N2ZmMTZhMGJlZjYxNTgyOTM4My5zdmdcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9kaXJlY3Rpb25zLXVwLnN2Z1xuLy8gbW9kdWxlIGlkID0gMTNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiMWY3YzI5OTUwYWUxZDczM2YyY2ZkNDE3MDJmNDA5Yjkuc3ZnXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvZGlyZWN0aW9ucy1kb3duLnN2Z1xuLy8gbW9kdWxlIGlkID0gMTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiOTljNjg3OWIwMWZlN2ZiMjdmYjI2Y2YyYWZjNzM2MGQuc3ZnXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvbG9jYXRlLXBlcnNvbi5zdmdcbi8vIG1vZHVsZSBpZCA9IDE1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlxuLyoqXG4gKiBXaGVuIHNvdXJjZSBtYXBzIGFyZSBlbmFibGVkLCBgc3R5bGUtbG9hZGVyYCB1c2VzIGEgbGluayBlbGVtZW50IHdpdGggYSBkYXRhLXVyaSB0b1xuICogZW1iZWQgdGhlIGNzcyBvbiB0aGUgcGFnZS4gVGhpcyBicmVha3MgYWxsIHJlbGF0aXZlIHVybHMgYmVjYXVzZSBub3cgdGhleSBhcmUgcmVsYXRpdmUgdG8gYVxuICogYnVuZGxlIGluc3RlYWQgb2YgdGhlIGN1cnJlbnQgcGFnZS5cbiAqXG4gKiBPbmUgc29sdXRpb24gaXMgdG8gb25seSB1c2UgZnVsbCB1cmxzLCBidXQgdGhhdCBtYXkgYmUgaW1wb3NzaWJsZS5cbiAqXG4gKiBJbnN0ZWFkLCB0aGlzIGZ1bmN0aW9uIFwiZml4ZXNcIiB0aGUgcmVsYXRpdmUgdXJscyB0byBiZSBhYnNvbHV0ZSBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgcGFnZSBsb2NhdGlvbi5cbiAqXG4gKiBBIHJ1ZGltZW50YXJ5IHRlc3Qgc3VpdGUgaXMgbG9jYXRlZCBhdCBgdGVzdC9maXhVcmxzLmpzYCBhbmQgY2FuIGJlIHJ1biB2aWEgdGhlIGBucG0gdGVzdGAgY29tbWFuZC5cbiAqXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzKSB7XG4gIC8vIGdldCBjdXJyZW50IGxvY2F0aW9uXG4gIHZhciBsb2NhdGlvbiA9IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgd2luZG93LmxvY2F0aW9uO1xuXG4gIGlmICghbG9jYXRpb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJmaXhVcmxzIHJlcXVpcmVzIHdpbmRvdy5sb2NhdGlvblwiKTtcbiAgfVxuXG5cdC8vIGJsYW5rIG9yIG51bGw/XG5cdGlmICghY3NzIHx8IHR5cGVvZiBjc3MgIT09IFwic3RyaW5nXCIpIHtcblx0ICByZXR1cm4gY3NzO1xuICB9XG5cbiAgdmFyIGJhc2VVcmwgPSBsb2NhdGlvbi5wcm90b2NvbCArIFwiLy9cIiArIGxvY2F0aW9uLmhvc3Q7XG4gIHZhciBjdXJyZW50RGlyID0gYmFzZVVybCArIGxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL1xcL1teXFwvXSokLywgXCIvXCIpO1xuXG5cdC8vIGNvbnZlcnQgZWFjaCB1cmwoLi4uKVxuXHQvKlxuXHRUaGlzIHJlZ3VsYXIgZXhwcmVzc2lvbiBpcyBqdXN0IGEgd2F5IHRvIHJlY3Vyc2l2ZWx5IG1hdGNoIGJyYWNrZXRzIHdpdGhpblxuXHRhIHN0cmluZy5cblxuXHQgL3VybFxccypcXCggID0gTWF0Y2ggb24gdGhlIHdvcmQgXCJ1cmxcIiB3aXRoIGFueSB3aGl0ZXNwYWNlIGFmdGVyIGl0IGFuZCB0aGVuIGEgcGFyZW5zXG5cdCAgICggID0gU3RhcnQgYSBjYXB0dXJpbmcgZ3JvdXBcblx0ICAgICAoPzogID0gU3RhcnQgYSBub24tY2FwdHVyaW5nIGdyb3VwXG5cdCAgICAgICAgIFteKShdICA9IE1hdGNoIGFueXRoaW5nIHRoYXQgaXNuJ3QgYSBwYXJlbnRoZXNlc1xuXHQgICAgICAgICB8ICA9IE9SXG5cdCAgICAgICAgIFxcKCAgPSBNYXRjaCBhIHN0YXJ0IHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICAoPzogID0gU3RhcnQgYW5vdGhlciBub24tY2FwdHVyaW5nIGdyb3Vwc1xuXHQgICAgICAgICAgICAgICAgIFteKShdKyAgPSBNYXRjaCBhbnl0aGluZyB0aGF0IGlzbid0IGEgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICAgICB8ICA9IE9SXG5cdCAgICAgICAgICAgICAgICAgXFwoICA9IE1hdGNoIGEgc3RhcnQgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICAgICAgICAgW14pKF0qICA9IE1hdGNoIGFueXRoaW5nIHRoYXQgaXNuJ3QgYSBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgICAgIFxcKSAgPSBNYXRjaCBhIGVuZCBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgKSAgPSBFbmQgR3JvdXBcbiAgICAgICAgICAgICAgKlxcKSA9IE1hdGNoIGFueXRoaW5nIGFuZCB0aGVuIGEgY2xvc2UgcGFyZW5zXG4gICAgICAgICAgKSAgPSBDbG9zZSBub24tY2FwdHVyaW5nIGdyb3VwXG4gICAgICAgICAgKiAgPSBNYXRjaCBhbnl0aGluZ1xuICAgICAgICkgID0gQ2xvc2UgY2FwdHVyaW5nIGdyb3VwXG5cdCBcXCkgID0gTWF0Y2ggYSBjbG9zZSBwYXJlbnNcblxuXHQgL2dpICA9IEdldCBhbGwgbWF0Y2hlcywgbm90IHRoZSBmaXJzdC4gIEJlIGNhc2UgaW5zZW5zaXRpdmUuXG5cdCAqL1xuXHR2YXIgZml4ZWRDc3MgPSBjc3MucmVwbGFjZSgvdXJsXFxzKlxcKCgoPzpbXikoXXxcXCgoPzpbXikoXSt8XFwoW14pKF0qXFwpKSpcXCkpKilcXCkvZ2ksIGZ1bmN0aW9uKGZ1bGxNYXRjaCwgb3JpZ1VybCkge1xuXHRcdC8vIHN0cmlwIHF1b3RlcyAoaWYgdGhleSBleGlzdClcblx0XHR2YXIgdW5xdW90ZWRPcmlnVXJsID0gb3JpZ1VybFxuXHRcdFx0LnRyaW0oKVxuXHRcdFx0LnJlcGxhY2UoL15cIiguKilcIiQvLCBmdW5jdGlvbihvLCAkMSl7IHJldHVybiAkMTsgfSlcblx0XHRcdC5yZXBsYWNlKC9eJyguKiknJC8sIGZ1bmN0aW9uKG8sICQxKXsgcmV0dXJuICQxOyB9KTtcblxuXHRcdC8vIGFscmVhZHkgYSBmdWxsIHVybD8gbm8gY2hhbmdlXG5cdFx0aWYgKC9eKCN8ZGF0YTp8aHR0cDpcXC9cXC98aHR0cHM6XFwvXFwvfGZpbGU6XFwvXFwvXFwvKS9pLnRlc3QodW5xdW90ZWRPcmlnVXJsKSkge1xuXHRcdCAgcmV0dXJuIGZ1bGxNYXRjaDtcblx0XHR9XG5cblx0XHQvLyBjb252ZXJ0IHRoZSB1cmwgdG8gYSBmdWxsIHVybFxuXHRcdHZhciBuZXdVcmw7XG5cblx0XHRpZiAodW5xdW90ZWRPcmlnVXJsLmluZGV4T2YoXCIvL1wiKSA9PT0gMCkge1xuXHRcdCAgXHQvL1RPRE86IHNob3VsZCB3ZSBhZGQgcHJvdG9jb2w/XG5cdFx0XHRuZXdVcmwgPSB1bnF1b3RlZE9yaWdVcmw7XG5cdFx0fSBlbHNlIGlmICh1bnF1b3RlZE9yaWdVcmwuaW5kZXhPZihcIi9cIikgPT09IDApIHtcblx0XHRcdC8vIHBhdGggc2hvdWxkIGJlIHJlbGF0aXZlIHRvIHRoZSBiYXNlIHVybFxuXHRcdFx0bmV3VXJsID0gYmFzZVVybCArIHVucXVvdGVkT3JpZ1VybDsgLy8gYWxyZWFkeSBzdGFydHMgd2l0aCAnLydcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gcGF0aCBzaG91bGQgYmUgcmVsYXRpdmUgdG8gY3VycmVudCBkaXJlY3Rvcnlcblx0XHRcdG5ld1VybCA9IGN1cnJlbnREaXIgKyB1bnF1b3RlZE9yaWdVcmwucmVwbGFjZSgvXlxcLlxcLy8sIFwiXCIpOyAvLyBTdHJpcCBsZWFkaW5nICcuLydcblx0XHR9XG5cblx0XHQvLyBzZW5kIGJhY2sgdGhlIGZpeGVkIHVybCguLi4pXG5cdFx0cmV0dXJuIFwidXJsKFwiICsgSlNPTi5zdHJpbmdpZnkobmV3VXJsKSArIFwiKVwiO1xuXHR9KTtcblxuXHQvLyBzZW5kIGJhY2sgdGhlIGZpeGVkIGNzc1xuXHRyZXR1cm4gZml4ZWRDc3M7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2xpYi91cmxzLmpzXG4vLyBtb2R1bGUgaWQgPSAxNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBzdHlsZS1sb2FkZXI6IEFkZHMgc29tZSBjc3MgdG8gdGhlIERPTSBieSBhZGRpbmcgYSA8c3R5bGU+IHRhZ1xuXG4vLyBsb2FkIHRoZSBzdHlsZXNcbnZhciBjb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9ub3Vpc2xpZGVyLm1pbi5jc3NcIik7XG5pZih0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIGNvbnRlbnQgPSBbW21vZHVsZS5pZCwgY29udGVudCwgJyddXTtcbi8vIFByZXBhcmUgY3NzVHJhbnNmb3JtYXRpb25cbnZhciB0cmFuc2Zvcm07XG5cbnZhciBvcHRpb25zID0ge1wiaG1yXCI6dHJ1ZX1cbm9wdGlvbnMudHJhbnNmb3JtID0gdHJhbnNmb3JtXG4vLyBhZGQgdGhlIHN0eWxlcyB0byB0aGUgRE9NXG52YXIgdXBkYXRlID0gcmVxdWlyZShcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2xpYi9hZGRTdHlsZXMuanNcIikoY29udGVudCwgb3B0aW9ucyk7XG5pZihjb250ZW50LmxvY2FscykgbW9kdWxlLmV4cG9ydHMgPSBjb250ZW50LmxvY2Fscztcbi8vIEhvdCBNb2R1bGUgUmVwbGFjZW1lbnRcbmlmKG1vZHVsZS5ob3QpIHtcblx0Ly8gV2hlbiB0aGUgc3R5bGVzIGNoYW5nZSwgdXBkYXRlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0aWYoIWNvbnRlbnQubG9jYWxzKSB7XG5cdFx0bW9kdWxlLmhvdC5hY2NlcHQoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vbm91aXNsaWRlci5taW4uY3NzXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIG5ld0NvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL25vdWlzbGlkZXIubWluLmNzc1wiKTtcblx0XHRcdGlmKHR5cGVvZiBuZXdDb250ZW50ID09PSAnc3RyaW5nJykgbmV3Q29udGVudCA9IFtbbW9kdWxlLmlkLCBuZXdDb250ZW50LCAnJ11dO1xuXHRcdFx0dXBkYXRlKG5ld0NvbnRlbnQpO1xuXHRcdH0pO1xuXHR9XG5cdC8vIFdoZW4gdGhlIG1vZHVsZSBpcyBkaXNwb3NlZCwgcmVtb3ZlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0bW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uKCkgeyB1cGRhdGUoKTsgfSk7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvdmVuZG9yL25vdWlzbGlkZXIubWluLmNzc1xuLy8gbW9kdWxlIGlkID0gMTdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qc1wiKSh1bmRlZmluZWQpO1xuLy8gaW1wb3J0c1xuXG5cbi8vIG1vZHVsZVxuZXhwb3J0cy5wdXNoKFttb2R1bGUuaWQsIFwiLyohIG5vdWlzbGlkZXIgLSAxMC4wLjAgLSAyMDE3LTA1LTI4IDE0OjUyOjQ4ICovLm5vVWktdGFyZ2V0LC5ub1VpLXRhcmdldCAqey13ZWJraXQtdG91Y2gtY2FsbG91dDpub25lOy13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjp0cmFuc3BhcmVudDstd2Via2l0LXVzZXItc2VsZWN0Om5vbmU7LW1zLXRvdWNoLWFjdGlvbjpub25lO3RvdWNoLWFjdGlvbjpub25lOy1tcy11c2VyLXNlbGVjdDpub25lOy1tb3otdXNlci1zZWxlY3Q6bm9uZTt1c2VyLXNlbGVjdDpub25lOy1tb3otYm94LXNpemluZzpib3JkZXItYm94O2JveC1zaXppbmc6Ym9yZGVyLWJveH0ubm9VaS10YXJnZXR7cG9zaXRpb246cmVsYXRpdmU7ZGlyZWN0aW9uOmx0cn0ubm9VaS1iYXNle3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7cG9zaXRpb246cmVsYXRpdmU7ei1pbmRleDoxfS5ub1VpLWNvbm5lY3R7cG9zaXRpb246YWJzb2x1dGU7cmlnaHQ6MDt0b3A6MDtsZWZ0OjA7Ym90dG9tOjB9Lm5vVWktb3JpZ2lue3Bvc2l0aW9uOmFic29sdXRlO2hlaWdodDowO3dpZHRoOjB9Lm5vVWktaGFuZGxle3Bvc2l0aW9uOnJlbGF0aXZlO3otaW5kZXg6MX0ubm9VaS1zdGF0ZS10YXAgLm5vVWktY29ubmVjdCwubm9VaS1zdGF0ZS10YXAgLm5vVWktb3JpZ2luey13ZWJraXQtdHJhbnNpdGlvbjp0b3AgLjNzLHJpZ2h0IC4zcyxib3R0b20gLjNzLGxlZnQgLjNzO3RyYW5zaXRpb246dG9wIC4zcyxyaWdodCAuM3MsYm90dG9tIC4zcyxsZWZ0IC4zc30ubm9VaS1zdGF0ZS1kcmFnICp7Y3Vyc29yOmluaGVyaXQhaW1wb3J0YW50fS5ub1VpLWJhc2UsLm5vVWktaGFuZGxley13ZWJraXQtdHJhbnNmb3JtOnRyYW5zbGF0ZTNkKDAsMCwwKTt0cmFuc2Zvcm06dHJhbnNsYXRlM2QoMCwwLDApfS5ub1VpLWhvcml6b250YWx7aGVpZ2h0OjE4cHh9Lm5vVWktaG9yaXpvbnRhbCAubm9VaS1oYW5kbGV7d2lkdGg6MzRweDtoZWlnaHQ6MjhweDtsZWZ0Oi0xN3B4O3RvcDotNnB4fS5ub1VpLXZlcnRpY2Fse3dpZHRoOjE4cHh9Lm5vVWktdmVydGljYWwgLm5vVWktaGFuZGxle3dpZHRoOjI4cHg7aGVpZ2h0OjM0cHg7bGVmdDotNnB4O3RvcDotMTdweH0ubm9VaS10YXJnZXR7YmFja2dyb3VuZDojRkFGQUZBO2JvcmRlci1yYWRpdXM6NHB4O2JvcmRlcjoxcHggc29saWQgI0QzRDNEMztib3gtc2hhZG93Omluc2V0IDAgMXB4IDFweCAjRjBGMEYwLDAgM3B4IDZweCAtNXB4ICNCQkJ9Lm5vVWktY29ubmVjdHtiYWNrZ3JvdW5kOiMzRkI4QUY7Ym9yZGVyLXJhZGl1czo0cHg7Ym94LXNoYWRvdzppbnNldCAwIDAgM3B4IHJnYmEoNTEsNTEsNTEsLjQ1KTstd2Via2l0LXRyYW5zaXRpb246YmFja2dyb3VuZCA0NTBtczt0cmFuc2l0aW9uOmJhY2tncm91bmQgNDUwbXM7fS5ub1VpLWRyYWdnYWJsZXtjdXJzb3I6ZXctcmVzaXplfS5ub1VpLXZlcnRpY2FsIC5ub1VpLWRyYWdnYWJsZXtjdXJzb3I6bnMtcmVzaXplfS5ub1VpLWhhbmRsZXtib3JkZXI6MXB4IHNvbGlkICNEOUQ5RDk7Ym9yZGVyLXJhZGl1czozcHg7YmFja2dyb3VuZDojRkZGO2N1cnNvcjpkZWZhdWx0O2JveC1zaGFkb3c6IGluc2V0IDAgMCAxcHggI0ZGRixpbnNldCAwIDFweCA3cHggI0VCRUJFQiwwIDNweCA2cHggLTNweCAjQkJCO30ubm9VaS1hY3RpdmV7Ym94LXNoYWRvdzppbnNldCAwIDAgMXB4ICNGRkYsaW5zZXQgMCAxcHggN3B4ICNEREQsMCAzcHggNnB4IC0zcHggI0JCQn0ubm9VaS1oYW5kbGU6YWZ0ZXIsLm5vVWktaGFuZGxlOmJlZm9yZXtjb250ZW50OlxcXCJcXFwiO2Rpc3BsYXk6YmxvY2s7cG9zaXRpb246YWJzb2x1dGU7aGVpZ2h0OjE0cHg7d2lkdGg6MXB4O2JhY2tncm91bmQ6I0U4RTdFNjtsZWZ0OjE0cHg7dG9wOjZweH0ubm9VaS1oYW5kbGU6YWZ0ZXJ7bGVmdDoxN3B4fS5ub1VpLXZlcnRpY2FsIC5ub1VpLWhhbmRsZTphZnRlciwubm9VaS12ZXJ0aWNhbCAubm9VaS1oYW5kbGU6YmVmb3Jle3dpZHRoOjE0cHg7aGVpZ2h0OjFweDtsZWZ0OjZweDt0b3A6MTRweH0ubm9VaS12ZXJ0aWNhbCAubm9VaS1oYW5kbGU6YWZ0ZXJ7dG9wOjE3cHh9W2Rpc2FibGVkXSAubm9VaS1jb25uZWN0e2JhY2tncm91bmQ6I0I4QjhCOH1bZGlzYWJsZWRdIC5ub1VpLWhhbmRsZSxbZGlzYWJsZWRdLm5vVWktaGFuZGxlLFtkaXNhYmxlZF0ubm9VaS10YXJnZXR7Y3Vyc29yOm5vdC1hbGxvd2VkfS5ub1VpLXBpcHMsLm5vVWktcGlwcyAqey1tb3otYm94LXNpemluZzpib3JkZXItYm94O2JveC1zaXppbmc6Ym9yZGVyLWJveH0ubm9VaS1waXBze3Bvc2l0aW9uOmFic29sdXRlO2NvbG9yOiM5OTk7fS5ub1VpLXZhbHVle3Bvc2l0aW9uOmFic29sdXRlO3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LWFsaWduOmNlbnRlcn0ubm9VaS12YWx1ZS1zdWJ7Y29sb3I6I2NjYztmb250LXNpemU6MTBweH0ubm9VaS1tYXJrZXJ7cG9zaXRpb246YWJzb2x1dGU7YmFja2dyb3VuZDojQ0NDfS5ub1VpLW1hcmtlci1sYXJnZSwubm9VaS1tYXJrZXItc3Vie2JhY2tncm91bmQ6I0FBQX0ubm9VaS1waXBzLWhvcml6b250YWx7cGFkZGluZzoxMHB4IDA7aGVpZ2h0OjgwcHg7dG9wOjEwMCU7bGVmdDowO3dpZHRoOjEwMCV9Lm5vVWktdmFsdWUtaG9yaXpvbnRhbHstd2Via2l0LXRyYW5zZm9ybTp0cmFuc2xhdGUzZCgtNTAlLDUwJSwwKTt0cmFuc2Zvcm06dHJhbnNsYXRlM2QoLTUwJSw1MCUsMCl9Lm5vVWktbWFya2VyLWhvcml6b250YWwubm9VaS1tYXJrZXJ7bWFyZ2luLWxlZnQ6LTFweDt3aWR0aDoycHg7aGVpZ2h0OjVweH0ubm9VaS1tYXJrZXItaG9yaXpvbnRhbC5ub1VpLW1hcmtlci1zdWJ7aGVpZ2h0OjEwcHh9Lm5vVWktbWFya2VyLWhvcml6b250YWwubm9VaS1tYXJrZXItbGFyZ2V7aGVpZ2h0OjE1cHh9Lm5vVWktcGlwcy12ZXJ0aWNhbHtwYWRkaW5nOjAgMTBweDtoZWlnaHQ6MTAwJTt0b3A6MDtsZWZ0OjEwMCV9Lm5vVWktdmFsdWUtdmVydGljYWx7LXdlYmtpdC10cmFuc2Zvcm06dHJhbnNsYXRlM2QoMCw1MCUsMCk7dHJhbnNmb3JtOnRyYW5zbGF0ZTNkKDAsNTAlLDApO3BhZGRpbmctbGVmdDoyNXB4fS5ub1VpLW1hcmtlci12ZXJ0aWNhbC5ub1VpLW1hcmtlcnt3aWR0aDo1cHg7aGVpZ2h0OjJweDttYXJnaW4tdG9wOi0xcHh9Lm5vVWktbWFya2VyLXZlcnRpY2FsLm5vVWktbWFya2VyLXN1Ynt3aWR0aDoxMHB4fS5ub1VpLW1hcmtlci12ZXJ0aWNhbC5ub1VpLW1hcmtlci1sYXJnZXt3aWR0aDoxNXB4fS5ub1VpLXRvb2x0aXB7ZGlzcGxheTpibG9jaztwb3NpdGlvbjphYnNvbHV0ZTtib3JkZXI6MXB4IHNvbGlkICNEOUQ5RDk7Ym9yZGVyLXJhZGl1czozcHg7YmFja2dyb3VuZDojZmZmO2NvbG9yOiMwMDA7cGFkZGluZzo1cHg7dGV4dC1hbGlnbjpjZW50ZXI7d2hpdGUtc3BhY2U6bm93cmFwfS5ub1VpLWhvcml6b250YWwgLm5vVWktdG9vbHRpcHstd2Via2l0LXRyYW5zZm9ybTp0cmFuc2xhdGUoLTUwJSwwKTt0cmFuc2Zvcm06dHJhbnNsYXRlKC01MCUsMCk7bGVmdDo1MCU7Ym90dG9tOjEyMCV9Lm5vVWktdmVydGljYWwgLm5vVWktdG9vbHRpcHstd2Via2l0LXRyYW5zZm9ybTp0cmFuc2xhdGUoMCwtNTAlKTt0cmFuc2Zvcm06dHJhbnNsYXRlKDAsLTUwJSk7dG9wOjUwJTtyaWdodDoxMjAlfVwiLCBcIlwiXSk7XG5cbi8vIGV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIhLi9zcmMvdmVuZG9yL25vdWlzbGlkZXIubWluLmNzc1xuLy8gbW9kdWxlIGlkID0gMThcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiZmF2aWNvbi5pY29cIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9mYXZpY29uLmljb1xuLy8gbW9kdWxlIGlkID0gMTlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyogRGlyZWN0aW9ucyBjb250cm9scyAqKioqKioqKioqKioqKioqKioqKioqICovXG5cbmltcG9ydCBpbml0RGlzdGFuY2VTbGlkZXIgZnJvbSAnLi9kaXN0YW5jZVNsaWRlcic7XG5pbXBvcnQgaW5pdE9yaWdpbkxvY2F0b3JCdG4gZnJvbSAnLi9vcmlnaW5Mb2NhdG9yQnV0dG9uJztcbmltcG9ydCBpbml0RGlyZWN0aW9uSW5wdXQgZnJvbSAnLi9kaXJlY3Rpb25JbnB1dCc7XG5cbmZ1bmN0aW9uIGluaXREaXJlY3Rpb25zVG9nZ2xlKCkge1xuICBjb25zdCB0b2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGlyZWN0aW9ucy10b2dnbGUnKTtcbiAgbGV0IHNob3duID0gdHJ1ZTtcbiAgdG9nZ2xlLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgY29uc3QgY29udGVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2RpcmVjdGlvbnMtLWNvbnRlbnQnKVswXTtcbiAgICBpZiAoc2hvd24pIHtcbiAgICAgIC8vIGZpcnN0IGVuc3VyZSB0aGUgdG9nZ2xlIGJ1dHRvbiBkb2Vzbid0IGRpc2FwcGVhclxuICAgICAgdG9nZ2xlLnN0eWxlLndpZHRoID0gY29udGVudC5vZmZzZXRXaWR0aCArICdweCc7XG4gICAgICBjb250ZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRvZ2dsZS5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgICAgIGNvbnRlbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgfVxuICAgIHNob3duID0gIXNob3duO1xuICAgIHRvZ2dsZS5jbGFzc0xpc3QudG9nZ2xlKCdzaG93bicpO1xuICAgIHRvZ2dsZS5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW5pdERpcmVjdGlvbnNDb250cm9scygpIHtcbiAgaW5pdERpc3RhbmNlU2xpZGVyKCk7XG4gIGluaXRPcmlnaW5Mb2NhdG9yQnRuKCk7XG4gIGluaXREaXJlY3Rpb25JbnB1dCgnb3JpZ2luSW5wdXQnLCAnb3JpZ2luJyk7XG4gIGluaXREaXJlY3Rpb25JbnB1dCgnZGVzdGluYXRpb25JbnB1dCcsICdkZXN0aW5hdGlvbicpO1xuICBpbml0RGlyZWN0aW9uc1RvZ2dsZSgpO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2RpcmVjdGlvbnNDb250cm9scy5qcyIsImltcG9ydCBub1VpU2xpZGVyIGZyb20gJy4vdmVuZG9yL25vdWlzbGlkZXInO1xuaW1wb3J0IHN0YXRlIGZyb20gJy4vc3RhdGUnO1xuaW1wb3J0IHsgbWFwVXBkYXRlTmVhcmJ5IH0gZnJvbSAnLi9tYXAnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpbml0RGlzdGFuY2VTbGlkZXIoKSB7XG4gIGNvbnN0IHJhbmdlID0ge1xuICAgIG1pbjogWzBdLFxuICAgICcxMDAlJzogWzIsIDJdLFxuICAgIG1heDogWzJdLFxuICB9O1xuXG4gIGNvbnN0IHNsaWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXJlY3Rpb25zLS1kaXN0YW5jZS1yYW5nZScpO1xuXG4gIGNvbnN0IGRpc3RGb3JtYXR0ZXIgPSB7XG4gICAgLy8gSW50ZWdlcnMgc3RheSBpbnRlZ2Vycywgb3RoZXIgdmFsdWVzIGdldCB0d28gZGVjaW1hbHMuXG4gICAgLy8gZXg6IDEgLT4gXCIxXCIgYW5kIDEuNSAtPiBcIjEuNTBcIlxuICAgIC8vIHRvOiAobikgPT4gTnVtYmVyLmlzSW50ZWdlcihuKSA/IG4gOiAobikudG9GaXhlZCgyKVxuICAgIC8vIHdlIHByb3ZpZGUgdGhlICd0bycgZnVuY3Rpb24gYmVjYXVzZSBub1VpU2xpZGVyIGV4cGVjdHMgdGhhdFxuICAgIC8vIChwcm90b3R5cGUgY29tcGF0aWJsZSB3LyB3TnVtYiBmb3JtYXR0aW5nIGxpYnJhcnkncyBvYmplY3RzKS5cbiAgICB0bzogKG4pID0+IHtcbiAgICAgIGlmIChuID09PSAxKSB7IC8vIGRvbid0IG5lZWQgdGljayBvbiAnMScsIHVzZXIgY2FuIGZpZ3VyZSBpdCBvdXQuXG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH0gZWxzZSBpZiAoTnVtYmVyLmlzSW50ZWdlcihuKSkge1xuICAgICAgICByZXR1cm4gbiA/IGAke259IG1pYCA6IG47IC8vIDAgZG9lc24ndCBuZWVkIHVuaXRzLlxuICAgICAgfSBlbHNlIGlmIChuICUgMC41ID09PSAwKSB7XG4gICAgICAgIHJldHVybiAobikudG9GaXhlZCgyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAnJzsgLy8gZG9uJ3QgbmVlZCBsYWJlbHMgb24gZXZlcnkgdGljayBtYXJrXG4gICAgfSxcbiAgfTtcblxuICBub1VpU2xpZGVyLmNyZWF0ZShzbGlkZXIsIHtcbiAgICByYW5nZSxcbiAgICBzdGFydDogc3RhdGUubWF4V2Fsa0Rpc3RhbmNlLFxuICAgIHN0ZXA6IDAuMjUsXG4gICAgY29ubmVjdDogW3RydWUsIGZhbHNlXSxcbiAgICBwaXBzOiB7XG4gICAgICBtb2RlOiAnY291bnQnLFxuICAgICAgdmFsdWVzOiAzLCAvLyAzIG1ham9yIHRpY2tzXG4gICAgICBkZW5zaXR5OiAxMi41LCAvLyAxIHNtYWxsIHRpY2sgZXZlcnkgMTIuNSUgKGV2ZXJ5IDAuMjUgYnR3biAwIGFuZCAyKVxuICAgICAgZm9ybWF0OiBkaXN0Rm9ybWF0dGVyLFxuICAgIH0sXG4gIH0pO1xuXG4gIHNsaWRlci5ub1VpU2xpZGVyLm9uKCd1cGRhdGUnLCAodmFsdWVzLCBoYW5kbGUpID0+IHtcbiAgICBjb25zdCB2YWx1ZSA9IHZhbHVlc1toYW5kbGVdO1xuICAgIC8vIGNvbnNvbGUubG9nKGBTZWFyY2hpbmcgd2l0aGluICR7dmFsdWV9IG1pbGVzLmApO1xuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RpcmVjdGlvbnMtLWRpc3RhbmNlLXZhbHVlJyk7XG4gICAgZWwuaW5uZXJUZXh0ID0gYCR7TnVtYmVyKHZhbHVlKS50b0ZpeGVkKDIpfSBtaS5gO1xuICAgIHN0YXRlLm1heFdhbGtEaXN0YW5jZSA9IHBhcnNlRmxvYXQodmFsdWUpO1xuICAgIG1hcFVwZGF0ZU5lYXJieSgpO1xuICB9KTtcbn1cblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2Rpc3RhbmNlU2xpZGVyLmpzIiwiLyohIG5vdWlzbGlkZXIgLSAxMC4wLjAgLSAyMDE3LTA1LTI4IDE0OjUyOjQ4ICovXHJcblxyXG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcclxuXHJcbiAgICBpZiAoIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcclxuXHJcbiAgICAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxyXG4gICAgICAgIGRlZmluZShbXSwgZmFjdG9yeSk7XHJcblxyXG4gICAgfSBlbHNlIGlmICggdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICkge1xyXG5cclxuICAgICAgICAvLyBOb2RlL0NvbW1vbkpTXHJcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gQnJvd3NlciBnbG9iYWxzXHJcbiAgICAgICAgd2luZG93Lm5vVWlTbGlkZXIgPSBmYWN0b3J5KCk7XHJcbiAgICB9XHJcblxyXG59KGZ1bmN0aW9uKCApe1xyXG5cclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdHZhciBWRVJTSU9OID0gJzEwLjAuMCc7XHJcblxyXG5cclxuXHRmdW5jdGlvbiBpc1ZhbGlkRm9ybWF0dGVyICggZW50cnkgKSB7XHJcblx0XHRyZXR1cm4gdHlwZW9mIGVudHJ5ID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgZW50cnkudG8gPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGVudHJ5LmZyb20gPT09ICdmdW5jdGlvbic7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiByZW1vdmVFbGVtZW50ICggZWwgKSB7XHJcblx0XHRlbC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGVsKTtcclxuXHR9XHJcblxyXG5cdC8vIEJpbmRhYmxlIHZlcnNpb25cclxuXHRmdW5jdGlvbiBwcmV2ZW50RGVmYXVsdCAoIGUgKSB7XHJcblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0fVxyXG5cclxuXHQvLyBSZW1vdmVzIGR1cGxpY2F0ZXMgZnJvbSBhbiBhcnJheS5cclxuXHRmdW5jdGlvbiB1bmlxdWUgKCBhcnJheSApIHtcclxuXHRcdHJldHVybiBhcnJheS5maWx0ZXIoZnVuY3Rpb24oYSl7XHJcblx0XHRcdHJldHVybiAhdGhpc1thXSA/IHRoaXNbYV0gPSB0cnVlIDogZmFsc2U7XHJcblx0XHR9LCB7fSk7XHJcblx0fVxyXG5cclxuXHQvLyBSb3VuZCBhIHZhbHVlIHRvIHRoZSBjbG9zZXN0ICd0bycuXHJcblx0ZnVuY3Rpb24gY2xvc2VzdCAoIHZhbHVlLCB0byApIHtcclxuXHRcdHJldHVybiBNYXRoLnJvdW5kKHZhbHVlIC8gdG8pICogdG87XHJcblx0fVxyXG5cclxuXHQvLyBDdXJyZW50IHBvc2l0aW9uIG9mIGFuIGVsZW1lbnQgcmVsYXRpdmUgdG8gdGhlIGRvY3VtZW50LlxyXG5cdGZ1bmN0aW9uIG9mZnNldCAoIGVsZW0sIG9yaWVudGF0aW9uICkge1xyXG5cclxuXHRcdHZhciByZWN0ID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHRcdHZhciBkb2MgPSBlbGVtLm93bmVyRG9jdW1lbnQ7XHJcblx0XHR2YXIgZG9jRWxlbSA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XHJcblx0XHR2YXIgcGFnZU9mZnNldCA9IGdldFBhZ2VPZmZzZXQoZG9jKTtcclxuXHJcblx0XHQvLyBnZXRCb3VuZGluZ0NsaWVudFJlY3QgY29udGFpbnMgbGVmdCBzY3JvbGwgaW4gQ2hyb21lIG9uIEFuZHJvaWQuXHJcblx0XHQvLyBJIGhhdmVuJ3QgZm91bmQgYSBmZWF0dXJlIGRldGVjdGlvbiB0aGF0IHByb3ZlcyB0aGlzLiBXb3JzdCBjYXNlXHJcblx0XHQvLyBzY2VuYXJpbyBvbiBtaXMtbWF0Y2g6IHRoZSAndGFwJyBmZWF0dXJlIG9uIGhvcml6b250YWwgc2xpZGVycyBicmVha3MuXHJcblx0XHRpZiAoIC93ZWJraXQuKkNocm9tZS4qTW9iaWxlL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSApIHtcclxuXHRcdFx0cGFnZU9mZnNldC54ID0gMDtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gb3JpZW50YXRpb24gPyAocmVjdC50b3AgKyBwYWdlT2Zmc2V0LnkgLSBkb2NFbGVtLmNsaWVudFRvcCkgOiAocmVjdC5sZWZ0ICsgcGFnZU9mZnNldC54IC0gZG9jRWxlbS5jbGllbnRMZWZ0KTtcclxuXHR9XHJcblxyXG5cdC8vIENoZWNrcyB3aGV0aGVyIGEgdmFsdWUgaXMgbnVtZXJpY2FsLlxyXG5cdGZ1bmN0aW9uIGlzTnVtZXJpYyAoIGEgKSB7XHJcblx0XHRyZXR1cm4gdHlwZW9mIGEgPT09ICdudW1iZXInICYmICFpc05hTiggYSApICYmIGlzRmluaXRlKCBhICk7XHJcblx0fVxyXG5cclxuXHQvLyBTZXRzIGEgY2xhc3MgYW5kIHJlbW92ZXMgaXQgYWZ0ZXIgW2R1cmF0aW9uXSBtcy5cclxuXHRmdW5jdGlvbiBhZGRDbGFzc0ZvciAoIGVsZW1lbnQsIGNsYXNzTmFtZSwgZHVyYXRpb24gKSB7XHJcblx0XHRpZiAoZHVyYXRpb24gPiAwKSB7XHJcblx0XHRhZGRDbGFzcyhlbGVtZW50LCBjbGFzc05hbWUpO1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0cmVtb3ZlQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lKTtcclxuXHRcdFx0fSwgZHVyYXRpb24pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gTGltaXRzIGEgdmFsdWUgdG8gMCAtIDEwMFxyXG5cdGZ1bmN0aW9uIGxpbWl0ICggYSApIHtcclxuXHRcdHJldHVybiBNYXRoLm1heChNYXRoLm1pbihhLCAxMDApLCAwKTtcclxuXHR9XHJcblxyXG5cdC8vIFdyYXBzIGEgdmFyaWFibGUgYXMgYW4gYXJyYXksIGlmIGl0IGlzbid0IG9uZSB5ZXQuXHJcblx0Ly8gTm90ZSB0aGF0IGFuIGlucHV0IGFycmF5IGlzIHJldHVybmVkIGJ5IHJlZmVyZW5jZSFcclxuXHRmdW5jdGlvbiBhc0FycmF5ICggYSApIHtcclxuXHRcdHJldHVybiBBcnJheS5pc0FycmF5KGEpID8gYSA6IFthXTtcclxuXHR9XHJcblxyXG5cdC8vIENvdW50cyBkZWNpbWFsc1xyXG5cdGZ1bmN0aW9uIGNvdW50RGVjaW1hbHMgKCBudW1TdHIgKSB7XHJcblx0XHRudW1TdHIgPSBTdHJpbmcobnVtU3RyKTtcclxuXHRcdHZhciBwaWVjZXMgPSBudW1TdHIuc3BsaXQoXCIuXCIpO1xyXG5cdFx0cmV0dXJuIHBpZWNlcy5sZW5ndGggPiAxID8gcGllY2VzWzFdLmxlbmd0aCA6IDA7XHJcblx0fVxyXG5cclxuXHQvLyBodHRwOi8veW91bWlnaHRub3RuZWVkanF1ZXJ5LmNvbS8jYWRkX2NsYXNzXHJcblx0ZnVuY3Rpb24gYWRkQ2xhc3MgKCBlbCwgY2xhc3NOYW1lICkge1xyXG5cdFx0aWYgKCBlbC5jbGFzc0xpc3QgKSB7XHJcblx0XHRcdGVsLmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGVsLmNsYXNzTmFtZSArPSAnICcgKyBjbGFzc05hbWU7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBodHRwOi8veW91bWlnaHRub3RuZWVkanF1ZXJ5LmNvbS8jcmVtb3ZlX2NsYXNzXHJcblx0ZnVuY3Rpb24gcmVtb3ZlQ2xhc3MgKCBlbCwgY2xhc3NOYW1lICkge1xyXG5cdFx0aWYgKCBlbC5jbGFzc0xpc3QgKSB7XHJcblx0XHRcdGVsLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5yZXBsYWNlKG5ldyBSZWdFeHAoJyhefFxcXFxiKScgKyBjbGFzc05hbWUuc3BsaXQoJyAnKS5qb2luKCd8JykgKyAnKFxcXFxifCQpJywgJ2dpJyksICcgJyk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBodHRwczovL3BsYWluanMuY29tL2phdmFzY3JpcHQvYXR0cmlidXRlcy9hZGRpbmctcmVtb3ZpbmctYW5kLXRlc3RpbmctZm9yLWNsYXNzZXMtOS9cclxuXHRmdW5jdGlvbiBoYXNDbGFzcyAoIGVsLCBjbGFzc05hbWUgKSB7XHJcblx0XHRyZXR1cm4gZWwuY2xhc3NMaXN0ID8gZWwuY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzTmFtZSkgOiBuZXcgUmVnRXhwKCdcXFxcYicgKyBjbGFzc05hbWUgKyAnXFxcXGInKS50ZXN0KGVsLmNsYXNzTmFtZSk7XHJcblx0fVxyXG5cclxuXHQvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2luZG93L3Njcm9sbFkjTm90ZXNcclxuXHRmdW5jdGlvbiBnZXRQYWdlT2Zmc2V0ICggZG9jICkge1xyXG5cclxuXHRcdHZhciBzdXBwb3J0UGFnZU9mZnNldCA9IHdpbmRvdy5wYWdlWE9mZnNldCAhPT0gdW5kZWZpbmVkO1xyXG5cdFx0dmFyIGlzQ1NTMUNvbXBhdCA9ICgoZG9jLmNvbXBhdE1vZGUgfHwgXCJcIikgPT09IFwiQ1NTMUNvbXBhdFwiKTtcclxuXHRcdHZhciB4ID0gc3VwcG9ydFBhZ2VPZmZzZXQgPyB3aW5kb3cucGFnZVhPZmZzZXQgOiBpc0NTUzFDb21wYXQgPyBkb2MuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQgOiBkb2MuYm9keS5zY3JvbGxMZWZ0O1xyXG5cdFx0dmFyIHkgPSBzdXBwb3J0UGFnZU9mZnNldCA/IHdpbmRvdy5wYWdlWU9mZnNldCA6IGlzQ1NTMUNvbXBhdCA/IGRvYy5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIDogZG9jLmJvZHkuc2Nyb2xsVG9wO1xyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHg6IHgsXHJcblx0XHRcdHk6IHlcclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHQvLyB3ZSBwcm92aWRlIGEgZnVuY3Rpb24gdG8gY29tcHV0ZSBjb25zdGFudHMgaW5zdGVhZFxyXG5cdC8vIG9mIGFjY2Vzc2luZyB3aW5kb3cuKiBhcyBzb29uIGFzIHRoZSBtb2R1bGUgbmVlZHMgaXRcclxuXHQvLyBzbyB0aGF0IHdlIGRvIG5vdCBjb21wdXRlIGFueXRoaW5nIGlmIG5vdCBuZWVkZWRcclxuXHRmdW5jdGlvbiBnZXRBY3Rpb25zICggKSB7XHJcblxyXG5cdFx0Ly8gRGV0ZXJtaW5lIHRoZSBldmVudHMgdG8gYmluZC4gSUUxMSBpbXBsZW1lbnRzIHBvaW50ZXJFdmVudHMgd2l0aG91dFxyXG5cdFx0Ly8gYSBwcmVmaXgsIHdoaWNoIGJyZWFrcyBjb21wYXRpYmlsaXR5IHdpdGggdGhlIElFMTAgaW1wbGVtZW50YXRpb24uXHJcblx0XHRyZXR1cm4gd2luZG93Lm5hdmlnYXRvci5wb2ludGVyRW5hYmxlZCA/IHtcclxuXHRcdFx0c3RhcnQ6ICdwb2ludGVyZG93bicsXHJcblx0XHRcdG1vdmU6ICdwb2ludGVybW92ZScsXHJcblx0XHRcdGVuZDogJ3BvaW50ZXJ1cCdcclxuXHRcdH0gOiB3aW5kb3cubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQgPyB7XHJcblx0XHRcdHN0YXJ0OiAnTVNQb2ludGVyRG93bicsXHJcblx0XHRcdG1vdmU6ICdNU1BvaW50ZXJNb3ZlJyxcclxuXHRcdFx0ZW5kOiAnTVNQb2ludGVyVXAnXHJcblx0XHR9IDoge1xyXG5cdFx0XHRzdGFydDogJ21vdXNlZG93biB0b3VjaHN0YXJ0JyxcclxuXHRcdFx0bW92ZTogJ21vdXNlbW92ZSB0b3VjaG1vdmUnLFxyXG5cdFx0XHRlbmQ6ICdtb3VzZXVwIHRvdWNoZW5kJ1xyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9XSUNHL0V2ZW50TGlzdGVuZXJPcHRpb25zL2Jsb2IvZ2gtcGFnZXMvZXhwbGFpbmVyLm1kXHJcblx0Ly8gSXNzdWUgIzc4NVxyXG5cdGZ1bmN0aW9uIGdldFN1cHBvcnRzUGFzc2l2ZSAoICkge1xyXG5cclxuXHRcdHZhciBzdXBwb3J0c1Bhc3NpdmUgPSBmYWxzZTtcclxuXHJcblx0XHR0cnkge1xyXG5cclxuXHRcdFx0dmFyIG9wdHMgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdwYXNzaXZlJywge1xyXG5cdFx0XHRcdGdldDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRzdXBwb3J0c1Bhc3NpdmUgPSB0cnVlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndGVzdCcsIG51bGwsIG9wdHMpO1xyXG5cclxuXHRcdH0gY2F0Y2ggKGUpIHt9XHJcblxyXG5cdFx0cmV0dXJuIHN1cHBvcnRzUGFzc2l2ZTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldFN1cHBvcnRzVG91Y2hBY3Rpb25Ob25lICggKSB7XHJcblx0XHRyZXR1cm4gd2luZG93LkNTUyAmJiBDU1Muc3VwcG9ydHMgJiYgQ1NTLnN1cHBvcnRzKCd0b3VjaC1hY3Rpb24nLCAnbm9uZScpO1xyXG5cdH1cclxuXHJcblxyXG4vLyBWYWx1ZSBjYWxjdWxhdGlvblxyXG5cclxuXHQvLyBEZXRlcm1pbmUgdGhlIHNpemUgb2YgYSBzdWItcmFuZ2UgaW4gcmVsYXRpb24gdG8gYSBmdWxsIHJhbmdlLlxyXG5cdGZ1bmN0aW9uIHN1YlJhbmdlUmF0aW8gKCBwYSwgcGIgKSB7XHJcblx0XHRyZXR1cm4gKDEwMCAvIChwYiAtIHBhKSk7XHJcblx0fVxyXG5cclxuXHQvLyAocGVyY2VudGFnZSkgSG93IG1hbnkgcGVyY2VudCBpcyB0aGlzIHZhbHVlIG9mIHRoaXMgcmFuZ2U/XHJcblx0ZnVuY3Rpb24gZnJvbVBlcmNlbnRhZ2UgKCByYW5nZSwgdmFsdWUgKSB7XHJcblx0XHRyZXR1cm4gKHZhbHVlICogMTAwKSAvICggcmFuZ2VbMV0gLSByYW5nZVswXSApO1xyXG5cdH1cclxuXHJcblx0Ly8gKHBlcmNlbnRhZ2UpIFdoZXJlIGlzIHRoaXMgdmFsdWUgb24gdGhpcyByYW5nZT9cclxuXHRmdW5jdGlvbiB0b1BlcmNlbnRhZ2UgKCByYW5nZSwgdmFsdWUgKSB7XHJcblx0XHRyZXR1cm4gZnJvbVBlcmNlbnRhZ2UoIHJhbmdlLCByYW5nZVswXSA8IDAgP1xyXG5cdFx0XHR2YWx1ZSArIE1hdGguYWJzKHJhbmdlWzBdKSA6XHJcblx0XHRcdFx0dmFsdWUgLSByYW5nZVswXSApO1xyXG5cdH1cclxuXHJcblx0Ly8gKHZhbHVlKSBIb3cgbXVjaCBpcyB0aGlzIHBlcmNlbnRhZ2Ugb24gdGhpcyByYW5nZT9cclxuXHRmdW5jdGlvbiBpc1BlcmNlbnRhZ2UgKCByYW5nZSwgdmFsdWUgKSB7XHJcblx0XHRyZXR1cm4gKCh2YWx1ZSAqICggcmFuZ2VbMV0gLSByYW5nZVswXSApKSAvIDEwMCkgKyByYW5nZVswXTtcclxuXHR9XHJcblxyXG5cclxuLy8gUmFuZ2UgY29udmVyc2lvblxyXG5cclxuXHRmdW5jdGlvbiBnZXRKICggdmFsdWUsIGFyciApIHtcclxuXHJcblx0XHR2YXIgaiA9IDE7XHJcblxyXG5cdFx0d2hpbGUgKCB2YWx1ZSA+PSBhcnJbal0gKXtcclxuXHRcdFx0aiArPSAxO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBqO1xyXG5cdH1cclxuXHJcblx0Ly8gKHBlcmNlbnRhZ2UpIElucHV0IGEgdmFsdWUsIGZpbmQgd2hlcmUsIG9uIGEgc2NhbGUgb2YgMC0xMDAsIGl0IGFwcGxpZXMuXHJcblx0ZnVuY3Rpb24gdG9TdGVwcGluZyAoIHhWYWwsIHhQY3QsIHZhbHVlICkge1xyXG5cclxuXHRcdGlmICggdmFsdWUgPj0geFZhbC5zbGljZSgtMSlbMF0gKXtcclxuXHRcdFx0cmV0dXJuIDEwMDtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgaiA9IGdldEooIHZhbHVlLCB4VmFsICksIHZhLCB2YiwgcGEsIHBiO1xyXG5cclxuXHRcdHZhID0geFZhbFtqLTFdO1xyXG5cdFx0dmIgPSB4VmFsW2pdO1xyXG5cdFx0cGEgPSB4UGN0W2otMV07XHJcblx0XHRwYiA9IHhQY3Rbal07XHJcblxyXG5cdFx0cmV0dXJuIHBhICsgKHRvUGVyY2VudGFnZShbdmEsIHZiXSwgdmFsdWUpIC8gc3ViUmFuZ2VSYXRpbyAocGEsIHBiKSk7XHJcblx0fVxyXG5cclxuXHQvLyAodmFsdWUpIElucHV0IGEgcGVyY2VudGFnZSwgZmluZCB3aGVyZSBpdCBpcyBvbiB0aGUgc3BlY2lmaWVkIHJhbmdlLlxyXG5cdGZ1bmN0aW9uIGZyb21TdGVwcGluZyAoIHhWYWwsIHhQY3QsIHZhbHVlICkge1xyXG5cclxuXHRcdC8vIFRoZXJlIGlzIG5vIHJhbmdlIGdyb3VwIHRoYXQgZml0cyAxMDBcclxuXHRcdGlmICggdmFsdWUgPj0gMTAwICl7XHJcblx0XHRcdHJldHVybiB4VmFsLnNsaWNlKC0xKVswXTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgaiA9IGdldEooIHZhbHVlLCB4UGN0ICksIHZhLCB2YiwgcGEsIHBiO1xyXG5cclxuXHRcdHZhID0geFZhbFtqLTFdO1xyXG5cdFx0dmIgPSB4VmFsW2pdO1xyXG5cdFx0cGEgPSB4UGN0W2otMV07XHJcblx0XHRwYiA9IHhQY3Rbal07XHJcblxyXG5cdFx0cmV0dXJuIGlzUGVyY2VudGFnZShbdmEsIHZiXSwgKHZhbHVlIC0gcGEpICogc3ViUmFuZ2VSYXRpbyAocGEsIHBiKSk7XHJcblx0fVxyXG5cclxuXHQvLyAocGVyY2VudGFnZSkgR2V0IHRoZSBzdGVwIHRoYXQgYXBwbGllcyBhdCBhIGNlcnRhaW4gdmFsdWUuXHJcblx0ZnVuY3Rpb24gZ2V0U3RlcCAoIHhQY3QsIHhTdGVwcywgc25hcCwgdmFsdWUgKSB7XHJcblxyXG5cdFx0aWYgKCB2YWx1ZSA9PT0gMTAwICkge1xyXG5cdFx0XHRyZXR1cm4gdmFsdWU7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGogPSBnZXRKKCB2YWx1ZSwgeFBjdCApLCBhLCBiO1xyXG5cclxuXHRcdC8vIElmICdzbmFwJyBpcyBzZXQsIHN0ZXBzIGFyZSB1c2VkIGFzIGZpeGVkIHBvaW50cyBvbiB0aGUgc2xpZGVyLlxyXG5cdFx0aWYgKCBzbmFwICkge1xyXG5cclxuXHRcdFx0YSA9IHhQY3Rbai0xXTtcclxuXHRcdFx0YiA9IHhQY3Rbal07XHJcblxyXG5cdFx0XHQvLyBGaW5kIHRoZSBjbG9zZXN0IHBvc2l0aW9uLCBhIG9yIGIuXHJcblx0XHRcdGlmICgodmFsdWUgLSBhKSA+ICgoYi1hKS8yKSl7XHJcblx0XHRcdFx0cmV0dXJuIGI7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBhO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICggIXhTdGVwc1tqLTFdICl7XHJcblx0XHRcdHJldHVybiB2YWx1ZTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4geFBjdFtqLTFdICsgY2xvc2VzdChcclxuXHRcdFx0dmFsdWUgLSB4UGN0W2otMV0sXHJcblx0XHRcdHhTdGVwc1tqLTFdXHJcblx0XHQpO1xyXG5cdH1cclxuXHJcblxyXG4vLyBFbnRyeSBwYXJzaW5nXHJcblxyXG5cdGZ1bmN0aW9uIGhhbmRsZUVudHJ5UG9pbnQgKCBpbmRleCwgdmFsdWUsIHRoYXQgKSB7XHJcblxyXG5cdFx0dmFyIHBlcmNlbnRhZ2U7XHJcblxyXG5cdFx0Ly8gV3JhcCBudW1lcmljYWwgaW5wdXQgaW4gYW4gYXJyYXkuXHJcblx0XHRpZiAoIHR5cGVvZiB2YWx1ZSA9PT0gXCJudW1iZXJcIiApIHtcclxuXHRcdFx0dmFsdWUgPSBbdmFsdWVdO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFJlamVjdCBhbnkgaW52YWxpZCBpbnB1dCwgYnkgdGVzdGluZyB3aGV0aGVyIHZhbHVlIGlzIGFuIGFycmF5LlxyXG5cdFx0aWYgKCBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoIHZhbHVlICkgIT09ICdbb2JqZWN0IEFycmF5XScgKXtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlciAoXCIgKyBWRVJTSU9OICsgXCIpOiAncmFuZ2UnIGNvbnRhaW5zIGludmFsaWQgdmFsdWUuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIENvdmVydCBtaW4vbWF4IHN5bnRheCB0byAwIGFuZCAxMDAuXHJcblx0XHRpZiAoIGluZGV4ID09PSAnbWluJyApIHtcclxuXHRcdFx0cGVyY2VudGFnZSA9IDA7XHJcblx0XHR9IGVsc2UgaWYgKCBpbmRleCA9PT0gJ21heCcgKSB7XHJcblx0XHRcdHBlcmNlbnRhZ2UgPSAxMDA7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRwZXJjZW50YWdlID0gcGFyc2VGbG9hdCggaW5kZXggKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBDaGVjayBmb3IgY29ycmVjdCBpbnB1dC5cclxuXHRcdGlmICggIWlzTnVtZXJpYyggcGVyY2VudGFnZSApIHx8ICFpc051bWVyaWMoIHZhbHVlWzBdICkgKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXIgKFwiICsgVkVSU0lPTiArIFwiKTogJ3JhbmdlJyB2YWx1ZSBpc24ndCBudW1lcmljLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBTdG9yZSB2YWx1ZXMuXHJcblx0XHR0aGF0LnhQY3QucHVzaCggcGVyY2VudGFnZSApO1xyXG5cdFx0dGhhdC54VmFsLnB1c2goIHZhbHVlWzBdICk7XHJcblxyXG5cdFx0Ly8gTmFOIHdpbGwgZXZhbHVhdGUgdG8gZmFsc2UgdG9vLCBidXQgdG8ga2VlcFxyXG5cdFx0Ly8gbG9nZ2luZyBjbGVhciwgc2V0IHN0ZXAgZXhwbGljaXRseS4gTWFrZSBzdXJlXHJcblx0XHQvLyBub3QgdG8gb3ZlcnJpZGUgdGhlICdzdGVwJyBzZXR0aW5nIHdpdGggZmFsc2UuXHJcblx0XHRpZiAoICFwZXJjZW50YWdlICkge1xyXG5cdFx0XHRpZiAoICFpc05hTiggdmFsdWVbMV0gKSApIHtcclxuXHRcdFx0XHR0aGF0LnhTdGVwc1swXSA9IHZhbHVlWzFdO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGF0LnhTdGVwcy5wdXNoKCBpc05hTih2YWx1ZVsxXSkgPyBmYWxzZSA6IHZhbHVlWzFdICk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhhdC54SGlnaGVzdENvbXBsZXRlU3RlcC5wdXNoKDApO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaGFuZGxlU3RlcFBvaW50ICggaSwgbiwgdGhhdCApIHtcclxuXHJcblx0XHQvLyBJZ25vcmUgJ2ZhbHNlJyBzdGVwcGluZy5cclxuXHRcdGlmICggIW4gKSB7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEZhY3RvciB0byByYW5nZSByYXRpb1xyXG5cdFx0dGhhdC54U3RlcHNbaV0gPSBmcm9tUGVyY2VudGFnZShbXHJcblx0XHRcdCB0aGF0LnhWYWxbaV1cclxuXHRcdFx0LHRoYXQueFZhbFtpKzFdXHJcblx0XHRdLCBuKSAvIHN1YlJhbmdlUmF0aW8gKFxyXG5cdFx0XHR0aGF0LnhQY3RbaV0sXHJcblx0XHRcdHRoYXQueFBjdFtpKzFdICk7XHJcblxyXG5cdFx0dmFyIHRvdGFsU3RlcHMgPSAodGhhdC54VmFsW2krMV0gLSB0aGF0LnhWYWxbaV0pIC8gdGhhdC54TnVtU3RlcHNbaV07XHJcblx0XHR2YXIgaGlnaGVzdFN0ZXAgPSBNYXRoLmNlaWwoTnVtYmVyKHRvdGFsU3RlcHMudG9GaXhlZCgzKSkgLSAxKTtcclxuXHRcdHZhciBzdGVwID0gdGhhdC54VmFsW2ldICsgKHRoYXQueE51bVN0ZXBzW2ldICogaGlnaGVzdFN0ZXApO1xyXG5cclxuXHRcdHRoYXQueEhpZ2hlc3RDb21wbGV0ZVN0ZXBbaV0gPSBzdGVwO1xyXG5cdH1cclxuXHJcblxyXG4vLyBJbnRlcmZhY2VcclxuXHJcblx0ZnVuY3Rpb24gU3BlY3RydW0gKCBlbnRyeSwgc25hcCwgc2luZ2xlU3RlcCApIHtcclxuXHJcblx0XHR0aGlzLnhQY3QgPSBbXTtcclxuXHRcdHRoaXMueFZhbCA9IFtdO1xyXG5cdFx0dGhpcy54U3RlcHMgPSBbIHNpbmdsZVN0ZXAgfHwgZmFsc2UgXTtcclxuXHRcdHRoaXMueE51bVN0ZXBzID0gWyBmYWxzZSBdO1xyXG5cdFx0dGhpcy54SGlnaGVzdENvbXBsZXRlU3RlcCA9IFtdO1xyXG5cclxuXHRcdHRoaXMuc25hcCA9IHNuYXA7XHJcblxyXG5cdFx0dmFyIGluZGV4LCBvcmRlcmVkID0gWyAvKiBbMCwgJ21pbiddLCBbMSwgJzUwJSddLCBbMiwgJ21heCddICovIF07XHJcblxyXG5cdFx0Ly8gTWFwIHRoZSBvYmplY3Qga2V5cyB0byBhbiBhcnJheS5cclxuXHRcdGZvciAoIGluZGV4IGluIGVudHJ5ICkge1xyXG5cdFx0XHRpZiAoIGVudHJ5Lmhhc093blByb3BlcnR5KGluZGV4KSApIHtcclxuXHRcdFx0XHRvcmRlcmVkLnB1c2goW2VudHJ5W2luZGV4XSwgaW5kZXhdKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFNvcnQgYWxsIGVudHJpZXMgYnkgdmFsdWUgKG51bWVyaWMgc29ydCkuXHJcblx0XHRpZiAoIG9yZGVyZWQubGVuZ3RoICYmIHR5cGVvZiBvcmRlcmVkWzBdWzBdID09PSBcIm9iamVjdFwiICkge1xyXG5cdFx0XHRvcmRlcmVkLnNvcnQoZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gYVswXVswXSAtIGJbMF1bMF07IH0pO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0b3JkZXJlZC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIGFbMF0gLSBiWzBdOyB9KTtcclxuXHRcdH1cclxuXHJcblxyXG5cdFx0Ly8gQ29udmVydCBhbGwgZW50cmllcyB0byBzdWJyYW5nZXMuXHJcblx0XHRmb3IgKCBpbmRleCA9IDA7IGluZGV4IDwgb3JkZXJlZC5sZW5ndGg7IGluZGV4KysgKSB7XHJcblx0XHRcdGhhbmRsZUVudHJ5UG9pbnQob3JkZXJlZFtpbmRleF1bMV0sIG9yZGVyZWRbaW5kZXhdWzBdLCB0aGlzKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBTdG9yZSB0aGUgYWN0dWFsIHN0ZXAgdmFsdWVzLlxyXG5cdFx0Ly8geFN0ZXBzIGlzIHNvcnRlZCBpbiB0aGUgc2FtZSBvcmRlciBhcyB4UGN0IGFuZCB4VmFsLlxyXG5cdFx0dGhpcy54TnVtU3RlcHMgPSB0aGlzLnhTdGVwcy5zbGljZSgwKTtcclxuXHJcblx0XHQvLyBDb252ZXJ0IGFsbCBudW1lcmljIHN0ZXBzIHRvIHRoZSBwZXJjZW50YWdlIG9mIHRoZSBzdWJyYW5nZSB0aGV5IHJlcHJlc2VudC5cclxuXHRcdGZvciAoIGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnhOdW1TdGVwcy5sZW5ndGg7IGluZGV4KysgKSB7XHJcblx0XHRcdGhhbmRsZVN0ZXBQb2ludChpbmRleCwgdGhpcy54TnVtU3RlcHNbaW5kZXhdLCB0aGlzKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdFNwZWN0cnVtLnByb3RvdHlwZS5nZXRNYXJnaW4gPSBmdW5jdGlvbiAoIHZhbHVlICkge1xyXG5cclxuXHRcdHZhciBzdGVwID0gdGhpcy54TnVtU3RlcHNbMF07XHJcblxyXG5cdFx0aWYgKCBzdGVwICYmICgodmFsdWUgLyBzdGVwKSAlIDEpICE9PSAwICkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6ICdsaW1pdCcsICdtYXJnaW4nIGFuZCAncGFkZGluZycgbXVzdCBiZSBkaXZpc2libGUgYnkgc3RlcC5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMueFBjdC5sZW5ndGggPT09IDIgPyBmcm9tUGVyY2VudGFnZSh0aGlzLnhWYWwsIHZhbHVlKSA6IGZhbHNlO1xyXG5cdH07XHJcblxyXG5cdFNwZWN0cnVtLnByb3RvdHlwZS50b1N0ZXBwaW5nID0gZnVuY3Rpb24gKCB2YWx1ZSApIHtcclxuXHJcblx0XHR2YWx1ZSA9IHRvU3RlcHBpbmcoIHRoaXMueFZhbCwgdGhpcy54UGN0LCB2YWx1ZSApO1xyXG5cclxuXHRcdHJldHVybiB2YWx1ZTtcclxuXHR9O1xyXG5cclxuXHRTcGVjdHJ1bS5wcm90b3R5cGUuZnJvbVN0ZXBwaW5nID0gZnVuY3Rpb24gKCB2YWx1ZSApIHtcclxuXHJcblx0XHRyZXR1cm4gZnJvbVN0ZXBwaW5nKCB0aGlzLnhWYWwsIHRoaXMueFBjdCwgdmFsdWUgKTtcclxuXHR9O1xyXG5cclxuXHRTcGVjdHJ1bS5wcm90b3R5cGUuZ2V0U3RlcCA9IGZ1bmN0aW9uICggdmFsdWUgKSB7XHJcblxyXG5cdFx0dmFsdWUgPSBnZXRTdGVwKHRoaXMueFBjdCwgdGhpcy54U3RlcHMsIHRoaXMuc25hcCwgdmFsdWUgKTtcclxuXHJcblx0XHRyZXR1cm4gdmFsdWU7XHJcblx0fTtcclxuXHJcblx0U3BlY3RydW0ucHJvdG90eXBlLmdldE5lYXJieVN0ZXBzID0gZnVuY3Rpb24gKCB2YWx1ZSApIHtcclxuXHJcblx0XHR2YXIgaiA9IGdldEoodmFsdWUsIHRoaXMueFBjdCk7XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0c3RlcEJlZm9yZTogeyBzdGFydFZhbHVlOiB0aGlzLnhWYWxbai0yXSwgc3RlcDogdGhpcy54TnVtU3RlcHNbai0yXSwgaGlnaGVzdFN0ZXA6IHRoaXMueEhpZ2hlc3RDb21wbGV0ZVN0ZXBbai0yXSB9LFxyXG5cdFx0XHR0aGlzU3RlcDogeyBzdGFydFZhbHVlOiB0aGlzLnhWYWxbai0xXSwgc3RlcDogdGhpcy54TnVtU3RlcHNbai0xXSwgaGlnaGVzdFN0ZXA6IHRoaXMueEhpZ2hlc3RDb21wbGV0ZVN0ZXBbai0xXSB9LFxyXG5cdFx0XHRzdGVwQWZ0ZXI6IHsgc3RhcnRWYWx1ZTogdGhpcy54VmFsW2otMF0sIHN0ZXA6IHRoaXMueE51bVN0ZXBzW2otMF0sIGhpZ2hlc3RTdGVwOiB0aGlzLnhIaWdoZXN0Q29tcGxldGVTdGVwW2otMF0gfVxyXG5cdFx0fTtcclxuXHR9O1xyXG5cclxuXHRTcGVjdHJ1bS5wcm90b3R5cGUuY291bnRTdGVwRGVjaW1hbHMgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgc3RlcERlY2ltYWxzID0gdGhpcy54TnVtU3RlcHMubWFwKGNvdW50RGVjaW1hbHMpO1xyXG5cdFx0cmV0dXJuIE1hdGgubWF4LmFwcGx5KG51bGwsIHN0ZXBEZWNpbWFscyk7XHJcbiBcdH07XHJcblxyXG5cdC8vIE91dHNpZGUgdGVzdGluZ1xyXG5cdFNwZWN0cnVtLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24gKCB2YWx1ZSApIHtcclxuXHRcdHJldHVybiB0aGlzLmdldFN0ZXAodGhpcy50b1N0ZXBwaW5nKHZhbHVlKSk7XHJcblx0fTtcclxuXHJcbi8qXHRFdmVyeSBpbnB1dCBvcHRpb24gaXMgdGVzdGVkIGFuZCBwYXJzZWQuIFRoaXMnbGwgcHJldmVudFxyXG5cdGVuZGxlc3MgdmFsaWRhdGlvbiBpbiBpbnRlcm5hbCBtZXRob2RzLiBUaGVzZSB0ZXN0cyBhcmVcclxuXHRzdHJ1Y3R1cmVkIHdpdGggYW4gaXRlbSBmb3IgZXZlcnkgb3B0aW9uIGF2YWlsYWJsZS4gQW5cclxuXHRvcHRpb24gY2FuIGJlIG1hcmtlZCBhcyByZXF1aXJlZCBieSBzZXR0aW5nIHRoZSAncicgZmxhZy5cclxuXHRUaGUgdGVzdGluZyBmdW5jdGlvbiBpcyBwcm92aWRlZCB3aXRoIHRocmVlIGFyZ3VtZW50czpcclxuXHRcdC0gVGhlIHByb3ZpZGVkIHZhbHVlIGZvciB0aGUgb3B0aW9uO1xyXG5cdFx0LSBBIHJlZmVyZW5jZSB0byB0aGUgb3B0aW9ucyBvYmplY3Q7XHJcblx0XHQtIFRoZSBuYW1lIGZvciB0aGUgb3B0aW9uO1xyXG5cclxuXHRUaGUgdGVzdGluZyBmdW5jdGlvbiByZXR1cm5zIGZhbHNlIHdoZW4gYW4gZXJyb3IgaXMgZGV0ZWN0ZWQsXHJcblx0b3IgdHJ1ZSB3aGVuIGV2ZXJ5dGhpbmcgaXMgT0suIEl0IGNhbiBhbHNvIG1vZGlmeSB0aGUgb3B0aW9uXHJcblx0b2JqZWN0LCB0byBtYWtlIHN1cmUgYWxsIHZhbHVlcyBjYW4gYmUgY29ycmVjdGx5IGxvb3BlZCBlbHNld2hlcmUuICovXHJcblxyXG5cdHZhciBkZWZhdWx0Rm9ybWF0dGVyID0geyAndG8nOiBmdW5jdGlvbiggdmFsdWUgKXtcclxuXHRcdHJldHVybiB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlLnRvRml4ZWQoMik7XHJcblx0fSwgJ2Zyb20nOiBOdW1iZXIgfTtcclxuXHJcblx0ZnVuY3Rpb24gdmFsaWRhdGVGb3JtYXQgKCBlbnRyeSApIHtcclxuXHJcblx0XHQvLyBBbnkgb2JqZWN0IHdpdGggYSB0byBhbmQgZnJvbSBtZXRob2QgaXMgc3VwcG9ydGVkLlxyXG5cdFx0aWYgKCBpc1ZhbGlkRm9ybWF0dGVyKGVudHJ5KSApIHtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlciAoXCIgKyBWRVJTSU9OICsgXCIpOiAnZm9ybWF0JyByZXF1aXJlcyAndG8nIGFuZCAnZnJvbScgbWV0aG9kcy5cIik7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0ZXN0U3RlcCAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblxyXG5cdFx0aWYgKCAhaXNOdW1lcmljKCBlbnRyeSApICkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6ICdzdGVwJyBpcyBub3QgbnVtZXJpYy5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVGhlIHN0ZXAgb3B0aW9uIGNhbiBzdGlsbCBiZSB1c2VkIHRvIHNldCBzdGVwcGluZ1xyXG5cdFx0Ly8gZm9yIGxpbmVhciBzbGlkZXJzLiBPdmVyd3JpdHRlbiBpZiBzZXQgaW4gJ3JhbmdlJy5cclxuXHRcdHBhcnNlZC5zaW5nbGVTdGVwID0gZW50cnk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0ZXN0UmFuZ2UgKCBwYXJzZWQsIGVudHJ5ICkge1xyXG5cclxuXHRcdC8vIEZpbHRlciBpbmNvcnJlY3QgaW5wdXQuXHJcblx0XHRpZiAoIHR5cGVvZiBlbnRyeSAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShlbnRyeSkgKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXIgKFwiICsgVkVSU0lPTiArIFwiKTogJ3JhbmdlJyBpcyBub3QgYW4gb2JqZWN0LlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBDYXRjaCBtaXNzaW5nIHN0YXJ0IG9yIGVuZC5cclxuXHRcdGlmICggZW50cnkubWluID09PSB1bmRlZmluZWQgfHwgZW50cnkubWF4ID09PSB1bmRlZmluZWQgKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXIgKFwiICsgVkVSU0lPTiArIFwiKTogTWlzc2luZyAnbWluJyBvciAnbWF4JyBpbiAncmFuZ2UnLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBDYXRjaCBlcXVhbCBzdGFydCBvciBlbmQuXHJcblx0XHRpZiAoIGVudHJ5Lm1pbiA9PT0gZW50cnkubWF4ICkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6ICdyYW5nZScgJ21pbicgYW5kICdtYXgnIGNhbm5vdCBiZSBlcXVhbC5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0cGFyc2VkLnNwZWN0cnVtID0gbmV3IFNwZWN0cnVtKGVudHJ5LCBwYXJzZWQuc25hcCwgcGFyc2VkLnNpbmdsZVN0ZXApO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdGVzdFN0YXJ0ICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHRlbnRyeSA9IGFzQXJyYXkoZW50cnkpO1xyXG5cclxuXHRcdC8vIFZhbGlkYXRlIGlucHV0LiBWYWx1ZXMgYXJlbid0IHRlc3RlZCwgYXMgdGhlIHB1YmxpYyAudmFsIG1ldGhvZFxyXG5cdFx0Ly8gd2lsbCBhbHdheXMgcHJvdmlkZSBhIHZhbGlkIGxvY2F0aW9uLlxyXG5cdFx0aWYgKCAhQXJyYXkuaXNBcnJheSggZW50cnkgKSB8fCAhZW50cnkubGVuZ3RoICkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6ICdzdGFydCcgb3B0aW9uIGlzIGluY29ycmVjdC5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU3RvcmUgdGhlIG51bWJlciBvZiBoYW5kbGVzLlxyXG5cdFx0cGFyc2VkLmhhbmRsZXMgPSBlbnRyeS5sZW5ndGg7XHJcblxyXG5cdFx0Ly8gV2hlbiB0aGUgc2xpZGVyIGlzIGluaXRpYWxpemVkLCB0aGUgLnZhbCBtZXRob2Qgd2lsbFxyXG5cdFx0Ly8gYmUgY2FsbGVkIHdpdGggdGhlIHN0YXJ0IG9wdGlvbnMuXHJcblx0XHRwYXJzZWQuc3RhcnQgPSBlbnRyeTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RTbmFwICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHQvLyBFbmZvcmNlIDEwMCUgc3RlcHBpbmcgd2l0aGluIHN1YnJhbmdlcy5cclxuXHRcdHBhcnNlZC5zbmFwID0gZW50cnk7XHJcblxyXG5cdFx0aWYgKCB0eXBlb2YgZW50cnkgIT09ICdib29sZWFuJyApe1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6ICdzbmFwJyBvcHRpb24gbXVzdCBiZSBhIGJvb2xlYW4uXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdGVzdEFuaW1hdGUgKCBwYXJzZWQsIGVudHJ5ICkge1xyXG5cclxuXHRcdC8vIEVuZm9yY2UgMTAwJSBzdGVwcGluZyB3aXRoaW4gc3VicmFuZ2VzLlxyXG5cdFx0cGFyc2VkLmFuaW1hdGUgPSBlbnRyeTtcclxuXHJcblx0XHRpZiAoIHR5cGVvZiBlbnRyeSAhPT0gJ2Jvb2xlYW4nICl7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXIgKFwiICsgVkVSU0lPTiArIFwiKTogJ2FuaW1hdGUnIG9wdGlvbiBtdXN0IGJlIGEgYm9vbGVhbi5cIik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0ZXN0QW5pbWF0aW9uRHVyYXRpb24gKCBwYXJzZWQsIGVudHJ5ICkge1xyXG5cclxuXHRcdHBhcnNlZC5hbmltYXRpb25EdXJhdGlvbiA9IGVudHJ5O1xyXG5cclxuXHRcdGlmICggdHlwZW9mIGVudHJ5ICE9PSAnbnVtYmVyJyApe1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6ICdhbmltYXRpb25EdXJhdGlvbicgb3B0aW9uIG11c3QgYmUgYSBudW1iZXIuXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdGVzdENvbm5lY3QgKCBwYXJzZWQsIGVudHJ5ICkge1xyXG5cclxuXHRcdHZhciBjb25uZWN0ID0gW2ZhbHNlXTtcclxuXHRcdHZhciBpO1xyXG5cclxuXHRcdC8vIE1hcCBsZWdhY3kgb3B0aW9uc1xyXG5cdFx0aWYgKCBlbnRyeSA9PT0gJ2xvd2VyJyApIHtcclxuXHRcdFx0ZW50cnkgPSBbdHJ1ZSwgZmFsc2VdO1xyXG5cdFx0fVxyXG5cclxuXHRcdGVsc2UgaWYgKCBlbnRyeSA9PT0gJ3VwcGVyJyApIHtcclxuXHRcdFx0ZW50cnkgPSBbZmFsc2UsIHRydWVdO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEhhbmRsZSBib29sZWFuIG9wdGlvbnNcclxuXHRcdGlmICggZW50cnkgPT09IHRydWUgfHwgZW50cnkgPT09IGZhbHNlICkge1xyXG5cclxuXHRcdFx0Zm9yICggaSA9IDE7IGkgPCBwYXJzZWQuaGFuZGxlczsgaSsrICkge1xyXG5cdFx0XHRcdGNvbm5lY3QucHVzaChlbnRyeSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGNvbm5lY3QucHVzaChmYWxzZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gUmVqZWN0IGludmFsaWQgaW5wdXRcclxuXHRcdGVsc2UgaWYgKCAhQXJyYXkuaXNBcnJheSggZW50cnkgKSB8fCAhZW50cnkubGVuZ3RoIHx8IGVudHJ5Lmxlbmd0aCAhPT0gcGFyc2VkLmhhbmRsZXMgKyAxICkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6ICdjb25uZWN0JyBvcHRpb24gZG9lc24ndCBtYXRjaCBoYW5kbGUgY291bnQuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRjb25uZWN0ID0gZW50cnk7XHJcblx0XHR9XHJcblxyXG5cdFx0cGFyc2VkLmNvbm5lY3QgPSBjb25uZWN0O1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdGVzdE9yaWVudGF0aW9uICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHQvLyBTZXQgb3JpZW50YXRpb24gdG8gYW4gYSBudW1lcmljYWwgdmFsdWUgZm9yIGVhc3lcclxuXHRcdC8vIGFycmF5IHNlbGVjdGlvbi5cclxuXHRcdHN3aXRjaCAoIGVudHJ5ICl7XHJcblx0XHQgIGNhc2UgJ2hvcml6b250YWwnOlxyXG5cdFx0XHRwYXJzZWQub3J0ID0gMDtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHQgIGNhc2UgJ3ZlcnRpY2FsJzpcclxuXHRcdFx0cGFyc2VkLm9ydCA9IDE7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0ICBkZWZhdWx0OlxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6ICdvcmllbnRhdGlvbicgb3B0aW9uIGlzIGludmFsaWQuXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdGVzdE1hcmdpbiAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblxyXG5cdFx0aWYgKCAhaXNOdW1lcmljKGVudHJ5KSApe1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6ICdtYXJnaW4nIG9wdGlvbiBtdXN0IGJlIG51bWVyaWMuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIElzc3VlICM1ODJcclxuXHRcdGlmICggZW50cnkgPT09IDAgKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRwYXJzZWQubWFyZ2luID0gcGFyc2VkLnNwZWN0cnVtLmdldE1hcmdpbihlbnRyeSk7XHJcblxyXG5cdFx0aWYgKCAhcGFyc2VkLm1hcmdpbiApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlciAoXCIgKyBWRVJTSU9OICsgXCIpOiAnbWFyZ2luJyBvcHRpb24gaXMgb25seSBzdXBwb3J0ZWQgb24gbGluZWFyIHNsaWRlcnMuXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdGVzdExpbWl0ICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHRpZiAoICFpc051bWVyaWMoZW50cnkpICl7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXIgKFwiICsgVkVSU0lPTiArIFwiKTogJ2xpbWl0JyBvcHRpb24gbXVzdCBiZSBudW1lcmljLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHRwYXJzZWQubGltaXQgPSBwYXJzZWQuc3BlY3RydW0uZ2V0TWFyZ2luKGVudHJ5KTtcclxuXHJcblx0XHRpZiAoICFwYXJzZWQubGltaXQgfHwgcGFyc2VkLmhhbmRsZXMgPCAyICkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6ICdsaW1pdCcgb3B0aW9uIGlzIG9ubHkgc3VwcG9ydGVkIG9uIGxpbmVhciBzbGlkZXJzIHdpdGggMiBvciBtb3JlIGhhbmRsZXMuXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdGVzdFBhZGRpbmcgKCBwYXJzZWQsIGVudHJ5ICkge1xyXG5cclxuXHRcdGlmICggIWlzTnVtZXJpYyhlbnRyeSkgKXtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlciAoXCIgKyBWRVJTSU9OICsgXCIpOiAncGFkZGluZycgb3B0aW9uIG11c3QgYmUgbnVtZXJpYy5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCBlbnRyeSA9PT0gMCApIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdHBhcnNlZC5wYWRkaW5nID0gcGFyc2VkLnNwZWN0cnVtLmdldE1hcmdpbihlbnRyeSk7XHJcblxyXG5cdFx0aWYgKCAhcGFyc2VkLnBhZGRpbmcgKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXIgKFwiICsgVkVSU0lPTiArIFwiKTogJ3BhZGRpbmcnIG9wdGlvbiBpcyBvbmx5IHN1cHBvcnRlZCBvbiBsaW5lYXIgc2xpZGVycy5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCBwYXJzZWQucGFkZGluZyA8IDAgKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXIgKFwiICsgVkVSU0lPTiArIFwiKTogJ3BhZGRpbmcnIG9wdGlvbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIHBhcnNlZC5wYWRkaW5nID49IDUwICkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6ICdwYWRkaW5nJyBvcHRpb24gbXVzdCBiZSBsZXNzIHRoYW4gaGFsZiB0aGUgcmFuZ2UuXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdGVzdERpcmVjdGlvbiAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblxyXG5cdFx0Ly8gU2V0IGRpcmVjdGlvbiBhcyBhIG51bWVyaWNhbCB2YWx1ZSBmb3IgZWFzeSBwYXJzaW5nLlxyXG5cdFx0Ly8gSW52ZXJ0IGNvbm5lY3Rpb24gZm9yIFJUTCBzbGlkZXJzLCBzbyB0aGF0IHRoZSBwcm9wZXJcclxuXHRcdC8vIGhhbmRsZXMgZ2V0IHRoZSBjb25uZWN0L2JhY2tncm91bmQgY2xhc3Nlcy5cclxuXHRcdHN3aXRjaCAoIGVudHJ5ICkge1xyXG5cdFx0ICBjYXNlICdsdHInOlxyXG5cdFx0XHRwYXJzZWQuZGlyID0gMDtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHQgIGNhc2UgJ3J0bCc6XHJcblx0XHRcdHBhcnNlZC5kaXIgPSAxO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdCAgZGVmYXVsdDpcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlciAoXCIgKyBWRVJTSU9OICsgXCIpOiAnZGlyZWN0aW9uJyBvcHRpb24gd2FzIG5vdCByZWNvZ25pemVkLlwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RCZWhhdmlvdXIgKCBwYXJzZWQsIGVudHJ5ICkge1xyXG5cclxuXHRcdC8vIE1ha2Ugc3VyZSB0aGUgaW5wdXQgaXMgYSBzdHJpbmcuXHJcblx0XHRpZiAoIHR5cGVvZiBlbnRyeSAhPT0gJ3N0cmluZycgKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXIgKFwiICsgVkVSU0lPTiArIFwiKTogJ2JlaGF2aW91cicgbXVzdCBiZSBhIHN0cmluZyBjb250YWluaW5nIG9wdGlvbnMuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIENoZWNrIGlmIHRoZSBzdHJpbmcgY29udGFpbnMgYW55IGtleXdvcmRzLlxyXG5cdFx0Ly8gTm9uZSBhcmUgcmVxdWlyZWQuXHJcblx0XHR2YXIgdGFwID0gZW50cnkuaW5kZXhPZigndGFwJykgPj0gMDtcclxuXHRcdHZhciBkcmFnID0gZW50cnkuaW5kZXhPZignZHJhZycpID49IDA7XHJcblx0XHR2YXIgZml4ZWQgPSBlbnRyeS5pbmRleE9mKCdmaXhlZCcpID49IDA7XHJcblx0XHR2YXIgc25hcCA9IGVudHJ5LmluZGV4T2YoJ3NuYXAnKSA+PSAwO1xyXG5cdFx0dmFyIGhvdmVyID0gZW50cnkuaW5kZXhPZignaG92ZXInKSA+PSAwO1xyXG5cclxuXHRcdGlmICggZml4ZWQgKSB7XHJcblxyXG5cdFx0XHRpZiAoIHBhcnNlZC5oYW5kbGVzICE9PSAyICkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXIgKFwiICsgVkVSU0lPTiArIFwiKTogJ2ZpeGVkJyBiZWhhdmlvdXIgbXVzdCBiZSB1c2VkIHdpdGggMiBoYW5kbGVzXCIpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBVc2UgbWFyZ2luIHRvIGVuZm9yY2UgZml4ZWQgc3RhdGVcclxuXHRcdFx0dGVzdE1hcmdpbihwYXJzZWQsIHBhcnNlZC5zdGFydFsxXSAtIHBhcnNlZC5zdGFydFswXSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cGFyc2VkLmV2ZW50cyA9IHtcclxuXHRcdFx0dGFwOiB0YXAgfHwgc25hcCxcclxuXHRcdFx0ZHJhZzogZHJhZyxcclxuXHRcdFx0Zml4ZWQ6IGZpeGVkLFxyXG5cdFx0XHRzbmFwOiBzbmFwLFxyXG5cdFx0XHRob3ZlcjogaG92ZXJcclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0ZXN0VG9vbHRpcHMgKCBwYXJzZWQsIGVudHJ5ICkge1xyXG5cclxuXHRcdGlmICggZW50cnkgPT09IGZhbHNlICkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0ZWxzZSBpZiAoIGVudHJ5ID09PSB0cnVlICkge1xyXG5cclxuXHRcdFx0cGFyc2VkLnRvb2x0aXBzID0gW107XHJcblxyXG5cdFx0XHRmb3IgKCB2YXIgaSA9IDA7IGkgPCBwYXJzZWQuaGFuZGxlczsgaSsrICkge1xyXG5cdFx0XHRcdHBhcnNlZC50b29sdGlwcy5wdXNoKHRydWUpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0ZWxzZSB7XHJcblxyXG5cdFx0XHRwYXJzZWQudG9vbHRpcHMgPSBhc0FycmF5KGVudHJ5KTtcclxuXHJcblx0XHRcdGlmICggcGFyc2VkLnRvb2x0aXBzLmxlbmd0aCAhPT0gcGFyc2VkLmhhbmRsZXMgKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlciAoXCIgKyBWRVJTSU9OICsgXCIpOiBtdXN0IHBhc3MgYSBmb3JtYXR0ZXIgZm9yIGFsbCBoYW5kbGVzLlwiKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cGFyc2VkLnRvb2x0aXBzLmZvckVhY2goZnVuY3Rpb24oZm9ybWF0dGVyKXtcclxuXHRcdFx0XHRpZiAoIHR5cGVvZiBmb3JtYXR0ZXIgIT09ICdib29sZWFuJyAmJiAodHlwZW9mIGZvcm1hdHRlciAhPT0gJ29iamVjdCcgfHwgdHlwZW9mIGZvcm1hdHRlci50byAhPT0gJ2Z1bmN0aW9uJykgKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6ICd0b29sdGlwcycgbXVzdCBiZSBwYXNzZWQgYSBmb3JtYXR0ZXIgb3IgJ2ZhbHNlJy5cIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RBcmlhRm9ybWF0ICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHRcdHBhcnNlZC5hcmlhRm9ybWF0ID0gZW50cnk7XHJcblx0XHR2YWxpZGF0ZUZvcm1hdChlbnRyeSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0ZXN0Rm9ybWF0ICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHRcdHBhcnNlZC5mb3JtYXQgPSBlbnRyeTtcclxuXHRcdHZhbGlkYXRlRm9ybWF0KGVudHJ5KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RDc3NQcmVmaXggKCBwYXJzZWQsIGVudHJ5ICkge1xyXG5cclxuXHRcdGlmICggZW50cnkgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgZW50cnkgIT09ICdzdHJpbmcnICYmIGVudHJ5ICE9PSBmYWxzZSApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlciAoXCIgKyBWRVJTSU9OICsgXCIpOiAnY3NzUHJlZml4JyBtdXN0IGJlIGEgc3RyaW5nIG9yIGBmYWxzZWAuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHBhcnNlZC5jc3NQcmVmaXggPSBlbnRyeTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RDc3NDbGFzc2VzICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHRpZiAoIGVudHJ5ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGVudHJ5ICE9PSAnb2JqZWN0JyApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlciAoXCIgKyBWRVJTSU9OICsgXCIpOiAnY3NzQ2xhc3NlcycgbXVzdCBiZSBhbiBvYmplY3QuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICggdHlwZW9mIHBhcnNlZC5jc3NQcmVmaXggPT09ICdzdHJpbmcnICkge1xyXG5cdFx0XHRwYXJzZWQuY3NzQ2xhc3NlcyA9IHt9O1xyXG5cclxuXHRcdFx0Zm9yICggdmFyIGtleSBpbiBlbnRyeSApIHtcclxuXHRcdFx0XHRpZiAoICFlbnRyeS5oYXNPd25Qcm9wZXJ0eShrZXkpICkgeyBjb250aW51ZTsgfVxyXG5cclxuXHRcdFx0XHRwYXJzZWQuY3NzQ2xhc3Nlc1trZXldID0gcGFyc2VkLmNzc1ByZWZpeCArIGVudHJ5W2tleV07XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHBhcnNlZC5jc3NDbGFzc2VzID0gZW50cnk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0ZXN0VXNlUmFmICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHRcdGlmICggZW50cnkgPT09IHRydWUgfHwgZW50cnkgPT09IGZhbHNlICkge1xyXG5cdFx0XHRwYXJzZWQudXNlUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZW50cnk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6ICd1c2VSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnIG9wdGlvbiBzaG91bGQgYmUgdHJ1ZSAoZGVmYXVsdCkgb3IgZmFsc2UuXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gVGVzdCBhbGwgZGV2ZWxvcGVyIHNldHRpbmdzIGFuZCBwYXJzZSB0byBhc3N1bXB0aW9uLXNhZmUgdmFsdWVzLlxyXG5cdGZ1bmN0aW9uIHRlc3RPcHRpb25zICggb3B0aW9ucyApIHtcclxuXHJcblx0XHQvLyBUbyBwcm92ZSBhIGZpeCBmb3IgIzUzNywgZnJlZXplIG9wdGlvbnMgaGVyZS5cclxuXHRcdC8vIElmIHRoZSBvYmplY3QgaXMgbW9kaWZpZWQsIGFuIGVycm9yIHdpbGwgYmUgdGhyb3duLlxyXG5cdFx0Ly8gT2JqZWN0LmZyZWV6ZShvcHRpb25zKTtcclxuXHJcblx0XHR2YXIgcGFyc2VkID0ge1xyXG5cdFx0XHRtYXJnaW46IDAsXHJcblx0XHRcdGxpbWl0OiAwLFxyXG5cdFx0XHRwYWRkaW5nOiAwLFxyXG5cdFx0XHRhbmltYXRlOiB0cnVlLFxyXG5cdFx0XHRhbmltYXRpb25EdXJhdGlvbjogMzAwLFxyXG5cdFx0XHRhcmlhRm9ybWF0OiBkZWZhdWx0Rm9ybWF0dGVyLFxyXG5cdFx0XHRmb3JtYXQ6IGRlZmF1bHRGb3JtYXR0ZXJcclxuXHRcdH07XHJcblxyXG5cdFx0Ly8gVGVzdHMgYXJlIGV4ZWN1dGVkIGluIHRoZSBvcmRlciB0aGV5IGFyZSBwcmVzZW50ZWQgaGVyZS5cclxuXHRcdHZhciB0ZXN0cyA9IHtcclxuXHRcdFx0J3N0ZXAnOiB7IHI6IGZhbHNlLCB0OiB0ZXN0U3RlcCB9LFxyXG5cdFx0XHQnc3RhcnQnOiB7IHI6IHRydWUsIHQ6IHRlc3RTdGFydCB9LFxyXG5cdFx0XHQnY29ubmVjdCc6IHsgcjogdHJ1ZSwgdDogdGVzdENvbm5lY3QgfSxcclxuXHRcdFx0J2RpcmVjdGlvbic6IHsgcjogdHJ1ZSwgdDogdGVzdERpcmVjdGlvbiB9LFxyXG5cdFx0XHQnc25hcCc6IHsgcjogZmFsc2UsIHQ6IHRlc3RTbmFwIH0sXHJcblx0XHRcdCdhbmltYXRlJzogeyByOiBmYWxzZSwgdDogdGVzdEFuaW1hdGUgfSxcclxuXHRcdFx0J2FuaW1hdGlvbkR1cmF0aW9uJzogeyByOiBmYWxzZSwgdDogdGVzdEFuaW1hdGlvbkR1cmF0aW9uIH0sXHJcblx0XHRcdCdyYW5nZSc6IHsgcjogdHJ1ZSwgdDogdGVzdFJhbmdlIH0sXHJcblx0XHRcdCdvcmllbnRhdGlvbic6IHsgcjogZmFsc2UsIHQ6IHRlc3RPcmllbnRhdGlvbiB9LFxyXG5cdFx0XHQnbWFyZ2luJzogeyByOiBmYWxzZSwgdDogdGVzdE1hcmdpbiB9LFxyXG5cdFx0XHQnbGltaXQnOiB7IHI6IGZhbHNlLCB0OiB0ZXN0TGltaXQgfSxcclxuXHRcdFx0J3BhZGRpbmcnOiB7IHI6IGZhbHNlLCB0OiB0ZXN0UGFkZGluZyB9LFxyXG5cdFx0XHQnYmVoYXZpb3VyJzogeyByOiB0cnVlLCB0OiB0ZXN0QmVoYXZpb3VyIH0sXHJcblx0XHRcdCdhcmlhRm9ybWF0JzogeyByOiBmYWxzZSwgdDogdGVzdEFyaWFGb3JtYXQgfSxcclxuXHRcdFx0J2Zvcm1hdCc6IHsgcjogZmFsc2UsIHQ6IHRlc3RGb3JtYXQgfSxcclxuXHRcdFx0J3Rvb2x0aXBzJzogeyByOiBmYWxzZSwgdDogdGVzdFRvb2x0aXBzIH0sXHJcblx0XHRcdCdjc3NQcmVmaXgnOiB7IHI6IGZhbHNlLCB0OiB0ZXN0Q3NzUHJlZml4IH0sXHJcblx0XHRcdCdjc3NDbGFzc2VzJzogeyByOiBmYWxzZSwgdDogdGVzdENzc0NsYXNzZXMgfSxcclxuXHRcdFx0J3VzZVJlcXVlc3RBbmltYXRpb25GcmFtZSc6IHsgcjogZmFsc2UsIHQ6IHRlc3RVc2VSYWYgfVxyXG5cdFx0fTtcclxuXHJcblx0XHR2YXIgZGVmYXVsdHMgPSB7XHJcblx0XHRcdCdjb25uZWN0JzogZmFsc2UsXHJcblx0XHRcdCdkaXJlY3Rpb24nOiAnbHRyJyxcclxuXHRcdFx0J2JlaGF2aW91cic6ICd0YXAnLFxyXG5cdFx0XHQnb3JpZW50YXRpb24nOiAnaG9yaXpvbnRhbCcsXHJcblx0XHRcdCdjc3NQcmVmaXgnIDogJ25vVWktJyxcclxuXHRcdFx0J2Nzc0NsYXNzZXMnOiB7XHJcblx0XHRcdFx0dGFyZ2V0OiAndGFyZ2V0JyxcclxuXHRcdFx0XHRiYXNlOiAnYmFzZScsXHJcblx0XHRcdFx0b3JpZ2luOiAnb3JpZ2luJyxcclxuXHRcdFx0XHRoYW5kbGU6ICdoYW5kbGUnLFxyXG5cdFx0XHRcdGhhbmRsZUxvd2VyOiAnaGFuZGxlLWxvd2VyJyxcclxuXHRcdFx0XHRoYW5kbGVVcHBlcjogJ2hhbmRsZS11cHBlcicsXHJcblx0XHRcdFx0aG9yaXpvbnRhbDogJ2hvcml6b250YWwnLFxyXG5cdFx0XHRcdHZlcnRpY2FsOiAndmVydGljYWwnLFxyXG5cdFx0XHRcdGJhY2tncm91bmQ6ICdiYWNrZ3JvdW5kJyxcclxuXHRcdFx0XHRjb25uZWN0OiAnY29ubmVjdCcsXHJcblx0XHRcdFx0bHRyOiAnbHRyJyxcclxuXHRcdFx0XHRydGw6ICdydGwnLFxyXG5cdFx0XHRcdGRyYWdnYWJsZTogJ2RyYWdnYWJsZScsXHJcblx0XHRcdFx0ZHJhZzogJ3N0YXRlLWRyYWcnLFxyXG5cdFx0XHRcdHRhcDogJ3N0YXRlLXRhcCcsXHJcblx0XHRcdFx0YWN0aXZlOiAnYWN0aXZlJyxcclxuXHRcdFx0XHR0b29sdGlwOiAndG9vbHRpcCcsXHJcblx0XHRcdFx0cGlwczogJ3BpcHMnLFxyXG5cdFx0XHRcdHBpcHNIb3Jpem9udGFsOiAncGlwcy1ob3Jpem9udGFsJyxcclxuXHRcdFx0XHRwaXBzVmVydGljYWw6ICdwaXBzLXZlcnRpY2FsJyxcclxuXHRcdFx0XHRtYXJrZXI6ICdtYXJrZXInLFxyXG5cdFx0XHRcdG1hcmtlckhvcml6b250YWw6ICdtYXJrZXItaG9yaXpvbnRhbCcsXHJcblx0XHRcdFx0bWFya2VyVmVydGljYWw6ICdtYXJrZXItdmVydGljYWwnLFxyXG5cdFx0XHRcdG1hcmtlck5vcm1hbDogJ21hcmtlci1ub3JtYWwnLFxyXG5cdFx0XHRcdG1hcmtlckxhcmdlOiAnbWFya2VyLWxhcmdlJyxcclxuXHRcdFx0XHRtYXJrZXJTdWI6ICdtYXJrZXItc3ViJyxcclxuXHRcdFx0XHR2YWx1ZTogJ3ZhbHVlJyxcclxuXHRcdFx0XHR2YWx1ZUhvcml6b250YWw6ICd2YWx1ZS1ob3Jpem9udGFsJyxcclxuXHRcdFx0XHR2YWx1ZVZlcnRpY2FsOiAndmFsdWUtdmVydGljYWwnLFxyXG5cdFx0XHRcdHZhbHVlTm9ybWFsOiAndmFsdWUtbm9ybWFsJyxcclxuXHRcdFx0XHR2YWx1ZUxhcmdlOiAndmFsdWUtbGFyZ2UnLFxyXG5cdFx0XHRcdHZhbHVlU3ViOiAndmFsdWUtc3ViJ1xyXG5cdFx0XHR9LFxyXG5cdFx0XHQndXNlUmVxdWVzdEFuaW1hdGlvbkZyYW1lJzogdHJ1ZVxyXG5cdFx0fTtcclxuXHJcblx0XHQvLyBBcmlhRm9ybWF0IGRlZmF1bHRzIHRvIHJlZ3VsYXIgZm9ybWF0LCBpZiBhbnkuXHJcblx0XHRpZiAoIG9wdGlvbnMuZm9ybWF0ICYmICFvcHRpb25zLmFyaWFGb3JtYXQgKSB7XHJcblx0XHRcdG9wdGlvbnMuYXJpYUZvcm1hdCA9IG9wdGlvbnMuZm9ybWF0O1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFJ1biBhbGwgb3B0aW9ucyB0aHJvdWdoIGEgdGVzdGluZyBtZWNoYW5pc20gdG8gZW5zdXJlIGNvcnJlY3RcclxuXHRcdC8vIGlucHV0LiBJdCBzaG91bGQgYmUgbm90ZWQgdGhhdCBvcHRpb25zIG1pZ2h0IGdldCBtb2RpZmllZCB0b1xyXG5cdFx0Ly8gYmUgaGFuZGxlZCBwcm9wZXJseS4gRS5nLiB3cmFwcGluZyBpbnRlZ2VycyBpbiBhcnJheXMuXHJcblx0XHRPYmplY3Qua2V5cyh0ZXN0cykuZm9yRWFjaChmdW5jdGlvbiggbmFtZSApe1xyXG5cclxuXHRcdFx0Ly8gSWYgdGhlIG9wdGlvbiBpc24ndCBzZXQsIGJ1dCBpdCBpcyByZXF1aXJlZCwgdGhyb3cgYW4gZXJyb3IuXHJcblx0XHRcdGlmICggb3B0aW9uc1tuYW1lXSA9PT0gdW5kZWZpbmVkICYmIGRlZmF1bHRzW25hbWVdID09PSB1bmRlZmluZWQgKSB7XHJcblxyXG5cdFx0XHRcdGlmICggdGVzdHNbbmFtZV0uciApIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXIgKFwiICsgVkVSU0lPTiArIFwiKTogJ1wiICsgbmFtZSArIFwiJyBpcyByZXF1aXJlZC5cIik7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGVzdHNbbmFtZV0udCggcGFyc2VkLCBvcHRpb25zW25hbWVdID09PSB1bmRlZmluZWQgPyBkZWZhdWx0c1tuYW1lXSA6IG9wdGlvbnNbbmFtZV0gKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIEZvcndhcmQgcGlwcyBvcHRpb25zXHJcblx0XHRwYXJzZWQucGlwcyA9IG9wdGlvbnMucGlwcztcclxuXHJcblx0XHR2YXIgc3R5bGVzID0gW1snbGVmdCcsICd0b3AnXSwgWydyaWdodCcsICdib3R0b20nXV07XHJcblxyXG5cdFx0Ly8gUHJlLWRlZmluZSB0aGUgc3R5bGVzLlxyXG5cdFx0cGFyc2VkLnN0eWxlID0gc3R5bGVzW3BhcnNlZC5kaXJdW3BhcnNlZC5vcnRdO1xyXG5cdFx0cGFyc2VkLnN0eWxlT3Bvc2l0ZSA9IHN0eWxlc1twYXJzZWQuZGlyPzA6MV1bcGFyc2VkLm9ydF07XHJcblxyXG5cdFx0cmV0dXJuIHBhcnNlZDtcclxuXHR9XHJcblxyXG5cclxuZnVuY3Rpb24gY2xvc3VyZSAoIHRhcmdldCwgb3B0aW9ucywgb3JpZ2luYWxPcHRpb25zICl7XHJcblxyXG5cdHZhciBhY3Rpb25zID0gZ2V0QWN0aW9ucygpO1xyXG5cdHZhciBzdXBwb3J0c1RvdWNoQWN0aW9uTm9uZSA9IGdldFN1cHBvcnRzVG91Y2hBY3Rpb25Ob25lKCk7XHJcblx0dmFyIHN1cHBvcnRzUGFzc2l2ZSA9IHN1cHBvcnRzVG91Y2hBY3Rpb25Ob25lICYmIGdldFN1cHBvcnRzUGFzc2l2ZSgpO1xyXG5cclxuXHQvLyBBbGwgdmFyaWFibGVzIGxvY2FsIHRvICdjbG9zdXJlJyBhcmUgcHJlZml4ZWQgd2l0aCAnc2NvcGVfJ1xyXG5cdHZhciBzY29wZV9UYXJnZXQgPSB0YXJnZXQ7XHJcblx0dmFyIHNjb3BlX0xvY2F0aW9ucyA9IFtdO1xyXG5cdHZhciBzY29wZV9CYXNlO1xyXG5cdHZhciBzY29wZV9IYW5kbGVzO1xyXG5cdHZhciBzY29wZV9IYW5kbGVOdW1iZXJzID0gW107XHJcblx0dmFyIHNjb3BlX0FjdGl2ZUhhbmRsZSA9IGZhbHNlO1xyXG5cdHZhciBzY29wZV9Db25uZWN0cztcclxuXHR2YXIgc2NvcGVfU3BlY3RydW0gPSBvcHRpb25zLnNwZWN0cnVtO1xyXG5cdHZhciBzY29wZV9WYWx1ZXMgPSBbXTtcclxuXHR2YXIgc2NvcGVfRXZlbnRzID0ge307XHJcblx0dmFyIHNjb3BlX1NlbGY7XHJcblx0dmFyIHNjb3BlX1BpcHM7XHJcblx0dmFyIHNjb3BlX0xpc3RlbmVycyA9IG51bGw7XHJcblx0dmFyIHNjb3BlX0RvY3VtZW50ID0gdGFyZ2V0Lm93bmVyRG9jdW1lbnQ7XHJcblx0dmFyIHNjb3BlX0RvY3VtZW50RWxlbWVudCA9IHNjb3BlX0RvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcclxuXHR2YXIgc2NvcGVfQm9keSA9IHNjb3BlX0RvY3VtZW50LmJvZHk7XHJcblxyXG5cclxuXHQvLyBDcmVhdGVzIGEgbm9kZSwgYWRkcyBpdCB0byB0YXJnZXQsIHJldHVybnMgdGhlIG5ldyBub2RlLlxyXG5cdGZ1bmN0aW9uIGFkZE5vZGVUbyAoIHRhcmdldCwgY2xhc3NOYW1lICkge1xyXG5cclxuXHRcdHZhciBkaXYgPSBzY29wZV9Eb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcblx0XHRpZiAoIGNsYXNzTmFtZSApIHtcclxuXHRcdFx0YWRkQ2xhc3MoZGl2LCBjbGFzc05hbWUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRhcmdldC5hcHBlbmRDaGlsZChkaXYpO1xyXG5cclxuXHRcdHJldHVybiBkaXY7XHJcblx0fVxyXG5cclxuXHQvLyBBcHBlbmQgYSBvcmlnaW4gdG8gdGhlIGJhc2VcclxuXHRmdW5jdGlvbiBhZGRPcmlnaW4gKCBiYXNlLCBoYW5kbGVOdW1iZXIgKSB7XHJcblxyXG5cdFx0dmFyIG9yaWdpbiA9IGFkZE5vZGVUbyhiYXNlLCBvcHRpb25zLmNzc0NsYXNzZXMub3JpZ2luKTtcclxuXHRcdHZhciBoYW5kbGUgPSBhZGROb2RlVG8ob3JpZ2luLCBvcHRpb25zLmNzc0NsYXNzZXMuaGFuZGxlKTtcclxuXHJcblx0XHRoYW5kbGUuc2V0QXR0cmlidXRlKCdkYXRhLWhhbmRsZScsIGhhbmRsZU51bWJlcik7XHJcblxyXG5cdFx0Ly8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSFRNTC9HbG9iYWxfYXR0cmlidXRlcy90YWJpbmRleFxyXG5cdFx0Ly8gMCA9IGZvY3VzYWJsZSBhbmQgcmVhY2hhYmxlXHJcblx0XHRoYW5kbGUuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICcwJyk7XHJcblx0XHRoYW5kbGUuc2V0QXR0cmlidXRlKCdyb2xlJywgJ3NsaWRlcicpO1xyXG5cdFx0aGFuZGxlLnNldEF0dHJpYnV0ZSgnYXJpYS1vcmllbnRhdGlvbicsIG9wdGlvbnMub3J0ID8gJ3ZlcnRpY2FsJyA6ICdob3Jpem9udGFsJyk7XHJcblxyXG5cdFx0aWYgKCBoYW5kbGVOdW1iZXIgPT09IDAgKSB7XHJcblx0XHRcdGFkZENsYXNzKGhhbmRsZSwgb3B0aW9ucy5jc3NDbGFzc2VzLmhhbmRsZUxvd2VyKTtcclxuXHRcdH1cclxuXHJcblx0XHRlbHNlIGlmICggaGFuZGxlTnVtYmVyID09PSBvcHRpb25zLmhhbmRsZXMgLSAxICkge1xyXG5cdFx0XHRhZGRDbGFzcyhoYW5kbGUsIG9wdGlvbnMuY3NzQ2xhc3Nlcy5oYW5kbGVVcHBlcik7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG9yaWdpbjtcclxuXHR9XHJcblxyXG5cdC8vIEluc2VydCBub2RlcyBmb3IgY29ubmVjdCBlbGVtZW50c1xyXG5cdGZ1bmN0aW9uIGFkZENvbm5lY3QgKCBiYXNlLCBhZGQgKSB7XHJcblxyXG5cdFx0aWYgKCAhYWRkICkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGFkZE5vZGVUbyhiYXNlLCBvcHRpb25zLmNzc0NsYXNzZXMuY29ubmVjdCk7XHJcblx0fVxyXG5cclxuXHQvLyBBZGQgaGFuZGxlcyB0byB0aGUgc2xpZGVyIGJhc2UuXHJcblx0ZnVuY3Rpb24gYWRkRWxlbWVudHMgKCBjb25uZWN0T3B0aW9ucywgYmFzZSApIHtcclxuXHJcblx0XHRzY29wZV9IYW5kbGVzID0gW107XHJcblx0XHRzY29wZV9Db25uZWN0cyA9IFtdO1xyXG5cclxuXHRcdHNjb3BlX0Nvbm5lY3RzLnB1c2goYWRkQ29ubmVjdChiYXNlLCBjb25uZWN0T3B0aW9uc1swXSkpO1xyXG5cclxuXHRcdC8vIFs6Ojo6Tz09PT1PPT09PU89PT09XVxyXG5cdFx0Ly8gY29ubmVjdE9wdGlvbnMgPSBbMCwgMSwgMSwgMV1cclxuXHJcblx0XHRmb3IgKCB2YXIgaSA9IDA7IGkgPCBvcHRpb25zLmhhbmRsZXM7IGkrKyApIHtcclxuXHRcdFx0Ly8gS2VlcCBhIGxpc3Qgb2YgYWxsIGFkZGVkIGhhbmRsZXMuXHJcblx0XHRcdHNjb3BlX0hhbmRsZXMucHVzaChhZGRPcmlnaW4oYmFzZSwgaSkpO1xyXG5cdFx0XHRzY29wZV9IYW5kbGVOdW1iZXJzW2ldID0gaTtcclxuXHRcdFx0c2NvcGVfQ29ubmVjdHMucHVzaChhZGRDb25uZWN0KGJhc2UsIGNvbm5lY3RPcHRpb25zW2kgKyAxXSkpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gSW5pdGlhbGl6ZSBhIHNpbmdsZSBzbGlkZXIuXHJcblx0ZnVuY3Rpb24gYWRkU2xpZGVyICggdGFyZ2V0ICkge1xyXG5cclxuXHRcdC8vIEFwcGx5IGNsYXNzZXMgYW5kIGRhdGEgdG8gdGhlIHRhcmdldC5cclxuXHRcdGFkZENsYXNzKHRhcmdldCwgb3B0aW9ucy5jc3NDbGFzc2VzLnRhcmdldCk7XHJcblxyXG5cdFx0aWYgKCBvcHRpb25zLmRpciA9PT0gMCApIHtcclxuXHRcdFx0YWRkQ2xhc3ModGFyZ2V0LCBvcHRpb25zLmNzc0NsYXNzZXMubHRyKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGFkZENsYXNzKHRhcmdldCwgb3B0aW9ucy5jc3NDbGFzc2VzLnJ0bCk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCBvcHRpb25zLm9ydCA9PT0gMCApIHtcclxuXHRcdFx0YWRkQ2xhc3ModGFyZ2V0LCBvcHRpb25zLmNzc0NsYXNzZXMuaG9yaXpvbnRhbCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRhZGRDbGFzcyh0YXJnZXQsIG9wdGlvbnMuY3NzQ2xhc3Nlcy52ZXJ0aWNhbCk7XHJcblx0XHR9XHJcblxyXG5cdFx0c2NvcGVfQmFzZSA9IGFkZE5vZGVUbyh0YXJnZXQsIG9wdGlvbnMuY3NzQ2xhc3Nlcy5iYXNlKTtcclxuXHR9XHJcblxyXG5cclxuXHRmdW5jdGlvbiBhZGRUb29sdGlwICggaGFuZGxlLCBoYW5kbGVOdW1iZXIgKSB7XHJcblxyXG5cdFx0aWYgKCAhb3B0aW9ucy50b29sdGlwc1toYW5kbGVOdW1iZXJdICkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGFkZE5vZGVUbyhoYW5kbGUuZmlyc3RDaGlsZCwgb3B0aW9ucy5jc3NDbGFzc2VzLnRvb2x0aXApO1xyXG5cdH1cclxuXHJcblx0Ly8gVGhlIHRvb2x0aXBzIG9wdGlvbiBpcyBhIHNob3J0aGFuZCBmb3IgdXNpbmcgdGhlICd1cGRhdGUnIGV2ZW50LlxyXG5cdGZ1bmN0aW9uIHRvb2x0aXBzICggKSB7XHJcblxyXG5cdFx0Ly8gVG9vbHRpcHMgYXJlIGFkZGVkIHdpdGggb3B0aW9ucy50b29sdGlwcyBpbiBvcmlnaW5hbCBvcmRlci5cclxuXHRcdHZhciB0aXBzID0gc2NvcGVfSGFuZGxlcy5tYXAoYWRkVG9vbHRpcCk7XHJcblxyXG5cdFx0YmluZEV2ZW50KCd1cGRhdGUnLCBmdW5jdGlvbih2YWx1ZXMsIGhhbmRsZU51bWJlciwgdW5lbmNvZGVkKSB7XHJcblxyXG5cdFx0XHRpZiAoICF0aXBzW2hhbmRsZU51bWJlcl0gKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR2YXIgZm9ybWF0dGVkVmFsdWUgPSB2YWx1ZXNbaGFuZGxlTnVtYmVyXTtcclxuXHJcblx0XHRcdGlmICggb3B0aW9ucy50b29sdGlwc1toYW5kbGVOdW1iZXJdICE9PSB0cnVlICkge1xyXG5cdFx0XHRcdGZvcm1hdHRlZFZhbHVlID0gb3B0aW9ucy50b29sdGlwc1toYW5kbGVOdW1iZXJdLnRvKHVuZW5jb2RlZFtoYW5kbGVOdW1iZXJdKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGlwc1toYW5kbGVOdW1iZXJdLmlubmVySFRNTCA9IGZvcm1hdHRlZFZhbHVlO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHJcblx0ZnVuY3Rpb24gYXJpYSAoICkge1xyXG5cclxuXHRcdGJpbmRFdmVudCgndXBkYXRlJywgZnVuY3Rpb24gKCB2YWx1ZXMsIGhhbmRsZU51bWJlciwgdW5lbmNvZGVkLCB0YXAsIHBvc2l0aW9ucyApIHtcclxuXHJcblx0XHRcdC8vIFVwZGF0ZSBBcmlhIFZhbHVlcyBmb3IgYWxsIGhhbmRsZXMsIGFzIGEgY2hhbmdlIGluIG9uZSBjaGFuZ2VzIG1pbiBhbmQgbWF4IHZhbHVlcyBmb3IgdGhlIG5leHQuXHJcblx0XHRcdHNjb3BlX0hhbmRsZU51bWJlcnMuZm9yRWFjaChmdW5jdGlvbiggaGFuZGxlTnVtYmVyICl7XHJcblxyXG5cdFx0XHRcdHZhciBoYW5kbGUgPSBzY29wZV9IYW5kbGVzW2hhbmRsZU51bWJlcl07XHJcblxyXG5cdFx0XHRcdHZhciBtaW4gPSBjaGVja0hhbmRsZVBvc2l0aW9uKHNjb3BlX0xvY2F0aW9ucywgaGFuZGxlTnVtYmVyLCAwLCB0cnVlLCB0cnVlLCB0cnVlKTtcclxuXHRcdFx0XHR2YXIgbWF4ID0gY2hlY2tIYW5kbGVQb3NpdGlvbihzY29wZV9Mb2NhdGlvbnMsIGhhbmRsZU51bWJlciwgMTAwLCB0cnVlLCB0cnVlLCB0cnVlKTtcclxuXHJcblx0XHRcdFx0dmFyIG5vdyA9IHBvc2l0aW9uc1toYW5kbGVOdW1iZXJdO1xyXG5cdFx0XHRcdHZhciB0ZXh0ID0gb3B0aW9ucy5hcmlhRm9ybWF0LnRvKHVuZW5jb2RlZFtoYW5kbGVOdW1iZXJdKTtcclxuXHJcblx0XHRcdFx0aGFuZGxlLmNoaWxkcmVuWzBdLnNldEF0dHJpYnV0ZSgnYXJpYS12YWx1ZW1pbicsIG1pbi50b0ZpeGVkKDEpKTtcclxuXHRcdFx0XHRoYW5kbGUuY2hpbGRyZW5bMF0uc2V0QXR0cmlidXRlKCdhcmlhLXZhbHVlbWF4JywgbWF4LnRvRml4ZWQoMSkpO1xyXG5cdFx0XHRcdGhhbmRsZS5jaGlsZHJlblswXS5zZXRBdHRyaWJ1dGUoJ2FyaWEtdmFsdWVub3cnLCBub3cudG9GaXhlZCgxKSk7XHJcblx0XHRcdFx0aGFuZGxlLmNoaWxkcmVuWzBdLnNldEF0dHJpYnV0ZSgnYXJpYS12YWx1ZXRleHQnLCB0ZXh0KTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cclxuXHRmdW5jdGlvbiBnZXRHcm91cCAoIG1vZGUsIHZhbHVlcywgc3RlcHBlZCApIHtcclxuXHJcblx0XHQvLyBVc2UgdGhlIHJhbmdlLlxyXG5cdFx0aWYgKCBtb2RlID09PSAncmFuZ2UnIHx8IG1vZGUgPT09ICdzdGVwcycgKSB7XHJcblx0XHRcdHJldHVybiBzY29wZV9TcGVjdHJ1bS54VmFsO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICggbW9kZSA9PT0gJ2NvdW50JyApIHtcclxuXHJcblx0XHRcdGlmICggIXZhbHVlcyApIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyIChcIiArIFZFUlNJT04gKyBcIik6ICd2YWx1ZXMnIHJlcXVpcmVkIGZvciBtb2RlICdjb3VudCcuXCIpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBEaXZpZGUgMCAtIDEwMCBpbiAnY291bnQnIHBhcnRzLlxyXG5cdFx0XHR2YXIgc3ByZWFkID0gKCAxMDAgLyAodmFsdWVzIC0gMSkgKTtcclxuXHRcdFx0dmFyIHY7XHJcblx0XHRcdHZhciBpID0gMDtcclxuXHJcblx0XHRcdHZhbHVlcyA9IFtdO1xyXG5cclxuXHRcdFx0Ly8gTGlzdCB0aGVzZSBwYXJ0cyBhbmQgaGF2ZSB0aGVtIGhhbmRsZWQgYXMgJ3Bvc2l0aW9ucycuXHJcblx0XHRcdHdoaWxlICggKHYgPSBpKysgKiBzcHJlYWQpIDw9IDEwMCApIHtcclxuXHRcdFx0XHR2YWx1ZXMucHVzaCh2KTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bW9kZSA9ICdwb3NpdGlvbnMnO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICggbW9kZSA9PT0gJ3Bvc2l0aW9ucycgKSB7XHJcblxyXG5cdFx0XHQvLyBNYXAgYWxsIHBlcmNlbnRhZ2VzIHRvIG9uLXJhbmdlIHZhbHVlcy5cclxuXHRcdFx0cmV0dXJuIHZhbHVlcy5tYXAoZnVuY3Rpb24oIHZhbHVlICl7XHJcblx0XHRcdFx0cmV0dXJuIHNjb3BlX1NwZWN0cnVtLmZyb21TdGVwcGluZyggc3RlcHBlZCA/IHNjb3BlX1NwZWN0cnVtLmdldFN0ZXAoIHZhbHVlICkgOiB2YWx1ZSApO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIG1vZGUgPT09ICd2YWx1ZXMnICkge1xyXG5cclxuXHRcdFx0Ly8gSWYgdGhlIHZhbHVlIG11c3QgYmUgc3RlcHBlZCwgaXQgbmVlZHMgdG8gYmUgY29udmVydGVkIHRvIGEgcGVyY2VudGFnZSBmaXJzdC5cclxuXHRcdFx0aWYgKCBzdGVwcGVkICkge1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gdmFsdWVzLm1hcChmdW5jdGlvbiggdmFsdWUgKXtcclxuXHJcblx0XHRcdFx0XHQvLyBDb252ZXJ0IHRvIHBlcmNlbnRhZ2UsIGFwcGx5IHN0ZXAsIHJldHVybiB0byB2YWx1ZS5cclxuXHRcdFx0XHRcdHJldHVybiBzY29wZV9TcGVjdHJ1bS5mcm9tU3RlcHBpbmcoIHNjb3BlX1NwZWN0cnVtLmdldFN0ZXAoIHNjb3BlX1NwZWN0cnVtLnRvU3RlcHBpbmcoIHZhbHVlICkgKSApO1xyXG5cdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gT3RoZXJ3aXNlLCB3ZSBjYW4gc2ltcGx5IHVzZSB0aGUgdmFsdWVzLlxyXG5cdFx0XHRyZXR1cm4gdmFsdWVzO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2VuZXJhdGVTcHJlYWQgKCBkZW5zaXR5LCBtb2RlLCBncm91cCApIHtcclxuXHJcblx0XHRmdW5jdGlvbiBzYWZlSW5jcmVtZW50KHZhbHVlLCBpbmNyZW1lbnQpIHtcclxuXHRcdFx0Ly8gQXZvaWQgZmxvYXRpbmcgcG9pbnQgdmFyaWFuY2UgYnkgZHJvcHBpbmcgdGhlIHNtYWxsZXN0IGRlY2ltYWwgcGxhY2VzLlxyXG5cdFx0XHRyZXR1cm4gKHZhbHVlICsgaW5jcmVtZW50KS50b0ZpeGVkKDcpIC8gMTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgaW5kZXhlcyA9IHt9O1xyXG5cdFx0dmFyIGZpcnN0SW5SYW5nZSA9IHNjb3BlX1NwZWN0cnVtLnhWYWxbMF07XHJcblx0XHR2YXIgbGFzdEluUmFuZ2UgPSBzY29wZV9TcGVjdHJ1bS54VmFsW3Njb3BlX1NwZWN0cnVtLnhWYWwubGVuZ3RoLTFdO1xyXG5cdFx0dmFyIGlnbm9yZUZpcnN0ID0gZmFsc2U7XHJcblx0XHR2YXIgaWdub3JlTGFzdCA9IGZhbHNlO1xyXG5cdFx0dmFyIHByZXZQY3QgPSAwO1xyXG5cclxuXHRcdC8vIENyZWF0ZSBhIGNvcHkgb2YgdGhlIGdyb3VwLCBzb3J0IGl0IGFuZCBmaWx0ZXIgYXdheSBhbGwgZHVwbGljYXRlcy5cclxuXHRcdGdyb3VwID0gdW5pcXVlKGdyb3VwLnNsaWNlKCkuc29ydChmdW5jdGlvbihhLCBiKXsgcmV0dXJuIGEgLSBiOyB9KSk7XHJcblxyXG5cdFx0Ly8gTWFrZSBzdXJlIHRoZSByYW5nZSBzdGFydHMgd2l0aCB0aGUgZmlyc3QgZWxlbWVudC5cclxuXHRcdGlmICggZ3JvdXBbMF0gIT09IGZpcnN0SW5SYW5nZSApIHtcclxuXHRcdFx0Z3JvdXAudW5zaGlmdChmaXJzdEluUmFuZ2UpO1xyXG5cdFx0XHRpZ25vcmVGaXJzdCA9IHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gTGlrZXdpc2UgZm9yIHRoZSBsYXN0IG9uZS5cclxuXHRcdGlmICggZ3JvdXBbZ3JvdXAubGVuZ3RoIC0gMV0gIT09IGxhc3RJblJhbmdlICkge1xyXG5cdFx0XHRncm91cC5wdXNoKGxhc3RJblJhbmdlKTtcclxuXHRcdFx0aWdub3JlTGFzdCA9IHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0Z3JvdXAuZm9yRWFjaChmdW5jdGlvbiAoIGN1cnJlbnQsIGluZGV4ICkge1xyXG5cclxuXHRcdFx0Ly8gR2V0IHRoZSBjdXJyZW50IHN0ZXAgYW5kIHRoZSBsb3dlciArIHVwcGVyIHBvc2l0aW9ucy5cclxuXHRcdFx0dmFyIHN0ZXA7XHJcblx0XHRcdHZhciBpO1xyXG5cdFx0XHR2YXIgcTtcclxuXHRcdFx0dmFyIGxvdyA9IGN1cnJlbnQ7XHJcblx0XHRcdHZhciBoaWdoID0gZ3JvdXBbaW5kZXgrMV07XHJcblx0XHRcdHZhciBuZXdQY3Q7XHJcblx0XHRcdHZhciBwY3REaWZmZXJlbmNlO1xyXG5cdFx0XHR2YXIgcGN0UG9zO1xyXG5cdFx0XHR2YXIgdHlwZTtcclxuXHRcdFx0dmFyIHN0ZXBzO1xyXG5cdFx0XHR2YXIgcmVhbFN0ZXBzO1xyXG5cdFx0XHR2YXIgc3RlcHNpemU7XHJcblxyXG5cdFx0XHQvLyBXaGVuIHVzaW5nICdzdGVwcycgbW9kZSwgdXNlIHRoZSBwcm92aWRlZCBzdGVwcy5cclxuXHRcdFx0Ly8gT3RoZXJ3aXNlLCB3ZSdsbCBzdGVwIG9uIHRvIHRoZSBuZXh0IHN1YnJhbmdlLlxyXG5cdFx0XHRpZiAoIG1vZGUgPT09ICdzdGVwcycgKSB7XHJcblx0XHRcdFx0c3RlcCA9IHNjb3BlX1NwZWN0cnVtLnhOdW1TdGVwc1sgaW5kZXggXTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gRGVmYXVsdCB0byBhICdmdWxsJyBzdGVwLlxyXG5cdFx0XHRpZiAoICFzdGVwICkge1xyXG5cdFx0XHRcdHN0ZXAgPSBoaWdoLWxvdztcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gTG93IGNhbiBiZSAwLCBzbyB0ZXN0IGZvciBmYWxzZS4gSWYgaGlnaCBpcyB1bmRlZmluZWQsXHJcblx0XHRcdC8vIHdlIGFyZSBhdCB0aGUgbGFzdCBzdWJyYW5nZS4gSW5kZXggMCBpcyBhbHJlYWR5IGhhbmRsZWQuXHJcblx0XHRcdGlmICggbG93ID09PSBmYWxzZSB8fCBoaWdoID09PSB1bmRlZmluZWQgKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBNYWtlIHN1cmUgc3RlcCBpc24ndCAwLCB3aGljaCB3b3VsZCBjYXVzZSBhbiBpbmZpbml0ZSBsb29wICgjNjU0KVxyXG5cdFx0XHRzdGVwID0gTWF0aC5tYXgoc3RlcCwgMC4wMDAwMDAxKTtcclxuXHJcblx0XHRcdC8vIEZpbmQgYWxsIHN0ZXBzIGluIHRoZSBzdWJyYW5nZS5cclxuXHRcdFx0Zm9yICggaSA9IGxvdzsgaSA8PSBoaWdoOyBpID0gc2FmZUluY3JlbWVudChpLCBzdGVwKSApIHtcclxuXHJcblx0XHRcdFx0Ly8gR2V0IHRoZSBwZXJjZW50YWdlIHZhbHVlIGZvciB0aGUgY3VycmVudCBzdGVwLFxyXG5cdFx0XHRcdC8vIGNhbGN1bGF0ZSB0aGUgc2l6ZSBmb3IgdGhlIHN1YnJhbmdlLlxyXG5cdFx0XHRcdG5ld1BjdCA9IHNjb3BlX1NwZWN0cnVtLnRvU3RlcHBpbmcoIGkgKTtcclxuXHRcdFx0XHRwY3REaWZmZXJlbmNlID0gbmV3UGN0IC0gcHJldlBjdDtcclxuXHJcblx0XHRcdFx0c3RlcHMgPSBwY3REaWZmZXJlbmNlIC8gZGVuc2l0eTtcclxuXHRcdFx0XHRyZWFsU3RlcHMgPSBNYXRoLnJvdW5kKHN0ZXBzKTtcclxuXHJcblx0XHRcdFx0Ly8gVGhpcyByYXRpbyByZXByZXNlbnRzIHRoZSBhbW1vdW50IG9mIHBlcmNlbnRhZ2Utc3BhY2UgYSBwb2ludCBpbmRpY2F0ZXMuXHJcblx0XHRcdFx0Ly8gRm9yIGEgZGVuc2l0eSAxIHRoZSBwb2ludHMvcGVyY2VudGFnZSA9IDEuIEZvciBkZW5zaXR5IDIsIHRoYXQgcGVyY2VudGFnZSBuZWVkcyB0byBiZSByZS1kZXZpZGVkLlxyXG5cdFx0XHRcdC8vIFJvdW5kIHRoZSBwZXJjZW50YWdlIG9mZnNldCB0byBhbiBldmVuIG51bWJlciwgdGhlbiBkaXZpZGUgYnkgdHdvXHJcblx0XHRcdFx0Ly8gdG8gc3ByZWFkIHRoZSBvZmZzZXQgb24gYm90aCBzaWRlcyBvZiB0aGUgcmFuZ2UuXHJcblx0XHRcdFx0c3RlcHNpemUgPSBwY3REaWZmZXJlbmNlL3JlYWxTdGVwcztcclxuXHJcblx0XHRcdFx0Ly8gRGl2aWRlIGFsbCBwb2ludHMgZXZlbmx5LCBhZGRpbmcgdGhlIGNvcnJlY3QgbnVtYmVyIHRvIHRoaXMgc3VicmFuZ2UuXHJcblx0XHRcdFx0Ly8gUnVuIHVwIHRvIDw9IHNvIHRoYXQgMTAwJSBnZXRzIGEgcG9pbnQsIGV2ZW50IGlmIGlnbm9yZUxhc3QgaXMgc2V0LlxyXG5cdFx0XHRcdGZvciAoIHEgPSAxOyBxIDw9IHJlYWxTdGVwczsgcSArPSAxICkge1xyXG5cclxuXHRcdFx0XHRcdC8vIFRoZSByYXRpbyBiZXR3ZWVuIHRoZSByb3VuZGVkIHZhbHVlIGFuZCB0aGUgYWN0dWFsIHNpemUgbWlnaHQgYmUgfjElIG9mZi5cclxuXHRcdFx0XHRcdC8vIENvcnJlY3QgdGhlIHBlcmNlbnRhZ2Ugb2Zmc2V0IGJ5IHRoZSBudW1iZXIgb2YgcG9pbnRzXHJcblx0XHRcdFx0XHQvLyBwZXIgc3VicmFuZ2UuIGRlbnNpdHkgPSAxIHdpbGwgcmVzdWx0IGluIDEwMCBwb2ludHMgb24gdGhlXHJcblx0XHRcdFx0XHQvLyBmdWxsIHJhbmdlLCAyIGZvciA1MCwgNCBmb3IgMjUsIGV0Yy5cclxuXHRcdFx0XHRcdHBjdFBvcyA9IHByZXZQY3QgKyAoIHEgKiBzdGVwc2l6ZSApO1xyXG5cdFx0XHRcdFx0aW5kZXhlc1twY3RQb3MudG9GaXhlZCg1KV0gPSBbJ3gnLCAwXTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdC8vIERldGVybWluZSB0aGUgcG9pbnQgdHlwZS5cclxuXHRcdFx0XHR0eXBlID0gKGdyb3VwLmluZGV4T2YoaSkgPiAtMSkgPyAxIDogKCBtb2RlID09PSAnc3RlcHMnID8gMiA6IDAgKTtcclxuXHJcblx0XHRcdFx0Ly8gRW5mb3JjZSB0aGUgJ2lnbm9yZUZpcnN0JyBvcHRpb24gYnkgb3ZlcndyaXRpbmcgdGhlIHR5cGUgZm9yIDAuXHJcblx0XHRcdFx0aWYgKCAhaW5kZXggJiYgaWdub3JlRmlyc3QgKSB7XHJcblx0XHRcdFx0XHR0eXBlID0gMDtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmICggIShpID09PSBoaWdoICYmIGlnbm9yZUxhc3QpKSB7XHJcblx0XHRcdFx0XHQvLyBNYXJrIHRoZSAndHlwZScgb2YgdGhpcyBwb2ludC4gMCA9IHBsYWluLCAxID0gcmVhbCB2YWx1ZSwgMiA9IHN0ZXAgdmFsdWUuXHJcblx0XHRcdFx0XHRpbmRleGVzW25ld1BjdC50b0ZpeGVkKDUpXSA9IFtpLCB0eXBlXTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdC8vIFVwZGF0ZSB0aGUgcGVyY2VudGFnZSBjb3VudC5cclxuXHRcdFx0XHRwcmV2UGN0ID0gbmV3UGN0O1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHRyZXR1cm4gaW5kZXhlcztcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGFkZE1hcmtpbmcgKCBzcHJlYWQsIGZpbHRlckZ1bmMsIGZvcm1hdHRlciApIHtcclxuXHJcblx0XHR2YXIgZWxlbWVudCA9IHNjb3BlX0RvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuXHRcdHZhciB2YWx1ZVNpemVDbGFzc2VzID0gW1xyXG5cdFx0XHRvcHRpb25zLmNzc0NsYXNzZXMudmFsdWVOb3JtYWwsXHJcblx0XHRcdG9wdGlvbnMuY3NzQ2xhc3Nlcy52YWx1ZUxhcmdlLFxyXG5cdFx0XHRvcHRpb25zLmNzc0NsYXNzZXMudmFsdWVTdWJcclxuXHRcdF07XHJcblx0XHR2YXIgbWFya2VyU2l6ZUNsYXNzZXMgPSBbXHJcblx0XHRcdG9wdGlvbnMuY3NzQ2xhc3Nlcy5tYXJrZXJOb3JtYWwsXHJcblx0XHRcdG9wdGlvbnMuY3NzQ2xhc3Nlcy5tYXJrZXJMYXJnZSxcclxuXHRcdFx0b3B0aW9ucy5jc3NDbGFzc2VzLm1hcmtlclN1YlxyXG5cdFx0XTtcclxuXHRcdHZhciB2YWx1ZU9yaWVudGF0aW9uQ2xhc3NlcyA9IFtcclxuXHRcdFx0b3B0aW9ucy5jc3NDbGFzc2VzLnZhbHVlSG9yaXpvbnRhbCxcclxuXHRcdFx0b3B0aW9ucy5jc3NDbGFzc2VzLnZhbHVlVmVydGljYWxcclxuXHRcdF07XHJcblx0XHR2YXIgbWFya2VyT3JpZW50YXRpb25DbGFzc2VzID0gW1xyXG5cdFx0XHRvcHRpb25zLmNzc0NsYXNzZXMubWFya2VySG9yaXpvbnRhbCxcclxuXHRcdFx0b3B0aW9ucy5jc3NDbGFzc2VzLm1hcmtlclZlcnRpY2FsXHJcblx0XHRdO1xyXG5cclxuXHRcdGFkZENsYXNzKGVsZW1lbnQsIG9wdGlvbnMuY3NzQ2xhc3Nlcy5waXBzKTtcclxuXHRcdGFkZENsYXNzKGVsZW1lbnQsIG9wdGlvbnMub3J0ID09PSAwID8gb3B0aW9ucy5jc3NDbGFzc2VzLnBpcHNIb3Jpem9udGFsIDogb3B0aW9ucy5jc3NDbGFzc2VzLnBpcHNWZXJ0aWNhbCk7XHJcblxyXG5cdFx0ZnVuY3Rpb24gZ2V0Q2xhc3NlcyggdHlwZSwgc291cmNlICl7XHJcblx0XHRcdHZhciBhID0gc291cmNlID09PSBvcHRpb25zLmNzc0NsYXNzZXMudmFsdWU7XHJcblx0XHRcdHZhciBvcmllbnRhdGlvbkNsYXNzZXMgPSBhID8gdmFsdWVPcmllbnRhdGlvbkNsYXNzZXMgOiBtYXJrZXJPcmllbnRhdGlvbkNsYXNzZXM7XHJcblx0XHRcdHZhciBzaXplQ2xhc3NlcyA9IGEgPyB2YWx1ZVNpemVDbGFzc2VzIDogbWFya2VyU2l6ZUNsYXNzZXM7XHJcblxyXG5cdFx0XHRyZXR1cm4gc291cmNlICsgJyAnICsgb3JpZW50YXRpb25DbGFzc2VzW29wdGlvbnMub3J0XSArICcgJyArIHNpemVDbGFzc2VzW3R5cGVdO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGFkZFNwcmVhZCAoIG9mZnNldCwgdmFsdWVzICl7XHJcblxyXG5cdFx0XHQvLyBBcHBseSB0aGUgZmlsdGVyIGZ1bmN0aW9uLCBpZiBpdCBpcyBzZXQuXHJcblx0XHRcdHZhbHVlc1sxXSA9ICh2YWx1ZXNbMV0gJiYgZmlsdGVyRnVuYykgPyBmaWx0ZXJGdW5jKHZhbHVlc1swXSwgdmFsdWVzWzFdKSA6IHZhbHVlc1sxXTtcclxuXHJcblx0XHRcdC8vIEFkZCBhIG1hcmtlciBmb3IgZXZlcnkgcG9pbnRcclxuXHRcdFx0dmFyIG5vZGUgPSBhZGROb2RlVG8oZWxlbWVudCwgZmFsc2UpO1xyXG5cdFx0XHRcdG5vZGUuY2xhc3NOYW1lID0gZ2V0Q2xhc3Nlcyh2YWx1ZXNbMV0sIG9wdGlvbnMuY3NzQ2xhc3Nlcy5tYXJrZXIpO1xyXG5cdFx0XHRcdG5vZGUuc3R5bGVbb3B0aW9ucy5zdHlsZV0gPSBvZmZzZXQgKyAnJSc7XHJcblxyXG5cdFx0XHQvLyBWYWx1ZXMgYXJlIG9ubHkgYXBwZW5kZWQgZm9yIHBvaW50cyBtYXJrZWQgJzEnIG9yICcyJy5cclxuXHRcdFx0aWYgKCB2YWx1ZXNbMV0gKSB7XHJcblx0XHRcdFx0bm9kZSA9IGFkZE5vZGVUbyhlbGVtZW50LCBmYWxzZSk7XHJcblx0XHRcdFx0bm9kZS5jbGFzc05hbWUgPSBnZXRDbGFzc2VzKHZhbHVlc1sxXSwgb3B0aW9ucy5jc3NDbGFzc2VzLnZhbHVlKTtcclxuXHRcdFx0XHRub2RlLnN0eWxlW29wdGlvbnMuc3R5bGVdID0gb2Zmc2V0ICsgJyUnO1xyXG5cdFx0XHRcdG5vZGUuaW5uZXJUZXh0ID0gZm9ybWF0dGVyLnRvKHZhbHVlc1swXSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvLyBBcHBlbmQgYWxsIHBvaW50cy5cclxuXHRcdE9iamVjdC5rZXlzKHNwcmVhZCkuZm9yRWFjaChmdW5jdGlvbihhKXtcclxuXHRcdFx0YWRkU3ByZWFkKGEsIHNwcmVhZFthXSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRyZXR1cm4gZWxlbWVudDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHJlbW92ZVBpcHMgKCApIHtcclxuXHRcdGlmICggc2NvcGVfUGlwcyApIHtcclxuXHRcdFx0cmVtb3ZlRWxlbWVudChzY29wZV9QaXBzKTtcclxuXHRcdFx0c2NvcGVfUGlwcyA9IG51bGw7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBwaXBzICggZ3JpZCApIHtcclxuXHJcblx0XHQvLyBGaXggIzY2OVxyXG5cdFx0cmVtb3ZlUGlwcygpO1xyXG5cclxuXHRcdHZhciBtb2RlID0gZ3JpZC5tb2RlO1xyXG5cdFx0dmFyIGRlbnNpdHkgPSBncmlkLmRlbnNpdHkgfHwgMTtcclxuXHRcdHZhciBmaWx0ZXIgPSBncmlkLmZpbHRlciB8fCBmYWxzZTtcclxuXHRcdHZhciB2YWx1ZXMgPSBncmlkLnZhbHVlcyB8fCBmYWxzZTtcclxuXHRcdHZhciBzdGVwcGVkID0gZ3JpZC5zdGVwcGVkIHx8IGZhbHNlO1xyXG5cdFx0dmFyIGdyb3VwID0gZ2V0R3JvdXAoIG1vZGUsIHZhbHVlcywgc3RlcHBlZCApO1xyXG5cdFx0dmFyIHNwcmVhZCA9IGdlbmVyYXRlU3ByZWFkKCBkZW5zaXR5LCBtb2RlLCBncm91cCApO1xyXG5cdFx0dmFyIGZvcm1hdCA9IGdyaWQuZm9ybWF0IHx8IHtcclxuXHRcdFx0dG86IE1hdGgucm91bmRcclxuXHRcdH07XHJcblxyXG5cdFx0c2NvcGVfUGlwcyA9IHNjb3BlX1RhcmdldC5hcHBlbmRDaGlsZChhZGRNYXJraW5nKFxyXG5cdFx0XHRzcHJlYWQsXHJcblx0XHRcdGZpbHRlcixcclxuXHRcdFx0Zm9ybWF0XHJcblx0XHQpKTtcclxuXHJcblx0XHRyZXR1cm4gc2NvcGVfUGlwcztcclxuXHR9XHJcblxyXG5cclxuXHQvLyBTaG9ydGhhbmQgZm9yIGJhc2UgZGltZW5zaW9ucy5cclxuXHRmdW5jdGlvbiBiYXNlU2l6ZSAoICkge1xyXG5cdFx0dmFyIHJlY3QgPSBzY29wZV9CYXNlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLCBhbHQgPSAnb2Zmc2V0JyArIFsnV2lkdGgnLCAnSGVpZ2h0J11bb3B0aW9ucy5vcnRdO1xyXG5cdFx0cmV0dXJuIG9wdGlvbnMub3J0ID09PSAwID8gKHJlY3Qud2lkdGh8fHNjb3BlX0Jhc2VbYWx0XSkgOiAocmVjdC5oZWlnaHR8fHNjb3BlX0Jhc2VbYWx0XSk7XHJcblx0fVxyXG5cclxuXHQvLyBIYW5kbGVyIGZvciBhdHRhY2hpbmcgZXZlbnRzIHRyb3VnaCBhIHByb3h5LlxyXG5cdGZ1bmN0aW9uIGF0dGFjaEV2ZW50ICggZXZlbnRzLCBlbGVtZW50LCBjYWxsYmFjaywgZGF0YSApIHtcclxuXHJcblx0XHQvLyBUaGlzIGZ1bmN0aW9uIGNhbiBiZSB1c2VkIHRvICdmaWx0ZXInIGV2ZW50cyB0byB0aGUgc2xpZGVyLlxyXG5cdFx0Ly8gZWxlbWVudCBpcyBhIG5vZGUsIG5vdCBhIG5vZGVMaXN0XHJcblxyXG5cdFx0dmFyIG1ldGhvZCA9IGZ1bmN0aW9uICggZSApe1xyXG5cclxuXHRcdFx0aWYgKCBzY29wZV9UYXJnZXQuaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpICkge1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gU3RvcCBpZiBhbiBhY3RpdmUgJ3RhcCcgdHJhbnNpdGlvbiBpcyB0YWtpbmcgcGxhY2UuXHJcblx0XHRcdGlmICggaGFzQ2xhc3Moc2NvcGVfVGFyZ2V0LCBvcHRpb25zLmNzc0NsYXNzZXMudGFwKSApIHtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGUgPSBmaXhFdmVudChlLCBkYXRhLnBhZ2VPZmZzZXQpO1xyXG5cclxuXHRcdFx0Ly8gSGFuZGxlIHJlamVjdCBvZiBtdWx0aXRvdWNoXHJcblx0XHRcdGlmICggIWUgKSB7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBJZ25vcmUgcmlnaHQgb3IgbWlkZGxlIGNsaWNrcyBvbiBzdGFydCAjNDU0XHJcblx0XHRcdGlmICggZXZlbnRzID09PSBhY3Rpb25zLnN0YXJ0ICYmIGUuYnV0dG9ucyAhPT0gdW5kZWZpbmVkICYmIGUuYnV0dG9ucyA+IDEgKSB7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBJZ25vcmUgcmlnaHQgb3IgbWlkZGxlIGNsaWNrcyBvbiBzdGFydCAjNDU0XHJcblx0XHRcdGlmICggZGF0YS5ob3ZlciAmJiBlLmJ1dHRvbnMgKSB7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyAnc3VwcG9ydHNQYXNzaXZlJyBpcyBvbmx5IHRydWUgaWYgYSBicm93c2VyIGFsc28gc3VwcG9ydHMgdG91Y2gtYWN0aW9uOiBub25lIGluIENTUy5cclxuXHRcdFx0Ly8gaU9TIHNhZmFyaSBkb2VzIG5vdCwgc28gaXQgZG9lc24ndCBnZXQgdG8gYmVuZWZpdCBmcm9tIHBhc3NpdmUgc2Nyb2xsaW5nLiBpT1MgZG9lcyBzdXBwb3J0XHJcblx0XHRcdC8vIHRvdWNoLWFjdGlvbjogbWFuaXB1bGF0aW9uLCBidXQgdGhhdCBhbGxvd3MgcGFubmluZywgd2hpY2ggYnJlYWtzXHJcblx0XHRcdC8vIHNsaWRlcnMgYWZ0ZXIgem9vbWluZy9vbiBub24tcmVzcG9uc2l2ZSBwYWdlcy5cclxuXHRcdFx0Ly8gU2VlOiBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTMzMTEyXHJcblx0XHRcdGlmICggIXN1cHBvcnRzUGFzc2l2ZSApIHtcclxuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGUuY2FsY1BvaW50ID0gZS5wb2ludHNbIG9wdGlvbnMub3J0IF07XHJcblxyXG5cdFx0XHQvLyBDYWxsIHRoZSBldmVudCBoYW5kbGVyIHdpdGggdGhlIGV2ZW50IFsgYW5kIGFkZGl0aW9uYWwgZGF0YSBdLlxyXG5cdFx0XHRjYWxsYmFjayAoIGUsIGRhdGEgKTtcclxuXHRcdH07XHJcblxyXG5cdFx0dmFyIG1ldGhvZHMgPSBbXTtcclxuXHJcblx0XHQvLyBCaW5kIGEgY2xvc3VyZSBvbiB0aGUgdGFyZ2V0IGZvciBldmVyeSBldmVudCB0eXBlLlxyXG5cdFx0ZXZlbnRzLnNwbGl0KCcgJykuZm9yRWFjaChmdW5jdGlvbiggZXZlbnROYW1lICl7XHJcblx0XHRcdGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIG1ldGhvZCwgc3VwcG9ydHNQYXNzaXZlID8geyBwYXNzaXZlOiB0cnVlIH0gOiBmYWxzZSk7XHJcblx0XHRcdG1ldGhvZHMucHVzaChbZXZlbnROYW1lLCBtZXRob2RdKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHJldHVybiBtZXRob2RzO1xyXG5cdH1cclxuXHJcblx0Ly8gUHJvdmlkZSBhIGNsZWFuIGV2ZW50IHdpdGggc3RhbmRhcmRpemVkIG9mZnNldCB2YWx1ZXMuXHJcblx0ZnVuY3Rpb24gZml4RXZlbnQgKCBlLCBwYWdlT2Zmc2V0ICkge1xyXG5cclxuXHRcdC8vIEZpbHRlciB0aGUgZXZlbnQgdG8gcmVnaXN0ZXIgdGhlIHR5cGUsIHdoaWNoIGNhbiBiZVxyXG5cdFx0Ly8gdG91Y2gsIG1vdXNlIG9yIHBvaW50ZXIuIE9mZnNldCBjaGFuZ2VzIG5lZWQgdG8gYmVcclxuXHRcdC8vIG1hZGUgb24gYW4gZXZlbnQgc3BlY2lmaWMgYmFzaXMuXHJcblx0XHR2YXIgdG91Y2ggPSBlLnR5cGUuaW5kZXhPZigndG91Y2gnKSA9PT0gMDtcclxuXHRcdHZhciBtb3VzZSA9IGUudHlwZS5pbmRleE9mKCdtb3VzZScpID09PSAwO1xyXG5cdFx0dmFyIHBvaW50ZXIgPSBlLnR5cGUuaW5kZXhPZigncG9pbnRlcicpID09PSAwO1xyXG5cclxuXHRcdHZhciB4O1xyXG5cdFx0dmFyIHk7XHJcblxyXG5cdFx0Ly8gSUUxMCBpbXBsZW1lbnRlZCBwb2ludGVyIGV2ZW50cyB3aXRoIGEgcHJlZml4O1xyXG5cdFx0aWYgKCBlLnR5cGUuaW5kZXhPZignTVNQb2ludGVyJykgPT09IDAgKSB7XHJcblx0XHRcdHBvaW50ZXIgPSB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICggdG91Y2ggKSB7XHJcblxyXG5cdFx0XHQvLyBGaXggYnVnIHdoZW4gdXNlciB0b3VjaGVzIHdpdGggdHdvIG9yIG1vcmUgZmluZ2VycyBvbiBtb2JpbGUgZGV2aWNlcy5cclxuXHRcdFx0Ly8gSXQncyB1c2VmdWwgd2hlbiB5b3UgaGF2ZSB0d28gb3IgbW9yZSBzbGlkZXJzIG9uIG9uZSBwYWdlLFxyXG5cdFx0XHQvLyB0aGF0IGNhbiBiZSB0b3VjaGVkIHNpbXVsdGFuZW91c2x5LlxyXG5cdFx0XHQvLyAjNjQ5LCAjNjYzLCAjNjY4XHJcblx0XHRcdGlmICggZS50b3VjaGVzLmxlbmd0aCA+IDEgKSB7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBub1VpU2xpZGVyIHN1cHBvcnRzIG9uZSBtb3ZlbWVudCBhdCBhIHRpbWUsXHJcblx0XHRcdC8vIHNvIHdlIGNhbiBzZWxlY3QgdGhlIGZpcnN0ICdjaGFuZ2VkVG91Y2gnLlxyXG5cdFx0XHR4ID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWDtcclxuXHRcdFx0eSA9IGUuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVk7XHJcblx0XHR9XHJcblxyXG5cdFx0cGFnZU9mZnNldCA9IHBhZ2VPZmZzZXQgfHwgZ2V0UGFnZU9mZnNldChzY29wZV9Eb2N1bWVudCk7XHJcblxyXG5cdFx0aWYgKCBtb3VzZSB8fCBwb2ludGVyICkge1xyXG5cdFx0XHR4ID0gZS5jbGllbnRYICsgcGFnZU9mZnNldC54O1xyXG5cdFx0XHR5ID0gZS5jbGllbnRZICsgcGFnZU9mZnNldC55O1xyXG5cdFx0fVxyXG5cclxuXHRcdGUucGFnZU9mZnNldCA9IHBhZ2VPZmZzZXQ7XHJcblx0XHRlLnBvaW50cyA9IFt4LCB5XTtcclxuXHRcdGUuY3Vyc29yID0gbW91c2UgfHwgcG9pbnRlcjsgLy8gRml4ICM0MzVcclxuXHJcblx0XHRyZXR1cm4gZTtcclxuXHR9XHJcblxyXG5cdC8vIFRyYW5zbGF0ZSBhIGNvb3JkaW5hdGUgaW4gdGhlIGRvY3VtZW50IHRvIGEgcGVyY2VudGFnZSBvbiB0aGUgc2xpZGVyXHJcblx0ZnVuY3Rpb24gY2FsY1BvaW50VG9QZXJjZW50YWdlICggY2FsY1BvaW50ICkge1xyXG5cdFx0dmFyIGxvY2F0aW9uID0gY2FsY1BvaW50IC0gb2Zmc2V0KHNjb3BlX0Jhc2UsIG9wdGlvbnMub3J0KTtcclxuXHRcdHZhciBwcm9wb3NhbCA9ICggbG9jYXRpb24gKiAxMDAgKSAvIGJhc2VTaXplKCk7XHJcblx0XHRyZXR1cm4gb3B0aW9ucy5kaXIgPyAxMDAgLSBwcm9wb3NhbCA6IHByb3Bvc2FsO1xyXG5cdH1cclxuXHJcblx0Ly8gRmluZCBoYW5kbGUgY2xvc2VzdCB0byBhIGNlcnRhaW4gcGVyY2VudGFnZSBvbiB0aGUgc2xpZGVyXHJcblx0ZnVuY3Rpb24gZ2V0Q2xvc2VzdEhhbmRsZSAoIHByb3Bvc2FsICkge1xyXG5cclxuXHRcdHZhciBjbG9zZXN0ID0gMTAwO1xyXG5cdFx0dmFyIGhhbmRsZU51bWJlciA9IGZhbHNlO1xyXG5cclxuXHRcdHNjb3BlX0hhbmRsZXMuZm9yRWFjaChmdW5jdGlvbihoYW5kbGUsIGluZGV4KXtcclxuXHJcblx0XHRcdC8vIERpc2FibGVkIGhhbmRsZXMgYXJlIGlnbm9yZWRcclxuXHRcdFx0aWYgKCBoYW5kbGUuaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpICkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dmFyIHBvcyA9IE1hdGguYWJzKHNjb3BlX0xvY2F0aW9uc1tpbmRleF0gLSBwcm9wb3NhbCk7XHJcblxyXG5cdFx0XHRpZiAoIHBvcyA8IGNsb3Nlc3QgKSB7XHJcblx0XHRcdFx0aGFuZGxlTnVtYmVyID0gaW5kZXg7XHJcblx0XHRcdFx0Y2xvc2VzdCA9IHBvcztcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0cmV0dXJuIGhhbmRsZU51bWJlcjtcclxuXHR9XHJcblxyXG5cdC8vIE1vdmVzIGhhbmRsZShzKSBieSBhIHBlcmNlbnRhZ2VcclxuXHQvLyAoYm9vbCwgJSB0byBtb3ZlLCBbJSB3aGVyZSBoYW5kbGUgc3RhcnRlZCwgLi4uXSwgW2luZGV4IGluIHNjb3BlX0hhbmRsZXMsIC4uLl0pXHJcblx0ZnVuY3Rpb24gbW92ZUhhbmRsZXMgKCB1cHdhcmQsIHByb3Bvc2FsLCBsb2NhdGlvbnMsIGhhbmRsZU51bWJlcnMgKSB7XHJcblxyXG5cdFx0dmFyIHByb3Bvc2FscyA9IGxvY2F0aW9ucy5zbGljZSgpO1xyXG5cclxuXHRcdHZhciBiID0gWyF1cHdhcmQsIHVwd2FyZF07XHJcblx0XHR2YXIgZiA9IFt1cHdhcmQsICF1cHdhcmRdO1xyXG5cclxuXHRcdC8vIENvcHkgaGFuZGxlTnVtYmVycyBzbyB3ZSBkb24ndCBjaGFuZ2UgdGhlIGRhdGFzZXRcclxuXHRcdGhhbmRsZU51bWJlcnMgPSBoYW5kbGVOdW1iZXJzLnNsaWNlKCk7XHJcblxyXG5cdFx0Ly8gQ2hlY2sgdG8gc2VlIHdoaWNoIGhhbmRsZSBpcyAnbGVhZGluZycuXHJcblx0XHQvLyBJZiB0aGF0IG9uZSBjYW4ndCBtb3ZlIHRoZSBzZWNvbmQgY2FuJ3QgZWl0aGVyLlxyXG5cdFx0aWYgKCB1cHdhcmQgKSB7XHJcblx0XHRcdGhhbmRsZU51bWJlcnMucmV2ZXJzZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFN0ZXAgMTogZ2V0IHRoZSBtYXhpbXVtIHBlcmNlbnRhZ2UgdGhhdCBhbnkgb2YgdGhlIGhhbmRsZXMgY2FuIG1vdmVcclxuXHRcdGlmICggaGFuZGxlTnVtYmVycy5sZW5ndGggPiAxICkge1xyXG5cclxuXHRcdFx0aGFuZGxlTnVtYmVycy5mb3JFYWNoKGZ1bmN0aW9uKGhhbmRsZU51bWJlciwgbykge1xyXG5cclxuXHRcdFx0XHR2YXIgdG8gPSBjaGVja0hhbmRsZVBvc2l0aW9uKHByb3Bvc2FscywgaGFuZGxlTnVtYmVyLCBwcm9wb3NhbHNbaGFuZGxlTnVtYmVyXSArIHByb3Bvc2FsLCBiW29dLCBmW29dLCBmYWxzZSk7XHJcblxyXG5cdFx0XHRcdC8vIFN0b3AgaWYgb25lIG9mIHRoZSBoYW5kbGVzIGNhbid0IG1vdmUuXHJcblx0XHRcdFx0aWYgKCB0byA9PT0gZmFsc2UgKSB7XHJcblx0XHRcdFx0XHRwcm9wb3NhbCA9IDA7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHByb3Bvc2FsID0gdG8gLSBwcm9wb3NhbHNbaGFuZGxlTnVtYmVyXTtcclxuXHRcdFx0XHRcdHByb3Bvc2Fsc1toYW5kbGVOdW1iZXJdID0gdG87XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBJZiB1c2luZyBvbmUgaGFuZGxlLCBjaGVjayBiYWNrd2FyZCBBTkQgZm9yd2FyZFxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdGIgPSBmID0gW3RydWVdO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBzdGF0ZSA9IGZhbHNlO1xyXG5cclxuXHRcdC8vIFN0ZXAgMjogVHJ5IHRvIHNldCB0aGUgaGFuZGxlcyB3aXRoIHRoZSBmb3VuZCBwZXJjZW50YWdlXHJcblx0XHRoYW5kbGVOdW1iZXJzLmZvckVhY2goZnVuY3Rpb24oaGFuZGxlTnVtYmVyLCBvKSB7XHJcblx0XHRcdHN0YXRlID0gc2V0SGFuZGxlKGhhbmRsZU51bWJlciwgbG9jYXRpb25zW2hhbmRsZU51bWJlcl0gKyBwcm9wb3NhbCwgYltvXSwgZltvXSkgfHwgc3RhdGU7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBTdGVwIDM6IElmIGEgaGFuZGxlIG1vdmVkLCBmaXJlIGV2ZW50c1xyXG5cdFx0aWYgKCBzdGF0ZSApIHtcclxuXHRcdFx0aGFuZGxlTnVtYmVycy5mb3JFYWNoKGZ1bmN0aW9uKGhhbmRsZU51bWJlcil7XHJcblx0XHRcdFx0ZmlyZUV2ZW50KCd1cGRhdGUnLCBoYW5kbGVOdW1iZXIpO1xyXG5cdFx0XHRcdGZpcmVFdmVudCgnc2xpZGUnLCBoYW5kbGVOdW1iZXIpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIEV4dGVybmFsIGV2ZW50IGhhbmRsaW5nXHJcblx0ZnVuY3Rpb24gZmlyZUV2ZW50ICggZXZlbnROYW1lLCBoYW5kbGVOdW1iZXIsIHRhcCApIHtcclxuXHJcblx0XHRPYmplY3Qua2V5cyhzY29wZV9FdmVudHMpLmZvckVhY2goZnVuY3Rpb24oIHRhcmdldEV2ZW50ICkge1xyXG5cclxuXHRcdFx0dmFyIGV2ZW50VHlwZSA9IHRhcmdldEV2ZW50LnNwbGl0KCcuJylbMF07XHJcblxyXG5cdFx0XHRpZiAoIGV2ZW50TmFtZSA9PT0gZXZlbnRUeXBlICkge1xyXG5cdFx0XHRcdHNjb3BlX0V2ZW50c1t0YXJnZXRFdmVudF0uZm9yRWFjaChmdW5jdGlvbiggY2FsbGJhY2sgKSB7XHJcblxyXG5cdFx0XHRcdFx0Y2FsbGJhY2suY2FsbChcclxuXHRcdFx0XHRcdFx0Ly8gVXNlIHRoZSBzbGlkZXIgcHVibGljIEFQSSBhcyB0aGUgc2NvcGUgKCd0aGlzJylcclxuXHRcdFx0XHRcdFx0c2NvcGVfU2VsZixcclxuXHRcdFx0XHRcdFx0Ly8gUmV0dXJuIHZhbHVlcyBhcyBhcnJheSwgc28gYXJnXzFbYXJnXzJdIGlzIGFsd2F5cyB2YWxpZC5cclxuXHRcdFx0XHRcdFx0c2NvcGVfVmFsdWVzLm1hcChvcHRpb25zLmZvcm1hdC50byksXHJcblx0XHRcdFx0XHRcdC8vIEhhbmRsZSBpbmRleCwgMCBvciAxXHJcblx0XHRcdFx0XHRcdGhhbmRsZU51bWJlcixcclxuXHRcdFx0XHRcdFx0Ly8gVW5mb3JtYXR0ZWQgc2xpZGVyIHZhbHVlc1xyXG5cdFx0XHRcdFx0XHRzY29wZV9WYWx1ZXMuc2xpY2UoKSxcclxuXHRcdFx0XHRcdFx0Ly8gRXZlbnQgaXMgZmlyZWQgYnkgdGFwLCB0cnVlIG9yIGZhbHNlXHJcblx0XHRcdFx0XHRcdHRhcCB8fCBmYWxzZSxcclxuXHRcdFx0XHRcdFx0Ly8gTGVmdCBvZmZzZXQgb2YgdGhlIGhhbmRsZSwgaW4gcmVsYXRpb24gdG8gdGhlIHNsaWRlclxyXG5cdFx0XHRcdFx0XHRzY29wZV9Mb2NhdGlvbnMuc2xpY2UoKVxyXG5cdFx0XHRcdFx0KTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHJcblx0Ly8gRmlyZSAnZW5kJyB3aGVuIGEgbW91c2Ugb3IgcGVuIGxlYXZlcyB0aGUgZG9jdW1lbnQuXHJcblx0ZnVuY3Rpb24gZG9jdW1lbnRMZWF2ZSAoIGV2ZW50LCBkYXRhICkge1xyXG5cdFx0aWYgKCBldmVudC50eXBlID09PSBcIm1vdXNlb3V0XCIgJiYgZXZlbnQudGFyZ2V0Lm5vZGVOYW1lID09PSBcIkhUTUxcIiAmJiBldmVudC5yZWxhdGVkVGFyZ2V0ID09PSBudWxsICl7XHJcblx0XHRcdGV2ZW50RW5kIChldmVudCwgZGF0YSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBIYW5kbGUgbW92ZW1lbnQgb24gZG9jdW1lbnQgZm9yIGhhbmRsZSBhbmQgcmFuZ2UgZHJhZy5cclxuXHRmdW5jdGlvbiBldmVudE1vdmUgKCBldmVudCwgZGF0YSApIHtcclxuXHJcblx0XHQvLyBGaXggIzQ5OFxyXG5cdFx0Ly8gQ2hlY2sgdmFsdWUgb2YgLmJ1dHRvbnMgaW4gJ3N0YXJ0JyB0byB3b3JrIGFyb3VuZCBhIGJ1ZyBpbiBJRTEwIG1vYmlsZSAoZGF0YS5idXR0b25zUHJvcGVydHkpLlxyXG5cdFx0Ly8gaHR0cHM6Ly9jb25uZWN0Lm1pY3Jvc29mdC5jb20vSUUvZmVlZGJhY2svZGV0YWlscy85MjcwMDUvbW9iaWxlLWllMTAtd2luZG93cy1waG9uZS1idXR0b25zLXByb3BlcnR5LW9mLXBvaW50ZXJtb3ZlLWV2ZW50LWFsd2F5cy16ZXJvXHJcblx0XHQvLyBJRTkgaGFzIC5idXR0b25zIGFuZCAud2hpY2ggemVybyBvbiBtb3VzZW1vdmUuXHJcblx0XHQvLyBGaXJlZm94IGJyZWFrcyB0aGUgc3BlYyBNRE4gZGVmaW5lcy5cclxuXHRcdGlmICggbmF2aWdhdG9yLmFwcFZlcnNpb24uaW5kZXhPZihcIk1TSUUgOVwiKSA9PT0gLTEgJiYgZXZlbnQuYnV0dG9ucyA9PT0gMCAmJiBkYXRhLmJ1dHRvbnNQcm9wZXJ0eSAhPT0gMCApIHtcclxuXHRcdFx0cmV0dXJuIGV2ZW50RW5kKGV2ZW50LCBkYXRhKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBDaGVjayBpZiB3ZSBhcmUgbW92aW5nIHVwIG9yIGRvd25cclxuXHRcdHZhciBtb3ZlbWVudCA9IChvcHRpb25zLmRpciA/IC0xIDogMSkgKiAoZXZlbnQuY2FsY1BvaW50IC0gZGF0YS5zdGFydENhbGNQb2ludCk7XHJcblxyXG5cdFx0Ly8gQ29udmVydCB0aGUgbW92ZW1lbnQgaW50byBhIHBlcmNlbnRhZ2Ugb2YgdGhlIHNsaWRlciB3aWR0aC9oZWlnaHRcclxuXHRcdHZhciBwcm9wb3NhbCA9IChtb3ZlbWVudCAqIDEwMCkgLyBkYXRhLmJhc2VTaXplO1xyXG5cclxuXHRcdG1vdmVIYW5kbGVzKG1vdmVtZW50ID4gMCwgcHJvcG9zYWwsIGRhdGEubG9jYXRpb25zLCBkYXRhLmhhbmRsZU51bWJlcnMpO1xyXG5cdH1cclxuXHJcblx0Ly8gVW5iaW5kIG1vdmUgZXZlbnRzIG9uIGRvY3VtZW50LCBjYWxsIGNhbGxiYWNrcy5cclxuXHRmdW5jdGlvbiBldmVudEVuZCAoIGV2ZW50LCBkYXRhICkge1xyXG5cclxuXHRcdC8vIFRoZSBoYW5kbGUgaXMgbm8gbG9uZ2VyIGFjdGl2ZSwgc28gcmVtb3ZlIHRoZSBjbGFzcy5cclxuXHRcdGlmICggc2NvcGVfQWN0aXZlSGFuZGxlICkge1xyXG5cdFx0XHRyZW1vdmVDbGFzcyhzY29wZV9BY3RpdmVIYW5kbGUsIG9wdGlvbnMuY3NzQ2xhc3Nlcy5hY3RpdmUpO1xyXG5cdFx0XHRzY29wZV9BY3RpdmVIYW5kbGUgPSBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBSZW1vdmUgY3Vyc29yIHN0eWxlcyBhbmQgdGV4dC1zZWxlY3Rpb24gZXZlbnRzIGJvdW5kIHRvIHRoZSBib2R5LlxyXG5cdFx0aWYgKCBldmVudC5jdXJzb3IgKSB7XHJcblx0XHRcdHNjb3BlX0JvZHkuc3R5bGUuY3Vyc29yID0gJyc7XHJcblx0XHRcdHNjb3BlX0JvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2VsZWN0c3RhcnQnLCBwcmV2ZW50RGVmYXVsdCk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVW5iaW5kIHRoZSBtb3ZlIGFuZCBlbmQgZXZlbnRzLCB3aGljaCBhcmUgYWRkZWQgb24gJ3N0YXJ0Jy5cclxuXHRcdHNjb3BlX0xpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uKCBjICkge1xyXG5cdFx0XHRzY29wZV9Eb2N1bWVudEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihjWzBdLCBjWzFdKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIFJlbW92ZSBkcmFnZ2luZyBjbGFzcy5cclxuXHRcdHJlbW92ZUNsYXNzKHNjb3BlX1RhcmdldCwgb3B0aW9ucy5jc3NDbGFzc2VzLmRyYWcpO1xyXG5cclxuXHRcdHNldFppbmRleCgpO1xyXG5cclxuXHRcdGRhdGEuaGFuZGxlTnVtYmVycy5mb3JFYWNoKGZ1bmN0aW9uKGhhbmRsZU51bWJlcil7XHJcblx0XHRcdGZpcmVFdmVudCgnY2hhbmdlJywgaGFuZGxlTnVtYmVyKTtcclxuXHRcdFx0ZmlyZUV2ZW50KCdzZXQnLCBoYW5kbGVOdW1iZXIpO1xyXG5cdFx0XHRmaXJlRXZlbnQoJ2VuZCcsIGhhbmRsZU51bWJlcik7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8vIEJpbmQgbW92ZSBldmVudHMgb24gZG9jdW1lbnQuXHJcblx0ZnVuY3Rpb24gZXZlbnRTdGFydCAoIGV2ZW50LCBkYXRhICkge1xyXG5cclxuXHRcdGlmICggZGF0YS5oYW5kbGVOdW1iZXJzLmxlbmd0aCA9PT0gMSApIHtcclxuXHJcblx0XHRcdHZhciBoYW5kbGUgPSBzY29wZV9IYW5kbGVzW2RhdGEuaGFuZGxlTnVtYmVyc1swXV07XHJcblxyXG5cdFx0XHQvLyBJZ25vcmUgJ2Rpc2FibGVkJyBoYW5kbGVzXHJcblx0XHRcdGlmICggaGFuZGxlLmhhc0F0dHJpYnV0ZSgnZGlzYWJsZWQnKSApIHtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIE1hcmsgdGhlIGhhbmRsZSBhcyAnYWN0aXZlJyBzbyBpdCBjYW4gYmUgc3R5bGVkLlxyXG5cdFx0XHRzY29wZV9BY3RpdmVIYW5kbGUgPSBoYW5kbGUuY2hpbGRyZW5bMF07XHJcblx0XHRcdGFkZENsYXNzKHNjb3BlX0FjdGl2ZUhhbmRsZSwgb3B0aW9ucy5jc3NDbGFzc2VzLmFjdGl2ZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gQSBkcmFnIHNob3VsZCBuZXZlciBwcm9wYWdhdGUgdXAgdG8gdGhlICd0YXAnIGV2ZW50LlxyXG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG5cdFx0Ly8gQXR0YWNoIHRoZSBtb3ZlIGFuZCBlbmQgZXZlbnRzLlxyXG5cdFx0dmFyIG1vdmVFdmVudCA9IGF0dGFjaEV2ZW50KGFjdGlvbnMubW92ZSwgc2NvcGVfRG9jdW1lbnRFbGVtZW50LCBldmVudE1vdmUsIHtcclxuXHRcdFx0c3RhcnRDYWxjUG9pbnQ6IGV2ZW50LmNhbGNQb2ludCxcclxuXHRcdFx0YmFzZVNpemU6IGJhc2VTaXplKCksXHJcblx0XHRcdHBhZ2VPZmZzZXQ6IGV2ZW50LnBhZ2VPZmZzZXQsXHJcblx0XHRcdGhhbmRsZU51bWJlcnM6IGRhdGEuaGFuZGxlTnVtYmVycyxcclxuXHRcdFx0YnV0dG9uc1Byb3BlcnR5OiBldmVudC5idXR0b25zLFxyXG5cdFx0XHRsb2NhdGlvbnM6IHNjb3BlX0xvY2F0aW9ucy5zbGljZSgpXHJcblx0XHR9KTtcclxuXHJcblx0XHR2YXIgZW5kRXZlbnQgPSBhdHRhY2hFdmVudChhY3Rpb25zLmVuZCwgc2NvcGVfRG9jdW1lbnRFbGVtZW50LCBldmVudEVuZCwge1xyXG5cdFx0XHRoYW5kbGVOdW1iZXJzOiBkYXRhLmhhbmRsZU51bWJlcnNcclxuXHRcdH0pO1xyXG5cclxuXHRcdHZhciBvdXRFdmVudCA9IGF0dGFjaEV2ZW50KFwibW91c2VvdXRcIiwgc2NvcGVfRG9jdW1lbnRFbGVtZW50LCBkb2N1bWVudExlYXZlLCB7XHJcblx0XHRcdGhhbmRsZU51bWJlcnM6IGRhdGEuaGFuZGxlTnVtYmVyc1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0c2NvcGVfTGlzdGVuZXJzID0gbW92ZUV2ZW50LmNvbmNhdChlbmRFdmVudCwgb3V0RXZlbnQpO1xyXG5cclxuXHRcdC8vIFRleHQgc2VsZWN0aW9uIGlzbid0IGFuIGlzc3VlIG9uIHRvdWNoIGRldmljZXMsXHJcblx0XHQvLyBzbyBhZGRpbmcgY3Vyc29yIHN0eWxlcyBjYW4gYmUgc2tpcHBlZC5cclxuXHRcdGlmICggZXZlbnQuY3Vyc29yICkge1xyXG5cclxuXHRcdFx0Ly8gUHJldmVudCB0aGUgJ0knIGN1cnNvciBhbmQgZXh0ZW5kIHRoZSByYW5nZS1kcmFnIGN1cnNvci5cclxuXHRcdFx0c2NvcGVfQm9keS5zdHlsZS5jdXJzb3IgPSBnZXRDb21wdXRlZFN0eWxlKGV2ZW50LnRhcmdldCkuY3Vyc29yO1xyXG5cclxuXHRcdFx0Ly8gTWFyayB0aGUgdGFyZ2V0IHdpdGggYSBkcmFnZ2luZyBzdGF0ZS5cclxuXHRcdFx0aWYgKCBzY29wZV9IYW5kbGVzLmxlbmd0aCA+IDEgKSB7XHJcblx0XHRcdFx0YWRkQ2xhc3Moc2NvcGVfVGFyZ2V0LCBvcHRpb25zLmNzc0NsYXNzZXMuZHJhZyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIFByZXZlbnQgdGV4dCBzZWxlY3Rpb24gd2hlbiBkcmFnZ2luZyB0aGUgaGFuZGxlcy5cclxuXHRcdFx0Ly8gSW4gbm9VaVNsaWRlciA8PSA5LjIuMCwgdGhpcyB3YXMgaGFuZGxlZCBieSBjYWxsaW5nIHByZXZlbnREZWZhdWx0IG9uIG1vdXNlL3RvdWNoIHN0YXJ0L21vdmUsXHJcblx0XHRcdC8vIHdoaWNoIGlzIHNjcm9sbCBibG9ja2luZy4gVGhlIHNlbGVjdHN0YXJ0IGV2ZW50IGlzIHN1cHBvcnRlZCBieSBGaXJlRm94IHN0YXJ0aW5nIGZyb20gdmVyc2lvbiA1MixcclxuXHRcdFx0Ly8gbWVhbmluZyB0aGUgb25seSBob2xkb3V0IGlzIGlPUyBTYWZhcmkuIFRoaXMgZG9lc24ndCBtYXR0ZXI6IHRleHQgc2VsZWN0aW9uIGlzbid0IHRyaWdnZXJlZCB0aGVyZS5cclxuXHRcdFx0Ly8gVGhlICdjdXJzb3InIGZsYWcgaXMgZmFsc2UuXHJcblx0XHRcdC8vIFNlZTogaHR0cDovL2Nhbml1c2UuY29tLyNzZWFyY2g9c2VsZWN0c3RhcnRcclxuXHRcdFx0c2NvcGVfQm9keS5hZGRFdmVudExpc3RlbmVyKCdzZWxlY3RzdGFydCcsIHByZXZlbnREZWZhdWx0LCBmYWxzZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZGF0YS5oYW5kbGVOdW1iZXJzLmZvckVhY2goZnVuY3Rpb24oaGFuZGxlTnVtYmVyKXtcclxuXHRcdFx0ZmlyZUV2ZW50KCdzdGFydCcsIGhhbmRsZU51bWJlcik7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8vIE1vdmUgY2xvc2VzdCBoYW5kbGUgdG8gdGFwcGVkIGxvY2F0aW9uLlxyXG5cdGZ1bmN0aW9uIGV2ZW50VGFwICggZXZlbnQgKSB7XHJcblxyXG5cdFx0Ly8gVGhlIHRhcCBldmVudCBzaG91bGRuJ3QgcHJvcGFnYXRlIHVwXHJcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcblx0XHR2YXIgcHJvcG9zYWwgPSBjYWxjUG9pbnRUb1BlcmNlbnRhZ2UoZXZlbnQuY2FsY1BvaW50KTtcclxuXHRcdHZhciBoYW5kbGVOdW1iZXIgPSBnZXRDbG9zZXN0SGFuZGxlKHByb3Bvc2FsKTtcclxuXHJcblx0XHQvLyBUYWNrbGUgdGhlIGNhc2UgdGhhdCBhbGwgaGFuZGxlcyBhcmUgJ2Rpc2FibGVkJy5cclxuXHRcdGlmICggaGFuZGxlTnVtYmVyID09PSBmYWxzZSApIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEZsYWcgdGhlIHNsaWRlciBhcyBpdCBpcyBub3cgaW4gYSB0cmFuc2l0aW9uYWwgc3RhdGUuXHJcblx0XHQvLyBUcmFuc2l0aW9uIHRha2VzIGEgY29uZmlndXJhYmxlIGFtb3VudCBvZiBtcyAoZGVmYXVsdCAzMDApLiBSZS1lbmFibGUgdGhlIHNsaWRlciBhZnRlciB0aGF0LlxyXG5cdFx0aWYgKCAhb3B0aW9ucy5ldmVudHMuc25hcCApIHtcclxuXHRcdFx0YWRkQ2xhc3NGb3Ioc2NvcGVfVGFyZ2V0LCBvcHRpb25zLmNzc0NsYXNzZXMudGFwLCBvcHRpb25zLmFuaW1hdGlvbkR1cmF0aW9uKTtcclxuXHRcdH1cclxuXHJcblx0XHRzZXRIYW5kbGUoaGFuZGxlTnVtYmVyLCBwcm9wb3NhbCwgdHJ1ZSwgdHJ1ZSk7XHJcblxyXG5cdFx0c2V0WmluZGV4KCk7XHJcblxyXG5cdFx0ZmlyZUV2ZW50KCdzbGlkZScsIGhhbmRsZU51bWJlciwgdHJ1ZSk7XHJcblx0XHRmaXJlRXZlbnQoJ3VwZGF0ZScsIGhhbmRsZU51bWJlciwgdHJ1ZSk7XHJcblx0XHRmaXJlRXZlbnQoJ2NoYW5nZScsIGhhbmRsZU51bWJlciwgdHJ1ZSk7XHJcblx0XHRmaXJlRXZlbnQoJ3NldCcsIGhhbmRsZU51bWJlciwgdHJ1ZSk7XHJcblxyXG5cdFx0aWYgKCBvcHRpb25zLmV2ZW50cy5zbmFwICkge1xyXG5cdFx0XHRldmVudFN0YXJ0KGV2ZW50LCB7IGhhbmRsZU51bWJlcnM6IFtoYW5kbGVOdW1iZXJdIH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gRmlyZXMgYSAnaG92ZXInIGV2ZW50IGZvciBhIGhvdmVyZWQgbW91c2UvcGVuIHBvc2l0aW9uLlxyXG5cdGZ1bmN0aW9uIGV2ZW50SG92ZXIgKCBldmVudCApIHtcclxuXHJcblx0XHR2YXIgcHJvcG9zYWwgPSBjYWxjUG9pbnRUb1BlcmNlbnRhZ2UoZXZlbnQuY2FsY1BvaW50KTtcclxuXHJcblx0XHR2YXIgdG8gPSBzY29wZV9TcGVjdHJ1bS5nZXRTdGVwKHByb3Bvc2FsKTtcclxuXHRcdHZhciB2YWx1ZSA9IHNjb3BlX1NwZWN0cnVtLmZyb21TdGVwcGluZyh0byk7XHJcblxyXG5cdFx0T2JqZWN0LmtleXMoc2NvcGVfRXZlbnRzKS5mb3JFYWNoKGZ1bmN0aW9uKCB0YXJnZXRFdmVudCApIHtcclxuXHRcdFx0aWYgKCAnaG92ZXInID09PSB0YXJnZXRFdmVudC5zcGxpdCgnLicpWzBdICkge1xyXG5cdFx0XHRcdHNjb3BlX0V2ZW50c1t0YXJnZXRFdmVudF0uZm9yRWFjaChmdW5jdGlvbiggY2FsbGJhY2sgKSB7XHJcblx0XHRcdFx0XHRjYWxsYmFjay5jYWxsKCBzY29wZV9TZWxmLCB2YWx1ZSApO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8vIEF0dGFjaCBldmVudHMgdG8gc2V2ZXJhbCBzbGlkZXIgcGFydHMuXHJcblx0ZnVuY3Rpb24gYmluZFNsaWRlckV2ZW50cyAoIGJlaGF2aW91ciApIHtcclxuXHJcblx0XHQvLyBBdHRhY2ggdGhlIHN0YW5kYXJkIGRyYWcgZXZlbnQgdG8gdGhlIGhhbmRsZXMuXHJcblx0XHRpZiAoICFiZWhhdmlvdXIuZml4ZWQgKSB7XHJcblxyXG5cdFx0XHRzY29wZV9IYW5kbGVzLmZvckVhY2goZnVuY3Rpb24oIGhhbmRsZSwgaW5kZXggKXtcclxuXHJcblx0XHRcdFx0Ly8gVGhlc2UgZXZlbnRzIGFyZSBvbmx5IGJvdW5kIHRvIHRoZSB2aXN1YWwgaGFuZGxlXHJcblx0XHRcdFx0Ly8gZWxlbWVudCwgbm90IHRoZSAncmVhbCcgb3JpZ2luIGVsZW1lbnQuXHJcblx0XHRcdFx0YXR0YWNoRXZlbnQgKCBhY3Rpb25zLnN0YXJ0LCBoYW5kbGUuY2hpbGRyZW5bMF0sIGV2ZW50U3RhcnQsIHtcclxuXHRcdFx0XHRcdGhhbmRsZU51bWJlcnM6IFtpbmRleF1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gQXR0YWNoIHRoZSB0YXAgZXZlbnQgdG8gdGhlIHNsaWRlciBiYXNlLlxyXG5cdFx0aWYgKCBiZWhhdmlvdXIudGFwICkge1xyXG5cdFx0XHRhdHRhY2hFdmVudCAoYWN0aW9ucy5zdGFydCwgc2NvcGVfQmFzZSwgZXZlbnRUYXAsIHt9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBGaXJlIGhvdmVyIGV2ZW50c1xyXG5cdFx0aWYgKCBiZWhhdmlvdXIuaG92ZXIgKSB7XHJcblx0XHRcdGF0dGFjaEV2ZW50IChhY3Rpb25zLm1vdmUsIHNjb3BlX0Jhc2UsIGV2ZW50SG92ZXIsIHsgaG92ZXI6IHRydWUgfSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gTWFrZSB0aGUgcmFuZ2UgZHJhZ2dhYmxlLlxyXG5cdFx0aWYgKCBiZWhhdmlvdXIuZHJhZyApe1xyXG5cclxuXHRcdFx0c2NvcGVfQ29ubmVjdHMuZm9yRWFjaChmdW5jdGlvbiggY29ubmVjdCwgaW5kZXggKXtcclxuXHJcblx0XHRcdFx0aWYgKCBjb25uZWN0ID09PSBmYWxzZSB8fCBpbmRleCA9PT0gMCB8fCBpbmRleCA9PT0gc2NvcGVfQ29ubmVjdHMubGVuZ3RoIC0gMSApIHtcclxuXHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHZhciBoYW5kbGVCZWZvcmUgPSBzY29wZV9IYW5kbGVzW2luZGV4IC0gMV07XHJcblx0XHRcdFx0dmFyIGhhbmRsZUFmdGVyID0gc2NvcGVfSGFuZGxlc1tpbmRleF07XHJcblx0XHRcdFx0dmFyIGV2ZW50SG9sZGVycyA9IFtjb25uZWN0XTtcclxuXHJcblx0XHRcdFx0YWRkQ2xhc3MoY29ubmVjdCwgb3B0aW9ucy5jc3NDbGFzc2VzLmRyYWdnYWJsZSk7XHJcblxyXG5cdFx0XHRcdC8vIFdoZW4gdGhlIHJhbmdlIGlzIGZpeGVkLCB0aGUgZW50aXJlIHJhbmdlIGNhblxyXG5cdFx0XHRcdC8vIGJlIGRyYWdnZWQgYnkgdGhlIGhhbmRsZXMuIFRoZSBoYW5kbGUgaW4gdGhlIGZpcnN0XHJcblx0XHRcdFx0Ly8gb3JpZ2luIHdpbGwgcHJvcGFnYXRlIHRoZSBzdGFydCBldmVudCB1cHdhcmQsXHJcblx0XHRcdFx0Ly8gYnV0IGl0IG5lZWRzIHRvIGJlIGJvdW5kIG1hbnVhbGx5IG9uIHRoZSBvdGhlci5cclxuXHRcdFx0XHRpZiAoIGJlaGF2aW91ci5maXhlZCApIHtcclxuXHRcdFx0XHRcdGV2ZW50SG9sZGVycy5wdXNoKGhhbmRsZUJlZm9yZS5jaGlsZHJlblswXSk7XHJcblx0XHRcdFx0XHRldmVudEhvbGRlcnMucHVzaChoYW5kbGVBZnRlci5jaGlsZHJlblswXSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRldmVudEhvbGRlcnMuZm9yRWFjaChmdW5jdGlvbiggZXZlbnRIb2xkZXIgKSB7XHJcblx0XHRcdFx0XHRhdHRhY2hFdmVudCAoIGFjdGlvbnMuc3RhcnQsIGV2ZW50SG9sZGVyLCBldmVudFN0YXJ0LCB7XHJcblx0XHRcdFx0XHRcdGhhbmRsZXM6IFtoYW5kbGVCZWZvcmUsIGhhbmRsZUFmdGVyXSxcclxuXHRcdFx0XHRcdFx0aGFuZGxlTnVtYmVyczogW2luZGV4IC0gMSwgaW5kZXhdXHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHJcblx0Ly8gU3BsaXQgb3V0IHRoZSBoYW5kbGUgcG9zaXRpb25pbmcgbG9naWMgc28gdGhlIE1vdmUgZXZlbnQgY2FuIHVzZSBpdCwgdG9vXHJcblx0ZnVuY3Rpb24gY2hlY2tIYW5kbGVQb3NpdGlvbiAoIHJlZmVyZW5jZSwgaGFuZGxlTnVtYmVyLCB0bywgbG9va0JhY2t3YXJkLCBsb29rRm9yd2FyZCwgZ2V0VmFsdWUgKSB7XHJcblxyXG5cdFx0Ly8gRm9yIHNsaWRlcnMgd2l0aCBtdWx0aXBsZSBoYW5kbGVzLCBsaW1pdCBtb3ZlbWVudCB0byB0aGUgb3RoZXIgaGFuZGxlLlxyXG5cdFx0Ly8gQXBwbHkgdGhlIG1hcmdpbiBvcHRpb24gYnkgYWRkaW5nIGl0IHRvIHRoZSBoYW5kbGUgcG9zaXRpb25zLlxyXG5cdFx0aWYgKCBzY29wZV9IYW5kbGVzLmxlbmd0aCA+IDEgKSB7XHJcblxyXG5cdFx0XHRpZiAoIGxvb2tCYWNrd2FyZCAmJiBoYW5kbGVOdW1iZXIgPiAwICkge1xyXG5cdFx0XHRcdHRvID0gTWF0aC5tYXgodG8sIHJlZmVyZW5jZVtoYW5kbGVOdW1iZXIgLSAxXSArIG9wdGlvbnMubWFyZ2luKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKCBsb29rRm9yd2FyZCAmJiBoYW5kbGVOdW1iZXIgPCBzY29wZV9IYW5kbGVzLmxlbmd0aCAtIDEgKSB7XHJcblx0XHRcdFx0dG8gPSBNYXRoLm1pbih0bywgcmVmZXJlbmNlW2hhbmRsZU51bWJlciArIDFdIC0gb3B0aW9ucy5tYXJnaW4pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVGhlIGxpbWl0IG9wdGlvbiBoYXMgdGhlIG9wcG9zaXRlIGVmZmVjdCwgbGltaXRpbmcgaGFuZGxlcyB0byBhXHJcblx0XHQvLyBtYXhpbXVtIGRpc3RhbmNlIGZyb20gYW5vdGhlci4gTGltaXQgbXVzdCBiZSA+IDAsIGFzIG90aGVyd2lzZVxyXG5cdFx0Ly8gaGFuZGxlcyB3b3VsZCBiZSB1bm1vdmVhYmxlLlxyXG5cdFx0aWYgKCBzY29wZV9IYW5kbGVzLmxlbmd0aCA+IDEgJiYgb3B0aW9ucy5saW1pdCApIHtcclxuXHJcblx0XHRcdGlmICggbG9va0JhY2t3YXJkICYmIGhhbmRsZU51bWJlciA+IDAgKSB7XHJcblx0XHRcdFx0dG8gPSBNYXRoLm1pbih0bywgcmVmZXJlbmNlW2hhbmRsZU51bWJlciAtIDFdICsgb3B0aW9ucy5saW1pdCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICggbG9va0ZvcndhcmQgJiYgaGFuZGxlTnVtYmVyIDwgc2NvcGVfSGFuZGxlcy5sZW5ndGggLSAxICkge1xyXG5cdFx0XHRcdHRvID0gTWF0aC5tYXgodG8sIHJlZmVyZW5jZVtoYW5kbGVOdW1iZXIgKyAxXSAtIG9wdGlvbnMubGltaXQpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVGhlIHBhZGRpbmcgb3B0aW9uIGtlZXBzIHRoZSBoYW5kbGVzIGEgY2VydGFpbiBkaXN0YW5jZSBmcm9tIHRoZVxyXG5cdFx0Ly8gZWRnZXMgb2YgdGhlIHNsaWRlci4gUGFkZGluZyBtdXN0IGJlID4gMC5cclxuXHRcdGlmICggb3B0aW9ucy5wYWRkaW5nICkge1xyXG5cclxuXHRcdFx0aWYgKCBoYW5kbGVOdW1iZXIgPT09IDAgKSB7XHJcblx0XHRcdFx0dG8gPSBNYXRoLm1heCh0bywgb3B0aW9ucy5wYWRkaW5nKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKCBoYW5kbGVOdW1iZXIgPT09IHNjb3BlX0hhbmRsZXMubGVuZ3RoIC0gMSApIHtcclxuXHRcdFx0XHR0byA9IE1hdGgubWluKHRvLCAxMDAgLSBvcHRpb25zLnBhZGRpbmcpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0dG8gPSBzY29wZV9TcGVjdHJ1bS5nZXRTdGVwKHRvKTtcclxuXHJcblx0XHQvLyBMaW1pdCBwZXJjZW50YWdlIHRvIHRoZSAwIC0gMTAwIHJhbmdlXHJcblx0XHR0byA9IGxpbWl0KHRvKTtcclxuXHJcblx0XHQvLyBSZXR1cm4gZmFsc2UgaWYgaGFuZGxlIGNhbid0IG1vdmVcclxuXHRcdGlmICggdG8gPT09IHJlZmVyZW5jZVtoYW5kbGVOdW1iZXJdICYmICFnZXRWYWx1ZSApIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0bztcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRvUGN0ICggcGN0ICkge1xyXG5cdFx0cmV0dXJuIHBjdCArICclJztcclxuXHR9XHJcblxyXG5cdC8vIFVwZGF0ZXMgc2NvcGVfTG9jYXRpb25zIGFuZCBzY29wZV9WYWx1ZXMsIHVwZGF0ZXMgdmlzdWFsIHN0YXRlXHJcblx0ZnVuY3Rpb24gdXBkYXRlSGFuZGxlUG9zaXRpb24gKCBoYW5kbGVOdW1iZXIsIHRvICkge1xyXG5cclxuXHRcdC8vIFVwZGF0ZSBsb2NhdGlvbnMuXHJcblx0XHRzY29wZV9Mb2NhdGlvbnNbaGFuZGxlTnVtYmVyXSA9IHRvO1xyXG5cclxuXHRcdC8vIENvbnZlcnQgdGhlIHZhbHVlIHRvIHRoZSBzbGlkZXIgc3RlcHBpbmcvcmFuZ2UuXHJcblx0XHRzY29wZV9WYWx1ZXNbaGFuZGxlTnVtYmVyXSA9IHNjb3BlX1NwZWN0cnVtLmZyb21TdGVwcGluZyh0byk7XHJcblxyXG5cdFx0Ly8gQ2FsbGVkIHN5bmNocm9ub3VzbHkgb3Igb24gdGhlIG5leHQgYW5pbWF0aW9uRnJhbWVcclxuXHRcdHZhciBzdGF0ZVVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzY29wZV9IYW5kbGVzW2hhbmRsZU51bWJlcl0uc3R5bGVbb3B0aW9ucy5zdHlsZV0gPSB0b1BjdCh0byk7XHJcblx0XHRcdHVwZGF0ZUNvbm5lY3QoaGFuZGxlTnVtYmVyKTtcclxuXHRcdFx0dXBkYXRlQ29ubmVjdChoYW5kbGVOdW1iZXIgKyAxKTtcclxuXHRcdH07XHJcblxyXG5cdFx0Ly8gU2V0IHRoZSBoYW5kbGUgdG8gdGhlIG5ldyBwb3NpdGlvbi5cclxuXHRcdC8vIFVzZSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgZm9yIGVmZmljaWVudCBwYWludGluZy5cclxuXHRcdC8vIE5vIHNpZ25pZmljYW50IGVmZmVjdCBpbiBDaHJvbWUsIEVkZ2Ugc2VlcyBkcmFtYXRpYyBwZXJmb3JtYWNlIGltcHJvdmVtZW50cy5cclxuXHRcdC8vIE9wdGlvbiB0byBkaXNhYmxlIGlzIHVzZWZ1bCBmb3IgdW5pdCB0ZXN0cywgYW5kIHNpbmdsZS1zdGVwIGRlYnVnZ2luZy5cclxuXHRcdGlmICggd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSAmJiBvcHRpb25zLnVzZVJlcXVlc3RBbmltYXRpb25GcmFtZSApIHtcclxuXHRcdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShzdGF0ZVVwZGF0ZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRzdGF0ZVVwZGF0ZSgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2V0WmluZGV4ICggKSB7XHJcblxyXG5cdFx0c2NvcGVfSGFuZGxlTnVtYmVycy5mb3JFYWNoKGZ1bmN0aW9uKGhhbmRsZU51bWJlcil7XHJcblx0XHRcdC8vIEhhbmRsZXMgYmVmb3JlIHRoZSBzbGlkZXIgbWlkZGxlIGFyZSBzdGFja2VkIGxhdGVyID0gaGlnaGVyLFxyXG5cdFx0XHQvLyBIYW5kbGVzIGFmdGVyIHRoZSBtaWRkbGUgbGF0ZXIgaXMgbG93ZXJcclxuXHRcdFx0Ly8gW1s3XSBbOF0gLi4uLi4uLi4uLiB8IC4uLi4uLi4uLi4gWzVdIFs0XVxyXG5cdFx0XHR2YXIgZGlyID0gKHNjb3BlX0xvY2F0aW9uc1toYW5kbGVOdW1iZXJdID4gNTAgPyAtMSA6IDEpO1xyXG5cdFx0XHR2YXIgekluZGV4ID0gMyArIChzY29wZV9IYW5kbGVzLmxlbmd0aCArIChkaXIgKiBoYW5kbGVOdW1iZXIpKTtcclxuXHRcdFx0c2NvcGVfSGFuZGxlc1toYW5kbGVOdW1iZXJdLmNoaWxkTm9kZXNbMF0uc3R5bGUuekluZGV4ID0gekluZGV4O1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvLyBUZXN0IHN1Z2dlc3RlZCB2YWx1ZXMgYW5kIGFwcGx5IG1hcmdpbiwgc3RlcC5cclxuXHRmdW5jdGlvbiBzZXRIYW5kbGUgKCBoYW5kbGVOdW1iZXIsIHRvLCBsb29rQmFja3dhcmQsIGxvb2tGb3J3YXJkICkge1xyXG5cclxuXHRcdHRvID0gY2hlY2tIYW5kbGVQb3NpdGlvbihzY29wZV9Mb2NhdGlvbnMsIGhhbmRsZU51bWJlciwgdG8sIGxvb2tCYWNrd2FyZCwgbG9va0ZvcndhcmQsIGZhbHNlKTtcclxuXHJcblx0XHRpZiAoIHRvID09PSBmYWxzZSApIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHVwZGF0ZUhhbmRsZVBvc2l0aW9uKGhhbmRsZU51bWJlciwgdG8pO1xyXG5cclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHJcblx0Ly8gVXBkYXRlcyBzdHlsZSBhdHRyaWJ1dGUgZm9yIGNvbm5lY3Qgbm9kZXNcclxuXHRmdW5jdGlvbiB1cGRhdGVDb25uZWN0ICggaW5kZXggKSB7XHJcblxyXG5cdFx0Ly8gU2tpcCBjb25uZWN0cyBzZXQgdG8gZmFsc2VcclxuXHRcdGlmICggIXNjb3BlX0Nvbm5lY3RzW2luZGV4XSApIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBsID0gMDtcclxuXHRcdHZhciBoID0gMTAwO1xyXG5cclxuXHRcdGlmICggaW5kZXggIT09IDAgKSB7XHJcblx0XHRcdGwgPSBzY29wZV9Mb2NhdGlvbnNbaW5kZXggLSAxXTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIGluZGV4ICE9PSBzY29wZV9Db25uZWN0cy5sZW5ndGggLSAxICkge1xyXG5cdFx0XHRoID0gc2NvcGVfTG9jYXRpb25zW2luZGV4XTtcclxuXHRcdH1cclxuXHJcblx0XHRzY29wZV9Db25uZWN0c1tpbmRleF0uc3R5bGVbb3B0aW9ucy5zdHlsZV0gPSB0b1BjdChsKTtcclxuXHRcdHNjb3BlX0Nvbm5lY3RzW2luZGV4XS5zdHlsZVtvcHRpb25zLnN0eWxlT3Bvc2l0ZV0gPSB0b1BjdCgxMDAgLSBoKTtcclxuXHR9XHJcblxyXG5cdC8vIC4uLlxyXG5cdGZ1bmN0aW9uIHNldFZhbHVlICggdG8sIGhhbmRsZU51bWJlciApIHtcclxuXHJcblx0XHQvLyBTZXR0aW5nIHdpdGggbnVsbCBpbmRpY2F0ZXMgYW4gJ2lnbm9yZScuXHJcblx0XHQvLyBJbnB1dHRpbmcgJ2ZhbHNlJyBpcyBpbnZhbGlkLlxyXG5cdFx0aWYgKCB0byA9PT0gbnVsbCB8fCB0byA9PT0gZmFsc2UgKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBJZiBhIGZvcm1hdHRlZCBudW1iZXIgd2FzIHBhc3NlZCwgYXR0ZW10IHRvIGRlY29kZSBpdC5cclxuXHRcdGlmICggdHlwZW9mIHRvID09PSAnbnVtYmVyJyApIHtcclxuXHRcdFx0dG8gPSBTdHJpbmcodG8pO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRvID0gb3B0aW9ucy5mb3JtYXQuZnJvbSh0byk7XHJcblxyXG5cdFx0Ly8gUmVxdWVzdCBhbiB1cGRhdGUgZm9yIGFsbCBsaW5rcyBpZiB0aGUgdmFsdWUgd2FzIGludmFsaWQuXHJcblx0XHQvLyBEbyBzbyB0b28gaWYgc2V0dGluZyB0aGUgaGFuZGxlIGZhaWxzLlxyXG5cdFx0aWYgKCB0byAhPT0gZmFsc2UgJiYgIWlzTmFOKHRvKSApIHtcclxuXHRcdFx0c2V0SGFuZGxlKGhhbmRsZU51bWJlciwgc2NvcGVfU3BlY3RydW0udG9TdGVwcGluZyh0byksIGZhbHNlLCBmYWxzZSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBTZXQgdGhlIHNsaWRlciB2YWx1ZS5cclxuXHRmdW5jdGlvbiB2YWx1ZVNldCAoIGlucHV0LCBmaXJlU2V0RXZlbnQgKSB7XHJcblxyXG5cdFx0dmFyIHZhbHVlcyA9IGFzQXJyYXkoaW5wdXQpO1xyXG5cdFx0dmFyIGlzSW5pdCA9IHNjb3BlX0xvY2F0aW9uc1swXSA9PT0gdW5kZWZpbmVkO1xyXG5cclxuXHRcdC8vIEV2ZW50IGZpcmVzIGJ5IGRlZmF1bHRcclxuXHRcdGZpcmVTZXRFdmVudCA9IChmaXJlU2V0RXZlbnQgPT09IHVuZGVmaW5lZCA/IHRydWUgOiAhIWZpcmVTZXRFdmVudCk7XHJcblxyXG5cdFx0dmFsdWVzLmZvckVhY2goc2V0VmFsdWUpO1xyXG5cclxuXHRcdC8vIEFuaW1hdGlvbiBpcyBvcHRpb25hbC5cclxuXHRcdC8vIE1ha2Ugc3VyZSB0aGUgaW5pdGlhbCB2YWx1ZXMgd2VyZSBzZXQgYmVmb3JlIHVzaW5nIGFuaW1hdGVkIHBsYWNlbWVudC5cclxuXHRcdGlmICggb3B0aW9ucy5hbmltYXRlICYmICFpc0luaXQgKSB7XHJcblx0XHRcdGFkZENsYXNzRm9yKHNjb3BlX1RhcmdldCwgb3B0aW9ucy5jc3NDbGFzc2VzLnRhcCwgb3B0aW9ucy5hbmltYXRpb25EdXJhdGlvbik7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gTm93IHRoYXQgYWxsIGJhc2UgdmFsdWVzIGFyZSBzZXQsIGFwcGx5IGNvbnN0cmFpbnRzXHJcblx0XHRzY29wZV9IYW5kbGVOdW1iZXJzLmZvckVhY2goZnVuY3Rpb24oaGFuZGxlTnVtYmVyKXtcclxuXHRcdFx0c2V0SGFuZGxlKGhhbmRsZU51bWJlciwgc2NvcGVfTG9jYXRpb25zW2hhbmRsZU51bWJlcl0sIHRydWUsIGZhbHNlKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHNldFppbmRleCgpO1xyXG5cclxuXHRcdHNjb3BlX0hhbmRsZU51bWJlcnMuZm9yRWFjaChmdW5jdGlvbihoYW5kbGVOdW1iZXIpe1xyXG5cclxuXHRcdFx0ZmlyZUV2ZW50KCd1cGRhdGUnLCBoYW5kbGVOdW1iZXIpO1xyXG5cclxuXHRcdFx0Ly8gRmlyZSB0aGUgZXZlbnQgb25seSBmb3IgaGFuZGxlcyB0aGF0IHJlY2VpdmVkIGEgbmV3IHZhbHVlLCBhcyBwZXIgIzU3OVxyXG5cdFx0XHRpZiAoIHZhbHVlc1toYW5kbGVOdW1iZXJdICE9PSBudWxsICYmIGZpcmVTZXRFdmVudCApIHtcclxuXHRcdFx0XHRmaXJlRXZlbnQoJ3NldCcsIGhhbmRsZU51bWJlcik7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Ly8gUmVzZXQgc2xpZGVyIHRvIGluaXRpYWwgdmFsdWVzXHJcblx0ZnVuY3Rpb24gdmFsdWVSZXNldCAoIGZpcmVTZXRFdmVudCApIHtcclxuXHRcdHZhbHVlU2V0KG9wdGlvbnMuc3RhcnQsIGZpcmVTZXRFdmVudCk7XHJcblx0fVxyXG5cclxuXHQvLyBHZXQgdGhlIHNsaWRlciB2YWx1ZS5cclxuXHRmdW5jdGlvbiB2YWx1ZUdldCAoICkge1xyXG5cclxuXHRcdHZhciB2YWx1ZXMgPSBzY29wZV9WYWx1ZXMubWFwKG9wdGlvbnMuZm9ybWF0LnRvKTtcclxuXHJcblx0XHQvLyBJZiBvbmx5IG9uZSBoYW5kbGUgaXMgdXNlZCwgcmV0dXJuIGEgc2luZ2xlIHZhbHVlLlxyXG5cdFx0aWYgKCB2YWx1ZXMubGVuZ3RoID09PSAxICl7XHJcblx0XHRcdHJldHVybiB2YWx1ZXNbMF07XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHZhbHVlcztcclxuXHR9XHJcblxyXG5cdC8vIFJlbW92ZXMgY2xhc3NlcyBmcm9tIHRoZSByb290IGFuZCBlbXB0aWVzIGl0LlxyXG5cdGZ1bmN0aW9uIGRlc3Ryb3kgKCApIHtcclxuXHJcblx0XHRmb3IgKCB2YXIga2V5IGluIG9wdGlvbnMuY3NzQ2xhc3NlcyApIHtcclxuXHRcdFx0aWYgKCAhb3B0aW9ucy5jc3NDbGFzc2VzLmhhc093blByb3BlcnR5KGtleSkgKSB7IGNvbnRpbnVlOyB9XHJcblx0XHRcdHJlbW92ZUNsYXNzKHNjb3BlX1RhcmdldCwgb3B0aW9ucy5jc3NDbGFzc2VzW2tleV0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdHdoaWxlIChzY29wZV9UYXJnZXQuZmlyc3RDaGlsZCkge1xyXG5cdFx0XHRzY29wZV9UYXJnZXQucmVtb3ZlQ2hpbGQoc2NvcGVfVGFyZ2V0LmZpcnN0Q2hpbGQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGRlbGV0ZSBzY29wZV9UYXJnZXQubm9VaVNsaWRlcjtcclxuXHR9XHJcblxyXG5cdC8vIEdldCB0aGUgY3VycmVudCBzdGVwIHNpemUgZm9yIHRoZSBzbGlkZXIuXHJcblx0ZnVuY3Rpb24gZ2V0Q3VycmVudFN0ZXAgKCApIHtcclxuXHJcblx0XHQvLyBDaGVjayBhbGwgbG9jYXRpb25zLCBtYXAgdGhlbSB0byB0aGVpciBzdGVwcGluZyBwb2ludC5cclxuXHRcdC8vIEdldCB0aGUgc3RlcCBwb2ludCwgdGhlbiBmaW5kIGl0IGluIHRoZSBpbnB1dCBsaXN0LlxyXG5cdFx0cmV0dXJuIHNjb3BlX0xvY2F0aW9ucy5tYXAoZnVuY3Rpb24oIGxvY2F0aW9uLCBpbmRleCApe1xyXG5cclxuXHRcdFx0dmFyIG5lYXJieVN0ZXBzID0gc2NvcGVfU3BlY3RydW0uZ2V0TmVhcmJ5U3RlcHMoIGxvY2F0aW9uICk7XHJcblx0XHRcdHZhciB2YWx1ZSA9IHNjb3BlX1ZhbHVlc1tpbmRleF07XHJcblx0XHRcdHZhciBpbmNyZW1lbnQgPSBuZWFyYnlTdGVwcy50aGlzU3RlcC5zdGVwO1xyXG5cdFx0XHR2YXIgZGVjcmVtZW50ID0gbnVsbDtcclxuXHJcblx0XHRcdC8vIElmIHRoZSBuZXh0IHZhbHVlIGluIHRoaXMgc3RlcCBtb3ZlcyBpbnRvIHRoZSBuZXh0IHN0ZXAsXHJcblx0XHRcdC8vIHRoZSBpbmNyZW1lbnQgaXMgdGhlIHN0YXJ0IG9mIHRoZSBuZXh0IHN0ZXAgLSB0aGUgY3VycmVudCB2YWx1ZVxyXG5cdFx0XHRpZiAoIGluY3JlbWVudCAhPT0gZmFsc2UgKSB7XHJcblx0XHRcdFx0aWYgKCB2YWx1ZSArIGluY3JlbWVudCA+IG5lYXJieVN0ZXBzLnN0ZXBBZnRlci5zdGFydFZhbHVlICkge1xyXG5cdFx0XHRcdFx0aW5jcmVtZW50ID0gbmVhcmJ5U3RlcHMuc3RlcEFmdGVyLnN0YXJ0VmFsdWUgLSB2YWx1ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblxyXG5cdFx0XHQvLyBJZiB0aGUgdmFsdWUgaXMgYmV5b25kIHRoZSBzdGFydGluZyBwb2ludFxyXG5cdFx0XHRpZiAoIHZhbHVlID4gbmVhcmJ5U3RlcHMudGhpc1N0ZXAuc3RhcnRWYWx1ZSApIHtcclxuXHRcdFx0XHRkZWNyZW1lbnQgPSBuZWFyYnlTdGVwcy50aGlzU3RlcC5zdGVwO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRlbHNlIGlmICggbmVhcmJ5U3RlcHMuc3RlcEJlZm9yZS5zdGVwID09PSBmYWxzZSApIHtcclxuXHRcdFx0XHRkZWNyZW1lbnQgPSBmYWxzZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gSWYgYSBoYW5kbGUgaXMgYXQgdGhlIHN0YXJ0IG9mIGEgc3RlcCwgaXQgYWx3YXlzIHN0ZXBzIGJhY2sgaW50byB0aGUgcHJldmlvdXMgc3RlcCBmaXJzdFxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRkZWNyZW1lbnQgPSB2YWx1ZSAtIG5lYXJieVN0ZXBzLnN0ZXBCZWZvcmUuaGlnaGVzdFN0ZXA7XHJcblx0XHRcdH1cclxuXHJcblxyXG5cdFx0XHQvLyBOb3csIGlmIGF0IHRoZSBzbGlkZXIgZWRnZXMsIHRoZXJlIGlzIG5vdCBpbi9kZWNyZW1lbnRcclxuXHRcdFx0aWYgKCBsb2NhdGlvbiA9PT0gMTAwICkge1xyXG5cdFx0XHRcdGluY3JlbWVudCA9IG51bGw7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGVsc2UgaWYgKCBsb2NhdGlvbiA9PT0gMCApIHtcclxuXHRcdFx0XHRkZWNyZW1lbnQgPSBudWxsO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBBcyBwZXIgIzM5MSwgdGhlIGNvbXBhcmlzb24gZm9yIHRoZSBkZWNyZW1lbnQgc3RlcCBjYW4gaGF2ZSBzb21lIHJvdW5kaW5nIGlzc3Vlcy5cclxuXHRcdFx0dmFyIHN0ZXBEZWNpbWFscyA9IHNjb3BlX1NwZWN0cnVtLmNvdW50U3RlcERlY2ltYWxzKCk7XHJcblxyXG5cdFx0XHQvLyBSb3VuZCBwZXIgIzM5MVxyXG5cdFx0XHRpZiAoIGluY3JlbWVudCAhPT0gbnVsbCAmJiBpbmNyZW1lbnQgIT09IGZhbHNlICkge1xyXG5cdFx0XHRcdGluY3JlbWVudCA9IE51bWJlcihpbmNyZW1lbnQudG9GaXhlZChzdGVwRGVjaW1hbHMpKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKCBkZWNyZW1lbnQgIT09IG51bGwgJiYgZGVjcmVtZW50ICE9PSBmYWxzZSApIHtcclxuXHRcdFx0XHRkZWNyZW1lbnQgPSBOdW1iZXIoZGVjcmVtZW50LnRvRml4ZWQoc3RlcERlY2ltYWxzKSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBbZGVjcmVtZW50LCBpbmNyZW1lbnRdO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvLyBBdHRhY2ggYW4gZXZlbnQgdG8gdGhpcyBzbGlkZXIsIHBvc3NpYmx5IGluY2x1ZGluZyBhIG5hbWVzcGFjZVxyXG5cdGZ1bmN0aW9uIGJpbmRFdmVudCAoIG5hbWVzcGFjZWRFdmVudCwgY2FsbGJhY2sgKSB7XHJcblx0XHRzY29wZV9FdmVudHNbbmFtZXNwYWNlZEV2ZW50XSA9IHNjb3BlX0V2ZW50c1tuYW1lc3BhY2VkRXZlbnRdIHx8IFtdO1xyXG5cdFx0c2NvcGVfRXZlbnRzW25hbWVzcGFjZWRFdmVudF0ucHVzaChjYWxsYmFjayk7XHJcblxyXG5cdFx0Ly8gSWYgdGhlIGV2ZW50IGJvdW5kIGlzICd1cGRhdGUsJyBmaXJlIGl0IGltbWVkaWF0ZWx5IGZvciBhbGwgaGFuZGxlcy5cclxuXHRcdGlmICggbmFtZXNwYWNlZEV2ZW50LnNwbGl0KCcuJylbMF0gPT09ICd1cGRhdGUnICkge1xyXG5cdFx0XHRzY29wZV9IYW5kbGVzLmZvckVhY2goZnVuY3Rpb24oYSwgaW5kZXgpe1xyXG5cdFx0XHRcdGZpcmVFdmVudCgndXBkYXRlJywgaW5kZXgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIFVuZG8gYXR0YWNobWVudCBvZiBldmVudFxyXG5cdGZ1bmN0aW9uIHJlbW92ZUV2ZW50ICggbmFtZXNwYWNlZEV2ZW50ICkge1xyXG5cclxuXHRcdHZhciBldmVudCA9IG5hbWVzcGFjZWRFdmVudCAmJiBuYW1lc3BhY2VkRXZlbnQuc3BsaXQoJy4nKVswXTtcclxuXHRcdHZhciBuYW1lc3BhY2UgPSBldmVudCAmJiBuYW1lc3BhY2VkRXZlbnQuc3Vic3RyaW5nKGV2ZW50Lmxlbmd0aCk7XHJcblxyXG5cdFx0T2JqZWN0LmtleXMoc2NvcGVfRXZlbnRzKS5mb3JFYWNoKGZ1bmN0aW9uKCBiaW5kICl7XHJcblxyXG5cdFx0XHR2YXIgdEV2ZW50ID0gYmluZC5zcGxpdCgnLicpWzBdLFxyXG5cdFx0XHRcdHROYW1lc3BhY2UgPSBiaW5kLnN1YnN0cmluZyh0RXZlbnQubGVuZ3RoKTtcclxuXHJcblx0XHRcdGlmICggKCFldmVudCB8fCBldmVudCA9PT0gdEV2ZW50KSAmJiAoIW5hbWVzcGFjZSB8fCBuYW1lc3BhY2UgPT09IHROYW1lc3BhY2UpICkge1xyXG5cdFx0XHRcdGRlbGV0ZSBzY29wZV9FdmVudHNbYmluZF07XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Ly8gVXBkYXRlYWJsZTogbWFyZ2luLCBsaW1pdCwgcGFkZGluZywgc3RlcCwgcmFuZ2UsIGFuaW1hdGUsIHNuYXBcclxuXHRmdW5jdGlvbiB1cGRhdGVPcHRpb25zICggb3B0aW9uc1RvVXBkYXRlLCBmaXJlU2V0RXZlbnQgKSB7XHJcblxyXG5cdFx0Ly8gU3BlY3RydW0gaXMgY3JlYXRlZCB1c2luZyB0aGUgcmFuZ2UsIHNuYXAsIGRpcmVjdGlvbiBhbmQgc3RlcCBvcHRpb25zLlxyXG5cdFx0Ly8gJ3NuYXAnIGFuZCAnc3RlcCcgY2FuIGJlIHVwZGF0ZWQuXHJcblx0XHQvLyBJZiAnc25hcCcgYW5kICdzdGVwJyBhcmUgbm90IHBhc3NlZCwgdGhleSBzaG91bGQgcmVtYWluIHVuY2hhbmdlZC5cclxuXHRcdHZhciB2ID0gdmFsdWVHZXQoKTtcclxuXHJcblx0XHR2YXIgdXBkYXRlQWJsZSA9IFsnbWFyZ2luJywgJ2xpbWl0JywgJ3BhZGRpbmcnLCAncmFuZ2UnLCAnYW5pbWF0ZScsICdzbmFwJywgJ3N0ZXAnLCAnZm9ybWF0J107XHJcblxyXG5cdFx0Ly8gT25seSBjaGFuZ2Ugb3B0aW9ucyB0aGF0IHdlJ3JlIGFjdHVhbGx5IHBhc3NlZCB0byB1cGRhdGUuXHJcblx0XHR1cGRhdGVBYmxlLmZvckVhY2goZnVuY3Rpb24obmFtZSl7XHJcblx0XHRcdGlmICggb3B0aW9uc1RvVXBkYXRlW25hbWVdICE9PSB1bmRlZmluZWQgKSB7XHJcblx0XHRcdFx0b3JpZ2luYWxPcHRpb25zW25hbWVdID0gb3B0aW9uc1RvVXBkYXRlW25hbWVdO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHR2YXIgbmV3T3B0aW9ucyA9IHRlc3RPcHRpb25zKG9yaWdpbmFsT3B0aW9ucyk7XHJcblxyXG5cdFx0Ly8gTG9hZCBuZXcgb3B0aW9ucyBpbnRvIHRoZSBzbGlkZXIgc3RhdGVcclxuXHRcdHVwZGF0ZUFibGUuZm9yRWFjaChmdW5jdGlvbihuYW1lKXtcclxuXHRcdFx0aWYgKCBvcHRpb25zVG9VcGRhdGVbbmFtZV0gIT09IHVuZGVmaW5lZCApIHtcclxuXHRcdFx0XHRvcHRpb25zW25hbWVdID0gbmV3T3B0aW9uc1tuYW1lXTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0c2NvcGVfU3BlY3RydW0gPSBuZXdPcHRpb25zLnNwZWN0cnVtO1xyXG5cclxuXHRcdC8vIExpbWl0LCBtYXJnaW4gYW5kIHBhZGRpbmcgZGVwZW5kIG9uIHRoZSBzcGVjdHJ1bSBidXQgYXJlIHN0b3JlZCBvdXRzaWRlIG9mIGl0LiAoIzY3NylcclxuXHRcdG9wdGlvbnMubWFyZ2luID0gbmV3T3B0aW9ucy5tYXJnaW47XHJcblx0XHRvcHRpb25zLmxpbWl0ID0gbmV3T3B0aW9ucy5saW1pdDtcclxuXHRcdG9wdGlvbnMucGFkZGluZyA9IG5ld09wdGlvbnMucGFkZGluZztcclxuXHJcblx0XHQvLyBVcGRhdGUgcGlwcywgcmVtb3ZlcyBleGlzdGluZy5cclxuXHRcdGlmICggb3B0aW9ucy5waXBzICkge1xyXG5cdFx0XHRwaXBzKG9wdGlvbnMucGlwcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gSW52YWxpZGF0ZSB0aGUgY3VycmVudCBwb3NpdGlvbmluZyBzbyB2YWx1ZVNldCBmb3JjZXMgYW4gdXBkYXRlLlxyXG5cdFx0c2NvcGVfTG9jYXRpb25zID0gW107XHJcblx0XHR2YWx1ZVNldChvcHRpb25zVG9VcGRhdGUuc3RhcnQgfHwgdiwgZmlyZVNldEV2ZW50KTtcclxuXHR9XHJcblxyXG5cdC8vIFRocm93IGFuIGVycm9yIGlmIHRoZSBzbGlkZXIgd2FzIGFscmVhZHkgaW5pdGlhbGl6ZWQuXHJcblx0aWYgKCBzY29wZV9UYXJnZXQubm9VaVNsaWRlciApIHtcclxuXHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXIgKFwiICsgVkVSU0lPTiArIFwiKTogU2xpZGVyIHdhcyBhbHJlYWR5IGluaXRpYWxpemVkLlwiKTtcclxuXHR9XHJcblxyXG5cdC8vIENyZWF0ZSB0aGUgYmFzZSBlbGVtZW50LCBpbml0aWFsaXNlIEhUTUwgYW5kIHNldCBjbGFzc2VzLlxyXG5cdC8vIEFkZCBoYW5kbGVzIGFuZCBjb25uZWN0IGVsZW1lbnRzLlxyXG5cdGFkZFNsaWRlcihzY29wZV9UYXJnZXQpO1xyXG5cdGFkZEVsZW1lbnRzKG9wdGlvbnMuY29ubmVjdCwgc2NvcGVfQmFzZSk7XHJcblxyXG5cdHNjb3BlX1NlbGYgPSB7XHJcblx0XHRkZXN0cm95OiBkZXN0cm95LFxyXG5cdFx0c3RlcHM6IGdldEN1cnJlbnRTdGVwLFxyXG5cdFx0b246IGJpbmRFdmVudCxcclxuXHRcdG9mZjogcmVtb3ZlRXZlbnQsXHJcblx0XHRnZXQ6IHZhbHVlR2V0LFxyXG5cdFx0c2V0OiB2YWx1ZVNldCxcclxuXHRcdHJlc2V0OiB2YWx1ZVJlc2V0LFxyXG5cdFx0Ly8gRXhwb3NlZCBmb3IgdW5pdCB0ZXN0aW5nLCBkb24ndCB1c2UgdGhpcyBpbiB5b3VyIGFwcGxpY2F0aW9uLlxyXG5cdFx0X19tb3ZlSGFuZGxlczogZnVuY3Rpb24oYSwgYiwgYykgeyBtb3ZlSGFuZGxlcyhhLCBiLCBzY29wZV9Mb2NhdGlvbnMsIGMpOyB9LFxyXG5cdFx0b3B0aW9uczogb3JpZ2luYWxPcHRpb25zLCAvLyBJc3N1ZSAjNjAwLCAjNjc4XHJcblx0XHR1cGRhdGVPcHRpb25zOiB1cGRhdGVPcHRpb25zLFxyXG5cdFx0dGFyZ2V0OiBzY29wZV9UYXJnZXQsIC8vIElzc3VlICM1OTdcclxuXHRcdHJlbW92ZVBpcHM6IHJlbW92ZVBpcHMsXHJcblx0XHRwaXBzOiBwaXBzIC8vIElzc3VlICM1OTRcclxuXHR9O1xyXG5cclxuXHQvLyBBdHRhY2ggdXNlciBldmVudHMuXHJcblx0YmluZFNsaWRlckV2ZW50cyhvcHRpb25zLmV2ZW50cyk7XHJcblxyXG5cdC8vIFVzZSB0aGUgcHVibGljIHZhbHVlIG1ldGhvZCB0byBzZXQgdGhlIHN0YXJ0IHZhbHVlcy5cclxuXHR2YWx1ZVNldChvcHRpb25zLnN0YXJ0KTtcclxuXHJcblx0aWYgKCBvcHRpb25zLnBpcHMgKSB7XHJcblx0XHRwaXBzKG9wdGlvbnMucGlwcyk7XHJcblx0fVxyXG5cclxuXHRpZiAoIG9wdGlvbnMudG9vbHRpcHMgKSB7XHJcblx0XHR0b29sdGlwcygpO1xyXG5cdH1cclxuXHJcblx0YXJpYSgpO1xyXG5cclxuXHRyZXR1cm4gc2NvcGVfU2VsZjtcclxuXHJcbn1cclxuXHJcblxyXG5cdC8vIFJ1biB0aGUgc3RhbmRhcmQgaW5pdGlhbGl6ZXJcclxuXHRmdW5jdGlvbiBpbml0aWFsaXplICggdGFyZ2V0LCBvcmlnaW5hbE9wdGlvbnMgKSB7XHJcblxyXG5cdFx0aWYgKCAhdGFyZ2V0IHx8ICF0YXJnZXQubm9kZU5hbWUgKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXIgKFwiICsgVkVSU0lPTiArIFwiKTogY3JlYXRlIHJlcXVpcmVzIGEgc2luZ2xlIGVsZW1lbnQsIGdvdDogXCIgKyB0YXJnZXQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFRlc3QgdGhlIG9wdGlvbnMgYW5kIGNyZWF0ZSB0aGUgc2xpZGVyIGVudmlyb25tZW50O1xyXG5cdFx0dmFyIG9wdGlvbnMgPSB0ZXN0T3B0aW9ucyggb3JpZ2luYWxPcHRpb25zLCB0YXJnZXQgKTtcclxuXHRcdHZhciBhcGkgPSBjbG9zdXJlKCB0YXJnZXQsIG9wdGlvbnMsIG9yaWdpbmFsT3B0aW9ucyApO1xyXG5cclxuXHRcdHRhcmdldC5ub1VpU2xpZGVyID0gYXBpO1xyXG5cclxuXHRcdHJldHVybiBhcGk7XHJcblx0fVxyXG5cclxuXHQvLyBVc2UgYW4gb2JqZWN0IGluc3RlYWQgb2YgYSBmdW5jdGlvbiBmb3IgZnV0dXJlIGV4cGFuc2liaWxpdHk7XHJcblx0cmV0dXJuIHtcclxuXHRcdHZlcnNpb246IFZFUlNJT04sXHJcblx0XHRjcmVhdGU6IGluaXRpYWxpemVcclxuXHR9O1xyXG5cclxufSkpO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92ZW5kb3Ivbm91aXNsaWRlci5qcyIsImltcG9ydCBkZXN0aW5hdGlvbiBmcm9tICdAdHVyZi9kZXN0aW5hdGlvbic7XG5pbXBvcnQgeyBwb2x5Z29uIH0gZnJvbSAnQHR1cmYvaGVscGVycyc7XG5cbi8qKlxuICogVGFrZXMgYSB7QGxpbmsgUG9pbnR9IGFuZCBjYWxjdWxhdGVzIHRoZSBjaXJjbGUgcG9seWdvbiBnaXZlbiBhIHJhZGl1cyBpbiBkZWdyZWVzLCByYWRpYW5zLCBtaWxlcywgb3Iga2lsb21ldGVyczsgYW5kIHN0ZXBzIGZvciBwcmVjaXNpb24uXG4gKlxuICogQG5hbWUgY2lyY2xlXG4gKiBAcGFyYW0ge0ZlYXR1cmU8UG9pbnQ+fG51bWJlcltdfSBjZW50ZXIgY2VudGVyIHBvaW50XG4gKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzIHJhZGl1cyBvZiB0aGUgY2lyY2xlXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIE9wdGlvbmFsIHBhcmFtZXRlcnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zdGVwcz02NF0gbnVtYmVyIG9mIHN0ZXBzXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudW5pdHM9J2tpbG9tZXRlcnMnXSBtaWxlcywga2lsb21ldGVycywgZGVncmVlcywgb3IgcmFkaWFuc1xuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zLnByb3BlcnRpZXM9e31dIHByb3BlcnRpZXNcbiAqIEByZXR1cm5zIHtGZWF0dXJlPFBvbHlnb24+fSBjaXJjbGUgcG9seWdvblxuICogQGV4YW1wbGVcbiAqIHZhciBjZW50ZXIgPSBbLTc1LjM0MywgMzkuOTg0XTtcbiAqIHZhciByYWRpdXMgPSA1O1xuICogdmFyIHN0ZXBzID0gMTA7XG4gKiB2YXIgdW5pdHMgPSAna2lsb21ldGVycyc7XG4gKiB2YXIgcHJvcGVydGllcyA9IHtmb286ICdiYXInfTtcbiAqXG4gKiB2YXIgY2lyY2xlID0gdHVyZi5jaXJjbGUoY2VudGVyLCByYWRpdXMsIHN0ZXBzLCB1bml0cywgcHJvcGVydGllcyk7XG4gKlxuICogLy9hZGRUb01hcFxuICogdmFyIGFkZFRvTWFwID0gW3R1cmYucG9pbnQoY2VudGVyKSwgY2lyY2xlXVxuICovXG5mdW5jdGlvbiBjaXJjbGUoY2VudGVyLCByYWRpdXMsIG9wdGlvbnMpIHtcbiAgICAvLyBPcHRpb25hbCBwYXJhbXNcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgc3RlcHMgPSBvcHRpb25zLnN0ZXBzIHx8IDY0O1xuICAgIHZhciB1bml0cyA9IG9wdGlvbnMudW5pdHM7XG4gICAgdmFyIHByb3BlcnRpZXMgPSBvcHRpb25zLnByb3BlcnRpZXM7XG5cbiAgICAvLyB2YWxpZGF0aW9uXG4gICAgaWYgKCFjZW50ZXIpIHRocm93IG5ldyBFcnJvcignY2VudGVyIGlzIHJlcXVpcmVkJyk7XG4gICAgaWYgKCFyYWRpdXMpIHRocm93IG5ldyBFcnJvcigncmFkaXVzIGlzIHJlcXVpcmVkJyk7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0JykgdGhyb3cgbmV3IEVycm9yKCdvcHRpb25zIG11c3QgYmUgYW4gb2JqZWN0Jyk7XG4gICAgaWYgKHR5cGVvZiBzdGVwcyAhPT0gJ251bWJlcicpIHRocm93IG5ldyBFcnJvcignc3RlcHMgbXVzdCBiZSBhIG51bWJlcicpO1xuXG4gICAgLy8gZGVmYXVsdCBwYXJhbXNcbiAgICBzdGVwcyA9IHN0ZXBzIHx8IDY0O1xuICAgIHByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzIHx8IGNlbnRlci5wcm9wZXJ0aWVzIHx8IHt9O1xuXG4gICAgdmFyIGNvb3JkaW5hdGVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdGVwczsgaSsrKSB7XG4gICAgICAgIGNvb3JkaW5hdGVzLnB1c2goZGVzdGluYXRpb24oY2VudGVyLCByYWRpdXMsIGkgKiAzNjAgLyBzdGVwcywgdW5pdHMpLmdlb21ldHJ5LmNvb3JkaW5hdGVzKTtcbiAgICB9XG4gICAgY29vcmRpbmF0ZXMucHVzaChjb29yZGluYXRlc1swXSk7XG5cbiAgICByZXR1cm4gcG9seWdvbihbY29vcmRpbmF0ZXNdLCBwcm9wZXJ0aWVzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2lyY2xlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQHR1cmYvY2lyY2xlL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvL2h0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSGF2ZXJzaW5lX2Zvcm11bGFcbi8vaHR0cDovL3d3dy5tb3ZhYmxlLXR5cGUuY28udWsvc2NyaXB0cy9sYXRsb25nLmh0bWxcbmltcG9ydCB7IGdldENvb3JkIH0gZnJvbSAnQHR1cmYvaW52YXJpYW50JztcbmltcG9ydCB7IHBvaW50LCBkaXN0YW5jZVRvUmFkaWFucyB9IGZyb20gJ0B0dXJmL2hlbHBlcnMnO1xuXG4vKipcbiAqIFRha2VzIGEge0BsaW5rIFBvaW50fSBhbmQgY2FsY3VsYXRlcyB0aGUgbG9jYXRpb24gb2YgYSBkZXN0aW5hdGlvbiBwb2ludCBnaXZlbiBhIGRpc3RhbmNlIGluIGRlZ3JlZXMsIHJhZGlhbnMsIG1pbGVzLCBvciBraWxvbWV0ZXJzOyBhbmQgYmVhcmluZyBpbiBkZWdyZWVzLiBUaGlzIHVzZXMgdGhlIFtIYXZlcnNpbmUgZm9ybXVsYV0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9IYXZlcnNpbmVfZm9ybXVsYSkgdG8gYWNjb3VudCBmb3IgZ2xvYmFsIGN1cnZhdHVyZS5cbiAqXG4gKiBAbmFtZSBkZXN0aW5hdGlvblxuICogQHBhcmFtIHtHZW9tZXRyeXxGZWF0dXJlPFBvaW50PnxBcnJheTxudW1iZXI+fSBvcmlnaW4gc3RhcnRpbmcgcG9pbnRcbiAqIEBwYXJhbSB7bnVtYmVyfSBkaXN0YW5jZSBkaXN0YW5jZSBmcm9tIHRoZSBvcmlnaW4gcG9pbnRcbiAqIEBwYXJhbSB7bnVtYmVyfSBiZWFyaW5nIHJhbmdpbmcgZnJvbSAtMTgwIHRvIDE4MFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgT3B0aW9uYWwgcGFyYW1ldGVyc1xuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuaXRzPSdraWxvbWV0ZXJzJ10gbWlsZXMsIGtpbG9tZXRlcnMsIGRlZ3JlZXMsIG9yIHJhZGlhbnNcbiAqIEByZXR1cm5zIHtGZWF0dXJlPFBvaW50Pn0gZGVzdGluYXRpb24gcG9pbnRcbiAqIEBleGFtcGxlXG4gKiB2YXIgcG9pbnQgPSB0dXJmLnBvaW50KFstNzUuMzQzLCAzOS45ODRdKTtcbiAqIHZhciBkaXN0YW5jZSA9IDUwO1xuICogdmFyIGJlYXJpbmcgPSA5MDtcbiAqIHZhciB1bml0cyA9ICdtaWxlcyc7XG4gKlxuICogdmFyIGRlc3RpbmF0aW9uID0gdHVyZi5kZXN0aW5hdGlvbihwb2ludCwgZGlzdGFuY2UsIGJlYXJpbmcsIHVuaXRzKTtcbiAqXG4gKiAvL2FkZFRvTWFwXG4gKiB2YXIgYWRkVG9NYXAgPSBbcG9pbnQsIGRlc3RpbmF0aW9uXVxuICogZGVzdGluYXRpb24ucHJvcGVydGllc1snbWFya2VyLWNvbG9yJ10gPSAnI2YwMCc7XG4gKiBwb2ludC5wcm9wZXJ0aWVzWydtYXJrZXItY29sb3InXSA9ICcjMGYwJztcbiAqL1xuZnVuY3Rpb24gZGVzdGluYXRpb24ob3JpZ2luLCBkaXN0YW5jZSwgYmVhcmluZywgb3B0aW9ucykge1xuICAgIC8vIEJhY2t3YXJkcyBjb21wYXRpYmxlIHdpdGggdjQuMFxuICAgIHZhciB1bml0cyA9ICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcpID8gb3B0aW9ucy51bml0cyA6IG9wdGlvbnM7XG5cbiAgICB2YXIgZGVncmVlczJyYWRpYW5zID0gTWF0aC5QSSAvIDE4MDtcbiAgICB2YXIgcmFkaWFuczJkZWdyZWVzID0gMTgwIC8gTWF0aC5QSTtcbiAgICB2YXIgY29vcmRpbmF0ZXMxID0gZ2V0Q29vcmQob3JpZ2luKTtcbiAgICB2YXIgbG9uZ2l0dWRlMSA9IGRlZ3JlZXMycmFkaWFucyAqIGNvb3JkaW5hdGVzMVswXTtcbiAgICB2YXIgbGF0aXR1ZGUxID0gZGVncmVlczJyYWRpYW5zICogY29vcmRpbmF0ZXMxWzFdO1xuICAgIHZhciBiZWFyaW5nX3JhZCA9IGRlZ3JlZXMycmFkaWFucyAqIGJlYXJpbmc7XG5cbiAgICB2YXIgcmFkaWFucyA9IGRpc3RhbmNlVG9SYWRpYW5zKGRpc3RhbmNlLCB1bml0cyk7XG5cbiAgICB2YXIgbGF0aXR1ZGUyID0gTWF0aC5hc2luKE1hdGguc2luKGxhdGl0dWRlMSkgKiBNYXRoLmNvcyhyYWRpYW5zKSArXG4gICAgICAgIE1hdGguY29zKGxhdGl0dWRlMSkgKiBNYXRoLnNpbihyYWRpYW5zKSAqIE1hdGguY29zKGJlYXJpbmdfcmFkKSk7XG4gICAgdmFyIGxvbmdpdHVkZTIgPSBsb25naXR1ZGUxICsgTWF0aC5hdGFuMihNYXRoLnNpbihiZWFyaW5nX3JhZCkgKiBNYXRoLnNpbihyYWRpYW5zKSAqIE1hdGguY29zKGxhdGl0dWRlMSksXG4gICAgICAgIE1hdGguY29zKHJhZGlhbnMpIC0gTWF0aC5zaW4obGF0aXR1ZGUxKSAqIE1hdGguc2luKGxhdGl0dWRlMikpO1xuXG4gICAgcmV0dXJuIHBvaW50KFtyYWRpYW5zMmRlZ3JlZXMgKiBsb25naXR1ZGUyLCByYWRpYW5zMmRlZ3JlZXMgKiBsYXRpdHVkZTJdKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZGVzdGluYXRpb247XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AdHVyZi9kZXN0aW5hdGlvbi9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMjRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBVbndyYXAgYSBjb29yZGluYXRlIGZyb20gYSBQb2ludCBGZWF0dXJlLCBHZW9tZXRyeSBvciBhIHNpbmdsZSBjb29yZGluYXRlLlxuICpcbiAqIEBuYW1lIGdldENvb3JkXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj58R2VvbWV0cnk8UG9pbnQ+fEZlYXR1cmU8UG9pbnQ+fSBvYmogT2JqZWN0XG4gKiBAcmV0dXJucyB7QXJyYXk8bnVtYmVyPn0gY29vcmRpbmF0ZXNcbiAqIEBleGFtcGxlXG4gKiB2YXIgcHQgPSB0dXJmLnBvaW50KFsxMCwgMTBdKTtcbiAqXG4gKiB2YXIgY29vcmQgPSB0dXJmLmdldENvb3JkKHB0KTtcbiAqIC8vPSBbMTAsIDEwXVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29vcmQob2JqKSB7XG4gICAgaWYgKCFvYmopIHRocm93IG5ldyBFcnJvcignb2JqIGlzIHJlcXVpcmVkJyk7XG5cbiAgICB2YXIgY29vcmRpbmF0ZXMgPSBnZXRDb29yZHMob2JqKTtcblxuICAgIC8vIGdldENvb3JkKCkgbXVzdCBjb250YWluIGF0IGxlYXN0IHR3byBudW1iZXJzIChQb2ludClcbiAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoID4gMSAmJlxuICAgICAgICB0eXBlb2YgY29vcmRpbmF0ZXNbMF0gPT09ICdudW1iZXInICYmXG4gICAgICAgIHR5cGVvZiBjb29yZGluYXRlc1sxXSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcmV0dXJuIGNvb3JkaW5hdGVzO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ29vcmRpbmF0ZSBpcyBub3QgYSB2YWxpZCBQb2ludCcpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBVbndyYXAgY29vcmRpbmF0ZXMgZnJvbSBhIEZlYXR1cmUsIEdlb21ldHJ5IE9iamVjdCBvciBhbiBBcnJheSBvZiBudW1iZXJzXG4gKlxuICogQG5hbWUgZ2V0Q29vcmRzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj58R2VvbWV0cnl8RmVhdHVyZX0gb2JqIE9iamVjdFxuICogQHJldHVybnMge0FycmF5PG51bWJlcj59IGNvb3JkaW5hdGVzXG4gKiBAZXhhbXBsZVxuICogdmFyIHBvbHkgPSB0dXJmLnBvbHlnb24oW1tbMTE5LjMyLCAtOC43XSwgWzExOS41NSwgLTguNjldLCBbMTE5LjUxLCAtOC41NF0sIFsxMTkuMzIsIC04LjddXV0pO1xuICpcbiAqIHZhciBjb29yZCA9IHR1cmYuZ2V0Q29vcmRzKHBvbHkpO1xuICogLy89IFtbWzExOS4zMiwgLTguN10sIFsxMTkuNTUsIC04LjY5XSwgWzExOS41MSwgLTguNTRdLCBbMTE5LjMyLCAtOC43XV1dXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb29yZHMob2JqKSB7XG4gICAgaWYgKCFvYmopIHRocm93IG5ldyBFcnJvcignb2JqIGlzIHJlcXVpcmVkJyk7XG4gICAgdmFyIGNvb3JkaW5hdGVzO1xuXG4gICAgLy8gQXJyYXkgb2YgbnVtYmVyc1xuICAgIGlmIChvYmoubGVuZ3RoKSB7XG4gICAgICAgIGNvb3JkaW5hdGVzID0gb2JqO1xuXG4gICAgLy8gR2VvbWV0cnkgT2JqZWN0XG4gICAgfSBlbHNlIGlmIChvYmouY29vcmRpbmF0ZXMpIHtcbiAgICAgICAgY29vcmRpbmF0ZXMgPSBvYmouY29vcmRpbmF0ZXM7XG5cbiAgICAvLyBGZWF0dXJlXG4gICAgfSBlbHNlIGlmIChvYmouZ2VvbWV0cnkgJiYgb2JqLmdlb21ldHJ5LmNvb3JkaW5hdGVzKSB7XG4gICAgICAgIGNvb3JkaW5hdGVzID0gb2JqLmdlb21ldHJ5LmNvb3JkaW5hdGVzO1xuICAgIH1cbiAgICAvLyBDaGVja3MgaWYgY29vcmRpbmF0ZXMgY29udGFpbnMgYSBudW1iZXJcbiAgICBpZiAoY29vcmRpbmF0ZXMpIHtcbiAgICAgICAgY29udGFpbnNOdW1iZXIoY29vcmRpbmF0ZXMpO1xuICAgICAgICByZXR1cm4gY29vcmRpbmF0ZXM7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcignTm8gdmFsaWQgY29vcmRpbmF0ZXMnKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgY29vcmRpbmF0ZXMgY29udGFpbnMgYSBudW1iZXJcbiAqXG4gKiBAbmFtZSBjb250YWluc051bWJlclxuICogQHBhcmFtIHtBcnJheTxhbnk+fSBjb29yZGluYXRlcyBHZW9KU09OIENvb3JkaW5hdGVzXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiBBcnJheSBjb250YWlucyBhIG51bWJlclxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udGFpbnNOdW1iZXIoY29vcmRpbmF0ZXMpIHtcbiAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoID4gMSAmJlxuICAgICAgICB0eXBlb2YgY29vcmRpbmF0ZXNbMF0gPT09ICdudW1iZXInICYmXG4gICAgICAgIHR5cGVvZiBjb29yZGluYXRlc1sxXSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY29vcmRpbmF0ZXNbMF0pICYmIGNvb3JkaW5hdGVzWzBdLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gY29udGFpbnNOdW1iZXIoY29vcmRpbmF0ZXNbMF0pO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nvb3JkaW5hdGVzIG11c3Qgb25seSBjb250YWluIG51bWJlcnMnKTtcbn1cblxuLyoqXG4gKiBFbmZvcmNlIGV4cGVjdGF0aW9ucyBhYm91dCB0eXBlcyBvZiBHZW9KU09OIG9iamVjdHMgZm9yIFR1cmYuXG4gKlxuICogQG5hbWUgZ2VvanNvblR5cGVcbiAqIEBwYXJhbSB7R2VvSlNPTn0gdmFsdWUgYW55IEdlb0pTT04gb2JqZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBleHBlY3RlZCBHZW9KU09OIHR5cGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWUgb2YgY2FsbGluZyBmdW5jdGlvblxuICogQHRocm93cyB7RXJyb3J9IGlmIHZhbHVlIGlzIG5vdCB0aGUgZXhwZWN0ZWQgdHlwZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlb2pzb25UeXBlKHZhbHVlLCB0eXBlLCBuYW1lKSB7XG4gICAgaWYgKCF0eXBlIHx8ICFuYW1lKSB0aHJvdyBuZXcgRXJyb3IoJ3R5cGUgYW5kIG5hbWUgcmVxdWlyZWQnKTtcblxuICAgIGlmICghdmFsdWUgfHwgdmFsdWUudHlwZSAhPT0gdHlwZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaW5wdXQgdG8gJyArIG5hbWUgKyAnOiBtdXN0IGJlIGEgJyArIHR5cGUgKyAnLCBnaXZlbiAnICsgdmFsdWUudHlwZSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEVuZm9yY2UgZXhwZWN0YXRpb25zIGFib3V0IHR5cGVzIG9mIHtAbGluayBGZWF0dXJlfSBpbnB1dHMgZm9yIFR1cmYuXG4gKiBJbnRlcm5hbGx5IHRoaXMgdXNlcyB7QGxpbmsgZ2VvanNvblR5cGV9IHRvIGp1ZGdlIGdlb21ldHJ5IHR5cGVzLlxuICpcbiAqIEBuYW1lIGZlYXR1cmVPZlxuICogQHBhcmFtIHtGZWF0dXJlfSBmZWF0dXJlIGEgZmVhdHVyZSB3aXRoIGFuIGV4cGVjdGVkIGdlb21ldHJ5IHR5cGVcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIGV4cGVjdGVkIEdlb0pTT04gdHlwZVxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgbmFtZSBvZiBjYWxsaW5nIGZ1bmN0aW9uXG4gKiBAdGhyb3dzIHtFcnJvcn0gZXJyb3IgaWYgdmFsdWUgaXMgbm90IHRoZSBleHBlY3RlZCB0eXBlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmVhdHVyZU9mKGZlYXR1cmUsIHR5cGUsIG5hbWUpIHtcbiAgICBpZiAoIWZlYXR1cmUpIHRocm93IG5ldyBFcnJvcignTm8gZmVhdHVyZSBwYXNzZWQnKTtcbiAgICBpZiAoIW5hbWUpIHRocm93IG5ldyBFcnJvcignLmZlYXR1cmVPZigpIHJlcXVpcmVzIGEgbmFtZScpO1xuICAgIGlmICghZmVhdHVyZSB8fCBmZWF0dXJlLnR5cGUgIT09ICdGZWF0dXJlJyB8fCAhZmVhdHVyZS5nZW9tZXRyeSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaW5wdXQgdG8gJyArIG5hbWUgKyAnLCBGZWF0dXJlIHdpdGggZ2VvbWV0cnkgcmVxdWlyZWQnKTtcbiAgICB9XG4gICAgaWYgKCFmZWF0dXJlLmdlb21ldHJ5IHx8IGZlYXR1cmUuZ2VvbWV0cnkudHlwZSAhPT0gdHlwZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaW5wdXQgdG8gJyArIG5hbWUgKyAnOiBtdXN0IGJlIGEgJyArIHR5cGUgKyAnLCBnaXZlbiAnICsgZmVhdHVyZS5nZW9tZXRyeS50eXBlKTtcbiAgICB9XG59XG5cbi8qKlxuICogRW5mb3JjZSBleHBlY3RhdGlvbnMgYWJvdXQgdHlwZXMgb2Yge0BsaW5rIEZlYXR1cmVDb2xsZWN0aW9ufSBpbnB1dHMgZm9yIFR1cmYuXG4gKiBJbnRlcm5hbGx5IHRoaXMgdXNlcyB7QGxpbmsgZ2VvanNvblR5cGV9IHRvIGp1ZGdlIGdlb21ldHJ5IHR5cGVzLlxuICpcbiAqIEBuYW1lIGNvbGxlY3Rpb25PZlxuICogQHBhcmFtIHtGZWF0dXJlQ29sbGVjdGlvbn0gZmVhdHVyZUNvbGxlY3Rpb24gYSBGZWF0dXJlQ29sbGVjdGlvbiBmb3Igd2hpY2ggZmVhdHVyZXMgd2lsbCBiZSBqdWRnZWRcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIGV4cGVjdGVkIEdlb0pTT04gdHlwZVxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgbmFtZSBvZiBjYWxsaW5nIGZ1bmN0aW9uXG4gKiBAdGhyb3dzIHtFcnJvcn0gaWYgdmFsdWUgaXMgbm90IHRoZSBleHBlY3RlZCB0eXBlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29sbGVjdGlvbk9mKGZlYXR1cmVDb2xsZWN0aW9uLCB0eXBlLCBuYW1lKSB7XG4gICAgaWYgKCFmZWF0dXJlQ29sbGVjdGlvbikgdGhyb3cgbmV3IEVycm9yKCdObyBmZWF0dXJlQ29sbGVjdGlvbiBwYXNzZWQnKTtcbiAgICBpZiAoIW5hbWUpIHRocm93IG5ldyBFcnJvcignLmNvbGxlY3Rpb25PZigpIHJlcXVpcmVzIGEgbmFtZScpO1xuICAgIGlmICghZmVhdHVyZUNvbGxlY3Rpb24gfHwgZmVhdHVyZUNvbGxlY3Rpb24udHlwZSAhPT0gJ0ZlYXR1cmVDb2xsZWN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaW5wdXQgdG8gJyArIG5hbWUgKyAnLCBGZWF0dXJlQ29sbGVjdGlvbiByZXF1aXJlZCcpO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBmZWF0dXJlID0gZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbaV07XG4gICAgICAgIGlmICghZmVhdHVyZSB8fCBmZWF0dXJlLnR5cGUgIT09ICdGZWF0dXJlJyB8fCAhZmVhdHVyZS5nZW9tZXRyeSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGlucHV0IHRvICcgKyBuYW1lICsgJywgRmVhdHVyZSB3aXRoIGdlb21ldHJ5IHJlcXVpcmVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmZWF0dXJlLmdlb21ldHJ5IHx8IGZlYXR1cmUuZ2VvbWV0cnkudHlwZSAhPT0gdHlwZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGlucHV0IHRvICcgKyBuYW1lICsgJzogbXVzdCBiZSBhICcgKyB0eXBlICsgJywgZ2l2ZW4gJyArIGZlYXR1cmUuZ2VvbWV0cnkudHlwZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogR2V0IEdlb21ldHJ5IGZyb20gRmVhdHVyZSBvciBHZW9tZXRyeSBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge0ZlYXR1cmV8R2VvbWV0cnl9IGdlb2pzb24gR2VvSlNPTiBGZWF0dXJlIG9yIEdlb21ldHJ5IE9iamVjdFxuICogQHJldHVybnMge0dlb21ldHJ5fG51bGx9IEdlb0pTT04gR2VvbWV0cnkgT2JqZWN0XG4gKiBAdGhyb3dzIHtFcnJvcn0gaWYgZ2VvanNvbiBpcyBub3QgYSBGZWF0dXJlIG9yIEdlb21ldHJ5IE9iamVjdFxuICogQGV4YW1wbGVcbiAqIHZhciBwb2ludCA9IHtcbiAqICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICogICBcInByb3BlcnRpZXNcIjoge30sXG4gKiAgIFwiZ2VvbWV0cnlcIjoge1xuICogICAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gKiAgICAgXCJjb29yZGluYXRlc1wiOiBbMTEwLCA0MF1cbiAqICAgfVxuICogfVxuICogdmFyIGdlb20gPSB0dXJmLmdldEdlb20ocG9pbnQpXG4gKiAvLz17XCJ0eXBlXCI6IFwiUG9pbnRcIiwgXCJjb29yZGluYXRlc1wiOiBbMTEwLCA0MF19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRHZW9tKGdlb2pzb24pIHtcbiAgICBpZiAoIWdlb2pzb24pIHRocm93IG5ldyBFcnJvcignZ2VvanNvbiBpcyByZXF1aXJlZCcpO1xuICAgIGlmIChnZW9qc29uLmdlb21ldHJ5ICE9PSB1bmRlZmluZWQpIHJldHVybiBnZW9qc29uLmdlb21ldHJ5O1xuICAgIGlmIChnZW9qc29uLmNvb3JkaW5hdGVzIHx8IGdlb2pzb24uZ2VvbWV0cmllcykgcmV0dXJuIGdlb2pzb247XG4gICAgdGhyb3cgbmV3IEVycm9yKCdnZW9qc29uIG11c3QgYmUgYSB2YWxpZCBGZWF0dXJlIG9yIEdlb21ldHJ5IE9iamVjdCcpO1xufVxuXG4vKipcbiAqIEdldCBHZW9tZXRyeSBUeXBlIGZyb20gRmVhdHVyZSBvciBHZW9tZXRyeSBPYmplY3RcbiAqXG4gKiBAdGhyb3dzIHtFcnJvcn0gKipERVBSRUNBVEVEKiogaW4gdjUuMC4wIGluIGZhdm9yIG9mIGdldFR5cGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEdlb21UeXBlKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YXJpYW50LmdldEdlb21UeXBlIGhhcyBiZWVuIGRlcHJlY2F0ZWQgaW4gdjUuMCBpbiBmYXZvciBvZiBpbnZhcmlhbnQuZ2V0VHlwZScpO1xufVxuXG4vKipcbiAqIEdldCBHZW9KU09OIG9iamVjdCdzIHR5cGUsIEdlb21ldHJ5IHR5cGUgaXMgcHJpb3JpdGl6ZS5cbiAqXG4gKiBAcGFyYW0ge0dlb0pTT059IGdlb2pzb24gR2VvSlNPTiBvYmplY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBbbmFtZV0gbmFtZSBvZiB0aGUgdmFyaWFibGUgdG8gZGlzcGxheSBpbiBlcnJvciBtZXNzYWdlXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBHZW9KU09OIHR5cGVcbiAqIEBleGFtcGxlXG4gKiB2YXIgcG9pbnQgPSB7XG4gKiAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAqICAgXCJwcm9wZXJ0aWVzXCI6IHt9LFxuICogICBcImdlb21ldHJ5XCI6IHtcbiAqICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICogICAgIFwiY29vcmRpbmF0ZXNcIjogWzExMCwgNDBdXG4gKiAgIH1cbiAqIH1cbiAqIHZhciBnZW9tID0gdHVyZi5nZXRUeXBlKHBvaW50KVxuICogLy89XCJQb2ludFwiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUeXBlKGdlb2pzb24sIG5hbWUpIHtcbiAgICBpZiAoIWdlb2pzb24pIHRocm93IG5ldyBFcnJvcigobmFtZSB8fCAnZ2VvanNvbicpICsgJyBpcyByZXF1aXJlZCcpO1xuICAgIC8vIEdlb0pTT04gRmVhdHVyZSAmIEdlb21ldHJ5Q29sbGVjdGlvblxuICAgIGlmIChnZW9qc29uLmdlb21ldHJ5ICYmIGdlb2pzb24uZ2VvbWV0cnkudHlwZSkgcmV0dXJuIGdlb2pzb24uZ2VvbWV0cnkudHlwZTtcbiAgICAvLyBHZW9KU09OIEdlb21ldHJ5ICYgRmVhdHVyZUNvbGxlY3Rpb25cbiAgICBpZiAoZ2VvanNvbi50eXBlKSByZXR1cm4gZ2VvanNvbi50eXBlO1xuICAgIHRocm93IG5ldyBFcnJvcigobmFtZSB8fCAnZ2VvanNvbicpICsgJyBpcyBpbnZhbGlkJyk7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AdHVyZi9pbnZhcmlhbnQvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDI1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogV3JhcHMgYSBHZW9KU09OIHtAbGluayBHZW9tZXRyeX0gaW4gYSBHZW9KU09OIHtAbGluayBGZWF0dXJlfS5cbiAqXG4gKiBAbmFtZSBmZWF0dXJlXG4gKiBAcGFyYW0ge0dlb21ldHJ5fSBnZW9tZXRyeSBpbnB1dCBnZW9tZXRyeVxuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtpZF0gSWRlbnRpZmllclxuICogQHJldHVybnMge0ZlYXR1cmV9IGEgR2VvSlNPTiBGZWF0dXJlXG4gKiBAZXhhbXBsZVxuICogdmFyIGdlb21ldHJ5ID0ge1xuICogICBcInR5cGVcIjogXCJQb2ludFwiLFxuICogICBcImNvb3JkaW5hdGVzXCI6IFsxMTAsIDUwXVxuICogfTtcbiAqXG4gKiB2YXIgZmVhdHVyZSA9IHR1cmYuZmVhdHVyZShnZW9tZXRyeSk7XG4gKlxuICogLy89ZmVhdHVyZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZmVhdHVyZShnZW9tZXRyeSwgcHJvcGVydGllcywgYmJveCwgaWQpIHtcbiAgICBpZiAoZ2VvbWV0cnkgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKCdnZW9tZXRyeSBpcyByZXF1aXJlZCcpO1xuICAgIGlmIChwcm9wZXJ0aWVzICYmIHByb3BlcnRpZXMuY29uc3RydWN0b3IgIT09IE9iamVjdCkgdGhyb3cgbmV3IEVycm9yKCdwcm9wZXJ0aWVzIG11c3QgYmUgYW4gT2JqZWN0Jyk7XG4gICAgaWYgKGJib3ggJiYgYmJveC5sZW5ndGggIT09IDQpIHRocm93IG5ldyBFcnJvcignYmJveCBtdXN0IGJlIGFuIEFycmF5IG9mIDQgbnVtYmVycycpO1xuICAgIGlmIChpZCAmJiBbJ3N0cmluZycsICdudW1iZXInXS5pbmRleE9mKHR5cGVvZiBpZCkgPT09IC0xKSB0aHJvdyBuZXcgRXJyb3IoJ2lkIG11c3QgYmUgYSBudW1iZXIgb3IgYSBzdHJpbmcnKTtcblxuICAgIHZhciBmZWF0ID0ge3R5cGU6ICdGZWF0dXJlJ307XG4gICAgaWYgKGlkKSBmZWF0LmlkID0gaWQ7XG4gICAgaWYgKGJib3gpIGZlYXQuYmJveCA9IGJib3g7XG4gICAgZmVhdC5wcm9wZXJ0aWVzID0gcHJvcGVydGllcyB8fCB7fTtcbiAgICBmZWF0Lmdlb21ldHJ5ID0gZ2VvbWV0cnk7XG4gICAgcmV0dXJuIGZlYXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIEdlb0pTT04ge0BsaW5rIEdlb21ldHJ5fSBmcm9tIGEgR2VvbWV0cnkgc3RyaW5nIHR5cGUgJiBjb29yZGluYXRlcy5cbiAqIEZvciBHZW9tZXRyeUNvbGxlY3Rpb24gdHlwZSB1c2UgYGhlbHBlcnMuZ2VvbWV0cnlDb2xsZWN0aW9uYFxuICpcbiAqIEBuYW1lIGdlb21ldHJ5XG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBHZW9tZXRyeSBUeXBlXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IGNvb3JkaW5hdGVzIENvb3JkaW5hdGVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcmV0dXJucyB7R2VvbWV0cnl9IGEgR2VvSlNPTiBHZW9tZXRyeVxuICogQGV4YW1wbGVcbiAqIHZhciB0eXBlID0gJ1BvaW50JztcbiAqIHZhciBjb29yZGluYXRlcyA9IFsxMTAsIDUwXTtcbiAqXG4gKiB2YXIgZ2VvbWV0cnkgPSB0dXJmLmdlb21ldHJ5KHR5cGUsIGNvb3JkaW5hdGVzKTtcbiAqXG4gKiAvLz1nZW9tZXRyeVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VvbWV0cnkodHlwZSwgY29vcmRpbmF0ZXMsIGJib3gpIHtcbiAgICAvLyBWYWxpZGF0aW9uXG4gICAgaWYgKCF0eXBlKSB0aHJvdyBuZXcgRXJyb3IoJ3R5cGUgaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAoIWNvb3JkaW5hdGVzKSB0aHJvdyBuZXcgRXJyb3IoJ2Nvb3JkaW5hdGVzIGlzIHJlcXVpcmVkJyk7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGNvb3JkaW5hdGVzKSkgdGhyb3cgbmV3IEVycm9yKCdjb29yZGluYXRlcyBtdXN0IGJlIGFuIEFycmF5Jyk7XG4gICAgaWYgKGJib3ggJiYgYmJveC5sZW5ndGggIT09IDQpIHRocm93IG5ldyBFcnJvcignYmJveCBtdXN0IGJlIGFuIEFycmF5IG9mIDQgbnVtYmVycycpO1xuXG4gICAgdmFyIGdlb207XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAnUG9pbnQnOiBnZW9tID0gcG9pbnQoY29vcmRpbmF0ZXMpLmdlb21ldHJ5OyBicmVhaztcbiAgICBjYXNlICdMaW5lU3RyaW5nJzogZ2VvbSA9IGxpbmVTdHJpbmcoY29vcmRpbmF0ZXMpLmdlb21ldHJ5OyBicmVhaztcbiAgICBjYXNlICdQb2x5Z29uJzogZ2VvbSA9IHBvbHlnb24oY29vcmRpbmF0ZXMpLmdlb21ldHJ5OyBicmVhaztcbiAgICBjYXNlICdNdWx0aVBvaW50JzogZ2VvbSA9IG11bHRpUG9pbnQoY29vcmRpbmF0ZXMpLmdlb21ldHJ5OyBicmVhaztcbiAgICBjYXNlICdNdWx0aUxpbmVTdHJpbmcnOiBnZW9tID0gbXVsdGlMaW5lU3RyaW5nKGNvb3JkaW5hdGVzKS5nZW9tZXRyeTsgYnJlYWs7XG4gICAgY2FzZSAnTXVsdGlQb2x5Z29uJzogZ2VvbSA9IG11bHRpUG9seWdvbihjb29yZGluYXRlcykuZ2VvbWV0cnk7IGJyZWFrO1xuICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcih0eXBlICsgJyBpcyBpbnZhbGlkJyk7XG4gICAgfVxuICAgIGlmIChiYm94KSBnZW9tLmJib3ggPSBiYm94O1xuICAgIHJldHVybiBnZW9tO1xufVxuXG4vKipcbiAqIFRha2VzIGNvb3JkaW5hdGVzIGFuZCBwcm9wZXJ0aWVzIChvcHRpb25hbCkgYW5kIHJldHVybnMgYSBuZXcge0BsaW5rIFBvaW50fSBmZWF0dXJlLlxuICpcbiAqIEBuYW1lIHBvaW50XG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IGNvb3JkaW5hdGVzIGxvbmdpdHVkZSwgbGF0aXR1ZGUgcG9zaXRpb24gKGVhY2ggaW4gZGVjaW1hbCBkZWdyZWVzKVxuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtpZF0gSWRlbnRpZmllclxuICogQHJldHVybnMge0ZlYXR1cmU8UG9pbnQ+fSBhIFBvaW50IGZlYXR1cmVcbiAqIEBleGFtcGxlXG4gKiB2YXIgcG9pbnQgPSB0dXJmLnBvaW50KFstNzUuMzQzLCAzOS45ODRdKTtcbiAqXG4gKiAvLz1wb2ludFxuICovXG5leHBvcnQgZnVuY3Rpb24gcG9pbnQoY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFjb29yZGluYXRlcykgdGhyb3cgbmV3IEVycm9yKCdObyBjb29yZGluYXRlcyBwYXNzZWQnKTtcbiAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcignQ29vcmRpbmF0ZXMgbXVzdCBiZSBhbiBhcnJheScpO1xuICAgIGlmIChjb29yZGluYXRlcy5sZW5ndGggPCAyKSB0aHJvdyBuZXcgRXJyb3IoJ0Nvb3JkaW5hdGVzIG11c3QgYmUgYXQgbGVhc3QgMiBudW1iZXJzIGxvbmcnKTtcbiAgICBpZiAoIWlzTnVtYmVyKGNvb3JkaW5hdGVzWzBdKSB8fCAhaXNOdW1iZXIoY29vcmRpbmF0ZXNbMV0pKSB0aHJvdyBuZXcgRXJyb3IoJ0Nvb3JkaW5hdGVzIG11c3QgY29udGFpbiBudW1iZXJzJyk7XG5cbiAgICByZXR1cm4gZmVhdHVyZSh7XG4gICAgICAgIHR5cGU6ICdQb2ludCcsXG4gICAgICAgIGNvb3JkaW5hdGVzOiBjb29yZGluYXRlc1xuICAgIH0sIHByb3BlcnRpZXMsIGJib3gsIGlkKTtcbn1cblxuLyoqXG4gKiBUYWtlcyBhbiBhcnJheSBvZiBMaW5lYXJSaW5ncyBhbmQgb3B0aW9uYWxseSBhbiB7QGxpbmsgT2JqZWN0fSB3aXRoIHByb3BlcnRpZXMgYW5kIHJldHVybnMgYSB7QGxpbmsgUG9seWdvbn0gZmVhdHVyZS5cbiAqXG4gKiBAbmFtZSBwb2x5Z29uXG4gKiBAcGFyYW0ge0FycmF5PEFycmF5PEFycmF5PG51bWJlcj4+Pn0gY29vcmRpbmF0ZXMgYW4gYXJyYXkgb2YgTGluZWFyUmluZ3NcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV0gYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlPFBvbHlnb24+fSBhIFBvbHlnb24gZmVhdHVyZVxuICogQHRocm93cyB7RXJyb3J9IHRocm93IGFuIGVycm9yIGlmIGEgTGluZWFyUmluZyBvZiB0aGUgcG9seWdvbiBoYXMgdG9vIGZldyBwb3NpdGlvbnNcbiAqIG9yIGlmIGEgTGluZWFyUmluZyBvZiB0aGUgUG9seWdvbiBkb2VzIG5vdCBoYXZlIG1hdGNoaW5nIFBvc2l0aW9ucyBhdCB0aGUgYmVnaW5uaW5nICYgZW5kLlxuICogQGV4YW1wbGVcbiAqIHZhciBwb2x5Z29uID0gdHVyZi5wb2x5Z29uKFtbXG4gKiAgIFstMi4yNzU1NDMsIDUzLjQ2NDU0N10sXG4gKiAgIFstMi4yNzU1NDMsIDUzLjQ4OTI3MV0sXG4gKiAgIFstMi4yMTUxMTgsIDUzLjQ4OTI3MV0sXG4gKiAgIFstMi4yMTUxMTgsIDUzLjQ2NDU0N10sXG4gKiAgIFstMi4yNzU1NDMsIDUzLjQ2NDU0N11cbiAqIF1dLCB7IG5hbWU6ICdwb2x5MScsIHBvcHVsYXRpb246IDQwMH0pO1xuICpcbiAqIC8vPXBvbHlnb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBvbHlnb24oY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFjb29yZGluYXRlcykgdGhyb3cgbmV3IEVycm9yKCdObyBjb29yZGluYXRlcyBwYXNzZWQnKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRpbmF0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHJpbmcgPSBjb29yZGluYXRlc1tpXTtcbiAgICAgICAgaWYgKHJpbmcubGVuZ3RoIDwgNCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFYWNoIExpbmVhclJpbmcgb2YgYSBQb2x5Z29uIG11c3QgaGF2ZSA0IG9yIG1vcmUgUG9zaXRpb25zLicpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcmluZ1tyaW5nLmxlbmd0aCAtIDFdLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiBmaXJzdCBwb2ludCBvZiBQb2x5Z29uIGNvbnRhaW5zIHR3byBudW1iZXJzXG4gICAgICAgICAgICBpZiAoaSA9PT0gMCAmJiBqID09PSAwICYmICFpc051bWJlcihyaW5nWzBdWzBdKSB8fCAhaXNOdW1iZXIocmluZ1swXVsxXSkpIHRocm93IG5ldyBFcnJvcignQ29vcmRpbmF0ZXMgbXVzdCBjb250YWluIG51bWJlcnMnKTtcbiAgICAgICAgICAgIGlmIChyaW5nW3JpbmcubGVuZ3RoIC0gMV1bal0gIT09IHJpbmdbMF1bal0pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFuZCBsYXN0IFBvc2l0aW9uIGFyZSBub3QgZXF1aXZhbGVudC4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ1BvbHlnb24nLFxuICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXNcbiAgICB9LCBwcm9wZXJ0aWVzLCBiYm94LCBpZCk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHtAbGluayBMaW5lU3RyaW5nfSBiYXNlZCBvbiBhXG4gKiBjb29yZGluYXRlIGFycmF5LiBQcm9wZXJ0aWVzIGNhbiBiZSBhZGRlZCBvcHRpb25hbGx5LlxuICpcbiAqIEBuYW1lIGxpbmVTdHJpbmdcbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk8bnVtYmVyPj59IGNvb3JkaW5hdGVzIGFuIGFycmF5IG9mIFBvc2l0aW9uc1xuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtpZF0gSWRlbnRpZmllclxuICogQHJldHVybnMge0ZlYXR1cmU8TGluZVN0cmluZz59IGEgTGluZVN0cmluZyBmZWF0dXJlXG4gKiBAdGhyb3dzIHtFcnJvcn0gaWYgbm8gY29vcmRpbmF0ZXMgYXJlIHBhc3NlZFxuICogQGV4YW1wbGVcbiAqIHZhciBsaW5lc3RyaW5nMSA9IHR1cmYubGluZVN0cmluZyhbXG4gKiAgIFstMjEuOTY0NDE2LCA2NC4xNDgyMDNdLFxuICogICBbLTIxLjk1NjE3NiwgNjQuMTQxMzE2XSxcbiAqICAgWy0yMS45MzkwMSwgNjQuMTM1OTI0XSxcbiAqICAgWy0yMS45MjczMzcsIDY0LjEzNjY3M11cbiAqIF0pO1xuICogdmFyIGxpbmVzdHJpbmcyID0gdHVyZi5saW5lU3RyaW5nKFtcbiAqICAgWy0yMS45MjkwNTQsIDY0LjEyNzk4NV0sXG4gKiAgIFstMjEuOTEyOTE4LCA2NC4xMzQ3MjZdLFxuICogICBbLTIxLjkxNjAwNywgNjQuMTQxMDE2XSxcbiAqICAgWy0yMS45MzAwODQsIDY0LjE0NDQ2XVxuICogXSwge25hbWU6ICdsaW5lIDEnLCBkaXN0YW5jZTogMTQ1fSk7XG4gKlxuICogLy89bGluZXN0cmluZzFcbiAqXG4gKiAvLz1saW5lc3RyaW5nMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbGluZVN0cmluZyhjb29yZGluYXRlcywgcHJvcGVydGllcywgYmJveCwgaWQpIHtcbiAgICBpZiAoIWNvb3JkaW5hdGVzKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGNvb3JkaW5hdGVzIHBhc3NlZCcpO1xuICAgIGlmIChjb29yZGluYXRlcy5sZW5ndGggPCAyKSB0aHJvdyBuZXcgRXJyb3IoJ0Nvb3JkaW5hdGVzIG11c3QgYmUgYW4gYXJyYXkgb2YgdHdvIG9yIG1vcmUgcG9zaXRpb25zJyk7XG4gICAgLy8gQ2hlY2sgaWYgZmlyc3QgcG9pbnQgb2YgTGluZVN0cmluZyBjb250YWlucyB0d28gbnVtYmVyc1xuICAgIGlmICghaXNOdW1iZXIoY29vcmRpbmF0ZXNbMF1bMV0pIHx8ICFpc051bWJlcihjb29yZGluYXRlc1swXVsxXSkpIHRocm93IG5ldyBFcnJvcignQ29vcmRpbmF0ZXMgbXVzdCBjb250YWluIG51bWJlcnMnKTtcblxuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ0xpbmVTdHJpbmcnLFxuICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXNcbiAgICB9LCBwcm9wZXJ0aWVzLCBiYm94LCBpZCk7XG59XG5cbi8qKlxuICogVGFrZXMgb25lIG9yIG1vcmUge0BsaW5rIEZlYXR1cmV8RmVhdHVyZXN9IGFuZCBjcmVhdGVzIGEge0BsaW5rIEZlYXR1cmVDb2xsZWN0aW9ufS5cbiAqXG4gKiBAbmFtZSBmZWF0dXJlQ29sbGVjdGlvblxuICogQHBhcmFtIHtGZWF0dXJlW119IGZlYXR1cmVzIGlucHV0IGZlYXR1cmVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtpZF0gSWRlbnRpZmllclxuICogQHJldHVybnMge0ZlYXR1cmVDb2xsZWN0aW9ufSBhIEZlYXR1cmVDb2xsZWN0aW9uIG9mIGlucHV0IGZlYXR1cmVzXG4gKiBAZXhhbXBsZVxuICogdmFyIGZlYXR1cmVzID0gW1xuICogIHR1cmYucG9pbnQoWy03NS4zNDMsIDM5Ljk4NF0sIHtuYW1lOiAnTG9jYXRpb24gQSd9KSxcbiAqICB0dXJmLnBvaW50KFstNzUuODMzLCAzOS4yODRdLCB7bmFtZTogJ0xvY2F0aW9uIEInfSksXG4gKiAgdHVyZi5wb2ludChbLTc1LjUzNCwgMzkuMTIzXSwge25hbWU6ICdMb2NhdGlvbiBDJ30pXG4gKiBdO1xuICpcbiAqIHZhciBjb2xsZWN0aW9uID0gdHVyZi5mZWF0dXJlQ29sbGVjdGlvbihmZWF0dXJlcyk7XG4gKlxuICogLy89Y29sbGVjdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZmVhdHVyZUNvbGxlY3Rpb24oZmVhdHVyZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFmZWF0dXJlcykgdGhyb3cgbmV3IEVycm9yKCdObyBmZWF0dXJlcyBwYXNzZWQnKTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZmVhdHVyZXMpKSB0aHJvdyBuZXcgRXJyb3IoJ2ZlYXR1cmVzIG11c3QgYmUgYW4gQXJyYXknKTtcbiAgICBpZiAoYmJveCAmJiBiYm94Lmxlbmd0aCAhPT0gNCkgdGhyb3cgbmV3IEVycm9yKCdiYm94IG11c3QgYmUgYW4gQXJyYXkgb2YgNCBudW1iZXJzJyk7XG4gICAgaWYgKGlkICYmIFsnc3RyaW5nJywgJ251bWJlciddLmluZGV4T2YodHlwZW9mIGlkKSA9PT0gLTEpIHRocm93IG5ldyBFcnJvcignaWQgbXVzdCBiZSBhIG51bWJlciBvciBhIHN0cmluZycpO1xuXG4gICAgdmFyIGZjID0ge3R5cGU6ICdGZWF0dXJlQ29sbGVjdGlvbid9O1xuICAgIGlmIChpZCkgZmMuaWQgPSBpZDtcbiAgICBpZiAoYmJveCkgZmMuYmJveCA9IGJib3g7XG4gICAgZmMuZmVhdHVyZXMgPSBmZWF0dXJlcztcbiAgICByZXR1cm4gZmM7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHtAbGluayBGZWF0dXJlPE11bHRpTGluZVN0cmluZz59IGJhc2VkIG9uIGFcbiAqIGNvb3JkaW5hdGUgYXJyYXkuIFByb3BlcnRpZXMgY2FuIGJlIGFkZGVkIG9wdGlvbmFsbHkuXG4gKlxuICogQG5hbWUgbXVsdGlMaW5lU3RyaW5nXG4gKiBAcGFyYW0ge0FycmF5PEFycmF5PEFycmF5PG51bWJlcj4+Pn0gY29vcmRpbmF0ZXMgYW4gYXJyYXkgb2YgTGluZVN0cmluZ3NcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV0gYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlPE11bHRpTGluZVN0cmluZz59IGEgTXVsdGlMaW5lU3RyaW5nIGZlYXR1cmVcbiAqIEB0aHJvd3Mge0Vycm9yfSBpZiBubyBjb29yZGluYXRlcyBhcmUgcGFzc2VkXG4gKiBAZXhhbXBsZVxuICogdmFyIG11bHRpTGluZSA9IHR1cmYubXVsdGlMaW5lU3RyaW5nKFtbWzAsMF0sWzEwLDEwXV1dKTtcbiAqXG4gKiAvLz1tdWx0aUxpbmVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpTGluZVN0cmluZyhjb29yZGluYXRlcywgcHJvcGVydGllcywgYmJveCwgaWQpIHtcbiAgICBpZiAoIWNvb3JkaW5hdGVzKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGNvb3JkaW5hdGVzIHBhc3NlZCcpO1xuXG4gICAgcmV0dXJuIGZlYXR1cmUoe1xuICAgICAgICB0eXBlOiAnTXVsdGlMaW5lU3RyaW5nJyxcbiAgICAgICAgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzXG4gICAgfSwgcHJvcGVydGllcywgYmJveCwgaWQpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgRmVhdHVyZTxNdWx0aVBvaW50Pn0gYmFzZWQgb24gYVxuICogY29vcmRpbmF0ZSBhcnJheS4gUHJvcGVydGllcyBjYW4gYmUgYWRkZWQgb3B0aW9uYWxseS5cbiAqXG4gKiBAbmFtZSBtdWx0aVBvaW50XG4gKiBAcGFyYW0ge0FycmF5PEFycmF5PG51bWJlcj4+fSBjb29yZGluYXRlcyBhbiBhcnJheSBvZiBQb3NpdGlvbnNcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV0gYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlPE11bHRpUG9pbnQ+fSBhIE11bHRpUG9pbnQgZmVhdHVyZVxuICogQHRocm93cyB7RXJyb3J9IGlmIG5vIGNvb3JkaW5hdGVzIGFyZSBwYXNzZWRcbiAqIEBleGFtcGxlXG4gKiB2YXIgbXVsdGlQdCA9IHR1cmYubXVsdGlQb2ludChbWzAsMF0sWzEwLDEwXV0pO1xuICpcbiAqIC8vPW11bHRpUHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpUG9pbnQoY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFjb29yZGluYXRlcykgdGhyb3cgbmV3IEVycm9yKCdObyBjb29yZGluYXRlcyBwYXNzZWQnKTtcblxuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ011bHRpUG9pbnQnLFxuICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXNcbiAgICB9LCBwcm9wZXJ0aWVzLCBiYm94LCBpZCk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHtAbGluayBGZWF0dXJlPE11bHRpUG9seWdvbj59IGJhc2VkIG9uIGFcbiAqIGNvb3JkaW5hdGUgYXJyYXkuIFByb3BlcnRpZXMgY2FuIGJlIGFkZGVkIG9wdGlvbmFsbHkuXG4gKlxuICogQG5hbWUgbXVsdGlQb2x5Z29uXG4gKiBAcGFyYW0ge0FycmF5PEFycmF5PEFycmF5PEFycmF5PG51bWJlcj4+Pj59IGNvb3JkaW5hdGVzIGFuIGFycmF5IG9mIFBvbHlnb25zXG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2lkXSBJZGVudGlmaWVyXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxNdWx0aVBvbHlnb24+fSBhIG11bHRpcG9seWdvbiBmZWF0dXJlXG4gKiBAdGhyb3dzIHtFcnJvcn0gaWYgbm8gY29vcmRpbmF0ZXMgYXJlIHBhc3NlZFxuICogQGV4YW1wbGVcbiAqIHZhciBtdWx0aVBvbHkgPSB0dXJmLm11bHRpUG9seWdvbihbW1tbMCwwXSxbMCwxMF0sWzEwLDEwXSxbMTAsMF0sWzAsMF1dXV0pO1xuICpcbiAqIC8vPW11bHRpUG9seVxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpUG9seWdvbihjb29yZGluYXRlcywgcHJvcGVydGllcywgYmJveCwgaWQpIHtcbiAgICBpZiAoIWNvb3JkaW5hdGVzKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGNvb3JkaW5hdGVzIHBhc3NlZCcpO1xuXG4gICAgcmV0dXJuIGZlYXR1cmUoe1xuICAgICAgICB0eXBlOiAnTXVsdGlQb2x5Z29uJyxcbiAgICAgICAgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzXG4gICAgfSwgcHJvcGVydGllcywgYmJveCwgaWQpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgRmVhdHVyZTxHZW9tZXRyeUNvbGxlY3Rpb24+fSBiYXNlZCBvbiBhXG4gKiBjb29yZGluYXRlIGFycmF5LiBQcm9wZXJ0aWVzIGNhbiBiZSBhZGRlZCBvcHRpb25hbGx5LlxuICpcbiAqIEBuYW1lIGdlb21ldHJ5Q29sbGVjdGlvblxuICogQHBhcmFtIHtBcnJheTxHZW9tZXRyeT59IGdlb21ldHJpZXMgYW4gYXJyYXkgb2YgR2VvSlNPTiBHZW9tZXRyaWVzXG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2lkXSBJZGVudGlmaWVyXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxHZW9tZXRyeUNvbGxlY3Rpb24+fSBhIEdlb0pTT04gR2VvbWV0cnlDb2xsZWN0aW9uIEZlYXR1cmVcbiAqIEBleGFtcGxlXG4gKiB2YXIgcHQgPSB7XG4gKiAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAqICAgICAgIFwiY29vcmRpbmF0ZXNcIjogWzEwMCwgMF1cbiAqICAgICB9O1xuICogdmFyIGxpbmUgPSB7XG4gKiAgICAgXCJ0eXBlXCI6IFwiTGluZVN0cmluZ1wiLFxuICogICAgIFwiY29vcmRpbmF0ZXNcIjogWyBbMTAxLCAwXSwgWzEwMiwgMV0gXVxuICogICB9O1xuICogdmFyIGNvbGxlY3Rpb24gPSB0dXJmLmdlb21ldHJ5Q29sbGVjdGlvbihbcHQsIGxpbmVdKTtcbiAqXG4gKiAvLz1jb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW9tZXRyeUNvbGxlY3Rpb24oZ2VvbWV0cmllcywgcHJvcGVydGllcywgYmJveCwgaWQpIHtcbiAgICBpZiAoIWdlb21ldHJpZXMpIHRocm93IG5ldyBFcnJvcignZ2VvbWV0cmllcyBpcyByZXF1aXJlZCcpO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShnZW9tZXRyaWVzKSkgdGhyb3cgbmV3IEVycm9yKCdnZW9tZXRyaWVzIG11c3QgYmUgYW4gQXJyYXknKTtcblxuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ0dlb21ldHJ5Q29sbGVjdGlvbicsXG4gICAgICAgIGdlb21ldHJpZXM6IGdlb21ldHJpZXNcbiAgICB9LCBwcm9wZXJ0aWVzLCBiYm94LCBpZCk7XG59XG5cbi8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0dyZWF0LWNpcmNsZV9kaXN0YW5jZSNSYWRpdXNfZm9yX3NwaGVyaWNhbF9FYXJ0aFxudmFyIGZhY3RvcnMgPSB7XG4gICAgbWlsZXM6IDM5NjAsXG4gICAgbmF1dGljYWxtaWxlczogMzQ0MS4xNDUsXG4gICAgZGVncmVlczogNTcuMjk1Nzc5NSxcbiAgICByYWRpYW5zOiAxLFxuICAgIGluY2hlczogMjUwOTA1NjAwLFxuICAgIHlhcmRzOiA2OTY5NjAwLFxuICAgIG1ldGVyczogNjM3MzAwMCxcbiAgICBtZXRyZXM6IDYzNzMwMDAsXG4gICAgY2VudGltZXRlcnM6IDYuMzczZSs4LFxuICAgIGNlbnRpbWV0cmVzOiA2LjM3M2UrOCxcbiAgICBraWxvbWV0ZXJzOiA2MzczLFxuICAgIGtpbG9tZXRyZXM6IDYzNzMsXG4gICAgZmVldDogMjA5MDg3OTIuNjVcbn07XG5cbnZhciBhcmVhRmFjdG9ycyA9IHtcbiAgICBraWxvbWV0ZXJzOiAwLjAwMDAwMSxcbiAgICBraWxvbWV0cmVzOiAwLjAwMDAwMSxcbiAgICBtZXRlcnM6IDEsXG4gICAgbWV0cmVzOiAxLFxuICAgIGNlbnRpbWV0cmVzOiAxMDAwMCxcbiAgICBtaWxsaW1ldGVyOiAxMDAwMDAwLFxuICAgIGFjcmVzOiAwLjAwMDI0NzEwNSxcbiAgICBtaWxlczogMy44NmUtNyxcbiAgICB5YXJkczogMS4xOTU5OTAwNDYsXG4gICAgZmVldDogMTAuNzYzOTEwNDE3LFxuICAgIGluY2hlczogMTU1MC4wMDMxMDAwMDZcbn07XG5cbi8qKlxuICogUm91bmQgbnVtYmVyIHRvIHByZWNpc2lvblxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBudW0gTnVtYmVyXG4gKiBAcGFyYW0ge251bWJlcn0gW3ByZWNpc2lvbj0wXSBQcmVjaXNpb25cbiAqIEByZXR1cm5zIHtudW1iZXJ9IHJvdW5kZWQgbnVtYmVyXG4gKiBAZXhhbXBsZVxuICogdHVyZi5yb3VuZCgxMjAuNDMyMSlcbiAqIC8vPTEyMFxuICpcbiAqIHR1cmYucm91bmQoMTIwLjQzMjEsIDIpXG4gKiAvLz0xMjAuNDNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdW5kKG51bSwgcHJlY2lzaW9uKSB7XG4gICAgaWYgKG51bSA9PT0gdW5kZWZpbmVkIHx8IG51bSA9PT0gbnVsbCB8fCBpc05hTihudW0pKSB0aHJvdyBuZXcgRXJyb3IoJ251bSBpcyByZXF1aXJlZCcpO1xuICAgIGlmIChwcmVjaXNpb24gJiYgIShwcmVjaXNpb24gPj0gMCkpIHRocm93IG5ldyBFcnJvcigncHJlY2lzaW9uIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgICB2YXIgbXVsdGlwbGllciA9IE1hdGgucG93KDEwLCBwcmVjaXNpb24gfHwgMCk7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobnVtICogbXVsdGlwbGllcikgLyBtdWx0aXBsaWVyO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBkaXN0YW5jZSBtZWFzdXJlbWVudCAoYXNzdW1pbmcgYSBzcGhlcmljYWwgRWFydGgpIGZyb20gcmFkaWFucyB0byBhIG1vcmUgZnJpZW5kbHkgdW5pdC5cbiAqIFZhbGlkIHVuaXRzOiBtaWxlcywgbmF1dGljYWxtaWxlcywgaW5jaGVzLCB5YXJkcywgbWV0ZXJzLCBtZXRyZXMsIGtpbG9tZXRlcnMsIGNlbnRpbWV0ZXJzLCBmZWV0XG4gKlxuICogQG5hbWUgcmFkaWFuc1RvRGlzdGFuY2VcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWRpYW5zIGluIHJhZGlhbnMgYWNyb3NzIHRoZSBzcGhlcmVcbiAqIEBwYXJhbSB7c3RyaW5nfSBbdW5pdHM9XCJraWxvbWV0ZXJzXCJdIGNhbiBiZSBkZWdyZWVzLCByYWRpYW5zLCBtaWxlcywgb3Iga2lsb21ldGVycyBpbmNoZXMsIHlhcmRzLCBtZXRyZXMsIG1ldGVycywga2lsb21ldHJlcywga2lsb21ldGVycy5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IGRpc3RhbmNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByYWRpYW5zVG9EaXN0YW5jZShyYWRpYW5zLCB1bml0cykge1xuICAgIGlmIChyYWRpYW5zID09PSB1bmRlZmluZWQgfHwgcmFkaWFucyA9PT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKCdyYWRpYW5zIGlzIHJlcXVpcmVkJyk7XG5cbiAgICBpZiAodW5pdHMgJiYgdHlwZW9mIHVuaXRzICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCd1bml0cyBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgdmFyIGZhY3RvciA9IGZhY3RvcnNbdW5pdHMgfHwgJ2tpbG9tZXRlcnMnXTtcbiAgICBpZiAoIWZhY3RvcikgdGhyb3cgbmV3IEVycm9yKHVuaXRzICsgJyB1bml0cyBpcyBpbnZhbGlkJyk7XG4gICAgcmV0dXJuIHJhZGlhbnMgKiBmYWN0b3I7XG59XG5cbi8qKlxuICogQ29udmVydCBhIGRpc3RhbmNlIG1lYXN1cmVtZW50IChhc3N1bWluZyBhIHNwaGVyaWNhbCBFYXJ0aCkgZnJvbSBhIHJlYWwtd29ybGQgdW5pdCBpbnRvIHJhZGlhbnNcbiAqIFZhbGlkIHVuaXRzOiBtaWxlcywgbmF1dGljYWxtaWxlcywgaW5jaGVzLCB5YXJkcywgbWV0ZXJzLCBtZXRyZXMsIGtpbG9tZXRlcnMsIGNlbnRpbWV0ZXJzLCBmZWV0XG4gKlxuICogQG5hbWUgZGlzdGFuY2VUb1JhZGlhbnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBkaXN0YW5jZSBpbiByZWFsIHVuaXRzXG4gKiBAcGFyYW0ge3N0cmluZ30gW3VuaXRzPWtpbG9tZXRlcnNdIGNhbiBiZSBkZWdyZWVzLCByYWRpYW5zLCBtaWxlcywgb3Iga2lsb21ldGVycyBpbmNoZXMsIHlhcmRzLCBtZXRyZXMsIG1ldGVycywga2lsb21ldHJlcywga2lsb21ldGVycy5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IHJhZGlhbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3RhbmNlVG9SYWRpYW5zKGRpc3RhbmNlLCB1bml0cykge1xuICAgIGlmIChkaXN0YW5jZSA9PT0gdW5kZWZpbmVkIHx8IGRpc3RhbmNlID09PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoJ2Rpc3RhbmNlIGlzIHJlcXVpcmVkJyk7XG5cbiAgICBpZiAodW5pdHMgJiYgdHlwZW9mIHVuaXRzICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCd1bml0cyBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgdmFyIGZhY3RvciA9IGZhY3RvcnNbdW5pdHMgfHwgJ2tpbG9tZXRlcnMnXTtcbiAgICBpZiAoIWZhY3RvcikgdGhyb3cgbmV3IEVycm9yKHVuaXRzICsgJyB1bml0cyBpcyBpbnZhbGlkJyk7XG4gICAgcmV0dXJuIGRpc3RhbmNlIC8gZmFjdG9yO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBkaXN0YW5jZSBtZWFzdXJlbWVudCAoYXNzdW1pbmcgYSBzcGhlcmljYWwgRWFydGgpIGZyb20gYSByZWFsLXdvcmxkIHVuaXQgaW50byBkZWdyZWVzXG4gKiBWYWxpZCB1bml0czogbWlsZXMsIG5hdXRpY2FsbWlsZXMsIGluY2hlcywgeWFyZHMsIG1ldGVycywgbWV0cmVzLCBjZW50aW1ldGVycywga2lsb21ldHJlcywgZmVldFxuICpcbiAqIEBuYW1lIGRpc3RhbmNlVG9EZWdyZWVzXG4gKiBAcGFyYW0ge251bWJlcn0gZGlzdGFuY2UgaW4gcmVhbCB1bml0c1xuICogQHBhcmFtIHtzdHJpbmd9IFt1bml0cz1raWxvbWV0ZXJzXSBjYW4gYmUgZGVncmVlcywgcmFkaWFucywgbWlsZXMsIG9yIGtpbG9tZXRlcnMgaW5jaGVzLCB5YXJkcywgbWV0cmVzLCBtZXRlcnMsIGtpbG9tZXRyZXMsIGtpbG9tZXRlcnMuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBkZWdyZWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZVRvRGVncmVlcyhkaXN0YW5jZSwgdW5pdHMpIHtcbiAgICByZXR1cm4gcmFkaWFuczJkZWdyZWVzKGRpc3RhbmNlVG9SYWRpYW5zKGRpc3RhbmNlLCB1bml0cykpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGFueSBiZWFyaW5nIGFuZ2xlIGZyb20gdGhlIG5vcnRoIGxpbmUgZGlyZWN0aW9uIChwb3NpdGl2ZSBjbG9ja3dpc2UpXG4gKiBhbmQgcmV0dXJucyBhbiBhbmdsZSBiZXR3ZWVuIDAtMzYwIGRlZ3JlZXMgKHBvc2l0aXZlIGNsb2Nrd2lzZSksIDAgYmVpbmcgdGhlIG5vcnRoIGxpbmVcbiAqXG4gKiBAbmFtZSBiZWFyaW5nVG9BbmdsZVxuICogQHBhcmFtIHtudW1iZXJ9IGJlYXJpbmcgYW5nbGUsIGJldHdlZW4gLTE4MCBhbmQgKzE4MCBkZWdyZWVzXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBhbmdsZSBiZXR3ZWVuIDAgYW5kIDM2MCBkZWdyZWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZWFyaW5nVG9BbmdsZShiZWFyaW5nKSB7XG4gICAgaWYgKGJlYXJpbmcgPT09IG51bGwgfHwgYmVhcmluZyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoJ2JlYXJpbmcgaXMgcmVxdWlyZWQnKTtcblxuICAgIHZhciBhbmdsZSA9IGJlYXJpbmcgJSAzNjA7XG4gICAgaWYgKGFuZ2xlIDwgMCkgYW5nbGUgKz0gMzYwO1xuICAgIHJldHVybiBhbmdsZTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhbiBhbmdsZSBpbiByYWRpYW5zIHRvIGRlZ3JlZXNcbiAqXG4gKiBAbmFtZSByYWRpYW5zMmRlZ3JlZXNcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWRpYW5zIGFuZ2xlIGluIHJhZGlhbnNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGRlZ3JlZXMgYmV0d2VlbiAwIGFuZCAzNjAgZGVncmVlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmFkaWFuczJkZWdyZWVzKHJhZGlhbnMpIHtcbiAgICBpZiAocmFkaWFucyA9PT0gbnVsbCB8fCByYWRpYW5zID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcigncmFkaWFucyBpcyByZXF1aXJlZCcpO1xuXG4gICAgdmFyIGRlZ3JlZXMgPSByYWRpYW5zICUgKDIgKiBNYXRoLlBJKTtcbiAgICByZXR1cm4gZGVncmVlcyAqIDE4MCAvIE1hdGguUEk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYW4gYW5nbGUgaW4gZGVncmVlcyB0byByYWRpYW5zXG4gKlxuICogQG5hbWUgZGVncmVlczJyYWRpYW5zXG4gKiBAcGFyYW0ge251bWJlcn0gZGVncmVlcyBhbmdsZSBiZXR3ZWVuIDAgYW5kIDM2MCBkZWdyZWVzXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBhbmdsZSBpbiByYWRpYW5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWdyZWVzMnJhZGlhbnMoZGVncmVlcykge1xuICAgIGlmIChkZWdyZWVzID09PSBudWxsIHx8IGRlZ3JlZXMgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKCdkZWdyZWVzIGlzIHJlcXVpcmVkJyk7XG5cbiAgICB2YXIgcmFkaWFucyA9IGRlZ3JlZXMgJSAzNjA7XG4gICAgcmV0dXJuIHJhZGlhbnMgKiBNYXRoLlBJIC8gMTgwO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgZGlzdGFuY2UgdG8gdGhlIHJlcXVlc3RlZCB1bml0LlxuICogVmFsaWQgdW5pdHM6IG1pbGVzLCBuYXV0aWNhbG1pbGVzLCBpbmNoZXMsIHlhcmRzLCBtZXRlcnMsIG1ldHJlcywga2lsb21ldGVycywgY2VudGltZXRlcnMsIGZlZXRcbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gZGlzdGFuY2UgdG8gYmUgY29udmVydGVkXG4gKiBAcGFyYW0ge3N0cmluZ30gb3JpZ2luYWxVbml0IG9mIHRoZSBkaXN0YW5jZVxuICogQHBhcmFtIHtzdHJpbmd9IFtmaW5hbFVuaXQ9a2lsb21ldGVyc10gcmV0dXJuZWQgdW5pdFxuICogQHJldHVybnMge251bWJlcn0gdGhlIGNvbnZlcnRlZCBkaXN0YW5jZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udmVydERpc3RhbmNlKGRpc3RhbmNlLCBvcmlnaW5hbFVuaXQsIGZpbmFsVW5pdCkge1xuICAgIGlmIChkaXN0YW5jZSA9PT0gbnVsbCB8fCBkaXN0YW5jZSA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoJ2Rpc3RhbmNlIGlzIHJlcXVpcmVkJyk7XG4gICAgaWYgKCEoZGlzdGFuY2UgPj0gMCkpIHRocm93IG5ldyBFcnJvcignZGlzdGFuY2UgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuXG4gICAgdmFyIGNvbnZlcnRlZERpc3RhbmNlID0gcmFkaWFuc1RvRGlzdGFuY2UoZGlzdGFuY2VUb1JhZGlhbnMoZGlzdGFuY2UsIG9yaWdpbmFsVW5pdCksIGZpbmFsVW5pdCB8fCAna2lsb21ldGVycycpO1xuICAgIHJldHVybiBjb252ZXJ0ZWREaXN0YW5jZTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIGFyZWEgdG8gdGhlIHJlcXVlc3RlZCB1bml0LlxuICogVmFsaWQgdW5pdHM6IGtpbG9tZXRlcnMsIGtpbG9tZXRyZXMsIG1ldGVycywgbWV0cmVzLCBjZW50aW1ldHJlcywgbWlsbGltZXRlciwgYWNyZSwgbWlsZSwgeWFyZCwgZm9vdCwgaW5jaFxuICogQHBhcmFtIHtudW1iZXJ9IGFyZWEgdG8gYmUgY29udmVydGVkXG4gKiBAcGFyYW0ge3N0cmluZ30gW29yaWdpbmFsVW5pdD1tZXRlcnNdIG9mIHRoZSBkaXN0YW5jZVxuICogQHBhcmFtIHtzdHJpbmd9IFtmaW5hbFVuaXQ9a2lsb21ldGVyc10gcmV0dXJuZWQgdW5pdFxuICogQHJldHVybnMge251bWJlcn0gdGhlIGNvbnZlcnRlZCBkaXN0YW5jZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udmVydEFyZWEoYXJlYSwgb3JpZ2luYWxVbml0LCBmaW5hbFVuaXQpIHtcbiAgICBpZiAoYXJlYSA9PT0gbnVsbCB8fCBhcmVhID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcignYXJlYSBpcyByZXF1aXJlZCcpO1xuICAgIGlmICghKGFyZWEgPj0gMCkpIHRocm93IG5ldyBFcnJvcignYXJlYSBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG5cbiAgICB2YXIgc3RhcnRGYWN0b3IgPSBhcmVhRmFjdG9yc1tvcmlnaW5hbFVuaXQgfHwgJ21ldGVycyddO1xuICAgIGlmICghc3RhcnRGYWN0b3IpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBvcmlnaW5hbCB1bml0cycpO1xuXG4gICAgdmFyIGZpbmFsRmFjdG9yID0gYXJlYUZhY3RvcnNbZmluYWxVbml0IHx8ICdraWxvbWV0ZXJzJ107XG4gICAgaWYgKCFmaW5hbEZhY3RvcikgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZpbmFsIHVuaXRzJyk7XG5cbiAgICByZXR1cm4gKGFyZWEgLyBzdGFydEZhY3RvcikgKiBmaW5hbEZhY3Rvcjtcbn1cblxuLyoqXG4gKiBpc051bWJlclxuICpcbiAqIEBwYXJhbSB7Kn0gbnVtIE51bWJlciB0byB2YWxpZGF0ZVxuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUvZmFsc2VcbiAqIEBleGFtcGxlXG4gKiB0dXJmLmlzTnVtYmVyKDEyMylcbiAqIC8vPXRydWVcbiAqIHR1cmYuaXNOdW1iZXIoJ2ZvbycpXG4gKiAvLz1mYWxzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNOdW1iZXIobnVtKSB7XG4gICAgcmV0dXJuICFpc05hTihudW0pICYmIG51bSAhPT0gbnVsbCAmJiAhQXJyYXkuaXNBcnJheShudW0pO1xufVxuXG4vKipcbiAqIGlzT2JqZWN0XG4gKlxuICogQHBhcmFtIHsqfSBpbnB1dCB2YXJpYWJsZSB0byB2YWxpZGF0ZVxuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUvZmFsc2VcbiAqIEBleGFtcGxlXG4gKiB0dXJmLmlzT2JqZWN0KHtlbGV2YXRpb246IDEwfSlcbiAqIC8vPXRydWVcbiAqIHR1cmYuaXNPYmplY3QoJ2ZvbycpXG4gKiAvLz1mYWxzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNPYmplY3QoaW5wdXQpIHtcbiAgICByZXR1cm4gKCEhaW5wdXQpICYmIChpbnB1dC5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KTtcbn1cblxuLyoqXG4gKiBFYXJ0aCBSYWRpdXMgdXNlZCB3aXRoIHRoZSBIYXJ2ZXNpbmUgZm9ybXVsYSBhbmQgYXBwcm94aW1hdGVzIHVzaW5nIGEgc3BoZXJpY2FsIChub24tZWxsaXBzb2lkKSBFYXJ0aC5cbiAqL1xuZXhwb3J0IHZhciBlYXJ0aFJhZGl1cyA9IDYzNzEwMDguODtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0B0dXJmL2Rlc3RpbmF0aW9uL25vZGVfbW9kdWxlcy9AdHVyZi9oZWxwZXJzL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIFdyYXBzIGEgR2VvSlNPTiB7QGxpbmsgR2VvbWV0cnl9IGluIGEgR2VvSlNPTiB7QGxpbmsgRmVhdHVyZX0uXG4gKlxuICogQG5hbWUgZmVhdHVyZVxuICogQHBhcmFtIHtHZW9tZXRyeX0gZ2VvbWV0cnkgaW5wdXQgZ2VvbWV0cnlcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV0gYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlfSBhIEdlb0pTT04gRmVhdHVyZVxuICogQGV4YW1wbGVcbiAqIHZhciBnZW9tZXRyeSA9IHtcbiAqICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAqICAgXCJjb29yZGluYXRlc1wiOiBbMTEwLCA1MF1cbiAqIH07XG4gKlxuICogdmFyIGZlYXR1cmUgPSB0dXJmLmZlYXR1cmUoZ2VvbWV0cnkpO1xuICpcbiAqIC8vPWZlYXR1cmVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZlYXR1cmUoZ2VvbWV0cnksIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKGdlb21ldHJ5ID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcignZ2VvbWV0cnkgaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAocHJvcGVydGllcyAmJiBwcm9wZXJ0aWVzLmNvbnN0cnVjdG9yICE9PSBPYmplY3QpIHRocm93IG5ldyBFcnJvcigncHJvcGVydGllcyBtdXN0IGJlIGFuIE9iamVjdCcpO1xuICAgIGlmIChiYm94ICYmIGJib3gubGVuZ3RoICE9PSA0KSB0aHJvdyBuZXcgRXJyb3IoJ2Jib3ggbXVzdCBiZSBhbiBBcnJheSBvZiA0IG51bWJlcnMnKTtcbiAgICBpZiAoaWQgJiYgWydzdHJpbmcnLCAnbnVtYmVyJ10uaW5kZXhPZih0eXBlb2YgaWQpID09PSAtMSkgdGhyb3cgbmV3IEVycm9yKCdpZCBtdXN0IGJlIGEgbnVtYmVyIG9yIGEgc3RyaW5nJyk7XG5cbiAgICB2YXIgZmVhdCA9IHt0eXBlOiAnRmVhdHVyZSd9O1xuICAgIGlmIChpZCkgZmVhdC5pZCA9IGlkO1xuICAgIGlmIChiYm94KSBmZWF0LmJib3ggPSBiYm94O1xuICAgIGZlYXQucHJvcGVydGllcyA9IHByb3BlcnRpZXMgfHwge307XG4gICAgZmVhdC5nZW9tZXRyeSA9IGdlb21ldHJ5O1xuICAgIHJldHVybiBmZWF0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBHZW9KU09OIHtAbGluayBHZW9tZXRyeX0gZnJvbSBhIEdlb21ldHJ5IHN0cmluZyB0eXBlICYgY29vcmRpbmF0ZXMuXG4gKiBGb3IgR2VvbWV0cnlDb2xsZWN0aW9uIHR5cGUgdXNlIGBoZWxwZXJzLmdlb21ldHJ5Q29sbGVjdGlvbmBcbiAqXG4gKiBAbmFtZSBnZW9tZXRyeVxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgR2VvbWV0cnkgVHlwZVxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBjb29yZGluYXRlcyBDb29yZGluYXRlc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHJldHVybnMge0dlb21ldHJ5fSBhIEdlb0pTT04gR2VvbWV0cnlcbiAqIEBleGFtcGxlXG4gKiB2YXIgdHlwZSA9ICdQb2ludCc7XG4gKiB2YXIgY29vcmRpbmF0ZXMgPSBbMTEwLCA1MF07XG4gKlxuICogdmFyIGdlb21ldHJ5ID0gdHVyZi5nZW9tZXRyeSh0eXBlLCBjb29yZGluYXRlcyk7XG4gKlxuICogLy89Z2VvbWV0cnlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlb21ldHJ5KHR5cGUsIGNvb3JkaW5hdGVzLCBiYm94KSB7XG4gICAgLy8gVmFsaWRhdGlvblxuICAgIGlmICghdHlwZSkgdGhyb3cgbmV3IEVycm9yKCd0eXBlIGlzIHJlcXVpcmVkJyk7XG4gICAgaWYgKCFjb29yZGluYXRlcykgdGhyb3cgbmV3IEVycm9yKCdjb29yZGluYXRlcyBpcyByZXF1aXJlZCcpO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShjb29yZGluYXRlcykpIHRocm93IG5ldyBFcnJvcignY29vcmRpbmF0ZXMgbXVzdCBiZSBhbiBBcnJheScpO1xuICAgIGlmIChiYm94ICYmIGJib3gubGVuZ3RoICE9PSA0KSB0aHJvdyBuZXcgRXJyb3IoJ2Jib3ggbXVzdCBiZSBhbiBBcnJheSBvZiA0IG51bWJlcnMnKTtcblxuICAgIHZhciBnZW9tO1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ1BvaW50JzogZ2VvbSA9IHBvaW50KGNvb3JkaW5hdGVzKS5nZW9tZXRyeTsgYnJlYWs7XG4gICAgY2FzZSAnTGluZVN0cmluZyc6IGdlb20gPSBsaW5lU3RyaW5nKGNvb3JkaW5hdGVzKS5nZW9tZXRyeTsgYnJlYWs7XG4gICAgY2FzZSAnUG9seWdvbic6IGdlb20gPSBwb2x5Z29uKGNvb3JkaW5hdGVzKS5nZW9tZXRyeTsgYnJlYWs7XG4gICAgY2FzZSAnTXVsdGlQb2ludCc6IGdlb20gPSBtdWx0aVBvaW50KGNvb3JkaW5hdGVzKS5nZW9tZXRyeTsgYnJlYWs7XG4gICAgY2FzZSAnTXVsdGlMaW5lU3RyaW5nJzogZ2VvbSA9IG11bHRpTGluZVN0cmluZyhjb29yZGluYXRlcykuZ2VvbWV0cnk7IGJyZWFrO1xuICAgIGNhc2UgJ011bHRpUG9seWdvbic6IGdlb20gPSBtdWx0aVBvbHlnb24oY29vcmRpbmF0ZXMpLmdlb21ldHJ5OyBicmVhaztcbiAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IodHlwZSArICcgaXMgaW52YWxpZCcpO1xuICAgIH1cbiAgICBpZiAoYmJveCkgZ2VvbS5iYm94ID0gYmJveDtcbiAgICByZXR1cm4gZ2VvbTtcbn1cblxuLyoqXG4gKiBUYWtlcyBjb29yZGluYXRlcyBhbmQgcHJvcGVydGllcyAob3B0aW9uYWwpIGFuZCByZXR1cm5zIGEgbmV3IHtAbGluayBQb2ludH0gZmVhdHVyZS5cbiAqXG4gKiBAbmFtZSBwb2ludFxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBjb29yZGluYXRlcyBsb25naXR1ZGUsIGxhdGl0dWRlIHBvc2l0aW9uIChlYWNoIGluIGRlY2ltYWwgZGVncmVlcylcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV0gYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlPFBvaW50Pn0gYSBQb2ludCBmZWF0dXJlXG4gKiBAZXhhbXBsZVxuICogdmFyIHBvaW50ID0gdHVyZi5wb2ludChbLTc1LjM0MywgMzkuOTg0XSk7XG4gKlxuICogLy89cG9pbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBvaW50KGNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzLCBiYm94LCBpZCkge1xuICAgIGlmICghY29vcmRpbmF0ZXMpIHRocm93IG5ldyBFcnJvcignTm8gY29vcmRpbmF0ZXMgcGFzc2VkJyk7XG4gICAgaWYgKGNvb3JkaW5hdGVzLmxlbmd0aCA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoJ0Nvb3JkaW5hdGVzIG11c3QgYmUgYW4gYXJyYXknKTtcbiAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoIDwgMikgdGhyb3cgbmV3IEVycm9yKCdDb29yZGluYXRlcyBtdXN0IGJlIGF0IGxlYXN0IDIgbnVtYmVycyBsb25nJyk7XG4gICAgaWYgKCFpc051bWJlcihjb29yZGluYXRlc1swXSkgfHwgIWlzTnVtYmVyKGNvb3JkaW5hdGVzWzFdKSkgdGhyb3cgbmV3IEVycm9yKCdDb29yZGluYXRlcyBtdXN0IGNvbnRhaW4gbnVtYmVycycpO1xuXG4gICAgcmV0dXJuIGZlYXR1cmUoe1xuICAgICAgICB0eXBlOiAnUG9pbnQnLFxuICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXNcbiAgICB9LCBwcm9wZXJ0aWVzLCBiYm94LCBpZCk7XG59XG5cbi8qKlxuICogVGFrZXMgYW4gYXJyYXkgb2YgTGluZWFyUmluZ3MgYW5kIG9wdGlvbmFsbHkgYW4ge0BsaW5rIE9iamVjdH0gd2l0aCBwcm9wZXJ0aWVzIGFuZCByZXR1cm5zIGEge0BsaW5rIFBvbHlnb259IGZlYXR1cmUuXG4gKlxuICogQG5hbWUgcG9seWdvblxuICogQHBhcmFtIHtBcnJheTxBcnJheTxBcnJheTxudW1iZXI+Pj59IGNvb3JkaW5hdGVzIGFuIGFycmF5IG9mIExpbmVhclJpbmdzXG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2lkXSBJZGVudGlmaWVyXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxQb2x5Z29uPn0gYSBQb2x5Z29uIGZlYXR1cmVcbiAqIEB0aHJvd3Mge0Vycm9yfSB0aHJvdyBhbiBlcnJvciBpZiBhIExpbmVhclJpbmcgb2YgdGhlIHBvbHlnb24gaGFzIHRvbyBmZXcgcG9zaXRpb25zXG4gKiBvciBpZiBhIExpbmVhclJpbmcgb2YgdGhlIFBvbHlnb24gZG9lcyBub3QgaGF2ZSBtYXRjaGluZyBQb3NpdGlvbnMgYXQgdGhlIGJlZ2lubmluZyAmIGVuZC5cbiAqIEBleGFtcGxlXG4gKiB2YXIgcG9seWdvbiA9IHR1cmYucG9seWdvbihbW1xuICogICBbLTIuMjc1NTQzLCA1My40NjQ1NDddLFxuICogICBbLTIuMjc1NTQzLCA1My40ODkyNzFdLFxuICogICBbLTIuMjE1MTE4LCA1My40ODkyNzFdLFxuICogICBbLTIuMjE1MTE4LCA1My40NjQ1NDddLFxuICogICBbLTIuMjc1NTQzLCA1My40NjQ1NDddXG4gKiBdXSwgeyBuYW1lOiAncG9seTEnLCBwb3B1bGF0aW9uOiA0MDB9KTtcbiAqXG4gKiAvLz1wb2x5Z29uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwb2x5Z29uKGNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzLCBiYm94LCBpZCkge1xuICAgIGlmICghY29vcmRpbmF0ZXMpIHRocm93IG5ldyBFcnJvcignTm8gY29vcmRpbmF0ZXMgcGFzc2VkJyk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3JkaW5hdGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciByaW5nID0gY29vcmRpbmF0ZXNbaV07XG4gICAgICAgIGlmIChyaW5nLmxlbmd0aCA8IDQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRWFjaCBMaW5lYXJSaW5nIG9mIGEgUG9seWdvbiBtdXN0IGhhdmUgNCBvciBtb3JlIFBvc2l0aW9ucy4nKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJpbmdbcmluZy5sZW5ndGggLSAxXS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgZmlyc3QgcG9pbnQgb2YgUG9seWdvbiBjb250YWlucyB0d28gbnVtYmVyc1xuICAgICAgICAgICAgaWYgKGkgPT09IDAgJiYgaiA9PT0gMCAmJiAhaXNOdW1iZXIocmluZ1swXVswXSkgfHwgIWlzTnVtYmVyKHJpbmdbMF1bMV0pKSB0aHJvdyBuZXcgRXJyb3IoJ0Nvb3JkaW5hdGVzIG11c3QgY29udGFpbiBudW1iZXJzJyk7XG4gICAgICAgICAgICBpZiAocmluZ1tyaW5nLmxlbmd0aCAtIDFdW2pdICE9PSByaW5nWzBdW2pdKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhbmQgbGFzdCBQb3NpdGlvbiBhcmUgbm90IGVxdWl2YWxlbnQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmVhdHVyZSh7XG4gICAgICAgIHR5cGU6ICdQb2x5Z29uJyxcbiAgICAgICAgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzXG4gICAgfSwgcHJvcGVydGllcywgYmJveCwgaWQpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgTGluZVN0cmluZ30gYmFzZWQgb24gYVxuICogY29vcmRpbmF0ZSBhcnJheS4gUHJvcGVydGllcyBjYW4gYmUgYWRkZWQgb3B0aW9uYWxseS5cbiAqXG4gKiBAbmFtZSBsaW5lU3RyaW5nXG4gKiBAcGFyYW0ge0FycmF5PEFycmF5PG51bWJlcj4+fSBjb29yZGluYXRlcyBhbiBhcnJheSBvZiBQb3NpdGlvbnNcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV0gYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlPExpbmVTdHJpbmc+fSBhIExpbmVTdHJpbmcgZmVhdHVyZVxuICogQHRocm93cyB7RXJyb3J9IGlmIG5vIGNvb3JkaW5hdGVzIGFyZSBwYXNzZWRcbiAqIEBleGFtcGxlXG4gKiB2YXIgbGluZXN0cmluZzEgPSB0dXJmLmxpbmVTdHJpbmcoW1xuICogICBbLTIxLjk2NDQxNiwgNjQuMTQ4MjAzXSxcbiAqICAgWy0yMS45NTYxNzYsIDY0LjE0MTMxNl0sXG4gKiAgIFstMjEuOTM5MDEsIDY0LjEzNTkyNF0sXG4gKiAgIFstMjEuOTI3MzM3LCA2NC4xMzY2NzNdXG4gKiBdKTtcbiAqIHZhciBsaW5lc3RyaW5nMiA9IHR1cmYubGluZVN0cmluZyhbXG4gKiAgIFstMjEuOTI5MDU0LCA2NC4xMjc5ODVdLFxuICogICBbLTIxLjkxMjkxOCwgNjQuMTM0NzI2XSxcbiAqICAgWy0yMS45MTYwMDcsIDY0LjE0MTAxNl0sXG4gKiAgIFstMjEuOTMwMDg0LCA2NC4xNDQ0Nl1cbiAqIF0sIHtuYW1lOiAnbGluZSAxJywgZGlzdGFuY2U6IDE0NX0pO1xuICpcbiAqIC8vPWxpbmVzdHJpbmcxXG4gKlxuICogLy89bGluZXN0cmluZzJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpbmVTdHJpbmcoY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFjb29yZGluYXRlcykgdGhyb3cgbmV3IEVycm9yKCdObyBjb29yZGluYXRlcyBwYXNzZWQnKTtcbiAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoIDwgMikgdGhyb3cgbmV3IEVycm9yKCdDb29yZGluYXRlcyBtdXN0IGJlIGFuIGFycmF5IG9mIHR3byBvciBtb3JlIHBvc2l0aW9ucycpO1xuICAgIC8vIENoZWNrIGlmIGZpcnN0IHBvaW50IG9mIExpbmVTdHJpbmcgY29udGFpbnMgdHdvIG51bWJlcnNcbiAgICBpZiAoIWlzTnVtYmVyKGNvb3JkaW5hdGVzWzBdWzFdKSB8fCAhaXNOdW1iZXIoY29vcmRpbmF0ZXNbMF1bMV0pKSB0aHJvdyBuZXcgRXJyb3IoJ0Nvb3JkaW5hdGVzIG11c3QgY29udGFpbiBudW1iZXJzJyk7XG5cbiAgICByZXR1cm4gZmVhdHVyZSh7XG4gICAgICAgIHR5cGU6ICdMaW5lU3RyaW5nJyxcbiAgICAgICAgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzXG4gICAgfSwgcHJvcGVydGllcywgYmJveCwgaWQpO1xufVxuXG4vKipcbiAqIFRha2VzIG9uZSBvciBtb3JlIHtAbGluayBGZWF0dXJlfEZlYXR1cmVzfSBhbmQgY3JlYXRlcyBhIHtAbGluayBGZWF0dXJlQ29sbGVjdGlvbn0uXG4gKlxuICogQG5hbWUgZmVhdHVyZUNvbGxlY3Rpb25cbiAqIEBwYXJhbSB7RmVhdHVyZVtdfSBmZWF0dXJlcyBpbnB1dCBmZWF0dXJlc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlQ29sbGVjdGlvbn0gYSBGZWF0dXJlQ29sbGVjdGlvbiBvZiBpbnB1dCBmZWF0dXJlc1xuICogQGV4YW1wbGVcbiAqIHZhciBmZWF0dXJlcyA9IFtcbiAqICB0dXJmLnBvaW50KFstNzUuMzQzLCAzOS45ODRdLCB7bmFtZTogJ0xvY2F0aW9uIEEnfSksXG4gKiAgdHVyZi5wb2ludChbLTc1LjgzMywgMzkuMjg0XSwge25hbWU6ICdMb2NhdGlvbiBCJ30pLFxuICogIHR1cmYucG9pbnQoWy03NS41MzQsIDM5LjEyM10sIHtuYW1lOiAnTG9jYXRpb24gQyd9KVxuICogXTtcbiAqXG4gKiB2YXIgY29sbGVjdGlvbiA9IHR1cmYuZmVhdHVyZUNvbGxlY3Rpb24oZmVhdHVyZXMpO1xuICpcbiAqIC8vPWNvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZlYXR1cmVDb2xsZWN0aW9uKGZlYXR1cmVzLCBiYm94LCBpZCkge1xuICAgIGlmICghZmVhdHVyZXMpIHRocm93IG5ldyBFcnJvcignTm8gZmVhdHVyZXMgcGFzc2VkJyk7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGZlYXR1cmVzKSkgdGhyb3cgbmV3IEVycm9yKCdmZWF0dXJlcyBtdXN0IGJlIGFuIEFycmF5Jyk7XG4gICAgaWYgKGJib3ggJiYgYmJveC5sZW5ndGggIT09IDQpIHRocm93IG5ldyBFcnJvcignYmJveCBtdXN0IGJlIGFuIEFycmF5IG9mIDQgbnVtYmVycycpO1xuICAgIGlmIChpZCAmJiBbJ3N0cmluZycsICdudW1iZXInXS5pbmRleE9mKHR5cGVvZiBpZCkgPT09IC0xKSB0aHJvdyBuZXcgRXJyb3IoJ2lkIG11c3QgYmUgYSBudW1iZXIgb3IgYSBzdHJpbmcnKTtcblxuICAgIHZhciBmYyA9IHt0eXBlOiAnRmVhdHVyZUNvbGxlY3Rpb24nfTtcbiAgICBpZiAoaWQpIGZjLmlkID0gaWQ7XG4gICAgaWYgKGJib3gpIGZjLmJib3ggPSBiYm94O1xuICAgIGZjLmZlYXR1cmVzID0gZmVhdHVyZXM7XG4gICAgcmV0dXJuIGZjO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgRmVhdHVyZTxNdWx0aUxpbmVTdHJpbmc+fSBiYXNlZCBvbiBhXG4gKiBjb29yZGluYXRlIGFycmF5LiBQcm9wZXJ0aWVzIGNhbiBiZSBhZGRlZCBvcHRpb25hbGx5LlxuICpcbiAqIEBuYW1lIG11bHRpTGluZVN0cmluZ1xuICogQHBhcmFtIHtBcnJheTxBcnJheTxBcnJheTxudW1iZXI+Pj59IGNvb3JkaW5hdGVzIGFuIGFycmF5IG9mIExpbmVTdHJpbmdzXG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2lkXSBJZGVudGlmaWVyXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxNdWx0aUxpbmVTdHJpbmc+fSBhIE11bHRpTGluZVN0cmluZyBmZWF0dXJlXG4gKiBAdGhyb3dzIHtFcnJvcn0gaWYgbm8gY29vcmRpbmF0ZXMgYXJlIHBhc3NlZFxuICogQGV4YW1wbGVcbiAqIHZhciBtdWx0aUxpbmUgPSB0dXJmLm11bHRpTGluZVN0cmluZyhbW1swLDBdLFsxMCwxMF1dXSk7XG4gKlxuICogLy89bXVsdGlMaW5lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aUxpbmVTdHJpbmcoY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFjb29yZGluYXRlcykgdGhyb3cgbmV3IEVycm9yKCdObyBjb29yZGluYXRlcyBwYXNzZWQnKTtcblxuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ011bHRpTGluZVN0cmluZycsXG4gICAgICAgIGNvb3JkaW5hdGVzOiBjb29yZGluYXRlc1xuICAgIH0sIHByb3BlcnRpZXMsIGJib3gsIGlkKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEge0BsaW5rIEZlYXR1cmU8TXVsdGlQb2ludD59IGJhc2VkIG9uIGFcbiAqIGNvb3JkaW5hdGUgYXJyYXkuIFByb3BlcnRpZXMgY2FuIGJlIGFkZGVkIG9wdGlvbmFsbHkuXG4gKlxuICogQG5hbWUgbXVsdGlQb2ludFxuICogQHBhcmFtIHtBcnJheTxBcnJheTxudW1iZXI+Pn0gY29vcmRpbmF0ZXMgYW4gYXJyYXkgb2YgUG9zaXRpb25zXG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2lkXSBJZGVudGlmaWVyXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxNdWx0aVBvaW50Pn0gYSBNdWx0aVBvaW50IGZlYXR1cmVcbiAqIEB0aHJvd3Mge0Vycm9yfSBpZiBubyBjb29yZGluYXRlcyBhcmUgcGFzc2VkXG4gKiBAZXhhbXBsZVxuICogdmFyIG11bHRpUHQgPSB0dXJmLm11bHRpUG9pbnQoW1swLDBdLFsxMCwxMF1dKTtcbiAqXG4gKiAvLz1tdWx0aVB0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aVBvaW50KGNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzLCBiYm94LCBpZCkge1xuICAgIGlmICghY29vcmRpbmF0ZXMpIHRocm93IG5ldyBFcnJvcignTm8gY29vcmRpbmF0ZXMgcGFzc2VkJyk7XG5cbiAgICByZXR1cm4gZmVhdHVyZSh7XG4gICAgICAgIHR5cGU6ICdNdWx0aVBvaW50JyxcbiAgICAgICAgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzXG4gICAgfSwgcHJvcGVydGllcywgYmJveCwgaWQpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgRmVhdHVyZTxNdWx0aVBvbHlnb24+fSBiYXNlZCBvbiBhXG4gKiBjb29yZGluYXRlIGFycmF5LiBQcm9wZXJ0aWVzIGNhbiBiZSBhZGRlZCBvcHRpb25hbGx5LlxuICpcbiAqIEBuYW1lIG11bHRpUG9seWdvblxuICogQHBhcmFtIHtBcnJheTxBcnJheTxBcnJheTxBcnJheTxudW1iZXI+Pj4+fSBjb29yZGluYXRlcyBhbiBhcnJheSBvZiBQb2x5Z29uc1xuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtpZF0gSWRlbnRpZmllclxuICogQHJldHVybnMge0ZlYXR1cmU8TXVsdGlQb2x5Z29uPn0gYSBtdWx0aXBvbHlnb24gZmVhdHVyZVxuICogQHRocm93cyB7RXJyb3J9IGlmIG5vIGNvb3JkaW5hdGVzIGFyZSBwYXNzZWRcbiAqIEBleGFtcGxlXG4gKiB2YXIgbXVsdGlQb2x5ID0gdHVyZi5tdWx0aVBvbHlnb24oW1tbWzAsMF0sWzAsMTBdLFsxMCwxMF0sWzEwLDBdLFswLDBdXV1dKTtcbiAqXG4gKiAvLz1tdWx0aVBvbHlcbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aVBvbHlnb24oY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFjb29yZGluYXRlcykgdGhyb3cgbmV3IEVycm9yKCdObyBjb29yZGluYXRlcyBwYXNzZWQnKTtcblxuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ011bHRpUG9seWdvbicsXG4gICAgICAgIGNvb3JkaW5hdGVzOiBjb29yZGluYXRlc1xuICAgIH0sIHByb3BlcnRpZXMsIGJib3gsIGlkKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEge0BsaW5rIEZlYXR1cmU8R2VvbWV0cnlDb2xsZWN0aW9uPn0gYmFzZWQgb24gYVxuICogY29vcmRpbmF0ZSBhcnJheS4gUHJvcGVydGllcyBjYW4gYmUgYWRkZWQgb3B0aW9uYWxseS5cbiAqXG4gKiBAbmFtZSBnZW9tZXRyeUNvbGxlY3Rpb25cbiAqIEBwYXJhbSB7QXJyYXk8R2VvbWV0cnk+fSBnZW9tZXRyaWVzIGFuIGFycmF5IG9mIEdlb0pTT04gR2VvbWV0cmllc1xuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtpZF0gSWRlbnRpZmllclxuICogQHJldHVybnMge0ZlYXR1cmU8R2VvbWV0cnlDb2xsZWN0aW9uPn0gYSBHZW9KU09OIEdlb21ldHJ5Q29sbGVjdGlvbiBGZWF0dXJlXG4gKiBAZXhhbXBsZVxuICogdmFyIHB0ID0ge1xuICogICAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gKiAgICAgICBcImNvb3JkaW5hdGVzXCI6IFsxMDAsIDBdXG4gKiAgICAgfTtcbiAqIHZhciBsaW5lID0ge1xuICogICAgIFwidHlwZVwiOiBcIkxpbmVTdHJpbmdcIixcbiAqICAgICBcImNvb3JkaW5hdGVzXCI6IFsgWzEwMSwgMF0sIFsxMDIsIDFdIF1cbiAqICAgfTtcbiAqIHZhciBjb2xsZWN0aW9uID0gdHVyZi5nZW9tZXRyeUNvbGxlY3Rpb24oW3B0LCBsaW5lXSk7XG4gKlxuICogLy89Y29sbGVjdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VvbWV0cnlDb2xsZWN0aW9uKGdlb21ldHJpZXMsIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFnZW9tZXRyaWVzKSB0aHJvdyBuZXcgRXJyb3IoJ2dlb21ldHJpZXMgaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZ2VvbWV0cmllcykpIHRocm93IG5ldyBFcnJvcignZ2VvbWV0cmllcyBtdXN0IGJlIGFuIEFycmF5Jyk7XG5cbiAgICByZXR1cm4gZmVhdHVyZSh7XG4gICAgICAgIHR5cGU6ICdHZW9tZXRyeUNvbGxlY3Rpb24nLFxuICAgICAgICBnZW9tZXRyaWVzOiBnZW9tZXRyaWVzXG4gICAgfSwgcHJvcGVydGllcywgYmJveCwgaWQpO1xufVxuXG4vLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9HcmVhdC1jaXJjbGVfZGlzdGFuY2UjUmFkaXVzX2Zvcl9zcGhlcmljYWxfRWFydGhcbnZhciBmYWN0b3JzID0ge1xuICAgIG1pbGVzOiAzOTYwLFxuICAgIG5hdXRpY2FsbWlsZXM6IDM0NDEuMTQ1LFxuICAgIGRlZ3JlZXM6IDU3LjI5NTc3OTUsXG4gICAgcmFkaWFuczogMSxcbiAgICBpbmNoZXM6IDI1MDkwNTYwMCxcbiAgICB5YXJkczogNjk2OTYwMCxcbiAgICBtZXRlcnM6IDYzNzMwMDAsXG4gICAgbWV0cmVzOiA2MzczMDAwLFxuICAgIGNlbnRpbWV0ZXJzOiA2LjM3M2UrOCxcbiAgICBjZW50aW1ldHJlczogNi4zNzNlKzgsXG4gICAga2lsb21ldGVyczogNjM3MyxcbiAgICBraWxvbWV0cmVzOiA2MzczLFxuICAgIGZlZXQ6IDIwOTA4NzkyLjY1XG59O1xuXG52YXIgYXJlYUZhY3RvcnMgPSB7XG4gICAga2lsb21ldGVyczogMC4wMDAwMDEsXG4gICAga2lsb21ldHJlczogMC4wMDAwMDEsXG4gICAgbWV0ZXJzOiAxLFxuICAgIG1ldHJlczogMSxcbiAgICBjZW50aW1ldHJlczogMTAwMDAsXG4gICAgbWlsbGltZXRlcjogMTAwMDAwMCxcbiAgICBhY3JlczogMC4wMDAyNDcxMDUsXG4gICAgbWlsZXM6IDMuODZlLTcsXG4gICAgeWFyZHM6IDEuMTk1OTkwMDQ2LFxuICAgIGZlZXQ6IDEwLjc2MzkxMDQxNyxcbiAgICBpbmNoZXM6IDE1NTAuMDAzMTAwMDA2XG59O1xuXG4vKipcbiAqIFJvdW5kIG51bWJlciB0byBwcmVjaXNpb25cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gbnVtIE51bWJlclxuICogQHBhcmFtIHtudW1iZXJ9IFtwcmVjaXNpb249MF0gUHJlY2lzaW9uXG4gKiBAcmV0dXJucyB7bnVtYmVyfSByb3VuZGVkIG51bWJlclxuICogQGV4YW1wbGVcbiAqIHR1cmYucm91bmQoMTIwLjQzMjEpXG4gKiAvLz0xMjBcbiAqXG4gKiB0dXJmLnJvdW5kKDEyMC40MzIxLCAyKVxuICogLy89MTIwLjQzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3VuZChudW0sIHByZWNpc2lvbikge1xuICAgIGlmIChudW0gPT09IHVuZGVmaW5lZCB8fCBudW0gPT09IG51bGwgfHwgaXNOYU4obnVtKSkgdGhyb3cgbmV3IEVycm9yKCdudW0gaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAocHJlY2lzaW9uICYmICEocHJlY2lzaW9uID49IDApKSB0aHJvdyBuZXcgRXJyb3IoJ3ByZWNpc2lvbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gICAgdmFyIG11bHRpcGxpZXIgPSBNYXRoLnBvdygxMCwgcHJlY2lzaW9uIHx8IDApO1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG51bSAqIG11bHRpcGxpZXIpIC8gbXVsdGlwbGllcjtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgZGlzdGFuY2UgbWVhc3VyZW1lbnQgKGFzc3VtaW5nIGEgc3BoZXJpY2FsIEVhcnRoKSBmcm9tIHJhZGlhbnMgdG8gYSBtb3JlIGZyaWVuZGx5IHVuaXQuXG4gKiBWYWxpZCB1bml0czogbWlsZXMsIG5hdXRpY2FsbWlsZXMsIGluY2hlcywgeWFyZHMsIG1ldGVycywgbWV0cmVzLCBraWxvbWV0ZXJzLCBjZW50aW1ldGVycywgZmVldFxuICpcbiAqIEBuYW1lIHJhZGlhbnNUb0Rpc3RhbmNlXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkaWFucyBpbiByYWRpYW5zIGFjcm9zcyB0aGUgc3BoZXJlXG4gKiBAcGFyYW0ge3N0cmluZ30gW3VuaXRzPVwia2lsb21ldGVyc1wiXSBjYW4gYmUgZGVncmVlcywgcmFkaWFucywgbWlsZXMsIG9yIGtpbG9tZXRlcnMgaW5jaGVzLCB5YXJkcywgbWV0cmVzLCBtZXRlcnMsIGtpbG9tZXRyZXMsIGtpbG9tZXRlcnMuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBkaXN0YW5jZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmFkaWFuc1RvRGlzdGFuY2UocmFkaWFucywgdW5pdHMpIHtcbiAgICBpZiAocmFkaWFucyA9PT0gdW5kZWZpbmVkIHx8IHJhZGlhbnMgPT09IG51bGwpIHRocm93IG5ldyBFcnJvcigncmFkaWFucyBpcyByZXF1aXJlZCcpO1xuXG4gICAgaWYgKHVuaXRzICYmIHR5cGVvZiB1bml0cyAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcigndW5pdHMgbXVzdCBiZSBhIHN0cmluZycpO1xuICAgIHZhciBmYWN0b3IgPSBmYWN0b3JzW3VuaXRzIHx8ICdraWxvbWV0ZXJzJ107XG4gICAgaWYgKCFmYWN0b3IpIHRocm93IG5ldyBFcnJvcih1bml0cyArICcgdW5pdHMgaXMgaW52YWxpZCcpO1xuICAgIHJldHVybiByYWRpYW5zICogZmFjdG9yO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBkaXN0YW5jZSBtZWFzdXJlbWVudCAoYXNzdW1pbmcgYSBzcGhlcmljYWwgRWFydGgpIGZyb20gYSByZWFsLXdvcmxkIHVuaXQgaW50byByYWRpYW5zXG4gKiBWYWxpZCB1bml0czogbWlsZXMsIG5hdXRpY2FsbWlsZXMsIGluY2hlcywgeWFyZHMsIG1ldGVycywgbWV0cmVzLCBraWxvbWV0ZXJzLCBjZW50aW1ldGVycywgZmVldFxuICpcbiAqIEBuYW1lIGRpc3RhbmNlVG9SYWRpYW5zXG4gKiBAcGFyYW0ge251bWJlcn0gZGlzdGFuY2UgaW4gcmVhbCB1bml0c1xuICogQHBhcmFtIHtzdHJpbmd9IFt1bml0cz1raWxvbWV0ZXJzXSBjYW4gYmUgZGVncmVlcywgcmFkaWFucywgbWlsZXMsIG9yIGtpbG9tZXRlcnMgaW5jaGVzLCB5YXJkcywgbWV0cmVzLCBtZXRlcnMsIGtpbG9tZXRyZXMsIGtpbG9tZXRlcnMuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSByYWRpYW5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZVRvUmFkaWFucyhkaXN0YW5jZSwgdW5pdHMpIHtcbiAgICBpZiAoZGlzdGFuY2UgPT09IHVuZGVmaW5lZCB8fCBkaXN0YW5jZSA9PT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKCdkaXN0YW5jZSBpcyByZXF1aXJlZCcpO1xuXG4gICAgaWYgKHVuaXRzICYmIHR5cGVvZiB1bml0cyAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcigndW5pdHMgbXVzdCBiZSBhIHN0cmluZycpO1xuICAgIHZhciBmYWN0b3IgPSBmYWN0b3JzW3VuaXRzIHx8ICdraWxvbWV0ZXJzJ107XG4gICAgaWYgKCFmYWN0b3IpIHRocm93IG5ldyBFcnJvcih1bml0cyArICcgdW5pdHMgaXMgaW52YWxpZCcpO1xuICAgIHJldHVybiBkaXN0YW5jZSAvIGZhY3Rvcjtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgZGlzdGFuY2UgbWVhc3VyZW1lbnQgKGFzc3VtaW5nIGEgc3BoZXJpY2FsIEVhcnRoKSBmcm9tIGEgcmVhbC13b3JsZCB1bml0IGludG8gZGVncmVlc1xuICogVmFsaWQgdW5pdHM6IG1pbGVzLCBuYXV0aWNhbG1pbGVzLCBpbmNoZXMsIHlhcmRzLCBtZXRlcnMsIG1ldHJlcywgY2VudGltZXRlcnMsIGtpbG9tZXRyZXMsIGZlZXRcbiAqXG4gKiBAbmFtZSBkaXN0YW5jZVRvRGVncmVlc1xuICogQHBhcmFtIHtudW1iZXJ9IGRpc3RhbmNlIGluIHJlYWwgdW5pdHNcbiAqIEBwYXJhbSB7c3RyaW5nfSBbdW5pdHM9a2lsb21ldGVyc10gY2FuIGJlIGRlZ3JlZXMsIHJhZGlhbnMsIG1pbGVzLCBvciBraWxvbWV0ZXJzIGluY2hlcywgeWFyZHMsIG1ldHJlcywgbWV0ZXJzLCBraWxvbWV0cmVzLCBraWxvbWV0ZXJzLlxuICogQHJldHVybnMge251bWJlcn0gZGVncmVlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzdGFuY2VUb0RlZ3JlZXMoZGlzdGFuY2UsIHVuaXRzKSB7XG4gICAgcmV0dXJuIHJhZGlhbnMyZGVncmVlcyhkaXN0YW5jZVRvUmFkaWFucyhkaXN0YW5jZSwgdW5pdHMpKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhbnkgYmVhcmluZyBhbmdsZSBmcm9tIHRoZSBub3J0aCBsaW5lIGRpcmVjdGlvbiAocG9zaXRpdmUgY2xvY2t3aXNlKVxuICogYW5kIHJldHVybnMgYW4gYW5nbGUgYmV0d2VlbiAwLTM2MCBkZWdyZWVzIChwb3NpdGl2ZSBjbG9ja3dpc2UpLCAwIGJlaW5nIHRoZSBub3J0aCBsaW5lXG4gKlxuICogQG5hbWUgYmVhcmluZ1RvQW5nbGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBiZWFyaW5nIGFuZ2xlLCBiZXR3ZWVuIC0xODAgYW5kICsxODAgZGVncmVlc1xuICogQHJldHVybnMge251bWJlcn0gYW5nbGUgYmV0d2VlbiAwIGFuZCAzNjAgZGVncmVlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gYmVhcmluZ1RvQW5nbGUoYmVhcmluZykge1xuICAgIGlmIChiZWFyaW5nID09PSBudWxsIHx8IGJlYXJpbmcgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKCdiZWFyaW5nIGlzIHJlcXVpcmVkJyk7XG5cbiAgICB2YXIgYW5nbGUgPSBiZWFyaW5nICUgMzYwO1xuICAgIGlmIChhbmdsZSA8IDApIGFuZ2xlICs9IDM2MDtcbiAgICByZXR1cm4gYW5nbGU7XG59XG5cbi8qKlxuICogQ29udmVydHMgYW4gYW5nbGUgaW4gcmFkaWFucyB0byBkZWdyZWVzXG4gKlxuICogQG5hbWUgcmFkaWFuczJkZWdyZWVzXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkaWFucyBhbmdsZSBpbiByYWRpYW5zXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBkZWdyZWVzIGJldHdlZW4gMCBhbmQgMzYwIGRlZ3JlZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJhZGlhbnMyZGVncmVlcyhyYWRpYW5zKSB7XG4gICAgaWYgKHJhZGlhbnMgPT09IG51bGwgfHwgcmFkaWFucyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoJ3JhZGlhbnMgaXMgcmVxdWlyZWQnKTtcblxuICAgIHZhciBkZWdyZWVzID0gcmFkaWFucyAlICgyICogTWF0aC5QSSk7XG4gICAgcmV0dXJuIGRlZ3JlZXMgKiAxODAgLyBNYXRoLlBJO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGFuIGFuZ2xlIGluIGRlZ3JlZXMgdG8gcmFkaWFuc1xuICpcbiAqIEBuYW1lIGRlZ3JlZXMycmFkaWFuc1xuICogQHBhcmFtIHtudW1iZXJ9IGRlZ3JlZXMgYW5nbGUgYmV0d2VlbiAwIGFuZCAzNjAgZGVncmVlc1xuICogQHJldHVybnMge251bWJlcn0gYW5nbGUgaW4gcmFkaWFuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZGVncmVlczJyYWRpYW5zKGRlZ3JlZXMpIHtcbiAgICBpZiAoZGVncmVlcyA9PT0gbnVsbCB8fCBkZWdyZWVzID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcignZGVncmVlcyBpcyByZXF1aXJlZCcpO1xuXG4gICAgdmFyIHJhZGlhbnMgPSBkZWdyZWVzICUgMzYwO1xuICAgIHJldHVybiByYWRpYW5zICogTWF0aC5QSSAvIDE4MDtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIGRpc3RhbmNlIHRvIHRoZSByZXF1ZXN0ZWQgdW5pdC5cbiAqIFZhbGlkIHVuaXRzOiBtaWxlcywgbmF1dGljYWxtaWxlcywgaW5jaGVzLCB5YXJkcywgbWV0ZXJzLCBtZXRyZXMsIGtpbG9tZXRlcnMsIGNlbnRpbWV0ZXJzLCBmZWV0XG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IGRpc3RhbmNlIHRvIGJlIGNvbnZlcnRlZFxuICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpbmFsVW5pdCBvZiB0aGUgZGlzdGFuY2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBbZmluYWxVbml0PWtpbG9tZXRlcnNdIHJldHVybmVkIHVuaXRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHRoZSBjb252ZXJ0ZWQgZGlzdGFuY2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnREaXN0YW5jZShkaXN0YW5jZSwgb3JpZ2luYWxVbml0LCBmaW5hbFVuaXQpIHtcbiAgICBpZiAoZGlzdGFuY2UgPT09IG51bGwgfHwgZGlzdGFuY2UgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKCdkaXN0YW5jZSBpcyByZXF1aXJlZCcpO1xuICAgIGlmICghKGRpc3RhbmNlID49IDApKSB0aHJvdyBuZXcgRXJyb3IoJ2Rpc3RhbmNlIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcblxuICAgIHZhciBjb252ZXJ0ZWREaXN0YW5jZSA9IHJhZGlhbnNUb0Rpc3RhbmNlKGRpc3RhbmNlVG9SYWRpYW5zKGRpc3RhbmNlLCBvcmlnaW5hbFVuaXQpLCBmaW5hbFVuaXQgfHwgJ2tpbG9tZXRlcnMnKTtcbiAgICByZXR1cm4gY29udmVydGVkRGlzdGFuY2U7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBhcmVhIHRvIHRoZSByZXF1ZXN0ZWQgdW5pdC5cbiAqIFZhbGlkIHVuaXRzOiBraWxvbWV0ZXJzLCBraWxvbWV0cmVzLCBtZXRlcnMsIG1ldHJlcywgY2VudGltZXRyZXMsIG1pbGxpbWV0ZXIsIGFjcmUsIG1pbGUsIHlhcmQsIGZvb3QsIGluY2hcbiAqIEBwYXJhbSB7bnVtYmVyfSBhcmVhIHRvIGJlIGNvbnZlcnRlZFxuICogQHBhcmFtIHtzdHJpbmd9IFtvcmlnaW5hbFVuaXQ9bWV0ZXJzXSBvZiB0aGUgZGlzdGFuY2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBbZmluYWxVbml0PWtpbG9tZXRlcnNdIHJldHVybmVkIHVuaXRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHRoZSBjb252ZXJ0ZWQgZGlzdGFuY2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRBcmVhKGFyZWEsIG9yaWdpbmFsVW5pdCwgZmluYWxVbml0KSB7XG4gICAgaWYgKGFyZWEgPT09IG51bGwgfHwgYXJlYSA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoJ2FyZWEgaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAoIShhcmVhID49IDApKSB0aHJvdyBuZXcgRXJyb3IoJ2FyZWEgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuXG4gICAgdmFyIHN0YXJ0RmFjdG9yID0gYXJlYUZhY3RvcnNbb3JpZ2luYWxVbml0IHx8ICdtZXRlcnMnXTtcbiAgICBpZiAoIXN0YXJ0RmFjdG9yKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgb3JpZ2luYWwgdW5pdHMnKTtcblxuICAgIHZhciBmaW5hbEZhY3RvciA9IGFyZWFGYWN0b3JzW2ZpbmFsVW5pdCB8fCAna2lsb21ldGVycyddO1xuICAgIGlmICghZmluYWxGYWN0b3IpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBmaW5hbCB1bml0cycpO1xuXG4gICAgcmV0dXJuIChhcmVhIC8gc3RhcnRGYWN0b3IpICogZmluYWxGYWN0b3I7XG59XG5cbi8qKlxuICogaXNOdW1iZXJcbiAqXG4gKiBAcGFyYW0geyp9IG51bSBOdW1iZXIgdG8gdmFsaWRhdGVcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlL2ZhbHNlXG4gKiBAZXhhbXBsZVxuICogdHVyZi5pc051bWJlcigxMjMpXG4gKiAvLz10cnVlXG4gKiB0dXJmLmlzTnVtYmVyKCdmb28nKVxuICogLy89ZmFsc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTnVtYmVyKG51bSkge1xuICAgIHJldHVybiAhaXNOYU4obnVtKSAmJiBudW0gIT09IG51bGwgJiYgIUFycmF5LmlzQXJyYXkobnVtKTtcbn1cblxuLyoqXG4gKiBpc09iamVjdFxuICpcbiAqIEBwYXJhbSB7Kn0gaW5wdXQgdmFyaWFibGUgdG8gdmFsaWRhdGVcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlL2ZhbHNlXG4gKiBAZXhhbXBsZVxuICogdHVyZi5pc09iamVjdCh7ZWxldmF0aW9uOiAxMH0pXG4gKiAvLz10cnVlXG4gKiB0dXJmLmlzT2JqZWN0KCdmb28nKVxuICogLy89ZmFsc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzT2JqZWN0KGlucHV0KSB7XG4gICAgcmV0dXJuICghIWlucHV0KSAmJiAoaW5wdXQuY29uc3RydWN0b3IgPT09IE9iamVjdCk7XG59XG5cbi8qKlxuICogRWFydGggUmFkaXVzIHVzZWQgd2l0aCB0aGUgSGFydmVzaW5lIGZvcm11bGEgYW5kIGFwcHJveGltYXRlcyB1c2luZyBhIHNwaGVyaWNhbCAobm9uLWVsbGlwc29pZCkgRWFydGguXG4gKi9cbmV4cG9ydCB2YXIgZWFydGhSYWRpdXMgPSA2MzcxMDA4Ljg7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AdHVyZi9jaXJjbGUvbm9kZV9tb2R1bGVzL0B0dXJmL2hlbHBlcnMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDI3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogRWFydGggUmFkaXVzIHVzZWQgd2l0aCB0aGUgSGFydmVzaW5lIGZvcm11bGEgYW5kIGFwcHJveGltYXRlcyB1c2luZyBhIHNwaGVyaWNhbCAobm9uLWVsbGlwc29pZCkgRWFydGguXG4gKi9cbmV4cG9ydCB2YXIgZWFydGhSYWRpdXMgPSA2MzcxMDA4Ljg7XG5cbi8qKlxuICogVW5pdCBvZiBtZWFzdXJlbWVudCBmYWN0b3JzIHVzaW5nIGEgc3BoZXJpY2FsIChub24tZWxsaXBzb2lkKSBlYXJ0aCByYWRpdXMuXG4gKi9cbmV4cG9ydCB2YXIgZmFjdG9ycyA9IHtcbiAgICBtZXRlcnM6IGVhcnRoUmFkaXVzLFxuICAgIG1ldHJlczogZWFydGhSYWRpdXMsXG4gICAgbWlsbGltZXRlcnM6IGVhcnRoUmFkaXVzICogMTAwMCxcbiAgICBtaWxsaW1ldHJlczogZWFydGhSYWRpdXMgKiAxMDAwLFxuICAgIGNlbnRpbWV0ZXJzOiBlYXJ0aFJhZGl1cyAqIDEwMCxcbiAgICBjZW50aW1ldHJlczogZWFydGhSYWRpdXMgKiAxMDAsXG4gICAga2lsb21ldGVyczogZWFydGhSYWRpdXMgLyAxMDAwLFxuICAgIGtpbG9tZXRyZXM6IGVhcnRoUmFkaXVzIC8gMTAwMCxcbiAgICBtaWxlczogZWFydGhSYWRpdXMgLyAxNjA5LjM0NCxcbiAgICBuYXV0aWNhbG1pbGVzOiBlYXJ0aFJhZGl1cyAvIDE4NTIsXG4gICAgaW5jaGVzOiBlYXJ0aFJhZGl1cyAqIDM5LjM3MCxcbiAgICB5YXJkczogZWFydGhSYWRpdXMgLyAxLjA5MzYsXG4gICAgZmVldDogZWFydGhSYWRpdXMgKiAzLjI4MDg0LFxuICAgIHJhZGlhbnM6IDEsXG4gICAgZGVncmVlczogZWFydGhSYWRpdXMgLyAxMTEzMjUsXG59O1xuXG4vKipcbiAqIFVuaXRzIG9mIG1lYXN1cmVtZW50IGZhY3RvcnMgYmFzZWQgb24gMSBtZXRlci5cbiAqL1xuZXhwb3J0IHZhciB1bml0c0ZhY3RvcnMgPSB7XG4gICAgbWV0ZXJzOiAxLFxuICAgIG1ldHJlczogMSxcbiAgICBtaWxsaW1ldGVyczogMTAwMCxcbiAgICBtaWxsaW1ldHJlczogMTAwMCxcbiAgICBjZW50aW1ldGVyczogMTAwLFxuICAgIGNlbnRpbWV0cmVzOiAxMDAsXG4gICAga2lsb21ldGVyczogMSAvIDEwMDAsXG4gICAga2lsb21ldHJlczogMSAvIDEwMDAsXG4gICAgbWlsZXM6IDEgLyAxNjA5LjM0NCxcbiAgICBuYXV0aWNhbG1pbGVzOiAxIC8gMTg1MixcbiAgICBpbmNoZXM6IDM5LjM3MCxcbiAgICB5YXJkczogMSAvIDEuMDkzNixcbiAgICBmZWV0OiAzLjI4MDg0LFxuICAgIHJhZGlhbnM6IDEgLyBlYXJ0aFJhZGl1cyxcbiAgICBkZWdyZWVzOiAxIC8gMTExMzI1LFxufTtcblxuLyoqXG4gKiBBcmVhIG9mIG1lYXN1cmVtZW50IGZhY3RvcnMgYmFzZWQgb24gMSBzcXVhcmUgbWV0ZXIuXG4gKi9cbmV4cG9ydCB2YXIgYXJlYUZhY3RvcnMgPSB7XG4gICAgbWV0ZXJzOiAxLFxuICAgIG1ldHJlczogMSxcbiAgICBtaWxsaW1ldGVyczogMTAwMDAwMCxcbiAgICBtaWxsaW1ldHJlczogMTAwMDAwMCxcbiAgICBjZW50aW1ldGVyczogMTAwMDAsXG4gICAgY2VudGltZXRyZXM6IDEwMDAwLFxuICAgIGtpbG9tZXRlcnM6IDAuMDAwMDAxLFxuICAgIGtpbG9tZXRyZXM6IDAuMDAwMDAxLFxuICAgIGFjcmVzOiAwLjAwMDI0NzEwNSxcbiAgICBtaWxlczogMy44NmUtNyxcbiAgICB5YXJkczogMS4xOTU5OTAwNDYsXG4gICAgZmVldDogMTAuNzYzOTEwNDE3LFxuICAgIGluY2hlczogMTU1MC4wMDMxMDAwMDZcbn07XG5cbi8qKlxuICogV3JhcHMgYSBHZW9KU09OIHtAbGluayBHZW9tZXRyeX0gaW4gYSBHZW9KU09OIHtAbGluayBGZWF0dXJlfS5cbiAqXG4gKiBAbmFtZSBmZWF0dXJlXG4gKiBAcGFyYW0ge0dlb21ldHJ5fSBnZW9tZXRyeSBpbnB1dCBnZW9tZXRyeVxuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtpZF0gSWRlbnRpZmllclxuICogQHJldHVybnMge0ZlYXR1cmV9IGEgR2VvSlNPTiBGZWF0dXJlXG4gKiBAZXhhbXBsZVxuICogdmFyIGdlb21ldHJ5ID0ge1xuICogICBcInR5cGVcIjogXCJQb2ludFwiLFxuICogICBcImNvb3JkaW5hdGVzXCI6IFsxMTAsIDUwXVxuICogfTtcbiAqXG4gKiB2YXIgZmVhdHVyZSA9IHR1cmYuZmVhdHVyZShnZW9tZXRyeSk7XG4gKlxuICogLy89ZmVhdHVyZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZmVhdHVyZShnZW9tZXRyeSwgcHJvcGVydGllcywgYmJveCwgaWQpIHtcbiAgICBpZiAoZ2VvbWV0cnkgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKCdnZW9tZXRyeSBpcyByZXF1aXJlZCcpO1xuICAgIGlmIChwcm9wZXJ0aWVzICYmIHByb3BlcnRpZXMuY29uc3RydWN0b3IgIT09IE9iamVjdCkgdGhyb3cgbmV3IEVycm9yKCdwcm9wZXJ0aWVzIG11c3QgYmUgYW4gT2JqZWN0Jyk7XG4gICAgaWYgKGJib3ggJiYgYmJveC5sZW5ndGggIT09IDQpIHRocm93IG5ldyBFcnJvcignYmJveCBtdXN0IGJlIGFuIEFycmF5IG9mIDQgbnVtYmVycycpO1xuICAgIGlmIChpZCAmJiBbJ3N0cmluZycsICdudW1iZXInXS5pbmRleE9mKHR5cGVvZiBpZCkgPT09IC0xKSB0aHJvdyBuZXcgRXJyb3IoJ2lkIG11c3QgYmUgYSBudW1iZXIgb3IgYSBzdHJpbmcnKTtcblxuICAgIHZhciBmZWF0ID0ge3R5cGU6ICdGZWF0dXJlJ307XG4gICAgaWYgKGlkKSBmZWF0LmlkID0gaWQ7XG4gICAgaWYgKGJib3gpIGZlYXQuYmJveCA9IGJib3g7XG4gICAgZmVhdC5wcm9wZXJ0aWVzID0gcHJvcGVydGllcyB8fCB7fTtcbiAgICBmZWF0Lmdlb21ldHJ5ID0gZ2VvbWV0cnk7XG4gICAgcmV0dXJuIGZlYXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIEdlb0pTT04ge0BsaW5rIEdlb21ldHJ5fSBmcm9tIGEgR2VvbWV0cnkgc3RyaW5nIHR5cGUgJiBjb29yZGluYXRlcy5cbiAqIEZvciBHZW9tZXRyeUNvbGxlY3Rpb24gdHlwZSB1c2UgYGhlbHBlcnMuZ2VvbWV0cnlDb2xsZWN0aW9uYFxuICpcbiAqIEBuYW1lIGdlb21ldHJ5XG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBHZW9tZXRyeSBUeXBlXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IGNvb3JkaW5hdGVzIENvb3JkaW5hdGVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcmV0dXJucyB7R2VvbWV0cnl9IGEgR2VvSlNPTiBHZW9tZXRyeVxuICogQGV4YW1wbGVcbiAqIHZhciB0eXBlID0gJ1BvaW50JztcbiAqIHZhciBjb29yZGluYXRlcyA9IFsxMTAsIDUwXTtcbiAqXG4gKiB2YXIgZ2VvbWV0cnkgPSB0dXJmLmdlb21ldHJ5KHR5cGUsIGNvb3JkaW5hdGVzKTtcbiAqXG4gKiAvLz1nZW9tZXRyeVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VvbWV0cnkodHlwZSwgY29vcmRpbmF0ZXMsIGJib3gpIHtcbiAgICAvLyBWYWxpZGF0aW9uXG4gICAgaWYgKCF0eXBlKSB0aHJvdyBuZXcgRXJyb3IoJ3R5cGUgaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAoIWNvb3JkaW5hdGVzKSB0aHJvdyBuZXcgRXJyb3IoJ2Nvb3JkaW5hdGVzIGlzIHJlcXVpcmVkJyk7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGNvb3JkaW5hdGVzKSkgdGhyb3cgbmV3IEVycm9yKCdjb29yZGluYXRlcyBtdXN0IGJlIGFuIEFycmF5Jyk7XG4gICAgaWYgKGJib3ggJiYgYmJveC5sZW5ndGggIT09IDQpIHRocm93IG5ldyBFcnJvcignYmJveCBtdXN0IGJlIGFuIEFycmF5IG9mIDQgbnVtYmVycycpO1xuXG4gICAgdmFyIGdlb207XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAnUG9pbnQnOiBnZW9tID0gcG9pbnQoY29vcmRpbmF0ZXMpLmdlb21ldHJ5OyBicmVhaztcbiAgICBjYXNlICdMaW5lU3RyaW5nJzogZ2VvbSA9IGxpbmVTdHJpbmcoY29vcmRpbmF0ZXMpLmdlb21ldHJ5OyBicmVhaztcbiAgICBjYXNlICdQb2x5Z29uJzogZ2VvbSA9IHBvbHlnb24oY29vcmRpbmF0ZXMpLmdlb21ldHJ5OyBicmVhaztcbiAgICBjYXNlICdNdWx0aVBvaW50JzogZ2VvbSA9IG11bHRpUG9pbnQoY29vcmRpbmF0ZXMpLmdlb21ldHJ5OyBicmVhaztcbiAgICBjYXNlICdNdWx0aUxpbmVTdHJpbmcnOiBnZW9tID0gbXVsdGlMaW5lU3RyaW5nKGNvb3JkaW5hdGVzKS5nZW9tZXRyeTsgYnJlYWs7XG4gICAgY2FzZSAnTXVsdGlQb2x5Z29uJzogZ2VvbSA9IG11bHRpUG9seWdvbihjb29yZGluYXRlcykuZ2VvbWV0cnk7IGJyZWFrO1xuICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcih0eXBlICsgJyBpcyBpbnZhbGlkJyk7XG4gICAgfVxuICAgIGlmIChiYm94KSBnZW9tLmJib3ggPSBiYm94O1xuICAgIHJldHVybiBnZW9tO1xufVxuXG4vKipcbiAqIFRha2VzIGNvb3JkaW5hdGVzIGFuZCBwcm9wZXJ0aWVzIChvcHRpb25hbCkgYW5kIHJldHVybnMgYSBuZXcge0BsaW5rIFBvaW50fSBmZWF0dXJlLlxuICpcbiAqIEBuYW1lIHBvaW50XG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IGNvb3JkaW5hdGVzIGxvbmdpdHVkZSwgbGF0aXR1ZGUgcG9zaXRpb24gKGVhY2ggaW4gZGVjaW1hbCBkZWdyZWVzKVxuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtpZF0gSWRlbnRpZmllclxuICogQHJldHVybnMge0ZlYXR1cmU8UG9pbnQ+fSBhIFBvaW50IGZlYXR1cmVcbiAqIEBleGFtcGxlXG4gKiB2YXIgcG9pbnQgPSB0dXJmLnBvaW50KFstNzUuMzQzLCAzOS45ODRdKTtcbiAqXG4gKiAvLz1wb2ludFxuICovXG5leHBvcnQgZnVuY3Rpb24gcG9pbnQoY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFjb29yZGluYXRlcykgdGhyb3cgbmV3IEVycm9yKCdObyBjb29yZGluYXRlcyBwYXNzZWQnKTtcbiAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcignQ29vcmRpbmF0ZXMgbXVzdCBiZSBhbiBhcnJheScpO1xuICAgIGlmIChjb29yZGluYXRlcy5sZW5ndGggPCAyKSB0aHJvdyBuZXcgRXJyb3IoJ0Nvb3JkaW5hdGVzIG11c3QgYmUgYXQgbGVhc3QgMiBudW1iZXJzIGxvbmcnKTtcbiAgICBpZiAoIWlzTnVtYmVyKGNvb3JkaW5hdGVzWzBdKSB8fCAhaXNOdW1iZXIoY29vcmRpbmF0ZXNbMV0pKSB0aHJvdyBuZXcgRXJyb3IoJ0Nvb3JkaW5hdGVzIG11c3QgY29udGFpbiBudW1iZXJzJyk7XG5cbiAgICByZXR1cm4gZmVhdHVyZSh7XG4gICAgICAgIHR5cGU6ICdQb2ludCcsXG4gICAgICAgIGNvb3JkaW5hdGVzOiBjb29yZGluYXRlc1xuICAgIH0sIHByb3BlcnRpZXMsIGJib3gsIGlkKTtcbn1cblxuLyoqXG4gKiBUYWtlcyBhbiBhcnJheSBvZiBMaW5lYXJSaW5ncyBhbmQgb3B0aW9uYWxseSBhbiB7QGxpbmsgT2JqZWN0fSB3aXRoIHByb3BlcnRpZXMgYW5kIHJldHVybnMgYSB7QGxpbmsgUG9seWdvbn0gZmVhdHVyZS5cbiAqXG4gKiBAbmFtZSBwb2x5Z29uXG4gKiBAcGFyYW0ge0FycmF5PEFycmF5PEFycmF5PG51bWJlcj4+Pn0gY29vcmRpbmF0ZXMgYW4gYXJyYXkgb2YgTGluZWFyUmluZ3NcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV0gYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlPFBvbHlnb24+fSBhIFBvbHlnb24gZmVhdHVyZVxuICogQHRocm93cyB7RXJyb3J9IHRocm93IGFuIGVycm9yIGlmIGEgTGluZWFyUmluZyBvZiB0aGUgcG9seWdvbiBoYXMgdG9vIGZldyBwb3NpdGlvbnNcbiAqIG9yIGlmIGEgTGluZWFyUmluZyBvZiB0aGUgUG9seWdvbiBkb2VzIG5vdCBoYXZlIG1hdGNoaW5nIFBvc2l0aW9ucyBhdCB0aGUgYmVnaW5uaW5nICYgZW5kLlxuICogQGV4YW1wbGVcbiAqIHZhciBwb2x5Z29uID0gdHVyZi5wb2x5Z29uKFtbXG4gKiAgIFstMi4yNzU1NDMsIDUzLjQ2NDU0N10sXG4gKiAgIFstMi4yNzU1NDMsIDUzLjQ4OTI3MV0sXG4gKiAgIFstMi4yMTUxMTgsIDUzLjQ4OTI3MV0sXG4gKiAgIFstMi4yMTUxMTgsIDUzLjQ2NDU0N10sXG4gKiAgIFstMi4yNzU1NDMsIDUzLjQ2NDU0N11cbiAqIF1dLCB7IG5hbWU6ICdwb2x5MScsIHBvcHVsYXRpb246IDQwMH0pO1xuICpcbiAqIC8vPXBvbHlnb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBvbHlnb24oY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFjb29yZGluYXRlcykgdGhyb3cgbmV3IEVycm9yKCdObyBjb29yZGluYXRlcyBwYXNzZWQnKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRpbmF0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHJpbmcgPSBjb29yZGluYXRlc1tpXTtcbiAgICAgICAgaWYgKHJpbmcubGVuZ3RoIDwgNCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFYWNoIExpbmVhclJpbmcgb2YgYSBQb2x5Z29uIG11c3QgaGF2ZSA0IG9yIG1vcmUgUG9zaXRpb25zLicpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcmluZ1tyaW5nLmxlbmd0aCAtIDFdLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiBmaXJzdCBwb2ludCBvZiBQb2x5Z29uIGNvbnRhaW5zIHR3byBudW1iZXJzXG4gICAgICAgICAgICBpZiAoaSA9PT0gMCAmJiBqID09PSAwICYmICFpc051bWJlcihyaW5nWzBdWzBdKSB8fCAhaXNOdW1iZXIocmluZ1swXVsxXSkpIHRocm93IG5ldyBFcnJvcignQ29vcmRpbmF0ZXMgbXVzdCBjb250YWluIG51bWJlcnMnKTtcbiAgICAgICAgICAgIGlmIChyaW5nW3JpbmcubGVuZ3RoIC0gMV1bal0gIT09IHJpbmdbMF1bal0pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFuZCBsYXN0IFBvc2l0aW9uIGFyZSBub3QgZXF1aXZhbGVudC4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ1BvbHlnb24nLFxuICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXNcbiAgICB9LCBwcm9wZXJ0aWVzLCBiYm94LCBpZCk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHtAbGluayBMaW5lU3RyaW5nfSBiYXNlZCBvbiBhXG4gKiBjb29yZGluYXRlIGFycmF5LiBQcm9wZXJ0aWVzIGNhbiBiZSBhZGRlZCBvcHRpb25hbGx5LlxuICpcbiAqIEBuYW1lIGxpbmVTdHJpbmdcbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk8bnVtYmVyPj59IGNvb3JkaW5hdGVzIGFuIGFycmF5IG9mIFBvc2l0aW9uc1xuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtpZF0gSWRlbnRpZmllclxuICogQHJldHVybnMge0ZlYXR1cmU8TGluZVN0cmluZz59IGEgTGluZVN0cmluZyBmZWF0dXJlXG4gKiBAdGhyb3dzIHtFcnJvcn0gaWYgbm8gY29vcmRpbmF0ZXMgYXJlIHBhc3NlZFxuICogQGV4YW1wbGVcbiAqIHZhciBsaW5lc3RyaW5nMSA9IHR1cmYubGluZVN0cmluZyhbXG4gKiAgIFstMjEuOTY0NDE2LCA2NC4xNDgyMDNdLFxuICogICBbLTIxLjk1NjE3NiwgNjQuMTQxMzE2XSxcbiAqICAgWy0yMS45MzkwMSwgNjQuMTM1OTI0XSxcbiAqICAgWy0yMS45MjczMzcsIDY0LjEzNjY3M11cbiAqIF0pO1xuICogdmFyIGxpbmVzdHJpbmcyID0gdHVyZi5saW5lU3RyaW5nKFtcbiAqICAgWy0yMS45MjkwNTQsIDY0LjEyNzk4NV0sXG4gKiAgIFstMjEuOTEyOTE4LCA2NC4xMzQ3MjZdLFxuICogICBbLTIxLjkxNjAwNywgNjQuMTQxMDE2XSxcbiAqICAgWy0yMS45MzAwODQsIDY0LjE0NDQ2XVxuICogXSwge25hbWU6ICdsaW5lIDEnLCBkaXN0YW5jZTogMTQ1fSk7XG4gKlxuICogLy89bGluZXN0cmluZzFcbiAqXG4gKiAvLz1saW5lc3RyaW5nMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbGluZVN0cmluZyhjb29yZGluYXRlcywgcHJvcGVydGllcywgYmJveCwgaWQpIHtcbiAgICBpZiAoIWNvb3JkaW5hdGVzKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGNvb3JkaW5hdGVzIHBhc3NlZCcpO1xuICAgIGlmIChjb29yZGluYXRlcy5sZW5ndGggPCAyKSB0aHJvdyBuZXcgRXJyb3IoJ0Nvb3JkaW5hdGVzIG11c3QgYmUgYW4gYXJyYXkgb2YgdHdvIG9yIG1vcmUgcG9zaXRpb25zJyk7XG4gICAgLy8gQ2hlY2sgaWYgZmlyc3QgcG9pbnQgb2YgTGluZVN0cmluZyBjb250YWlucyB0d28gbnVtYmVyc1xuICAgIGlmICghaXNOdW1iZXIoY29vcmRpbmF0ZXNbMF1bMV0pIHx8ICFpc051bWJlcihjb29yZGluYXRlc1swXVsxXSkpIHRocm93IG5ldyBFcnJvcignQ29vcmRpbmF0ZXMgbXVzdCBjb250YWluIG51bWJlcnMnKTtcblxuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ0xpbmVTdHJpbmcnLFxuICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXNcbiAgICB9LCBwcm9wZXJ0aWVzLCBiYm94LCBpZCk7XG59XG5cbi8qKlxuICogVGFrZXMgb25lIG9yIG1vcmUge0BsaW5rIEZlYXR1cmV8RmVhdHVyZXN9IGFuZCBjcmVhdGVzIGEge0BsaW5rIEZlYXR1cmVDb2xsZWN0aW9ufS5cbiAqXG4gKiBAbmFtZSBmZWF0dXJlQ29sbGVjdGlvblxuICogQHBhcmFtIHtGZWF0dXJlW119IGZlYXR1cmVzIGlucHV0IGZlYXR1cmVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtpZF0gSWRlbnRpZmllclxuICogQHJldHVybnMge0ZlYXR1cmVDb2xsZWN0aW9ufSBhIEZlYXR1cmVDb2xsZWN0aW9uIG9mIGlucHV0IGZlYXR1cmVzXG4gKiBAZXhhbXBsZVxuICogdmFyIGZlYXR1cmVzID0gW1xuICogIHR1cmYucG9pbnQoWy03NS4zNDMsIDM5Ljk4NF0sIHtuYW1lOiAnTG9jYXRpb24gQSd9KSxcbiAqICB0dXJmLnBvaW50KFstNzUuODMzLCAzOS4yODRdLCB7bmFtZTogJ0xvY2F0aW9uIEInfSksXG4gKiAgdHVyZi5wb2ludChbLTc1LjUzNCwgMzkuMTIzXSwge25hbWU6ICdMb2NhdGlvbiBDJ30pXG4gKiBdO1xuICpcbiAqIHZhciBjb2xsZWN0aW9uID0gdHVyZi5mZWF0dXJlQ29sbGVjdGlvbihmZWF0dXJlcyk7XG4gKlxuICogLy89Y29sbGVjdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZmVhdHVyZUNvbGxlY3Rpb24oZmVhdHVyZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFmZWF0dXJlcykgdGhyb3cgbmV3IEVycm9yKCdObyBmZWF0dXJlcyBwYXNzZWQnKTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZmVhdHVyZXMpKSB0aHJvdyBuZXcgRXJyb3IoJ2ZlYXR1cmVzIG11c3QgYmUgYW4gQXJyYXknKTtcbiAgICBpZiAoYmJveCAmJiBiYm94Lmxlbmd0aCAhPT0gNCkgdGhyb3cgbmV3IEVycm9yKCdiYm94IG11c3QgYmUgYW4gQXJyYXkgb2YgNCBudW1iZXJzJyk7XG4gICAgaWYgKGlkICYmIFsnc3RyaW5nJywgJ251bWJlciddLmluZGV4T2YodHlwZW9mIGlkKSA9PT0gLTEpIHRocm93IG5ldyBFcnJvcignaWQgbXVzdCBiZSBhIG51bWJlciBvciBhIHN0cmluZycpO1xuXG4gICAgdmFyIGZjID0ge3R5cGU6ICdGZWF0dXJlQ29sbGVjdGlvbid9O1xuICAgIGlmIChpZCkgZmMuaWQgPSBpZDtcbiAgICBpZiAoYmJveCkgZmMuYmJveCA9IGJib3g7XG4gICAgZmMuZmVhdHVyZXMgPSBmZWF0dXJlcztcbiAgICByZXR1cm4gZmM7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHtAbGluayBGZWF0dXJlPE11bHRpTGluZVN0cmluZz59IGJhc2VkIG9uIGFcbiAqIGNvb3JkaW5hdGUgYXJyYXkuIFByb3BlcnRpZXMgY2FuIGJlIGFkZGVkIG9wdGlvbmFsbHkuXG4gKlxuICogQG5hbWUgbXVsdGlMaW5lU3RyaW5nXG4gKiBAcGFyYW0ge0FycmF5PEFycmF5PEFycmF5PG51bWJlcj4+Pn0gY29vcmRpbmF0ZXMgYW4gYXJyYXkgb2YgTGluZVN0cmluZ3NcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV0gYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlPE11bHRpTGluZVN0cmluZz59IGEgTXVsdGlMaW5lU3RyaW5nIGZlYXR1cmVcbiAqIEB0aHJvd3Mge0Vycm9yfSBpZiBubyBjb29yZGluYXRlcyBhcmUgcGFzc2VkXG4gKiBAZXhhbXBsZVxuICogdmFyIG11bHRpTGluZSA9IHR1cmYubXVsdGlMaW5lU3RyaW5nKFtbWzAsMF0sWzEwLDEwXV1dKTtcbiAqXG4gKiAvLz1tdWx0aUxpbmVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpTGluZVN0cmluZyhjb29yZGluYXRlcywgcHJvcGVydGllcywgYmJveCwgaWQpIHtcbiAgICBpZiAoIWNvb3JkaW5hdGVzKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGNvb3JkaW5hdGVzIHBhc3NlZCcpO1xuXG4gICAgcmV0dXJuIGZlYXR1cmUoe1xuICAgICAgICB0eXBlOiAnTXVsdGlMaW5lU3RyaW5nJyxcbiAgICAgICAgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzXG4gICAgfSwgcHJvcGVydGllcywgYmJveCwgaWQpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgRmVhdHVyZTxNdWx0aVBvaW50Pn0gYmFzZWQgb24gYVxuICogY29vcmRpbmF0ZSBhcnJheS4gUHJvcGVydGllcyBjYW4gYmUgYWRkZWQgb3B0aW9uYWxseS5cbiAqXG4gKiBAbmFtZSBtdWx0aVBvaW50XG4gKiBAcGFyYW0ge0FycmF5PEFycmF5PG51bWJlcj4+fSBjb29yZGluYXRlcyBhbiBhcnJheSBvZiBQb3NpdGlvbnNcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV0gYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlPE11bHRpUG9pbnQ+fSBhIE11bHRpUG9pbnQgZmVhdHVyZVxuICogQHRocm93cyB7RXJyb3J9IGlmIG5vIGNvb3JkaW5hdGVzIGFyZSBwYXNzZWRcbiAqIEBleGFtcGxlXG4gKiB2YXIgbXVsdGlQdCA9IHR1cmYubXVsdGlQb2ludChbWzAsMF0sWzEwLDEwXV0pO1xuICpcbiAqIC8vPW11bHRpUHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpUG9pbnQoY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFjb29yZGluYXRlcykgdGhyb3cgbmV3IEVycm9yKCdObyBjb29yZGluYXRlcyBwYXNzZWQnKTtcblxuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ011bHRpUG9pbnQnLFxuICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXNcbiAgICB9LCBwcm9wZXJ0aWVzLCBiYm94LCBpZCk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHtAbGluayBGZWF0dXJlPE11bHRpUG9seWdvbj59IGJhc2VkIG9uIGFcbiAqIGNvb3JkaW5hdGUgYXJyYXkuIFByb3BlcnRpZXMgY2FuIGJlIGFkZGVkIG9wdGlvbmFsbHkuXG4gKlxuICogQG5hbWUgbXVsdGlQb2x5Z29uXG4gKiBAcGFyYW0ge0FycmF5PEFycmF5PEFycmF5PEFycmF5PG51bWJlcj4+Pj59IGNvb3JkaW5hdGVzIGFuIGFycmF5IG9mIFBvbHlnb25zXG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2lkXSBJZGVudGlmaWVyXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxNdWx0aVBvbHlnb24+fSBhIG11bHRpcG9seWdvbiBmZWF0dXJlXG4gKiBAdGhyb3dzIHtFcnJvcn0gaWYgbm8gY29vcmRpbmF0ZXMgYXJlIHBhc3NlZFxuICogQGV4YW1wbGVcbiAqIHZhciBtdWx0aVBvbHkgPSB0dXJmLm11bHRpUG9seWdvbihbW1tbMCwwXSxbMCwxMF0sWzEwLDEwXSxbMTAsMF0sWzAsMF1dXV0pO1xuICpcbiAqIC8vPW11bHRpUG9seVxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpUG9seWdvbihjb29yZGluYXRlcywgcHJvcGVydGllcywgYmJveCwgaWQpIHtcbiAgICBpZiAoIWNvb3JkaW5hdGVzKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGNvb3JkaW5hdGVzIHBhc3NlZCcpO1xuXG4gICAgcmV0dXJuIGZlYXR1cmUoe1xuICAgICAgICB0eXBlOiAnTXVsdGlQb2x5Z29uJyxcbiAgICAgICAgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzXG4gICAgfSwgcHJvcGVydGllcywgYmJveCwgaWQpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgRmVhdHVyZTxHZW9tZXRyeUNvbGxlY3Rpb24+fSBiYXNlZCBvbiBhXG4gKiBjb29yZGluYXRlIGFycmF5LiBQcm9wZXJ0aWVzIGNhbiBiZSBhZGRlZCBvcHRpb25hbGx5LlxuICpcbiAqIEBuYW1lIGdlb21ldHJ5Q29sbGVjdGlvblxuICogQHBhcmFtIHtBcnJheTxHZW9tZXRyeT59IGdlb21ldHJpZXMgYW4gYXJyYXkgb2YgR2VvSlNPTiBHZW9tZXRyaWVzXG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2lkXSBJZGVudGlmaWVyXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxHZW9tZXRyeUNvbGxlY3Rpb24+fSBhIEdlb0pTT04gR2VvbWV0cnlDb2xsZWN0aW9uIEZlYXR1cmVcbiAqIEBleGFtcGxlXG4gKiB2YXIgcHQgPSB7XG4gKiAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAqICAgICAgIFwiY29vcmRpbmF0ZXNcIjogWzEwMCwgMF1cbiAqICAgICB9O1xuICogdmFyIGxpbmUgPSB7XG4gKiAgICAgXCJ0eXBlXCI6IFwiTGluZVN0cmluZ1wiLFxuICogICAgIFwiY29vcmRpbmF0ZXNcIjogWyBbMTAxLCAwXSwgWzEwMiwgMV0gXVxuICogICB9O1xuICogdmFyIGNvbGxlY3Rpb24gPSB0dXJmLmdlb21ldHJ5Q29sbGVjdGlvbihbcHQsIGxpbmVdKTtcbiAqXG4gKiAvLz1jb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW9tZXRyeUNvbGxlY3Rpb24oZ2VvbWV0cmllcywgcHJvcGVydGllcywgYmJveCwgaWQpIHtcbiAgICBpZiAoIWdlb21ldHJpZXMpIHRocm93IG5ldyBFcnJvcignZ2VvbWV0cmllcyBpcyByZXF1aXJlZCcpO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShnZW9tZXRyaWVzKSkgdGhyb3cgbmV3IEVycm9yKCdnZW9tZXRyaWVzIG11c3QgYmUgYW4gQXJyYXknKTtcblxuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ0dlb21ldHJ5Q29sbGVjdGlvbicsXG4gICAgICAgIGdlb21ldHJpZXM6IGdlb21ldHJpZXNcbiAgICB9LCBwcm9wZXJ0aWVzLCBiYm94LCBpZCk7XG59XG5cbi8qKlxuICogUm91bmQgbnVtYmVyIHRvIHByZWNpc2lvblxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBudW0gTnVtYmVyXG4gKiBAcGFyYW0ge251bWJlcn0gW3ByZWNpc2lvbj0wXSBQcmVjaXNpb25cbiAqIEByZXR1cm5zIHtudW1iZXJ9IHJvdW5kZWQgbnVtYmVyXG4gKiBAZXhhbXBsZVxuICogdHVyZi5yb3VuZCgxMjAuNDMyMSlcbiAqIC8vPTEyMFxuICpcbiAqIHR1cmYucm91bmQoMTIwLjQzMjEsIDIpXG4gKiAvLz0xMjAuNDNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdW5kKG51bSwgcHJlY2lzaW9uKSB7XG4gICAgaWYgKG51bSA9PT0gdW5kZWZpbmVkIHx8IG51bSA9PT0gbnVsbCB8fCBpc05hTihudW0pKSB0aHJvdyBuZXcgRXJyb3IoJ251bSBpcyByZXF1aXJlZCcpO1xuICAgIGlmIChwcmVjaXNpb24gJiYgIShwcmVjaXNpb24gPj0gMCkpIHRocm93IG5ldyBFcnJvcigncHJlY2lzaW9uIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgICB2YXIgbXVsdGlwbGllciA9IE1hdGgucG93KDEwLCBwcmVjaXNpb24gfHwgMCk7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobnVtICogbXVsdGlwbGllcikgLyBtdWx0aXBsaWVyO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBkaXN0YW5jZSBtZWFzdXJlbWVudCAoYXNzdW1pbmcgYSBzcGhlcmljYWwgRWFydGgpIGZyb20gcmFkaWFucyB0byBhIG1vcmUgZnJpZW5kbHkgdW5pdC5cbiAqIFZhbGlkIHVuaXRzOiBtaWxlcywgbmF1dGljYWxtaWxlcywgaW5jaGVzLCB5YXJkcywgbWV0ZXJzLCBtZXRyZXMsIGtpbG9tZXRlcnMsIGNlbnRpbWV0ZXJzLCBmZWV0XG4gKlxuICogQG5hbWUgcmFkaWFuc1RvRGlzdGFuY2VcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWRpYW5zIGluIHJhZGlhbnMgYWNyb3NzIHRoZSBzcGhlcmVcbiAqIEBwYXJhbSB7c3RyaW5nfSBbdW5pdHM9J2tpbG9tZXRlcnMnXSBjYW4gYmUgZGVncmVlcywgcmFkaWFucywgbWlsZXMsIG9yIGtpbG9tZXRlcnMgaW5jaGVzLCB5YXJkcywgbWV0cmVzLCBtZXRlcnMsIGtpbG9tZXRyZXMsIGtpbG9tZXRlcnMuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBkaXN0YW5jZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmFkaWFuc1RvRGlzdGFuY2UocmFkaWFucywgdW5pdHMpIHtcbiAgICBpZiAocmFkaWFucyA9PT0gdW5kZWZpbmVkIHx8IHJhZGlhbnMgPT09IG51bGwpIHRocm93IG5ldyBFcnJvcigncmFkaWFucyBpcyByZXF1aXJlZCcpO1xuXG4gICAgaWYgKHVuaXRzICYmIHR5cGVvZiB1bml0cyAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcigndW5pdHMgbXVzdCBiZSBhIHN0cmluZycpO1xuICAgIHZhciBmYWN0b3IgPSBmYWN0b3JzW3VuaXRzIHx8ICdraWxvbWV0ZXJzJ107XG4gICAgaWYgKCFmYWN0b3IpIHRocm93IG5ldyBFcnJvcih1bml0cyArICcgdW5pdHMgaXMgaW52YWxpZCcpO1xuICAgIHJldHVybiByYWRpYW5zICogZmFjdG9yO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBkaXN0YW5jZSBtZWFzdXJlbWVudCAoYXNzdW1pbmcgYSBzcGhlcmljYWwgRWFydGgpIGZyb20gYSByZWFsLXdvcmxkIHVuaXQgaW50byByYWRpYW5zXG4gKiBWYWxpZCB1bml0czogbWlsZXMsIG5hdXRpY2FsbWlsZXMsIGluY2hlcywgeWFyZHMsIG1ldGVycywgbWV0cmVzLCBraWxvbWV0ZXJzLCBjZW50aW1ldGVycywgZmVldFxuICpcbiAqIEBuYW1lIGRpc3RhbmNlVG9SYWRpYW5zXG4gKiBAcGFyYW0ge251bWJlcn0gZGlzdGFuY2UgaW4gcmVhbCB1bml0c1xuICogQHBhcmFtIHtzdHJpbmd9IFt1bml0cz0na2lsb21ldGVycyddIGNhbiBiZSBkZWdyZWVzLCByYWRpYW5zLCBtaWxlcywgb3Iga2lsb21ldGVycyBpbmNoZXMsIHlhcmRzLCBtZXRyZXMsIG1ldGVycywga2lsb21ldHJlcywga2lsb21ldGVycy5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IHJhZGlhbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3RhbmNlVG9SYWRpYW5zKGRpc3RhbmNlLCB1bml0cykge1xuICAgIGlmIChkaXN0YW5jZSA9PT0gdW5kZWZpbmVkIHx8IGRpc3RhbmNlID09PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoJ2Rpc3RhbmNlIGlzIHJlcXVpcmVkJyk7XG5cbiAgICBpZiAodW5pdHMgJiYgdHlwZW9mIHVuaXRzICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCd1bml0cyBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgdmFyIGZhY3RvciA9IGZhY3RvcnNbdW5pdHMgfHwgJ2tpbG9tZXRlcnMnXTtcbiAgICBpZiAoIWZhY3RvcikgdGhyb3cgbmV3IEVycm9yKHVuaXRzICsgJyB1bml0cyBpcyBpbnZhbGlkJyk7XG4gICAgcmV0dXJuIGRpc3RhbmNlIC8gZmFjdG9yO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBkaXN0YW5jZSBtZWFzdXJlbWVudCAoYXNzdW1pbmcgYSBzcGhlcmljYWwgRWFydGgpIGZyb20gYSByZWFsLXdvcmxkIHVuaXQgaW50byBkZWdyZWVzXG4gKiBWYWxpZCB1bml0czogbWlsZXMsIG5hdXRpY2FsbWlsZXMsIGluY2hlcywgeWFyZHMsIG1ldGVycywgbWV0cmVzLCBjZW50aW1ldGVycywga2lsb21ldHJlcywgZmVldFxuICpcbiAqIEBuYW1lIGRpc3RhbmNlVG9EZWdyZWVzXG4gKiBAcGFyYW0ge251bWJlcn0gZGlzdGFuY2UgaW4gcmVhbCB1bml0c1xuICogQHBhcmFtIHtzdHJpbmd9IFt1bml0cz0na2lsb21ldGVycyddIGNhbiBiZSBkZWdyZWVzLCByYWRpYW5zLCBtaWxlcywgb3Iga2lsb21ldGVycyBpbmNoZXMsIHlhcmRzLCBtZXRyZXMsIG1ldGVycywga2lsb21ldHJlcywga2lsb21ldGVycy5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IGRlZ3JlZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3RhbmNlVG9EZWdyZWVzKGRpc3RhbmNlLCB1bml0cykge1xuICAgIHJldHVybiByYWRpYW5zMmRlZ3JlZXMoZGlzdGFuY2VUb1JhZGlhbnMoZGlzdGFuY2UsIHVuaXRzKSk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYW55IGJlYXJpbmcgYW5nbGUgZnJvbSB0aGUgbm9ydGggbGluZSBkaXJlY3Rpb24gKHBvc2l0aXZlIGNsb2Nrd2lzZSlcbiAqIGFuZCByZXR1cm5zIGFuIGFuZ2xlIGJldHdlZW4gMC0zNjAgZGVncmVlcyAocG9zaXRpdmUgY2xvY2t3aXNlKSwgMCBiZWluZyB0aGUgbm9ydGggbGluZVxuICpcbiAqIEBuYW1lIGJlYXJpbmdUb0FuZ2xlXG4gKiBAcGFyYW0ge251bWJlcn0gYmVhcmluZyBhbmdsZSwgYmV0d2VlbiAtMTgwIGFuZCArMTgwIGRlZ3JlZXNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGFuZ2xlIGJldHdlZW4gMCBhbmQgMzYwIGRlZ3JlZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJlYXJpbmdUb0FuZ2xlKGJlYXJpbmcpIHtcbiAgICBpZiAoYmVhcmluZyA9PT0gbnVsbCB8fCBiZWFyaW5nID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcignYmVhcmluZyBpcyByZXF1aXJlZCcpO1xuXG4gICAgdmFyIGFuZ2xlID0gYmVhcmluZyAlIDM2MDtcbiAgICBpZiAoYW5nbGUgPCAwKSBhbmdsZSArPSAzNjA7XG4gICAgcmV0dXJuIGFuZ2xlO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGFuIGFuZ2xlIGluIHJhZGlhbnMgdG8gZGVncmVlc1xuICpcbiAqIEBuYW1lIHJhZGlhbnMyZGVncmVlc1xuICogQHBhcmFtIHtudW1iZXJ9IHJhZGlhbnMgYW5nbGUgaW4gcmFkaWFuc1xuICogQHJldHVybnMge251bWJlcn0gZGVncmVlcyBiZXR3ZWVuIDAgYW5kIDM2MCBkZWdyZWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByYWRpYW5zMmRlZ3JlZXMocmFkaWFucykge1xuICAgIGlmIChyYWRpYW5zID09PSBudWxsIHx8IHJhZGlhbnMgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKCdyYWRpYW5zIGlzIHJlcXVpcmVkJyk7XG5cbiAgICB2YXIgZGVncmVlcyA9IHJhZGlhbnMgJSAoMiAqIE1hdGguUEkpO1xuICAgIHJldHVybiBkZWdyZWVzICogMTgwIC8gTWF0aC5QSTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhbiBhbmdsZSBpbiBkZWdyZWVzIHRvIHJhZGlhbnNcbiAqXG4gKiBAbmFtZSBkZWdyZWVzMnJhZGlhbnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBkZWdyZWVzIGFuZ2xlIGJldHdlZW4gMCBhbmQgMzYwIGRlZ3JlZXNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGFuZ2xlIGluIHJhZGlhbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZ3JlZXMycmFkaWFucyhkZWdyZWVzKSB7XG4gICAgaWYgKGRlZ3JlZXMgPT09IG51bGwgfHwgZGVncmVlcyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoJ2RlZ3JlZXMgaXMgcmVxdWlyZWQnKTtcblxuICAgIHZhciByYWRpYW5zID0gZGVncmVlcyAlIDM2MDtcbiAgICByZXR1cm4gcmFkaWFucyAqIE1hdGguUEkgLyAxODA7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBkaXN0YW5jZSB0byB0aGUgcmVxdWVzdGVkIHVuaXQuXG4gKiBWYWxpZCB1bml0czogbWlsZXMsIG5hdXRpY2FsbWlsZXMsIGluY2hlcywgeWFyZHMsIG1ldGVycywgbWV0cmVzLCBraWxvbWV0ZXJzLCBjZW50aW1ldGVycywgZmVldFxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBkaXN0YW5jZSB0byBiZSBjb252ZXJ0ZWRcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcmlnaW5hbFVuaXQgb2YgdGhlIGRpc3RhbmNlXG4gKiBAcGFyYW0ge3N0cmluZ30gW2ZpbmFsVW5pdD0na2lsb21ldGVycyddIHJldHVybmVkIHVuaXRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHRoZSBjb252ZXJ0ZWQgZGlzdGFuY2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnREaXN0YW5jZShkaXN0YW5jZSwgb3JpZ2luYWxVbml0LCBmaW5hbFVuaXQpIHtcbiAgICBpZiAoZGlzdGFuY2UgPT09IG51bGwgfHwgZGlzdGFuY2UgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKCdkaXN0YW5jZSBpcyByZXF1aXJlZCcpO1xuICAgIGlmICghKGRpc3RhbmNlID49IDApKSB0aHJvdyBuZXcgRXJyb3IoJ2Rpc3RhbmNlIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcblxuICAgIHZhciBjb252ZXJ0ZWREaXN0YW5jZSA9IHJhZGlhbnNUb0Rpc3RhbmNlKGRpc3RhbmNlVG9SYWRpYW5zKGRpc3RhbmNlLCBvcmlnaW5hbFVuaXQpLCBmaW5hbFVuaXQgfHwgJ2tpbG9tZXRlcnMnKTtcbiAgICByZXR1cm4gY29udmVydGVkRGlzdGFuY2U7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBhcmVhIHRvIHRoZSByZXF1ZXN0ZWQgdW5pdC5cbiAqIFZhbGlkIHVuaXRzOiBraWxvbWV0ZXJzLCBraWxvbWV0cmVzLCBtZXRlcnMsIG1ldHJlcywgY2VudGltZXRyZXMsIG1pbGxpbWV0ZXIsIGFjcmUsIG1pbGUsIHlhcmQsIGZvb3QsIGluY2hcbiAqIEBwYXJhbSB7bnVtYmVyfSBhcmVhIHRvIGJlIGNvbnZlcnRlZFxuICogQHBhcmFtIHtzdHJpbmd9IFtvcmlnaW5hbFVuaXQ9J21ldGVycyddIG9mIHRoZSBkaXN0YW5jZVxuICogQHBhcmFtIHtzdHJpbmd9IFtmaW5hbFVuaXQ9J2tpbG9tZXRlcnMnXSByZXR1cm5lZCB1bml0XG4gKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgY29udmVydGVkIGRpc3RhbmNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0QXJlYShhcmVhLCBvcmlnaW5hbFVuaXQsIGZpbmFsVW5pdCkge1xuICAgIGlmIChhcmVhID09PSBudWxsIHx8IGFyZWEgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKCdhcmVhIGlzIHJlcXVpcmVkJyk7XG4gICAgaWYgKCEoYXJlYSA+PSAwKSkgdGhyb3cgbmV3IEVycm9yKCdhcmVhIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcblxuICAgIHZhciBzdGFydEZhY3RvciA9IGFyZWFGYWN0b3JzW29yaWdpbmFsVW5pdCB8fCAnbWV0ZXJzJ107XG4gICAgaWYgKCFzdGFydEZhY3RvcikgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIG9yaWdpbmFsIHVuaXRzJyk7XG5cbiAgICB2YXIgZmluYWxGYWN0b3IgPSBhcmVhRmFjdG9yc1tmaW5hbFVuaXQgfHwgJ2tpbG9tZXRlcnMnXTtcbiAgICBpZiAoIWZpbmFsRmFjdG9yKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZmluYWwgdW5pdHMnKTtcblxuICAgIHJldHVybiAoYXJlYSAvIHN0YXJ0RmFjdG9yKSAqIGZpbmFsRmFjdG9yO1xufVxuXG4vKipcbiAqIGlzTnVtYmVyXG4gKlxuICogQHBhcmFtIHsqfSBudW0gTnVtYmVyIHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZS9mYWxzZVxuICogQGV4YW1wbGVcbiAqIHR1cmYuaXNOdW1iZXIoMTIzKVxuICogLy89dHJ1ZVxuICogdHVyZi5pc051bWJlcignZm9vJylcbiAqIC8vPWZhbHNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc051bWJlcihudW0pIHtcbiAgICByZXR1cm4gIWlzTmFOKG51bSkgJiYgbnVtICE9PSBudWxsICYmICFBcnJheS5pc0FycmF5KG51bSk7XG59XG5cbi8qKlxuICogaXNPYmplY3RcbiAqXG4gKiBAcGFyYW0geyp9IGlucHV0IHZhcmlhYmxlIHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZS9mYWxzZVxuICogQGV4YW1wbGVcbiAqIHR1cmYuaXNPYmplY3Qoe2VsZXZhdGlvbjogMTB9KVxuICogLy89dHJ1ZVxuICogdHVyZi5pc09iamVjdCgnZm9vJylcbiAqIC8vPWZhbHNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdChpbnB1dCkge1xuICAgIHJldHVybiAoISFpbnB1dCkgJiYgKGlucHV0LmNvbnN0cnVjdG9yID09PSBPYmplY3QpO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQHR1cmYvaGVscGVycy9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMjhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGluc2lkZSA9IHJlcXVpcmUoJ0B0dXJmL2luc2lkZScpO1xudmFyIGZlYXR1cmVDb2xsZWN0aW9uID0gcmVxdWlyZSgnQHR1cmYvaGVscGVycycpLmZlYXR1cmVDb2xsZWN0aW9uO1xuXG4vKipcbiAqIFRha2VzIGEgc2V0IG9mIHtAbGluayBQb2ludHxwb2ludHN9IGFuZCBhIHNldCBvZiB7QGxpbmsgUG9seWdvbnxwb2x5Z29uc30gYW5kIHJldHVybnMgdGhlIHBvaW50cyB0aGF0IGZhbGwgd2l0aGluIHRoZSBwb2x5Z29ucy5cbiAqXG4gKiBAbmFtZSB3aXRoaW5cbiAqIEBwYXJhbSB7RmVhdHVyZUNvbGxlY3Rpb248UG9pbnQ+fSBwb2ludHMgaW5wdXQgcG9pbnRzXG4gKiBAcGFyYW0ge0ZlYXR1cmVDb2xsZWN0aW9uPFBvbHlnb24+fSBwb2x5Z29ucyBpbnB1dCBwb2x5Z29uc1xuICogQHJldHVybnMge0ZlYXR1cmVDb2xsZWN0aW9uPFBvaW50Pn0gcG9pbnRzIHRoYXQgbGFuZCB3aXRoaW4gYXQgbGVhc3Qgb25lIHBvbHlnb25cbiAqIEBleGFtcGxlXG4gKiB2YXIgc2VhcmNoV2l0aGluID0gdHVyZi5mZWF0dXJlQ29sbGVjdGlvbihbXG4gKiAgICAgdHVyZi5wb2x5Z29uKFtbXG4gKiAgICAgICAgIFstNDYuNjUzLC0yMy41NDNdLFxuICogICAgICAgICBbLTQ2LjYzNCwtMjMuNTM0Nl0sXG4gKiAgICAgICAgIFstNDYuNjEzLC0yMy41NDNdLFxuICogICAgICAgICBbLTQ2LjYxNCwtMjMuNTU5XSxcbiAqICAgICAgICAgWy00Ni42MzEsLTIzLjU2N10sXG4gKiAgICAgICAgIFstNDYuNjUzLC0yMy41NjBdLFxuICogICAgICAgICBbLTQ2LjY1MywtMjMuNTQzXVxuICogICAgIF1dKVxuICogXSk7XG4gKiB2YXIgcG9pbnRzID0gdHVyZi5mZWF0dXJlQ29sbGVjdGlvbihbXG4gKiAgICAgdHVyZi5wb2ludChbLTQ2LjYzMTgsIC0yMy41NTIzXSksXG4gKiAgICAgdHVyZi5wb2ludChbLTQ2LjYyNDYsIC0yMy41MzI1XSksXG4gKiAgICAgdHVyZi5wb2ludChbLTQ2LjYwNjIsIC0yMy41NTEzXSksXG4gKiAgICAgdHVyZi5wb2ludChbLTQ2LjY2MywgLTIzLjU1NF0pLFxuICogICAgIHR1cmYucG9pbnQoWy00Ni42NDMsIC0yMy41NTddKVxuICogXSk7XG4gKlxuICogdmFyIHB0c1dpdGhpbiA9IHR1cmYud2l0aGluKHBvaW50cywgc2VhcmNoV2l0aGluKTtcbiAqXG4gKiAvL2FkZFRvTWFwXG4gKiB2YXIgYWRkVG9NYXAgPSBbcG9pbnRzLCBzZWFyY2hXaXRoaW4sIHB0c1dpdGhpbl1cbiAqIHR1cmYuZmVhdHVyZUVhY2gocHRzV2l0aGluLCBmdW5jdGlvbiAoY3VycmVudEZlYXR1cmUpIHtcbiAqICAgY3VycmVudEZlYXR1cmUucHJvcGVydGllc1snbWFya2VyLXNpemUnXSA9ICdsYXJnZSc7XG4gKiAgIGN1cnJlbnRGZWF0dXJlLnByb3BlcnRpZXNbJ21hcmtlci1jb2xvciddID0gJyMwMDAnO1xuICogfSk7XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBvaW50cywgcG9seWdvbnMpIHtcbiAgICB2YXIgcG9pbnRzV2l0aGluID0gZmVhdHVyZUNvbGxlY3Rpb24oW10pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcG9seWdvbnMuZmVhdHVyZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBwb2ludHMuZmVhdHVyZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIHZhciBpc0luc2lkZSA9IGluc2lkZShwb2ludHMuZmVhdHVyZXNbal0sIHBvbHlnb25zLmZlYXR1cmVzW2ldKTtcbiAgICAgICAgICAgIGlmIChpc0luc2lkZSkge1xuICAgICAgICAgICAgICAgIHBvaW50c1dpdGhpbi5mZWF0dXJlcy5wdXNoKHBvaW50cy5mZWF0dXJlc1tqXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBvaW50c1dpdGhpbjtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AdHVyZi93aXRoaW4vaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDI5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBpbnZhcmlhbnQgPSByZXF1aXJlKCdAdHVyZi9pbnZhcmlhbnQnKTtcbnZhciBnZXRDb29yZCA9IGludmFyaWFudC5nZXRDb29yZDtcbnZhciBnZXRDb29yZHMgPSBpbnZhcmlhbnQuZ2V0Q29vcmRzO1xuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0V2ZW4lRTIlODAlOTNvZGRfcnVsZVxuLy8gbW9kaWZpZWQgZnJvbTogaHR0cHM6Ly9naXRodWIuY29tL3N1YnN0YWNrL3BvaW50LWluLXBvbHlnb24vYmxvYi9tYXN0ZXIvaW5kZXguanNcbi8vIHdoaWNoIHdhcyBtb2RpZmllZCBmcm9tIGh0dHA6Ly93d3cuZWNzZS5ycGkuZWR1L0hvbWVwYWdlcy93cmYvUmVzZWFyY2gvU2hvcnRfTm90ZXMvcG5wb2x5Lmh0bWxcblxuLyoqXG4gKiBUYWtlcyBhIHtAbGluayBQb2ludH0gYW5kIGEge0BsaW5rIFBvbHlnb259IG9yIHtAbGluayBNdWx0aVBvbHlnb259IGFuZCBkZXRlcm1pbmVzIGlmIHRoZSBwb2ludCByZXNpZGVzIGluc2lkZSB0aGUgcG9seWdvbi4gVGhlIHBvbHlnb24gY2FuXG4gKiBiZSBjb252ZXggb3IgY29uY2F2ZS4gVGhlIGZ1bmN0aW9uIGFjY291bnRzIGZvciBob2xlcy5cbiAqXG4gKiBAbmFtZSBpbnNpZGVcbiAqIEBwYXJhbSB7RmVhdHVyZTxQb2ludD59IHBvaW50IGlucHV0IHBvaW50XG4gKiBAcGFyYW0ge0ZlYXR1cmU8UG9seWdvbnxNdWx0aVBvbHlnb24+fSBwb2x5Z29uIGlucHV0IHBvbHlnb24gb3IgbXVsdGlwb2x5Z29uXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtpZ25vcmVCb3VuZGFyeT1mYWxzZV0gVHJ1ZSBpZiBwb2x5Z29uIGJvdW5kYXJ5IHNob3VsZCBiZSBpZ25vcmVkIHdoZW4gZGV0ZXJtaW5pbmcgaWYgdGhlIHBvaW50IGlzIGluc2lkZSB0aGUgcG9seWdvbiBvdGhlcndpc2UgZmFsc2UuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gYHRydWVgIGlmIHRoZSBQb2ludCBpcyBpbnNpZGUgdGhlIFBvbHlnb247IGBmYWxzZWAgaWYgdGhlIFBvaW50IGlzIG5vdCBpbnNpZGUgdGhlIFBvbHlnb25cbiAqIEBleGFtcGxlXG4gKiB2YXIgcHQgPSB0dXJmLnBvaW50KFstNzcsIDQ0XSk7XG4gKiB2YXIgcG9seSA9IHR1cmYucG9seWdvbihbW1xuICogICBbLTgxLCA0MV0sXG4gKiAgIFstODEsIDQ3XSxcbiAqICAgWy03MiwgNDddLFxuICogICBbLTcyLCA0MV0sXG4gKiAgIFstODEsIDQxXVxuICogXV0pO1xuICpcbiAqIHR1cmYuaW5zaWRlKHB0LCBwb2x5KTtcbiAqIC8vPSB0cnVlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBvaW50LCBwb2x5Z29uLCBpZ25vcmVCb3VuZGFyeSkge1xuICAgIC8vIHZhbGlkYXRpb25cbiAgICBpZiAoIXBvaW50KSB0aHJvdyBuZXcgRXJyb3IoJ3BvaW50IGlzIHJlcXVpcmVkJyk7XG4gICAgaWYgKCFwb2x5Z29uKSB0aHJvdyBuZXcgRXJyb3IoJ3BvbHlnb24gaXMgcmVxdWlyZWQnKTtcblxuICAgIHZhciBwdCA9IGdldENvb3JkKHBvaW50KTtcbiAgICB2YXIgcG9seXMgPSBnZXRDb29yZHMocG9seWdvbik7XG4gICAgdmFyIHR5cGUgPSAocG9seWdvbi5nZW9tZXRyeSkgPyBwb2x5Z29uLmdlb21ldHJ5LnR5cGUgOiBwb2x5Z29uLnR5cGU7XG4gICAgdmFyIGJib3ggPSBwb2x5Z29uLmJib3g7XG5cbiAgICAvLyBRdWljayBlbGltaW5hdGlvbiBpZiBwb2ludCBpcyBub3QgaW5zaWRlIGJib3hcbiAgICBpZiAoYmJveCAmJiBpbkJCb3gocHQsIGJib3gpID09PSBmYWxzZSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gbm9ybWFsaXplIHRvIG11bHRpcG9seWdvblxuICAgIGlmICh0eXBlID09PSAnUG9seWdvbicpIHBvbHlzID0gW3BvbHlzXTtcblxuICAgIGZvciAodmFyIGkgPSAwLCBpbnNpZGVQb2x5ID0gZmFsc2U7IGkgPCBwb2x5cy5sZW5ndGggJiYgIWluc2lkZVBvbHk7IGkrKykge1xuICAgICAgICAvLyBjaGVjayBpZiBpdCBpcyBpbiB0aGUgb3V0ZXIgcmluZyBmaXJzdFxuICAgICAgICBpZiAoaW5SaW5nKHB0LCBwb2x5c1tpXVswXSwgaWdub3JlQm91bmRhcnkpKSB7XG4gICAgICAgICAgICB2YXIgaW5Ib2xlID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgayA9IDE7XG4gICAgICAgICAgICAvLyBjaGVjayBmb3IgdGhlIHBvaW50IGluIGFueSBvZiB0aGUgaG9sZXNcbiAgICAgICAgICAgIHdoaWxlIChrIDwgcG9seXNbaV0ubGVuZ3RoICYmICFpbkhvbGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5SaW5nKHB0LCBwb2x5c1tpXVtrXSwgIWlnbm9yZUJvdW5kYXJ5KSkge1xuICAgICAgICAgICAgICAgICAgICBpbkhvbGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBrKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWluSG9sZSkgaW5zaWRlUG9seSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGluc2lkZVBvbHk7XG59O1xuXG4vKipcbiAqIGluUmluZ1xuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge1tudW1iZXIsIG51bWJlcl19IHB0IFt4LHldXG4gKiBAcGFyYW0ge0FycmF5PFtudW1iZXIsIG51bWJlcl0+fSByaW5nIFtbeCx5XSwgW3gseV0sLi5dXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlnbm9yZUJvdW5kYXJ5IGlnbm9yZUJvdW5kYXJ5XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gaW5SaW5nXG4gKi9cbmZ1bmN0aW9uIGluUmluZyhwdCwgcmluZywgaWdub3JlQm91bmRhcnkpIHtcbiAgICB2YXIgaXNJbnNpZGUgPSBmYWxzZTtcbiAgICBpZiAocmluZ1swXVswXSA9PT0gcmluZ1tyaW5nLmxlbmd0aCAtIDFdWzBdICYmIHJpbmdbMF1bMV0gPT09IHJpbmdbcmluZy5sZW5ndGggLSAxXVsxXSkgcmluZyA9IHJpbmcuc2xpY2UoMCwgcmluZy5sZW5ndGggLSAxKTtcblxuICAgIGZvciAodmFyIGkgPSAwLCBqID0gcmluZy5sZW5ndGggLSAxOyBpIDwgcmluZy5sZW5ndGg7IGogPSBpKyspIHtcbiAgICAgICAgdmFyIHhpID0gcmluZ1tpXVswXSwgeWkgPSByaW5nW2ldWzFdO1xuICAgICAgICB2YXIgeGogPSByaW5nW2pdWzBdLCB5aiA9IHJpbmdbal1bMV07XG4gICAgICAgIHZhciBvbkJvdW5kYXJ5ID0gKHB0WzFdICogKHhpIC0geGopICsgeWkgKiAoeGogLSBwdFswXSkgKyB5aiAqIChwdFswXSAtIHhpKSA9PT0gMCkgJiZcbiAgICAgICAgICAgICgoeGkgLSBwdFswXSkgKiAoeGogLSBwdFswXSkgPD0gMCkgJiYgKCh5aSAtIHB0WzFdKSAqICh5aiAtIHB0WzFdKSA8PSAwKTtcbiAgICAgICAgaWYgKG9uQm91bmRhcnkpIHJldHVybiAhaWdub3JlQm91bmRhcnk7XG4gICAgICAgIHZhciBpbnRlcnNlY3QgPSAoKHlpID4gcHRbMV0pICE9PSAoeWogPiBwdFsxXSkpICYmXG4gICAgICAgIChwdFswXSA8ICh4aiAtIHhpKSAqIChwdFsxXSAtIHlpKSAvICh5aiAtIHlpKSArIHhpKTtcbiAgICAgICAgaWYgKGludGVyc2VjdCkgaXNJbnNpZGUgPSAhaXNJbnNpZGU7XG4gICAgfVxuICAgIHJldHVybiBpc0luc2lkZTtcbn1cblxuLyoqXG4gKiBpbkJCb3hcbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtbbnVtYmVyLCBudW1iZXJdfSBwdCBwb2ludCBbeCx5XVxuICogQHBhcmFtIHtbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXX0gYmJveCBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZS9mYWxzZSBpZiBwb2ludCBpcyBpbnNpZGUgQkJveFxuICovXG5mdW5jdGlvbiBpbkJCb3gocHQsIGJib3gpIHtcbiAgICByZXR1cm4gYmJveFswXSA8PSBwdFswXSAmJlxuICAgICAgICAgICBiYm94WzFdIDw9IHB0WzFdICYmXG4gICAgICAgICAgIGJib3hbMl0gPj0gcHRbMF0gJiZcbiAgICAgICAgICAgYmJveFszXSA+PSBwdFsxXTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0B0dXJmL2luc2lkZS9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMzBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBVbndyYXAgYSBjb29yZGluYXRlIGZyb20gYSBQb2ludCBGZWF0dXJlLCBHZW9tZXRyeSBvciBhIHNpbmdsZSBjb29yZGluYXRlLlxuICpcbiAqIEBuYW1lIGdldENvb3JkXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj58R2VvbWV0cnk8UG9pbnQ+fEZlYXR1cmU8UG9pbnQ+fSBvYmogT2JqZWN0XG4gKiBAcmV0dXJucyB7QXJyYXk8bnVtYmVyPn0gY29vcmRpbmF0ZXNcbiAqIEBleGFtcGxlXG4gKiB2YXIgcHQgPSB0dXJmLnBvaW50KFsxMCwgMTBdKTtcbiAqXG4gKiB2YXIgY29vcmQgPSB0dXJmLmdldENvb3JkKHB0KTtcbiAqIC8vPSBbMTAsIDEwXVxuICovXG5mdW5jdGlvbiBnZXRDb29yZChvYmopIHtcbiAgICBpZiAoIW9iaikgdGhyb3cgbmV3IEVycm9yKCdvYmogaXMgcmVxdWlyZWQnKTtcblxuICAgIHZhciBjb29yZGluYXRlcyA9IGdldENvb3JkcyhvYmopO1xuXG4gICAgLy8gZ2V0Q29vcmQoKSBtdXN0IGNvbnRhaW4gYXQgbGVhc3QgdHdvIG51bWJlcnMgKFBvaW50KVxuICAgIGlmIChjb29yZGluYXRlcy5sZW5ndGggPiAxICYmXG4gICAgICAgIHR5cGVvZiBjb29yZGluYXRlc1swXSA9PT0gJ251bWJlcicgJiZcbiAgICAgICAgdHlwZW9mIGNvb3JkaW5hdGVzWzFdID09PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4gY29vcmRpbmF0ZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb29yZGluYXRlIGlzIG5vdCBhIHZhbGlkIFBvaW50Jyk7XG4gICAgfVxufVxuXG4vKipcbiAqIFVud3JhcCBjb29yZGluYXRlcyBmcm9tIGEgRmVhdHVyZSwgR2VvbWV0cnkgT2JqZWN0IG9yIGFuIEFycmF5IG9mIG51bWJlcnNcbiAqXG4gKiBAbmFtZSBnZXRDb29yZHNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPnxHZW9tZXRyeXxGZWF0dXJlfSBvYmogT2JqZWN0XG4gKiBAcmV0dXJucyB7QXJyYXk8bnVtYmVyPn0gY29vcmRpbmF0ZXNcbiAqIEBleGFtcGxlXG4gKiB2YXIgcG9seSA9IHR1cmYucG9seWdvbihbW1sxMTkuMzIsIC04LjddLCBbMTE5LjU1LCAtOC42OV0sIFsxMTkuNTEsIC04LjU0XSwgWzExOS4zMiwgLTguN11dXSk7XG4gKlxuICogdmFyIGNvb3JkID0gdHVyZi5nZXRDb29yZHMocG9seSk7XG4gKiAvLz0gW1tbMTE5LjMyLCAtOC43XSwgWzExOS41NSwgLTguNjldLCBbMTE5LjUxLCAtOC41NF0sIFsxMTkuMzIsIC04LjddXV1cbiAqL1xuZnVuY3Rpb24gZ2V0Q29vcmRzKG9iaikge1xuICAgIGlmICghb2JqKSB0aHJvdyBuZXcgRXJyb3IoJ29iaiBpcyByZXF1aXJlZCcpO1xuICAgIHZhciBjb29yZGluYXRlcztcblxuICAgIC8vIEFycmF5IG9mIG51bWJlcnNcbiAgICBpZiAob2JqLmxlbmd0aCkge1xuICAgICAgICBjb29yZGluYXRlcyA9IG9iajtcblxuICAgIC8vIEdlb21ldHJ5IE9iamVjdFxuICAgIH0gZWxzZSBpZiAob2JqLmNvb3JkaW5hdGVzKSB7XG4gICAgICAgIGNvb3JkaW5hdGVzID0gb2JqLmNvb3JkaW5hdGVzO1xuXG4gICAgLy8gRmVhdHVyZVxuICAgIH0gZWxzZSBpZiAob2JqLmdlb21ldHJ5ICYmIG9iai5nZW9tZXRyeS5jb29yZGluYXRlcykge1xuICAgICAgICBjb29yZGluYXRlcyA9IG9iai5nZW9tZXRyeS5jb29yZGluYXRlcztcbiAgICB9XG4gICAgLy8gQ2hlY2tzIGlmIGNvb3JkaW5hdGVzIGNvbnRhaW5zIGEgbnVtYmVyXG4gICAgaWYgKGNvb3JkaW5hdGVzKSB7XG4gICAgICAgIGNvbnRhaW5zTnVtYmVyKGNvb3JkaW5hdGVzKTtcbiAgICAgICAgcmV0dXJuIGNvb3JkaW5hdGVzO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHZhbGlkIGNvb3JkaW5hdGVzJyk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGNvb3JkaW5hdGVzIGNvbnRhaW5zIGEgbnVtYmVyXG4gKlxuICogQG5hbWUgY29udGFpbnNOdW1iZXJcbiAqIEBwYXJhbSB7QXJyYXk8YW55Pn0gY29vcmRpbmF0ZXMgR2VvSlNPTiBDb29yZGluYXRlc1xuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgQXJyYXkgY29udGFpbnMgYSBudW1iZXJcbiAqL1xuZnVuY3Rpb24gY29udGFpbnNOdW1iZXIoY29vcmRpbmF0ZXMpIHtcbiAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoID4gMSAmJlxuICAgICAgICB0eXBlb2YgY29vcmRpbmF0ZXNbMF0gPT09ICdudW1iZXInICYmXG4gICAgICAgIHR5cGVvZiBjb29yZGluYXRlc1sxXSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY29vcmRpbmF0ZXNbMF0pICYmIGNvb3JkaW5hdGVzWzBdLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gY29udGFpbnNOdW1iZXIoY29vcmRpbmF0ZXNbMF0pO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nvb3JkaW5hdGVzIG11c3Qgb25seSBjb250YWluIG51bWJlcnMnKTtcbn1cblxuLyoqXG4gKiBFbmZvcmNlIGV4cGVjdGF0aW9ucyBhYm91dCB0eXBlcyBvZiBHZW9KU09OIG9iamVjdHMgZm9yIFR1cmYuXG4gKlxuICogQG5hbWUgZ2VvanNvblR5cGVcbiAqIEBwYXJhbSB7R2VvSlNPTn0gdmFsdWUgYW55IEdlb0pTT04gb2JqZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBleHBlY3RlZCBHZW9KU09OIHR5cGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWUgb2YgY2FsbGluZyBmdW5jdGlvblxuICogQHRocm93cyB7RXJyb3J9IGlmIHZhbHVlIGlzIG5vdCB0aGUgZXhwZWN0ZWQgdHlwZS5cbiAqL1xuZnVuY3Rpb24gZ2VvanNvblR5cGUodmFsdWUsIHR5cGUsIG5hbWUpIHtcbiAgICBpZiAoIXR5cGUgfHwgIW5hbWUpIHRocm93IG5ldyBFcnJvcigndHlwZSBhbmQgbmFtZSByZXF1aXJlZCcpO1xuXG4gICAgaWYgKCF2YWx1ZSB8fCB2YWx1ZS50eXBlICE9PSB0eXBlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBpbnB1dCB0byAnICsgbmFtZSArICc6IG11c3QgYmUgYSAnICsgdHlwZSArICcsIGdpdmVuICcgKyB2YWx1ZS50eXBlKTtcbiAgICB9XG59XG5cbi8qKlxuICogRW5mb3JjZSBleHBlY3RhdGlvbnMgYWJvdXQgdHlwZXMgb2Yge0BsaW5rIEZlYXR1cmV9IGlucHV0cyBmb3IgVHVyZi5cbiAqIEludGVybmFsbHkgdGhpcyB1c2VzIHtAbGluayBnZW9qc29uVHlwZX0gdG8ganVkZ2UgZ2VvbWV0cnkgdHlwZXMuXG4gKlxuICogQG5hbWUgZmVhdHVyZU9mXG4gKiBAcGFyYW0ge0ZlYXR1cmV9IGZlYXR1cmUgYSBmZWF0dXJlIHdpdGggYW4gZXhwZWN0ZWQgZ2VvbWV0cnkgdHlwZVxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgZXhwZWN0ZWQgR2VvSlNPTiB0eXBlXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBuYW1lIG9mIGNhbGxpbmcgZnVuY3Rpb25cbiAqIEB0aHJvd3Mge0Vycm9yfSBlcnJvciBpZiB2YWx1ZSBpcyBub3QgdGhlIGV4cGVjdGVkIHR5cGUuXG4gKi9cbmZ1bmN0aW9uIGZlYXR1cmVPZihmZWF0dXJlLCB0eXBlLCBuYW1lKSB7XG4gICAgaWYgKCFmZWF0dXJlKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGZlYXR1cmUgcGFzc2VkJyk7XG4gICAgaWYgKCFuYW1lKSB0aHJvdyBuZXcgRXJyb3IoJy5mZWF0dXJlT2YoKSByZXF1aXJlcyBhIG5hbWUnKTtcbiAgICBpZiAoIWZlYXR1cmUgfHwgZmVhdHVyZS50eXBlICE9PSAnRmVhdHVyZScgfHwgIWZlYXR1cmUuZ2VvbWV0cnkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGlucHV0IHRvICcgKyBuYW1lICsgJywgRmVhdHVyZSB3aXRoIGdlb21ldHJ5IHJlcXVpcmVkJyk7XG4gICAgfVxuICAgIGlmICghZmVhdHVyZS5nZW9tZXRyeSB8fCBmZWF0dXJlLmdlb21ldHJ5LnR5cGUgIT09IHR5cGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGlucHV0IHRvICcgKyBuYW1lICsgJzogbXVzdCBiZSBhICcgKyB0eXBlICsgJywgZ2l2ZW4gJyArIGZlYXR1cmUuZ2VvbWV0cnkudHlwZSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEVuZm9yY2UgZXhwZWN0YXRpb25zIGFib3V0IHR5cGVzIG9mIHtAbGluayBGZWF0dXJlQ29sbGVjdGlvbn0gaW5wdXRzIGZvciBUdXJmLlxuICogSW50ZXJuYWxseSB0aGlzIHVzZXMge0BsaW5rIGdlb2pzb25UeXBlfSB0byBqdWRnZSBnZW9tZXRyeSB0eXBlcy5cbiAqXG4gKiBAbmFtZSBjb2xsZWN0aW9uT2ZcbiAqIEBwYXJhbSB7RmVhdHVyZUNvbGxlY3Rpb259IGZlYXR1cmVDb2xsZWN0aW9uIGEgRmVhdHVyZUNvbGxlY3Rpb24gZm9yIHdoaWNoIGZlYXR1cmVzIHdpbGwgYmUganVkZ2VkXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBleHBlY3RlZCBHZW9KU09OIHR5cGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWUgb2YgY2FsbGluZyBmdW5jdGlvblxuICogQHRocm93cyB7RXJyb3J9IGlmIHZhbHVlIGlzIG5vdCB0aGUgZXhwZWN0ZWQgdHlwZS5cbiAqL1xuZnVuY3Rpb24gY29sbGVjdGlvbk9mKGZlYXR1cmVDb2xsZWN0aW9uLCB0eXBlLCBuYW1lKSB7XG4gICAgaWYgKCFmZWF0dXJlQ29sbGVjdGlvbikgdGhyb3cgbmV3IEVycm9yKCdObyBmZWF0dXJlQ29sbGVjdGlvbiBwYXNzZWQnKTtcbiAgICBpZiAoIW5hbWUpIHRocm93IG5ldyBFcnJvcignLmNvbGxlY3Rpb25PZigpIHJlcXVpcmVzIGEgbmFtZScpO1xuICAgIGlmICghZmVhdHVyZUNvbGxlY3Rpb24gfHwgZmVhdHVyZUNvbGxlY3Rpb24udHlwZSAhPT0gJ0ZlYXR1cmVDb2xsZWN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaW5wdXQgdG8gJyArIG5hbWUgKyAnLCBGZWF0dXJlQ29sbGVjdGlvbiByZXF1aXJlZCcpO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBmZWF0dXJlID0gZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbaV07XG4gICAgICAgIGlmICghZmVhdHVyZSB8fCBmZWF0dXJlLnR5cGUgIT09ICdGZWF0dXJlJyB8fCAhZmVhdHVyZS5nZW9tZXRyeSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGlucHV0IHRvICcgKyBuYW1lICsgJywgRmVhdHVyZSB3aXRoIGdlb21ldHJ5IHJlcXVpcmVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmZWF0dXJlLmdlb21ldHJ5IHx8IGZlYXR1cmUuZ2VvbWV0cnkudHlwZSAhPT0gdHlwZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGlucHV0IHRvICcgKyBuYW1lICsgJzogbXVzdCBiZSBhICcgKyB0eXBlICsgJywgZ2l2ZW4gJyArIGZlYXR1cmUuZ2VvbWV0cnkudHlwZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogR2V0IEdlb21ldHJ5IGZyb20gRmVhdHVyZSBvciBHZW9tZXRyeSBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge0ZlYXR1cmV8R2VvbWV0cnl9IGdlb2pzb24gR2VvSlNPTiBGZWF0dXJlIG9yIEdlb21ldHJ5IE9iamVjdFxuICogQHJldHVybnMge0dlb21ldHJ5fG51bGx9IEdlb0pTT04gR2VvbWV0cnkgT2JqZWN0XG4gKiBAdGhyb3dzIHtFcnJvcn0gaWYgZ2VvanNvbiBpcyBub3QgYSBGZWF0dXJlIG9yIEdlb21ldHJ5IE9iamVjdFxuICogQGV4YW1wbGVcbiAqIHZhciBwb2ludCA9IHtcbiAqICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICogICBcInByb3BlcnRpZXNcIjoge30sXG4gKiAgIFwiZ2VvbWV0cnlcIjoge1xuICogICAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gKiAgICAgXCJjb29yZGluYXRlc1wiOiBbMTEwLCA0MF1cbiAqICAgfVxuICogfVxuICogdmFyIGdlb20gPSB0dXJmLmdldEdlb20ocG9pbnQpXG4gKiAvLz17XCJ0eXBlXCI6IFwiUG9pbnRcIiwgXCJjb29yZGluYXRlc1wiOiBbMTEwLCA0MF19XG4gKi9cbmZ1bmN0aW9uIGdldEdlb20oZ2VvanNvbikge1xuICAgIGlmICghZ2VvanNvbikgdGhyb3cgbmV3IEVycm9yKCdnZW9qc29uIGlzIHJlcXVpcmVkJyk7XG4gICAgaWYgKGdlb2pzb24uZ2VvbWV0cnkgIT09IHVuZGVmaW5lZCkgcmV0dXJuIGdlb2pzb24uZ2VvbWV0cnk7XG4gICAgaWYgKGdlb2pzb24uY29vcmRpbmF0ZXMgfHwgZ2VvanNvbi5nZW9tZXRyaWVzKSByZXR1cm4gZ2VvanNvbjtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2dlb2pzb24gbXVzdCBiZSBhIHZhbGlkIEZlYXR1cmUgb3IgR2VvbWV0cnkgT2JqZWN0Jyk7XG59XG5cbi8qKlxuICogR2V0IEdlb21ldHJ5IFR5cGUgZnJvbSBGZWF0dXJlIG9yIEdlb21ldHJ5IE9iamVjdFxuICpcbiAqIEBwYXJhbSB7RmVhdHVyZXxHZW9tZXRyeX0gZ2VvanNvbiBHZW9KU09OIEZlYXR1cmUgb3IgR2VvbWV0cnkgT2JqZWN0XG4gKiBAcmV0dXJucyB7c3RyaW5nfSBHZW9KU09OIEdlb21ldHJ5IFR5cGVcbiAqIEB0aHJvd3Mge0Vycm9yfSBpZiBnZW9qc29uIGlzIG5vdCBhIEZlYXR1cmUgb3IgR2VvbWV0cnkgT2JqZWN0XG4gKiBAZXhhbXBsZVxuICogdmFyIHBvaW50ID0ge1xuICogICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gKiAgIFwicHJvcGVydGllc1wiOiB7fSxcbiAqICAgXCJnZW9tZXRyeVwiOiB7XG4gKiAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAqICAgICBcImNvb3JkaW5hdGVzXCI6IFsxMTAsIDQwXVxuICogICB9XG4gKiB9XG4gKiB2YXIgZ2VvbSA9IHR1cmYuZ2V0R2VvbVR5cGUocG9pbnQpXG4gKiAvLz1cIlBvaW50XCJcbiAqL1xuZnVuY3Rpb24gZ2V0R2VvbVR5cGUoZ2VvanNvbikge1xuICAgIGlmICghZ2VvanNvbikgdGhyb3cgbmV3IEVycm9yKCdnZW9qc29uIGlzIHJlcXVpcmVkJyk7XG4gICAgdmFyIGdlb20gPSBnZXRHZW9tKGdlb2pzb24pO1xuICAgIGlmIChnZW9tKSByZXR1cm4gZ2VvbS50eXBlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBnZW9qc29uVHlwZTogZ2VvanNvblR5cGUsXG4gICAgY29sbGVjdGlvbk9mOiBjb2xsZWN0aW9uT2YsXG4gICAgZmVhdHVyZU9mOiBmZWF0dXJlT2YsXG4gICAgZ2V0Q29vcmQ6IGdldENvb3JkLFxuICAgIGdldENvb3JkczogZ2V0Q29vcmRzLFxuICAgIGNvbnRhaW5zTnVtYmVyOiBjb250YWluc051bWJlcixcbiAgICBnZXRHZW9tOiBnZXRHZW9tLFxuICAgIGdldEdlb21UeXBlOiBnZXRHZW9tVHlwZVxufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0B0dXJmL2luc2lkZS9ub2RlX21vZHVsZXMvQHR1cmYvaW52YXJpYW50L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAzMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIFdyYXBzIGEgR2VvSlNPTiB7QGxpbmsgR2VvbWV0cnl9IGluIGEgR2VvSlNPTiB7QGxpbmsgRmVhdHVyZX0uXG4gKlxuICogQG5hbWUgZmVhdHVyZVxuICogQHBhcmFtIHtHZW9tZXRyeX0gZ2VvbWV0cnkgaW5wdXQgZ2VvbWV0cnlcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV0gYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlfSBhIEdlb0pTT04gRmVhdHVyZVxuICogQGV4YW1wbGVcbiAqIHZhciBnZW9tZXRyeSA9IHtcbiAqICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAqICAgXCJjb29yZGluYXRlc1wiOiBbMTEwLCA1MF1cbiAqIH07XG4gKlxuICogdmFyIGZlYXR1cmUgPSB0dXJmLmZlYXR1cmUoZ2VvbWV0cnkpO1xuICpcbiAqIC8vPWZlYXR1cmVcbiAqL1xuZnVuY3Rpb24gZmVhdHVyZShnZW9tZXRyeSwgcHJvcGVydGllcywgYmJveCwgaWQpIHtcbiAgICBpZiAoZ2VvbWV0cnkgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKCdnZW9tZXRyeSBpcyByZXF1aXJlZCcpO1xuICAgIGlmIChwcm9wZXJ0aWVzICYmIHByb3BlcnRpZXMuY29uc3RydWN0b3IgIT09IE9iamVjdCkgdGhyb3cgbmV3IEVycm9yKCdwcm9wZXJ0aWVzIG11c3QgYmUgYW4gT2JqZWN0Jyk7XG4gICAgaWYgKGJib3ggJiYgYmJveC5sZW5ndGggIT09IDQpIHRocm93IG5ldyBFcnJvcignYmJveCBtdXN0IGJlIGFuIEFycmF5IG9mIDQgbnVtYmVycycpO1xuICAgIGlmIChpZCAmJiBbJ3N0cmluZycsICdudW1iZXInXS5pbmRleE9mKHR5cGVvZiBpZCkgPT09IC0xKSB0aHJvdyBuZXcgRXJyb3IoJ2lkIG11c3QgYmUgYSBudW1iZXIgb3IgYSBzdHJpbmcnKTtcblxuICAgIHZhciBmZWF0ID0ge3R5cGU6ICdGZWF0dXJlJ307XG4gICAgaWYgKGlkKSBmZWF0LmlkID0gaWQ7XG4gICAgaWYgKGJib3gpIGZlYXQuYmJveCA9IGJib3g7XG4gICAgZmVhdC5wcm9wZXJ0aWVzID0gcHJvcGVydGllcyB8fCB7fTtcbiAgICBmZWF0Lmdlb21ldHJ5ID0gZ2VvbWV0cnk7XG4gICAgcmV0dXJuIGZlYXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIEdlb0pTT04ge0BsaW5rIEdlb21ldHJ5fSBmcm9tIGEgR2VvbWV0cnkgc3RyaW5nIHR5cGUgJiBjb29yZGluYXRlcy5cbiAqIEZvciBHZW9tZXRyeUNvbGxlY3Rpb24gdHlwZSB1c2UgYGhlbHBlcnMuZ2VvbWV0cnlDb2xsZWN0aW9uYFxuICpcbiAqIEBuYW1lIGdlb21ldHJ5XG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBHZW9tZXRyeSBUeXBlXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IGNvb3JkaW5hdGVzIENvb3JkaW5hdGVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcmV0dXJucyB7R2VvbWV0cnl9IGEgR2VvSlNPTiBHZW9tZXRyeVxuICogQGV4YW1wbGVcbiAqIHZhciB0eXBlID0gJ1BvaW50JztcbiAqIHZhciBjb29yZGluYXRlcyA9IFsxMTAsIDUwXTtcbiAqXG4gKiB2YXIgZ2VvbWV0cnkgPSB0dXJmLmdlb21ldHJ5KHR5cGUsIGNvb3JkaW5hdGVzKTtcbiAqXG4gKiAvLz1nZW9tZXRyeVxuICovXG5mdW5jdGlvbiBnZW9tZXRyeSh0eXBlLCBjb29yZGluYXRlcywgYmJveCkge1xuICAgIC8vIFZhbGlkYXRpb25cbiAgICBpZiAoIXR5cGUpIHRocm93IG5ldyBFcnJvcigndHlwZSBpcyByZXF1aXJlZCcpO1xuICAgIGlmICghY29vcmRpbmF0ZXMpIHRocm93IG5ldyBFcnJvcignY29vcmRpbmF0ZXMgaXMgcmVxdWlyZWQnKTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoY29vcmRpbmF0ZXMpKSB0aHJvdyBuZXcgRXJyb3IoJ2Nvb3JkaW5hdGVzIG11c3QgYmUgYW4gQXJyYXknKTtcbiAgICBpZiAoYmJveCAmJiBiYm94Lmxlbmd0aCAhPT0gNCkgdGhyb3cgbmV3IEVycm9yKCdiYm94IG11c3QgYmUgYW4gQXJyYXkgb2YgNCBudW1iZXJzJyk7XG5cbiAgICB2YXIgZ2VvbTtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdQb2ludCc6IGdlb20gPSBwb2ludChjb29yZGluYXRlcykuZ2VvbWV0cnk7IGJyZWFrO1xuICAgIGNhc2UgJ0xpbmVTdHJpbmcnOiBnZW9tID0gbGluZVN0cmluZyhjb29yZGluYXRlcykuZ2VvbWV0cnk7IGJyZWFrO1xuICAgIGNhc2UgJ1BvbHlnb24nOiBnZW9tID0gcG9seWdvbihjb29yZGluYXRlcykuZ2VvbWV0cnk7IGJyZWFrO1xuICAgIGNhc2UgJ011bHRpUG9pbnQnOiBnZW9tID0gbXVsdGlQb2ludChjb29yZGluYXRlcykuZ2VvbWV0cnk7IGJyZWFrO1xuICAgIGNhc2UgJ011bHRpTGluZVN0cmluZyc6IGdlb20gPSBtdWx0aUxpbmVTdHJpbmcoY29vcmRpbmF0ZXMpLmdlb21ldHJ5OyBicmVhaztcbiAgICBjYXNlICdNdWx0aVBvbHlnb24nOiBnZW9tID0gbXVsdGlQb2x5Z29uKGNvb3JkaW5hdGVzKS5nZW9tZXRyeTsgYnJlYWs7XG4gICAgZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKHR5cGUgKyAnIGlzIGludmFsaWQnKTtcbiAgICB9XG4gICAgaWYgKGJib3gpIGdlb20uYmJveCA9IGJib3g7XG4gICAgcmV0dXJuIGdlb207XG59XG5cbi8qKlxuICogVGFrZXMgY29vcmRpbmF0ZXMgYW5kIHByb3BlcnRpZXMgKG9wdGlvbmFsKSBhbmQgcmV0dXJucyBhIG5ldyB7QGxpbmsgUG9pbnR9IGZlYXR1cmUuXG4gKlxuICogQG5hbWUgcG9pbnRcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gY29vcmRpbmF0ZXMgbG9uZ2l0dWRlLCBsYXRpdHVkZSBwb3NpdGlvbiAoZWFjaCBpbiBkZWNpbWFsIGRlZ3JlZXMpXG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2lkXSBJZGVudGlmaWVyXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxQb2ludD59IGEgUG9pbnQgZmVhdHVyZVxuICogQGV4YW1wbGVcbiAqIHZhciBwb2ludCA9IHR1cmYucG9pbnQoWy03NS4zNDMsIDM5Ljk4NF0pO1xuICpcbiAqIC8vPXBvaW50XG4gKi9cbmZ1bmN0aW9uIHBvaW50KGNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzLCBiYm94LCBpZCkge1xuICAgIGlmICghY29vcmRpbmF0ZXMpIHRocm93IG5ldyBFcnJvcignTm8gY29vcmRpbmF0ZXMgcGFzc2VkJyk7XG4gICAgaWYgKGNvb3JkaW5hdGVzLmxlbmd0aCA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoJ0Nvb3JkaW5hdGVzIG11c3QgYmUgYW4gYXJyYXknKTtcbiAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoIDwgMikgdGhyb3cgbmV3IEVycm9yKCdDb29yZGluYXRlcyBtdXN0IGJlIGF0IGxlYXN0IDIgbnVtYmVycyBsb25nJyk7XG4gICAgaWYgKCFpc051bWJlcihjb29yZGluYXRlc1swXSkgfHwgIWlzTnVtYmVyKGNvb3JkaW5hdGVzWzFdKSkgdGhyb3cgbmV3IEVycm9yKCdDb29yZGluYXRlcyBtdXN0IGNvbnRhaW4gbnVtYmVycycpO1xuXG4gICAgcmV0dXJuIGZlYXR1cmUoe1xuICAgICAgICB0eXBlOiAnUG9pbnQnLFxuICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXNcbiAgICB9LCBwcm9wZXJ0aWVzLCBiYm94LCBpZCk7XG59XG5cbi8qKlxuICogVGFrZXMgYW4gYXJyYXkgb2YgTGluZWFyUmluZ3MgYW5kIG9wdGlvbmFsbHkgYW4ge0BsaW5rIE9iamVjdH0gd2l0aCBwcm9wZXJ0aWVzIGFuZCByZXR1cm5zIGEge0BsaW5rIFBvbHlnb259IGZlYXR1cmUuXG4gKlxuICogQG5hbWUgcG9seWdvblxuICogQHBhcmFtIHtBcnJheTxBcnJheTxBcnJheTxudW1iZXI+Pj59IGNvb3JkaW5hdGVzIGFuIGFycmF5IG9mIExpbmVhclJpbmdzXG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2lkXSBJZGVudGlmaWVyXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxQb2x5Z29uPn0gYSBQb2x5Z29uIGZlYXR1cmVcbiAqIEB0aHJvd3Mge0Vycm9yfSB0aHJvdyBhbiBlcnJvciBpZiBhIExpbmVhclJpbmcgb2YgdGhlIHBvbHlnb24gaGFzIHRvbyBmZXcgcG9zaXRpb25zXG4gKiBvciBpZiBhIExpbmVhclJpbmcgb2YgdGhlIFBvbHlnb24gZG9lcyBub3QgaGF2ZSBtYXRjaGluZyBQb3NpdGlvbnMgYXQgdGhlIGJlZ2lubmluZyAmIGVuZC5cbiAqIEBleGFtcGxlXG4gKiB2YXIgcG9seWdvbiA9IHR1cmYucG9seWdvbihbW1xuICogICBbLTIuMjc1NTQzLCA1My40NjQ1NDddLFxuICogICBbLTIuMjc1NTQzLCA1My40ODkyNzFdLFxuICogICBbLTIuMjE1MTE4LCA1My40ODkyNzFdLFxuICogICBbLTIuMjE1MTE4LCA1My40NjQ1NDddLFxuICogICBbLTIuMjc1NTQzLCA1My40NjQ1NDddXG4gKiBdXSwgeyBuYW1lOiAncG9seTEnLCBwb3B1bGF0aW9uOiA0MDB9KTtcbiAqXG4gKiAvLz1wb2x5Z29uXG4gKi9cbmZ1bmN0aW9uIHBvbHlnb24oY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFjb29yZGluYXRlcykgdGhyb3cgbmV3IEVycm9yKCdObyBjb29yZGluYXRlcyBwYXNzZWQnKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRpbmF0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHJpbmcgPSBjb29yZGluYXRlc1tpXTtcbiAgICAgICAgaWYgKHJpbmcubGVuZ3RoIDwgNCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFYWNoIExpbmVhclJpbmcgb2YgYSBQb2x5Z29uIG11c3QgaGF2ZSA0IG9yIG1vcmUgUG9zaXRpb25zLicpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcmluZ1tyaW5nLmxlbmd0aCAtIDFdLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiBmaXJzdCBwb2ludCBvZiBQb2x5Z29uIGNvbnRhaW5zIHR3byBudW1iZXJzXG4gICAgICAgICAgICBpZiAoaSA9PT0gMCAmJiBqID09PSAwICYmICFpc051bWJlcihyaW5nWzBdWzBdKSB8fCAhaXNOdW1iZXIocmluZ1swXVsxXSkpIHRocm93IG5ldyBFcnJvcignQ29vcmRpbmF0ZXMgbXVzdCBjb250YWluIG51bWJlcnMnKTtcbiAgICAgICAgICAgIGlmIChyaW5nW3JpbmcubGVuZ3RoIC0gMV1bal0gIT09IHJpbmdbMF1bal0pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFuZCBsYXN0IFBvc2l0aW9uIGFyZSBub3QgZXF1aXZhbGVudC4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ1BvbHlnb24nLFxuICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXNcbiAgICB9LCBwcm9wZXJ0aWVzLCBiYm94LCBpZCk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHtAbGluayBMaW5lU3RyaW5nfSBiYXNlZCBvbiBhXG4gKiBjb29yZGluYXRlIGFycmF5LiBQcm9wZXJ0aWVzIGNhbiBiZSBhZGRlZCBvcHRpb25hbGx5LlxuICpcbiAqIEBuYW1lIGxpbmVTdHJpbmdcbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk8bnVtYmVyPj59IGNvb3JkaW5hdGVzIGFuIGFycmF5IG9mIFBvc2l0aW9uc1xuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtpZF0gSWRlbnRpZmllclxuICogQHJldHVybnMge0ZlYXR1cmU8TGluZVN0cmluZz59IGEgTGluZVN0cmluZyBmZWF0dXJlXG4gKiBAdGhyb3dzIHtFcnJvcn0gaWYgbm8gY29vcmRpbmF0ZXMgYXJlIHBhc3NlZFxuICogQGV4YW1wbGVcbiAqIHZhciBsaW5lc3RyaW5nMSA9IHR1cmYubGluZVN0cmluZyhbXG4gKiAgIFstMjEuOTY0NDE2LCA2NC4xNDgyMDNdLFxuICogICBbLTIxLjk1NjE3NiwgNjQuMTQxMzE2XSxcbiAqICAgWy0yMS45MzkwMSwgNjQuMTM1OTI0XSxcbiAqICAgWy0yMS45MjczMzcsIDY0LjEzNjY3M11cbiAqIF0pO1xuICogdmFyIGxpbmVzdHJpbmcyID0gdHVyZi5saW5lU3RyaW5nKFtcbiAqICAgWy0yMS45MjkwNTQsIDY0LjEyNzk4NV0sXG4gKiAgIFstMjEuOTEyOTE4LCA2NC4xMzQ3MjZdLFxuICogICBbLTIxLjkxNjAwNywgNjQuMTQxMDE2XSxcbiAqICAgWy0yMS45MzAwODQsIDY0LjE0NDQ2XVxuICogXSwge25hbWU6ICdsaW5lIDEnLCBkaXN0YW5jZTogMTQ1fSk7XG4gKlxuICogLy89bGluZXN0cmluZzFcbiAqXG4gKiAvLz1saW5lc3RyaW5nMlxuICovXG5mdW5jdGlvbiBsaW5lU3RyaW5nKGNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzLCBiYm94LCBpZCkge1xuICAgIGlmICghY29vcmRpbmF0ZXMpIHRocm93IG5ldyBFcnJvcignTm8gY29vcmRpbmF0ZXMgcGFzc2VkJyk7XG4gICAgaWYgKGNvb3JkaW5hdGVzLmxlbmd0aCA8IDIpIHRocm93IG5ldyBFcnJvcignQ29vcmRpbmF0ZXMgbXVzdCBiZSBhbiBhcnJheSBvZiB0d28gb3IgbW9yZSBwb3NpdGlvbnMnKTtcbiAgICAvLyBDaGVjayBpZiBmaXJzdCBwb2ludCBvZiBMaW5lU3RyaW5nIGNvbnRhaW5zIHR3byBudW1iZXJzXG4gICAgaWYgKCFpc051bWJlcihjb29yZGluYXRlc1swXVsxXSkgfHwgIWlzTnVtYmVyKGNvb3JkaW5hdGVzWzBdWzFdKSkgdGhyb3cgbmV3IEVycm9yKCdDb29yZGluYXRlcyBtdXN0IGNvbnRhaW4gbnVtYmVycycpO1xuXG4gICAgcmV0dXJuIGZlYXR1cmUoe1xuICAgICAgICB0eXBlOiAnTGluZVN0cmluZycsXG4gICAgICAgIGNvb3JkaW5hdGVzOiBjb29yZGluYXRlc1xuICAgIH0sIHByb3BlcnRpZXMsIGJib3gsIGlkKTtcbn1cblxuLyoqXG4gKiBUYWtlcyBvbmUgb3IgbW9yZSB7QGxpbmsgRmVhdHVyZXxGZWF0dXJlc30gYW5kIGNyZWF0ZXMgYSB7QGxpbmsgRmVhdHVyZUNvbGxlY3Rpb259LlxuICpcbiAqIEBuYW1lIGZlYXR1cmVDb2xsZWN0aW9uXG4gKiBAcGFyYW0ge0ZlYXR1cmVbXX0gZmVhdHVyZXMgaW5wdXQgZmVhdHVyZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2lkXSBJZGVudGlmaWVyXG4gKiBAcmV0dXJucyB7RmVhdHVyZUNvbGxlY3Rpb259IGEgRmVhdHVyZUNvbGxlY3Rpb24gb2YgaW5wdXQgZmVhdHVyZXNcbiAqIEBleGFtcGxlXG4gKiB2YXIgZmVhdHVyZXMgPSBbXG4gKiAgdHVyZi5wb2ludChbLTc1LjM0MywgMzkuOTg0XSwge25hbWU6ICdMb2NhdGlvbiBBJ30pLFxuICogIHR1cmYucG9pbnQoWy03NS44MzMsIDM5LjI4NF0sIHtuYW1lOiAnTG9jYXRpb24gQid9KSxcbiAqICB0dXJmLnBvaW50KFstNzUuNTM0LCAzOS4xMjNdLCB7bmFtZTogJ0xvY2F0aW9uIEMnfSlcbiAqIF07XG4gKlxuICogdmFyIGNvbGxlY3Rpb24gPSB0dXJmLmZlYXR1cmVDb2xsZWN0aW9uKGZlYXR1cmVzKTtcbiAqXG4gKiAvLz1jb2xsZWN0aW9uXG4gKi9cbmZ1bmN0aW9uIGZlYXR1cmVDb2xsZWN0aW9uKGZlYXR1cmVzLCBiYm94LCBpZCkge1xuICAgIGlmICghZmVhdHVyZXMpIHRocm93IG5ldyBFcnJvcignTm8gZmVhdHVyZXMgcGFzc2VkJyk7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGZlYXR1cmVzKSkgdGhyb3cgbmV3IEVycm9yKCdmZWF0dXJlcyBtdXN0IGJlIGFuIEFycmF5Jyk7XG4gICAgaWYgKGJib3ggJiYgYmJveC5sZW5ndGggIT09IDQpIHRocm93IG5ldyBFcnJvcignYmJveCBtdXN0IGJlIGFuIEFycmF5IG9mIDQgbnVtYmVycycpO1xuICAgIGlmIChpZCAmJiBbJ3N0cmluZycsICdudW1iZXInXS5pbmRleE9mKHR5cGVvZiBpZCkgPT09IC0xKSB0aHJvdyBuZXcgRXJyb3IoJ2lkIG11c3QgYmUgYSBudW1iZXIgb3IgYSBzdHJpbmcnKTtcblxuICAgIHZhciBmYyA9IHt0eXBlOiAnRmVhdHVyZUNvbGxlY3Rpb24nfTtcbiAgICBpZiAoaWQpIGZjLmlkID0gaWQ7XG4gICAgaWYgKGJib3gpIGZjLmJib3ggPSBiYm94O1xuICAgIGZjLmZlYXR1cmVzID0gZmVhdHVyZXM7XG4gICAgcmV0dXJuIGZjO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgRmVhdHVyZTxNdWx0aUxpbmVTdHJpbmc+fSBiYXNlZCBvbiBhXG4gKiBjb29yZGluYXRlIGFycmF5LiBQcm9wZXJ0aWVzIGNhbiBiZSBhZGRlZCBvcHRpb25hbGx5LlxuICpcbiAqIEBuYW1lIG11bHRpTGluZVN0cmluZ1xuICogQHBhcmFtIHtBcnJheTxBcnJheTxBcnJheTxudW1iZXI+Pj59IGNvb3JkaW5hdGVzIGFuIGFycmF5IG9mIExpbmVTdHJpbmdzXG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW2Jib3hdIEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2lkXSBJZGVudGlmaWVyXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxNdWx0aUxpbmVTdHJpbmc+fSBhIE11bHRpTGluZVN0cmluZyBmZWF0dXJlXG4gKiBAdGhyb3dzIHtFcnJvcn0gaWYgbm8gY29vcmRpbmF0ZXMgYXJlIHBhc3NlZFxuICogQGV4YW1wbGVcbiAqIHZhciBtdWx0aUxpbmUgPSB0dXJmLm11bHRpTGluZVN0cmluZyhbW1swLDBdLFsxMCwxMF1dXSk7XG4gKlxuICogLy89bXVsdGlMaW5lXG4gKi9cbmZ1bmN0aW9uIG11bHRpTGluZVN0cmluZyhjb29yZGluYXRlcywgcHJvcGVydGllcywgYmJveCwgaWQpIHtcbiAgICBpZiAoIWNvb3JkaW5hdGVzKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGNvb3JkaW5hdGVzIHBhc3NlZCcpO1xuXG4gICAgcmV0dXJuIGZlYXR1cmUoe1xuICAgICAgICB0eXBlOiAnTXVsdGlMaW5lU3RyaW5nJyxcbiAgICAgICAgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzXG4gICAgfSwgcHJvcGVydGllcywgYmJveCwgaWQpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgRmVhdHVyZTxNdWx0aVBvaW50Pn0gYmFzZWQgb24gYVxuICogY29vcmRpbmF0ZSBhcnJheS4gUHJvcGVydGllcyBjYW4gYmUgYWRkZWQgb3B0aW9uYWxseS5cbiAqXG4gKiBAbmFtZSBtdWx0aVBvaW50XG4gKiBAcGFyYW0ge0FycmF5PEFycmF5PG51bWJlcj4+fSBjb29yZGluYXRlcyBhbiBhcnJheSBvZiBQb3NpdGlvbnNcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV0gYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlPE11bHRpUG9pbnQ+fSBhIE11bHRpUG9pbnQgZmVhdHVyZVxuICogQHRocm93cyB7RXJyb3J9IGlmIG5vIGNvb3JkaW5hdGVzIGFyZSBwYXNzZWRcbiAqIEBleGFtcGxlXG4gKiB2YXIgbXVsdGlQdCA9IHR1cmYubXVsdGlQb2ludChbWzAsMF0sWzEwLDEwXV0pO1xuICpcbiAqIC8vPW11bHRpUHRcbiAqL1xuZnVuY3Rpb24gbXVsdGlQb2ludChjb29yZGluYXRlcywgcHJvcGVydGllcywgYmJveCwgaWQpIHtcbiAgICBpZiAoIWNvb3JkaW5hdGVzKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGNvb3JkaW5hdGVzIHBhc3NlZCcpO1xuXG4gICAgcmV0dXJuIGZlYXR1cmUoe1xuICAgICAgICB0eXBlOiAnTXVsdGlQb2ludCcsXG4gICAgICAgIGNvb3JkaW5hdGVzOiBjb29yZGluYXRlc1xuICAgIH0sIHByb3BlcnRpZXMsIGJib3gsIGlkKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEge0BsaW5rIEZlYXR1cmU8TXVsdGlQb2x5Z29uPn0gYmFzZWQgb24gYVxuICogY29vcmRpbmF0ZSBhcnJheS4gUHJvcGVydGllcyBjYW4gYmUgYWRkZWQgb3B0aW9uYWxseS5cbiAqXG4gKiBAbmFtZSBtdWx0aVBvbHlnb25cbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk8QXJyYXk8QXJyYXk8bnVtYmVyPj4+Pn0gY29vcmRpbmF0ZXMgYW4gYXJyYXkgb2YgUG9seWdvbnNcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV0gYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbYmJveF0gQkJveCBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbaWRdIElkZW50aWZpZXJcbiAqIEByZXR1cm5zIHtGZWF0dXJlPE11bHRpUG9seWdvbj59IGEgbXVsdGlwb2x5Z29uIGZlYXR1cmVcbiAqIEB0aHJvd3Mge0Vycm9yfSBpZiBubyBjb29yZGluYXRlcyBhcmUgcGFzc2VkXG4gKiBAZXhhbXBsZVxuICogdmFyIG11bHRpUG9seSA9IHR1cmYubXVsdGlQb2x5Z29uKFtbW1swLDBdLFswLDEwXSxbMTAsMTBdLFsxMCwwXSxbMCwwXV1dXSk7XG4gKlxuICogLy89bXVsdGlQb2x5XG4gKlxuICovXG5mdW5jdGlvbiBtdWx0aVBvbHlnb24oY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMsIGJib3gsIGlkKSB7XG4gICAgaWYgKCFjb29yZGluYXRlcykgdGhyb3cgbmV3IEVycm9yKCdObyBjb29yZGluYXRlcyBwYXNzZWQnKTtcblxuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ011bHRpUG9seWdvbicsXG4gICAgICAgIGNvb3JkaW5hdGVzOiBjb29yZGluYXRlc1xuICAgIH0sIHByb3BlcnRpZXMsIGJib3gsIGlkKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEge0BsaW5rIEZlYXR1cmU8R2VvbWV0cnlDb2xsZWN0aW9uPn0gYmFzZWQgb24gYVxuICogY29vcmRpbmF0ZSBhcnJheS4gUHJvcGVydGllcyBjYW4gYmUgYWRkZWQgb3B0aW9uYWxseS5cbiAqXG4gKiBAbmFtZSBnZW9tZXRyeUNvbGxlY3Rpb25cbiAqIEBwYXJhbSB7QXJyYXk8R2VvbWV0cnk+fSBnZW9tZXRyaWVzIGFuIGFycmF5IG9mIEdlb0pTT04gR2VvbWV0cmllc1xuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtiYm94XSBCQm94IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtpZF0gSWRlbnRpZmllclxuICogQHJldHVybnMge0ZlYXR1cmU8R2VvbWV0cnlDb2xsZWN0aW9uPn0gYSBHZW9KU09OIEdlb21ldHJ5Q29sbGVjdGlvbiBGZWF0dXJlXG4gKiBAZXhhbXBsZVxuICogdmFyIHB0ID0ge1xuICogICAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gKiAgICAgICBcImNvb3JkaW5hdGVzXCI6IFsxMDAsIDBdXG4gKiAgICAgfTtcbiAqIHZhciBsaW5lID0ge1xuICogICAgIFwidHlwZVwiOiBcIkxpbmVTdHJpbmdcIixcbiAqICAgICBcImNvb3JkaW5hdGVzXCI6IFsgWzEwMSwgMF0sIFsxMDIsIDFdIF1cbiAqICAgfTtcbiAqIHZhciBjb2xsZWN0aW9uID0gdHVyZi5nZW9tZXRyeUNvbGxlY3Rpb24oW3B0LCBsaW5lXSk7XG4gKlxuICogLy89Y29sbGVjdGlvblxuICovXG5mdW5jdGlvbiBnZW9tZXRyeUNvbGxlY3Rpb24oZ2VvbWV0cmllcywgcHJvcGVydGllcywgYmJveCwgaWQpIHtcbiAgICBpZiAoIWdlb21ldHJpZXMpIHRocm93IG5ldyBFcnJvcignZ2VvbWV0cmllcyBpcyByZXF1aXJlZCcpO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShnZW9tZXRyaWVzKSkgdGhyb3cgbmV3IEVycm9yKCdnZW9tZXRyaWVzIG11c3QgYmUgYW4gQXJyYXknKTtcblxuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ0dlb21ldHJ5Q29sbGVjdGlvbicsXG4gICAgICAgIGdlb21ldHJpZXM6IGdlb21ldHJpZXNcbiAgICB9LCBwcm9wZXJ0aWVzLCBiYm94LCBpZCk7XG59XG5cbi8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0dyZWF0LWNpcmNsZV9kaXN0YW5jZSNSYWRpdXNfZm9yX3NwaGVyaWNhbF9FYXJ0aFxudmFyIGZhY3RvcnMgPSB7XG4gICAgbWlsZXM6IDM5NjAsXG4gICAgbmF1dGljYWxtaWxlczogMzQ0MS4xNDUsXG4gICAgZGVncmVlczogNTcuMjk1Nzc5NSxcbiAgICByYWRpYW5zOiAxLFxuICAgIGluY2hlczogMjUwOTA1NjAwLFxuICAgIHlhcmRzOiA2OTY5NjAwLFxuICAgIG1ldGVyczogNjM3MzAwMCxcbiAgICBtZXRyZXM6IDYzNzMwMDAsXG4gICAgY2VudGltZXRlcnM6IDYuMzczZSs4LFxuICAgIGNlbnRpbWV0cmVzOiA2LjM3M2UrOCxcbiAgICBraWxvbWV0ZXJzOiA2MzczLFxuICAgIGtpbG9tZXRyZXM6IDYzNzMsXG4gICAgZmVldDogMjA5MDg3OTIuNjVcbn07XG5cbnZhciBhcmVhRmFjdG9ycyA9IHtcbiAgICBraWxvbWV0ZXJzOiAwLjAwMDAwMSxcbiAgICBraWxvbWV0cmVzOiAwLjAwMDAwMSxcbiAgICBtZXRlcnM6IDEsXG4gICAgbWV0cmVzOiAxLFxuICAgIGNlbnRpbWV0cmVzOiAxMDAwMCxcbiAgICBtaWxsaW1ldGVyOiAxMDAwMDAwLFxuICAgIGFjcmVzOiAwLjAwMDI0NzEwNSxcbiAgICBtaWxlczogMy44NmUtNyxcbiAgICB5YXJkczogMS4xOTU5OTAwNDYsXG4gICAgZmVldDogMTAuNzYzOTEwNDE3LFxuICAgIGluY2hlczogMTU1MC4wMDMxMDAwMDZcbn07XG4vKipcbiAqIFJvdW5kIG51bWJlciB0byBwcmVjaXNpb25cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gbnVtIE51bWJlclxuICogQHBhcmFtIHtudW1iZXJ9IFtwcmVjaXNpb249MF0gUHJlY2lzaW9uXG4gKiBAcmV0dXJucyB7bnVtYmVyfSByb3VuZGVkIG51bWJlclxuICogQGV4YW1wbGVcbiAqIHR1cmYucm91bmQoMTIwLjQzMjEpXG4gKiAvLz0xMjBcbiAqXG4gKiB0dXJmLnJvdW5kKDEyMC40MzIxLCAyKVxuICogLy89MTIwLjQzXG4gKi9cbmZ1bmN0aW9uIHJvdW5kKG51bSwgcHJlY2lzaW9uKSB7XG4gICAgaWYgKG51bSA9PT0gdW5kZWZpbmVkIHx8IG51bSA9PT0gbnVsbCB8fCBpc05hTihudW0pKSB0aHJvdyBuZXcgRXJyb3IoJ251bSBpcyByZXF1aXJlZCcpO1xuICAgIGlmIChwcmVjaXNpb24gJiYgIShwcmVjaXNpb24gPj0gMCkpIHRocm93IG5ldyBFcnJvcigncHJlY2lzaW9uIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgICB2YXIgbXVsdGlwbGllciA9IE1hdGgucG93KDEwLCBwcmVjaXNpb24gfHwgMCk7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobnVtICogbXVsdGlwbGllcikgLyBtdWx0aXBsaWVyO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBkaXN0YW5jZSBtZWFzdXJlbWVudCAoYXNzdW1pbmcgYSBzcGhlcmljYWwgRWFydGgpIGZyb20gcmFkaWFucyB0byBhIG1vcmUgZnJpZW5kbHkgdW5pdC5cbiAqIFZhbGlkIHVuaXRzOiBtaWxlcywgbmF1dGljYWxtaWxlcywgaW5jaGVzLCB5YXJkcywgbWV0ZXJzLCBtZXRyZXMsIGtpbG9tZXRlcnMsIGNlbnRpbWV0ZXJzLCBmZWV0XG4gKlxuICogQG5hbWUgcmFkaWFuc1RvRGlzdGFuY2VcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWRpYW5zIGluIHJhZGlhbnMgYWNyb3NzIHRoZSBzcGhlcmVcbiAqIEBwYXJhbSB7c3RyaW5nfSBbdW5pdHM9a2lsb21ldGVyc10gY2FuIGJlIGRlZ3JlZXMsIHJhZGlhbnMsIG1pbGVzLCBvciBraWxvbWV0ZXJzIGluY2hlcywgeWFyZHMsIG1ldHJlcywgbWV0ZXJzLCBraWxvbWV0cmVzLCBraWxvbWV0ZXJzLlxuICogQHJldHVybnMge251bWJlcn0gZGlzdGFuY2VcbiAqL1xuZnVuY3Rpb24gcmFkaWFuc1RvRGlzdGFuY2UocmFkaWFucywgdW5pdHMpIHtcbiAgICBpZiAocmFkaWFucyA9PT0gdW5kZWZpbmVkIHx8IHJhZGlhbnMgPT09IG51bGwpIHRocm93IG5ldyBFcnJvcigncmFkaWFucyBpcyByZXF1aXJlZCcpO1xuXG4gICAgdmFyIGZhY3RvciA9IGZhY3RvcnNbdW5pdHMgfHwgJ2tpbG9tZXRlcnMnXTtcbiAgICBpZiAoIWZhY3RvcikgdGhyb3cgbmV3IEVycm9yKCd1bml0cyBpcyBpbnZhbGlkJyk7XG4gICAgcmV0dXJuIHJhZGlhbnMgKiBmYWN0b3I7XG59XG5cbi8qKlxuICogQ29udmVydCBhIGRpc3RhbmNlIG1lYXN1cmVtZW50IChhc3N1bWluZyBhIHNwaGVyaWNhbCBFYXJ0aCkgZnJvbSBhIHJlYWwtd29ybGQgdW5pdCBpbnRvIHJhZGlhbnNcbiAqIFZhbGlkIHVuaXRzOiBtaWxlcywgbmF1dGljYWxtaWxlcywgaW5jaGVzLCB5YXJkcywgbWV0ZXJzLCBtZXRyZXMsIGtpbG9tZXRlcnMsIGNlbnRpbWV0ZXJzLCBmZWV0XG4gKlxuICogQG5hbWUgZGlzdGFuY2VUb1JhZGlhbnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBkaXN0YW5jZSBpbiByZWFsIHVuaXRzXG4gKiBAcGFyYW0ge3N0cmluZ30gW3VuaXRzPWtpbG9tZXRlcnNdIGNhbiBiZSBkZWdyZWVzLCByYWRpYW5zLCBtaWxlcywgb3Iga2lsb21ldGVycyBpbmNoZXMsIHlhcmRzLCBtZXRyZXMsIG1ldGVycywga2lsb21ldHJlcywga2lsb21ldGVycy5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IHJhZGlhbnNcbiAqL1xuZnVuY3Rpb24gZGlzdGFuY2VUb1JhZGlhbnMoZGlzdGFuY2UsIHVuaXRzKSB7XG4gICAgaWYgKGRpc3RhbmNlID09PSB1bmRlZmluZWQgfHwgZGlzdGFuY2UgPT09IG51bGwpIHRocm93IG5ldyBFcnJvcignZGlzdGFuY2UgaXMgcmVxdWlyZWQnKTtcblxuICAgIHZhciBmYWN0b3IgPSBmYWN0b3JzW3VuaXRzIHx8ICdraWxvbWV0ZXJzJ107XG4gICAgaWYgKCFmYWN0b3IpIHRocm93IG5ldyBFcnJvcigndW5pdHMgaXMgaW52YWxpZCcpO1xuICAgIHJldHVybiBkaXN0YW5jZSAvIGZhY3Rvcjtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgZGlzdGFuY2UgbWVhc3VyZW1lbnQgKGFzc3VtaW5nIGEgc3BoZXJpY2FsIEVhcnRoKSBmcm9tIGEgcmVhbC13b3JsZCB1bml0IGludG8gZGVncmVlc1xuICogVmFsaWQgdW5pdHM6IG1pbGVzLCBuYXV0aWNhbG1pbGVzLCBpbmNoZXMsIHlhcmRzLCBtZXRlcnMsIG1ldHJlcywgY2VudGltZXRlcnMsIGtpbG9tZXRyZXMsIGZlZXRcbiAqXG4gKiBAbmFtZSBkaXN0YW5jZVRvRGVncmVlc1xuICogQHBhcmFtIHtudW1iZXJ9IGRpc3RhbmNlIGluIHJlYWwgdW5pdHNcbiAqIEBwYXJhbSB7c3RyaW5nfSBbdW5pdHM9a2lsb21ldGVyc10gY2FuIGJlIGRlZ3JlZXMsIHJhZGlhbnMsIG1pbGVzLCBvciBraWxvbWV0ZXJzIGluY2hlcywgeWFyZHMsIG1ldHJlcywgbWV0ZXJzLCBraWxvbWV0cmVzLCBraWxvbWV0ZXJzLlxuICogQHJldHVybnMge251bWJlcn0gZGVncmVlc1xuICovXG5mdW5jdGlvbiBkaXN0YW5jZVRvRGVncmVlcyhkaXN0YW5jZSwgdW5pdHMpIHtcbiAgICByZXR1cm4gcmFkaWFuczJkZWdyZWVzKGRpc3RhbmNlVG9SYWRpYW5zKGRpc3RhbmNlLCB1bml0cykpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGFueSBiZWFyaW5nIGFuZ2xlIGZyb20gdGhlIG5vcnRoIGxpbmUgZGlyZWN0aW9uIChwb3NpdGl2ZSBjbG9ja3dpc2UpXG4gKiBhbmQgcmV0dXJucyBhbiBhbmdsZSBiZXR3ZWVuIDAtMzYwIGRlZ3JlZXMgKHBvc2l0aXZlIGNsb2Nrd2lzZSksIDAgYmVpbmcgdGhlIG5vcnRoIGxpbmVcbiAqXG4gKiBAbmFtZSBiZWFyaW5nVG9BbmdsZVxuICogQHBhcmFtIHtudW1iZXJ9IGJlYXJpbmcgYW5nbGUsIGJldHdlZW4gLTE4MCBhbmQgKzE4MCBkZWdyZWVzXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBhbmdsZSBiZXR3ZWVuIDAgYW5kIDM2MCBkZWdyZWVzXG4gKi9cbmZ1bmN0aW9uIGJlYXJpbmdUb0FuZ2xlKGJlYXJpbmcpIHtcbiAgICBpZiAoYmVhcmluZyA9PT0gbnVsbCB8fCBiZWFyaW5nID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcignYmVhcmluZyBpcyByZXF1aXJlZCcpO1xuXG4gICAgdmFyIGFuZ2xlID0gYmVhcmluZyAlIDM2MDtcbiAgICBpZiAoYW5nbGUgPCAwKSBhbmdsZSArPSAzNjA7XG4gICAgcmV0dXJuIGFuZ2xlO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGFuIGFuZ2xlIGluIHJhZGlhbnMgdG8gZGVncmVlc1xuICpcbiAqIEBuYW1lIHJhZGlhbnMyZGVncmVlc1xuICogQHBhcmFtIHtudW1iZXJ9IHJhZGlhbnMgYW5nbGUgaW4gcmFkaWFuc1xuICogQHJldHVybnMge251bWJlcn0gZGVncmVlcyBiZXR3ZWVuIDAgYW5kIDM2MCBkZWdyZWVzXG4gKi9cbmZ1bmN0aW9uIHJhZGlhbnMyZGVncmVlcyhyYWRpYW5zKSB7XG4gICAgaWYgKHJhZGlhbnMgPT09IG51bGwgfHwgcmFkaWFucyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoJ3JhZGlhbnMgaXMgcmVxdWlyZWQnKTtcblxuICAgIHZhciBkZWdyZWVzID0gcmFkaWFucyAlICgyICogTWF0aC5QSSk7XG4gICAgcmV0dXJuIGRlZ3JlZXMgKiAxODAgLyBNYXRoLlBJO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGFuIGFuZ2xlIGluIGRlZ3JlZXMgdG8gcmFkaWFuc1xuICpcbiAqIEBuYW1lIGRlZ3JlZXMycmFkaWFuc1xuICogQHBhcmFtIHtudW1iZXJ9IGRlZ3JlZXMgYW5nbGUgYmV0d2VlbiAwIGFuZCAzNjAgZGVncmVlc1xuICogQHJldHVybnMge251bWJlcn0gYW5nbGUgaW4gcmFkaWFuc1xuICovXG5mdW5jdGlvbiBkZWdyZWVzMnJhZGlhbnMoZGVncmVlcykge1xuICAgIGlmIChkZWdyZWVzID09PSBudWxsIHx8IGRlZ3JlZXMgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKCdkZWdyZWVzIGlzIHJlcXVpcmVkJyk7XG5cbiAgICB2YXIgcmFkaWFucyA9IGRlZ3JlZXMgJSAzNjA7XG4gICAgcmV0dXJuIHJhZGlhbnMgKiBNYXRoLlBJIC8gMTgwO1xufVxuXG5cbi8qKlxuICogQ29udmVydHMgYSBkaXN0YW5jZSB0byB0aGUgcmVxdWVzdGVkIHVuaXQuXG4gKiBWYWxpZCB1bml0czogbWlsZXMsIG5hdXRpY2FsbWlsZXMsIGluY2hlcywgeWFyZHMsIG1ldGVycywgbWV0cmVzLCBraWxvbWV0ZXJzLCBjZW50aW1ldGVycywgZmVldFxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBkaXN0YW5jZSB0byBiZSBjb252ZXJ0ZWRcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcmlnaW5hbFVuaXQgb2YgdGhlIGRpc3RhbmNlXG4gKiBAcGFyYW0ge3N0cmluZ30gW2ZpbmFsVW5pdD1raWxvbWV0ZXJzXSByZXR1cm5lZCB1bml0XG4gKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgY29udmVydGVkIGRpc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnREaXN0YW5jZShkaXN0YW5jZSwgb3JpZ2luYWxVbml0LCBmaW5hbFVuaXQpIHtcbiAgICBpZiAoZGlzdGFuY2UgPT09IG51bGwgfHwgZGlzdGFuY2UgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKCdkaXN0YW5jZSBpcyByZXF1aXJlZCcpO1xuICAgIGlmICghKGRpc3RhbmNlID49IDApKSB0aHJvdyBuZXcgRXJyb3IoJ2Rpc3RhbmNlIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcblxuICAgIHZhciBjb252ZXJ0ZWREaXN0YW5jZSA9IHJhZGlhbnNUb0Rpc3RhbmNlKGRpc3RhbmNlVG9SYWRpYW5zKGRpc3RhbmNlLCBvcmlnaW5hbFVuaXQpLCBmaW5hbFVuaXQgfHwgJ2tpbG9tZXRlcnMnKTtcbiAgICByZXR1cm4gY29udmVydGVkRGlzdGFuY2U7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBhcmVhIHRvIHRoZSByZXF1ZXN0ZWQgdW5pdC5cbiAqIFZhbGlkIHVuaXRzOiBraWxvbWV0ZXJzLCBraWxvbWV0cmVzLCBtZXRlcnMsIG1ldHJlcywgY2VudGltZXRyZXMsIG1pbGxpbWV0ZXIsIGFjcmUsIG1pbGUsIHlhcmQsIGZvb3QsIGluY2hcbiAqIEBwYXJhbSB7bnVtYmVyfSBhcmVhIHRvIGJlIGNvbnZlcnRlZFxuICogQHBhcmFtIHtzdHJpbmd9IFtvcmlnaW5hbFVuaXQ9bWV0ZXJzXSBvZiB0aGUgZGlzdGFuY2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBbZmluYWxVbml0PWtpbG9tZXRlcnNdIHJldHVybmVkIHVuaXRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHRoZSBjb252ZXJ0ZWQgZGlzdGFuY2VcbiAqL1xuZnVuY3Rpb24gY29udmVydEFyZWEoYXJlYSwgb3JpZ2luYWxVbml0LCBmaW5hbFVuaXQpIHtcbiAgICBpZiAoYXJlYSA9PT0gbnVsbCB8fCBhcmVhID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcignYXJlYSBpcyByZXF1aXJlZCcpO1xuICAgIGlmICghKGFyZWEgPj0gMCkpIHRocm93IG5ldyBFcnJvcignYXJlYSBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG5cbiAgICB2YXIgc3RhcnRGYWN0b3IgPSBhcmVhRmFjdG9yc1tvcmlnaW5hbFVuaXQgfHwgJ21ldGVycyddO1xuICAgIGlmICghc3RhcnRGYWN0b3IpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBvcmlnaW5hbCB1bml0cycpO1xuXG4gICAgdmFyIGZpbmFsRmFjdG9yID0gYXJlYUZhY3RvcnNbZmluYWxVbml0IHx8ICdraWxvbWV0ZXJzJ107XG4gICAgaWYgKCFmaW5hbEZhY3RvcikgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZpbmFsIHVuaXRzJyk7XG5cbiAgICByZXR1cm4gKGFyZWEgLyBzdGFydEZhY3RvcikgKiBmaW5hbEZhY3Rvcjtcbn1cblxuLyoqXG4gKiBpc051bWJlclxuICpcbiAqIEBwYXJhbSB7Kn0gbnVtIE51bWJlciB0byB2YWxpZGF0ZVxuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUvZmFsc2VcbiAqIEBleGFtcGxlXG4gKiB0dXJmLmlzTnVtYmVyKDEyMylcbiAqIC8vPXRydWVcbiAqIHR1cmYuaXNOdW1iZXIoJ2ZvbycpXG4gKiAvLz1mYWxzZVxuICovXG5mdW5jdGlvbiBpc051bWJlcihudW0pIHtcbiAgICByZXR1cm4gIWlzTmFOKG51bSkgJiYgbnVtICE9PSBudWxsICYmICFBcnJheS5pc0FycmF5KG51bSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGZlYXR1cmU6IGZlYXR1cmUsXG4gICAgZ2VvbWV0cnk6IGdlb21ldHJ5LFxuICAgIGZlYXR1cmVDb2xsZWN0aW9uOiBmZWF0dXJlQ29sbGVjdGlvbixcbiAgICBnZW9tZXRyeUNvbGxlY3Rpb246IGdlb21ldHJ5Q29sbGVjdGlvbixcbiAgICBwb2ludDogcG9pbnQsXG4gICAgbXVsdGlQb2ludDogbXVsdGlQb2ludCxcbiAgICBsaW5lU3RyaW5nOiBsaW5lU3RyaW5nLFxuICAgIG11bHRpTGluZVN0cmluZzogbXVsdGlMaW5lU3RyaW5nLFxuICAgIHBvbHlnb246IHBvbHlnb24sXG4gICAgbXVsdGlQb2x5Z29uOiBtdWx0aVBvbHlnb24sXG4gICAgcmFkaWFuc1RvRGlzdGFuY2U6IHJhZGlhbnNUb0Rpc3RhbmNlLFxuICAgIGRpc3RhbmNlVG9SYWRpYW5zOiBkaXN0YW5jZVRvUmFkaWFucyxcbiAgICBkaXN0YW5jZVRvRGVncmVlczogZGlzdGFuY2VUb0RlZ3JlZXMsXG4gICAgcmFkaWFuczJkZWdyZWVzOiByYWRpYW5zMmRlZ3JlZXMsXG4gICAgZGVncmVlczJyYWRpYW5zOiBkZWdyZWVzMnJhZGlhbnMsXG4gICAgYmVhcmluZ1RvQW5nbGU6IGJlYXJpbmdUb0FuZ2xlLFxuICAgIGNvbnZlcnREaXN0YW5jZTogY29udmVydERpc3RhbmNlLFxuICAgIGNvbnZlcnRBcmVhOiBjb252ZXJ0QXJlYSxcbiAgICByb3VuZDogcm91bmQsXG4gICAgaXNOdW1iZXI6IGlzTnVtYmVyXG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQHR1cmYvd2l0aGluL25vZGVfbW9kdWxlcy9AdHVyZi9oZWxwZXJzL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAzMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJztcblxuLy8gYmVjYXVzZSB3ZSBjYW4ndCBlYXNpbHkgZ3JhYiBkYXRhIGZyb20gbWFwLCBhbmRcbi8vIHF1ZXJ5U291cmNlRmVhdHVyZXMgb25seSByZXR1cm5zIHRoaW5ncyB0aGF0IGFyZSB3aXRoaW4gdmlldy5cbmNsYXNzIFN0YXRpb25GZWVkIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgbGV0IHN0YXRpb25zID0gW107XG5cbiAgICAvLyByZXR1cm5zIGdlb2pzb25cbiAgICB0aGlzLmdldFN0YXRpb25zID0gZnVuY3Rpb24gZ2V0U3RhdGlvbnMoKSB7IHJldHVybiBzdGF0aW9uczsgfTtcblxuICAgIC8vIHJldHVybnMgYXJyYXlcbiAgICB0aGlzLmdldFN0YXRpb25zQXJyYXkgPSBmdW5jdGlvbiBnZXRTdGF0aW9uc0FycmF5KCkge1xuICAgICAgcmV0dXJuIHN0YXRpb25zLmZlYXR1cmVzID8gc3RhdGlvbnMuZmVhdHVyZXMgOiBbXTtcbiAgICB9O1xuICAgIC8vIGNvbnN0IHNldFN0YXRpb25zID0gZnVuY3Rpb24gc2V0U3RhdGlvbnMoZGF0YSkgeyBzdGF0aW9ucyA9IGRhdGE7IH1cbiAgICAvLyBmdW5jdGlvbiBzZXRTdGF0aW9ucyhkYXRhKSB7IHN0YXRpb25zID0gZGF0YTsgfVxuXG4gICAgY29uc3QgZG9GZXRjaCA9ICgpID0+IHtcbiAgICAgIGZldGNoKGNvbmZpZy5zdGF0aW9uc1VybClcbiAgICAgICAgLnRoZW4ocmVzcCA9PiByZXNwLmpzb24oKSlcbiAgICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygnZmV0Y2hlZCBzdGF0aW9uczogJywgZGF0YSk7XG4gICAgICAgICAgc3RhdGlvbnMgPSBkYXRhO1xuICAgICAgICAgIC8vIHNldFN0YXRpb25zKGRhdGEpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZG9GZXRjaCgpO1xuICAgIHdpbmRvdy5zZXRUaW1lb3V0KGRvRmV0Y2gsIDMwIC8qIHNlY29uZHMgKi8gKiAxMDAwKTtcbiAgfVxufVxuXG5jb25zdCBmZWVkID0gbmV3IFN0YXRpb25GZWVkKCk7XG5leHBvcnQgZGVmYXVsdCBmZWVkOyAvLyBleHBvcnQgc2luZ2xldG9uXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvU3RhdGlvbkZlZWQuanMiLCIvKipcbiAqIEdldCBVUkwgZm9yIEdvb2dsZSBkaXJlY3Rpb25zIHRvIG9yIGZyb20gYSBnaXZlbiBwbGFjZS5cbiAqIEBwYXJhbSB7Kn0gZGlyIC0gZWl0aGVyICd0bycgKGRlZmF1bHQpIG9yICdmcm9tJ1xuICogQHBhcmFtIHsqfSBhZGRyIC0gYWRkcmVzc1xuICogQHBhcmFtIHsqfSBsYXQgLSBsYXRpdHVkZVxuICogQHBhcmFtIHsqfSBsbmcgLSBsb25naXR1ZGVcbiAqL1xuZnVuY3Rpb24gZ2V0RGlyZWN0aW9uc0xpbmsodG9BZGRyID0gJycsIGZyb21BZGRyID0gJycsIHRvTGF0LCB0b0xuZykge1xuICAvLyBUT0RPIC8gQlVHOiBcImFkZHJlc3Nlc1wiIHdpdGggYSAnLycgaW4gdGhlbSBkb24ndCB3b3JrLCBsaWtlXG4gIC8vIFwiQ2l2aWMgQ2VudGVyL1VOIFBsYXphIEJBUlQgU3RhdGlvbiAoTWFya2V0IFN0IGF0IE1jQWxsaXN0ZXIgU3QpXCIgLSBjdXJyZW50bHkgdGhhdCByZXN1bHRzXG4gIC8vIGluIGRpcmVjdGlvbnMgZnJvbSBjaXZpYyBjZW50ZXIgdG8gVU4gcGxhemEgKGIvYyBnLW1hcHMgc2VwYXJhdGVzIGxvY2F0aW9ucyB3aXRoIGEgJy8nKVxuICBjb25zdCBiYXNlVVJMID0gJ2h0dHBzOi8vd3d3Lmdvb2dsZS5jb20vbWFwcy9kaXInO1xuICBjb25zdCBjb29yZHMgPSB0b0xhdCA/IGAke3RvTGF0fSwke3RvTG5nfSxgIDogJyc7XG4gIGNvbnN0IHpvb20gPSAxNztcbiAgcmV0dXJuIGAke2Jhc2VVUkx9LyR7ZnJvbUFkZHJ9LyR7dG9BZGRyfS9AJHtjb29yZHN9JHt6b29tfS9gO1xuICAvLyBHb29nbGUgbWFwcyBleHBlY3RzIGFkZHJlc3NlcyB3aXRoIG5hbWUgZmlyc3QsIHRoZW4gcGx1cy1zZXBhcmF0ZWQgY29tcG9uZW50cyBsaWtlIHRoaXM6XG4gIC8vIE5vaXNlYnJpZGdlLCsyMTY5K01pc3Npb24rU3QsK1NhbitGcmFuY2lzY28sK0NBKzk0MTEwXG59XG5cbi8qKlxuICogR2V0IEhUTUwgY29udGVudCBkZXNjcmliaW5nIGEgc3RhdGlvbi5cbiAqIEBwYXJhbSBzdGF0aW9uIC0gb25lIHN0YXRpb24gZnJvbSB0aGUgQVBJXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldFBvcHVwQ29udGVudChzdGF0aW9uKSB7XG4gIGNvbnN0IHtcbiAgICBzdEFkZHJlc3MxOiBhZGRyLFxuICAgIGxhdGl0dWRlOiBsYXQsXG4gICAgbG9uZ2l0dWRlOiBsbmcsXG4gICAgYXZhaWxhYmxlQmlrZXM6IGJpa2VzLFxuICAgIGF2YWlsYWJsZURvY2tzOiBkb2NrcyxcbiAgICBzdGF0dXNWYWx1ZTogc3RhdHVzLFxuICB9ID0gc3RhdGlvbi5wcm9wZXJ0aWVzO1xuICBjb25zdCBkaXJlY3Rpb25zVVJMID0gZ2V0RGlyZWN0aW9uc0xpbmsoYWRkciwgdW5kZWZpbmVkLCBsYXQsIGxuZyk7XG4gIGNvbnN0IHJvdW5kID0gbiA9PiBOdW1iZXIobikudG9GaXhlZCgyKTtcblxuICBjb25zdCBhbGVydE1zZyA9IChzdGF0dXMgPT09ICdOb3QgSW4gU2VydmljZScpID8gYDxkaXYgY2xhc3M9XCJzdGF0aW9uLXBvcHVwLS1hbGVydFwiPiR7c3RhdHVzfTwvZGl2PmAgOiAnJztcblxuICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9XCJzdGF0aW9uLXBvcHVwXCI+XG4gICAgICA8aDM+JHthZGRyfTwvaDM+XG4gICAgICAke2FsZXJ0TXNnfVxuICAgICAgPGRpdiBjbGFzcz1cImNvbHVtbnMgc3RhdGlvbi1wb3B1cC0tc3RhdHNcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbHVtbiBzdGF0aW9uLXBvcHVwLS1iaWtlc1wiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0aW9uLXBvcHVwLS1iaWtlcy1udW1iZXJcIj4ke2Jpa2VzfTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0aW9uLXBvcHVwLS1iaWtlcy10ZXh0XCI+YmlrZXM8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjb2x1bW4gc3RhdGlvbi1wb3B1cC0tZG9ja3NcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdGlvbi1wb3B1cC0tZG9ja3MtbnVtYmVyXCI+JHtkb2Nrc308L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdGlvbi1wb3B1cC0tZG9ja3MtdGV4dFwiPmRvY2tzPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwic3RhdGlvbi1wb3B1cC0tZGlyZWN0aW9uc1wiPlxuICAgICAgICA8YSByZWw9XCJub29wZW5lciBub3JlZmVycmVyXCIgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiR7ZGlyZWN0aW9uc1VSTH1cIj5EaXJlY3Rpb25zIHRvIGhlcmU8L2E+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzdGF0aW9uLXBvcHVwLS1jb29yZGluYXRlc1wiPkxhdC9Mb25nOiA8YWJiciB0aXRsZT1cIiR7bGF0fSwgJHtsbmd9XCI+JHtyb3VuZChsYXQpfSwgJHtyb3VuZChsbmcpfTwvYWJicj48L2Rpdj5cbiAgICA8L2Rpdj5gO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3BvcHVwcy5qcyIsIlxuaW1wb3J0IHN0YXRlIGZyb20gJy4vc3RhdGUnO1xuaW1wb3J0IHVzZXJSZXZlcnNlR2VvY29kZSBmcm9tICcuL3VzZXJSZXZlcnNlR2VvY29kZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHVzZXJHZW9sb2NhdGUocG9zaXRpb24pIHtcbiAgLy8gY29uc29sZS5sb2coJ2Nvb3JkczogJywgcG9zaXRpb24uY29vcmRzKTtcbiAgY29uc3QgeyBsYXRpdHVkZSwgbG9uZ2l0dWRlIH0gPSBwb3NpdGlvbi5jb29yZHM7XG4gIHN0YXRlLnVzZXIubGF0aXR1ZGUgPSBsYXRpdHVkZTtcbiAgc3RhdGUudXNlci5sb25naXR1ZGUgPSBsb25naXR1ZGU7XG4gIHVzZXJSZXZlcnNlR2VvY29kZSgpO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3VzZXJHZW9sb2NhdGUuanMiLCIvKipcbiAqIEBtb2R1bGUgbWFwYm94LWdlb2NvZGluZ1xuICovXG52YXIgcmVxdWVzdCA9IHJlcXVpcmUoJ2Jyb3dzZXItcmVxdWVzdCcpO1xuXG52YXIgQkFTRV9VUkwgPSAnaHR0cHM6Ly9hcGkubWFwYm94LmNvbS9nZW9jb2RpbmcvdjUvJztcbnZhciBBQ0NFU1NfVE9LRU4gPSBudWxsO1xudmFyIENFTlRFUiA9IG51bGw7XG52YXIgQkJPWCA9IG51bGw7XG5cbi8qKlxuICogQ29uc3RyYWN0cyB0aGUgZ2VvY29kZS9yZXZlcnNlIGdlb2NvZGUgdXJsIGZvciB0aGUgcXVlcnkgdG8gbWFwYm94LlxuICpcbiAqIEBwYXJhbSAge3N0cmluZ30gICBkYXRhc2V0IC0gVGhlIG1hcGJveCBkYXRhc2V0ICgnbWFwYm94LnBsYWNlcycgb3IgJ21hcGJveC5wbGFjZXMtcGVybWFuZW50JylcbiAqIEBwYXJhbSAge3N0cmluZ30gICBhZGRyZXNzIC0gVGhlIGFkZHJlc3MgdG8gZ2VvY29kZVxuICogQHBhcmFtICB7RnVuY3Rpb259IGRvbmUgICAgLSBDYWxsYmFjayBmdW5jdGlvbiB3aXRoIGFuIGVycm9yIGFuZCB0aGUgcmV0dXJuZWQgZGF0YSBhcyBwYXJhbWV0ZXJcbiAqL1xudmFyIF9fZ2VvY29kZVF1ZXJ5ID0gZnVuY3Rpb24gKGRhdGFzZXQsIHF1ZXJ5LCBkb25lKSB7XG4gICAgaWYgKCFBQ0NFU1NfVE9LRU4pIHtcbiAgICAgICAgcmV0dXJuIGRvbmUoJ1lvdSBoYXZlIHRvIHNldCB5b3VyIG1hcGJveCBwdWJsaWMgYWNjZXNzIHRva2VuIGZpcnN0LicpO1xuICAgIH1cblxuICAgIGlmICghZGF0YXNldCkge1xuICAgICAgICByZXR1cm4gZG9uZSgnQSBtYXBib3ggZGF0YXNldCBpcyByZXF1aXJlZC4nKTtcbiAgICB9XG5cbiAgICBpZiAoIXF1ZXJ5KSB7XG4gICAgICAgIHJldHVybiBkb25lKCdZb3UgaGF2ZSB0byBzcGVjaWZ5IHRoZSBsb2NhdGlvbiB0byBnZW9jb2RlLicpO1xuICAgIH1cblxuICAgIHZhciB1cmwgPSBCQVNFX1VSTCArXG4gICAgICAgICAgICAgIGRhdGFzZXQgKyAnLycgK1xuICAgICAgICAgICAgICBxdWVyeSArICcuanNvbicgK1xuICAgICAgICAgICAgICAnP2FjY2Vzc190b2tlbj0nICsgQUNDRVNTX1RPS0VOICtcbiAgICAgICAgICAgICAgJyZjb3VudHJ5PVVTJyArXG4gICAgICAgICAgICAgIChCQk9YID8gJyZiYm94PScgKyBCQk9YIDogJycpICsgLy8gbWluWCxtaW5ZLG1heFgsbWF4WVxuICAgICAgICAgICAgICAoQ0VOVEVSID8gJyYnICsgQ0VOVEVSWzBdICsgJywnICsgQ0VOVEVSWzFdIDogJycpO1xuXG4gICAgcmVxdWVzdCh1cmwgLCBmdW5jdGlvbiAoZXJyLCByZXNwb25zZSwgYm9keSkge1xuICAgICAgICBpZiAoZXJyIHx8IHJlc3BvbnNlLnN0YXR1c0NvZGUgIT09IDIwMCkge1xuICAgICAgICAgICAgcmV0dXJuIGRvbmUoZXJyIHx8IEpTT04ucGFyc2UoYm9keSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZG9uZShudWxsLCBKU09OLnBhcnNlKGJvZHkpKTtcbiAgICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIG1hcGJveCBhY2Nlc3MgdG9rZW4gd2l0aCB0aGUgZ2l2ZW4gb25lLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGFjY2Vzc1Rva2VuIC0gVGhlIG1hcGJveCBwdWJsaWMgYWNjZXNzIHRva2VuXG4gICAgICovXG4gICAgc2V0QWNjZXNzVG9rZW46IGZ1bmN0aW9uIChhY2Nlc3NUb2tlbikge1xuICAgICAgICBBQ0NFU1NfVE9LRU4gPSBhY2Nlc3NUb2tlbjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgbG9jYXRpb24gdG8gdXNlIGZvciBwcm94aW1pdHkgZ2VvY29kaW5nIHNlYXJjaC5cbiAgICAgKiBAcGFyYW0ge1tsb25naXR1ZGUsIGxhdGl0dWRlXX1cbiAgICAgKlxuICAgICAqL1xuICAgIHNldFNlYXJjaENlbnRlcjogZnVuY3Rpb24gKGNlbnRlcikge1xuICAgICAgICBDRU5URVIgPSBjZW50ZXI7XG4gICAgfSxcblxuICAgIHNldFNlYXJjaEJvdW5kczogZnVuY3Rpb24gKGJib3gpIHtcbiAgICAgICAgQkJPWCA9IGJib3g7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdlb2NvZGVzIHRoZSBnaXZlbiBhZGRyZXNzLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSAgIGRhdGFzZXQgLSBUaGUgbWFwYm94IGRhdGFzZXQgKCdtYXBib3gucGxhY2VzJyBvciAnbWFwYm94LnBsYWNlcy1wZXJtYW5lbnQnKVxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gICBhZGRyZXNzIC0gVGhlIGFkZHJlc3MgdG8gZ2VvY29kZVxuICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBkb25lICAgIC0gQ2FsbGJhY2sgZnVuY3Rpb24gd2l0aCBhbiBlcnJvciBhbmQgdGhlIHJldHVybmVkIGRhdGEgYXMgcGFyYW1ldGVyXG4gICAgICovXG4gICAgZ2VvY29kZTogZnVuY3Rpb24gKGRhdGFzZXQsIGFkZHJlc3MsIGRvbmUpIHtcbiAgICAgICAgX19nZW9jb2RlUXVlcnkoZGF0YXNldCwgYWRkcmVzcywgZG9uZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldmVyc2UgZ2VvY29kZXMgdGhlIGdpdmVuIGxvbmdpdHVkZSBhbmQgbGF0aXR1ZGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9ICAgZGF0YXNldCAtIFRoZSBtYXBib3ggZGF0YXNldCAoJ21hcGJveC5wbGFjZXMnIG9yICdtYXBib3gucGxhY2VzLXBlcm1hbmVudCcpXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSAgIGFkZHJlc3MgLSBUaGUgYWRkcmVzcyB0byBnZW9jb2RlXG4gICAgICogQHBhcmFtICB7RnVuY3Rpb259IGRvbmUgICAgLSBDYWxsYmFjayBmdW5jdGlvbiB3aXRoIGFuIGVycm9yIGFuZCB0aGUgcmV0dXJuZWQgZGF0YSBhcyBwYXJhbWV0ZXJcbiAgICAgKi9cbiAgICByZXZlcnNlR2VvY29kZTogZnVuY3Rpb24gKGRhdGFzZXQsIGxuZywgbGF0LCBkb25lKSB7XG4gICAgICAgIHZhciBxdWVyeSA9IGxuZyArICcsJyArIGxhdDtcblxuICAgICAgICBfX2dlb2NvZGVRdWVyeShkYXRhc2V0LCBxdWVyeSwgZG9uZSk7XG4gICAgfVxufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL21hcGJveC1nZW9jb2RpbmcvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDM2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIEJyb3dzZXIgUmVxdWVzdFxuLy9cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vXG4vLyAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vL1xuLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuLy8gVU1EIEhFQURFUiBTVEFSVCBcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgICAgICBkZWZpbmUoW10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIC8vIE5vZGUuIERvZXMgbm90IHdvcmsgd2l0aCBzdHJpY3QgQ29tbW9uSlMsIGJ1dFxuICAgICAgICAvLyBvbmx5IENvbW1vbkpTLWxpa2UgZW52aXJvbWVudHMgdGhhdCBzdXBwb3J0IG1vZHVsZS5leHBvcnRzLFxuICAgICAgICAvLyBsaWtlIE5vZGUuXG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgICAgIHJvb3QucmV0dXJuRXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG4vLyBVTUQgSEVBREVSIEVORFxuXG52YXIgWEhSID0gWE1MSHR0cFJlcXVlc3RcbmlmICghWEhSKSB0aHJvdyBuZXcgRXJyb3IoJ21pc3NpbmcgWE1MSHR0cFJlcXVlc3QnKVxucmVxdWVzdC5sb2cgPSB7XG4gICd0cmFjZSc6IG5vb3AsICdkZWJ1Zyc6IG5vb3AsICdpbmZvJzogbm9vcCwgJ3dhcm4nOiBub29wLCAnZXJyb3InOiBub29wXG59XG5cbnZhciBERUZBVUxUX1RJTUVPVVQgPSAzICogNjAgKiAxMDAwIC8vIDMgbWludXRlc1xuXG4vL1xuLy8gcmVxdWVzdFxuLy9cblxuZnVuY3Rpb24gcmVxdWVzdChvcHRpb25zLCBjYWxsYmFjaykge1xuICAvLyBUaGUgZW50cnktcG9pbnQgdG8gdGhlIEFQSTogcHJlcCB0aGUgb3B0aW9ucyBvYmplY3QgYW5kIHBhc3MgdGhlIHJlYWwgd29yayB0byBydW5feGhyLlxuICBpZih0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdCYWQgY2FsbGJhY2sgZ2l2ZW46ICcgKyBjYWxsYmFjaylcblxuICBpZighb3B0aW9ucylcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIG9wdGlvbnMgZ2l2ZW4nKVxuXG4gIHZhciBvcHRpb25zX29uUmVzcG9uc2UgPSBvcHRpb25zLm9uUmVzcG9uc2U7IC8vIFNhdmUgdGhpcyBmb3IgbGF0ZXIuXG5cbiAgaWYodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKVxuICAgIG9wdGlvbnMgPSB7J3VyaSc6b3B0aW9uc307XG4gIGVsc2VcbiAgICBvcHRpb25zID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHRpb25zKSk7IC8vIFVzZSBhIGR1cGxpY2F0ZSBmb3IgbXV0YXRpbmcuXG5cbiAgb3B0aW9ucy5vblJlc3BvbnNlID0gb3B0aW9uc19vblJlc3BvbnNlIC8vIEFuZCBwdXQgaXQgYmFjay5cblxuICBpZiAob3B0aW9ucy52ZXJib3NlKSByZXF1ZXN0LmxvZyA9IGdldExvZ2dlcigpO1xuXG4gIGlmKG9wdGlvbnMudXJsKSB7XG4gICAgb3B0aW9ucy51cmkgPSBvcHRpb25zLnVybDtcbiAgICBkZWxldGUgb3B0aW9ucy51cmw7XG4gIH1cblxuICBpZighb3B0aW9ucy51cmkgJiYgb3B0aW9ucy51cmkgIT09IFwiXCIpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwib3B0aW9ucy51cmkgaXMgYSByZXF1aXJlZCBhcmd1bWVudFwiKTtcblxuICBpZih0eXBlb2Ygb3B0aW9ucy51cmkgIT0gXCJzdHJpbmdcIilcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJvcHRpb25zLnVyaSBtdXN0IGJlIGEgc3RyaW5nXCIpO1xuXG4gIHZhciB1bnN1cHBvcnRlZF9vcHRpb25zID0gWydwcm94eScsICdfcmVkaXJlY3RzRm9sbG93ZWQnLCAnbWF4UmVkaXJlY3RzJywgJ2ZvbGxvd1JlZGlyZWN0J11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB1bnN1cHBvcnRlZF9vcHRpb25zLmxlbmd0aDsgaSsrKVxuICAgIGlmKG9wdGlvbnNbIHVuc3VwcG9ydGVkX29wdGlvbnNbaV0gXSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9wdGlvbnMuXCIgKyB1bnN1cHBvcnRlZF9vcHRpb25zW2ldICsgXCIgaXMgbm90IHN1cHBvcnRlZFwiKVxuXG4gIG9wdGlvbnMuY2FsbGJhY2sgPSBjYWxsYmFja1xuICBvcHRpb25zLm1ldGhvZCA9IG9wdGlvbnMubWV0aG9kIHx8ICdHRVQnO1xuICBvcHRpb25zLmhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgfHwge307XG4gIG9wdGlvbnMuYm9keSAgICA9IG9wdGlvbnMuYm9keSB8fCBudWxsXG4gIG9wdGlvbnMudGltZW91dCA9IG9wdGlvbnMudGltZW91dCB8fCByZXF1ZXN0LkRFRkFVTFRfVElNRU9VVFxuXG4gIGlmKG9wdGlvbnMuaGVhZGVycy5ob3N0KVxuICAgIHRocm93IG5ldyBFcnJvcihcIk9wdGlvbnMuaGVhZGVycy5ob3N0IGlzIG5vdCBzdXBwb3J0ZWRcIik7XG5cbiAgaWYob3B0aW9ucy5qc29uKSB7XG4gICAgb3B0aW9ucy5oZWFkZXJzLmFjY2VwdCA9IG9wdGlvbnMuaGVhZGVycy5hY2NlcHQgfHwgJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgaWYob3B0aW9ucy5tZXRob2QgIT09ICdHRVQnKVxuICAgICAgb3B0aW9ucy5oZWFkZXJzWydjb250ZW50LXR5cGUnXSA9ICdhcHBsaWNhdGlvbi9qc29uJ1xuXG4gICAgaWYodHlwZW9mIG9wdGlvbnMuanNvbiAhPT0gJ2Jvb2xlYW4nKVxuICAgICAgb3B0aW9ucy5ib2R5ID0gSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5qc29uKVxuICAgIGVsc2UgaWYodHlwZW9mIG9wdGlvbnMuYm9keSAhPT0gJ3N0cmluZycpXG4gICAgICBvcHRpb25zLmJvZHkgPSBKU09OLnN0cmluZ2lmeShvcHRpb25zLmJvZHkpXG4gIH1cbiAgXG4gIC8vQkVHSU4gUVMgSGFja1xuICB2YXIgc2VyaWFsaXplID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHN0ciA9IFtdO1xuICAgIGZvcih2YXIgcCBpbiBvYmopXG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KHApKSB7XG4gICAgICAgIHN0ci5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChwKSArIFwiPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KG9ialtwXSkpO1xuICAgICAgfVxuICAgIHJldHVybiBzdHIuam9pbihcIiZcIik7XG4gIH1cbiAgXG4gIGlmKG9wdGlvbnMucXMpe1xuICAgIHZhciBxcyA9ICh0eXBlb2Ygb3B0aW9ucy5xcyA9PSAnc3RyaW5nJyk/IG9wdGlvbnMucXMgOiBzZXJpYWxpemUob3B0aW9ucy5xcyk7XG4gICAgaWYob3B0aW9ucy51cmkuaW5kZXhPZignPycpICE9PSAtMSl7IC8vbm8gZ2V0IHBhcmFtc1xuICAgICAgICBvcHRpb25zLnVyaSA9IG9wdGlvbnMudXJpKycmJytxcztcbiAgICB9ZWxzZXsgLy9leGlzdGluZyBnZXQgcGFyYW1zXG4gICAgICAgIG9wdGlvbnMudXJpID0gb3B0aW9ucy51cmkrJz8nK3FzO1xuICAgIH1cbiAgfVxuICAvL0VORCBRUyBIYWNrXG4gIFxuICAvL0JFR0lOIEZPUk0gSGFja1xuICB2YXIgbXVsdGlwYXJ0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgLy90b2RvOiBzdXBwb3J0IGZpbGUgdHlwZSAodXNlZnVsPylcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgcmVzdWx0LmJvdW5kcnkgPSAnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScrTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjEwMDAwMDAwMDApO1xuICAgIHZhciBsaW5lcyA9IFtdO1xuICAgIGZvcih2YXIgcCBpbiBvYmope1xuICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KHApKSB7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKFxuICAgICAgICAgICAgICAgICctLScrcmVzdWx0LmJvdW5kcnkrXCJcXG5cIitcbiAgICAgICAgICAgICAgICAnQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPVwiJytwKydcIicrXCJcXG5cIitcbiAgICAgICAgICAgICAgICBcIlxcblwiK1xuICAgICAgICAgICAgICAgIG9ialtwXStcIlxcblwiXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuICAgIGxpbmVzLnB1c2goICctLScrcmVzdWx0LmJvdW5kcnkrJy0tJyApO1xuICAgIHJlc3VsdC5ib2R5ID0gbGluZXMuam9pbignJyk7XG4gICAgcmVzdWx0Lmxlbmd0aCA9IHJlc3VsdC5ib2R5Lmxlbmd0aDtcbiAgICByZXN1bHQudHlwZSA9ICdtdWx0aXBhcnQvZm9ybS1kYXRhOyBib3VuZGFyeT0nK3Jlc3VsdC5ib3VuZHJ5O1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgXG4gIGlmKG9wdGlvbnMuZm9ybSl7XG4gICAgaWYodHlwZW9mIG9wdGlvbnMuZm9ybSA9PSAnc3RyaW5nJykgdGhyb3coJ2Zvcm0gbmFtZSB1bnN1cHBvcnRlZCcpO1xuICAgIGlmKG9wdGlvbnMubWV0aG9kID09PSAnUE9TVCcpe1xuICAgICAgICB2YXIgZW5jb2RpbmcgPSAob3B0aW9ucy5lbmNvZGluZyB8fCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgb3B0aW9ucy5oZWFkZXJzWydjb250ZW50LXR5cGUnXSA9IGVuY29kaW5nO1xuICAgICAgICBzd2l0Y2goZW5jb2Rpbmcpe1xuICAgICAgICAgICAgY2FzZSAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJzpcbiAgICAgICAgICAgICAgICBvcHRpb25zLmJvZHkgPSBzZXJpYWxpemUob3B0aW9ucy5mb3JtKS5yZXBsYWNlKC8lMjAvZywgXCIrXCIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbXVsdGlwYXJ0L2Zvcm0tZGF0YSc6XG4gICAgICAgICAgICAgICAgdmFyIG11bHRpID0gbXVsdGlwYXJ0KG9wdGlvbnMuZm9ybSk7XG4gICAgICAgICAgICAgICAgLy9vcHRpb25zLmhlYWRlcnNbJ2NvbnRlbnQtbGVuZ3RoJ10gPSBtdWx0aS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5ib2R5ID0gbXVsdGkuYm9keTtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddID0gbXVsdGkudHlwZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQgOiB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIGVuY29kaW5nOicrZW5jb2RpbmcpO1xuICAgICAgICB9XG4gICAgfVxuICB9XG4gIC8vRU5EIEZPUk0gSGFja1xuXG4gIC8vIElmIG9uUmVzcG9uc2UgaXMgYm9vbGVhbiB0cnVlLCBjYWxsIGJhY2sgaW1tZWRpYXRlbHkgd2hlbiB0aGUgcmVzcG9uc2UgaXMga25vd24sXG4gIC8vIG5vdCB3aGVuIHRoZSBmdWxsIHJlcXVlc3QgaXMgY29tcGxldGUuXG4gIG9wdGlvbnMub25SZXNwb25zZSA9IG9wdGlvbnMub25SZXNwb25zZSB8fCBub29wXG4gIGlmKG9wdGlvbnMub25SZXNwb25zZSA9PT0gdHJ1ZSkge1xuICAgIG9wdGlvbnMub25SZXNwb25zZSA9IGNhbGxiYWNrXG4gICAgb3B0aW9ucy5jYWxsYmFjayA9IG5vb3BcbiAgfVxuXG4gIC8vIFhYWCBCcm93c2VycyBkbyBub3QgbGlrZSB0aGlzLlxuICAvL2lmKG9wdGlvbnMuYm9keSlcbiAgLy8gIG9wdGlvbnMuaGVhZGVyc1snY29udGVudC1sZW5ndGgnXSA9IG9wdGlvbnMuYm9keS5sZW5ndGg7XG5cbiAgLy8gSFRUUCBiYXNpYyBhdXRoZW50aWNhdGlvblxuICBpZighb3B0aW9ucy5oZWFkZXJzLmF1dGhvcml6YXRpb24gJiYgb3B0aW9ucy5hdXRoKVxuICAgIG9wdGlvbnMuaGVhZGVycy5hdXRob3JpemF0aW9uID0gJ0Jhc2ljICcgKyBiNjRfZW5jKG9wdGlvbnMuYXV0aC51c2VybmFtZSArICc6JyArIG9wdGlvbnMuYXV0aC5wYXNzd29yZCk7XG5cbiAgcmV0dXJuIHJ1bl94aHIob3B0aW9ucylcbn1cblxudmFyIHJlcV9zZXEgPSAwXG5mdW5jdGlvbiBydW5feGhyKG9wdGlvbnMpIHtcbiAgdmFyIHhociA9IG5ldyBYSFJcbiAgICAsIHRpbWVkX291dCA9IGZhbHNlXG4gICAgLCBpc19jb3JzID0gaXNfY3Jvc3NEb21haW4ob3B0aW9ucy51cmkpXG4gICAgLCBzdXBwb3J0c19jb3JzID0gKCd3aXRoQ3JlZGVudGlhbHMnIGluIHhocilcblxuICByZXFfc2VxICs9IDFcbiAgeGhyLnNlcV9pZCA9IHJlcV9zZXFcbiAgeGhyLmlkID0gcmVxX3NlcSArICc6ICcgKyBvcHRpb25zLm1ldGhvZCArICcgJyArIG9wdGlvbnMudXJpXG4gIHhoci5faWQgPSB4aHIuaWQgLy8gSSBrbm93IEkgd2lsbCB0eXBlIFwiX2lkXCIgZnJvbSBoYWJpdCBhbGwgdGhlIHRpbWUuXG5cbiAgaWYoaXNfY29ycyAmJiAhc3VwcG9ydHNfY29ycykge1xuICAgIHZhciBjb3JzX2VyciA9IG5ldyBFcnJvcignQnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGNyb3NzLW9yaWdpbiByZXF1ZXN0OiAnICsgb3B0aW9ucy51cmkpXG4gICAgY29yc19lcnIuY29ycyA9ICd1bnN1cHBvcnRlZCdcbiAgICByZXR1cm4gb3B0aW9ucy5jYWxsYmFjayhjb3JzX2VyciwgeGhyKVxuICB9XG5cbiAgeGhyLnRpbWVvdXRUaW1lciA9IHNldFRpbWVvdXQodG9vX2xhdGUsIG9wdGlvbnMudGltZW91dClcbiAgZnVuY3Rpb24gdG9vX2xhdGUoKSB7XG4gICAgdGltZWRfb3V0ID0gdHJ1ZVxuICAgIHZhciBlciA9IG5ldyBFcnJvcignRVRJTUVET1VUJylcbiAgICBlci5jb2RlID0gJ0VUSU1FRE9VVCdcbiAgICBlci5kdXJhdGlvbiA9IG9wdGlvbnMudGltZW91dFxuXG4gICAgcmVxdWVzdC5sb2cuZXJyb3IoJ1RpbWVvdXQnLCB7ICdpZCc6eGhyLl9pZCwgJ21pbGxpc2Vjb25kcyc6b3B0aW9ucy50aW1lb3V0IH0pXG4gICAgcmV0dXJuIG9wdGlvbnMuY2FsbGJhY2soZXIsIHhocilcbiAgfVxuXG4gIC8vIFNvbWUgc3RhdGVzIGNhbiBiZSBza2lwcGVkIG92ZXIsIHNvIHJlbWVtYmVyIHdoYXQgaXMgc3RpbGwgaW5jb21wbGV0ZS5cbiAgdmFyIGRpZCA9IHsncmVzcG9uc2UnOmZhbHNlLCAnbG9hZGluZyc6ZmFsc2UsICdlbmQnOmZhbHNlfVxuXG4gIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBvbl9zdGF0ZV9jaGFuZ2VcbiAgeGhyLm9wZW4ob3B0aW9ucy5tZXRob2QsIG9wdGlvbnMudXJpLCB0cnVlKSAvLyBhc3luY2hyb25vdXNcbiAgaWYoaXNfY29ycylcbiAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gISEgb3B0aW9ucy53aXRoQ3JlZGVudGlhbHNcbiAgeGhyLnNlbmQob3B0aW9ucy5ib2R5KVxuICByZXR1cm4geGhyXG5cbiAgZnVuY3Rpb24gb25fc3RhdGVfY2hhbmdlKGV2ZW50KSB7XG4gICAgaWYodGltZWRfb3V0KVxuICAgICAgcmV0dXJuIHJlcXVlc3QubG9nLmRlYnVnKCdJZ25vcmluZyB0aW1lZCBvdXQgc3RhdGUgY2hhbmdlJywgeydzdGF0ZSc6eGhyLnJlYWR5U3RhdGUsICdpZCc6eGhyLmlkfSlcblxuICAgIHJlcXVlc3QubG9nLmRlYnVnKCdTdGF0ZSBjaGFuZ2UnLCB7J3N0YXRlJzp4aHIucmVhZHlTdGF0ZSwgJ2lkJzp4aHIuaWQsICd0aW1lZF9vdXQnOnRpbWVkX291dH0pXG5cbiAgICBpZih4aHIucmVhZHlTdGF0ZSA9PT0gWEhSLk9QRU5FRCkge1xuICAgICAgcmVxdWVzdC5sb2cuZGVidWcoJ1JlcXVlc3Qgc3RhcnRlZCcsIHsnaWQnOnhoci5pZH0pXG4gICAgICBmb3IgKHZhciBrZXkgaW4gb3B0aW9ucy5oZWFkZXJzKVxuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihrZXksIG9wdGlvbnMuaGVhZGVyc1trZXldKVxuICAgIH1cblxuICAgIGVsc2UgaWYoeGhyLnJlYWR5U3RhdGUgPT09IFhIUi5IRUFERVJTX1JFQ0VJVkVEKVxuICAgICAgb25fcmVzcG9uc2UoKVxuXG4gICAgZWxzZSBpZih4aHIucmVhZHlTdGF0ZSA9PT0gWEhSLkxPQURJTkcpIHtcbiAgICAgIG9uX3Jlc3BvbnNlKClcbiAgICAgIG9uX2xvYWRpbmcoKVxuICAgIH1cblxuICAgIGVsc2UgaWYoeGhyLnJlYWR5U3RhdGUgPT09IFhIUi5ET05FKSB7XG4gICAgICBvbl9yZXNwb25zZSgpXG4gICAgICBvbl9sb2FkaW5nKClcbiAgICAgIG9uX2VuZCgpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25fcmVzcG9uc2UoKSB7XG4gICAgaWYoZGlkLnJlc3BvbnNlKVxuICAgICAgcmV0dXJuXG5cbiAgICBkaWQucmVzcG9uc2UgPSB0cnVlXG4gICAgcmVxdWVzdC5sb2cuZGVidWcoJ0dvdCByZXNwb25zZScsIHsnaWQnOnhoci5pZCwgJ3N0YXR1cyc6eGhyLnN0YXR1c30pXG4gICAgY2xlYXJUaW1lb3V0KHhoci50aW1lb3V0VGltZXIpXG4gICAgeGhyLnN0YXR1c0NvZGUgPSB4aHIuc3RhdHVzIC8vIE5vZGUgcmVxdWVzdCBjb21wYXRpYmlsaXR5XG5cbiAgICAvLyBEZXRlY3QgZmFpbGVkIENPUlMgcmVxdWVzdHMuXG4gICAgaWYoaXNfY29ycyAmJiB4aHIuc3RhdHVzQ29kZSA9PSAwKSB7XG4gICAgICB2YXIgY29yc19lcnIgPSBuZXcgRXJyb3IoJ0NPUlMgcmVxdWVzdCByZWplY3RlZDogJyArIG9wdGlvbnMudXJpKVxuICAgICAgY29yc19lcnIuY29ycyA9ICdyZWplY3RlZCdcblxuICAgICAgLy8gRG8gbm90IHByb2Nlc3MgdGhpcyByZXF1ZXN0IGZ1cnRoZXIuXG4gICAgICBkaWQubG9hZGluZyA9IHRydWVcbiAgICAgIGRpZC5lbmQgPSB0cnVlXG5cbiAgICAgIHJldHVybiBvcHRpb25zLmNhbGxiYWNrKGNvcnNfZXJyLCB4aHIpXG4gICAgfVxuXG4gICAgb3B0aW9ucy5vblJlc3BvbnNlKG51bGwsIHhocilcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uX2xvYWRpbmcoKSB7XG4gICAgaWYoZGlkLmxvYWRpbmcpXG4gICAgICByZXR1cm5cblxuICAgIGRpZC5sb2FkaW5nID0gdHJ1ZVxuICAgIHJlcXVlc3QubG9nLmRlYnVnKCdSZXNwb25zZSBib2R5IGxvYWRpbmcnLCB7J2lkJzp4aHIuaWR9KVxuICAgIC8vIFRPRE86IE1heWJlIHNpbXVsYXRlIFwiZGF0YVwiIGV2ZW50cyBieSB3YXRjaGluZyB4aHIucmVzcG9uc2VUZXh0XG4gIH1cblxuICBmdW5jdGlvbiBvbl9lbmQoKSB7XG4gICAgaWYoZGlkLmVuZClcbiAgICAgIHJldHVyblxuXG4gICAgZGlkLmVuZCA9IHRydWVcbiAgICByZXF1ZXN0LmxvZy5kZWJ1ZygnUmVxdWVzdCBkb25lJywgeydpZCc6eGhyLmlkfSlcblxuICAgIHhoci5ib2R5ID0geGhyLnJlc3BvbnNlVGV4dFxuICAgIGlmKG9wdGlvbnMuanNvbikge1xuICAgICAgdHJ5ICAgICAgICB7IHhoci5ib2R5ID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KSB9XG4gICAgICBjYXRjaCAoZXIpIHsgcmV0dXJuIG9wdGlvbnMuY2FsbGJhY2soZXIsIHhocikgICAgICAgIH1cbiAgICB9XG5cbiAgICBvcHRpb25zLmNhbGxiYWNrKG51bGwsIHhociwgeGhyLmJvZHkpXG4gIH1cblxufSAvLyByZXF1ZXN0XG5cbnJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID0gZmFsc2U7XG5yZXF1ZXN0LkRFRkFVTFRfVElNRU9VVCA9IERFRkFVTFRfVElNRU9VVDtcblxuLy9cbi8vIGRlZmF1bHRzXG4vL1xuXG5yZXF1ZXN0LmRlZmF1bHRzID0gZnVuY3Rpb24ob3B0aW9ucywgcmVxdWVzdGVyKSB7XG4gIHZhciBkZWYgPSBmdW5jdGlvbiAobWV0aG9kKSB7XG4gICAgdmFyIGQgPSBmdW5jdGlvbiAocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgaWYodHlwZW9mIHBhcmFtcyA9PT0gJ3N0cmluZycpXG4gICAgICAgIHBhcmFtcyA9IHsndXJpJzogcGFyYW1zfTtcbiAgICAgIGVsc2Uge1xuICAgICAgICBwYXJhbXMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHBhcmFtcykpO1xuICAgICAgfVxuICAgICAgZm9yICh2YXIgaSBpbiBvcHRpb25zKSB7XG4gICAgICAgIGlmIChwYXJhbXNbaV0gPT09IHVuZGVmaW5lZCkgcGFyYW1zW2ldID0gb3B0aW9uc1tpXVxuICAgICAgfVxuICAgICAgcmV0dXJuIG1ldGhvZChwYXJhbXMsIGNhbGxiYWNrKVxuICAgIH1cbiAgICByZXR1cm4gZFxuICB9XG4gIHZhciBkZSA9IGRlZihyZXF1ZXN0KVxuICBkZS5nZXQgPSBkZWYocmVxdWVzdC5nZXQpXG4gIGRlLnBvc3QgPSBkZWYocmVxdWVzdC5wb3N0KVxuICBkZS5wdXQgPSBkZWYocmVxdWVzdC5wdXQpXG4gIGRlLmhlYWQgPSBkZWYocmVxdWVzdC5oZWFkKVxuICByZXR1cm4gZGVcbn1cblxuLy9cbi8vIEhUVFAgbWV0aG9kIHNob3J0Y3V0c1xuLy9cblxudmFyIHNob3J0Y3V0cyA9IFsgJ2dldCcsICdwdXQnLCAncG9zdCcsICdoZWFkJyBdO1xuc2hvcnRjdXRzLmZvckVhY2goZnVuY3Rpb24oc2hvcnRjdXQpIHtcbiAgdmFyIG1ldGhvZCA9IHNob3J0Y3V0LnRvVXBwZXJDYXNlKCk7XG4gIHZhciBmdW5jICAgPSBzaG9ydGN1dC50b0xvd2VyQ2FzZSgpO1xuXG4gIHJlcXVlc3RbZnVuY10gPSBmdW5jdGlvbihvcHRzKSB7XG4gICAgaWYodHlwZW9mIG9wdHMgPT09ICdzdHJpbmcnKVxuICAgICAgb3B0cyA9IHsnbWV0aG9kJzptZXRob2QsICd1cmknOm9wdHN9O1xuICAgIGVsc2Uge1xuICAgICAgb3B0cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3B0cykpO1xuICAgICAgb3B0cy5tZXRob2QgPSBtZXRob2Q7XG4gICAgfVxuXG4gICAgdmFyIGFyZ3MgPSBbb3B0c10uY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5hcHBseShhcmd1bWVudHMsIFsxXSkpO1xuICAgIHJldHVybiByZXF1ZXN0LmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG59KVxuXG4vL1xuLy8gQ291Y2hEQiBzaG9ydGN1dFxuLy9cblxucmVxdWVzdC5jb3VjaCA9IGZ1bmN0aW9uKG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gIGlmKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJylcbiAgICBvcHRpb25zID0geyd1cmknOm9wdGlvbnN9XG5cbiAgLy8gSnVzdCB1c2UgdGhlIHJlcXVlc3QgQVBJIHRvIGRvIEpTT04uXG4gIG9wdGlvbnMuanNvbiA9IHRydWVcbiAgaWYob3B0aW9ucy5ib2R5KVxuICAgIG9wdGlvbnMuanNvbiA9IG9wdGlvbnMuYm9keVxuICBkZWxldGUgb3B0aW9ucy5ib2R5XG5cbiAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wXG5cbiAgdmFyIHhociA9IHJlcXVlc3Qob3B0aW9ucywgY291Y2hfaGFuZGxlcilcbiAgcmV0dXJuIHhoclxuXG4gIGZ1bmN0aW9uIGNvdWNoX2hhbmRsZXIoZXIsIHJlc3AsIGJvZHkpIHtcbiAgICBpZihlcilcbiAgICAgIHJldHVybiBjYWxsYmFjayhlciwgcmVzcCwgYm9keSlcblxuICAgIGlmKChyZXNwLnN0YXR1c0NvZGUgPCAyMDAgfHwgcmVzcC5zdGF0dXNDb2RlID4gMjk5KSAmJiBib2R5LmVycm9yKSB7XG4gICAgICAvLyBUaGUgYm9keSBpcyBhIENvdWNoIEpTT04gb2JqZWN0IGluZGljYXRpbmcgdGhlIGVycm9yLlxuICAgICAgZXIgPSBuZXcgRXJyb3IoJ0NvdWNoREIgZXJyb3I6ICcgKyAoYm9keS5lcnJvci5yZWFzb24gfHwgYm9keS5lcnJvci5lcnJvcikpXG4gICAgICBmb3IgKHZhciBrZXkgaW4gYm9keSlcbiAgICAgICAgZXJba2V5XSA9IGJvZHlba2V5XVxuICAgICAgcmV0dXJuIGNhbGxiYWNrKGVyLCByZXNwLCBib2R5KTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2FsbGJhY2soZXIsIHJlc3AsIGJvZHkpO1xuICB9XG59XG5cbi8vXG4vLyBVdGlsaXR5XG4vL1xuXG5mdW5jdGlvbiBub29wKCkge31cblxuZnVuY3Rpb24gZ2V0TG9nZ2VyKCkge1xuICB2YXIgbG9nZ2VyID0ge31cbiAgICAsIGxldmVscyA9IFsndHJhY2UnLCAnZGVidWcnLCAnaW5mbycsICd3YXJuJywgJ2Vycm9yJ11cbiAgICAsIGxldmVsLCBpXG5cbiAgZm9yKGkgPSAwOyBpIDwgbGV2ZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV2ZWwgPSBsZXZlbHNbaV1cblxuICAgIGxvZ2dlcltsZXZlbF0gPSBub29wXG4gICAgaWYodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGUgJiYgY29uc29sZVtsZXZlbF0pXG4gICAgICBsb2dnZXJbbGV2ZWxdID0gZm9ybWF0dGVkKGNvbnNvbGUsIGxldmVsKVxuICB9XG5cbiAgcmV0dXJuIGxvZ2dlclxufVxuXG5mdW5jdGlvbiBmb3JtYXR0ZWQob2JqLCBtZXRob2QpIHtcbiAgcmV0dXJuIGZvcm1hdHRlZF9sb2dnZXJcblxuICBmdW5jdGlvbiBmb3JtYXR0ZWRfbG9nZ2VyKHN0ciwgY29udGV4dCkge1xuICAgIGlmKHR5cGVvZiBjb250ZXh0ID09PSAnb2JqZWN0JylcbiAgICAgIHN0ciArPSAnICcgKyBKU09OLnN0cmluZ2lmeShjb250ZXh0KVxuXG4gICAgcmV0dXJuIG9ialttZXRob2RdLmNhbGwob2JqLCBzdHIpXG4gIH1cbn1cblxuLy8gUmV0dXJuIHdoZXRoZXIgYSBVUkwgaXMgYSBjcm9zcy1kb21haW4gcmVxdWVzdC5cbmZ1bmN0aW9uIGlzX2Nyb3NzRG9tYWluKHVybCkge1xuICB2YXIgcnVybCA9IC9eKFtcXHdcXCtcXC5cXC1dKzopKD86XFwvXFwvKFteXFwvPyM6XSopKD86OihcXGQrKSk/KT8vXG5cbiAgLy8galF1ZXJ5ICM4MTM4LCBJRSBtYXkgdGhyb3cgYW4gZXhjZXB0aW9uIHdoZW4gYWNjZXNzaW5nXG4gIC8vIGEgZmllbGQgZnJvbSB3aW5kb3cubG9jYXRpb24gaWYgZG9jdW1lbnQuZG9tYWluIGhhcyBiZWVuIHNldFxuICB2YXIgYWpheExvY2F0aW9uXG4gIHRyeSB7IGFqYXhMb2NhdGlvbiA9IGxvY2F0aW9uLmhyZWYgfVxuICBjYXRjaCAoZSkge1xuICAgIC8vIFVzZSB0aGUgaHJlZiBhdHRyaWJ1dGUgb2YgYW4gQSBlbGVtZW50IHNpbmNlIElFIHdpbGwgbW9kaWZ5IGl0IGdpdmVuIGRvY3VtZW50LmxvY2F0aW9uXG4gICAgYWpheExvY2F0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggXCJhXCIgKTtcbiAgICBhamF4TG9jYXRpb24uaHJlZiA9IFwiXCI7XG4gICAgYWpheExvY2F0aW9uID0gYWpheExvY2F0aW9uLmhyZWY7XG4gIH1cblxuICB2YXIgYWpheExvY1BhcnRzID0gcnVybC5leGVjKGFqYXhMb2NhdGlvbi50b0xvd2VyQ2FzZSgpKSB8fCBbXVxuICAgICwgcGFydHMgPSBydXJsLmV4ZWModXJsLnRvTG93ZXJDYXNlKCkgKVxuXG4gIHZhciByZXN1bHQgPSAhIShcbiAgICBwYXJ0cyAmJlxuICAgICggIHBhcnRzWzFdICE9IGFqYXhMb2NQYXJ0c1sxXVxuICAgIHx8IHBhcnRzWzJdICE9IGFqYXhMb2NQYXJ0c1syXVxuICAgIHx8IChwYXJ0c1szXSB8fCAocGFydHNbMV0gPT09IFwiaHR0cDpcIiA/IDgwIDogNDQzKSkgIT0gKGFqYXhMb2NQYXJ0c1szXSB8fCAoYWpheExvY1BhcnRzWzFdID09PSBcImh0dHA6XCIgPyA4MCA6IDQ0MykpXG4gICAgKVxuICApXG5cbiAgLy9jb25zb2xlLmRlYnVnKCdpc19jcm9zc0RvbWFpbignK3VybCsnKSAtPiAnICsgcmVzdWx0KVxuICByZXR1cm4gcmVzdWx0XG59XG5cbi8vIE1JVCBMaWNlbnNlIGZyb20gaHR0cDovL3BocGpzLm9yZy9mdW5jdGlvbnMvYmFzZTY0X2VuY29kZTozNThcbmZ1bmN0aW9uIGI2NF9lbmMgKGRhdGEpIHtcbiAgICAvLyBFbmNvZGVzIHN0cmluZyB1c2luZyBNSU1FIGJhc2U2NCBhbGdvcml0aG1cbiAgICB2YXIgYjY0ID0gXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPVwiO1xuICAgIHZhciBvMSwgbzIsIG8zLCBoMSwgaDIsIGgzLCBoNCwgYml0cywgaSA9IDAsIGFjID0gMCwgZW5jPVwiXCIsIHRtcF9hcnIgPSBbXTtcblxuICAgIGlmICghZGF0YSkge1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG5cbiAgICAvLyBhc3N1bWUgdXRmOCBkYXRhXG4gICAgLy8gZGF0YSA9IHRoaXMudXRmOF9lbmNvZGUoZGF0YSsnJyk7XG5cbiAgICBkbyB7IC8vIHBhY2sgdGhyZWUgb2N0ZXRzIGludG8gZm91ciBoZXhldHNcbiAgICAgICAgbzEgPSBkYXRhLmNoYXJDb2RlQXQoaSsrKTtcbiAgICAgICAgbzIgPSBkYXRhLmNoYXJDb2RlQXQoaSsrKTtcbiAgICAgICAgbzMgPSBkYXRhLmNoYXJDb2RlQXQoaSsrKTtcblxuICAgICAgICBiaXRzID0gbzE8PDE2IHwgbzI8PDggfCBvMztcblxuICAgICAgICBoMSA9IGJpdHM+PjE4ICYgMHgzZjtcbiAgICAgICAgaDIgPSBiaXRzPj4xMiAmIDB4M2Y7XG4gICAgICAgIGgzID0gYml0cz4+NiAmIDB4M2Y7XG4gICAgICAgIGg0ID0gYml0cyAmIDB4M2Y7XG5cbiAgICAgICAgLy8gdXNlIGhleGV0cyB0byBpbmRleCBpbnRvIGI2NCwgYW5kIGFwcGVuZCByZXN1bHQgdG8gZW5jb2RlZCBzdHJpbmdcbiAgICAgICAgdG1wX2FyclthYysrXSA9IGI2NC5jaGFyQXQoaDEpICsgYjY0LmNoYXJBdChoMikgKyBiNjQuY2hhckF0KGgzKSArIGI2NC5jaGFyQXQoaDQpO1xuICAgIH0gd2hpbGUgKGkgPCBkYXRhLmxlbmd0aCk7XG5cbiAgICBlbmMgPSB0bXBfYXJyLmpvaW4oJycpO1xuXG4gICAgc3dpdGNoIChkYXRhLmxlbmd0aCAlIDMpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgZW5jID0gZW5jLnNsaWNlKDAsIC0yKSArICc9PSc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBlbmMgPSBlbmMuc2xpY2UoMCwgLTEpICsgJz0nO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gZW5jO1xufVxuICAgIHJldHVybiByZXF1ZXN0O1xuLy9VTUQgRk9PVEVSIFNUQVJUXG59KSk7XG4vL1VNRCBGT09URVIgRU5EXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9icm93c2VyLXJlcXVlc3QvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDM3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnO1xuXG5pbXBvcnQgcG9seWxpbmUgZnJvbSAnLi92ZW5kb3IvcG9seWxpbmUnO1xuXG4vLyBjb25zdCBwb2x5bGluZSA9IHJlcXVpcmUoJ0BtYXBib3gvcG9seWxpbmUnKTtcblxuXG5mdW5jdGlvbiBsYXRMbmdQYWlyVG9HZW9Kc29uUG9pbnQocGFpcikge1xuICAvLyBHZW9KU09OIGlzIGluIHRoZSBvcHBvc2l0ZSBvcmRlcjogTG9uZ2l0dWRlLCB0aGVuIExhdGl0dWRlXG4gIHJldHVybiBbcGFpclsxXSwgcGFpclswXV07XG59XG5cbi8qKlxuICogRmV0Y2ggcm91dGUgcG9pbnQgYSB0byBwb2ludCBiLCBjYWxsIGNhbGxiYWNrIHdoZW4gZG9uZS5cbiAqIEBwYXJhbSB7UG9pbnR9IGZyb21cbiAqIEBwYXJhbSB7UG9pbnR9IHRvXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmZXRjaFJvdXRlKGEsIGIsIGNhbGxiYWNrKSB7XG4gIC8vIGJ1aWxkIGFuZCBzdWJtaXQgcmVxdWVzdCwgdGhlbiBjYWxsIGNhbGxiYWNrLlxuXG4gIGNvbnN0IGJhc2VVcmwgPSAnaHR0cHM6Ly92YWxoYWxsYS5tYXB6ZW4uY29tL3JvdXRlJztcblxuICBjb25zdCByb3V0ZUNvbmZpZyA9IHtcbiAgICBsb2NhdGlvbnM6XG4gICAgICBbXG4gICAgICAgIHsgbGF0OiBhLmxhdGl0dWRlLCBsb246IGEubG9uZ2l0dWRlLCBzdHJlZXQ6IGEuYWRkcmVzcyB9LFxuICAgICAgICB7IGxhdDogYi5sYXRpdHVkZSwgbG9uOiBiLmxvbmdpdHVkZSwgc3RyZWV0OiBiLmFkZHJlc3MgfSxcbiAgICAgIF0sXG4gICAgY29zdGluZzogJ2JpY3ljbGUnLFxuICAgIGNvc3Rpbmdfb3B0aW9uczoge1xuICAgICAgYmljeWNsZToge1xuICAgICAgICBiaWN5Y2xlX3R5cGU6ICdNb3VudGFpbicsIC8vIGJpa2Ugc2hhcmU6IGJpZ2dlciBhbmQgc2xvd2VyLlxuICAgICAgICB1c2Vfcm9hZHM6IDAuMjUsXG4gICAgICAgIHVzZV9oaWxsczogMC4xLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGRpcmVjdGlvbnNfb3B0aW9uczoge1xuICAgICAgdW5pdHM6ICdtaWxlcycsXG4gICAgfSxcbiAgICBpZDogJ3JvdXRlJyxcbiAgfTtcblxuICBjb25zdCByb3V0ZVByb3ZpZGVyVVJMID0gYCR7YmFzZVVybH0/anNvbj0ke0pTT04uc3RyaW5naWZ5KHJvdXRlQ29uZmlnKX0mYXBpX2tleT0ke2NvbmZpZy5tYXB6ZW5LZXl9YDtcblxuICBmZXRjaChyb3V0ZVByb3ZpZGVyVVJMKVxuICAgIC50aGVuKHJlc3AgPT4gcmVzcC5qc29uKCkpXG4gICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCdnb3Qgcm91dGUgZGF0YTogJywgZGF0YSk7XG4gICAgICBpZiAoZGF0YS50cmlwICYmIGRhdGEudHJpcC5sZWdzKSB7XG4gICAgICAgIC8vIGdlbmVyYXRlIGEgTXVsdGlMaW5lU3RyaW5nIChlYWNoIGxlZyBiZWNvbWVzIGEgbGluZSlcbiAgICAgICAgY29uc3QgbXVsdGlMaW5lQ29vcmRzID0gZGF0YS50cmlwLmxlZ3MubWFwKChsZWcpID0+IHtcbiAgICAgICAgICBjb25zdCBhcnIgPSBwb2x5bGluZS5kZWNvZGUobGVnLnNoYXBlKTsgLy8gcmV0dXJucyBhcnJheSBvZiBsYXQsIGxvbiBwYWlyc1xuICAgICAgICAgIC8vIGVhY2ggbGVnIGJlY29tZXMgdGhlIGNvb3JkaW5hdGVzIGZvciBhIExpbmVTdHJpbmcsXG4gICAgICAgICAgcmV0dXJuIGFyci5tYXAobGF0TG5nUGFpclRvR2VvSnNvblBvaW50KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IG11bHRpTGluZVN0cmluZyA9IHtcbiAgICAgICAgICB0eXBlOiAnRmVhdHVyZScsXG4gICAgICAgICAgcHJvcGVydGllczoge30sXG4gICAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICAgIHR5cGU6ICdNdWx0aUxpbmVTdHJpbmcnLFxuICAgICAgICAgICAgY29vcmRpbmF0ZXM6IG11bHRpTGluZUNvb3JkcyxcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgICBjb25zb2xlLmxvZygnZmV0Y2hlZCByb3V0ZSBhcyBtYXBwYWJsZSBmZWF0dXJlOiAnLCBtdWx0aUxpbmVTdHJpbmcpO1xuICAgICAgICBjYWxsYmFjayhtdWx0aUxpbmVTdHJpbmcpO1xuICAgICAgfVxuICAgIH0pXG4gICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ2Vycm9yIGZldGNoaW5nIHJvdXRlOiAnLCBlcnJvcik7XG4gICAgfSk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcm91dGVyLmpzIiwiXG4vLyBGcm9tOiBodHRwczovL21hcHplbi5jb20vZG9jdW1lbnRhdGlvbi9tb2JpbGl0eS9kZWNvZGluZy9cbmNvbnN0IHBvbHlsaW5lID0ge307XG5cbi8vIFRoaXMgaXMgYWRhcHRlZCBmcm9tIHRoZSBpbXBsZW1lbnRhdGlvbiBpbiBQcm9qZWN0LU9TUk1cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9EZW5uaXNPU1JNL1Byb2plY3QtT1NSTS1XZWIvYmxvYi9tYXN0ZXIvV2ViQ29udGVudC9yb3V0aW5nL09TUk0uUm91dGluZ0dlb21ldHJ5LmpzXG5wb2x5bGluZS5kZWNvZGUgPSBmdW5jdGlvbiAoc3RyLCBwcmVjaXNpb24pIHtcbiAgbGV0IGluZGV4ID0gMCxcbiAgICBsYXQgPSAwLFxuICAgIGxuZyA9IDAsXG4gICAgY29vcmRpbmF0ZXMgPSBbXSxcbiAgICBzaGlmdCA9IDAsXG4gICAgcmVzdWx0ID0gMCxcbiAgICBieXRlID0gbnVsbCxcbiAgICBsYXRpdHVkZV9jaGFuZ2UsXG4gICAgbG9uZ2l0dWRlX2NoYW5nZSxcbiAgICBmYWN0b3IgPSBNYXRoLnBvdygxMCwgcHJlY2lzaW9uIHx8IDYpO1xuXG4gICAgLy8gQ29vcmRpbmF0ZXMgaGF2ZSB2YXJpYWJsZSBsZW5ndGggd2hlbiBlbmNvZGVkLCBzbyBqdXN0IGtlZXBcbiAgICAvLyB0cmFjayBvZiB3aGV0aGVyIHdlJ3ZlIGhpdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcuIEluIGVhY2hcbiAgICAvLyBsb29wIGl0ZXJhdGlvbiwgYSBzaW5nbGUgY29vcmRpbmF0ZSBpcyBkZWNvZGVkLlxuICB3aGlsZSAoaW5kZXggPCBzdHIubGVuZ3RoKSB7XG4gICAgLy8gUmVzZXQgc2hpZnQsIHJlc3VsdCwgYW5kIGJ5dGVcbiAgICBieXRlID0gbnVsbDtcbiAgICBzaGlmdCA9IDA7XG4gICAgcmVzdWx0ID0gMDtcblxuICAgIGRvIHtcbiAgICAgIGJ5dGUgPSBzdHIuY2hhckNvZGVBdChpbmRleCsrKSAtIDYzO1xuICAgICAgcmVzdWx0IHw9IChieXRlICYgMHgxZikgPDwgc2hpZnQ7XG4gICAgICBzaGlmdCArPSA1O1xuICAgIH0gd2hpbGUgKGJ5dGUgPj0gMHgyMCk7XG5cbiAgICBsYXRpdHVkZV9jaGFuZ2UgPSAoKHJlc3VsdCAmIDEpID8gfihyZXN1bHQgPj4gMSkgOiAocmVzdWx0ID4+IDEpKTtcblxuICAgIHNoaWZ0ID0gcmVzdWx0ID0gMDtcblxuICAgIGRvIHtcbiAgICAgIGJ5dGUgPSBzdHIuY2hhckNvZGVBdChpbmRleCsrKSAtIDYzO1xuICAgICAgcmVzdWx0IHw9IChieXRlICYgMHgxZikgPDwgc2hpZnQ7XG4gICAgICBzaGlmdCArPSA1O1xuICAgIH0gd2hpbGUgKGJ5dGUgPj0gMHgyMCk7XG5cbiAgICBsb25naXR1ZGVfY2hhbmdlID0gKChyZXN1bHQgJiAxKSA/IH4ocmVzdWx0ID4+IDEpIDogKHJlc3VsdCA+PiAxKSk7XG5cbiAgICBsYXQgKz0gbGF0aXR1ZGVfY2hhbmdlO1xuICAgIGxuZyArPSBsb25naXR1ZGVfY2hhbmdlO1xuXG4gICAgY29vcmRpbmF0ZXMucHVzaChbbGF0IC8gZmFjdG9yLCBsbmcgLyBmYWN0b3JdKTtcbiAgfVxuXG4gIHJldHVybiBjb29yZGluYXRlcztcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHBvbHlsaW5lO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92ZW5kb3IvcG9seWxpbmUuanMiLCJcbmltcG9ydCBzdGF0ZSBmcm9tICcuL3N0YXRlJztcbmltcG9ydCB7IG1hcFVwZGF0ZURpcmVjdGlvbnNFbmRwb2ludCB9IGZyb20gJy4vbWFwJztcblxuaW1wb3J0IHVzZXJSZXZlcnNlR2VvY29kZSBmcm9tICcuL3VzZXJSZXZlcnNlR2VvY29kZSc7XG5cbi8qKlxuICogVGhlIG9yaWdpbiBsb2NhdG9yIGJ1dHRvbiB1cGRhdGVzIHRoZSBvcmlnaW4gaW5wdXQgYmFzZWRcbiAqIG9uIHRoZSB1c2VyJ3MgbG9jYXRpb24uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGluaXRPcmlnaW5Mb2NhdG9yQnRuKCkge1xuICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdkaXJlY3Rpb25zLS1sb2NhdGUtb3JpZ2luJylbMF07XG4gIC8vIGNvbnNvbGUubG9nKCdpbiBidG4gaW5pdCcpO1xuICBidG4ub25jbGljayA9IGZ1bmN0aW9uIG9uT3JpZ2luTG9jYXRvckJ0bkhhbmRsZXIoKSB7XG4gICAgLy8gY29uc29sZS5sb2coJ2luIGJ0biBjbGljayBoYW5kbGVyJyk7XG4gICAgY29uc3Qgb3JpZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvcmlnaW5JbnB1dCcpO1xuICAgIG9yaWcudmFsdWUgPSAnU2VhcmNoaW5nLi4uJztcbiAgICBpZiAoc3RhdGUudXNlci5hZGRyZXNzKSB7XG4gICAgICBvcmlnLnZhbHVlID0gc3RhdGUudXNlci5hZGRyZXNzO1xuICAgICAgc3RhdGUub3JpZ2luID0geyAuLi5zdGF0ZS51c2VyIH07XG4gICAgICBtYXBVcGRhdGVEaXJlY3Rpb25zRW5kcG9pbnQoJ29yaWdpbicpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnZmV0Y2hpbmcgeW91ciBhZGRyZXNzLi4uJyk7XG4gICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKChwb3NpdGlvbikgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhwb3NpdGlvbik7XG4gICAgICAgIGNvbnN0IHsgbGF0aXR1ZGUsIGxvbmdpdHVkZSB9ID0gcG9zaXRpb24uY29vcmRzO1xuICAgICAgICBzdGF0ZS51c2VyLmxhdGl0dWRlID0gbGF0aXR1ZGU7XG4gICAgICAgIHN0YXRlLnVzZXIubG9uZ2l0dWRlID0gbG9uZ2l0dWRlO1xuICAgICAgICBzdGF0ZS5vcmlnaW4gPSB7IC4uLnN0YXRlLnVzZXIgfTtcbiAgICAgICAgbWFwVXBkYXRlRGlyZWN0aW9uc0VuZHBvaW50KCdvcmlnaW4nKTtcbiAgICAgICAgdXNlclJldmVyc2VHZW9jb2RlKChlcnIsIGRhdGEsIGFkZHJlc3MpID0+IHtcbiAgICAgICAgICBvcmlnLnZhbHVlID0gYWRkcmVzcztcbiAgICAgICAgICBzdGF0ZS51c2VyLmFkZHJlc3MgPSBhZGRyZXNzO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9vcmlnaW5Mb2NhdG9yQnV0dG9uLmpzIiwiaW1wb3J0IGF1dG9jb21wbGV0ZSBmcm9tICdhdXRvY29tcGxldGVyJztcblxuaW1wb3J0IHsgZ2VvY29kZSB9IGZyb20gJy4vZ2VvY29kZXInO1xuaW1wb3J0IHsgbWFwVXBkYXRlRGlyZWN0aW9uc0VuZHBvaW50IH0gZnJvbSAnLi9tYXAnO1xuXG5pbXBvcnQgc3RhdGUgZnJvbSAnLi9zdGF0ZSc7XG5cbmxldCBsYXN0QXV0b2NvbXBsZXRlU2VsZWN0aW9uID0gbnVsbDtcblxuLyoqXG4gKiBIb29rcyBhbiBpbnB1dCB1cCB0byBhbiBhdXRvY29tcGxldGUgc2VydmljZVxuICogQHBhcmFtIHtTdHJpbmd9IGVsSWQgZWxlbWVudCBpZCBvZiB0aGUgaW5wdXQgd2hpY2ggc2hvdWxkIGJlIGF1dG9jb21wbGV0ZWRcbiAqL1xuZnVuY3Rpb24gaW5pdEF1dG9jb21wbGV0ZShlbElkKSB7XG4gIGNvbnN0IGlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWxJZCk7XG5cbiAgYXV0b2NvbXBsZXRlKHtcbiAgICBpbnB1dDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWxJZCksXG4gICAgZmV0Y2g6ICh0ZXh0LCB1cGRhdGUpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCdvbiBmZXRjaCBmb3IgaW5wdXQnKTtcbiAgICAgIGdlb2NvZGUodGV4dCwgKGVyciwgZ2VvRGF0YSkgPT4ge1xuICAgICAgICBpZiAoIWVycikge1xuICAgICAgICAgIGNvbnN0IGQgPSBnZW9EYXRhO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGByZXN1bHQgZnJvbSBnZW9jb2RpbmcgJHt0ZXh0fTogYCwgZCk7XG4gICAgICAgICAgLy8gZW5zdXJlIHJlc3VsdCBsb29rcyBhcyB3ZSBleHBlY3QgZnJvbSB0aGUgQVBJXG4gICAgICAgICAgaWYgKGQudHlwZSA9PT0gJ0ZlYXR1cmVDb2xsZWN0aW9uJyAmJiBkLmZlYXR1cmVzICYmIGQuZmVhdHVyZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gbWFwIGQuZmVhdHVyZXMgaW50byB1c2VmdWwgZm9ybWF0LlxuICAgICAgICAgICAgLy8gcmV0dXJuIHtsYWJlbDouLi4sIGl0ZW06Li59IG9iaiAtIHRoZSBmb3JtYXRcbiAgICAgICAgICAgIC8vIHNwZWNpZmllZCBoZXJlOiBodHRwczovL2dpdGh1Yi5jb20va3JhYWRlbi9hdXRvY29tcGxldGVcbiAgICAgICAgICAgIGNvbnN0IGZlYXR1cmVUb1N1Z2dlc3Rpb24gPSBmZWF0dXJlID0+XG4gICAgICAgICAgICAgICh7XG4gICAgICAgICAgICAgICAgbGFiZWw6IGZlYXR1cmUucGxhY2VfbmFtZSxcbiAgICAgICAgICAgICAgICBpdGVtOiB7XG4gICAgICAgICAgICAgICAgICBmZWF0dXJlLFxuICAgICAgICAgICAgICAgICAgLy8gbWFrZSB0ZXh0IGFuZCBsYWJlbCBhdmFpbGFibGUgdG8gb25TZWxlY3QoKTpcbiAgICAgICAgICAgICAgICAgIGxhYmVsOiBmZWF0dXJlLnBsYWNlX25hbWUsXG4gICAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3Qgc3VnZ2VzdGlvbnMgPSBkLmZlYXR1cmVzLm1hcChmZWF0dXJlVG9TdWdnZXN0aW9uKTtcbiAgICAgICAgICAgIHVwZGF0ZShzdWdnZXN0aW9ucyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBlcnJvciBnZW9jb2RpbmcgJHt0ZXh0fTogJHtlcnJ9YCk7IC8vZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuICAgIG9uU2VsZWN0OiAoaXRlbSkgPT4ge1xuICAgICAgbGFzdEF1dG9jb21wbGV0ZVNlbGVjdGlvbiA9IGl0ZW07XG4gICAgICBjb25zb2xlLmxvZygnU0VMRUNURUQgaXRlbTonLCBpdGVtKTtcbiAgICAgIGlucHV0LnZhbHVlID0gaXRlbS5mZWF0dXJlLnBsYWNlX25hbWU7XG4gICAgfSxcbiAgfSk7XG59XG5cbi8qKlxuICogVXBkYXRlIHN0YXRlIGZyb20gZmVhdHVyZSByZXR1cm5lZCBieSBnZW9jb2Rlci5cbiAqIEBwYXJhbSB7c3RyaW5nfSBsb2NhdGlvbiBvcmlnaW4gb3IgZGVzdGluYXRpb24uXG4gKiBAcGFyYW0ge0dlb0pTT04gRmVhdHVyZX0gZmVhdHVyZSBBIHZhbGlkIGdlb2pzb24gZmVhdHVyZS5cbiAqL1xuZnVuY3Rpb24gdXBkYXRlTG9jYXRpb25Gcm9tRmVhdHVyZShsb2NhdGlvbiwgZmVhdHVyZSkge1xuICBpZiAoZmVhdHVyZS5wbGFjZV9uYW1lKSB7XG4gICAgc3RhdGVbbG9jYXRpb25dLmFkZHJlc3MgPSBmZWF0dXJlLnBsYWNlX25hbWU7XG4gIH1cbiAgaWYgKGZlYXR1cmUuY2VudGVyKSB7XG4gICAgW3N0YXRlW2xvY2F0aW9uXS5sb25naXR1ZGUsIHN0YXRlW2xvY2F0aW9uXS5sYXRpdHVkZV0gPSBmZWF0dXJlLmNlbnRlcjtcbiAgfVxufVxuXG4vKipcbiAqIHJldHVybnMgYSBjaGFuZ2UgaGFuZGxlciB3aGljaCB1cGRhdGVzIGdsb2JhbCBzdGF0ZSBsb2NhdGlvblxuICogQHBhcmFtIHtTdHJpbmd9IGxvY2F0aW9uIC0gJ29yaWdpbicgb3IgJ2Rlc3RpbmF0aW9uJzsgcmVxdWlyZXMgc3RhdGVbZGVzdGluYXRpb25dIHRvIGV4aXN0LlxuICovXG5mdW5jdGlvbiBnZW9jb2RpbmdDaGFuZ2VIYW5kbGVyKGxvY2F0aW9uKSB7XG4gIHJldHVybiBmdW5jdGlvbiBjaGFuZ2VFdmVudEhhbmRsZXIoZXZlbnQpIHtcbiAgICBjb25zdCBhZGRyID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgIGlmIChhZGRyID09PSAnJykge1xuICAgICAgLy8gdXNlciBjbGVhcmVkIGlucHV0IC0gZXJhc2Uga25vd24gcG9pbnQgZm9yIGxvY2F0aW9uXG4gICAgICBzdGF0ZVtsb2NhdGlvbl0ubG9uZ2l0dWRlID0gbnVsbDtcbiAgICAgIHN0YXRlW2xvY2F0aW9uXS5sYXRpdHVkZSA9IG51bGw7XG4gICAgICBzdGF0ZVtsb2NhdGlvbl0uYWRkcmVzcyA9IG51bGw7XG4gICAgICBtYXBVcGRhdGVEaXJlY3Rpb25zRW5kcG9pbnQobG9jYXRpb24pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZygnZ2VvY29kaW5nIGFkZHJlc3M6ICcsIGFkZHIpO1xuICAgIGdlb2NvZGUoYWRkciwgKGVyciwgZ2VvRGF0YSkgPT4ge1xuICAgICAgaWYgKCFlcnIpIHtcbiAgICAgICAgaWYgKGxhc3RBdXRvY29tcGxldGVTZWxlY3Rpb24pIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnd2Ugc2hvdWxkIG5vdCBoYXZlIHJ1biBnZW9jb2RlcicpO1xuICAgICAgICAgIC8vIGhvbGQgb24gLSB1c2VyIHNlbGVjdGVkIGFuIGF1dG9jb21wbGV0ZSBzdWdnZXN0aW9uLFxuICAgICAgICAgIC8vIHdlIHNob3VsZCB1c2UgdGhhdCBpbnN0ZWFkIG9mIHRoaXMgcmVzdWx0IGJhc2VkIG9uIGEgcGFydGlhbCB0ZXh0LlxuICAgICAgICAgIHVwZGF0ZUxvY2F0aW9uRnJvbUZlYXR1cmUobG9jYXRpb24sIGxhc3RBdXRvY29tcGxldGVTZWxlY3Rpb24uZmVhdHVyZSk7XG4gICAgICAgICAgLy8gaGFuZGxlZCwgY2FuIHJlc2V0OlxuICAgICAgICAgIGxhc3RBdXRvY29tcGxldGVTZWxlY3Rpb24gPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGQgPSBnZW9EYXRhO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGByZXN1bHQgZnJvbSBnZW9jb2RpbmcgJHthZGRyfTogYCwgZCk7XG4gICAgICAgICAgLy8gZW5zdXJlIHJlc3VsdCBsb29rcyBhcyB3ZSBleHBlY3QgZnJvbSB0aGUgQVBJXG4gICAgICAgICAgaWYgKGQudHlwZSA9PT0gJ0ZlYXR1cmVDb2xsZWN0aW9uJyAmJiBkLmZlYXR1cmVzICYmIGQuZmVhdHVyZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdXBkYXRlTG9jYXRpb25Gcm9tRmVhdHVyZShsb2NhdGlvbiwgZC5mZWF0dXJlc1swXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdhcHAgc3RhdGU6Jywgc3RhdGUpO1xuICAgICAgICBtYXBVcGRhdGVEaXJlY3Rpb25zRW5kcG9pbnQobG9jYXRpb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coYGVycm9yIGdlb2NvZGluZyAke2FkZHJ9OiAke2Vycn1gKTsgLy9lc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGUgaW5wdXQgaGFuZGxlciBmb3Igb25lIG9mIHRoZSBkaXJlY3Rpb24gaW5wdXRzXG4gKiBAcGFyYW0ge1N0cmluZ30gZWxJZCAtIElEIG9mIHRoZSBpbnB1dCBlbGVtZW50IHRvIGluaXRpYWxpemVcbiAqIEBwYXJhbSB7U3RyaW5nfSBsb2NhdGlvbiAtICdvcmlnaW4nIG9yICdkZXN0aW5hdGlvbidcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW5pdERpcmVjdGlvbklucHV0KGVsSWQsIGxvY2F0aW9uKSB7XG4gIC8vIHJ1biBnZW9jb2RlIG9uIGFkZHJlc3Mgd2hlbiBpbnB1dCBjaGFuZ2VzXG4gIGNvbnN0IGlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWxJZCk7XG4gIGlucHV0Lm9uY2hhbmdlID0gZ2VvY29kaW5nQ2hhbmdlSGFuZGxlcihsb2NhdGlvbik7XG5cbiAgLy8gZW5hYmxlIGF1dG9jb21wbGV0ZVxuICBpbml0QXV0b2NvbXBsZXRlKGVsSWQpO1xufVxuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvZGlyZWN0aW9uSW5wdXQuanMiLCIhZnVuY3Rpb24oZSl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kKWRlZmluZShlKTtlbHNlIGlmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGUmJnZvaWQgMCE9PW1vZHVsZS5leHBvcnRzKXt2YXIgdD1lKCk7T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksZXhwb3J0cy5hdXRvY29tcGxldGU9dCxleHBvcnRzLmRlZmF1bHQ9dH1lbHNlIHdpbmRvdy5hdXRvY29tcGxldGU9ZSgpfShmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIGUoZSl7ZnVuY3Rpb24gdCgpe3JldHVyblwibm9uZVwiIT09aC5kaXNwbGF5fWZ1bmN0aW9uIG4oKXt5KyssbT1bXSxwPXZvaWQgMCxoLmRpc3BsYXk9XCJub25lXCJ9ZnVuY3Rpb24gbygpe2Zvcig7di5maXJzdENoaWxkOyl2LnJlbW92ZUNoaWxkKHYuZmlyc3RDaGlsZCk7dmFyIHQ9ITEsbz1cIiM5PyRcIjttLmZvckVhY2goZnVuY3Rpb24oZSl7ZS5ncm91cCYmKHQ9ITApfSk7dmFyIGk9ZnVuY3Rpb24oZSl7dmFyIHQ9Yy5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO3JldHVybiB0LnRleHRDb250ZW50PWUubGFiZWwsdH07ZS5yZW5kZXImJihpPWUucmVuZGVyKTt2YXIgbD1mdW5jdGlvbihlKXt2YXIgdD1jLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7cmV0dXJuIHQudGV4dENvbnRlbnQ9ZSx0fTtpZihlLnJlbmRlckdyb3VwJiYobD1lLnJlbmRlckdyb3VwKSxtLmZvckVhY2goZnVuY3Rpb24odCl7aWYodC5ncm91cCYmdC5ncm91cCE9PW8pe289dC5ncm91cDt2YXIgcj1sKHQuZ3JvdXApO3ImJihyLmNsYXNzTmFtZSs9XCIgZ3JvdXBcIix2LmFwcGVuZENoaWxkKHIpKX12YXIgYT1pKHQpO2EmJihhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLGZ1bmN0aW9uKG8pe2Uub25TZWxlY3QodC5pdGVtLHUpLG4oKSxvLnByZXZlbnREZWZhdWx0KCksby5zdG9wUHJvcGFnYXRpb24oKX0pLHQ9PT1wJiYoYS5jbGFzc05hbWUrPVwiIHNlbGVjdGVkXCIpLHYuYXBwZW5kQ2hpbGQoYSkpfSksbS5sZW5ndGg8MSl7aWYoIWUuZW1wdHlNc2cpcmV0dXJuIHZvaWQgbigpO3ZhciBhPWMuY3JlYXRlRWxlbWVudChcImRpdlwiKTthLmNsYXNzTmFtZT1cImVtcHR5XCIsYS50ZXh0Q29udGVudD1lLmVtcHR5TXNnLHYuYXBwZW5kQ2hpbGQoYSl9dmFyIGY9dS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxkPWYudG9wK3Uub2Zmc2V0SGVpZ2h0K2MuYm9keS5zY3JvbGxUb3A7aC50b3A9ZCtcInB4XCIsaC5sZWZ0PWYubGVmdCtcInB4XCIsaC53aWR0aD11Lm9mZnNldFdpZHRoK1wicHhcIixoLm1heEhlaWdodD13aW5kb3cuaW5uZXJIZWlnaHQtKGYudG9wK3Uub2Zmc2V0SGVpZ2h0KStcInB4XCIsaC5oZWlnaHQ9XCJhdXRvXCIsaC5kaXNwbGF5PVwiYmxvY2tcIixyKCl9ZnVuY3Rpb24gaShpKXt2YXIgcj1pLndoaWNofHxpLmtleUNvZGV8fDAsbD0rK3k7MzghPT1yJiYxMyE9PXImJjI3IT09ciYmMzkhPT1yJiYzNyE9PXImJig0MD09PXImJnQoKXx8KHUudmFsdWUubGVuZ3RoPj1nP2UuZmV0Y2godS52YWx1ZSxmdW5jdGlvbihlKXt5PT09bCYmZSYmKG09ZSxwPW0ubGVuZ3RoPjA/bVswXTp2b2lkIDAsbygpKX0pOm4oKSkpfWZ1bmN0aW9uIHIoKXt2YXIgZT12LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJzZWxlY3RlZFwiKTtpZihlLmxlbmd0aD4wKXt2YXIgdD1lWzBdLG49dC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO2lmKG4mJi0xIT09bi5jbGFzc05hbWUuaW5kZXhPZihcImdyb3VwXCIpJiYhbi5wcmV2aW91c0VsZW1lbnRTaWJsaW5nJiYodD1uKSx0Lm9mZnNldFRvcDx2LnNjcm9sbFRvcCl2LnNjcm9sbFRvcD10Lm9mZnNldFRvcDtlbHNle3ZhciBvPXQub2Zmc2V0VG9wK3Qub2Zmc2V0SGVpZ2h0LGk9di5zY3JvbGxUb3Ardi5vZmZzZXRIZWlnaHQ7bz5pJiYodi5zY3JvbGxUb3ArPW8taSl9fX1mdW5jdGlvbiBsKCl7aWYobS5sZW5ndGg8MSlwPXZvaWQgMDtlbHNlIGlmKHA9PT1tWzBdKXA9bVttLmxlbmd0aC0xXTtlbHNlIGZvcih2YXIgZT1tLmxlbmd0aC0xO2U+MDtlLS0paWYocD09PW1bZV18fDE9PT1lKXtwPW1bZS0xXTticmVha319ZnVuY3Rpb24gYSgpe2lmKG0ubGVuZ3RoPDEmJihwPXZvaWQgMCksIXB8fHA9PT1tW20ubGVuZ3RoLTFdKXJldHVybiB2b2lkKHA9bVswXSk7Zm9yKHZhciBlPTA7ZTxtLmxlbmd0aC0xO2UrKylpZihwPT09bVtlXSl7cD1tW2UrMV07YnJlYWt9fWZ1bmN0aW9uIGYoaSl7dmFyIHI9aS53aGljaHx8aS5rZXlDb2RlfHwwO2lmKDM4PT09cnx8NDA9PT1yfHwyNz09PXIpe3ZhciBmPXQoKTtpZigyNz09PXIpbigpO2Vsc2V7aWYoIXR8fG0ubGVuZ3RoPDEpcmV0dXJuOzM4PT09cj9sKCk6YSgpLG8oKX1yZXR1cm4gaS5wcmV2ZW50RGVmYXVsdCgpLHZvaWQoZiYmaS5zdG9wUHJvcGFnYXRpb24oKSl9MTM9PT1yJiZwJiYoZS5vblNlbGVjdChwLml0ZW0sdSksbigpKX1mdW5jdGlvbiBkKCl7c2V0VGltZW91dChmdW5jdGlvbigpe2MuYWN0aXZlRWxlbWVudCE9PXUmJm4oKX0sMjAwKX1mdW5jdGlvbiBzKCl7dS5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLGYpLHUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsaSksdS5yZW1vdmVFdmVudExpc3RlbmVyKFwiYmx1clwiLGQpLHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsbyksbigpO3ZhciBlPXYucGFyZW50Tm9kZTtlJiZlLnJlbW92ZUNoaWxkKHYpfXZhciB1LHAsYz1kb2N1bWVudCx2PWMuY3JlYXRlRWxlbWVudChcImRpdlwiKSxoPXYuc3R5bGUsbT1bXSxnPWUubWluTGVuZ3RofHwyLHk9MDtpZighZS5pbnB1dCl0aHJvdyBuZXcgRXJyb3IoXCJpbnB1dCB1bmRlZmluZWRcIik7cmV0dXJuIHU9ZS5pbnB1dCxjLmJvZHkuYXBwZW5kQ2hpbGQodiksdi5jbGFzc05hbWU9XCJhdXRvY29tcGxldGUgXCIrKGUuY2xhc3NOYW1lfHxcIlwiKSxoLnBvc2l0aW9uPVwiYWJzb2x1dGVcIixoLmRpc3BsYXk9XCJub25lXCIsdS5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLGYpLHUuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsaSksdS5hZGRFdmVudExpc3RlbmVyKFwiYmx1clwiLGQpLHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsbykse2Rlc3Ryb3k6c319cmV0dXJuIGV9KTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9hdXRvY29tcGxldGVyL2F1dG9jb21wbGV0ZS5qc1xuLy8gbW9kdWxlIGlkID0gNDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==