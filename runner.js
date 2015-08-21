#!/usr/bin/env node

'use strict';

var fs = require('fs');
var JSONStream = require('jsonstream');

var oldWay = require('./1-old-way.js');
oldWay._name = 'old';

var newWay = require('./2-new-way.js');
newWay._name = 'new';

var paginatedWay = require('./3-paginated-way.js');
paginatedWay._name = 'paginated';

var fnLookup = {
  old: oldWay,
  new: newWay,
  paginated: paginatedWay
};

var startTime = Date.now();
var BASE_MEMORY = getMemory();

var fnName = process.argv.splice(2)[0];
console.log('Starting', fnName);

fnLookup[fnName]({ uri: 'http://localhost:8001' }, logMemoryUsage)
  .on('error', function(err) { throw err; })
  .pipe(JSONStream.stringify())
  .pipe(fs.createWriteStream('_'))
  .on('finish', function() {
    console.log(fnName, 'completed in', (Date.now() - startTime) / 1000, 'seconds');
  });

function getMemory() {
  return Math.round(process.memoryUsage().heapUsed / 1000000);
}

function logMemoryUsage() {
  console.log(getMemory() - BASE_MEMORY + ' mb');
}
