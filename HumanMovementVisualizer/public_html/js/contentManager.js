/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global shp */
/* global d3 */

var ContentManager = {};

// loads the shape file form the given path
ContentManager.loadShapeFile = function (file,callback){
    
    var reader = new FileReader();
    reader.onload = function () {
        shp(reader.result).then(function (json) { 
            var tmpGeoJSONMapArray;
            if(Array.isArray(json))
                tmpGeoJSONMapArray = json;
            else
            {
                tmpGeoJSONMapArray = new Array();
                tmpGeoJSONMapArray.push(json);
            }
            ContentManager.geoJSONMaps = tmpGeoJSONMapArray; 
            callback(ContentManager.geoJSONMaps);        
        });
    };
    reader.readAsArrayBuffer(file);
};

// loads the csv data file form the given path
ContentManager.loadCSVFile = function (file,callback){
    
    var reader = new FileReader();
    reader.onload = function () {      
        ContentManager.csvData= d3.csv.parse(reader.result);
        callback(ContentManager.csvData);      
    };
    reader.readAsText(file);
};
