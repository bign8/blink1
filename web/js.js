$(document).ready(function() {
	
	var socket = io.connect('http://localhost'),
		sourceLinks = $('#sourceLinks');
		
	socket.on('buildList', function (data) {
		sourceLinks.empty();
		console.log(data);
		for (var prop in data) {
			var source = data[prop], link, sourceItem;
			sourceLinks.append('<li id="'+source.slug+'"><b>'+source.name+'</b><ul></ul></li>');
			sourceItem = sourceLinks.find('ul', '#' + source.slug);
			
			for (var i=0,l=source.link.length; i<l; i++) {
				link = source.link[i];
				sourceItem.append('<li id="'+link.slug+'"><a href="'+link.link+'">'+link.title+'</a></li>');
			}
		}
	});
	
	socket.on('setActive', function(activeObj) {
		$('#'+activeObj.slug)[ ((activeObj.active)?'addClass':'removeClass') ]('activeSource');
	});
	
	
	// Facebook stuff - can be moved to a module thing?
	socket.on('facebook', function(data) {
		console.log('facebook');
		console.log(data);
	});
});

function startSource() {
	
}

function stopSource() {
	
}