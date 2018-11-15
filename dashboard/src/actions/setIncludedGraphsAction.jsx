//these are the actions which will call reducers.

import { SET_INCLUDED_GRAPHS } from "./actionTypes";

//dispatch thing is from thunk middleware
export const setIncludedGraphs = graphName => dispatch => {
  dispatch({
    type: SET_INCLUDED_GRAPHS,
    payload: graphName
  });
};
