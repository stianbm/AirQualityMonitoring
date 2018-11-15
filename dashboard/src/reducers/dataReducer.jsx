import { FETCH_DATA } from "../actions/actionTypes";

//items is the array where we will store the data we fetch.
const initialState = {
  items: []
};

//This is a pure reducer function which takes 2 arguments, (initial state, action)
export default function(state = initialState, action) {
  ////console.log(action.type);
  switch (action.type) {
    case FETCH_DATA:
      ////console.log("data set from datareducer");
      ////console.log("Previous state: ", state);
      return {
        ...state,
        items: action.payload
      };
    default:
      return state;
  }
}
