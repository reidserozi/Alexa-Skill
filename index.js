'use strict';
module.change_code = 1;
process.env.TZ = 'America/New_York';
var _ = require('lodash');
var Alexa = require('alexa-sdk');
var OpenDataHelper = require('./open_data_helper');
var EsriDataHelper = require('./esri_data_helper');
var SalesforceHelper = require('./salesforce_helper');
var facts = require('./cary_facts');
var ESRIENDPOINT = 'https://maps.townofcary.org/arcgis1/rest/services/';
var ARCGISENDPOINT = 'http://services2.arcgis.com/l4TwMwwoiuEVRPw9/ArcGIS/rest/services/';
var OPENDATAENDPOINT = 'https://data.townofcary.org/api/records/1.0/search/?';
var DISTANCE = 1; //distance for radius search.  currently 1 mile can be adapted later.
var APP_ID = 'amzn1.ask.skill.5a5625bb-bf96-4cea-8998-abb79bf1967c';  // TODO replace with your app ID (OPTIONAL).
var CASENUMBERLENGTH = 8 //the current number of digits in a case number to add leading zeros
//If false, it means that Account Linking isn't mandatory there fore we dont have accaes to the account of the community user so we will ask for the user's Phone Number.
// IMPORTANT!! Make sure that the profile of the community user has the 'API Enabled' field marked as true.
var ACCOUNT_LINKING_REQUIRED = true;
var APP_STATES = {
  COUNCIL: '_COUNCIL', // Asking for users address
  PARKS: '_PARKS',
  HELP: '_HELPMODE',
  ART: '_ART',
  CASE: '_CASE'
};

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);
  alexa.appId = APP_ID;

  alexa.registerHandlers(handlers, councilHandlers, helpStateHandlers, parkHandlers, artHandlers, caseHandlers);
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
    var uri = OPENDATAENDPOINT + 'dataset=open-gym&q=open_gym_start==' + gymTimeDate + '&facet=facility_title&facet=pass_type&facet=community_center&facet=open_gym&facet=group&facet=date_scanned&timezone=UTC';
    openDataHelper.requestOpenData(uri).then(function(gymTimeStatus) {
       prompt = openDataHelper.formatGymTimes(gymTimeStatus);
    }).then(function(){
      self.emit(':tell', prompt);
    }).catch(function(err) {
      prompt = 'I didn\'t have data for gym times on ' + gymTimeDate;
      self.emit(':tell', prompt, reprompt);
    });
  },

  'GetCaryFactsIntent': function () {
    var index = Math.floor(Math.random() * facts['facts'].length);
    var prompt = facts['facts'][index];
    this.emit(':tell', prompt);
  },

  'GetUserAddressIntent': function() {
    var salesforceHelper = new SalesforceHelper();
    var accessToken = this.event.session.user.accessToken;
    var prompt = '';
    var self = this;
    salesforceHelper.getUserAddress(accessToken).then(function(results){
      prompt = 'Address is ' + results.MailingStreet;
    }).then(function(){
      self.emit(':tell', prompt);
    }).catch(function(err){
      console.log(err);
      prompt = 'Error in connecting to salesforce';
      self.emit(':tell', prompt);
    });
  },

  'MyCouncilMemberIntent': function() {
    var salesforceHelper = new SalesforceHelper();
    var accessToken = this.event.session.user.accessToken;
    var self = this;
    salesforceHelper.getUserAddress(accessToken).then(function(results){
      self.attributes["address"] = results;
      console.log(results);
      console.log(self.attributes["address"]);
      if(results.x != null && results.y != null) {
        self.handler.state = APP_STATES.COUNCIL;
        self.emitWithState('GetCouncilInfoIntent', true);
      }
    }).catch(function(err) {
      console.log(err);
    }).finally(function(){
      if(self.attributes["address"] == undefined || self.attributes["address"] == null){
        self.handler.state = APP_STATES.COUNCIL;
        var prompt = 'Please tell me your address so I can look up your council information';
        self.emit(':ask', prompt, prompt);
      }
    });
  },

  'NearbyParksIntent': function() {
    var salesforceHelper = new SalesforceHelper();
    var accessToken = this.event.session.user.accessToken;
    var self = this;
    salesforceHelper.getUserAddress(accessToken).then(function(results){
      self.attributes["address"] = results;
      console.log(results);
      console.log(self.attributes["address"]);
      if(results.x != null && results.y != null) {
        self.handler.state = APP_STATES.PARKS;
        self.emitWithState('GetParkInfoIntent', true);
      }
    }).catch(function(err) {
      console.log(err);
    }).finally(function(){
      if(self.attributes["address"] == undefined || self.attributes["address"] == null){
        self.handler.state = APP_STATES.PARKS;
        var prompt = 'Please tell me your address so I can look up nearby parks';
        self.emit(':ask', prompt, prompt);
      }
    });
  },

  'NearbyPublicArtIntent': function() {
    var salesforceHelper = new SalesforceHelper();
    var accessToken = this.event.session.user.accessToken;
    var self = this;
    salesforceHelper.getUserAddress(accessToken).then(function(results){
      self.attributes["address"] = results;
      console.log(results);
      console.log(self.attributes["address"]);
      if(results.x != null && results.y != null) {
        self.handler.state = APP_STATES.ART;
        self.emitWithState('GetPublicArtInfoIntent', true);
      }
    }).catch(function(err) {
      console.log(err);
    }).finally(function(){
      if(self.attributes["address"] == undefined || self.attributes["address"] == null){
        self.handler.state = APP_STATES.ART;
        var prompt = 'Please tell me your address so I can look up nearby public art';
        self.emit(':ask', prompt);
      }
    });
  },

  'AllCouncilMembersIntent': function() {
    var prompt = '';
    var self = this;
    var openDataHelper = new OpenDataHelper();
    var uri = OPENDATAENDPOINT + 'dataset=council-districts&q=county==wake&sort=name&facet=at_large_representatives';
    openDataHelper.requestOpenData(uri).then(function(response) {
       return openDataHelper.formatAllCouncilMembers(response);
    }).then(function(response){
      self.emit(':tell', response);
    }).catch(function(err) {
      prompt = 'There seems to be a problem with the connection right now.  Please try again later';
      self.emit(':tell', prompt);
    });
  },

  'AtLargeCouncilMembersIntent': function() {
    var prompt = '';
    var self = this;
    var openDataHelper = new OpenDataHelper();
    var uri = OPENDATAENDPOINT + 'dataset=council-districts&q=county==wake&sort=name&facet=at_large_representatives';
    openDataHelper.requestOpenData(uri).then(function(response) {
       return openDataHelper.formatAtLargeCouncilMembers(response);
    }).then(function(response){
      self.emit(':tell', response);
    }).catch(function(err) {
      prompt = 'There seems to be a problem with the connection right now.  Please try again later';
      self.emit(':tell', prompt);
    });
  },

  'MyMayorIntent': function() {
    var prompt = '';
    var self = this;
    var openDataHelper = new OpenDataHelper();
    var uri = OPENDATAENDPOINT + 'dataset=council-districts&q=county==wake&sort=name&facet=at_large_representatives';
    openDataHelper.requestOpenData(uri).then(function(response) {
       return openDataHelper.formatMayor(response);
    }).then(function(response){
      self.emit(':tell', response);
    }).catch(function(err) {
      prompt = 'There seems to be a problem with the connection right now.  Please try again later';
      console.log(err);
      self.emit(':tell', prompt);
    });
  },

  'CaseStartIntent': function() {
    if(ACCOUNT_LINKING_REQUIRED == true && this.event.session.user.accessToken == undefined) {
  		var speechOutput = "You must link your account before accessing this skill.";
  		this.emit(':tellWithLinkAccountCard', speechOutput);
  	} else {
      var speechOutput = "OK, let's create a new Case. Do you need help with a dead animal, graffiti, pothole or other?";
      this.handler.state = APP_STATES.CASE;
      this.emit(':ask', speechOutput);
    }
  },

  'MyCaseStatusIntent': function() {
    if(ACCOUNT_LINKING_REQUIRED == true && this.event.session.user.accessToken == undefined) {
  		var speechOutput = "You must link your account before accessing this skill.";
  		this.emit(':tellWithLinkAccountCard', speechOutput);
  	} else {
      var salesforceHelper = new SalesforceHelper();
      var userToken = this.event.session.user.accessToken;
      var prompt = '';
      var self = this;
      salesforceHelper.findLatestCaseStatus(userToken).then(function(response) {
        return salesforceHelper.formatExistingCase(response);
      }).then(function(response) {
        self.emit(':tellWithCard', response.prompt, 'Town of Cary Case', response.card);
      }).catch(function(err){
        prompt = 'There seems to be a problem with the connection right now.  Please try again later';
        console.log(err);
        self.emit(':tell', prompt);
      });
    }
  },

  'CaseStatusIntent': function() {
    if(ACCOUNT_LINKING_REQUIRED == true && this.event.session.user.accessToken == undefined) {
  		var speechOutput = "You must link your account before accessing this skill.";
  		this.emit(':tellWithLinkAccountCard', speechOutput);
  	} else {
      var salesforceHelper = new SalesforceHelper();
      var userToken = this.event.session.user.accessToken;
      var caseNumber = this.event.request.intent.slots.CaseNumber.value.toString();
      if(caseNumber.length < 8){
        caseNumber = addLeadZeros(caseNumber);
      }
      var prompt = '';
      var self = this;
      salesforceHelper.findCaseStatus(userToken, caseNumber).then(function(response) {
        return salesforceHelper.formatExistingCase(response);
      }).then(function(response) {
        self.emit(':tellWithCard', response.prompt, 'Town of Cary Case', response.card);
      }).catch(function(err){
        prompt = 'There seems to be a problem with the connection right now.  Please try again later';
        console.log(err);
        self.emit(':tell', prompt);
      });
    }
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
      var uri = ESRIENDPOINT + 'Elections/Elections/MapServer/identify?geometry=' + response.candidates[0].location.x + ',' + response.candidates[0].location.y + '&geometryType=esriGeometryPoint&sr=4326&layers=all&layerDefs=&time=&layerTimeOptions=&tolerance=2&mapExtent=-79.193,35.541,-78.63,35.989&imageDisplay=600+550+96&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&dynamicLayers=&returnZ=false&returnM=false&gdbVersion=&f=pjson';
      return esriDataHelper.requestInformationLatLong(uri);
    }).then(function(response){
      return esriDataHelper.formatMyCouncilMember(response);
    }).then(function(response) {
      self.emit(':tell', response);
    }).catch(function(error){
      prompt = 'I could not find any information for ' + address;
      self.handler.state = APP_STATES.ADDRESS;
      self.emit(':tell', prompt);
    });
  },

  'GetCouncilInfoIntent': function() {
    var esriDataHelper = new EsriDataHelper();
    var self = this;
    var address = this.attributes['address'];
    var uri = ESRIENDPOINT + 'Elections/Elections/MapServer/identify?geometry=' + address.x + ',' + address.y + '&geometryType=esriGeometryPoint&sr=4326&layers=all&layerDefs=&time=&layerTimeOptions=&tolerance=2&mapExtent=-79.193,35.541,-78.63,35.989&imageDisplay=600+550+96&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&dynamicLayers=&returnZ=false&returnM=false&gdbVersion=&f=pjson';
    esriDataHelper.requestInformationLatLong(uri).then(function(response){
      return esriDataHelper.formatMyCouncilMember(response);
    }).then(function(response) {
      self.emit(':tell', response);
    }).catch(function(error){
      console.log(error);
      var prompt = 'I could not find any information for ' + address;
      self.handler.state = APP_STATES.ADDRESS;
      self.emit(':tell', prompt);
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
      return esriDataHelper.requestInformationByRadius(response.candidates[0].location.x, response.candidates[0].location.y, DISTANCE);
    }).then(function(response){
        return esriDataHelper.formatNearbyParks(response);
    }).then(function(responseresponse) {
      self.emit(':tell', response);
    }).catch(function(error){
      prompt = 'I could not find any parks near for ' + address;
      self.handler.state = APP_STATES.PARKS;
      self.emit(':tell', prompt);
    });
  },

  'GetParkInfoIntent': function() {
    var esriDataHelper = new EsriDataHelper();
    var self = this;
    var address = this.attributes['address'];
    esriDataHelper.requestAddressInformation(address).then(function(response) {
      return esriDataHelper.requestInformationByRadius(address.x, address.y, DISTANCE)
    }).then(function(response){
      return esriDataHelper.formatNearbyParks(response);
    }).then(function(response) {
      self.emit(':tell', response);
    }).catch(function(error){
      var prompt = 'I could not find any nearby parks';
      self.handler.state = APP_STATES.PARKS;
      self.emit(':tell', prompt);
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
      return esriDataHelper.requestInformationLatLong(uri);
    }).then(function(response){
      return esriDataHelper.formatNearbyPublicArt(response);
    }).then(function(response) {
      self.emit(':tell', response);
    }).catch(function(error){
      prompt = 'I could not find any public art near ' + address;
      self.handler.state = APP_STATES.ART;
      self.emit(':tell', prompt, reprompt);
    });
  },

  'GetPublicArtInfoIntent': function() {
    var esriDataHelper = new EsriDataHelper();
    var self = this;
    var address = this.attributes['address'];
    var prompt = '';
    var uri = ARCGISENDPOINT + 'Art_in_Public_Places/FeatureServer/0/query?where=&objectIds=&time=&geometry=' + address.x + ',' + address.y + '&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelContains&resultType=none&distance=1000&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=pjson';
    esriDataHelper.requestInformationLatLong(uri).then(function(response){
      return esriDataHelper.formatNearbyPublicArt(response);
    }).then(function(response) {
      self.emit(':tell', response);
    }).catch(function(error){
      prompt = 'I could not find any public art near ' + address;
      self.handler.state = APP_STATES.ART;
      self.emit(':tell', prompt, reprompt);
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

var caseHandlers = Alexa.CreateStateHandler(APP_STATES.CASE, {
  'CreateCaseIntent': function () {
    var userToken = this.event.session.user.accessToken;
    var salesforceHelper = new SalesforceHelper();
    var caseType = this.event.request.intent.slots.caseIssue.value;
    var prompt = '';
    var self = this;
    salesforceHelper.createCaseInSalesforce(userToken, caseType).then(function(response){
      self.attributes['caseType'] = caseType;
      self.attributes['case'] = response;
      return salesforceHelper.formatNewCaseStatus(response, caseType);
    }).then(function(response){
      self.emit(':askWithCard', response.prompt, response.prompt, 'Town of Cary Case', response.card);
    }).catch(function(err) {
      prompt = 'Darn, there was a Salesforce problem, sorry';
      console.log(err);
      self.emit(':tell', prompt);
    });
  },

  'AMAZON.YesIntent': function() {
    var prompt = 'You\'re case number is ' + this.attributes['case'].CaseNumber;
    var reprompt = 'Do you want me to repeat the case number?'
    this.emit(':ask', prompt, reprompt);
  },

  'AMAZON.NoIntent': function() {
    this.emit(':tell', 'Ok, Your case will be looked at shortly.');
  }
});

function addLeadZeros(caseNumber){
  var filler = '0';
  var results = filler.repeat(CASENUMBERLENGTH - caseNumber.length).concat(caseNumber);
  return results.valueOf();
}
