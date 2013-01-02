// see following for a pute js way to access device, no blink1-tool : https://github.com/sandeepmistry/node-blink1 

var sync = require('./sync');
var Source = require('./source');
var exec = require('child_process').exec;

var blinker = function(){};

// handle the blinking operation
blinker.iterator = function(value, callback) {
	if (value.active) {
		var s = value.blink;
		exec("blink1-tool --rgb "+s.r+","+s.g+","+s.b+" --blink "+s.n+" -m "+s.m+" -t "+s.t+" --id "+s.id, function(err) {
			callback(err);
		});
	} else {
		callback(null);
	}
};

blinker.start = function(delay) {

	// setup loop complete handler
	var handler = function(err) {
		if (err) {
			console.log('err');
			console.log(err);
		} else {
			this.timeout = setTimeout(function() {
				sync(Source.all, blinker.iterator, handler);
			}, delay);
		}
	};
	
	// start looping sequence
	sync(Source.all, this.iterator, handler);
};


module.exports = blinker;

/*
C:\Users\Nathan\blink1>blink1-tool
Usage:
  blink1-tool <cmd> [options]
where <cmd> is one of:
  --blink <numtimes>          Blink on/off (specify --rgb before to blink a color)
  --random <numtimes>         Flash a number of random colors
  --rgb <red>,<green>,<blue>  Fade to RGB value
  --on                        Turn blink(1) full-on white
  --red                       Turn blink(1) off
  --green                     Turn blink(1) red
  --blue                      Turn blink(1) green
  --off                       Turn blink(1) blue
  --savergb <r>,<g>,<b>,<pos> Write pattern RGB value at pos
  --readrgb <pos>             Read pattern RGB value at pos
  --play <1/0,pos>            Start playing color sequence (at pos)
  --servertickle <1/0>        Turn on/off servertickle (uses -t msec)
  --list                      List connected blink(1) devices
 Nerd functions: (not used normally)
  --hidread                   Read a blink(1) USB HID GetFeature report
  --hidwrite <listofbytes>    Write a blink(1) USB HID SetFeature report
  --eeread <addr>             Read an EEPROM byte from blink(1)
  --eewrite <addr>,<val>      Write an EEPROM byte to blink(1)
  --version                   Display blink(1) firmware version
and [options] are:
  -g -nogamma                 Disable autogamma correction
  -d dNums --id all|deviceIds Use these blink(1) ids (from --list)
  -m ms,   --millis=millis    Set millisecs for color fading (default 300)
  -t ms,   --delay=millis     Set millisecs between events (default 500)
  --vid=vid --pid=pid         Specifcy alternate USB VID & PID
  -v, --verbose               verbose debugging msgs

Examples
  blink1-tool -m 100 --rgb 255,0,255    # fade to #FF00FF in 0.1 seconds
  blink1-tool -t 2000 --random 100      # every 2 seconds new random color
  blink1-tool --rgb 0xff,0,00 --blink 3 # blink red 3 times

*/