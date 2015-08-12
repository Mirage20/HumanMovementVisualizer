/* global QUnit */
/* global BaseMap, MapNavigator, DataMapper */

QUnit.test("BaseMap.getRegionNameFromPathData Test", function (assert) {
    var pathData = {};
    pathData.properties = {};
    pathData.properties.NAME_0 = "Sri Lanka";
    assert.ok(BaseMap.getRegionNameFromPathData(pathData) === "Sri Lanka", "Passed!");
    pathData.properties.NAME_1 = "Colombo";
    assert.ok(BaseMap.getRegionNameFromPathData(pathData) === "Colombo", "Passed!");
    pathData.properties.NAME_2 = "Moratuwa";
    assert.ok(BaseMap.getRegionNameFromPathData(pathData) === "Moratuwa", "Passed!");
});

QUnit.test("MapNavigator.getZoomTransition Test", function (assert) {

    var projectedPosition = [2, 5];
    MapNavigator.mapZoom = {};
    MapNavigator.mapZoom.translate = function ()
    {
        return [4, 1];
    };

    MapNavigator.mapZoom.scale = function ()
    {
        return 3.2;
    };

    assert.deepEqual(MapNavigator.getZoomTransition(projectedPosition), [10.4, 17], "Passed!");

});


QUnit.test("DataMapper.flowVolumeToColor Test", function (assert) {

    DataMapper.minFlowVolume = 0;
    DataMapper.maxFlowVolume = 100;
    assert.deepEqual(DataMapper.flowVolumeToColor(50), "#FFFF00", "Passed!");
    
    DataMapper.minFlowVolume = 0;
    DataMapper.maxFlowVolume = 150;
    assert.deepEqual(DataMapper.flowVolumeToColor(25), "#39B59C", "Passed!");
    
    DataMapper.minFlowVolume = 1600;
    DataMapper.maxFlowVolume = 3490;
    assert.deepEqual(DataMapper.flowVolumeToColor(2947), "#FFD608", "Passed!");
    
    DataMapper.minFlowVolume = 7374;
    DataMapper.maxFlowVolume = 25623;
    assert.deepEqual(DataMapper.flowVolumeToColor(12047), "#39B59C", "Passed!");

});

