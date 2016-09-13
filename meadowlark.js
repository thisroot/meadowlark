const express = require('express');
const fortune = require('./lib/fortune.js');

const app = express();

// set up handlebars view engine
const handlebars = require('express-handlebars')
	.create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

// Setup the static route for assets
app.use(express.static(__dirname + '/public'));

// Main site page
app.get('/', function(req, res){
  res.render('home');
});

// About page
app.get('/about', function(req, res){
  res.render('about', { fortune : fortune.getFortune() });
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