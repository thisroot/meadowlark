const mongoose = require('mongoose');
const env = require('../environment');
const config = require('./config');

// Mongoose options
const opts = {
  server: {
    serverOptions: {keepAlive: 1}
  }
};

mongoose.connect(config[env].url, opts);


