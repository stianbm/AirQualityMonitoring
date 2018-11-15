/* Icons and Text for Icons */

import React, { Component } from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import InfoIcon from "@material-ui/icons/Info";

//Dialogue
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

class InfoText extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      open: false,
      scroll: "paper"
    };
  }

  handleClick = scroll => () => {
    this.setState({ open: true, scroll });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    let rootStyle = {
      display: "flex"
    };
    let circleStyle1 = {
      padding: 10,
      marginRight: "10px",
      marginTop: "16px",
      backgroundColor: "#66ff66",
      borderRadius: "50%",
      width: 2,
      height: 2
    };
    let circleStyle2 = {
      padding: 10,
      marginRight: "10px",
      marginTop: "16px",
      backgroundColor: "#ffff66",
      borderRadius: "50%",
      width: 2,
      height: 2
    };
    let circleStyle3 = {
      padding: 10,
      marginRight: "10px",
      marginTop: "16px",
      backgroundColor: "#ff5050",
      borderRadius: "50%",
      width: 2,
      height: 2
    };

    return (
      <div>
        <div>
          <Dialog
            open={this.state.open}
            onClose={this.handleClose}
            scroll={this.state.scroll}
            aria-labelledby="scroll-dialog-title"
            maxWidth={"md"}
            fullWidth={"true"}
          >
            <DialogTitle id="scroll-dialog-title">Info</DialogTitle>
            <DialogContent>
              <DialogContentText>
                <h4>Color coding: </h4>
                <div style={rootStyle}>
                  <div style={circleStyle1}> </div>
                  <p>The air quality is deemed safe for everyone.</p>
                </div>
                <div style={rootStyle}>
                  <div style={circleStyle2}> </div>
                  <p>Sensitive groups can feel some discomfort.</p>
                </div>
                <div style={rootStyle}>
                  <div style={circleStyle3}> </div>
                  <p>The air quality is poor and the area should be avoided.</p>
                </div>
                <h4>Slider</h4>
                <p>
                  The slider at the bottom of the map can adjust the time frame
                  for the map.
                </p>
                <h4>Graphs</h4>
                <p>
                  The graphs show the last 24h for an area around the marker.
                  The graphs are not visible on mobile version.
                </p>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </div>

        <ListItem button onClick={this.handleClick("paper")}>
          <ListItemIcon>
            <InfoIcon />
          </ListItemIcon>
          <ListItemText primary="Info" />
        </ListItem>
      </div>
    );
  }
}

export default InfoText;
