import { GET_SVAL } from "../actions/actionTypes";

const intitialState = {
  svalue: [1, 0]
};

export default function(state = intitialState, action) {
  switch (action.type) {
    case GET_SVAL:
      return {
        ...state,
        svalue: action.payload
      };
    default:
      return state;
  }
}
