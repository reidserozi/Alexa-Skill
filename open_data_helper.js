'use strict';
var _ = require('lodash');
var rp = require('request-promise');
var HelperClass = require('./helper_functions.js');

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
    json: true,
    timeout: 3000
  };
  return rp(options);
};

OpenDataHelper.prototype.formatGymTimes = function(gymTimes) {
  var times = '';
  var helperClass = new HelperClass();
  gymTimes.records.forEach(function buildtemplate(item,index){
    var startTime = new Date(item.fields.open_gym_start);
    var endTime = new Date(item.fields.open_gym_end);
    times += _.template(' ${startTime} to ${endTime} at ${location} for ${sport}.')({
      startTime: helperClass.formatTimeString(startTime),
      endTime: helperClass.formatTimeString(endTime),
      location: helperClass.FIELDNAMEPAIRINGS[item.fields.facility_title.toUpperCase()],
      sport: item.fields.open_gym
    });
  });
  if(gymTimes.records.length > 0) {
    var response = _.template('There are ${numTimes} open gym times on ${date}.${times}');
    return response({
      numTimes: gymTimes.records.length,
      date: helperClass.formatDate(Date.parse(gymTimes.records[0].fields.date_scanned)),
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
  var mayor = '';
  cityInfo.records.forEach(function(item){
    response += _.template('The council member for district ${district}, is ${member}. ')({
      district: item.fields.name,
      member: item.fields.repname
    });
    mayor = item.fields.mayor;
  });
  var atLarge = [];
  cityInfo.facet_groups[0].facets.forEach(function(item){
    atLarge.push(item.name);
  });
  if (atLarge.size == 0 ){
    throw new Error('No at large representatives returned');
  } else {
    response += _.template('The at large representatives are ${rep1}, and ${rep2} and the mayor is ${mayor}.')({
      rep1: atLarge[0],
      rep2: atLarge[1],
      mayor: mayor
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
    response += _.template('Your at large representatives are ${rep1}, ${rep2}, and ${mayor} is the mayor.')({
      rep1: atLarge[0],
      rep2: atLarge[1],
      mayor: cityInfo.records[0].fields.mayor
    });
  }
  if (response == '') {
    throw new Error('No fields in results');
  } else {
    return response;
  }
};


module.exports = OpenDataHelper;
