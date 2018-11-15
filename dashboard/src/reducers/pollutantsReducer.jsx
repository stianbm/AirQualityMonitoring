import { SET_POLLUTANTS } from "../actions/actionTypes";

//items is the array where we will store the data we fetch.
const initialState = {
  pollutants: null
};

//This is a pure reducer function which takes 2 arguments, (initial state, action)
export default function(state = initialState, action) {
  switch (action.type) {
    case SET_POLLUTANTS:
      return {
        ...state,
        pollutants: action.payload
      };
    default:
      return state;
  }
}
