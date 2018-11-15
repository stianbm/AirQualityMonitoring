import { SET_INCLUDED_GRAPHS } from "../actions/actionTypes";

//items is the array where we will store the data we fetch.
const initialState = {
  includedGraphs: null
};

//This is a pure reducer function which takes 2 arguments, (initial state, action)
export default function(state = initialState, action) {
  switch (action.type) {
    case SET_INCLUDED_GRAPHS:
      return {
        ...state,
        includedGraphs: action.payload
      };
    default:
      return state;
  }
}
