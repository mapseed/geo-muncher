require("dotenv").config();
const { exec } = require("child_process");
const fs = require("fs");
const shell = require("shelljs");
const aws = require("aws-sdk");
const glob = require("glob");
const path = require("path");
const MapboxClient = require("mapbox");

const client = new MapboxClient(process.env.MAPBOX_ACCESS_TOKEN);

const username = process.env.MAPBOX_USERNAME;
const tempfileDir = "./output";
let awsCreds;
new Promise((resolve, reject) => {
  console.log("Fetching and converting ESRI data...");

  shell.rm("-rf", tempfileDir);
  shell.mkdir("-p", tempfileDir);
  exec(`agsout -o ${tempfileDir}`, (error, stdout, stderror) => {
    if (error) {
      reject("Error converting to GeoJSON: " + error);
      return;
    }
    resolve();
  });
})
  .then(result => {
    return new Promise((resolve, reject) => {
      const geojsonFiles = glob.sync(`./${tempfileDir}/**/*.geojson`);
      let uploadCount = 0;
      geojsonFiles.forEach(filePath => {
        client.createUploadCredentials((error, credentials) => {
          const s3 = new aws.S3({
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            sessionToken: credentials.sessionToken,
            region: "us-east-1",
          });

          const filename = path.basename(filePath).split(".")[0];
          console.log(`Pushing ${filename} to S3...`);
          s3.putObject(
            {
              Bucket: credentials.bucket,
              Key: credentials.key,
              Body: fs.readFileSync(filePath),
            },
            (error, response) => {
              if (error) {
                reject("Error pushing to S3: " + JSON.stringify(error));
                return;
              }

              console.log(`Initiating upload to Mapbox for ${filename}...`);
              client.createUpload(
                {
                  tileset: [username, filename].join("."),
                  url: credentials.url,
                  name: filename,
                },
                (error, upload) => {
                  if (error) {
                    reject(
                      "Error uploading to Mapbox: " + JSON.stringify(error)
                    );
                    return;
                  }

                  if (++uploadCount === geojsonFiles.length) {
                    resolve();
                  }
                }
              );
            }
          );
        });
      });
    });
  })
  .then(() => {
    console.log(
      "Done! Tileset conversion(s) should now be processing in Mapbox."
    );
  })
  .catch(error => {
    console.log(error);
  });
