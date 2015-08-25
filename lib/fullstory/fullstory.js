var config = require('config');
var log = require('debug')('democracyos:fullstory');

log('FullStory is %s by configuration', config.fullStoryTrackingId ? 'enabled' : 'disabled');
log('Script render %s', FS ? 'successful' : 'failed');

module.exports = FS || {};

module.exports.enabled = function() {
  return !!(config.fullStoryTrackingId && FS);
};
