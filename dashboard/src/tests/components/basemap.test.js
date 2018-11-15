import React from "react";
import { shallow, mount, render } from "enzyme";
import BaseMap from "../../components/responsiveDrawer/basemap/basemap";

import { Provider } from "react-redux";
// Provider wraps entire app and makes 'store' available to our react app.
import store from "../../store";

describe("The Basemap component", function() {
  it("should shallow correctly", () => {
    expect(
      shallow(
        <Provider store={store}>
          <BaseMap />
        </Provider>
      )
    ).toMatchSnapshot();
  });
});
