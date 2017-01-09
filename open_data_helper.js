'use strict';
var _ = require('lodash');
var rp = require('request-promise');
var ENDPOINT = 'https://data.townofcary.org/api/records/1.0/search/?';
function OpenDataHelper() { }

OpenDataHelper.prototype.requestOpenGymTime = function(gym_date) {
  return this.getOpenGymTimes(gym_date).then(
    function(response) {
      console.log('success - received gym dates ' + gym_date);
      console.log(response.body);
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
  console.log(options);
  return rp(options);
};

OpenDataHelper.prototype.formatGymTimes = function(gymTimes) {
  var times = '';
  gymTimes.records.forEach(function buildtemplate(item,index){
    times += _.template(' ${startTime} to ${endTime} at ${location} for ${sport}.')({
      startTime: item.fields.open_gym_start.substring(11,19),
      endTime: item.fields.open_gym_end.substring(11,19),
      location: item.fields.facility_title,
      sport: item.fields.open_gym
    });
  });
  if gymTimes.records.length > 0 then
    var response = _.template('There are ${numTimes} open gym times today.${times}');
    return response({
      numTimes: gymTimes.records.length,
      times: times
    });
  }
};

module.exports = OpenDataHelper;
