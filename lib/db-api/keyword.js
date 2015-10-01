/**
 * Extend module's NODE_PATH
 * HACK: temporary solution
 */

require('node-path')(module);

/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Keyword = mongoose.model('Keyword');
var utils = require('lib/utils');
var pluck = utils.pluck;
var log = require('debug')('democracyos:db-api:keyword');

/**
 * Get all Keyword
 *
 * @param {Function} fn callback function
 *   - 'err' error found on query or `null`
 *   - 'keyword' list keywords found or `undefined`
 * @return {Module} `keyword` module
 * @api public
 */

exports.all = function all(fn) {
  log('Looking for all keywords')

  Keyword
  .find()
  .select('id name')
  .exec(function (err, keywords) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    };

    log('Delivering keywords %j', pluck(keywords, 'id'));
    fn(null, keywords);
  });

  return this;
};

/**
 * Get single keyword from ObjectId or HexString
 *
 * @param {Mixed} id ObjectId or HexString for Tag
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'keyword' single keyword object found or `undefined`
 * @return {Module} `keyword` module
 * @api public
 */

exports.get = function get (id, fn) {
  log('Looking for keyword %j', id)
  Keyword.findById(id, function (err, keyword) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    }

    log('Delivering keyword %j', keyword);
    fn(null, keyword)
  })

  return this;
};

/**
 * Creates Keyword
  *
 * @param {Object} data to create Keyword
  * @param {Function} fn callback function
 *   - 'err' error found on query or `null`
 *   - 'keyword' keyword created or `undefined`
 * @return {Module} `keyword` module
 * @api public
 */

exports.create = function create(data, fn) {
  log('Creating new keyword %j', data);


  var keyword = new Keyword(data);
  keyword.save(onsave);

  function onsave(err) {
    if (err) return log('Found error %s', err), fn(err);

    log('Saved keyword %s', keyword.id);
    fn(null, keyword);
  }

  return this;
};

/**
 * Update keyword by `id` and `data`
 *
 * @param {ObjectId|String} data to create Keyword
  * @param {Function} fn callback function
 *   - 'err' error found on query or `null`
 *   - 'keyword' item created or `undefined`
 * @return {Module} `keyword` module
 * @api public
 */

exports.update = function update(id, data, fn) {
  log('Updating keyword %s with %j', id, data);

  exports.get(id, onget);

  function onget(err, keyword) {
    if (err) {
      log('Found error %s', err.message);
      return fn(err);
    };

    // update and save keyword document with data
    keyword.set(data);
    keyword.save(onupdate);
  }

  function onupdate(err, keyword) {
    if (!err) return log('Saved keyword %s', keyword.id), fn(null, keyword);
    return log('Found error %s', err), fn(err);
  }

  return this;
};

/**
 * Remove Keyword
  *
 * @param {String} id
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 * @api public
 */

exports.remove = function remove(id, fn) {
  exports.get(id, function (err, keyword) {
    if (err) return fn(err);

    keyword.remove(function(err) {
      if (err) return log('Found error %s', err), fn(err);

      log('Keyword %s removed', keyword.id);
      fn(null);
    });
  })
};

/**
 * Find multiple keywords by name, or create them if missing.
 *
 * @param {Array} name Names to find/create
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'keyword' single keyword object found or `undefined`
 * @return {Module} `keyword` module
 * @api public
 */

exports.findOrCreateByName = function findOrCreateByName(names, fn) {
  Keyword
  .find({
    '$or': names.map(function(n){ return { name: n }; })
  })
  .exec(function(err, keywords) {
    if (err) return log('Found error %s', err), fn(err);

    // Get an array of missing keyword names
    var found = keywords.map(function(k){ return k.name; })
    var missing = names.filter(function(name){
      return !~found.indexOf(name)
    }).map(function(n){ return { name: n }; })

    if (!missing.length) return fn(null, keywords);

    // Create missing items and re-find everthing
    Keyword.create(missing, function(err){
      if (err) return log('Found error %s', err), fn(err);

      log('Keywords created "%s"', missing.map(function(k){ return k.name; }).join(', '));

      setTimeout(function(){
        findOrCreateByName(names, fn);
      }, 0);
    });
  });

  return this
};
