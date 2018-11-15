import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
//thunk is a middleware to dispatch actions.
import rootReducer from "./reducers/index";

const initialState = {};
//here, we are setting an initial state for the app.

const middleware = [thunk];

/*  store is a place where the state of entire app resides. createStore() is a function which takes 3 arguments 
and returns global state. It is a function from redux. */
const store = createStore(
  rootReducer,
  initialState,
  compose(
    applyMiddleware(...middleware)
    //This is for redux chrome extension
    //window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
);

export default store;
