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

EsriDataHelper.prototype.getAddressGeolocation = function(address) {
  var options = {
    method: 'GET',
    uri: ESRIENDPOINT + 'Locators/Cary_Com_Locator/GeocodeServer/findAddressCandidates?Street=' + address + '+St&City=&State=&ZIP=&SingleLine=&outFields=&maxLocations=&outSR=4326&searchExtent=&f=pjson',
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

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

module.exports = EsriDataHelper;
