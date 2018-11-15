import { SET_MARKER } from "../actions/actionTypes";

//items is the array where we will store the data we fetch.
const initialState = {
  pos: null
};

//This is a pure reducer function which takes 2 arguments, (initial state, action)
export default function(state = initialState, action) {
  switch (action.type) {
    case SET_MARKER:
      return {
        ...state,
        pos: action.payload
      };
    default:
      return state;
  }
}
