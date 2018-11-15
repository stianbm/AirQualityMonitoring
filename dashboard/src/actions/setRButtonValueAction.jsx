import { SET_RBUTTON } from "./actionTypes";

export const setRBVal = value => dispatch => {
  dispatch({
    type: SET_RBUTTON,
    payload: value
  });
};
