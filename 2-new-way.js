'use strict';

var duplexify = require('duplexify');
var JSONStream = require('jsonstream');
var pumpify = require('pumpify');
var request = require('request');
var through = require('through2');

var helpers = require('./helpers.js');
var MAX_RUNS = helpers.cfg.runs;
var runCount = 0;

function makeRequest(reqOpts, onRequest) {
  var dup = duplexify.obj();

  onRequest();

  var req = request(reqOpts);

  var toFileStream = JSONStream.parse('items.*', helpers.toFileObject);

  var nextPageToken;
  var paginateStream = through.obj();
  paginateStream._flush = function (callback) {
    if (nextPageToken && runCount++ < MAX_RUNS) {
      reqOpts.qs = reqOpts.qs || {};
      reqOpts.qs.pageToken = nextPageToken;
      dup.setReadable(makeRequest(reqOpts, onRequest));
    } else {
      callback();
    }
  };

  var pipe = pumpify.obj(req, toFileStream, paginateStream);
  dup.setReadable(pipe);

  helpers.parseJSONFromRequest(req, ['error.errors.*', 'nextPageToken'])
    .once('error.errors.*', function(err) {
      pipe.destroy(err);
    })
    .once('nextPageToken', function(token) {
      nextPageToken = token;
    });

  return dup;
}

module.exports = makeRequest;