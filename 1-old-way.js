'use strict';

var request = require('request');
var through = require('through2');

var helpers = require('./helpers.js');
var MAX_RUNS = helpers.cfg.runs;
var runCount = 0;

function makeRequest(reqOpts, onRequest) {
  var stream = through.obj();
  req(reqOpts);
  return stream;

  function req(reqOpts) {
    onRequest();

    request(reqOpts, function(err, resp, body) {
      body = JSON.parse(body);

      var pageToken = body.nextPageToken;
      body.items.map(helpers.toFileObject).forEach(stream.push.bind(stream));

      if (pageToken && runCount++ < MAX_RUNS) {
        reqOpts.qs = reqOpts.qs || {};
        reqOpts.qs.pageToken = pageToken;
        req(reqOpts);
        return;
      }

      stream.push(null);
    });
  }
}

module.exports = makeRequest;
