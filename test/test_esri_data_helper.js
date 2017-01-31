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
          return obj.features[0].attributes["Name"];
        });
        return expect(value).to.eventually.eq("Park Name");
      });
    });
    context('with an address', function() {
      it('gets geolocation from ESRI and then gets all parks in 1 mile radius', function() {
        var value = subject.requestParkInformationAddress(address).then(function(obj){
          return obj.features[0].attributes["Name"];
        });
        return expect(value).to.eventually.eq("Park Name");
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
});
