'use strict';
var _ = require('lodash');
var rp = require('request-promise');
var HelperClass = require('./helper_functions.js');
var promise = require('bluebird');
require('./jsDate.js')();
require('datejs');
var FIELDSTATUSENDPOINT = 'http://games.townofcarync.gov';
var FIELDTYPES = ['/ballfields/ballfields.txt', '/multipurposefields/multipurposefields.txt', '/gymnasiums/gymnasiums.txt', '/soccerpark/soccerpark.txt', '/usabaseball/usabaseball.txt'];

function FieldStatusHelper() { }

FieldStatusHelper.prototype.getAllFieldStatus = function(){
  var results = {};
  return this.promiseLoop(results, 1).then(function(response){
    console.log('results are:');
    console.log(response);
    return response
  });
}

FieldStatusHelper.prototype.requestFieldStatus = function(uri){
  var options = {
    method: 'GET',
    uri: encodeURI(uri),
    resolveWithFullResponse: true,
    timeout: 3000
  };
  return rp(options);
}

FieldStatusHelper.prototype.promiseLoop = function(results, i){
  var helperClass = new HelperClass();
  var self = this;
  return this.requestFieldStatus(FIELDSTATUSENDPOINT + FIELDTYPES[i]).then(function(response){
      return helperClass.addFieldResults(response.body, results);
  }).then(function(response){
    results = response;
    return counter(i);
  }).then(function(response){
    return (response >= FIELDTYPES.length) ? results : self.promiseLoop(results, response)
  });
}

FieldStatusHelper.prototype.formatFieldStatus = function(fieldStatus, parkQuery){
  var prompt;
  if(fieldStatus[parkQuery].closed.length <= 0){
      prompt = _.template('All fields at ${park} are currently open')({
        park: parkQuery
      });
  } else {
    if(fieldStatus[parkQuery].open.length <= 0){
      prompt = _.template('All fields at ${park} are currently closed')({
        park: parkQuery
      });
    } else {
      var closedFields = '';
      fieldStatus[parkQuery].closed.forEach(function(element){
        closedFields += element + ", ";
      });
      prompt = _.template('At ${park}, the following list of facilities are closed. ${fields}')({
        park: parkQuery,
        fields: closedFields
      });
    }
  }
  return prompt;
}

var counter = promise.method(function(i){
    return i++;
});

module.exports = FieldStatusHelper;
/*
{
  'park name':{
    'open': [
      { 'field name': 'field status' },
      { 'field name': 'field status' },
      { 'field name': 'field status' },
      ...
      { 'field name': 'field status' }
    ],
    'closed': [
    { 'field name': 'field status' },
    { 'field name': 'field status' },
    { 'field name': 'field status' },
    ...
    { 'field name': 'field status' }
    ]
  },
  'park name':{
    'all_same_status': true or false,
    'field_stats': [
      { 'field name': 'field status' },
      { 'field name': 'field status' },
      { 'field name': 'field status' },
      ...
      { 'field name': 'field status' }
    ]
  },
    ...
    'park name':{
      'all_same_status': true or false,
      'field_stats': [
        { 'field name': 'field status' },
        { 'field name': 'field status' },
        { 'field name': 'field status' },
        ...
        { 'field name': 'field status' }
      ]
    }
}
*/
