const express = require('express');
const fortune = require('./lib/fortune.js');

const app = express();

// set up handlebars view engine
const handlebars = require('express-handlebars')
	.create({defaultLayout: 'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

// Flag pass in query param to turn on tests
app.use(function(req, res, next){
  res.locals.showTests = app.get('env') !== 'production' &&
    req.query.test === '1';
    next();
});

// Setup the static route for assets
app.use(express.static(__dirname + '/public'));

// Main site page
app.get('/', function(req, res){
  res.render('home');
});

// About page
app.get('/about', function(req, res){
  res.render('about', {fortune: fortune.getFortune(),
                        pageTestScript: '/qa/tests-about.js'});
});

// Hood River Tour page
app.get('/tours/hood-river', function(req, res){
  res.render('tours/hood-river');
});

// Request Quote page
app.get('/tours/request-group-rate', function(req, res){
  res.render('tours/request-group-rate');
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

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + 
    app.get('port') + '; press Ctrl-C to terminate.');
});