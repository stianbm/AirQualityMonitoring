import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";

const styles = theme => ({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 0px"
  },
  formControl: {
    margin: theme.spacing.unit * 1,
    padding: "0px 0px 16px"
  },
  group: {
    margin: `${theme.spacing.unit}px 18px`
  },
  title: {
    margin: "0 72px"
  },
  radio: {
    color: "#6986BC",
    "&$checked": {
      color: "#6986BC"
    },
    marginRight: "21px"
  }
});

class PollutionButtons extends React.Component {
  state = {
    color: "green"
  };

  handleChange = (event, color) => {
    this.setState({ color: color });
    this.props.sendValue(this.colorToValue(color));
  };

  colorToValue = color => {
    return color === "green" ? 1 : color === "yellow" ? 2 : 3;
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend" className={classes.title}>
            Minimum
            <br />
            Level
          </FormLabel>
          <RadioGroup
            aria-label="Minimum Pollution"
            name="polLvl"
            className={classes.group}
            value={this.state.color}
            onChange={this.handleChange}
          >
            <FormControlLabel
              value="green"
              control={<Radio className={classes.radio} color="default" />}
              label="Green"
            />
            <FormControlLabel
              value="yellow"
              control={<Radio className={classes.radio} color="default" s />}
              label="Yellow"
            />
            <FormControlLabel
              value="red"
              control={<Radio className={classes.radio} color="default" />}
              label="Red"
            />
          </RadioGroup>
        </FormControl>
      </div>
    );
  }
}

PollutionButtons.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(PollutionButtons);
