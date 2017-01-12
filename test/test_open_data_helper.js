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
        }
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
  describe('#requestCityInformation', function() {
    context('normal call to function', function() {
      it('returns the name of the mayor', function() {
        var value = subject.requestCityInformation().then(function(obj) {
          return obj.records[0].fields.mayor;
        });
        return expect(value).to.eventually.eq("Harold Weinbrecht");
      });
    });
  });
  var cityInfo = {
    "nhits": 4,
    "parameters": {
      "dataset": [
        "council-districts"
      ],
      "timezone": "UTC",
      "q": "county==wake",
      "rows": 10,
      "sort": "name",
      "format": "json",
      "facet": [
        "at_large_representatives"
      ]
    },
    "records": [
      {
        "datasetid": "council-districts",
        "recordid": "f2f82d0a480b0a3d83ec20530ed9c5fb92388871",
        "fields": {
          "name": "A",
          "repname": "Jennifer Robinson",
          "districturl": "http://www.townofcary.org/Town_Council/Cary_Town_Council.htm",
          "at_large_representatives": "Lori Bush,Ed Yerha",
          "geo_point_2d": [],
          "county": "wake",
          "shape_stlength": 553309.7411049065,
          "districtcounty": "Wake",
          "boeurl": "http://www.wakegov.com/elections/Pages/default.aspx",
          "geo_shape": {},
          "squaremiles": 17.07883638623223,
          "shape_starea": 476130632.3099365,
          "mayor": "Harold Weinbrecht"
        },
        "geometry": {},
        "record_timestamp": "2017-01-11T14:24:05+00:00"
      },
      {
        "datasetid": "council-districts",
        "recordid": "90ac3503fea437bacc5e3832d0421ac8ac55457e",
        "fields": {
          "name": "B",
          "repname": "Don Frantz",
          "districturl": "http://www.townofcary.org/Town_Council/Cary_Town_Council.htm",
          "at_large_representatives": "Lori Bush,Ed Yerha",
          "geo_point_2d": [],
          "county": "wake",
          "shape_stlength": 314712.7772780101,
          "districtcounty": "Wake",
          "boeurl": "http://www.wakegov.com/elections/Pages/default.aspx",
          "geo_shape": {},
          "squaremiles": 13.129356251165778,
          "shape_starea": 366025445.3125,
          "mayor": "Harold Weinbrecht"
        },
        "geometry": {},
        "record_timestamp": "2017-01-11T14:24:05+00:00"
      },
      {
        "datasetid": "council-districts",
        "recordid": "162e417851f4e50dfa8bb450817e63082d91d432",
        "fields": {
          "name": "C",
          "repname": "Jack Smith",
          "districturl": "http://www.townofcary.org/Town_Council/Cary_Town_Council.htm",
          "at_large_representatives": "Lori Bush,Ed Yerha",
          "geo_point_2d": [],
          "county": "wake",
          "shape_stlength": 348317.8036133578,
          "districtcounty": "Wake",
          "boeurl": "http://www.wakegov.com/elections/Pages/default.aspx",
          "geo_shape": {},
          "squaremiles": 17.563985942559466,
          "shape_starea": 489655825.7010498,
          "mayor": "Harold Weinbrecht"
        },
        "geometry": {},
        "record_timestamp": "2017-01-11T14:24:05+00:00"
      },
      {
        "datasetid": "council-districts",
        "recordid": "d30fd7e1548a21bc7cdf54706425b20fc7973c3f",
        "fields": {
          "name": "D",
          "repname": "Ken George",
          "districturl": "http://www.townofcary.org/Town_Council/Cary_Town_Council.htm",
          "at_large_representatives": "Lori Bush,Ed Yerha",
          "geo_point_2d": [],
          "county": "wake",
          "shape_stlength": 143265.29463668674,
          "districtcounty": "Wake",
          "boeurl": "http://www.wakegov.com/elections/Pages/default.aspx",
          "geo_shape": {},
          "squaremiles": 9.904823089556698,
          "shape_starea": 276130620.01989746,
          "mayor": "Harold Weinbrecht"
        },
        "geometry": {},
        "record_timestamp": "2017-01-11T14:24:05+00:00"
      }
    ],
    "facet_groups": [
      {
        "name": "at_large_representatives",
        "facets": [
          {
            "name": "Ed Yerha",
            "path": "Ed Yerha",
            "count": 4,
            "state": "displayed"
          },
          {
            "name": "Lori Bush",
            "path": "Lori Bush",
            "count": 4,
            "state": "displayed"
          }
        ]
      }
    ]
  };
  describe('#formatMayor', function() {
    context('return call from open data', function() {
      it('formats the status as expected', function() {
        expect(subject.formatMayor(cityInfo)).to.eq('The mayor of Cary is Harold Weinbrecht.');
      });
    });
  });
  describe('#formatAllCouncilMembers', function() {
    var responseText = 'The council member for district A is Jennifer Robinson. The council member for district B is Don Frantz. The council member for district C is Jack Smith. ' +
        'The council member for district D is Ken George. The at large representatives are Ed Yerha and Lori Bush.'
    context('return call from open data', function() {
      it('formats the status as expected', function() {
        expect(subject.formatAllCouncilMembers(cityInfo)).to.eq(responseText);
      });
    });
  });
});
