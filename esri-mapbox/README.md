## ESRI Rest Services to Mapbox data ingester

### Installation

From the `esri-mapbox` folder of this repo, run:

```
npm install
```

### Usage

Create a file called `services.txt` in the `esri-mapbox` folder. Each line of this file should contain a url to an ESRI Rest Services endpoint, plus the name of a layer at that endpoint following a `|` (pipe) character. An example `services.txt` file might look like this:

```
https://gisdata.kingcounty.gov/arcgis/rest/services/OpenDataPortal/enviro___base/MapServer/302|wildnet96_line
https://gisdata.kingcounty.gov/arcgis/rest/services/OpenDataPortal/enviro___base/MapServer/292|coalmine_area
```

See [here](https://github.com/tannerjt/AGStoShapefile) for more details on the correct format for the `services.txt` file.

### Notes

This utility requires Node `6.x`. If using `nvm`, you can run:

```
nvm use 6.0
```
