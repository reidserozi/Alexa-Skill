'use strict';
var _ = require('lodash');
var rp = require('request-promise');
var ENDPOINT = 'https://data.townofcary.org/api/records/1.0/search/?';
function OpenDataHelper() { }

OpenDataHelper.prototype.requestOpenGymTime = function(gym_date) {
  return this.getOpenGymTimes(gym_date).then(
    function(response) {
      return response.body;
    }
  );
};

OpenDataHelper.prototype.getOpenGymTimes = function(gym_date) {
  var options = {
    method: 'GET',
    uri: ENDPOINT + 'dataset=open-gym&q=open_gym_start==' + gym_date + '&facet=facility_title&facet=pass_type&facet=community_center&facet=open_gym&facet=group&facet=date_scanned',
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
  var h=date.getUTCHours(), m=date.getMinutes(), s=date.getSeconds()
    , timeStr=[pad(fixHour(h)), pad(m), pad(s)].join(':');
  return timeStr + ' ' + (h < 12 ? 'AM' : 'PM');
}

module.exports = OpenDataHelper;
