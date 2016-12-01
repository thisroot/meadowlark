const mongoose = require('mongoose');
const env = require('../environment');
const credentials = require('../credentials');

// Mongoose options
const opts = {
  server: {
    serverOptions: {keepAlive: 1}
  }
};

mongoose.connect(credentials.mongo[env], opts);


