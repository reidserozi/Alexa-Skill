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
  //         console.log(response);
  //         expect(response).to.be.a('array');
  //       });
  //     });
  //   });
  // });
  describe('#formatRSSFeed', function() {
    context('with multiple feed items', function() {
      it('returns multiple formatted items', function() {
        this.timeout(10000);
        return subject.formatRSSFeed().then(function(response) {
          console.log(response);
          expect(response).to.eq(1);
        });
      });
    });
    context('with a single feed item', function() {
      it('returns a single formatted item', function() {
        // this.timeout(10000);
        // return subject.formatRSSFeed().then(function(response) {

        // });
      });
    });
    context('with no feed items', function() {
      it('returns the piano music', function() {
        // this.timeout(10000);
        // return subject.formatRSSFeed().then(function(response) {

        // });
      });
    });
  });
});
