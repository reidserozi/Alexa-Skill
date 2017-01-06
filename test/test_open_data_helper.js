'use strict';
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var FAADataHelper = require('../open_data_helper');
chai.config.includeStack = true;

describe('OpenDataHelper', function() {
  var subject = new OpenDataHelper();
});
