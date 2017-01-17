'use strict';
module.change_code = 1;
process.env.TZ = 'America/New_York';
var _ = require('lodash');
var Alexa = require('alexa-sdk');
var OpenDataHelper = require('./open_data_helper');
var EsriDataHelper = require('./esri_data_helper');
var APP_ID = 'amzn1.ask.skill.5a5625bb-bf96-4cea-8998-abb79bf1967c';  // TODO replace with your app ID (OPTIONAL).
var APP_STATES = {
  ADDRESS: '_ADDRESS', // Asking for users address
  HELP: '_HELPMODE'
};

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);
  alexa.appId = APP_ID;

  alexa.registerHandlers(handlers, addressHandlers, helpStateHandlers);
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
    var prompt = '';
    var self = this;
    var openDataHelper = new OpenDataHelper();
    openDataHelper.requestCityInformation().then(function(response) {
       prompt = openDataHelper.formatAllCouncilMembers(response);
    }).then(function(){
      self.emit(':tell', prompt);
    }).catch(function(err) {
      prompt = 'There seems to be a problem with the connection right now.  Please try again later';
      self.emit(':tell', prompt);
    });
  },

  'AtLargeCouncilMembersIntent': function() {
    var prompt = '';
    var self = this;
    var openDataHelper = new OpenDataHelper();
    openDataHelper.requestCityInformation().then(function(response) {
       prompt = openDataHelper.formatAtLargeCouncilMembers(response);
    }).then(function(){
      self.emit(':tell', prompt);
    }).catch(function(err) {
      prompt = 'There seems to be a problem with the connection right now.  Please try again later';
      self.emit(':tell', prompt);
    });
  },

  'MyMayorIntent': function() {
    var prompt = '';
    var self = this;
    var openDataHelper = new OpenDataHelper();
    openDataHelper.requestCityInformation().then(function(response) {
       prompt = openDataHelper.formatMayor(response);
    }).then(function(){
      self.emit(':tell', prompt);
    }).catch(function(err) {
      prompt = 'There seems to be a problem with the connection right now.  Please try again later';
      self.emit(':tell', prompt);
    });
  },

  'AMAZON.HelpIntent': function() {
      this.handler.state = APP_STATES.HELP;
      this.emitWithState('helpTheUser');
  },

  'AMAZON.StopIntent': function () {
    this.emit(':tell', 'Goodbye');
  },
  'Unhandled': function () {
      var prompt = 'I\'m sorry.  I didn\'t catch that.  Can you please repeat the question.';
      this.emit(':ask', prompt, prompt);
  }
};

var helpStateHandlers = Alexa.CreateStateHandler(APP_STATES.HELP, {
  'helpTheUser': function() {
    this.handler.state = '';
    this.emit(':ask', 'This is a help function', 'Please ask a question.')
  },
  'Unhandled': function () {
      var prompt = 'I\'m sorry.  I didn\'t catch that.  Can you please repeat the question.';
      this.emit(':ask', prompt, prompt);
  }
});

var addressHandlers = Alexa.CreateStateHandler(APP_STATES.ADDRESS, {

  'GetCouncilByAddressIntent': function() {
    var esriDataHelper = new EsriDataHelper();
    var self = this;
    var reprompt = 'Please tell me your address so I can look up your council information';
    var street_number = this.event.request.intent.slots.street_number.value;
    var street = this.event.request.intent.slots.street.value;
    var address = street_number + ' ' + street
    var prompt = '';
    console.log(address);
    esriDataHelper.requestCouncilInformationAddress(address).then(function(response) {
      console.log(response);
      prompt = esriDataHelper.formatMyCouncilMember(response);
    }).then(function() {
      self.emit(':tell', prompt);
    }).catch(function(error){
      prompt = 'I could not find any information for ' + address;
      this.handler.state = APP_STATES.ADDRESS;
      self.emit(':tell', prompt, reprompt);
    });
  },
  'AMAZON.HelpIntent': function() {
      var prompt = 'Please tell me your house number and street for me to look up your council information.'
      this.emit(':ask', prompt, prompt);
  },
  'Unhandled': function () {
      var prompt = 'I\'m sorry.  I didn\'t catch that.  Can you please repeat the question.';
      this.emit(':ask', prompt, prompt);
  }

});
