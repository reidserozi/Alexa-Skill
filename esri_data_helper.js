'use strict';
var _ = require('lodash');
var rp = require('request-promise');
require('./jsDate.js')();
require('datejs');
var ESRIENDPOINT = 'https://maps.townofcary.org/arcgis1/rest/services/';
var EARTHRADUIS = 3959;
var RECYCLEYELLOWSTART = '2017-01-01';
var RECYCLEBLUESTART = '2017-01-08';
var DAYS = {
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday'
}
function EsriDataHelper() { }

EsriDataHelper.prototype.requestAddressInformation = function(address) {
  var self = this;
  return this.getAddressGeolocation(address).then(
    function(response) {
      return response.body;
    }, function (error) {
        console.log('error in the promise');
    }
  ).catch(console.log.bind(console));
}

EsriDataHelper.prototype.getAddressGeolocation = function(address) {
  var uri = ESRIENDPOINT + 'Locators/Cary_Com_Locator/GeocodeServer/findAddressCandidates?Street=' + address + '+St&City=&State=&ZIP=&SingleLine=&outFields=&maxLocations=&outSR=4326&searchExtent=&f=pjson';
  var options = {
    method: 'GET',
    uri: encodeURI(uri),
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

EsriDataHelper.prototype.requestInformationLatLong = function(uri) {
  return this.getInformationLatLong(uri).then(
    function(response) {
      return response.body;
    }, function (error) {
        console.log('error in the promise');
    }
  ).catch(console.log.bind(console));
};

EsriDataHelper.prototype.getInformationLatLong = function(uri) {
  var options = {
    method: 'GET',
    uri: encodeURI(uri),
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

EsriDataHelper.prototype.requestTrashDay = function(uri) {
  return this.getInformationLatLong(uri).then(
    function(response) {
      return response.body;
    }, function (error) {
        console.log('error in the promise');
    }
  ).catch(console.log.bind(console));
};

EsriDataHelper.prototype.getTrashDay = function(uri) {
  var options = {
    method: 'GET',
    uri: encodeURI(uri),
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

EsriDataHelper.prototype.requestInformationByRadius = function(x, y, distance) {
  return this.getInformationByRadius(x, y, distance).then(
    function(response) {
      return response.body;
    }, function (error) {
        console.log('error in the promise');
    }
  ).catch(console.log.bind(console));
};

EsriDataHelper.prototype.getInformationByRadius = function(x, y, distance) {
  //radius of earth is 3959 miles
  var radius = distance / EARTHRADUIS;
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
};

EsriDataHelper.prototype.formatNearbyPublicArt = function(artInfo) {
  var prompt = '';
  var numArt = artInfo.features.length;
  artInfo.features.forEach(function(item){
    if(item.attributes["Address"] != null){
      prompt += _.template('${artName} located at ${address}, ')({
        artName: item.attributes["Name"],
        address: item.attributes["Address"]
      });
    } else {
      numArt  = numArt - 1;
    }
  });
  prompt = _.template('There are ${num} pieces of public art nearby including ')({
    num: numArt
  }) + prompt;
  return prompt;
};

EsriDataHelper.prototype.formatMyTrashDay = function(trashInfo) {
  var trashDay =  DAYS[trashInfo.features[0].attributes.Day.toUpperCase()];
  var cycle = trashInfo.features[0].attributes.Cycle.toUpperCase();
  var nextTrash;
  //If trash day equals today
  if(Date.parse(trashDay).equals(Date.today())){
    nextTrash = formatDate(Date.parse(Date.today()));
  } else {
    nextTrash = formatDate(Date.parse('next ' + trashDay));
  }
  var nextRecycle = getRecycleDay(cycle, trashDay);
  var prompt = _.template('Your next trash day is ${nextTrash} and your next recycle date is ${nextRecycle}')({
    nextTrash: nextTrash,
    nextRecycle: nextRecycle
  })
  return prompt;
}

function getRecycleDay(cycle, trashDay){
  var diff;
  if(cycle == 'BLUE'){
    diff = Date.DateDiff('d', RECYCLEBLUESTART, Date.today()) % 14;
  } else {
    diff = Date.DateDiff('d', RECYCLEYELLOWSTART, Date.today()) % 14;
  }
  console.log(diff);
  console.log(Date.parse(trashDay).compareTo(Date.today()));
  if(diff < 7 && Date.parse(trashDay).compareTo(Date.today()) == 0){
    return formatDate(Date.parse(Date.today()));
  } else if((diff < 7 && (Date.parse(trashDay).compareTo(Date.today()) <= -1) || (diff >= 7 && Date.parse(trashDay).compareTo(Date.today()) >= 1))){
    return formatDate(Date.parse('next ' + trashDay).next().week());
  } else{
    return formatDate(Date.parse('next ' + trashDay));
  }
}

function formatDate(date){
  return date.toString().slice(0,date.toString().indexOf('00:') - 1);
}

function getCircleCoords(x,y,d){
  var tao = 2 * Math.PI;
  var results = [];
  var pointsInCircle = 8
  //convert lat and long to radians
  x = x * (Math.PI / 180);
  y = y * (Math.PI / 180);
  for(var i = 0;i <= pointsInCircle; i ++){
    var lat = Math.asin(Math.sin(y) * Math.cos(d) + Math.cos(y) * Math.sin(d) * Math.cos((i/pointsInCircle)*tao));
    var long = ((x + Math.asin(Math.sin((i/pointsInCircle)*tao) * Math.sin(d) / Math.cos(lat)) + Math.PI) % (tao)) - Math.PI;
    results.push("[" + (long / (Math.PI/180)).toString() + "," + (lat / (Math.PI/180)).toString() + "]");
  }
  return results;
}

module.exports = EsriDataHelper;
