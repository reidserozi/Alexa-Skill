'use strict';
var _ = require('lodash');
var rp = require('request-promise');
var OPENDATAENDPOINT = 'https://data.townofcary.org/api/records/1.0/search/?';
var COUNCILENDPOINT = 'https://maps.townofcary.org/arcgis1/rest/services/Elections/Elections/MapServer/identify?'
var GEOCODEENDPOINT  = 'http://maps.townofcary.org/arcgis/rest/services/Locators/Cary_Com_Locator/GeocodeServer/findAddressCandidates?'
function OpenDataHelper() { }

OpenDataHelper.prototype.requestCouncilInformationLatLong = function(x, y) {
  return this.getCouncilInformationLatLong(x, y).then(
    function(response) {
      return response.body;
    }, function (error) {
        console.log('error in the promise');
    }
  ).catch(console.log.bind(console));
};

OpenDataHelper.prototype.requestCouncilInformationAddress = function(address) {
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

OpenDataHelper.prototype.getAddressGeolocation = function(address) {
  var options = {
    method: 'GET',
    uri: GEOCODEENDPOINT + 'Street=' + address + '+St&City=&State=&ZIP=&SingleLine=&outFields=&maxLocations=&outSR=4326&searchExtent=&f=pjson',
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

OpenDataHelper.prototype.getCouncilInformationLatLong = function(x, y) {
  var options = {
    method: 'GET',
    uri: COUNCILENDPOINT + 'geometry=' + x + ',' + y + '&geometryType=esriGeometryPoint&sr=4326&layers=all&layerDefs=&time=&layerTimeOptions=&tolerance=2&mapExtent=-79.193%2C35.541%2C-78.63%2C35.989%09&imageDisplay=600%2C550%2C96&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&dynamicLayers=&returnZ=false&returnM=false&gdbVersion=&f=pjson',
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

OpenDataHelper.prototype.requestOpenGymTime = function(gym_date) {
  return this.getOpenGymTimes(gym_date).then(
    function(response) {
      return response.body;
    }, function (error) {
        console.log('error in the promise');
    }
  ).catch(console.log.bind(console));
};

OpenDataHelper.prototype.getOpenGymTimes = function(gym_date) {
  var options = {
    method: 'GET',
    uri: OPENDATAENDPOINT + 'dataset=open-gym&q=open_gym_start==' + gym_date + '&facet=facility_title&facet=pass_type&facet=community_center&facet=open_gym&facet=group&facet=date_scanned&timezone=UTC',
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

OpenDataHelper.prototype.formatGymTimes = function(gymTimes) {
  var times = '';
  gymTimes.records.forEach(function buildtemplate(item,index){
    var startTime = new Date(item.fields.open_gym_start);
    var endTime = new Date(item.fields.open_gym_end);
    times += _.template(' ${startTime} to ${endTime} at ${location} for ${sport}.')({
      startTime: formatTimeString(startTime),
      endTime: formatTimeString(endTime),
      location: item.fields.facility_title,
      sport: item.fields.open_gym
    });
  });
  if(gymTimes.records.length > 0) {
    var response = _.template('There are ${numTimes} open gym times on ${date}.${times}');
    return response({
      numTimes: gymTimes.records.length,
      date: gymTimes.records[0].fields.date_scanned,
      times: times
    });
  } else {
    var response = 'There are no open gym times for that date.';
    return response
  }
};

function formatTimeString(date) {
  if ((typeof(date)!=='object') || (date.constructor!==Date)) {
    throw new Error('argument must be a Date object');
  }
  function pad(s) { return ((''+s).length < 2 ? '0' : '') + s; }
  function fixHour(h) { return (h==0?'12':(h>12?h-12:h)); }
  var offset = new Date().getTimezoneOffset();
  if(date.getTimezoneOffset() == 0){
    //date.setMinutes(date.getMinutes() - 300);
  }
  var h=date.getHours(), m=date.getMinutes(), s=date.getSeconds()
    , timeStr=[pad(fixHour(h)), pad(m), pad(s)].join(':');
  return timeStr + ' ' + (h < 12 ? 'AM' : 'PM');
}

module.exports = OpenDataHelper;
