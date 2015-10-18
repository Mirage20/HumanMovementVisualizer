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
/* global MapNavigator, GoogleMapControl, ExecutionTimer */

$(document).ready(function () {

    //initialize display parameters
    MapContainer.width = $(window).width();
    MapContainer.height = $(window).height();

    //check whether the dynamic saved file or new file
    if (d3.select("#svgMap")[0][0] === null) {
        MapContainer.svgMain = d3.select("#mapContainer").append("svg").attr("id", "svgMap")
                .attr("width", MapContainer.width)
                .attr("height", MapContainer.height);
        MapContainer.groupMain = MapContainer.svgMain.append("g").attr("id", "groupMain");
    } else {
        MapContainer.svgMain = d3.select("#svgMap");
        MapContainer.groupMain = d3.select("#groupMain");
        $("#svgMap").attr("width", MapContainer.width);
        $("#svgMap").attr("height", MapContainer.height);
        MapContainer.groupBaseMap = d3.select("#groupBaseMap");
    }

    // set zooming behaviour
    MapNavigator.mapZoom = d3.behavior.zoom().scaleExtent([.1, 10]).on("zoom", function () {
        //console.log("translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");     
        MapContainer.groupMain.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        if ($("#chkEnableGPan").prop('checked') === true)
            GoogleMapControl.setTranslation(d3.event.translate);
        GoogleMapControl.oldTranslate = d3.event.translate;
    });

    // load event triggers
    MapContainer.svgMain.call(MapNavigator.mapZoom);
    $("#googleMapContainer").css("visibility", "hidden");
    $("#toolContainerGoogleMaps").hide();
    $("#dataHintContainer").hide();
    $("#btnTest").click();
});

// responsive size changing
$(window).resize(function () {
    MapContainer.width = $(window).width();
    MapContainer.height = $(window).height();
    $("#svgMap").attr("width", MapContainer.width);
    $("#svgMap").attr("height", MapContainer.height);
});

// handles the base map draw button click event
$("#btnDraw").click(function () {
    DataMapper.clearFlowLinks();
    DataMapper.clearRegionPoints();
    $("#groupBaseMap").remove();
    var baseMapIndex = parseInt($("#selectBaseMap").val());
    if (Number.isInteger(baseMapIndex))
    {
        //execute draw map function
        var baseMap = ContentManager.geoJSONMaps[baseMapIndex];
        ExecutionTimer.start();
        BaseMap.draw(baseMap);
        ExecutionTimer.stop("Basemap render time");
        GoogleMapControl.setPan(BaseMap.centroid);
        var convertedZoom = 8.025762957806712 - (6.164035415846804 * Math.exp(-0.0005881212588888687 * BaseMap.scale));
        GoogleMapControl.setZoom(convertedZoom);
        MapContainer.groupBaseMap.selectAll('path').on("mouseenter", function () {

            $("#dataHintText").html("Region : <i>" + BaseMap.getRegionNameFromPathData(d3.select(this).datum()) + "</i>");
            $("#dataHintContainer").show();
            if ($("#chkOverlay").prop('checked') === false)
                d3.select(this).style("fill", "white");
        });

        MapContainer.groupBaseMap.selectAll('path').on("mouseleave", function () {
            $("#dataHintContainer").hide();
            $("#dataHintText").html("");
            if ($("#chkOverlay").prop('checked') === false)
                d3.select(this).style("fill", BaseMap.regionFillColor);
        });
    }
    return false;
});


