/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global d3 */
/* global ContentManager */
/* global BaseMap */
/* global DataMapper */
/* global MapContainer */
/* global MapNavigator */

$(document).ready(function () {

    MapContainer.width = $(window).width();
    MapContainer.height = $(window).height();
    MapContainer.svgMain = d3.select("#mapContainer").append("svg").attr("id", "svgMap")
            .attr("width", MapContainer.width)
            .attr("height", MapContainer.height);
    MapContainer.groupMain = MapContainer.svgMain.append("g").attr("id", "groupMain");

    MapNavigator.mapZoom = d3.behavior.zoom().scaleExtent([.1, 10]).on("zoom", function () {
        //console.log("translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");     
        MapContainer.groupMain.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    });

    MapContainer.svgMain.call(MapNavigator.mapZoom);
    $("#btnTest").click();
});

$(window).resize(function () {
    MapContainer.width = $(window).width();
    MapContainer.height = $(window).height();
    $("#svgMap").attr("width", MapContainer.width);
    $("#svgMap").attr("height", MapContainer.height);
});

// handles the base map draw button click event
$("#btnDraw").click(function () {
    $("#groupBaseMap").remove();
    var baseMapIndex = parseInt($("#selectBaseMap").val());
    if (Number.isInteger(baseMapIndex))
    {
        var baseMap = ContentManager.geoJSONMaps[baseMapIndex];
        BaseMap.draw(baseMap);

        MapContainer.groupBaseMap.selectAll('path').on("mouseenter", function () {

            $("#dataHintText").text("Region : " + BaseMap.getRegionNameFromPathData(d3.select(this).datum()));
            d3.select(this).style("fill", "white");
        });

        MapContainer.groupBaseMap.selectAll('path').on("mouseleave", function () {
            $("#dataHintText").text("");
            d3.select(this).style("fill", "#F3F1ED");
        });
    }
    return false;
});


// handles the shape file load button click event
$("#btnLoad").click(function () {
    var file = $("#shapeFile")[0].files[0];
    $('#selectBaseMap').attr("disabled", true);
    ContentManager.loadShapeFile(file, function (geoJSONMapArray) {
        $('#selectBaseMap option').remove();
        $.each(geoJSONMapArray, function (i, geoJSONMap) {
            $('#selectBaseMap').append($('<option>', {
                value: i,
                text: geoJSONMap.fileName
            }));
        });
    });
    $('#selectBaseMap').removeAttr("disabled");
    return false;
});

// handles the csv data file load button click event
$("#btnLoadCSV").click(function () {
    var file = $("#csvFile")[0].files[0];
    $('#selectFilterDataBy').attr("disabled", true);
    ContentManager.loadCSVFile(file, function (csvData) {      
        DataMapper.decodeCSVData(csvData);
        DataMapper.drawLegend(function(){
            MapContainer.groupLegend.selectAll("rect").on("click",function(){
                var selectionID = $(this).attr("id");
                $("#input" + selectionID).val(DataMapper.LegenColors[selectionID]);
                $("#input" + selectionID).click();
                $("#input" + selectionID).change(function (){
                    $("#" + selectionID).css("fill",$("#input" + selectionID).val());
                    DataMapper.LegenColors[selectionID] = $("#input" + selectionID).val();                 
                });               
            });
        });
    });
    $('#selectFilterDataBy').removeAttr("disabled");
    return false;
});

// handles the flow lines draw button click event
$("#btnShowFlows").click(function () {
    DataMapper.clearFlowLinks();
    DataMapper.clearRegionPoints();
    var regions = new Array();
    $.each(ContentManager.csvData, function (i, dataRow) {

        if ($("#selectFilterDataBy").val() === 'region')
        {
            if ($("#selectFlowDirection").val() === 'from')
            {
                if ($("#selectRegion").val() === dataRow.Source)
                {
                    DataMapper.drawFlowLink(dataRow);
                    if ($.inArray(dataRow.Source, regions) === -1)
                        regions.push(dataRow.Source);
                    if ($.inArray(dataRow.Destination, regions) === -1)
                        regions.push(dataRow.Destination);
                }
            }
            else if ($("#selectFlowDirection").val() === 'to')
            {
                if ($("#selectRegion").val() === dataRow.Destination)
                {
                    DataMapper.drawFlowLink(dataRow);
                    if ($.inArray(dataRow.Source, regions) === -1)
                        regions.push(dataRow.Source);
                    if ($.inArray(dataRow.Destination, regions) === -1)
                        regions.push(dataRow.Destination);
                }
            }

        }
        else
        {
            DataMapper.drawFlowLink(dataRow);
            if ($.inArray(dataRow.Source, regions) === -1)
                regions.push(dataRow.Source);
            if ($.inArray(dataRow.Destination, regions) === -1)
                regions.push(dataRow.Destination);
        }

    });


    $.each(regions, function (i, region) {
        DataMapper.drawRegionPoint(region);
    });

    MapContainer.groupFlowLinks.selectAll('line').on("mouseenter", function () {

        var lineData = d3.select(this).datum();
        $("#dataHintText").text("Volume From " + lineData.Source + " To " + lineData.Destination + " = " + lineData.Volume);
        d3.select(this).style("stroke-width", 10);
    });

    MapContainer.groupFlowLinks.selectAll('line').on("mouseleave", function () {

        $("#dataHintText").text("");
        d3.select(this).style("stroke-width", 2);
    });
    return false;
});

