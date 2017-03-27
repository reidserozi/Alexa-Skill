'use strict';
var _ = require('lodash');
var rp = require('request-promise');
var request = require('request');
require('./jsDate.js')();
require('datejs');
const feedparser = require('feedparser-promised');
const url = 'http://www.townofcary.org/Home/Components/RssFeeds/RssFeed/View?ctID=5&&cateIDs=64';

function RSSFeedHelper() { }

function dateFilter(value) {
  return value.date >= Date.today();
}

RSSFeedHelper.prototype.requestRSSFeed = function() {
  return feedparser.parse(encodeURI(url)).then( (items) => {
    return items.filter(dateFilter);
  }).catch( (error) => {
    console.log('error: ', error);
  });
};

RSSFeedHelper.prototype.formatRSSFeed = function() {
  var self = this;
  this.requestRSSFeed().then(function(response) {
    console.log(response);
  });

};


module.exports = RSSFeedHelper;
