//This Component is from Material-Ui demo components called Slider.. Added some custom functions.
import "rc-slider/assets/index.css";
import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Range } from "rc-slider";

const styles = {
  root: {
    margin: "auto auto"
  },
  slider: {
    padding: "5px 0px",
    width: "50%",
    margin: "auto auto"
  },

  label: {
    textAlign: "center",
    padding: "5px 0px",
    margin: "auto auto"
  }
};

class TimeSlider extends React.Component {
  hours = 60 * 60 * 1000;
  state = {
    value: [1, 0]
  };

  //This function sends the slider value to parent component (responsiveDrawer)
  handleChange = value => {
    //console.log(value);
    let invertedValue = [24 - value[0], 24 - value[1]];
    this.setState({ value: invertedValue });
  };

  handleDragEnd = event => {
    //console.log("drag ended. sending:", this.state.value);
    this.props.sendValue(this.state.value);
  };

  getLabel = value => {
    let hours = 60 * 60 * 1000;
    let currentTime = new Date(Date.now());
    let startTime = new Date(currentTime.valueOf() - value[0] * hours);
    let endTime = new Date(currentTime.valueOf() - value[1] * hours);
    let startSameDay = startTime.getDate() === currentTime.getDate();
    let endSameDay = endTime.getDate() === currentTime.getDate();
    startTime =
      startTime.getHours() +
      ":" +
      (startTime.getMinutes() < 10 ? "0" : "") + // HH:MM instead of HH:M for Minutes < 10
      startTime.getMinutes();
    endTime =
      endTime.getHours() +
      ":" +
      (endTime.getMinutes() < 10 ? "0" : "") + // HH:MM instead of HH:M for Minutes < 10
      endTime.getMinutes();
    return (
      startTime +
      (startSameDay ? "" : " yesterday") +
      " - " +
      endTime +
      (endSameDay ? "" : " yesterday")
    );
  };

  render() {
    const { classes } = this.props;
    const { value } = this.state;

    return (
      <div className={classes.root}>
        <Typography className={classes.label} id="label" variant="button">
          {this.getLabel(value)}
        </Typography>
        <Range
          className={classes.slider}
          min={0}
          max={24}
          step={1}
          defaultValue={[23, 24]}
          pushable
          trackStyle={[{ backgroundColor: "#6986BC" }]}
          handleStyle={[
            { backgroundColor: "#6986BC" },
            { backgroundColor: "#6986BC" }
          ]}
          onChange={this.handleChange}
          onAfterChange={this.handleDragEnd}
          marks={{ 24: "now", 12: "12h ago", 0: "24h ago" }}
        />
      </div>
    );
  }
}

TimeSlider.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(TimeSlider);
