//these are the actions which will call reducers.

import { SET_POLLUTANTS } from "./actionTypes";

//dispatch thing is from thunk middleware
export const setPollutants = pollutants => dispatch => {
  dispatch({
    type: SET_POLLUTANTS,
    payload: pollutants
  });
};
