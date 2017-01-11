'use strict';
module.change_code = 1;
process.env.TZ = 'America/New_York';
var _ = require('lodash');
var Alexa = require('alexa-sdk');
var OpenDataHelper = require('./open_data_helper');
var APP_ID = 'amzn1.ask.skill.5a5625bb-bf96-4cea-8998-abb79bf1967c';  // TODO replace with your app ID (OPTIONAL).
var APP_STATES = {
  TRIVIA: "_TRIVIAMODE", // Asking trivia questions.
  START: "_STARTMODE", // Entry point, start the game.
  HELP: "_HELPMODE" // The user is asking for help.
};

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);
  alexa.appId = APP_ID;

  alexa.registerHandlers(handlers);
  alexa.execute();
};

var handlers = {

  'OpenGymTimesIntent': function () {
    var gymTimeDate = this.event.request.intent.slots.Date.value;
    var reprompt = 'For open gym times, ask me for open gym times.';
    var openGymHelper = new OpenDataHelper();
    var prompt = '';
    var noData = false;
    var self = this;
    openGymHelper.requestOpenGymTime(gymTimeDate).then(function(gymTimeStatus) {
       prompt = openGymHelper.formatGymTimes(gymTimeStatus);
    }).then(function(){
      self.emit(':tell', prompt);
    }).catch(function(err) {
      prompt = 'I didn\'t have data for gym times on ' + gymTimeDate;
      self.emit(':tell', prompt, reprompt);
    });
  }

  'MyCouncilMemberIntent': function() {

  }

  'AllCouncilMembersIntent': function() {
    
  }

  'MyMayorIntent': function() {

  }
}
