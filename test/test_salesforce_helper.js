'use strict';
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var SalesforceHelper = require('../salesforce_helper');
require('../salesforce_helper.js');
chai.config.includeStack = true;

describe('SalesforceHelper', function() {
  var subject = new SalesforceHelper();
  var accessToken = '00D7A0000000P0o!AQMAQPHkfx7oWL0xO6UpWw4OaTkofP_ZGHQsHVyDCpEJ5ql0lZVr4WSQkIQ6Y4_RS9X9DvurXJ7xQTr62DW0sXxCjG85pC5Y';
  var address = { x: -78.78019524656116, y: 35.7892128286608 };
  describe('#getUserAddress', function() {
    context('with a user access token', function() {
      it('returns users street address', function() {
        var value = subject.getUserAddress(accessToken).then(function(results){
          return results.x;
        }).catch(function(err){
          console.log('Error in connecting to salesforce testing address');
          console.log(err);
        });
        return expect(value).to.eventually.eq(address.x);
      });
    });
  });
  describe('#getTownHallHours', function() {
    context('with a weekday', function() {
      var date = '2018-03-02';
      it('returns normal town hall hours', function() {
        var value = subject.getTownHallHours(accessToken,date).then(function(results){
          return results.start;
        }).catch(function(err){
          console.log('Error in connecting to salesforce testing hours');
          console.log(err);
        });
        return expect(value).to.eventually.eq("8 am");
      });
    });
    context('with a holiday', function() {
      var date = '2017-04-14';
      it('returns that the townhall is closed for the holiday', function() {
        var value = subject.getTownHallHours(accessToken, date).then(function(results) {
          return results.closed;
        }).catch(function(err){
          console.log('Error in connecting to salesforce testing hours with holiday');
          console.log(err);
        });
        return expect(value).to.eventually.eq(true);
      });
    });
  });
  describe('#getTownHallHours', function() {
    context('with a weekend', function() {
      var date = '2018-03-04';
      it('returns that the townhall is closed for the weekend', function() {
        var value = subject.getTownHallHours(accessToken, date).then(function(results) {
          return results.closed;
        }).catch(function(err){
          console.log('Error in connecting to salesforce testing hours with weekend');
          console.log(err);
        });
        return expect(value).to.eventually.eq(true);
      });
    });
  });
});
