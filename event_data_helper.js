'use strict';
var _ = require('lodash');
var rp = require('request-promise');
var request = require('request');
var Promise = require('bluebird');
require('./jsDate.js')();
require('datejs');
var HelperClass = require('./helper_functions.js');

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
var sampleLocation =
  {
      "Event":{
          "ID":0,
          "StartDate":"0001-01-01T00:00:00",
          "EndDate":"0001-01-01T00:00:00",
          "DisplayLinkToDocumentViewer":false,
          "AllowNotification":false,
          "AllowRegistration":false,
          "Categories":[
              {
                  "ID":51,
                  "Name":"WakeMed Soccer Park"
              }
          ]
      }
  }

function EventDataHelper() { }
// line 254 index
EventDataHelper.prototype.requestEventData = function(uri) {
  var self = this;
  return this.getEventData(uri).then(
    function(response) {
      return self.promiseWhile(response.body, 0)
    }, function (error) {
        console.log('error in the promise');
    }
  ).catch(console.log.bind(console));
};

EventDataHelper.prototype.getEventData = function(uri){
  // var options = {
  //   method: 'GET',
  //   uri: encodeURI(uri),
  //   timeout: 3000,
  //   resolveWithFullResponse: true,
  //   app_key: process.env.VISIONAPPKEY,
  //   sign: process.env.VISIONAPPSECRET
  // };
  // return rp(options);
  return sampleReturn;
}



// building out alexa response

// promise loop to move to insert location into alexa return
EventDataHelper.prototype.promiseWhile = function(results, i) {
  var self = this;
  // build up uri - may just be url or build out full options
  return rp(options);
  this.getEventData(uri).then(function(response) {
      results.PagingList.Content[i].Location = response.body.Event.Categories[0].Name
      return counter(i)
    }).then(function(response) {
      return (response >= results.PagingList.Content.length) ? results : self.promiseWhile(results, response)
    });
}


EventDataHelper.prototype.formatEventData = function(sampleReturn) {
  var helperClass = new HelperClass();
  var eventCount = sampleReturn.PagingList.Content.length
  var eventData =[];
  var eventContent = sampleReturn.PagingList.Content
  var response = '';

  if (eventCount === 0 ) {
    return 'There are no scheduled events for that day';
  } else {
    eventContent.forEach(function(item) {
      eventData += _.template('${eventTitle} starts at ${eventStart}, and ends at ${eventEnd} at ${eventLocation}. ')({
        eventStart: helperClass.formatTimeString(Date.parse(item.StartDate)),
        eventEnd: helperClass.formatTimeString(Date.parse(item.EndDate)),
        eventTitle: item.Title,
        eventLocation: item.Location
      });
    });
    response = _.template('On ${date} there are ${count} events: ${eventData}')({

      date: helperClass.formatDate(Date.parse(eventContent[0].StartDate)),
      count: eventCount,
      eventData: eventData
    });

    return response;
  };
}

var counter = Promise.method(function(i){
    return i + 1;
});

module.exports = EventDataHelper;





//
