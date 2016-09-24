const main = require('./handlers/main.js');
const	contest = require('./handlers/contest.js');
const	vacation = require('./handlers/vacation.js');
const	cart = require('./handlers/cart.js');
const	cartValidation = require('./lib/cartValidation.js');
const	contact = require('./handlers/contact.js');
const	samples = require('./handlers/sample.js');

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

module.exports = routes;