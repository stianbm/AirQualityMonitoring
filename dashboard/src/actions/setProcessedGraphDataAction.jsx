//these are the actions which will call reducers.

import { SET_PROCESSED_GRAPH_DATA } from "./actionTypes";

//dispatch thing is from thunk middleware
export const setProcessedGraphData = data => dispatch => {
  dispatch({
    type: SET_PROCESSED_GRAPH_DATA,
    payload: data
  });
};
