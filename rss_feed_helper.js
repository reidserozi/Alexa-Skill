var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed
var options = '';
var req = request('http://www.townofcary.org/Home/Components/RssFeeds/RssFeed/View?ctID=5&cateIDs=1%2c2%2c3%2c4%2c5%2c6%2c10%2c11%2c12%2c13%2c14%2c15%2c16%2c17%2c18%2c19%2c20%2c21%2c22%2c53%2c54%2c55%2c59%2c64')
var feedparser = new FeedParser([options]);

req.on('error', function (error) {
  // handle any request errors
});

req.on('response', function (res) {
  var stream = this; // `this` is `req`, which is a stream

  if (res.statusCode !== 200) {
    this.emit('error', new Error('Bad status code'));
  }
  else {
    stream.pipe(feedparser);
  }
});

feedparser.on('error', function (error) {
  // always handle errors
});

feedparser.on('readable', function () {
  var stream = this;
  var meta = this.meta;
  var item;

  while (item = stream.read()) {
    console.log(item);

  }
});
