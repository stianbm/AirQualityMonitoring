import React, { Component } from "react";
import { AreaChart, Area, XAxis, YAxis } from "recharts";
import moment from "moment";

const styles = {
  paddingLeft: 40
};

class PollutantGraph extends Component {
  state = {
    rawData: null,
    thresholdYellow: null,
    thresholdRed: null,
    data: null,
    name: null
  };

  componentDidUpdate = prevProps => {
    if (prevProps.rawData !== this.props.rawData) {
      let data = this.addThresholds(
        this.props.rawData,
        this.props.thresholdYellow,
        this.props.thresholdRed
      );
      this.setState({
        rawData: this.props.rawData,
        thresholdYellow: this.state.thresholdYellow,
        thresholdRed: this.props.thresholdRed,
        name: this.props.name,
        data: data
      });
    }
  };

  addThresholds = (rawData, thresholdYellow, thresholdRed) => {
    if (rawData != null) {
      if (rawData.length > 0) {
        for (let i = 0; i < rawData.length; i++) {
          rawData[i]["thresholdYellow"] = thresholdYellow;
          rawData[i]["thresholdRed"] = thresholdRed;
        }
      }
    }
    return rawData;
  };

  render() {
    const data = this.state.data;
    const name = this.state.name;
    return (
      <div object-fit="scale-down">
        <h5 style={styles}>{name}</h5>
        <AreaChart
          width={220}
          height={150}
          data={data}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>

          <YAxis tick={{ fontSize: 10 }} />

          <XAxis
            tick={{ fontSize: 10 }}
            dataKey="x"
            domain={["auto", "auto"]}
            name="Time"
            tickFormatter={unixTime => moment(unixTime).format("HH:mm Do")}
            type="number"
          />

          <Area
            type="monotone"
            dataKey="thresholdRed"
            stroke="#FF0000"
            activeDot={{ r: 8 }}
            fillOpacity={0}
            fill="url(#colorPv)"
          />
          <Area
            type="monotone"
            dataKey="thresholdYellow"
            stroke="#EEBB00"
            activeDot={{ r: 8 }}
            fillOpacity={0}
            fill="url(#colorPv)"
          />
          <Area
            type="monotone"
            dataKey="y"
            stroke="#000000"
            fillOpacity={1}
            fill="url(#colorUv)"
          />
        </AreaChart>
      </div>
    );
  }
}

export default PollutantGraph;
