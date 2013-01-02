/** 
 * Title  : Blink(1) interface in Node.JS
 * Author : Nathan J. Woods (http://nathanjwoods.com)
 * Date   : December 2012 - _______
 * Notes  : 
 *    Be sure to set up configuration in ./config/config.js
 
		MAJOR RE-DESIGN NECESSARY
 
 */
var socketio = require('socket.io');
var url      = require('url');
var config   = require('./config/config');
var Blinker  = require('./lib/blinker');
var Source   = require('./lib/source');

// ----- Web interface! ----- 
// HTTP
var file = new (require('node-static').Server)('./web');
var server = require('http').createServer(function (request, response) {
	if (config.debug) console.log(" - " + request.url);
	var urlData = url.parse(request.url, true);
	
	// handle special pages
	switch (urlData.pathname) {
		
		// Hand data off to proper 'Source'
		case '/return': 
			if ( urlData.query.hasOwnProperty('ref') && Source.allObj.hasOwnProperty(urlData.query.ref) ) {
				Source.allObj[urlData.query.ref].passReturnData(urlData.query, response);
			} else {
				response.end('<a href="http://www.youtube.com/watch?v=Qw9oX-kZ_9k">Whatcha talkin\' bout Willis</a><br/><a href="/">Administration Home</a>');
			}
			break;
			
		// Serve Static Pages
		default:
			file.serve(request, response);
	}
}).listen(config.system_port, config.system_server);

// Socket
var io = socketio.listen(server);
io.set("log level", 2);
io.sockets.on('connection', function (socket) {
	socket.emit('buildList', Source.buildAdminList());
	
	socket.on('data', function(data) {
		console.log(data);
	});
});

// ----- Starting background processes ----- 
// Loading all sources
Source.loadSources(function(source) {
	// pass configurations
	if (config.hasOwnProperty('module-'+source.slug)) {
		source.passConfig(config['module-'+source.slug]);
	}
	// pass data to web interface
	source.on('data', function(slug, data) {
		io.sockets.volatile.emit(slug, data);
	});
	// pass active status to web interface
	source.on('active', function(slug, isActive) {
		io.sockets.volatile.emit('setActive', {'slug':slug, 'active': isActive});
	});
	// start source process
	source.start();
});

// Starting blink(1) loop
Blinker.start(config.delay);


