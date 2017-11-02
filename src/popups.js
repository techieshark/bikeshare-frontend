import state from './state';

/**
 * Get Google directions <a> link to/from up to two points
 * @param {{latitude, longitude, address}} start directions startpoint; can be null.
 * @param {{latitude, longitude, address}} end directions endpoint
 * @param toOrFrom - Directions 'to' or 'from here
 */
function getDirectionsLink(start, end, toOrFrom) {
  // TODO / BUG: "addresses" with a '/' in them don't work, like
  // "Civic Center/UN Plaza BART Station (Market St at McAllister St)" - currently that results
  // in directions from civic center to UN plaza (b/c g-maps separates locations with a '/')

  const from = start ? (start.address || `${start.latitude},${start.longitude}`) : '';
  const to = end ? (end.address || `${end.latitude},${end.longitude}`) : '';

  const baseURL = 'https://www.google.com/maps/dir';
  const zoom = 17;

  // Google Maps magic that says: "Give me walking directions".
  // See https://mstickles.wordpress.com/2015/06/12/gmaps-urls-options/
  // https://webapps.stackexchange.com/a/79544
  const data = 'data=!4m2!4m1!3e2';

  const directionsURL = `${baseURL}/${from}/${to}/@${zoom}/${data}`;
  // Google maps expects addresses with name first, then plus-separated components like this:
  // Noisebridge,+2169+Mission+St,+San+Francisco,+CA+94110
  return `<a rel="noopener noreferrer" target="_blank" href="${directionsURL}">Directions ${toOrFrom} here</a>`;
}


/**
 * Get HTML content describing a station.
 * @param station - one station from the API
 * @param {string} nearbyEndpoint - 'origin' or 'destination' (for directions link)
 */
export default function getPopupContent(station, nearbyEndpoint) {
  const {
    stAddress1: addr,
    latitude: lat,
    longitude: lng,
    availableBikes: bikes,
    availableDocks: docks,
    statusValue: status,
  } = station.properties;

  const stationLocation = {
    longitude: lng,
    latitude: lat,
    // address: addr,
    // just ignore the station addresses because they're useless:
    // "western addition - coming 2018" doesn't geocode.
  };

  let start;
  let end;
  let toOrFrom = '';
  if (nearbyEndpoint === 'origin') {
    start = state.origin;
    end = stationLocation;
    toOrFrom = 'to';
  } else if (nearbyEndpoint === 'destination') {
    start = stationLocation;
    end = state.destination;
    toOrFrom = 'from';
  } else {
    start = null;
    end = stationLocation;
  }
  const directionsLink = getDirectionsLink(start, end, toOrFrom);

  const round = n => Number(n).toFixed(2);

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
        ${directionsLink}
      </div>
      <div class="station-popup--coordinates">Lat/Long: <abbr title="${lat}, ${lng}">${round(lat)}, ${round(lng)}</abbr></div>
    </div>`;
}
