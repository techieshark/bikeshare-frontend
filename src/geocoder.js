import geo from 'mapbox-geocoding';
// var geo = require('mapbox-geocoding');

import config from './config';

geo.setAccessToken(config.mapboxToken);

/**
 * Reverse Geocode lat/lng -- using Mapbox under the hood.
 * @param {*} lat
 * @param {*} lng
 * @param {*} callback: (err, geoData) => any
 */
export function reverseGeocode(lat, lng, callback) {
  // Reverse geocode coordinates to address.
  geo.reverseGeocode('mapbox.places', lng, lat, (err, geoData) => {
    // console.log(geoData);
    callback(err, geoData);
  });
}


/**
 * Geocode address - using Mapbox under the hood.
 * @param {string} address
 * @param {Function} callback: (err, geoData) => any
 */
export function geocode(address, callback) {
  // Geocode an address to coordinates
  geo.geocode('mapbox.places', address, (err, geoData) => {
    // console.log(geoData);
    callback(err, geoData);
  });
}


/**
 * Bias geocoding results near the center.
 * @param {[longitude,latitude]} center for proximity bias
 */
export function setGeocderCenter(center) {
  geo.setSearchCenter(center);
}


/**
 * Search withing the given bounding box
 * @param {string} bbox bounding box string in format minX,minY,maxX,maxY
 */
export function setGeocoderBounds(bbox) {
  geo.setSearchBounds(bbox);
}
