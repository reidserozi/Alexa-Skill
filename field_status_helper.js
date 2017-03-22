'use strict';
var _ = require('lodash');
var rp = require('request-promise');
var HelperClass = require('./helper_functions.js');
var promise = require('bluebird');
require('./jsDate.js')();
require('datejs');
var FIELDSTATUSENDPOINT = 'http://games.townofcarync.gov';
var FIELDTYPES = ['/ballfields/ballfields.txt', '/multipurposefields/multipurposefields.txt', '/gymnasiums/gymnasiums.txt', '/sk8-cary/sk8cary.txt', '/soccerpark/soccerpark.txt', '/tenniscenter/tenniscenter.txt', '/usabaseball/usabaseball.txt', '/culturalarts/culturalarts.txt'];

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
