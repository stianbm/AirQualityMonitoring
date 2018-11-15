//these are the actions which will call reducers.

import { SET_MARKER } from "./actionTypes";

//dispatch thing is from thunk middleware
export const setMarker = (lat, lng) => dispatch => {
  ////console.log("action: ", lat, lng);
  let tuple = { lat: lat, lng: lng };
  dispatch({
    type: SET_MARKER,
    payload: tuple
  });
};
