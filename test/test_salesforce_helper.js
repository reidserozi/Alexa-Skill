'use strict';
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var SalesforceHelper = require('../salesforce_helper');
chai.config.includeStack = true;

describe('SalesforceHelper', function() {
  var subject = new SalesforceHelper();
  var accessToken = '00D7A0000000P0o!AQMAQEc15KSbHvx2xy8LdaGvol_Xf.CEYCNZWTeI8uEYGVP9a2JCMsITesyoQ4NnOhUIHIN_352Oik7_4gD2JCQRdQiTzcLd'
  var address = '316 N Academy St';
  describe('#getUserAddress', function() {
    context('with a user access token', function() {
      it('returns users street address', function() {
        var value = subject.getUserAddress(accessToken).then(function(results){
          return results.MailingStreet;
        }).catch(function(err){
          console.log('Error in connecting to salesforce');
          console.log(err);
        });
        return expect(value).to.eventually.eq(address);
      });
    });
  });
});
