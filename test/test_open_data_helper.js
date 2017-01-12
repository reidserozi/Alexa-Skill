'use strict';
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var OpenDataHelper = require('../open_data_helper');
chai.config.includeStack = true;

describe('OpenDataHelper', function() {
  var subject = new OpenDataHelper();
  var open_gym_date;
  var today;
  describe('#getOpenGymTimes', function() {
    context('with a date', function() {
      it('returns gym times on current date', function() {
        today = new Date('2017-01-09');
        open_gym_date = today.toISOString().substring(0,10);
        var value = subject.requestOpenGymTime(open_gym_date).then(function(obj) {
          return obj.records[0].fields.date_scanned;
        });
        return expect(value).to.eventually.eq(open_gym_date);
      });
    });
  });
  describe('#formatGymTimes', function() {
    var status = {
        "nhits": 4,
        "parameters": {
        "dataset": [
        "open-gym"
        ],
        "timezone": "UTC",
        "q": "open_gym_start == '2017-01-06",
        "rows": 10,
        "format": "json",
        "facet": [
        "facility_title",
        "pass_type",
        "community_center",
        "open_gym",
        "group",
        "date_scanned"
        ]
        },
        "records": [
          {
            "datasetid": "open-gym",
            "recordid": "705ddb95b54abd49df7d7c1786013ea24d66bc99",
            "fields": {
            "postal_code1": "27513",
            "open_gym_start": "2017-01-06T20:30:00+00:00",
            "group": "Youth/Teen",
            "community_center": "BPCC",
            "open_gym_end": "2017-01-06T22:30:00+00:00",
            "date_scanned": "2017-01-06",
            "location": "Magnolia Gymnasium",
            "province_code1": "NC",
            "open_gym": "Basketball",
            "address11": "150 Metro Park",
            "total": 0,
            "facility_title": "Bond Park Community Center",
            "pass_type": "Open Gym - Youth/Teen BB"
          },
          "record_timestamp": "2016-08-15T14:54:00+00:00"
          },
          {
            "datasetid": "open-gym",
            "recordid": "efa1b60dfa7d3560042afc2eed8f3e50b9551951",
            "fields": {
            "postal_code1": "27513",
            "open_gym_start": "2017-01-06T14:00:00+00:00",
            "date_scanned": "2017-01-06",
            "open_gym_end": "2017-01-06T17:30:00+00:00",
            "community_center": "BPCC",
            "location": "Magnolia Gymnasium",
            "province_code1": "NC",
            "open_gym": "Pickleball",
            "address11": "150 Metro Park",
            "total": 0,
            "facility_title": "Bond Park Community Center",
            "pass_type": "Open Gym - Pickleball"
          },
          "record_timestamp": "2016-08-15T14:54:00+00:00"
          },
        ]
      };
    context('with multiple gym times', function() {
      it('formats the status as expected', function() {
        expect(subject.formatGymTimes(status)).to.eq('There are 2 open gym times on 2017-01-06. 03:30:00 PM to 05:30:00 PM at Bond Park Community Center for Basketball. 09:00:00 AM to 12:30:00 PM at Bond Park Community Center for Pickleball.');
      });
    });
    context('with no gym times', function() {
      it('formats the status as expected', function() {
        status.records = [];
        expect(subject.formatGymTimes(status)).to.eq('There are no open gym times for that date.');
      });
    });
 });
});
