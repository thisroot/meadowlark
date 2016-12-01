var Customer = require('../models/customer.js');
var customerViewModel = require('../viewModels/customer.js');

module.exports = {

	registerRoutes: function(router) {
		router.get('/customer/register', this.register);
		router.post('/customer/register', this.processRegister);

		router.get('/customer/:id', this.home);
		router.get('/customer/:id/preferences', this.preferences);
		router.get('/orders/:id', this.orders);

		router.post('/customer/:id/update', this.ajaxUpdate);
	},

	register: function(req, res, next) {
		res.render('customer/register');
	},

	processRegister: function(req, res, next) {
		// TODO: back-end validation (safety)
		var c = new Customer({
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			address1: req.body.address1,
			address2: req.body.address2,
			city: req.body.city,
			state: req.body.state,
			zip: req.body.zip,
			phone: req.body.phone,
		});
		c.save(function(err) {
			if(err) return next(err);
			res.redirect(303, '/customer/' + c._id);
		});
	},

	home: function(req, res, next) {
		Customer.findById(req.params.id, function(err, customer) {
			if(err) return next(err);
			if(!customer) return next(); 	// pass this on to 404 handler
			customer.getOrders(function(err, orders) {
				if(err) return next(err);
				res.render('customer/home', customerViewModel(customer, orders));
			});
		});
	},

	preferences: function(req, res, next) {
		Customer.findById(req.params.id, function(err, customer) {
			if(err) return next(err);
			if(!customer) return next(); 	// pass this on to 404 handler
			customer.getOrders(function(err, orders) {
				if(err) return next(err);
				res.render('customer/preferences', customerViewModel(customer, orders));
			});
		});
	},

	orders: function(req, res, next) {
		Customer.findById(req.params.id, function(err, customer) {
			if(err) return next(err);
			if(!customer) return next(); 	// pass this on to 404 handler
			customer.getOrders(function(err, orders) {
				if(err) return next(err);
				res.render('customer/preferences', customerViewModel(customer, orders));
			});
		});
	},

	ajaxUpdate: function(req, res) {
		Customer.findById(req.params.id, function(err, customer) {
			if(err) return next(err);
			if(!customer) return next(); 	// pass this on to 404 handler
			if(req.body.firstName){
				if(typeof req.body.firstName !== 'string' ||
					req.body.firstName.trim() === '')
					return res.json({ error: 'Invalid name.'});
				customer.firstName = req.body.firstName;
			}
			// and so on....
			customer.save(function(err) {
				return err ? res.json({ error: 'Unable to update customer.' }) : res.json({ success: true });
			});
		});
	},
};