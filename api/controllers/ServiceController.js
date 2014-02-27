/**
 * ServiceController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {




	/**
	 * Overrides for the settings in `config/controllers.js`
	 * (specific to ServiceController)
	 */
	_config: {},

	/**
	###### Establish Session Cookie [GET][/api/v1/]

	Sets an authenticated session cookie if the client does not already have one,
	Existing valid sessions are reestablished.  Only necessary when you need to
	establish a socket connection.

	Making an empty JSONP call to this endpoint before establishing your socket
	connection is necessary for clients on 3rd party domains.  Otherwise session
	auth will fail, as the AS service will try to use a cookie of 'undefined'
	during authentication.

	The other purpose this empty endpoint serves is so we don't have to convert
	the other API calls to return JSONP, which has some security flaws
	that we don't want to expose.  We still need this endpoint to return JSONP,
	otherwise, the caller will throw a parse error.

	Example client call using jQuery:
		$.ajax({
			url: 'as.nationalgeographic.com/api/v1/',
			dataType: 'jsonp',
			complete: function() {
			// Establish socket connection
		}
	});

	Allows for 

	+ Response 200 (application/jsonp)

	+ Headers
		HTTP/1.1 200 OK
		X-Powered-By: Sails <sailsjs.org>
		Content-Type: text/javascript; charset=utf-8
		Content-Length: 93
		Date: Fri, 21 Feb 2014 15:33:42 GMT
		Connection: keep-alive


	+ Cookies
		sails.sid (HTTP only)

	+ Body

		{}

	**/
	setCookie: function(req, res) {
		res.jsonp({});
	},

	subscribe: function(req, res) {
		var id = [];
		id.push(req.param('user'));
		Activity.subscribe(req.socket);
		Activity.subscribe(req.socket, id);
		res.send(200);
	}
};