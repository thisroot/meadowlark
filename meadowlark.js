// Connect to Mongo via Mongoose...
require('./db/connect.js');

// Seed the collections if necessary...
require('./db/seed.js');

const http = require('http');
const express = require('express');
const fortune = require('./lib/fortune.js');
const formidable = require('formidable');
const fs = require('fs');
const routes = require('./routes');

const app = express();

const credentials = require('./credentials.js');

// set up handlebars view engine
const handlebars = require('express-handlebars').create({
  defaultLayout: 'main',
  helpers: {
    section: function (name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    }
  }
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

// use domains for better error handling
app.use(function (req, res, next) {
  // create a domain for this request
  var domain = require('domain').create();
  // handle errors on this domain
  domain.on('error', function (err) {
    console.error('DOMAIN ERROR CAUGHT\n', err.stack);
    try {
      // failsafe shutdown in 5 seconds
      setTimeout(function () {
        console.error('Failsafe shutdown.');
        process.exit(1);
      }, 5000);

      // disconnect from the cluster
      var worker = require('cluster').worker;
      if (worker) worker.disconnect();

      // stop taking new requests
      server.close();

      try {
        // attempt to use Express error route
        next(err);
      } catch (error) {
        // if Express error route failed, try
        // plain Node response
        console.error('Express error mechanism failed.\n', error.stack);
        res.statusCode = 500;
        res.setHeader('content-type', 'text/plain');
        res.end('Server error.');
      }
    } catch (error) {
      console.error('Unable to send 500 response.\n', error.stack);
    }
  });

  // add the request and response objects to the domain
  domain.add(req);
  domain.add(res);

  // execute the rest of the request chain in the domain
  domain.run(next);
});

// logging
switch (app.get('env')) {
  case 'development':
    // compact, colorful dev logging
    app.use(require('morgan')('dev'));
    break;
  case 'production':
    // module 'express-logger' supports daily log rotation
    app.use(require('express-logger')({
      path: __dirname + '/log/requests.log'
    }));
    break;
}

app.use(require('cookie-parser')(credentials.cookieSecret));

// Instantiate new Mongo store for the session & reuse Mongoose DB connection 
// Create a Mongo store to manage sessions
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: credentials.cookieSecret,
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  })
}));

app.use(express.static(__dirname + '/public'));
app.use(require('body-parser')());

// flash message middleware
app.use(function (req, res, next) {
  // if there's a flash message, transfer
  // it to the context, then clear it
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

// set 'showTests' context property if the querystring contains test=1
app.use(function (req, res, next) {
  res.locals.showTests = app.get('env') !== 'production' &&
    req.query.test === '1';
  next();
});

// mocked weather data
function getWeatherData() {
  return {
    locations: [{
      name: 'Portland',
      forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
      iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
      weather: 'Overcast',
      temp: '54.1 F (12.3 C)',
    }, {
      name: 'Bend',
      forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
      iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
      weather: 'Partly Cloudy',
      temp: '55.0 F (12.8 C)',
    }, {
      name: 'Manzanita',
      forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
      iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
      weather: 'Light Rain',
      temp: '55.0 F (12.8 C)',
    }, ],
  };
}

// middleware to add weather data to context
app.use(function (req, res, next) {
  if (!res.locals.partials) res.locals.partials = {};
  res.locals.partials.weatherContext = getWeatherData();
  next();
});

// create "admin" subdomain...this should appear
// before all your other routes
var admin = express.Router();
app.use(require('vhost')('admin.*', admin));

// create admin routes; these can be defined anywhere
admin.get('/', function (req, res) {
  res.render('admin/home');
});
admin.get('/users', function (req, res) {
  res.render('admin/users');
});

// add routes
app.use('/', routes);

// add support for auto views
var autoViews = {};

app.use(function (req, res, next) {
  var path = req.path.toLowerCase();
  // check cache; if it's there, render the view
  if (autoViews[path]) return res.render(autoViews[path]);
  // if it's not in the cache, see if there's
  // a .handlebars file that matches
  if (fs.existsSync(__dirname + '/views' + path + '.handlebars')) {
    autoViews[path] = path.replace(/^\//, '');
    return res.render(autoViews[path]);
  }
  // no view found; pass on to 404 handler
  next();
});

// 404 catch-all handler (middleware)
app.use(function (req, res, next) {
  res.status(404);
  res.render('404');
});

// 500 error handler (middleware)
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

var server;

function startServer() {
  server = http.createServer(app).listen(app.get('port'), function () {
    console.log('Express started in ' + app.get('env') +
      ' mode on http://localhost:' + app.get('port') +
      '; press Ctrl-C to terminate.');
  });
}

if (require.main === module) {
  // application run directly; start app server
  startServer();
} else {
  // application imported as a module via "require": export function to create server
  module.exports = startServer;
}