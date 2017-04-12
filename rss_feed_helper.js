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
  var yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
  return value.date >= yesterday;
}

RSSFeedHelper.prototype.requestRSSFeed = function() {
  var feedData = '';
  return feedparser.parse(encodeURI(url)).then( (items) => {
    return feedData = items.filter(dateFilter);
  }).catch( (error) => {
    console.log('error: ', error);
  });
};

RSSFeedHelper.prototype.formatRSSFeed = function(feedData) {
  var response = 'The latest Town of Cary News today: ';
  if (feedData[0].title == 'Town of Cary\'s Weekend Update') {
    response = 'Please check Town of Cary dot O R G for the Weekend update';
  } else {
    feedData.forEach(function(item) {
      response += _.template("${rssTitle}. ")({
        rssTitle: item.title,
      });
    });
  }
  console.log(response);
  return response;
};


module.exports = RSSFeedHelper;
