import React, { Component } from "react";
import {
  Map,
  Marker,
  TileLayer,
  LayersControl,
  LayerGroup
} from "react-leaflet";

//redux
import { connect } from "react-redux";
import { fetchData } from "../../../actions/fetchMapDataAction";
import { setMarker } from "../../../actions/setMarkerAction";
import { setIncludedGraphs } from "../../../actions/setIncludedGraphsAction";
import { getSval } from "../../../actions/fetchMapDataAction";
import { setRBVal } from "../../../actions/setRButtonValueAction";
import { thresholds, startPos } from "../../../config";
const L = require("leaflet");
const { BaseLayer, Overlay } = LayersControl;

// public access token, might need to change for production.
const mapBoxUrlNoLabels =
  "https://api.mapbox.com/styles/v1/abhinavpadala/cjnyl7gyk24zb2rmjvz6kjl2g/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiYWJoaW5hdnBhZGFsYSIsImEiOiJjam03bHl3YTkxd3NiM3JvMjQ3MmExenY5In0.qpAGeH2WI-XsCqraTEfePA";
// might want to change this attribution.
const mapBoxAttr =
  'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>';

// useful coords:
// gløs - 63.41860, 10.40277
// trondheim - 63.426, 10.422
// tromsø - 69.649, 18.955

