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
  // return this.requestRSSFeed().then(function(response) {
  //   return "The latest Town of Cary News item: " + response[0].title
  // }).catch( (error) => {
  //   console.log('error: ', error);
  // });

  // need to have "That latest Cary news: ${response}"
  var response = '';
  return this.requestRSSFeed().then(function(feedData) {
    response = 'The latest Town of Cary News today: '
    feedData.forEach(function(item) {
      console.log(item.title);
      response += _.template("${rssTitle}. ")({
        rssTitle: item.title,
      });
    });
    return response;
  });
};


module.exports = RSSFeedHelper;
