module.exports = {
	bundles: {
		clientJavaScript: {
			main: {
				file: '/js.min/meadowlark.min.ae9d1cf6.js',
				location: 'beforeBodyClose',
				contents: [
					'/js/contact.js',
					'/js/cart.js',
				]
			}
		},
		clientCss: {
			main: {
				file: '/css/meadowlark.min.631cdaf7.css',
				contents: [
					'/css/main.css',
					'/css/cart.css',
				]
			}
		},
	},
};