const mongoose = require('mongoose');
const credentials = require('./credentials.js');

// Mongoose options
const opts = {
  server: {
    serverOptions: {keepAlive: 1}
  }
};

mongoose.connect(credentials.mongo.development.connectionString, opts);

module.exports = mongoose;
