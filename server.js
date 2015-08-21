'use strict';

var app = require('express')();
var apiResponse = JSON.stringify(require('./buckets.json'));

app.get('/', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', apiResponse.length);

  setTimeout(function() {
    res.end(apiResponse);
  }, 1000);
});

app.listen(8001);