// handles the data filter list change event
$("#selectFilterDataBy").change(function () {

    if ($("#selectFilterDataBy").val() === 'region')
    {
        $('#selectFlowDirection').removeAttr("disabled");
        $('#selectRegion').removeAttr("disabled");
        if ($("#selectRegion option").length === 0)
            $("#selectFlowDirection").change();
    }
    else
    {
        $('#selectFlowDirection').attr("disabled", true);
        $('#selectRegion').attr("disabled", true);
    }

});

// handles the flow ditection list change event
$("#selectFlowDirection").change(function () {

    if ($("#selectFlowDirection").val() === 'from')
    {
        $('#selectRegion option').remove();
        $.each(DataMapper.regionListSource, function (i, fromRegion) {
            $('#selectRegion').append($('<option>', {
                value: fromRegion,
                text: fromRegion
            }));
        });
    }
    else if ($("#selectFlowDirection").val() === 'to')
    {
        $('#selectRegion option').remove();
        $.each(DataMapper.regionListDestination, function (i, toRegion) {
            $('#selectRegion').append($('<option>', {
                value: toRegion,
                text: toRegion
            }));
        });
    }
    else
        $('#selectRegion option').remove();

});




$("#btnPin").click(function () {
    var long = $("#long").val();
    var lati = $("#lati").val();

    var place = (DataMapper.mapProjection([long, lati]));
    $("#pin").remove();
    MapContainer.groupMain.append("circle")
            .attr("cx", place[0])
            .attr("cy", place[1])
            .attr("r", 2)
            .attr("id", "pin");
    return false;

});


// handles the flow region color enable button click event
$("#btnSaveStatic").click(function () {

    var svgContent = MapContainer.svgMain
            .attr("version", 1.1)
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .node().parentNode.innerHTML;

    var imgsrc = 'data:image/svg+xml;base64,' + btoa(svgContent);

    d3.select("#staticImage").append("canvas")
            .attr('width', MapContainer.width)
            .attr('height', MapContainer.height)
            .attr("id", "tempCanvas");

    var canvas = document.querySelector("canvas");
    var context = canvas.getContext("2d");

    var image = new Image;
    image.src = imgsrc;
    image.onload = function () {
        context.drawImage(image, 0, 0);

        var canvasdata = canvas.toDataURL("image/png");

        var anchorDownload = document.createElement("a");
        anchorDownload.download = "static_visualization.png";
        anchorDownload.href = canvasdata;
        anchorDownload.click();
    };
    $("#tempCanvas").remove();

    return false;

});

$("#btnTest").click(function () {

//    var t = mapProjection([80.213954, 9.835223]);
//    var trans = mapZoom.translate();
//    var sc = mapZoom.scale();
//    $("#cc").remove();
//    svgMap.append("circle")
//            .attr("cx", t[0] + trans[0])
//            .attr("cy", t[1] + trans[1])
//            .attr("r", 2)
//            .attr("id", "cc");

//    var groupLabels = MapContainer.groupMain.append("g").attr("id", "groupBaseMapLabels");
//    d3.selectAll("#groupBaseMap path").each(function (d, i) {
//
//        console.log(d.properties.NAME_1);
//        
//        var centroid = (DataMapper.mapPath.centroid(d));
//        //console.log('Centroid at: ' + centroid[0] + ', ' + centroid[1]);
////        groupLabels.append("text").text(d.properties.NAME_1)
////                .attr("x", centroid[0])
////                .attr("y", centroid[1])
////                .attr("transform", "scale(1)")
////                .style({"font-size": "9px"});
//        
//        groupLabels.append("circle")
//            .attr("cx", centroid[0])
//            .attr("cy", centroid[1])
//            .attr("r", 2);
//        
//    });


//    $.get("https://maps.googleapis.com/maps/api/geocode/json",
//            {
//                address: "Kandy"
//            },
//    function (data, status) {
//        console.log("Data: " + data + "\nStatus: " + status);
//        console.log(data.results[0].geometry.location);
//    });


//    MapContainer.groupFlowLinks.selectAll('line').on("click", function () {
//
//        console.log(this);
//        console.log(d3.select(this).datum());
//        d3.select(this).style({fill: 'green'});
//    });

//    var html = MapContainer.svgMain
//            .attr("version", 1.1)
//            .attr("xmlns", "http://www.w3.org/2000/svg")
//            .node().parentNode.innerHTML;
//
//    //console.log(html);
//    var imgsrc = 'data:image/svg+xml;base64,' + btoa(html);
//    
//    d3.select("#staticImage").append("canvas")
//            .attr('width',MapContainer.width)
//            .attr('height',MapContainer.height)
//            .attr("id","tempCanvas");
//
//    var canvas = document.querySelector("canvas"),
//            context = canvas.getContext("2d");
//
//    var image = new Image;
//    image.src = imgsrc;
//    image.onload = function () {
//        context.drawImage(image, 0, 0);
//
//        var canvasdata = canvas.toDataURL("image/png");
//
//        var anchorDownload = document.createElement("a");
//        anchorDownload.download = "static_visualization.png";
//        anchorDownload.href = canvasdata;
//        anchorDownload.click();
//    };
//    $("#tempCanvas").remove();

 
    return false;
});

