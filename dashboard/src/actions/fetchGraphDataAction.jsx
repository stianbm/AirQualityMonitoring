//these are the actions which will call reducers.

import { FETCH_GRAPH_DATA } from "./actionTypes";
import { apiUrl } from "../config";
//dispatch thing is from thunk middleware
export const fetchGraphData = pos => dispatch => {
  ////console.log("Fetching graph data");
  //time=2018-05-01T00:00:00,2018-06-01T00:00:00&
  let call =
    apiUrl +
    "/fetch?time=2018-06-01T00:00:00,2018-06-02T00:00:00&location=" +
    pos.lat.toString() + // 69.7182 + //
    "," +
    pos.lng.toString() +
    ",0.01"; //19.1239; //
  fetch(call)
    .then(res => res.json())
    .then(data => {
      dispatch({
        type: FETCH_GRAPH_DATA,
        payload: data.data
      });
    });
};

// TODO: add arguments for pos and time period and update fetch
