import React from "react";
import { shallow, mount, render } from "enzyme";
import App from "../components/App";

import ResponsiveDrawer from "../components/responsiveDrawer/responsiveDrawer.jsx";
import Right_side from "../components/rightSide/rightSide.jsx";

describe("The app", function() {
  it("should shallow correctly", () => {
    expect(shallow(<App />)).toMatchSnapshot();
  });

  it("should render a div withour errors", () => {
    expect(
      shallow(<App />).contains(
        <div className="App">
          <ResponsiveDrawer />
        </div>
      )
    ).toBe(true);
  });
});
