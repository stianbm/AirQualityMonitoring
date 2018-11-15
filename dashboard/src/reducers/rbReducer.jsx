import { SET_RBUTTON } from "../actions/actionTypes";

const intitialState = {
  rbValue: 1
};

export default function(state = intitialState, action) {
  switch (action.type) {
    case SET_RBUTTON:
      return {
        ...state,
        rbValue: action.payload
      };
    default:
      return state;
  }
}
