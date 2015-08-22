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
        
        zoom: 8
    });

    //     var styles = [
    //         {
    //             stylers: [
    //                 {
    //                     hue: "#00ffe6"
    //                 },
    //                 {
    //                     saturation: -20
    //                 }
    //                            ]
    //                          }, {
    //             featureType: "road",
    //             elementType: "geometry",
    //             stylers: [
    //                 {
    //                     lightness: 100
    //                 },
    //                 {
    //                     visibility: "simplified"
    //                 }
    //                            ]
    //                          }, {
    //             featureType: "road",
    //             elementType: "labels",
    //             stylers: [
    //                 {
    //                     visibility: "off"
    //                 }
    //                            ]
    //                          }
    //                        ];
    //
    //     map.setOptions({
    //         styles: styles
    //     });
}