const request = require("request");
const colorsys = require("colorsys");
const fs = require("fs");
const aws = require("aws-sdk");

const externalCategories = [
  "Upper South Fk Stillaguamish",
  "Stillaguamish Canyon",
  "Allen Creek",
  "Lake Stevens",
  "Upper Sultan River",
  "Sunnyside",
  "Snohomish Estuary",
  "Lower Pilchuck River",
  "Fobes Hill",
  "Lower Sultan River",
  "Upper North Fork Skykomish",
  "Marshland",
  "Olney Creek",
  "French Creek",
  "Upper Wallace River",
  "Lower North Fork Skykomish",
  "Bear Creek (7)",
  "May Creek",
  "Rapid River",
  "Beckler River",
  "Upper Mainstem Skykomish",
  "Snoqualmie Mouth",
  "McAleer Creek",
  "Cherry Creek",
  "Lower South Fork Skykomish",
  "Lyon Creek",
  "North Fork Tolt River",
  "South Fork Skykomish",
  "Tye River",
  "Mid-Mainstem Snoqualmie",
  "Lower Tolt River",
  "Harris Creek",
  "Upper South Fork Skykomish",
  "South Fork Tolt River_Bd",
  "South Fork Tolt River_Ad",
  "Miller River",
  "Foss River",
  "Tokul Creek",
  "Ames Creek",
  "Upper North Fork Snoqualmie",
  "Griffin Creek",
  "Patterson Creek",
  "Upper Mainstem Snoqualmie",
  "Lower North Fork Snoqualmie",
  "Taylor River",
  "Coal Creek_Lower",
  "Tate Creek",
  "Raging River",
  "Upper Middle Fork Snoqualmie",
  "Coal Creek_Upper",
  "Lower Middle Fork Snoqualmie",
  "Pratt River",
  "Lower South Fork Snoqualmie",
  "Upper South Fork Snoqualmie",
  "Sauk River",
  "Squire Creek",
  "Robe Valley",
  "Gold Basin",
  "Deer Creek",
  "Upper North Fk Stillaguamish",
  "Middle North Fk Stillaguamish",
  "French-Segelsen",
  "Harvey Armstrong Creek",
  "Boulder River",
  "Jim Creek",
  "Lower South Fk Stillaguamish",
  "Upper Canyon Creek",
  "Quilceda Creek",
  "Lower Canyon Creek",
  "Little Pilchuck Creek",
  "Lower North Fk Stillaguamish",
  "Upper Pilchuck Creek",
  "Lower Pilchuck Creek",
  "Skagit Flats South",
  "Church Creek",
  "Lower Stillaguamish",
  "Portage Creek",
  "Port Susan Drainages",
  "Tulalip",
  "Middle Pilchuck River",
  "Upper Pilchuck River",
  "Dubuque Creek",
  "West Fork Woods Creek",
  "Woods Creek",
  "Lower Woods Creek",
  "Lower Mainstem Skykomish",
  "Cathcart Drainages",
  "Little Bear Creek",
  "Bear Creek (8)",
  "Everett Drainages",
  "Swamp Creek",
  "North Creek",
  "Puget Sound Drainage",
];

// Spectral.
// const HSV_STOPS = [
//   [0, 89, 84],
//   [29, 62, 97],
//   [60, 25, 100],
//   [112, 26, 87],
//   [203, 77, 73],
// ];

// Viridis.
const HSV_STOPS = [
  [54, 98, 57],
  [105, 57, 57],
  [174, 65, 36],
  [221, 41, 39],
  [288, 73, 19],
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
  // request(
  //   {
  //     method: "GET",
  //     url:
  //       "https://s3-us-west-2.amazonaws.com/vector-tile-layers/geology-100k/metadata.json",
  //   },
  //   (error, result) => {
  //     if (error) {
  //       reject("Error fetching metadata.json: " + error);
  //     }

  //     resolve(JSON.parse(result.body));
  //   }
  // );
  resolve();
})
  .then(result => {
    // const categories = JSON.parse(result.json)
    //   .tilestats.layers.find(layer => layer.layer === TARGET_LAYER)
    //   .attributes.find(attribute => attribute.attribute === TARGET_CATEGORY)
    //   .values;

    const categories = externalCategories;

    const fillColors = interpolateHSVRange(HSV_STOPS, categories.length);

    const output = {
      base: 1,
      type: "categorical",
      property: "SUBBASIN",
      stops: [],
    };

    categories.forEach((category, i) => {
      output.stops.push([
        {
          zoom: 0,
          value: category,
        },
        fillColors[i],
      ]);
    });

    fs.writeFile(
      "./styles.json",
      // JSON.stringify({ categories: categories, fillColors: fillColors }),
      JSON.stringify(output),
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
