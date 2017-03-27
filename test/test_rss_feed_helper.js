'use strict';
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var EventDataHelper = require('../event_data_helper');

describe('EventDataHelper', function() {
  var today;
  var subject = new EventDataHelper();
  var uri = ''