export class BaseMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      center: startPos,
      marker: startPos,
      zoom: 13,
      draggable: true,
      data: [], // on the form {latitude, longitude, timestamp, thingName, co2_ppm, particles_0_3um, particles_3_10um}
      firstTime: true,
      value: [1, 0],
      thresholds: this.setThresholds(),
      colors: {
        grey: "#a0a0a0",
        green: "#66ff66",
        yellow: "#ffff66",
        red: "#ff5050"
      },
      minLevel: 1 // Minimum level of pollution to show on map.
    }; // green=1, yellow=2, red = 3
  }

  componentDidMount() {
    this.props.setMarker(this.state.marker.lat, this.state.marker.lng);
    this.props.fetchData(24);
    //console.log("from Did mount");
  }

  componentDidUpdate(prevProps, prevState) {
    //console.log("component updated, slider value:", this.props.svalue);
    // if-check to avoid multiple visualizations and 'on'-function declarations.
    if (this.state.firstTime) {
      var map = this.refs.map.leafletElement;
      var dataLayer = this.refs.dataLayer.leafletElement;
      var marker = this.refs.marker.leafletElement;

      // hides points during zoom animation to avoid glitchy animation.
      map.on("zoomstart", () => {
        // saves the state of the data layer before removing.
        this.setState({ dataOnMap: map.hasLayer(dataLayer) });
        map.removeLayer(dataLayer);
      });
      map.on("zoomend", () => {
        // returns to the state that was before zoom started.
        if (this.state.dataOnMap) {
          map.addLayer(dataLayer);
        }
      });
      // moves marker to cursor when clicking on the map, and updates the marker position in the state.
      map.on("click", e => {
        var pos = e.latlng;
        marker.setLatLng(pos);
        this.updatePosition();
        marker.addTo(map);
      });
      // adds zoom control to the map.
      map.addControl(L.control.zoom({ position: "bottomright" }));
      this.setState({ firstTime: false });
    }
    if (
      prevState.data !== this.state.data ||
      prevState.minLevel !== this.state.minLevel
    ) {
      //console.log("state data changed, updating visualization.");
      this.updateVisualization();
    }
    if (
      prevProps.svalue !== this.props.svalue ||
      prevProps.data !== this.props.data
    ) {
      //console.log("slider moved or store data changed, updating state data.");
      //this.props.fetchData(this.props.svalue);
      this.updateStateData();
    }
    if (prevProps.includedGraphs !== this.props.includedGraphs) {
      //console.log("toggle changed to", this.props.includedGraphs);
      this.updateVisualization();
    }
    if (prevProps.rbValue !== this.props.rbValue) {
      this.setState({ minLevel: this.props.rbValue });
    }
  }

  // Marker functions

  // updates the state to reflect the current position of the marker.
  updatePosition = () => {
    const { lat, lng } = this.refs.marker.leafletElement.getLatLng();
    this.setState({
      marker: { lat, lng }
    });
    this.props.setMarker(lat, lng);
  };

  handleMarkerClick = () => {
    var map = this.refs.map.leafletElement;
    var marker = this.refs.marker.leafletElement;

    map.removeLayer(marker);
  };

  // Data visualization functions

  updateStateData = () => {
    let data = this.props.data;
    if (data.length === 0) {
      this.props.fetchData(24);
    } else {
      let startIndex = -1;
      let endIndex = -1;
      let hours = 60 * 60 * 1000;
      let startMillis = Date.now() - this.props.svalue[0] * hours; //determines earliest timestamp wanted in state.
      let endMillis = Date.now() - this.props.svalue[1] * hours;
      for (var i = 0; i < data.length; i++) {
        if (
          parseFloat(data[i].timestamp) >= startMillis &&
          parseFloat(data[i].timestamp) <= endMillis
        ) {
          if (startIndex === -1) {
            startIndex = i;
          }
          endIndex = i;
        }
      }
      if (startIndex !== -1 && endIndex !== -1) {
        data = data.slice(startIndex, endIndex);
      } else {
        data = [];
      }

      this.setState({ data: data });
    }
  };

  setThresholds = () => {
    let thresh = {};
    for (var i = 0; i < thresholds.length; i++) {
      let pollutant = thresholds[i][0];
      let yellow = thresholds[i][1];
      let red = thresholds[i][2];
      thresh[pollutant] = { yellow: yellow, red: red };
    }
    return thresh;
  };

  updateVisualization = () => {
    this.clearVisualization();
    this.visualize(this.state.data);
  };

  clearVisualization = () => {
    var dataLayer = this.refs.dataLayer.leafletElement;
    dataLayer.clearLayers();
  };

  // displays the data from the state as circle markers on the map, through the LayerGroup 'dataLayer'.
  visualize = data => {
    var cMarkerOptions = {
      radius: 8,
      fillColor: "#ffffff",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.6,
      fill: true
    };

    var dataLayer = this.refs.dataLayer.leafletElement;
    for (let i = 0; i < data.length; i++) {
      let latlng = L.latLng(
        parseFloat(data[i].latitude),
        parseFloat(data[i].longitude)
      );
      cMarkerOptions.fillColor = this.dataToColor(data[i]);
      if (cMarkerOptions.fillColor === this.state.colors.grey) {
        continue;
      }
      let cMarker = L.circleMarker(latlng, cMarkerOptions);
      cMarker.addTo(dataLayer);
    }
  };

  // translates a datapoint to the corresponding color for the circle markers.
  dataToColor = data => {
    let max = 0; // variable to determine the most impactful pollutant's value
    // for each toggled pollutant:
    for (var i = 0; i < this.props.includedGraphs.length; i++) {
      let pollutant = this.props.includedGraphs[i];
      // if the pollutant has a threshold in the config file.
      if (this.state.thresholds[pollutant] != null) {
        let amount = parseFloat(data[pollutant]); // measured amount (e.g. ppm for co2)
        // check the threshold for that pollutant and give it a value.
        // value is 0 if the amount is 0 (probably not measured)
        // otherwise the value corresponds to color (1 = green, 2 = yellow, 3 = red)
        let value =
          amount === 0
            ? 0
            : amount <= this.state.thresholds[pollutant].yellow
            ? 1
            : amount <= this.state.thresholds[pollutant].red
            ? 2
            : 3;
        if (value > max) {
          max = value;
        }
      }
    }
    // returns a color based on the maximum value found.
    return max < this.state.minLevel
      ? this.state.colors.grey
      : max === 1
      ? this.state.colors.green
      : max === 2
      ? this.state.colors.yellow
      : this.state.colors.red;
  };

  render() {
    const mapCenter = [this.state.center.lat, this.state.center.lng];
    const markerPos = [this.state.marker.lat, this.state.marker.lng];

    var southWest = L.latLng(mapCenter[0] - 0.075, mapCenter[1] - 0.3),
      northEast = L.latLng(mapCenter[0] + 0.075, mapCenter[1] + 0.3),
      bounds = L.latLngBounds(southWest, northEast);
    // maxBounds={bounds}
    return (
      <Map
        ref="map"
        center={mapCenter}
        zoom={this.state.zoom}
        zoomControl={false}
        minZoom={11}
        maxZoom={16}
        maxBounds={bounds}
      >
        <LayersControl position="bottomright">
          <BaseLayer checked name="Map Tiles">
            <TileLayer attribution={mapBoxAttr} url={mapBoxUrlNoLabels} />
          </BaseLayer>
          <Overlay checked name="Location Marker">
            <Marker
              position={markerPos}
              draggable={this.state.draggable}
              onDragEnd={this.updatePosition}
              ref="marker"
              onClick={this.handleMarkerClick}
            />
          </Overlay>
          <Overlay ref="dataOverlay" checked name="Air Quality Data">
            <LayerGroup ref="dataLayer" />
          </Overlay>
        </LayersControl>
      </Map>
    );
  }
}

//This function makes the state data available to this(BasemapData) component as props.
const mapStateToProps = state => ({
  data: state.data.items,
  pos: state.pos.pos,
  svalue: state.sval.svalue,
  includedGraphs: state.includedGraphs.includedGraphs,
  rbValue: state.rbVal.rbValue
});

//connect is used to connect redux and react parts of the app. (Figuratively)
export default connect(
  mapStateToProps,
  { fetchData, getSval, setMarker, setIncludedGraphs, setRBVal }
)(BaseMap);
