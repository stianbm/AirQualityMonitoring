/* Icons and Text for Icons */

import React, { Component } from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { connect } from "react-redux";
import { setIncludedGraphs } from "../../../actions/setIncludedGraphsAction";
import Checkbox from "@material-ui/core/Checkbox";
import { Divider } from "@material-ui/core";
import { thresholds } from "../../../config";
import { setPollutants } from "../../../actions/setPollutantsAction";

class mailFolderListItems extends Component {
  state = {
    includedGraphs: null, //Keeps track of ticked boxes/included graphs
    pollutants: null //Keeps track of all pollutants available
  };

  /* Sets the dataKeys (name of graphs) locally and in the
   * store (if it's not there already), also sets the
   * includedGraphs list that governs which pollutants will
   * be rendered as graphs, everyone is selected by default.
   */
  constructor(props) {
    super(props);

    // Pollutants
    let pollutants = [];
    let labels = [];
    if (this.props.pollutants == null) {
      for (let i = 0; i < thresholds.length; i++) {
        pollutants.push(thresholds[i][0]);
        labels.push(thresholds[i][3]);
      }
      this.props.setPollutants(pollutants);
    } else {
      pollutants = this.props.pollutants;
      labels = this.props.pollutants;
    }
    this.state.pollutants = pollutants;
    this.state.labels = labels;

    // Included Graphs
    if (this.props.includedGraphs == null) {
      this.props.setIncludedGraphs(pollutants);
    }
    this.state.includedGraphs = pollutants;
  }

  /*Runs when a checkbox is clicked, updates state for
   * rendering and the store for graph rendering.
   * In order to keep the graph order, a new list is
   * created instead of pushing to includedGraphs, it
   * iterates through pollutants in the set order and
   * adds to the new list.
   */

  handleToggle = value => () => {
    const { includedGraphs } = this.state;
    const currentIndex = includedGraphs.indexOf(value);
    let newIncludedGraphs = [...includedGraphs];
    if (currentIndex === -1) {
      newIncludedGraphs.push(value);
      if (this.props.pollutants != null) {
        let pollutants = this.props.pollutants;
        let tempIncludedGraphs = [];
        for (let i = 0; i < pollutants.length; i++) {
          if (newIncludedGraphs.includes(pollutants[i])) {
            tempIncludedGraphs.push(pollutants[i]);
          }
        }
        newIncludedGraphs = tempIncludedGraphs;
      }
    } else {
      newIncludedGraphs.splice(currentIndex, 1);
    }

    this.setState({
      includedGraphs: newIncludedGraphs
    });

    this.props.setIncludedGraphs(newIncludedGraphs);
  };

  /* Iterates with map, found most of this online and modified
   */
  render = () => {
    return (
      <div>
        <Divider />
        {this.state.pollutants.map(value => (
          <ListItem
            key={value}
            role={undefined}
            dense
            button
            onClick={this.handleToggle(value)}
          >
            <Checkbox
              checked={this.state.includedGraphs.indexOf(value) !== -1}
              tabIndex={-1}
              disableRipple
              style={{ color: "#6986BC", width: "0px", marginRight: "17px" }}
            />
            <ListItemText
              primary={this.state.labels[this.state.pollutants.indexOf(value)]}
            />
          </ListItem>
        ))}
        <Divider />
      </div>
    );
  };
}

const mapStateToProps = state => ({
  includedGraphs: state.includedGraphs.includedGraphs,
  pollutants: state.pollutants.pollutants
});

export default connect(
  mapStateToProps,
  { setIncludedGraphs, setPollutants }
)(mailFolderListItems);
