const express = require('express');
const fortune = require('./lib/fortune.js');

const app = express();

// set up handlebars view engine
const handlebars = require('express-handlebars').create({
    defaultLayout: 'main',
    helpers: {
        section: function (name, options) {
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            
            return null;
        }
    }
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

// Flag pass in query param to turn on tests
app.use( function (req, res, next){
  res.locals.showTests = app.get('env') !== 'production' &&
    req.query.test === '1';
    next();
});

// Setup the static route for assets
app.use(express.static(__dirname + '/public'));

// Setup body-parser package
app.use(require('body-parser')());

// mocked weather data
function getWeatherData(){
    return {
        locations: [
            {
                name: 'Portland',
                forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
                weather: 'Overcast',
                temp: '54.1 F (12.3 C)',
            },
            {
                name: 'Bend',
                forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
                weather: 'Partly Cloudy',
                temp: '55.0 F (12.8 C)',
            },
            {
                name: 'Manzanita',
                forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
                weather: 'Light Rain',
                temp: '55.0 F (12.8 C)',
            },
        ],
    };
}

// middleware to add weather data to context
app.use(function (req, res, next) {
    if(!res.locals.partials) res.locals.partials = {};
     res.locals.partials.weatherContext = getWeatherData();
     next();
});

// Main site page
app.get('/', function (req, res) {
  res.render('home');
});

// About page
app.get('/about', function (req, res) {
  res.render('about', {fortune: fortune.getFortune(),
                        pageTestScript: '/qa/tests-about.js'});
});

// Hood River Tour page
app.get('/tours/hood-river', function (req, res) {
  res.render('tours/hood-river');
});

// Request Quote page
app.get('/tours/request-group-rate', function (req, res) {
  res.render('tours/request-group-rate');
});

// Newsletter form page
app.get('/newsletter', function (req, res) {
  res.render('newsletter', {csrf: 'CSRF token goes here'});
});

// Post from Newsletter form page
app.post('/process', function (req, res) {
    if(req.xhr || req.accepts('json,html') === 'json') {
        res.send({success: true});
    } else {
        res.redirect(303, '/thank-you')
    }
});

// Newsletter form page
app.get('/thank-you', function (req, res) {
  res.send('Thanks');
});

// Begin Demo routes
app.post('/tours/process-group-rate', function (req, res) {
  // console.log(req.body.name + ', ' + req.body.groupSize + ', ' + req.body.email);
  console.log(req.body);
  res.render('tours/process-group-rate');
});

app.get('/jquery-test', function (req, res) {
    res.render('jquery-test');
});

app.get('/nursery-rhyme', function (req, res) {
    res.render('nursery-rhyme');
});


// custom 404 page
app.use(function (req, res) {
  res.status(404);
  res.render('404');
});

// custom 500 page
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function () {
  console.log('Express started on http://localhost:' + 
    app.get('port') + '; press Ctrl-C to terminate.');
});