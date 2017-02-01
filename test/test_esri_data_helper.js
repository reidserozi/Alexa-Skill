'use strict';
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var EsriDataHelper = require('../esri_data_helper');
chai.config.includeStack = true;

describe('EsriDataHelper', function() {
  var subject = new EsriDataHelper();
  describe('#getMyCouncilInformation', function(){
    var x = '-78.78019524861178';
    var y = '35.789212829037126';
    var address = '316 N Academy St';
    context('with a geolocation', function(){
      it('returns council representative and district from Lat Long', function(){
        var value = subject.requestCouncilInformationLatLong(x,y).then(function(obj){
          return obj.results[1].attributes["Representative Name"];
        });
        return expect(value).to.eventually.eq("Don Frantz");
      });
    });
    context('with an address', function() {
      it('gets geolocation from ESRI and then gets council information', function() {
        var value = subject.requestCouncilInformationAddress(address).then(function(obj){
          return obj.results[1].attributes["Representative Name"];
        });
        return expect(value).to.eventually.eq("Don Frantz");
      });
    });
  });
  describe('#getNearbyParks', function(){
    var x = '-78.78019524861178';
    var y = '35.789212829037126';
    var address = '316 N Academy St';
    context('with a geolocation', function(){
      it('returns all parks in 1 mile radius from Lat Long', function(){
        var value = subject.requestParkInformationLatLong(x,y).then(function(obj){
          return obj.features[0].attributes["NAME"];
        });
        return expect(value).to.eventually.eq("Heater Park");
      });
    });
    context('with an address', function() {
      it('gets geolocation from ESRI and then gets all parks in 1 mile radius', function() {
        var value = subject.requestParkInformationAddress(address).then(function(obj){
          return obj.features[0].attributes["NAME"];
        });
        return expect(value).to.eventually.eq("Heater Park");
      });
    });
  });
  describe('#formatMyCouncilMember', function() {
    var status = {
        "results": [
          {
            "layerId": 0,
            "layerName": "Polling Places",
            "displayFieldName": "Polling Location",
            "value": "Herbert C. Young Community Center",
            "attributes": {
              "OBJECTID": "17",
              "Polling Location": "Herbert C. Young Community Center",
              "Polling Place ID": "04-11",
              "Full Site Address": "101 Wilkinson Ave",
              "City": "Cary",
              "State": "NC",
              "Polling Hours": "Null",
              "Handicap Accessible": "Yes",
              "Next Election Date": "11/8/2016",
              "Voter Registration Deadline": "Null",
              "Contact Name": "Wake County Board of Elections",
              "Phone": "919-856-6240",
              "Email": "voter@wakegov.com",
              "Last Update Date": "Null",
              "Last Editor": "Null",
              "Shape": "Point"
            }
          },
          {
            "layerId": 2,
            "layerName": "Town of Cary Council",
            "displayFieldName": "Council Distict",
            "value": "B",
            "attributes": {
              "OBJECTID": "2861",
              "District ID": "B",
              "Council Distict": "B",
              "Representative Name": "Don Frantz",
              "Council Website": "http://www.townofcary.org/Town_Council/Cary_Town_Council.htm",
              "Last Update Date": "Null",
              "Last Editor": "Null",
              "At Large Representative 1": "Lori Bush",
              "At Large Representative 2": "Ed Yerha",
              "Mayor": "Harold Weinbrecht",
              "Wake Co BOA": "http://www.wakegov.com/elections/Pages/default.aspx",
              "Chatham Co BOA": "http://www.chathamnc.org/Index.aspx?page=110",
              "Board of Elections": "http://www.wakegov.com/elections/Pages/default.aspx",
              "Shape": "Polygon",
              "Shape.STArea()": "366025445.3125",
              "Shape.STLength()": "314712.777278"
            }
          }
        ]
      };
    context('one council member', function() {
      it('formats the status as expected', function() {
        expect(subject.formatMyCouncilMember(status)).to.eq('You belong to District B, and your Council Member is Don Frantz. Your at large council members are Lori Bush, and Ed Yerha.');
      });
    });
  });
  describe('#formatMyCouncilMember', function() {
    var status = {
      "objectIdFieldName": "OBJECTID",
      "globalIdFieldName": "",
      "geometryType": "esriGeometryPoint",
      "spatialReference": {},
      "fields": [],
      "features": [
        {
          "attributes": {
            "OBJECTID": 39,
            "FACILITYID": "39",
            "NAME": "Heater Park",
            "SUBTYPEFIELD": 790,
            "FEATURECODE": null,
            "FULLADDR": "400 S. West Street Cary NC 27511",
            "OPERDAYS": "Sun-Sat",
            "OPERHOURS": "Sunrise to Sunset",
            "PARKAREA": 1.49,
            "PARKURL": "http://www.townofcary.org/recreation-enjoyment/parks-greenways-environment/parks/heater-park",
            "NUMPARKING": -9999,
            "RESTROOM": "No",
            "ADACOMPLY": "No",
            "CAMPING": null,
            "SWIMMING": null,
            "HIKING": null,
            "FISHING": null,
            "PICNIC": "No",
            "BOATING": null,
            "HUNTING": null,
            "ROADCYCLE": null,
            "MTBCYCLE": null,
            "PLAYGROUND": "No",
            "GOLF": null,
            "SKI": null,
            "SOCCER": "No",
            "BASEBALL": "No",
            "BASKETBALL": "No",
            "SKATEPARK": "No",
            "TENNISCOURT": "No",
            "VOLLEYBALL": "No",
            "FITNESSTRAIL": "No",
            "NATURETRAIL": "No",
            "TRAILHEAD": "No",
            "OPENSPACE": "No",
            "LAKE": "No",
            "AMPITHEATER": "No",
            "DOGPARK": "No",
            "DISCGOLF": "No",
            "CLIMBINGROCKS": "No",
            "CLIMBINGROPES": "No",
            "BATTINGCAGES": "No"
          },
          "geometry": {
            "x": -78.78598197756895,
            "y": 35.78260079150859
          }
        },
        {
          "attributes": {
            "OBJECTID": 41,
            "FACILITYID": "41",
            "NAME": "Lexie Lane Park",
            "SUBTYPEFIELD": 790,
            "FEATURECODE": null,
            "FULLADDR": "301 N. Dixon Avenue Cary NC 27513",
            "OPERDAYS": "Sun-Sat",
            "OPERHOURS": "Sunrise to Sunset",
            "PARKAREA": 2.82,
            "PARKURL": "http://www.townofcary.org/recreation-enjoyment/parks-greenways-environment/parks/lexie-lane-park",
            "NUMPARKING": -9999,
            "RESTROOM": "Yes",
            "ADACOMPLY": "No",
            "CAMPING": null,
            "SWIMMING": null,
            "HIKING": null,
            "FISHING": null,
            "PICNIC": "No",
            "BOATING": null,
            "HUNTING": null,
            "ROADCYCLE": null,
            "MTBCYCLE": null,
            "PLAYGROUND": "Yes",
            "GOLF": null,
            "SKI": null,
            "SOCCER": "No",
            "BASEBALL": "Yes",
            "BASKETBALL": "Yes",
            "SKATEPARK": "No",
            "TENNISCOURT": "No",
            "VOLLEYBALL": "No",
            "FITNESSTRAIL": "No",
            "NATURETRAIL": "No",
            "TRAILHEAD": "No",
            "OPENSPACE": "No",
            "LAKE": "No",
            "AMPITHEATER": "No",
            "DOGPARK": "No",
            "DISCGOLF": "No",
            "CLIMBINGROCKS": "No",
            "CLIMBINGROPES": "No",
            "BATTINGCAGES": "No"
          },
          "geometry": {
            "x": -78.78938964654577,
            "y": 35.78906936020467
          }
        }
      ]
    }
    context('two parks', function() {
      it('formats the status as expected', function() {
        expect(subject.formatNearbyParks(status)).to.eq('There are 2 parks nearby including Heater Park located at 400 S. West Street Cary NC 27511, Lexie Lane Park located at 301 N. Dixon Avenue Cary NC 27513, ');
      });
    });
  });
});
