import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';
import config from './config';

const geocodingClient = mbxGeocoding({ accessToken: config.mapboxToken });

// From Mapbox:
// " Bias the response to favor results that are closer to this location,
// provided as two comma-separated coordinates in longitude,latitude order."
let proximity = null;

// Limit results to only those contained within the supplied bounding box.
// Bounding boxes should be supplied as four numbers separated by commas,
// in minLon,minLat,maxLon,maxLat order. The bounding box cannot cross
// the 180th meridian.
let bbox = null;


/**
 * Reverse Geocode lat/lng -- using Mapbox under the hood.
 * @param {*} lat
 * @param {*} lng
 * @param {*} callback: (err, geoData) => any
 */
export function reverseGeocode(lat, lng, callback) {
  // Reverse geocode coordinates to address.
  // geo.reverseGeocode('mapbox.places', lng, lat, (err, geoData) => {
  //   callback(err, geoData);
  // });

  geocodingClient
    .reverseGeocode({
      query: [lng, lat],
      limit: 2,
    })
    .send()
    .then((response) => {
      // match is a GeoJSON document with geocoding matches
      const match = response.body;
      // console.log('reverse geocode result: ', match);
      callback(null, match);
    });
}


/**
 * Geocode address - using Mapbox under the hood.
 * @param {string} address
 * @param {Function} callback: (err, geoData) => any
 */
export function geocode(address, callback) {
  // Geocode an address to coordinates
  // geo.geocode('mapbox.places', address, (err, geoData) => {
  //   callback(err, geoData);
  // });
  geocodingClient
    .forwardGeocode({
      query: address,
      limit: 5,
      bbox,
      proximity,
    })
    .send()
    .then((response) => {
      const match = response.body;
      // console.log('geocode result: ', match);
      callback(null, match);
    });
}

/**
 * Bias geocoding results near the center.
 * @param {[longitude,latitude]} center for proximity bias
 */
export function setGeocderCenter(center) {
  proximity = center.slice();
}


/**
 * Search within the given bounding box
 * @param {string} box bounding box string in format minX,minY,maxX,maxY
 */
export function setGeocoderBounds(box) {
  bbox = box.split(',').map(parseFloat);
}
