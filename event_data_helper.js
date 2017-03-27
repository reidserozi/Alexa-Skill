'use strict';
var _ = require('lodash');
var rp = require('request-promise');
var request = require('request');
var Promise = require('bluebird');
var crypto = require('crypto');
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
  console.log('in the function');
  return this.getEventData(uri).then(function(response) {
    console.log('got response');
    console.log(response);
    return response;
  }, function (error) {
      console.log('error in the promise');
  }).catch(console.log.bind(console));
};

EventDataHelper.prototype.getEventData = function(uri){
  var options = { method: 'GET',
    url: 'https://www.townofcary.org/API',
    headers:{
      _app_key: process.env.VISIONAPPKEY,
      _format: 'json',
      _method: 'vision.cms.calendarcomponent.event.find',
      _timestamp: new Date().toString('yyyy-MM-dd HH:mm:ss'),
      _v: '1.0',
      enddate: '2017-03-26T00:00:00',
      pageindex: '1',
      pagesize: '20',
      startdate: '2017-03-21T00:00:00'
   }
  };
  var sign = signAPIRequest(options.headers);
  console.log(sign);
  options.headers.sign = sign;
  console.log(options);
  return rp(options);
  //return sampleReturn;
}

function signAPIRequest(params){
  var returnVal = process.env.VISIONAPPSECRET;
  Object.keys(params).forEach(function(key) {
    returnVal += key + params[key];
  });
  return crypto.createHash('md5').update(returnVal).digest("hex");
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