// handles the shape file load button click event
$("#btnLoad").click(function () {
    var file = $("#shapeFile")[0].files[0];
    $('#selectBaseMap').attr("disabled", true);
    ExecutionTimer.start();
    ContentManager.loadShapeFile(file, function (geoJSONMapArray) {
        ExecutionTimer.stop("Shapefile decode time");
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
    $("#selectFilterDataBy").val("allData");
    $("#selectFlowDirection").val("from");
    $('#selectTime option').remove();
    $('#selectRegion option').remove();
    $('#selectFilterDataBy').attr("disabled", true);
    $('#selectFlowDirection').attr("disabled", true);
    $('#selectRegion').attr("disabled", true);
    $('#selectTime').attr("disabled", true);

    // csv data pharsing and decoding
    ExecutionTimer.start();
    ContentManager.loadCSVFile(file, function (csvData) {
        DataMapper.decodeCSVData(csvData);
        ExecutionTimer.stop("CSV data decode time");
        DataMapper.drawLegend(function () {
            MapContainer.groupLegend.selectAll("rect").on("click", function () {
                var selectionID = $(this).attr("id");
                $("#input" + selectionID).val(DataMapper.LegenColors[selectionID]);
                $("#input" + selectionID).click();
                $("#input" + selectionID).change(function () {
                    $("#" + selectionID).css("fill", $("#input" + selectionID).val());
                    DataMapper.LegenColors[selectionID] = $("#input" + selectionID).val();
                });
            });
        });

        $('#selectFilterDataBy').removeAttr("disabled");

        // handles datetime based csv file
        if (DataMapper.dateTimeList[0] !== "") {

            $('#selectTime').append($('<option>', {value: "all", text: "All"}));
            $.each(DataMapper.dateTimeList, function (i, dateTime) {
                $('#selectTime').append($('<option>', {
                    value: dateTime,
                    text: dateTime
                }));

            });
            $('#selectTime').removeAttr("disabled");
        }

    });
    return false;
});

// handles the flow lines draw button click event
$("#btnShowFlows").click(function () {
    ExecutionTimer.start();
    DataMapper.clearFlowLinks();
    DataMapper.clearRegionPoints();
    var regions = new Array();
    var dataRows = new Array();

    $.each(ContentManager.csvData, function (i, dataRow) {

        // check filers and render flows based on the selected filters
        if ($("#selectFilterDataBy").val() === 'region')
        {
            if ($("#selectFlowDirection").val() === 'from')
            {
                if ($("#selectRegion").val() === dataRow.Source)
                {
                    dataRows.push(dataRow);
                }
            }
            else if ($("#selectFlowDirection").val() === 'to')
            {
                if ($("#selectRegion").val() === dataRow.Destination)
                {
                    dataRows.push(dataRow);
                }
            }

        }
        else
        {
            dataRows.push(dataRow);
        }

    });

    // handles the time filter input
    if ($("#selectTime").val() !== "all" && $("#selectTime option").length > 0) {
        dataRows = jQuery.grep(dataRows, function (dataRow, index) {
            return dataRow.Time === $("#selectTime").val();
        });
    }

    // build the array for filterd data rows
    $.each(dataRows, function (i, dataRow) {
        if ($("#chkWidthMapping").prop('checked'))
        {
            DataMapper.drawWidthFlowLink(dataRow);
        }
        else
        {
            DataMapper.drawFlowLink(dataRow);
        }

        if ($.inArray(dataRow.Source, regions) === -1)
            regions.push(dataRow.Source);
        if ($.inArray(dataRow.Destination, regions) === -1)
            regions.push(dataRow.Destination);
    });

    //draw the flows 
    $.each(regions, function (i, region) {
        DataMapper.drawRegionPoint(region);
    });

    // add event listners for data viewing
    if ($("#chkWidthMapping").prop('checked'))
    {
        MapContainer.groupFlowLinks.selectAll('line').on("mouseenter", function () {

            var lineData = d3.select(this).datum();
            $("#dataHintText").html("Volume From <i>" + lineData.Source + "</i> To <i>" + lineData.Destination + "</i> = <i>" + lineData.Volume + ((lineData.Time !== "") ? ("</i> at <i>" + lineData.Time + "</i>") : "</i>"));
            $("#dataHintContainer").show();
            d3.select(this).attr("stroke", "black");
        });

        MapContainer.groupFlowLinks.selectAll('line').on("mouseleave", function () {

            $("#dataHintContainer").hide();
            $("#dataHintText").html("");
            d3.select(this).attr("stroke", DataMapper.widthFlowLinkColor);
        });
    }
    else
    {

        MapContainer.groupFlowLinks.selectAll('line').on("mouseenter", function () {

            var lineData = d3.select(this).datum();
            $("#dataHintText").html("Volume From <i>" + lineData.Source + "</i> To <i>" + lineData.Destination + "</i> = <i>" + lineData.Volume + ((lineData.Time !== "") ? ("</i> at <i>" + lineData.Time + "</i>") : "</i>"));
            $("#dataHintContainer").show();
            d3.select(this).attr("stroke-width", parseInt(DataMapper.flowLineWidth) + 2);
        });

        MapContainer.groupFlowLinks.selectAll('line').on("mouseleave", function () {

            $("#dataHintContainer").hide();
            $("#dataHintText").html("");
            d3.select(this).attr("stroke-width", parseInt(DataMapper.flowLineWidth));
        });
    }
    //$('#slideFlowLineWidth').removeAttr("disabled");
    ExecutionTimer.stop("Visualization render time");
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

        MapContainer.groupBaseMap.selectAll('path').on("click", function () {
            $("#selectRegion").val(BaseMap.getRegionNameFromPathData(d3.select(this).datum()));
            $("#btnShowFlows").trigger("click");
        });


    }
    else
    {
        $('#selectFlowDirection').attr("disabled", true);
        $('#selectRegion').attr("disabled", true);
        MapContainer.groupBaseMap.selectAll('path').on('click', null);
        $("#btnShowFlows").trigger("click");
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



// test case for develper
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
    // convert svg data to an base64 encoded image string
    var imgsrc = 'data:image/svg+xml;base64,' + btoa(svgContent);

    d3.select("#staticImage").append("canvas")
            .attr('width', MapContainer.width)
            .attr('height', MapContainer.height)
            .attr("id", "tempCanvas");

    var canvas = document.querySelector("canvas");
    var context = canvas.getContext("2d");
    //save the image to a file
    var image = new Image;
    image.src = imgsrc;
    image.onload = function () {
        context.drawImage(image, 0, 0);

        var canvasdata = canvas.toDataURL("image/png");
        //create download link
        var anchorDownload = document.createElement("a");
        anchorDownload.download = "static_visualization.png";
        anchorDownload.href = canvasdata;
        anchorDownload.click();
    };
    $("#tempCanvas").remove();

    return false;

});

// handles the line width change slider
$("#slideFlowLineWidth").on("input", function () {

    DataMapper.flowLineWidth = $("#slideFlowLineWidth").val();
    $("#slideValueText").text(DataMapper.flowLineWidth);


    $.each($("#groupFlowLinks line"), function (i, line) {
        $(line).attr("stroke-width", DataMapper.flowLineWidth);
    });


});

// handles the enable line width mapping checkbox change
$("#chkWidthMapping").change(function () {

    $("#btnShowFlows").trigger("click");
    if ($("#chkWidthMapping").prop('checked'))
    {
        $("#slideFlowLineWidth").attr("disabled", true);
    }
    else
    {
        $("#slideFlowLineWidth").removeAttr("disabled");
    }


});

// handles the enable google map checkbox change
$("#chkGoogleMaps").change(function () {

    if ($("#googleMapContainer").css("visibility") === 'hidden')
    {
        $("#googleMapContainer").hide();
        $("#googleMapContainer").css("visibility", "");
    }
    if ($("#chkGoogleMaps").prop('checked'))
    {
        $("#googleMapContainer").show("clip", {}, 1000, null);
        $("#toolContainerGoogleMaps").show("blind", {}, 1000, null);
    }
    else
    {
        $("#googleMapContainer").hide("clip", {}, 1000, null);
        $("#toolContainerGoogleMaps").hide("blind", {}, 1000, null);
    }


});

// handles the enable overlay checkbox change
$("#chkOverlay").change(function () {


    if ($("#chkOverlay").prop('checked'))
    {
        // google map overlay change
        $("#svgMap").css("background-color", "transparent");
        BaseMap.regionFillColor = "rgba(243, 241, 237, 0.2)";
        BaseMap.regionStrokeWidth = "1px";
        BaseMap.regionStrokeColor = "rgb(0,0,0)";
        if (typeof MapContainer.groupBaseMap !== 'undefined')
        {
            MapContainer.groupBaseMap.selectAll('path').style("fill", BaseMap.regionFillColor);
            MapContainer.groupBaseMap.selectAll('path').style("stroke-width", BaseMap.regionStrokeWidth);
            MapContainer.groupBaseMap.selectAll('path').style("stroke", BaseMap.regionStrokeColor);
        }

    }
    else
    {
        $("#svgMap").css("background-color", "#BADDFF");
        BaseMap.regionFillColor = "#F3F1ED";
        BaseMap.regionStrokeWidth = "0.5px";
        BaseMap.regionStrokeColor = "rgb(128,128,128)";
        if (typeof MapContainer.groupBaseMap !== 'undefined')
        {
            MapContainer.groupBaseMap.selectAll('path').style("fill", BaseMap.regionFillColor);
            MapContainer.groupBaseMap.selectAll('path').style("stroke-width", BaseMap.regionStrokeWidth);
            MapContainer.groupBaseMap.selectAll('path').style("stroke", BaseMap.regionStrokeColor);
        }
    }


});

// handles the google map zoom change slider
$("#slideGMapZoom").on("input", function () {
    // set discreete zoom level on google maps based on use inputs
    $("#slideGZoomValueText").text($("#slideGMapZoom").val());
    GoogleMapControl.setZoom($("#slideGMapZoom").val());
});

// handles the tool box slider event
$("#toolSlde").click(function () {
    $("#toolSlde").hide();
    $("#toolContainer").toggle("slide", {direction: "right"}, 1000, function () {
        if ($("#toolContainer").css("display") === 'none')
        {
            $("#toolSlde").html("&#x276e;");
            $("#toolSlde").css("margin-left", "98%");
        }
        else
        {
            $("#toolSlde").html("&#x276f;");
            $("#toolSlde").css("margin-left", "-30px");
        }
        $("#toolSlde").show();
    });
});

$("#toolHelp").click(function () {
    window.open('help.html', '_blank');
});

$("#toolContainer").mouseenter(function () {
    $("#welcomeHeaing").hide("fade", {}, 2000, null);
    $('#toolContainer').off('mouseenter');
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

