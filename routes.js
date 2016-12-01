const main = require('./handlers/main.js');
const	contest = require('./handlers/contest.js');
const	vacation = require('./handlers/vacation.js');
const	cart = require('./handlers/cart.js');
const	cartValidation = require('./lib/cartValidation.js');
const	contact = require('./handlers/contact.js');
const	samples = require('./handlers/sample.js');
const customerController = require('./controllers/customer.js');

const routes = require('express').Router();

// miscellaneous routes
routes.get('/', main.home);
routes.get('/about', main.about);
routes.get('/newsletter', main.newsletter);
routes.post('/newsletter', main.newsletterProcessPost);
routes.get('/newsletter/archive', main.newsletterArchive);
routes.get('/thank-you', main.genericThankYou);

// contest routes
routes.get('/contest/vacation-photo', contest.vacationPhoto);
routes.post('/contest/vacation-photo/:year/:month', contest.vacationPhotoProcessPost);
routes.get('/contest/vacation-photo/entries', contest.vacationPhotoEntries);

// vacation routes
routes.get('/vacations', vacation.list);
routes.get('/vacation/:vacation', vacation.detail);
routes.get('/notify-me-when-in-season', vacation.notifyWhenInSeason);
routes.post('/notify-me-when-in-season', vacation.notifyWhenInSeasonProcessPost);

// shopping cart routes
routes.get('/cart', cart.middleware, cartValidation.checkWaivers, cartValidation.checkGuestCounts, cart.home);
routes.get('/cart/add', cart.addProcessGet);
routes.post('/cart/add', cart.addProcessPost);
routes.get('/cart/checkout', cart.checkout);
routes.post('/cart/checkout', cart.checkoutProcessPost);
routes.get('/cart/thank-you', cart.thankYou);
routes.get('/email/cart/thank-you', cart.emailThankYou);
routes.get('/set-currency/:currency', cart.setCurrency);

// contact
routes.get('/request-group-rate', contact.requestGroupRate);
routes.post('/request-group-rate', contact.requestGroupRateProcessPost);
routes.get('/contact', contact.home);
routes.post('/contact', contact.homeProcessPost);

// testing/sample routes
routes.get('/jquery-test', samples.jqueryTest);
routes.get('/nursery-rhyme', samples.nurseryRhyme);
routes.get('/data/nursery-rhyme', samples.nurseryRhymeData);
routes.get('/epic-fail', samples.epicFail);

// customer routes
customerController.registerRoutes(routes);

routes.get('/unauthorized', function(req, res) {
	res.status(403).render('unauthorized');
});

// account routes
// authorization helpers
function customerOnly(req, res, next){
	if(req.user && req.user.role==='customer') return next();
	// we want customer-only pages to know they need to logon
	res.redirect(303, '/unauthorized');
}
function employeeOnly(req, res, next){
	if(req.user && req.user.role==='employee') return next();
	// we want employee-only authorization failures to be "hidden", to
	// prevent potential hackers from even knowhing that such a page exists
	next('route');
}
function allow(roles) {
	return function(req, res, next) {
		if(req.user && roles.split(',').indexOf(req.user.role)!==-1) return next();
		res.redirect(303, '/unauthorized');
	};
}

routes.get('/account', allow('customer,employee'), function(req, res){
	res.render('account', { username: req.user.name });
});
routes.get('/account/order-history', customerOnly, function(req, res){
	res.render('account/order-history');
});
routes.get('/account/email-prefs', customerOnly, function(req, res){
	res.render('account/email-prefs');
});

// employer routes
routes.get('/sales', employeeOnly, function(req, res){
	res.render('sales');
});


module.exports = routes;