import config from './config';

// because we can't easily grab data from map, and
// querySourceFeatures only returns things that are within view.
class StationFeed {
  constructor() {
    let stations = [];

    // returns geojson
    this.getStations = function getStations() { return stations; };

    // returns array
    this.getStationsArray = function getStationsArray() {
      return stations.features ? stations.features : [];
    };
    // const setStations = function setStations(data) { stations = data; }
    // function setStations(data) { stations = data; }

    const doFetch = () => {
      fetch(config.stationsUrl)
        .then(resp => resp.json())
        .then((data) => {
          // console.log('fetched stations: ', data);
          stations = data;
          // setStations(data);
        });
    };

    doFetch();
    window.setTimeout(doFetch, 30 /* seconds */ * 1000);
  }
}

const feed = new StationFeed();
export default feed; // export singleton
