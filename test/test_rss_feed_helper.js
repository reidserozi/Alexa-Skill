'use strict';
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var RSSFeedHelper = require('../rss_feed_helper');

describe('RSSFeedHelper', function() {
  var subject = new RSSFeedHelper();
  // describe('#requestRSSFeed', function() {
  //   context('with a valid rss feed', function() {
  //     it('returns the parsed rss object', function() {
  //       this.timeout(10000);
  //       return subject.requestRSSFeed().then(function(response) {
  //         expect(response).to.be.a('array');
  //       });
  //     });
  //   });
  // });
  describe('#formatRSSFeed', function() {
    context('with valid utterance from user', function() {
      it('returns the latest RSS feed item', function() {
        this.timeout(10000);
        return subject.formatRSSFeed().then(function(response) {
          console.log(response);
          expect(response).to.include("The latest Town of Cary News today: ");
        });
      });
    });
  });
});
