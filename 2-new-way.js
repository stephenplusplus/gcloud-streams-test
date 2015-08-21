'use strict';

var duplexify = require('duplexify');
var JSONStream = require('jsonstream');
var pluck = require('pluck-stream');
var pumpify = require('pumpify');
var request = require('request');
var through = require('through2');

var helpers = require('./helpers.js');
var MAX_RUNS = helpers.cfg.runs;
var runCount = 0;

function makeRequest(reqOpts, onRequest) {
  onRequest();

  var dup = duplexify.obj();
  var req = request(reqOpts);
  var toFileStream = JSONStream.parse('items.*', helpers.toFileObject);
  var paginateStream = through.obj();

  var pipe = pumpify.obj(req, toFileStream, paginateStream);
  dup.setReadable(pipe);

  var nextPageToken;
  paginateStream._flush = function (callback) {
    if (nextPageToken && runCount++ < MAX_RUNS) {
      reqOpts.qs = reqOpts.qs || {};
      reqOpts.qs.pageToken = nextPageToken;
      dup.setReadable(makeRequest(reqOpts, onRequest));
    } else {
      callback();
    }
  };

  req.once('response', function(res) {
    pluck(res, ['error.errors.*', 'nextPageToken'])
      .once('error.errors.*', function(err) {
        pipe.destroy(err);
      })
      .once('nextPageToken', function(token) {
        nextPageToken = token;
      });
  });

  return dup;
}

module.exports = makeRequest;