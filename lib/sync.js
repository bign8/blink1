/** 
 * special thanks to: https://github.com/caolan/async
 * Didn't need the entire library, so I grabbed what I needed
 */

var sync;

sync = function (arr, iterator, callback) {
	callback = callback || function () {};
	if (!arr.length) {
		return callback();
	}
	var completed = 0, iterate = function () {
		iterator(arr[completed], function (err) {
			if (err) {
				callback(err);
				callback = function () {};
			} else {
				completed += 1;
				if (completed === arr.length) {
					callback(null);
				} else {
					iterate();
				}
			}
		});
	};
	iterate();
};

module.exports = sync;