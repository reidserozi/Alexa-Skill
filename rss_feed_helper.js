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
  var feedData = '';
  return feedparser.parse(encodeURI(url)).then( (items) => {
    return feedData = items.filter(dateFilter);
  }).catch( (error) => {
    console.log('error: ', error);
  });
  // return feedData;
};

RSSFeedHelper.prototype.formatRSSFeed = function(feedData) {
  var response = 'The latest Town of Cary News today: ';
  feedData.forEach(function(item) {
    response += _.template("${rssTitle}. ")({
      rssTitle: item.title,
    });
  });
  return response;
};


module.exports = RSSFeedHelper;
