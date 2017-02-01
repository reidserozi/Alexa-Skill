'use strict';
var _ = require('lodash');
var rp = require('request-promise');
var ESRIENDPOINT = 'https://maps.townofcary.org/arcgis1/rest/services/'
function EsriDataHelper() { }

EsriDataHelper.prototype.requestCouncilInformationLatLong = function(x, y) {
  return this.getCouncilInformationLatLong(x, y).then(
    function(response) {
      return response.body;
    }, function (error) {
        console.log('error in the promise');
    }
  ).catch(console.log.bind(console));
};

EsriDataHelper.prototype.requestCouncilInformationAddress = function(address) {
  var self = this;
  return this.getAddressGeolocation(address).then(
    function(locObj) {
        return self.getCouncilInformationLatLong(locObj.body.candidates[0].location.x, locObj.body.candidates[0].location.y).then(
          function(response) {
            return response.body;
          }, function (error) {
              console.log('error in the promise');
          }
        ).catch(console.log.bind(console));
    }
  ).catch(console.log.bind(console));
}

EsriDataHelper.prototype.getCouncilInformationLatLong = function(x, y) {
  var options = {
    method: 'GET',
    uri: ESRIENDPOINT + 'Elections/Elections/MapServer/identify?geometry=' + x + ',' + y + '&geometryType=esriGeometryPoint&sr=4326&layers=all&layerDefs=&time=&layerTimeOptions=&tolerance=2&mapExtent=-79.193%2C35.541%2C-78.63%2C35.989&imageDisplay=600+550+96&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&dynamicLayers=&returnZ=false&returnM=false&gdbVersion=&f=pjson',
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

EsriDataHelper.prototype.formatMyCouncilMember = function(councilInfo) {
  var prompt = '';
  councilInfo.results.forEach(function(item){
    if (typeof item.attributes["Council Distict"] != 'undefined'){
      prompt = _.template('You belong to District ${district}, and your Council Member is ${member}. Your at large council members are ${atLarge1}, and ${atLarge2}.')({
        district: item.attributes["Council Distict"],
        member: item.attributes["Representative Name"],
        atLarge1: item.attributes["At Large Representative 1"],
        atLarge2: item.attributes["At Large Representative 2"]
      });
    }
  });
  return prompt;
}

EsriDataHelper.prototype.requestParkInformationLatLong = function(x, y) {
  return this.getParkInformationLatLong(x, y).then(
    function(response) {
      return response.body;
    }, function (error) {
        console.log('error in the promise');
    }
  ).catch(console.log.bind(console));
};

EsriDataHelper.prototype.requestParkInformationAddress = function(address) {
  var self = this;
  return this.getAddressGeolocation(address).then(
    function(locObj) {
        return self.getParkInformationLatLong(locObj.body.candidates[0].location.x, locObj.body.candidates[0].location.y).then(
          function(response) {
            return response.body;
          }, function (error) {
              console.log('error in the promise');
          }
        ).catch(console.log.bind(console));
    }
  ).catch(console.log.bind(console));
}

EsriDataHelper.prototype.getParkInformationLatLong = function(x, y) {
  var distance = 1;
  //distance is 1 mile and radius in radians is 1 mile divided by radius of earth
  var radius = distance / 3959;
  var coords = getCircleCoords(x,y,radius);
  var uri = ESRIENDPOINT + 'ParksRec/Parks/FeatureServer/0/query?where=&objectIds=&time=&geometry={"rings":[[' + coords + ']]}&geometryType=esriGeometryPolygon&inSR=4326&spatialRel=esriSpatialRelContains&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=4326&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&f=pjson'
  var options = {
    method: 'GET',
    uri: encodeURI(uri),
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

EsriDataHelper.prototype.formatNearbyParks = function(parkInfo) {
  var prompt = 'There are ' + parkInfo.features.length + ' parks nearby including ';
  parkInfo.features.forEach(function(item){
    prompt += _.template('${parkName} located at ${address}, ')({
      parkName: item.attributes["NAME"],
      address: item.attributes["FULLADDR"]
    });
  });
  return prompt;
}

EsriDataHelper.prototype.getAddressGeolocation = function(address) {
  var options = {
    method: 'GET',
    uri: ESRIENDPOINT + 'Locators/Cary_Com_Locator/GeocodeServer/findAddressCandidates?Street=' + address + '+St&City=&State=&ZIP=&SingleLine=&outFields=&maxLocations=&outSR=4326&searchExtent=&f=pjson',
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

function getCircleCoords(x,y,d){
  var tao = 2 * Math.PI;
  var results = [];
  //convert lat and long to radians
  x = x * (Math.PI / 180);
  y = y * (Math.PI / 180)
  for(var i = 0;i <= 8; i ++){
    var lat = Math.asin(Math.sin(y) * Math.cos(d) + Math.cos(y) * Math.sin(d) * Math.cos((i/8)*tao));
    var long = ((x + Math.asin(Math.sin((i/8)*tao) * Math.sin(d) / Math.cos(lat)) + Math.PI) % (tao)) - Math.PI;
    results.push("[" + (long / (Math.PI/180)).toString() + "," + (lat / (Math.PI/180)).toString() + "]");
  }
  return results;
}

module.exports = EsriDataHelper;
