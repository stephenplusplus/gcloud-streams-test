'use strict';

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
  }
};
