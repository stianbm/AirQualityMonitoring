/* Base Component*/

import React, { Component } from "react";
import ResponsiveDrawer from "./responsiveDrawer/responsiveDrawer";

import "./App.css";
import Leaflet from "leaflet";

import { Provider } from "react-redux";
// Provider wraps entire app and makes 'store' available to our react app.
import store from "../store.jsx";

Leaflet.Icon.Default.imagePath =
  "//cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/";

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <ResponsiveDrawer />
        </div>
      </Provider>
    );
  }
}

export default App;
