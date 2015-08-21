'use strict';

module.exports = {
  cfg: {
    runs: 3
  },

  toFileObject: function(fileMetadata) {
    var file = {
      name: fileMetadata.name,
      metadata: fileMetadata
    };

    return file;
  }
};
