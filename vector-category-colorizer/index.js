const request = require("request");
const colorsys = require("colorsys");
const fs = require("fs");
const aws = require("aws-sdk");

const HSV_STOPS = [
  [0, 89, 84],
  [29, 62, 97],
  [60, 25, 100],
  [112, 26, 87],
  [203, 77, 73],
];
const TARGET_LAYER = "geology";
const TARGET_CATEGORY = "GEOLOGIC_A";

const interpolateHSVPair = (lowerStop, upperStop, numSteps) => {
  const colorStops = [];
  const hueStep = (upperStop[0] - lowerStop[0]) / numSteps;
  const saturationStep = (upperStop[1] - lowerStop[1]) / numSteps;
  const valueStep = (upperStop[2] - lowerStop[2]) / numSteps;

  for (let i = 1; i < numSteps; i++) {
    colorStops.push(
      colorsys.hsvToHex({
        h: lowerStop[0] + i * hueStep,
        s: lowerStop[1] + i * saturationStep,
        v: lowerStop[2] + i * valueStep,
      })
    );
  }

  return colorStops;
};

const interpolateHSVRange = (stops, numCategories) => {
  const step = numCategories - 1;
  const numStops = stops.length;
  const stepsPerStop = Math.floor(numCategories / (numStops - 1) + 1);
  let colorStops = [];

  for (let i = 0; i < HSV_STOPS.length - 1; i++) {
    colorStops = colorStops.concat(
      interpolateHSVPair(HSV_STOPS[i], HSV_STOPS[i + 1], stepsPerStop)
    );
  }

  return colorStops;
};

new Promise((resolve, reject) => {
  request(
    {
      method: "GET",
      url:
        "https://s3-us-west-2.amazonaws.com/vector-tile-layers/geology-100k/metadata.json",
    },
    (error, result) => {
      if (error) {
        reject("Error fetching metadata.json: " + error);
      }

      resolve(JSON.parse(result.body));
    }
  );
})
  .then(result => {
    const categories = JSON.parse(result.json)
      .tilestats.layers.find(layer => layer.layer === TARGET_LAYER)
      .attributes.find(attribute => attribute.attribute === TARGET_CATEGORY)
      .values;

    const fillColors = interpolateHSVRange(HSV_STOPS, categories.length);

    fs.writeFile(
      "./styles.json",
      JSON.stringify({ categories: categories, fillColors: fillColors }),
      error => {
        if (error) {
          reject("Error creating styles.json: " + error);
          return;
        }
      }
    );
  })
  .catch(error => {
    console.log(error);
  });
