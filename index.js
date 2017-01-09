'use strict';
module.change_code = 1;
process.env.TZ = 'America/New_York';
var _ = require('lodash');
var Alexa = require('alexa-app');
var app = new Alexa.app('opengymtimes');
var OpenDataHelper = require('./open_data_helper');
app.launch(function(req, res) {
  var prompt = 'For open gym times, ask me for open gym times.';
  res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

app.intent('opengymtimes', {
    slots: {
      'Date': "AMAZON.DATE"
    },
    'utterances': ['{what are the|what|how many} open gym times {for|are there|are there on} {-|Date}']
  },
  function(req, res) {
    //get the slot
    var gymTimeDate = req.slot('Date');
    var reprompt = 'For open gym times, ask me for open gym times.';
    var openGymHelper = new OpenDataHelper();
    openGymHelper.requestOpenGymTime(gymTimeDate).then(function(gymTimeStatus) {
      res.say(openGymHelper.formatGymTimes(gymTimeStatus)).send();
    }).catch(function(err) {
      var prompt = 'I didn\'t have data for gym times on ' + gymTimeDate;
      res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
    });
    return false;
  }
);

module.exports = app;
