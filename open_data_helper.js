'use strict';
var _ = require('lodash');
var rp = require('request-promise');

function OpenDataHelper() { }

OpenDataHelper.prototype.requestOpenData = function(uri) {
  return this.getOpenData(uri).then(
    function(response) {
      return response.body;
    }, function (error) {
        console.log('error in the promise');
    }
  ).catch(console.log.bind(console));
};

OpenDataHelper.prototype.getOpenData = function(uri) {
  var options = {
    method: 'GET',
    uri: encodeURI(uri),
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

OpenDataHelper.prototype.formatMayor = function(cityInfo) {
  var response = '';
  cityInfo.records.forEach(function(item){
    response = _.template('The mayor of Cary is ${mayor}.')({
      mayor: item.fields.mayor
    });
  });
  if (response == '') {
    throw new Error('No fields in results');
  } else {
    return response;
  }
};

OpenDataHelper.prototype.formatAllCouncilMembers = function(cityInfo) {
  var response = '';
  cityInfo.records.forEach(function(item){
    response += _.template('The council member for district ${district}, is ${member}. ')({
      district: item.fields.name,
      member: item.fields.repname
    });
  });
  var atLarge = [];
  cityInfo.facet_groups[0].facets.forEach(function(item){
    atLarge.push(item.name);
  });
  if (atLarge.size == 0 ){
    throw new Error('No at large representatives returned');
  } else {
    response += _.template('The at large representatives are ${rep1}, and ${rep2}.')({
      rep1: atLarge[0],
      rep2: atLarge[1]
    });
  }
  if (response == '') {
    throw new Error('No fields in results');
  } else {
    return response;
  }
};

OpenDataHelper.prototype.formatAtLargeCouncilMembers = function(cityInfo) {
  var response = '';
  var atLarge = [];
  cityInfo.facet_groups[0].facets.forEach(function(item){
    atLarge.push(item.name);
  });
  if (atLarge.size == 0 ){
    throw new Error('No at large representatives returned');
  } else {
    response += _.template('Your at large representatives are ${rep1}, and ${rep2}.')({
      rep1: atLarge[0],
      rep2: atLarge[1]
    });
  }
  if (response == '') {
    throw new Error('No fields in results');
  } else {
    return response;
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
