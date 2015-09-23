/**
 * Module Dependencies
 */

var config = require('config');
var log = require('debug')('democracyos:fullstory');

var FS = window.FS;

log('FullStory is %s by configuration', config.fullStoryTrackingId ? 'enabled' : 'disabled');
log('Script render %s', FS ? 'successful' : 'failed');

module.exports = FS || { identify: noop };

module.exports.enabled = function() {
  return !!(config.fullStoryTrackingId && FS);
};

function noop() {};