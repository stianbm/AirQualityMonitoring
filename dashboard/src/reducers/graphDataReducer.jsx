import { FETCH_GRAPH_DATA } from "../actions/actionTypes";

//items is the array where we will store the data we fetch.
const initialState = {
  graphData: []
};

//This is a pure reducer function which takes 2 arguments, (initial state, action)
export default function(state = initialState, action) {
  switch (action.type) {
    case FETCH_GRAPH_DATA:
      return {
        ...state,
        graphData: action.payload
      };
    default:
      return state;
  }
}
