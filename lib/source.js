 var path = require('path'),
	fs = require('fs');

var Source = function() {};

Source.prototype = {
	interval: 500, // ms
	name: 'Default',
	slug: 'default',
	active: false,
	links: [
		{title:'Enable', slug:'ena', link:'#'},
		{title:'Disable', slug:'dna', link:'#'}
	],
	config: {
		debug: false
	},
	blink: {
		r: '255',	// red
		g: '255',	// green
		b: '255',	// blue
		n: '2',		// iterations
		m: '300',	// fade time
		t: '500',	// duration
		id: 'all'	// device id
	},
	
	start: function() {
		this.job = setInterval(this.run.bind(this), this.interval);
	},
	
	// Override - with each function
	run: function() { },
	
	// never called
	stop: function() {
		clearInterval(this.job);
		this.setActive(false);
	},

	// Override if the source needs to check if it can load.
	load: function(callback) {
		callback(null);
	},
	
	// Call when setting active
	setActive: function(isActive) {
		if (this.active == isActive) { return; }
		this.emit('active', this.slug, isActive);
		this.active = isActive;
		if (this.config.debug) console.log(this.name + ': ' + (isActive?'true':'false'));
	},
	
	// Pass Module Configuration
	passConfig: function(conf) {
		this.config = conf;
	},
	
	// Override - for passing data back from web interface functions
	passReturnData: function(data, response) {
		response.end('<a href="http://www.youtube.com/watch?v=Qw9oX-kZ_9k">Whatcha talkin\' bout Willis</a><br/><a href="/">Administration Home</a>');
	},
	
	// Called to register function in list of sources
	register: function() {
		for (source in Source.all) {
			if (this == Source.all[source]) { return; }
		}
		console.log("Loaded source: " + this.name);

		Source.all.push(this);
		Source.allObj[this.slug] = this;
	}
};

// Inherit from EventEmitter
var events = Object.create(require('events').EventEmitter.prototype);
for(var o in events) { Source.prototype[o] = events[o]; }

Source.all = [];
Source.allObj = {};

Source.loadSources = function(callback) {
	Source.availableMetricPaths(function(path) {
		var source = require(path);
		source.load(function(err) {
			if (err) {
				console.log(err);
			} else {
				source.register();
				if (callback) { callback(source); }
			}
		});
	});
};

Source.availableMetricPaths = function(callback) {
	var files = fs.readdirSync(path.join(__dirname, 'sources'));

	for(var i = 0, filename; i < files.length; i++) {
		filename = files[i].replace(/\.(js)$/, '');
		callback(path.join(__dirname, 'sources', filename));
	}
};

Source.buildAdminList = function() {
	var buildList = [], source;
	for (var i=0,l=Source.all.length; i<l; i++) {
		source = Source.all[i];
		buildList.push({
			'name' : source.name,
			'slug' : source.slug,
			'link' : source.links
		});
	}
	return buildList;
};
/*
Source.insert = function(req) {
	for(var i = 0, l = Source.all.length; i < l; i++) {
		var source = Source.all[i];
		if(source.increment) {
			source.increment(req);
		}
	}
};//*/

module.exports = Source;