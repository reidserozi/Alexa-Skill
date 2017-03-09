var CASENUMBERLENGTH = 8 //the current number of digits in a case number to add leading zeros
var RECYCLEYELLOWSTART = '2017-01-01';
var RECYCLEBLUESTART = '2017-01-08';

function HelperClass() { }

//date formating functions to make a response sound better for alexa
HelperClass.prototype.formatDate = function(date){
  return date.toString().slice(0,date.toString().search(/\s20\d{2}/));
}

HelperClass.prototype.formatDateTime = function (dateTime){
  var timeStr = this.formatTimeString(dateTime)
	var tmpString = dateTime.toString()
	var i = tmpString.search(/20\d{2}/);
	return tmpString.slice(0,i).trim() + ' at ' + timeStr.trim();
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

HelperClass.prototype.addLeadZeros =  function(caseNumber){
  var filler = '0';
  var results = filler.repeat(CASENUMBERLENGTH - caseNumber.length).concat(caseNumber);
  return results.valueOf();
}

module.exports = HelperClass;
