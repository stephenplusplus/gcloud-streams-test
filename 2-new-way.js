'use strict';

var continueStream = require('continue-stream');
var JSONStream = require('jsonstream');
var pluck = require('pluck-stream');
var pumpify = require('pumpify');
var request = require('request');

var helpers = require('./helpers.js');
var MAX_RUNS = helpers.cfg.runs;

function makeRequest(reqOpts, onRequest) {
  var runCount = 0;
  var nextPageToken;

  return continueStream.obj(req);

  function req(callback) {
    runCount++;

    if (runCount > 1 && !nextPageToken) {
      callback();
      return;
    }

    onRequest();

    if (nextPageToken) {
      reqOpts.qs = reqOpts.qs || {};
      reqOpts.qs.pageToken = nextPageToken;
      nextPageToken = '';
    }

    var requestStream = request(reqOpts);
    var toFileStream = JSONStream.parse('items.*', helpers.toFileObject);
    var pipe = pumpify.obj(requestStream, toFileStream);

    requestStream.once('response', function(res) {
      pluck(res, ['error.errors.*', 'nextPageToken'])
        .once('error.errors.*', function(err) {
          pipe.destroy(err);
        })
        .once('nextPageToken', function(token) {
          if (runCount < MAX_RUNS) {
            nextPageToken = token;
          }
        });
    });

    callback(null, pipe);
  }
}

module.exports = makeRequest;