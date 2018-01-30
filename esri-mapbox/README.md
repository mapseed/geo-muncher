## ESRI REST Services to Mapbox data ingester

This utility will automatically convert data hosted at ESRI REST Services endpoints to Mapbox-hosted vector tiles.

### Installation

From the `esri-mapbox` folder of this repo, run:

```
npm install
```

### Usage

Create a file called `services.txt` in the `esri-mapbox` folder. Each line of this file should contain a url to an ESRI REST Services endpoint, plus the name of a layer at that endpoint following a `|` (pipe) character. An example `services.txt` file might look like this:

```
https://gisdata.kingcounty.gov/arcgis/rest/services/OpenDataPortal/enviro___base/MapServer/302|wildnet96_line
https://gisdata.kingcounty.gov/arcgis/rest/services/OpenDataPortal/enviro___base/MapServer/292|coalmine_area
```

See [here](https://github.com/tannerjt/AGStoShapefile) for more details on the correct format for the `services.txt` file.

You will also need to create a `.env` file in the `esri-mapbox` folder with the following environment variables set:

```
MAPBOX_ACCESS_TOKEN=<your-mapbox-token>
MAPBOX_USERNAME=<your-mapbox-username>
```

Note that the Mapbox token used with this script must have the following scope set: `uploads:write`. If you don't already have a token with this scope, you can create one in the `Access tokens` panel in the Mapbox Account dashboard.

To begin processing data, run:

```
npm run start
```

This will loop through each endpoint listed in `services.txt` and upload the endpoint's geographic data and attributes (but not style information) to Mapbox.

### NPM Dependencies

[`agsout`](https://www.npmjs.com/package/agsout)
[`aws-sdk`](https://www.npmjs.com/package/aws-sdk)
[`mapbox`](https://www.npmjs.com/package/mapbox)
[`dotenv`](https://www.npmjs.com/package/dotenv)
[`glob`](https://www.npmjs.com/package/glob)
[`shelljs`](https://www.npmjs.com/package/shelljs)

### Notes

This utility requires Node `6.x`. If using `nvm`, you can run:

```
nvm use 6.0
```
