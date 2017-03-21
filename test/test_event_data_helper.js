'use strict';
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var EventDataHelper = require('../event_data_helper');

describe('EventDataHelper', function() {
  var today;
  var subject = new EventDataHelper();
  var uri = 'http://www.townofcary.org/API'
  context('With a date', function() {
    context('with one or more scheduled events', function() {
      it('Returns an event', function() {
        today = new Date('2017-03-25')
        // var value = subject.requestEventData(uri)//.then(function(obj) {
        //   return obj.PagingList.Content.ID;
        //
        // });
        var value = subject.requestEventData(uri)

        return expect(value.PagingList.Content[0].ID).to.eq(229);

      });

    });
    context('with no scheduled events', function() {
      it('Returns a canned no events scheduled message', function() {
        today = new Date('2017-03-23')
        // var value = subject.requestEventData(uri).then(function(obj) {
        //   return obj.PagingList.TotalResults.to.eventually.eq(0);
        // });
        var value = subject.requestEventData(uri)
          return expect(value.PagingList.TotalResults).to.eq(0);
      });
    });
  });
});
