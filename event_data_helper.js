'use strict';
var _ = require('lodash');
var rp = require('request-promise');
var request = require('request');
require('./jsDate.js')();
require('datejs');

// delete this once API is authorized
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
          "Content":"stuff about ballet event",
          "RedirectTarget":"_self",
          "State":"",
          "ThumbnailImage":"",
          "AllowRegistration":false
        },
        {
           "ID":1681,
           "Title":"NCSU Sigma Pi Break the Silence 5K Run/Walk",
           "StartDate":"2017-03-25T10:00:00",
           "EndDate":"2017-03-25T14:00:00",
           "DisplayLinkToDocumentViewer":false,
           "AllowNotification":false,
           "Content":"stuff about second sigma event",
           "RedirectTarget":"_self",
           "State":"",
           "ThumbnailImage":"",
           "AllowRegistration":false
         }
       ]
     }
   }
var sampleReturnWithoutEvents =
  {
    "PagingList":{
      "TotalResults":0,
      "HasNext":false,
      "Content":[
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

// building out alexa response
EventDataHelper.prototype.formatEventData = function(sampleReturn) {
  // formatting variables
  var response = '';
  var date = "Saturday, March 25th" // placeholder
  // do a check for eventCount if === 0 then response is no event scheduled from alexa to user
  var eventCount = sampleReturn.PagingList.Content.length
  return eventCount
  // var eventContent = sampleReturn.PagingList.Content[0]
  // var eventTitle = eventContent.Title
  // var eventStart = eventContent.StartDate
  // var eventStart = eventContent.EndDate

  var eventTitles = eventCount.foreach(function(item) {

  });

  if (eventCount === 0 ){
    throw new Error('No events for ${date}');
  } else {
    response += _.template('')({

    });
  }
};


module.exports = EventDataHelper;
// where is the info from amazon (when a customer says "tomorrow", where is the "tomorrow data")
