/**
 * Title : Facebook module
 * Author : Nathan J. Woods (http://nathanjwoods.com)
 * Date   : December 2012 - _______
 * Notes  :
 *    Must create Facebook app with specific callback setting that match localhost:8080
 */

var Source = require('../source');

var request = require('https').request;

var facebook = Object.create(Source.prototype);
facebook.name = 'Facebook Notifications';
facebook.slug = 'facebook';
facebook.interval = 10000; // ms (depends on access options)

facebook.blink.r = 59;
facebook.blink.g = 89;
facebook.blink.b = 152;

facebook.links.push({
	title:'Authorize',
	slug:'auth',
	link:'https://www.facebook.com/dialog/oauth?client_id=409264142485014&redirect_uri=http://localhost:8080/return?ref=facebook&state='+Math.floor(Math.random()*1e10)
});

facebook.access_token = undefined;

// workikng authentication string - https://www.facebook.com/dialog/oauth?client_id=409264142485014&redirect_uri=http://localhost:8080/return?data=test&state=somethingunique
// send a request to https://graph.facebook.com/oauth/access_token?client_id=YOUR_APP_ID&redirect_uri=YOUR_REDIRECT_URI&client_secret=YOUR_APP_SECRET&code=CODE_GENERATED_BY_FACEBOOK

// call back for web authentication
facebook.passReturnData = function(args, resp) {
	request({
		hostname: 'graph.facebook.com',
		path: ('/oauth/access_token?client_id='+this.config.appID+'&redirect_uri=http://localhost:8080/return?ref=facebook&client_secret='+this.config.appSecret+'&code='+args.code)
	}, function(response) {
		var str = '';
		response.on('data', function (chunk) { str += chunk; }); // build data as it comes

		response.on('end', function () { // final processing
			
			try {
				var error = JSON.parse(str);
				console.log(error);
				resp.end('Error Authenticating : '+ error.error.message);
			} catch(e) {
				var queryString = {};
				str.replace(
					new RegExp("([^?=&]+)(=([^&]*))?", "g"),
					function($0, $1, $2, $3) { queryString[$1] = $3; }
				);
				
				facebook.access_token = queryString.access_token;
				
				resp.end('Authenticated');
			}
		});
	}).end();
	
	for(var i=0; i<1024; i++) { resp.write(' '); }// clear buffer for active writing
	resp.write('Authenticating.');
	var interval = setInterval(function() {
		resp.write('.');
	}, 100);
}

// do online data check here
facebook.run = function() {
	if (this.access_token === undefined) { return; }

	request({
		host: 'graph.facebook.com',
		path: '/me/notifications?access_token='+this.access_token
	}, function(response) {
		var str = '';
		response.on('data', function (chunk) { str += chunk; }); // build data as it comes

		response.on('end', function () { // final processing
			try {
				var data = JSON.parse(str);
				
				if (data.error) { // error in access_key?
					// try to get new access key?
					console.log('Facebook Data Error');
					facebook.setActive(false);
				} else {
					facebook.setActive(data.summary.unseen_count > 0);
					facebook.blink.n = data.summary.unseen_count;
				}
			} catch (e) {
				facebook.setActive(false);
				console.log('Facebook Parse Error');
				if (facebook.config.debug) {
					console.log(data);
				}
			}
		});
	}).end();
};

module.exports = facebook;