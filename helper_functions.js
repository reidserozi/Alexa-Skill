var promise = require('bluebird');
var RECYCLEYELLOWSTART = '2017-01-01';
var RECYCLEBLUESTART = '2017-01-08';
var TRASHCASES = {'trash': 'trash', 'garbage': 'trash', 'rubbish': 'trash', 'waste': 'trash'};
var LEAFCASES = {'leaf': 'leaf', 'leaves': 'leaf'};
var CASESUBJECTPAIRINGS = {'yard waste': 'collection', 'oil': 'collection', 'cardboard': 'collection', 'leaf': 'collection', 'trash': 'missed', 'recycling': 'missed'};

function HelperClass() { }

//date formating functions to make a response sound better for alexa
HelperClass.prototype.formatDate = function(date){
  var i = date.toString().search(/20\d{2}/);
  console.log(date);
  console.log(i);
  if(i > 0){
    return date.toString().slice(0,i).trim();
  }
  return date;
}

HelperClass.prototype.formatDateTime = function (dateTime){
  console.log(dateTime);
  if(dateTime != null && dateTime != undefined){
    return this.formatDate(dateTime) + ' at ' +  this.formatTimeString(dateTime);
  } else {
    return null;
  }
}

HelperClass.prototype.formatTimeString = function(date) {
  if ((typeof(date)!=='object') || (date.constructor!==Date)) {
    throw new Error('argument must be a Date object');
  }
  function pad(s) { return ((''+s).length < 2 ? '0' : '') + s; }
  function fixHour(h) { return (h==0?'12':(h>12?h-12:h)); }
  var offset = new Date().getTimezoneOffset();
  if(date.getTimezoneOffset() == 0){
    //date.setMinutes(date.getMinutes() - 300);
  }
  var h=date.getHours(), m=date.getMinutes(), s=date.getSeconds()
    , timeStr=[pad(fixHour(h)), pad(m), pad(s)].join(':');
  return timeStr + ' ' + (h < 12 ? 'AM' : 'PM');
}

HelperClass.prototype.formatAddress = function (fullAddress){
  var sliceIndex = fullAddress.toUpperCase().search('CARY') || fullAddress.toUpperCase().search('APEX') || fullAddress.toUpperCase().search('MORRISVILLE');
	return fullAddress.slice(0,sliceIndex - 1).trim();
}

HelperClass.prototype.getRecycleDay = function(cycle, trashDay){
  var diff;
  if(cycle == 'BLUE'){
    diff = Date.DateDiff('d', RECYCLEBLUESTART, Date.today()) % 14;
  } else {
    diff = Date.DateDiff('d', RECYCLEYELLOWSTART, Date.today()) % 14;
  }
  if(diff < 7 && Date.parse(trashDay).compareTo(Date.today()) == 0){
    return this.formatDate(Date.parse(Date.today()));
  } else if((diff < 7 && (Date.parse(trashDay).compareTo(Date.today()) <= -1) || (diff >= 7 && Date.parse(trashDay).compareTo(Date.today()) >= 1))){
    return this.formatDate(Date.parse('next ' + trashDay).next().week());
  } else{
    return this.formatDate(Date.parse('next ' + trashDay));
  }
}

HelperClass.prototype.getCircleCoords = function(x,y,d){
  var tao = 2 * Math.PI;
  var results = [];
  var pointsInCircle = 8
  //convert lat and long to radians
  x = x * (Math.PI / 180);
  y = y * (Math.PI / 180);
  for(var i = 0;i <= pointsInCircle; i ++){
    var lat = Math.asin(Math.sin(y) * Math.cos(d) + Math.cos(y) * Math.sin(d) * Math.cos((i/pointsInCircle)*tao));
    var long = ((x + Math.asin(Math.sin((i/pointsInCircle)*tao) * Math.sin(d) / Math.cos(lat)) + Math.PI) % (tao)) - Math.PI;
    results.push("[" + (long / (Math.PI/180)).toString() + "," + (lat / (Math.PI/180)).toString() + "]");
  }
  return results;
}

HelperClass.prototype.addLeadZeros =  function(caseNumber, caseNumberLength){
  var filler = '0';
  var results = filler.repeat(caseNumberLength - caseNumber.length).concat(caseNumber);
  return results.valueOf();
}

HelperClass.prototype.formatCaseSubject = function(caseSubject){
  var tempSubject = TRASHCASES[caseSubject] || LEAFCASES[caseSubject];
  if(tempSubject === undefined){
    return caseSubject;
  } else {
    return tempSubject;
  }
}

HelperClass.prototype.addCaseAction = function(caseSubject){
  return CASESUBJECTPAIRINGS[caseSubject];
}

HelperClass.prototype.addFieldResults = promise.method(function(body, results){
  var lines = body.toString().split("\n");
  for(var i = 1; i < lines.length; i++){
    var fieldInfo = lines[i].split("\t");
    if(fieldInfo.length > 1){
      if(results[fieldInfo[0]] === undefined){
        results[fieldInfo[0]] = {open: [], closed: []};
      }
      if(fieldInfo[2].toString().match(/(cancel|close)/i) === null){
        results[fieldInfo[0]].open.push(fieldInfo[1]);
      } else {
        results[fieldInfo[0]].closed.push(fieldInfo[1]);
      }
    }
  }
  return results;
});

module.exports = HelperClass;
