/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



/* global google */

var googleMap;

function initMap() {
    googleMap = new google.maps.Map(document.getElementById('googleMapContainer'), {
        center: {
            lat: 7.62960744686815,
            lng: 80.7009801565226
        },
        zoom: 8,
        disableDefaultUI: true
    });

//    var styles = [
//        {
//            stylers: [
//                {
//                    hue: "#00ffe6"
//                },
//                {
//                    saturation: -20
//                }
//            ]
//        }
//    ];

//    googleMap.setOptions({
//        styles: styles
//    });
}

var GoogleMapControl = {};

GoogleMapControl.setZoom = function (zoomLevel)
{
    googleMap.setZoom(Math.floor(zoomLevel));
};

GoogleMapControl.oldTranslate = [0, 0];

GoogleMapControl.setTranslation = function (newTranslate)
{
    googleMap.panBy(GoogleMapControl.oldTranslate[0] - newTranslate[0], GoogleMapControl.oldTranslate[1] - newTranslate[1]);
};

GoogleMapControl.setPan = function(centroid){
    googleMap.panTo(new google.maps.LatLng(centroid[1], centroid[0]));
};