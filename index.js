'use strict';
module.change_code = 1;
process.env.TZ = 'America/New_York';
var _ = require('lodash');
var Alexa = require('alexa-sdk');
var OpenDataHelper = require('./open_data_helper');
var EsriDataHelper = require('./esri_data_helper');
var ESRIENDPOINT = 'https://maps.townofcary.org/arcgis1/rest/services/';
var ARCGISENDPOINT = 'http://services2.arcgis.com/l4TwMwwoiuEVRPw9/ArcGIS/rest/services/';
var DISTANCE = 1; //distance for radius search.  currently 1 mile can be adapted later.
var APP_ID = 'amzn1.ask.skill.5a5625bb-bf96-4cea-8998-abb79bf1967c';  // TODO replace with your app ID (OPTIONAL).
var APP_STATES = {
  COUNCIL: '_COUNCIL', // Asking for users address
  PARKS: '_PARKS',
  HELP: '_HELPMODE',
  ART: '_ART'
};

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);
  alexa.appId = APP_ID;

  alexa.registerHandlers(handlers, councilHandlers, helpStateHandlers, parkHandlers, artHandlers);
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
    this.handler.state = APP_STATES.COUNCIL;
    var prompt = 'Please tell me your address so I can look up your council information';
    this.emit(':ask', prompt, prompt);
  },

  'NearbyParksIntent': function() {
    this.handler.state = APP_STATES.PARKS;
    var prompt = 'Please tell me your address so I can look up nearby parks';
    this.emit(':ask', prompt, prompt);
  },

  'NearbyPublicArtIntent': function() {
    this.handler.state = APP_STATES.ART;
    var prompt = 'Please tell me your address so I can look up nearby public art';
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

  'AMAZON.RepeatIntent': function () {
      this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptText']);
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
    var prompt = 'This is a help function, Please ask a question.';
    this.emit(':ask', prompt, prompt);
  },

  'AMAZON.RepeatIntent': function () {
      this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptText']);
  },

  'Unhandled': function () {
      var prompt = 'I\'m sorry.  I didn\'t catch that.  Can you please repeat the question.';
      this.emit(':ask', prompt, prompt);
  }
});

var councilHandlers = Alexa.CreateStateHandler(APP_STATES.COUNCIL, {

  'GetByAddressIntent': function() {
    var esriDataHelper = new EsriDataHelper();
    var self = this;
    var reprompt = 'Please tell me your address so I can look up your council information';
    var street_number = this.event.request.intent.slots.street_number.value;
    var street = this.event.request.intent.slots.street.value;
    var address = street_number + ' ' + street
    var prompt = '';
    esriDataHelper.requestAddressInformation(address).then(function(response) {
      var uri = ESRIENDPOINT + 'Elections/Elections/MapServer/identify?geometry=' + response.candidates[0].location.x + ',' + response.candidates[0].location.y + '&geometryType=esriGeometryPoint&sr=4326&layers=all&layerDefs=&time=&layerTimeOptions=&tolerance=2&mapExtent=-79.193,35.541,-78.63,35.989&imageDisplay=600+550+96&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&dynamicLayers=&returnZ=false&returnM=false&gdbVersion=&f=pjson'
      esriDataHelper.requestInformationLatLong(uri).then(function(response){
        prompt = esriDataHelper.formatMyCouncilMember(response);
      }).then(function() {
        self.emit(':tell', prompt);
      }).catch(function(error){
        prompt = 'I could not find any information for ' + address;
        self.handler.state = APP_STATES.ADDRESS;
        self.emit(':tell', prompt, reprompt);
      });
    });
  },

  'AMAZON.RepeatIntent': function () {
      this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptText']);
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

var parkHandlers = Alexa.CreateStateHandler(APP_STATES.PARKS, {

  'GetByAddressIntent': function() {
    var esriDataHelper = new EsriDataHelper();
    var self = this;
    var reprompt = 'Please tell me your address so I can look up nearby parks.';
    var street_number = this.event.request.intent.slots.street_number.value;
    var street = this.event.request.intent.slots.street.value;
    var address = street_number + ' ' + street
    var prompt = '';
    esriDataHelper.requestAddressInformation(address).then(function(response) {
      esriDataHelper.requestInformationByRadius(response.candidates[0].location.x, response.candidates[0].location.y, DISTANCE).then(function(response){
        prompt = esriDataHelper.formatNearbyParks(response);
      }).then(function() {
        self.emit(':tell', prompt);
      }).catch(function(error){
        prompt = 'I could not find any parks near for ' + address;
        self.handler.state = APP_STATES.PARKS;
        self.emit(':tell', prompt, reprompt);
      });
    });
  },

  'AMAZON.RepeatIntent': function () {
      this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptText']);
  },

  'AMAZON.HelpIntent': function() {
      var prompt = 'Please tell me your house number and street for me to look up nearby parks.'
      this.emit(':ask', prompt, prompt);
  },

  'Unhandled': function () {
      var prompt = 'I\'m sorry.  I didn\'t catch that.  Can you please repeat the question.';
      this.emit(':ask', prompt, prompt);
  }
});

var artHandlers = Alexa.CreateStateHandler(APP_STATES.ART, {

  'GetByAddressIntent': function() {
    var esriDataHelper = new EsriDataHelper();
    var self = this;
    var reprompt = 'Please tell me your address so I can look up nearby public art.';
    var street_number = this.event.request.intent.slots.street_number.value;
    var street = this.event.request.intent.slots.street.value;
    var address = street_number + ' ' + street
    var prompt = '';
    esriDataHelper.requestAddressInformation(address).then(function(response) {
        var uri = ARCGISENDPOINT + 'Art_in_Public_Places/FeatureServer/0/query?where=&objectIds=&time=&geometry=' + response.candidates[0].location.x + ',' + response.candidates[0].location.y + '&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelContains&resultType=none&distance=1000&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=pjson';
      esriDataHelper.requestInformationLatLong(uri).then(function(response){
        prompt = esriDataHelper.formatNearbyPublicArt(response);
      }).then(function() {
        self.emit(':tell', prompt);
      }).catch(function(error){
        prompt = 'I could not find any public art near ' + address;
        self.handler.state = APP_STATES.ART;
        self.emit(':tell', prompt, reprompt);
      });
    });
  },

  'AMAZON.RepeatIntent': function () {
      this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptText']);
  },

  'AMAZON.HelpIntent': function() {
      var prompt = 'Please tell me your house number and street for me to look up nearby public art.'
      this.emit(':ask', prompt, prompt);
  },

  'Unhandled': function () {
      var prompt = 'I\'m sorry.  I didn\'t catch that.  Can you please repeat the question.';
      this.emit(':ask', prompt, prompt);
  }
});
