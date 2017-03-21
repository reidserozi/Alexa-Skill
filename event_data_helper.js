'use strict';
var _ = require('lodash');
var rp = require('request-promise');
var request = require('request');
require('./jsDate.js')();
require('datejs');

var sampleReturn =
  {
    "PagingList":{
      "TotalResults":4,
      "HasNext":false,
      "Content":[
        {
          "ID":229,
          "Title":"Cary Ballet presents Spring Mixed Repertoire",
          "StartDate":"2017-03-25T19:00:00",
          "EndDate":"2017-03-25T23:59:00",
          "DisplayLinkToDocumentViewer":false,
          "AllowNotification":false,
          "Content":"stuff about the event",
          "RedirectTarget":"_self",
          "State":"",
          "ThumbnailImage":"",
          "AllowRegistration":false
        }
      ]
    }
  }


function EventDataHelper() { }
// line 254 index
EventDataHelper.prototype.requestEventData = function(uri) {
  return this.getEventData(uri)//.then(
  //   function(response) {
  //     return response.body;
  //   }, function (error) {
  //       console.log('error in the promise');
  //   }
  // ).catch(console.log.bind(console));
};

EventDataHelper.prototype.getEventData = function(uri){
  // var options = {
  //   method: 'GET',
  //   uri: encodeURI(uri),
  //   timeout: 3000,
  //   resolveWithFullResponse: true,
  //   app_key: process.env.VISIONAPPKEY
  // };
  // return rp(options);
  return sampleReturn;
};

// build out alexa response

module.exports = EventDataHelper;
// where is the info from amazon (when a customer says "tomorrow", where is the "tomorrow data")
