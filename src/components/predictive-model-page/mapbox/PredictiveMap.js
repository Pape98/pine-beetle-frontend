import React, { Component } from 'react';
import '../../../styles/predictive-model-page/PredictiveMap.css';
var MapboxClient = require('mapbox');
var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
require('dotenv').config() // load mapbox access token

class PredictiveMap extends Component {
    constructor(props) {
        super(props)
        mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

        this.state = {
            map: null,
            dataController: null,
            dataControllerState: null
        }
    }
    render() {
        return(
            <div className="map-container">
                <div id="map"></div>
            </div>
        );
    }

    componentDidMount() {
        this.setState({
            builtMap: false
        }, () => {
            this.updateStateFromProps(this.props);
        });
    }

    // if receiving new data, update the state
    componentWillReceiveProps(nextProps) {
        this.updateStateFromProps(nextProps);
    }

    updateStateFromProps(props) {
        this.setState({
            dataController: props.dataController,
            dataControllerState: props.dataControllerState
        }, () => {
            if (this.state.builtMap === false && this.state.dataControllerState.historicalData.summarizedDataByLatLong !== null) {
                this.createMap();
            }
        })
    }

    createMap() {
        this.setState({
            builtMap: true
        }, () => {
            this.setState({
                map: new mapboxgl.Map({
                    container: 'map', // container id
                    style: 'mapbox://styles/mapbox/streets-v9',
                    center: [-84.3880,33.7490], // starting position
                    zoom: 4.8 // starting zoom
                })
            }, () => {
                // Add zoom and rotation controls to the map.
                this.state.map.addControl(new mapboxgl.NavigationControl());

                // disable map zoom when using scroll
                this.state.map.scrollZoom.disable();

                var data = require('./StateGeoJSON.json');
                console.log(this.state.dataControllerState)

                this.state.map.on('load', function() {
                    this.state.map.addSource('state-data', {
                       type: 'geojson',
                       data: data
                   });

                    var expression = ["match", ["get", "abbrev"]];

                    // Calculate color for each state based on the unemployment rate
                    this.state.dataControllerState.historicalData.summarizedDataByLatLong.forEach(function(row) {
                        var green = (row["spots"] / 1000) * 255;
                        var color = "rgba(" + 0 + ", " + green + ", " + 0 + ", 1)";
                        expression.push(row["state"], color);
                    });

                    // Last value is the default, used where there is no data
                    expression.push("rgba(0,0,0,0)");

                    // Add layer from the vector tile source with data-driven style
                    this.state.map.addLayer({
                        "id": "states-join",
                        "type": "fill",
                        "source": "state-data",
                        "source-layer": "state-data",
                        "paint": {
                            "fill-color": expression
                        }
                    }, 'waterway-label');
                }.bind(this));
            });
        });
    }

    tutorial() {
        // Join local JSON data with vector tile geometry
        // USA unemployment rate in 2009
        // Source https://data.bls.gov/timeseries/LNS14000000
        var maxValue = 13;
        var data = [
            {"STATE_ID": "01", "unemployment": 13.17},
            {"STATE_ID": "02", "unemployment": 9.5},
            {"STATE_ID": "04", "unemployment": 12.15},
            {"STATE_ID": "05", "unemployment": 8.99},
            {"STATE_ID": "06", "unemployment": 11.83},
            {"STATE_ID": "08", "unemployment": 7.52},
            {"STATE_ID": "09", "unemployment": 6.44},
            {"STATE_ID": "10", "unemployment": 5.17},
            {"STATE_ID": "12", "unemployment": 9.67},
            {"STATE_ID": "13", "unemployment": 10.64},
            {"STATE_ID": "15", "unemployment": 12.38},
            {"STATE_ID": "16", "unemployment": 10.13},
            {"STATE_ID": "17", "unemployment": 9.58},
            {"STATE_ID": "18", "unemployment": 10.63},
            {"STATE_ID": "19", "unemployment": 8.09},
            {"STATE_ID": "20", "unemployment": 5.93},
            {"STATE_ID": "21", "unemployment": 9.86},
            {"STATE_ID": "22", "unemployment": 9.81},
            {"STATE_ID": "23", "unemployment": 7.82},
            {"STATE_ID": "24", "unemployment": 8.35},
            {"STATE_ID": "25", "unemployment": 9.1},
            {"STATE_ID": "26", "unemployment": 10.69},
            {"STATE_ID": "27", "unemployment": 11.53},
            {"STATE_ID": "28", "unemployment": 9.29},
            {"STATE_ID": "29", "unemployment": 9.94},
            {"STATE_ID": "30", "unemployment": 9.29},
            {"STATE_ID": "31", "unemployment": 5.45},
            {"STATE_ID": "32", "unemployment": 4.21},
            {"STATE_ID": "33", "unemployment": 4.27},
            {"STATE_ID": "34", "unemployment": 4.09},
            {"STATE_ID": "35", "unemployment": 7.83},
            {"STATE_ID": "36", "unemployment": 8.01},
            {"STATE_ID": "37", "unemployment": 9.34},
            {"STATE_ID": "38", "unemployment": 11.23},
            {"STATE_ID": "39", "unemployment": 7.08},
            {"STATE_ID": "40", "unemployment": 11.22},
            {"STATE_ID": "41", "unemployment": 6.2},
            {"STATE_ID": "42", "unemployment": 9.11},
            {"STATE_ID": "44", "unemployment": 10.42},
            {"STATE_ID": "45", "unemployment": 8.89},
            {"STATE_ID": "46", "unemployment": 11.03},
            {"STATE_ID": "47", "unemployment": 7.35},
            {"STATE_ID": "48", "unemployment": 8.92},
            {"STATE_ID": "49", "unemployment": 7.65},
            {"STATE_ID": "50", "unemployment": 8.01},
            {"STATE_ID": "51", "unemployment": 7.62},
            {"STATE_ID": "53", "unemployment": 7.77},
            {"STATE_ID": "54", "unemployment": 8.49},
            {"STATE_ID": "55", "unemployment": 9.42},
            {"STATE_ID": "56", "unemployment": 7.59}
        ];

        this.state.map.on('load', function() {
            // Add source for state polygons hosted on Mapbox, based on US Census Data:
            // https://www.census.gov/geo/maps-data/data/cbf/cbf_state.html
            this.state.map.addSource("states", {
                type: "vector",
                url: "mapbox://mapbox.us_census_states_2015"
            });

            var expression = ["match", ["get", "STATE_ID"]];

            // Calculate color for each state based on the unemployment rate
            data.forEach(function(row) {
                var green = (row["unemployment"] / maxValue) * 255;
                var color = "rgba(" + 0 + ", " + green + ", " + 0 + ", 1)";
                expression.push(row["STATE_ID"], color);
            });

            // Last value is the default, used where there is no data
            expression.push("rgba(0,0,0,0)");

            // Add layer from the vector tile source with data-driven style
            this.state.map.addLayer({
                "id": "states-join",
                "type": "fill",
                "source": "states",
                "source-layer": "states",
                "paint": {
                    "fill-color": expression
                }
            }, 'waterway-label');

        }.bind(this));
    }
}

export default PredictiveMap
