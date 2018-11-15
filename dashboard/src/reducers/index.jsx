//This is the place where all the reducers we defined in reducers will be combined and made available to the app.

import { combineReducers } from "redux";
import dataReducer from "./dataReducer.jsx";
import markerReducer from "./markerReducer.jsx";
import graphDataReducer from "./graphDataReducer.jsx";
import processedGraphDataReducer from "./processedGraphDataReducer.jsx";
import get_sval_red from "./getSvalRed";
import includedGraphsReducer from "./includedGraphsReducer.jsx";
import pollutantsReducer from "./pollutantsReducer.jsx";
import rbReducer from "./rbReducer";

export default combineReducers({
  data: dataReducer, //Data for baseMap
  pos: markerReducer, //Position for marker
  graphData: graphDataReducer, //Raw data for graphs
  processedGraphData: processedGraphDataReducer, //Raw data divided into lists based on pollutants
  sval: get_sval_red, //Slider value
  includedGraphs: includedGraphsReducer, //Graphs to be rendered/checboxes to be checked
  pollutants: pollutantsReducer, //Pollutants to be handeled, fetchec from config
  rbVal: rbReducer // Radio buttons for min pollution level.
});
