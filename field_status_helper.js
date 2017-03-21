'use strict';
var _ = require('lodash');
var rp = require('request-promise');
var request = require('request');
require('./jsDate.js')();
require('datejs');
var FIELDSTATUSENDPOINT = 'http://games.townofcary.gov/'
var FIELDTYPES = ['ballfields/ballfields.txt', 'multipurposefields/multipurposefields.txt', 'gymnasiums/gymnasiums.txt', 'sk8-cary/sk8cary.txt', 'soccerpark/soccerpark.txt', 'tenniscenter/tenniscenter.txt', 'usabaseball/usabaseball.txt', 'culturalarts/culturalarts.txt'];

function FieldStatusHelper() { }

FieldStatusHelper.prototype.getAllFieldStatus = function(){
  var results = {};
  for(var i = 0; i < FIELDTYPES.length; i++){
      this.requestFieldStatus(FIELDSTATUSENDPOINT + FIELDTYPES[i]);
  }
}

FieldStatusHelper.prototype.requestFieldStatus = function(uri){
  var http = require('http');
  var options = {
    method: 'GET',
    uri: encodeURI(uri),
    resolveWithFullResponse: true,
    timeout: 3000
  };
  /*return rp(options);*/
  console.log('getting field info');
  http.get(options, function(response){
    console.log(response.statusCode);
    console.log(res.headers['content-type']);
    response.on('data', function(chunk){
      console.log(chunk);
    });
  });
  /*request.get(uri, function(error, response, body){
    console.log(response.status);
    console.log(body);
    console.log(err);
  });*/
}

module.exports = FieldStatusHelper;
/*
{
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
