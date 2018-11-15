import React, { Component } from "react";
import Divider from "@material-ui/core/Divider";
import PollutantGraph from "./pollutantGraph/pollutantGraph";
import { connect } from "react-redux";
import { fetchData } from "../../actions/fetchMapDataAction";
import { fetchGraphData } from "../../actions/fetchGraphDataAction";
import { setMarker } from "../../actions/setMarkerAction";
import { setProcessedGraphData } from "../../actions/setProcessedGraphDataAction";
import { thresholds, startPos, epsilon } from "../../config";
import { setIncludedGraphs } from "../../actions/setIncludedGraphsAction";
import { setPollutants } from "../../actions/setPollutantsAction";

const styles = {
  flexGrow: 1,
  width: "20%",
  backgroundColor: "#EDEDED",
  float: "right",
  height: window.innerHeight,
  zIndex: 2
};

class RightSide extends Component {
  //Thresholds and names fetched from config.js
  state = {
    thresholdYellow: [],
    thresholdRed: []
  };

  /* Checks if pos is in store, if not it fetches from config.js and
   * fetches graph data afterwards.
   * Fetches thresholds from config and updates pollutants in store
   * if it's not set. Also sets includedGraphs in store if it isn't
   * set.
   */
  constructor(props) {
    super(props);

    // Position/marker and raw data
    let pos = {};
    if (this.props.pos == null) {
      pos = startPos;
    } else {
      pos = this.props.pos;
    }

    // Pollutants and thresholds
    let pollutants = [];
    let thresholdYellow = {};
    let thresholdRed = {};
    let labels = {};

    for (let i = 0; i < thresholds.length; i++) {
      pollutants.push(thresholds[i][0]);
      thresholdYellow[thresholds[i][0]] = thresholds[i][1];
      thresholdRed[thresholds[i][0]] = thresholds[i][2];
      labels[thresholds[i][0]] = thresholds[i][3];
    }
    this.state.thresholdYellow = thresholdYellow;
    this.state.thresholdRed = thresholdRed;
    this.state.labels = labels;
    this.state.graphData = this.getGraphData(pos);

    if (this.props.pollutants == null) {
      this.props.setPollutants(pollutants);
    }

    // Included Graphs
    if (this.props.includedGraphs == null) {
      this.props.setIncludedGraphs(pollutants);
    }

    let processedGraphData = this.distributeDataIntoKeywords(
      this.state.graphData
    );
    this.props.setProcessedGraphData(processedGraphData);
  }

  /* If pos in store is updated, fetch new data.
   * If graphData (raw) in store is updated, re-crunch the data
   */
  componentDidUpdate = (prevProps, prevState) => {
    if (
      prevProps.pos !== this.props.pos ||
      prevProps.data !== this.props.data ||
      prevProps.includedGraphs !== this.props.includedGraphs
    ) {
      this.setState({ graphData: this.getGraphData(this.props.pos) });
    }
    if (prevState.graphData !== this.state.graphData) {
      let processedGraphData = this.distributeDataIntoKeywords(
        this.state.graphData
      );
      this.props.setProcessedGraphData(processedGraphData);
    }
  };

  getGraphData = pos => {
    let data = this.props.data;
    let graphData = [];
    for (var i = 0; i < data.length; i++) {
      let lat = parseFloat(data[i].latitude);
      let lng = parseFloat(data[i].longitude);
      if (
        pos.lat - epsilon <= lat &&
        lat <= pos.lat + epsilon &&
        pos.lng - epsilon <= lng &&
        lng <= pos.lng + epsilon
      ) {
        graphData.push(data[i]);
      }
    }
    return graphData;
  };

  /* Take the fetched data and create a list of list to be used
   * as data input for the graphs.
   */
  distributeDataIntoKeywords = graphData => {
    //keep track of the subgraphs, should be refactored into creating subgraphs based on global available pollutants
    let nameList = [];
    //data of graphs
    let processedGraphData = {};
    //Ignore non-pollutans
    let pollutants = this.props.pollutants;

    //iterate through input list
    if (graphData !== null && graphData.length !== 0) {
      for (let i = 0; i < graphData.length; i++) {
        const object = graphData[i];
        for (const [key, value] of Object.entries(object)) {
          if (pollutants.includes(key)) {
            if (!(key in processedGraphData)) {
              nameList.push(key);
              processedGraphData[key] = [];
            }
            processedGraphData[key].push({
              x: parseFloat(object.timestamp),
              y: parseFloat(value)
            });
          }
        }
      }
    }
    return processedGraphData;
  };

  render = () => {
    //console.log("processedGraphData", this.props.processedGraphData);
    return (
      <div className="Main" style={styles}>
        <Divider />
        {this.props.includedGraphs.map(value => (
          <div key={"div" + value}>
            <Divider key={"divider" + value} />
            <PollutantGraph
              key={value}
              name={this.state.labels[value]}
              rawData={
                this.props.processedGraphData == null ||
                Object.keys(this.props.processedGraphData).length === 0
                  ? []
                  : this.props.processedGraphData[value]
              }
              thresholdYellow={this.state.thresholdYellow[value]}
              thresholdRed={this.state.thresholdRed[value]}
            />
          </div>
        ))}
      </div>
    );
  };
}

//This function makes the state data available to this(rightSide) component as props.
const mapStateToProps = state => ({
  graphData: state.graphData.graphData,
  pos: state.pos.pos,
  processedGraphData: state.processedGraphData.processedGraphData,
  includedGraphs: state.includedGraphs.includedGraphs,
  pollutants: state.pollutants.pollutants,
  data: state.data.items
});

//connect is used to connect redux and react parts of the app. (Figuratively)
export default connect(
  mapStateToProps,
  {
    fetchData,
    fetchGraphData,
    setMarker,
    setProcessedGraphData,
    setIncludedGraphs,
    setPollutants
  }
)(RightSide);
