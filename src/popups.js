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
  const coords = toLat ? `${toLat},${toLng},` : '';
  const zoom = 17;
  return `${baseURL}/${fromAddr}/${toAddr}/@${coords}${zoom}/`;
  // Google maps expects addresses with name first, then plus-separated components like this:
  // Noisebridge,+2169+Mission+St,+San+Francisco,+CA+94110
}

/**
 * Get HTML content describing a station.
 * @param station - one station from the API
 */
export default function getPopupContent(station) {
  const {
    stAddress1: addr,
    latitude: lat,
    longitude: lng,
    availableBikes: bikes,
    availableDocks: docks,
    statusValue: status,
  } = station.properties;
  const directionsURL = getDirectionsLink(addr, undefined, lat, lng);
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
        <a rel="noopener noreferrer" target="_blank" href="${directionsURL}">Directions to here</a>
      </div>
      <div class="station-popup--coordinates">Lat/Long: <abbr title="${lat}, ${lng}">${round(lat)}, ${round(lng)}</abbr></div>
    </div>`;
}
