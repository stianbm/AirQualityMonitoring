//these are the actions which will call reducers.

import { FETCH_DATA } from "./actionTypes";
import { apiUrl } from "../config";
import { GET_SVAL } from "./actionTypes";

//dispatch thing is from thunk middleware
export const fetchData = value => dispatch => {
  let hours = 60 * 60 * 1000;
  let currentTime = new Date(Date.now());
  currentTime.setHours(
    currentTime.getHours() - currentTime.getTimezoneOffset() / 60
  );
  let startTime = new Date(currentTime - value * hours);
  currentTime = currentTime.toISOString().substring(0, 19);
  startTime = startTime.toISOString().substring(0, 19);

  let urlData = apiUrl + "/fetch?time=" + startTime + "," + currentTime;
  //console.log("fetching:", urlData);
  fetch(urlData)
    .then(res => res.json())
    .then(data => {
      //console.log("data: ", data);
      dispatch({
        type: FETCH_DATA,
        payload: data.data
      });
    });
};

export const getSval = value => dispatch => {
  dispatch({
    type: GET_SVAL,
    payload: value
  });
};
