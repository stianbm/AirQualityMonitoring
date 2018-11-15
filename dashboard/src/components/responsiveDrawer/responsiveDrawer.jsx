import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import MailFolderListItems from "./buttons/buttons";
import BaseMap from "./basemap/basemap";
import RightSide from "../rightSide/rightSide";
import PollutionButtons from "./pollutionLevelButtons";
//redux
import { connect } from "react-redux";
import { fetchData } from "../../actions/fetchMapDataAction";
import { setRBVal } from "../../actions/setRButtonValueAction";
import { getSval } from "../../actions/fetchMapDataAction";

//Use this to test redux actions.
//import BasemapData from './basemap/basemapdata';

//info and feedback icons
import InfoText from "../feedback/infoText";
import FeedbackForm from "../feedback/feedbackForm";

import TimeSlider from "./timeSlider.jsx";

const drawerWidth = 200;

const styles = theme => ({
  root: {
    flexGrow: 1,
    height: "100vh",
    zIndex: 1,
    overflow: "hidden",
    position: "relative",
    display: "flex"
  },
  appBar: {
    backgroundColor: "#6986BC",
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 36
  },
  hide: {
    display: "none"
  },
  drawerPaper: {
    backgroundColor: "#EDEDED",
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    width: theme.spacing.unit * 7,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing.unit * 9
    }
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar
  },
  content: {
    flexGrow: 1,
    position: "relative",
    paddingTop: "4%",
    height: "85vh",
    float: "right"
  },
  slider: {
    width: "80%",
    float: "left"
  },
  infoFeedback: {}
});

class ResponsiveDrawer extends React.Component {
  state = {
    open: true,
    value: 1,
    rbValue: 1,
    showGraphs: true
  };

  constructor(props) {
    super(props);
    if (window.innerWidth < 700) {
      this.state.open = false;
    }
  }

  updateShowGraphs = () => {
    this.setState({ showGraphs: window.innerWidth > 1000 });
  };

  componentDidMount() {
    this.updateShowGraphs();
    window.addEventListener("resize", this.updateShowGraphs);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateShowGraphs);
  }

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  // This function receives value from child and dispatches an action with the slider value as argument
  getSliderValue(value) {
    ////console.log('from parent ' + value);
    this.setState({ value: value });
    ////console.log(this.props);
    this.props.getSval(value);
  }

  setRButtonValue = value => {
    this.setState({ rbValue: value });
    this.props.setRBVal(value);
  };

  render() {
    const { classes, theme } = this.props;
    const showGraphs = this.state.showGraphs;

    return (
      <div className={classes.root}>
        <AppBar
          position="absolute"
          className={classNames(
            classes.appBar,
            this.state.open && classes.appBarShift
          )}
        >
          <Toolbar disableGutters={!this.state.open}>
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={this.handleDrawerOpen}
              className={classNames(
                classes.menuButton,
                this.state.open && classes.hide
              )}
            >
              <ChevronRightIcon />
            </IconButton>
            <Typography variant="title" color="inherit" noWrap>
              Air Quality Map
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          classes={{
            paper: classNames(
              classes.drawerPaper,
              !this.state.open && classes.drawerPaperClose
            )
          }}
          open={this.state.open}
        >
          <div className={classes.toolbar}>
            <IconButton onClick={this.handleDrawerClose}>
              {theme.direction === "rtl" ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          </div>
          <Divider />
          <List className={classes.infoFeedback}>
            <InfoText />
            <FeedbackForm />
          </List>
          <Divider />
          <List>
            <PollutionButtons sendValue={this.setRButtonValue.bind(this)} />
          </List>
          <List>
            <MailFolderListItems />
          </List>
        </Drawer>
        {showGraphs ? (
          <main className={classes.content}>
            <BaseMap flexGrow={0.8} />
            <RightSide />
            <div className={classes.slider}>
              <TimeSlider sendValue={this.getSliderValue.bind(this)} />
            </div>
          </main>
        ) : (
          <main className={classes.content}>
            <BaseMap />
            <div className={classes.slider}>
              <TimeSlider sendValue={this.getSliderValue.bind(this)} />
            </div>
          </main>
        )}
      </div>
    );
  }
}

ResponsiveDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired
};

//This function makes the state data available to this(BasemapData) component as props.
const mapStateToProps = state => ({
  data: state.data.items,
  svalue: state.sval.svalue,
  rbValue: state.rbVal.rbValue
});

export default connect(
  mapStateToProps,
  { fetchData, getSval, setRBVal }
)(withStyles(styles, { withTheme: true })(ResponsiveDrawer));

//export default withStyles(styles, { withTheme: true })(ResponsiveDrawer);
