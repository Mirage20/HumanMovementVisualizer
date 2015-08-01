/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global d3 */

// base map object which handles the geo data for drawing the map
var BaseMap = {};

BaseMap.draw = function (geojson) {
    var scale = 150;

    var projection = d3.geo.mercator()
            .scale(scale)
            .center(d3.geo.centroid(geojson))
            .translate([MapContainer.width / 2, MapContainer.height / 2]);

    var path = d3.geo.path().projection(projection);
    var bounds = path.bounds(geojson);


    var hscale = scale * MapContainer.width / (bounds[1][0] - bounds[0][0]);
    var vscale = scale * MapContainer.height / (bounds[1][1] - bounds[0][1]);
    var scale = (hscale < vscale) ? hscale : vscale;
    var offset = [MapContainer.width - (bounds[0][0] + bounds[1][0]) / 2, MapContainer.height - (bounds[0][1] + bounds[1][1]) / 2];



    projection = d3.geo.mercator().center(d3.geo.centroid(geojson)).scale(scale).translate(offset);
    path = path.projection(projection);

    MapContainer.groupBaseMap = MapContainer.groupMain.append("g").attr("id", "groupBaseMap");
    DataMapper.mapProjection = projection;
    DataMapper.mapPath = path;
    MapContainer.groupBaseMap.selectAll("path")
            .data(geojson.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("id", function (d) {
                //console.log(d.properties.NAME_1);             
                return d.id;
            })
            .style("fill", "#F3F1ED")
            .style("stroke-width", ".5")
            .style("stroke", "rgb(128,128,128)")
            //.style("stroke-dasharray", "40,40")
            .style("vector-effect", "non-scaling-stroke");


    DataMapper.clearPathData();
    d3.selectAll("#groupBaseMap path").each(function (d, i) {
        DataMapper.addPathData(d);
    });

//    MapContainer.groupBaseMap.selectAll('path').on("click", function () {
//
//        console.log(projection.invert(d3.mouse(this)));
//        console.log(d3.mouse(this));
//        d3.select(this).style({fill: 'green'});
//    });


    MapNavigator.mapZoom.scale(1);
    MapNavigator.mapZoom.translate([0, 0]);
    MapContainer.groupMain.attr("transform", "translate(0,0)scale(1)");
//    svgMap.append('text').text('I have no idea what I am doing')
//            .attr('x', 50)
//            .attr('y', 150)
//            .style({"font-size": "18px", "z-index": "999999999"});
//    //console.log(projection([79.861243, 6.9270786]));
//    var elem = document.elementFromPoint(406, 373);
//    //console.log(elem);
//    d3.select(elem).style({fill: 'green'});
};

BaseMap.getRegionNameFromPathData = function (pathData)
{
    if (typeof pathData.properties.NAME_2 !== 'undefined')
        return pathData.properties.NAME_2;
    else if (typeof pathData.properties.NAME_1 !== 'undefined')
        return pathData.properties.NAME_1;
    else if (typeof pathData.properties.NAME_0 !== 'undefined')
        return pathData.properties.NAME_0;
};

// html svg and group element container
var MapContainer = {};

// object for managing zooming and panning
var MapNavigator = {};

MapNavigator.getZoomTransition = function (projectedPosition)
{
    var translate = this.mapZoom.translate();
    var scale = this.mapZoom.scale();
    return ([(projectedPosition[0] * scale) + translate[0], (projectedPosition[1] * scale) + translate[1]]);
};

var DataMapper = {};

DataMapper.addPathData = function (data) {
    if (typeof DataMapper.pathData === 'undefined')
        DataMapper.pathData = new Array();
    DataMapper.pathData.push(data);

    if (typeof DataMapper.regionToCoordinates === 'undefined')
        DataMapper.regionToCoordinates = {};

    DataMapper.regionToCoordinates[BaseMap.getRegionNameFromPathData(data)] = DataMapper.mapProjection.invert(DataMapper.mapPath.centroid(data));

};


DataMapper.clearPathData = function () {
    DataMapper.pathData = new Array();
    DataMapper.regionToCoordinates = {};
};

DataMapper.getCoordinates = function (region) {
    if (typeof DataMapper.regionToCoordinates !== 'undefined')
        return DataMapper.regionToCoordinates[region];
};

//draw a link between given given csv data row
DataMapper.drawFlowLink = function (lineData) {

    if (typeof MapContainer.groupFlowLinks === 'undefined')
        MapContainer.groupFlowLinks = MapContainer.groupMain.append("g").attr("id", "groupFlowLinks");

    var source = DataMapper.mapProjection(DataMapper.getCoordinates(lineData.Source));
    var destination = DataMapper.mapProjection(DataMapper.getCoordinates(lineData.Destination));
    var color = DataMapper.flowVolumeToColor(lineData.Volume);
    
    MapContainer.groupFlowLinks.append("line")
            .datum(lineData)
            .attr("x1", source[0])
            .attr("y1", source[1])
            .attr("x2", destination[0])
            .attr("y2", destination[1])
            .attr("stroke-width", 2)
            .attr("stroke", color)
            .style("vector-effect", "non-scaling-stroke");


};

// draw the point in a region by given region name
DataMapper.drawRegionPoint = function (regionName) {
    if (typeof MapContainer.groupRegionPoints === 'undefined')
        MapContainer.groupRegionPoints = MapContainer.groupMain.append("g").attr("id", "groupRegionPoints");

    var coordinates = DataMapper.mapProjection(DataMapper.getCoordinates(regionName));
    MapContainer.groupRegionPoints.append("circle")
            .attr("cx", coordinates[0])
            .attr("cy", coordinates[1])
            .attr("r", 2)
            .style("vector-effect", "non-scaling-stroke");
};


DataMapper.clearFlowLinks = function () {
    $('#groupFlowLinks line').remove();
};

DataMapper.clearRegionPoints = function () {
    $('#groupRegionPoints circle').remove();
};

DataMapper.regionListSource = new Array();
DataMapper.regionListDestination = new Array();
DataMapper.minFlowVolume = Number.MAX_VALUE;
DataMapper.maxFlowVolume = 0;

// dynamic color radiant mapping basd on volume
DataMapper.flowVolumeToColor = function (volume) {

    var flowVolume = parseInt(volume);
    var average = (DataMapper.minFlowVolume + DataMapper.maxFlowVolume) / 2;
    var R = 0;
    var G = 0;
    var B = 0;
    if (flowVolume <= average)
    {
        G = 255;
        R = 255 * ((flowVolume - DataMapper.minFlowVolume) / (average - DataMapper.minFlowVolume));
    }
    else
    {
        R = 255;
        G = 255 * (DataMapper.maxFlowVolume - flowVolume) / (DataMapper.maxFlowVolume - average);
    }
    var rgb = "rgb(" + Math.floor(R) + ", " + Math.floor(G) + ", " + B + ")";
    return rgb;
};


// decode the given csv data and create required data structures
DataMapper.decodeCSVData = function (csvData) {

    $.each(csvData, function (i, dataRow) {

        var tmpVolume = parseInt(dataRow.Volume);
        if (DataMapper.maxFlowVolume < tmpVolume)
            DataMapper.maxFlowVolume = tmpVolume;


        if (DataMapper.minFlowVolume > tmpVolume)
            DataMapper.minFlowVolume = tmpVolume;

        if ($.inArray(dataRow.Source, DataMapper.regionListSource) === -1)
            DataMapper.regionListSource.push(dataRow.Source);

        if ($.inArray(dataRow.Destination, DataMapper.regionListDestination) === -1)
            DataMapper.regionListDestination.push(dataRow.Destination);

    });
};
