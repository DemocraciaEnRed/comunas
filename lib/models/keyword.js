/**
 * Module Dependencies
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Keyword Schema
 */

var KeywordSchema = new Schema({
  name: { type: String, trim: true, required: true }
});

module.exports = function initialize(conn) {
  return conn.model('Keyword', KeywordSchema);
};