'use strict';
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var FieldStatusHelper = require('../field_status_helper');
var FIELDSTATUSENDPOINT = 'http://games.townofcary.org/'
chai.config.includeStack = true;

describe('FieldStatusHelper', function() {
  var subject = new FieldStatusHelper();
  describe('#getFieldStatus', function(){
    context('basball field', function(){
      it('gets field status of baseball fields', function(){
        subject.getAllFieldStatus().then(function(response){
          //looking for 9 since tehre are 9 total fileds/gyms at bond park.
          expect(response["BOND PARK"].open.length).to.eq(9);
        });
      });
    });
  });
});
