/**
 * Module Dependencies
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Keyword Schema
 */

var KeywordSchema = new Schema({
  name: {
    type: String,
    unique: true, // Verify uniqueness to avoid repeated keywords
    trim: true,
    required: true
  }
});

module.exports = function initialize(conn) {
  return conn.model('Keyword', KeywordSchema);
};