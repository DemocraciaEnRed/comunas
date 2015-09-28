/**
 * Module dependencies.
 */

var citizen = require('citizen');
var request = require('request');
var Stateful = require('stateful');
var log = require('debug')('democracyos:keywords-proto');

/**
 * Expose `Keywords` proto constructor
 */

module.exports = Keywords;

/**
 * Keywords collection constructor
 */

function Keywords() {
  if (!(this instanceof Keywords)) {
    return new Keywords();
  };

  // instance bindings
  this.middleware = this.middleware.bind(this);
  this.fetch = this.fetch.bind(this);

  this.state('initializing');

  // Re-fetch keywords on citizen sign-in
  citizen.on('loaded', this.fetch);

  this.fetch();
}

/**
 * Mixin Keywords prototype with Emitter
 */

// Emitter(Keywords.prototype);
Stateful(Keywords);

/**
 * Fetch `keywords` from source
 *
 * @param {String} src
 * @api public
 */

Keywords.prototype.fetch = function(src) {
  log('request in process');
  src = src || '/api/keyword/all';

  this.state('loading');

  request
  .get(src)
  .end(onresponse.bind(this));

  function onresponse(err, res) {
    if (err || !res.ok) {
      var message = 'Unable to load keywords. Please try reloading the page. Thanks!';
      return this.error(message);
    };

    this.set(res.body);
  }
}

/**
 * Set items to `v`
 *
 * @param {Array} v
 * @return {Keywords} Instance of `Keywords`
 * @api public
 */

Keywords.prototype.set = function(v) {
  this.items = v;
  this.state('loaded');
  return this;
}

/**
 * Get current `items`
 *
 * @return {Array} Current `items`
 * @api public
 */

Keywords.prototype.get = function(index) {
  if ('undefined' !== typeof index) return this.items[index];
  return this.items;
}

/**
 * Middleware for `page.js` like
 * routers
 *
 * @param {Object} ctx
 * @param {Function} next
 * @api public
 */

Keywords.prototype.middleware = function(ctx, next) {
  this.ready(next);
}

/**
 * Handle errors
 *
 * @param {String} error
 * @return {Keywords} Instance of `Keywords`
 * @api public
 */

Keywords.prototype.error = function(message) {
  // TODO: We should use `Error`s instead of
  // `Strings` to handle errors...
  // Ref: http://www.devthought.com/2011/12/22/a-string-is-not-an-error/
  this.state('error', message);
  log('error found: %s', message);

  // Unregister all `ready` listeners
  this.off('ready');
  return this;
}