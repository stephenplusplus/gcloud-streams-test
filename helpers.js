'use strict';

var JSONStream = require('jsonstream');
var through = require('through2');

module.exports = {
  cfg: {
    runs: 10
  },

  toFileObject: function(fileMetadata) {
    var file = {
      name: fileMetadata.name,
      metadata: fileMetadata
    };

    return file;
  },

  parseJSONFromRequest: function(req, properties) {
    var stream = through();

    properties.forEach(function(property) {
      req.once('response', function(res) {
        res.pipe(JSONStream.parse(property))
          .on('data', stream.emit.bind(stream, property));
      });
    });

    return stream;
  }
};
