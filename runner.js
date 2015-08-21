#!/usr/bin/env node

'use strict';

var fs = require('fs');
var JSONStream = require('jsonstream');

var fnLookup = {
  old: require('./1-old-way.js'),
  new: require('./2-new-way.js')
};

var startTime = Date.now();
var BASE_MEMORY = getMemory();
var memoryUsage;

var fnName = process.argv.splice(2)[0];
console.log('Starting', fnName);

var resultsReceived = 0;

fnLookup[fnName]({ uri: 'http://localhost:8001' }, function() {}, logMemoryUsage)
  .on('error', function(err) { throw err; })
  .on('data', function() {
    resultsReceived++;
    if (memoryUsage !== (memoryUsage = getMemory())) {
      logMemoryUsage();
    }
  })
  .pipe(JSONStream.stringify())
  .pipe(fs.createWriteStream('_.json'))
  .on('finish', function() {
    console.log(fnName, 'completed in', (Date.now() - startTime) / 1000, 'seconds');
  });

function getMemory() {
  return Math.round(process.memoryUsage().heapUsed / 1000000);
}

function logMemoryUsage() {
  console.log(getMemory() - BASE_MEMORY + ' mb', resultsReceived, 'results handled');
}
