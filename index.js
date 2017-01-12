'use strict';
module.change_code = 1;
process.env.TZ = 'America/New_York';
var _ = require('lodash');
var Alexa = require('alexa-sdk');
var OpenDataHelper = require('./open_data_helper');
var EsriDataHelper = require('./esri_data_helper');
var APP_ID = 'amzn1.ask.skill.5a5625bb-bf96-4cea-8998-abb79bf1967c';  // TODO replace with your app ID (OPTIONAL).
var APP_STATES = {
  ADDRESS: "_ADDRESS" // Asking for users address
};

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);
  alexa.appId = APP_ID;

  alexa.registerHandlers(handlers, addressHandlers);
  alexa.execute();
};

var handlers = {

  'OpenGymTimesIntent': function () {
    var gymTimeDate = this.event.request.intent.slots.Date.value;
    var reprompt = 'For open gym times, ask me for open gym times.';
    var openDataHelper = new OpenDataHelper();
    var prompt = '';
    var noData = false;
    var self = this;
    openDataHelper.requestOpenGymTime(gymTimeDate).then(function(gymTimeStatus) {
       prompt = openDataHelper.formatGymTimes(gymTimeStatus);
    }).then(function(){
      self.emit(':tell', prompt);
    }).catch(function(err) {
      prompt = 'I didn\'t have data for gym times on ' + gymTimeDate;
      self.emit(':tell', prompt, reprompt);
    });
  },

  'MyCouncilMemberIntent': function() {
    this.handler.state = APP_STATES.ADDRESS;
    var prompt = 'Please tell me your address so I can look up your council information';
    this.emit(':ask', prompt, prompt);
  },

  'AllCouncilMembersIntent': function() {

  },

  'MyMayorIntent': function() {
    var prompt = '';
    var self = this;
    var openDataHelper = new OpenDataHelper();
    openDataHelper.requestMayor().then(function(response) {
       prompt = openDataHelper.formatMayor(response);
    }).then(function(){
      self.emit(':tell', prompt);
    }).catch(function(err) {
      prompt = 'There seems to be a problem with the connection right now.  Please try again later';
      self.emit(':tell', prompt);
    });
  }
};

var addressHandlers = Alexa.CreateStateHandler(APP_STATES.ADDRESS, {

  'GetCouncilByAddressIntent': function() {
    var esriDataHelper = new EsriDataHelper();
    var self = this;
    var reprompt = 'Please tell me your address so I can look up your council information';
    var address = this.event.request.intent.slots.address.value;
    var prompt = '';
    esriDataHelper.requestCouncilInformationAddress(address).then(function(response) {
      prompt = esriDataHelper.formatMyCouncilMember(response);
    }).then(function() {
      self.emit(':tell', prompt);
    }).catch(function(error){
      prompt = 'I could not find any information for ' + address;
      this.handler.state = APP_STATES.ADDRESS;
      self.emit(':tell', prompt, reprompt);
    });
  }

});
