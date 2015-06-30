/**
 * Module dependencies.
 */

var AdminWhitelists = require('./view');
var page = require('page');
var request = require('request');
var sidebar = require('admin-sidebar');
var whitelists = require('whitelists');
var citizen = require('citizen');

page('/admin/users', citizen.isStaff, whitelists.middleware, function (ctx, next) {
  var view = new AdminWhitelists(whitelists.get());
  view.replace('.admin-content');
  sidebar.set('users');
});
