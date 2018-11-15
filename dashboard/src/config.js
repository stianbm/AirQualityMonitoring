export const thresholds = [
  // [name, thresholdYellow, thresholdRed, label],
  ["co2_ppm", 600, 900, "CO2 (ppm)"],
  ["particles_0_3um", 5000, 100000, "Particles 0-3 \u03BCm"],
  ["particles_3_10um", 5000, 100000, "Particles 3-10 \u03BCm"]
];

// The start position for graphs
export const startPos = { lat: 69.649, lng: 18.955 };
export const epsilon = 0.01;
export const apiUrl = "http://18.224.107.237/api";
