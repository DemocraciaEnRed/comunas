/**
 * Module dependencies.
 */

var page = require('page');
var dom = require('dom');
var render = require('render');
var SigninForm = require('./signin-form');
var AuthFacebookForm = require('auth-facebook');
var classes = require('classes');
var title = require('title');
var t = require('t');
var config = require('config');
var citizen = require('citizen');
var template = require('./template');

page('/signin', externalSignin, citizen.loggedoff, function() {
  // Display section content
  classes(document.body).add('signin-page');

  // Update page's title
  title(t('signin.login'));

  // Append Signin Template
  var view = render.dom(template);
  dom('#content').empty().append(view);

  // Search for signin forms wrapper
  var forms = dom('[data-signin-forms]');

  // Append default singin form
  (new SigninForm()).replace(forms);

  // Append facebook form if nececesary
  if (config.facebookSignin) {
    (new AuthFacebookForm()).appendTo(forms);
  }
});

page('/signin/:token', function() {
  // Redirect to home with full page reload
  window.location = '/';
})

function externalSignin(ctx, next) {
  if (!config.signinUrl) return next();
  var url = config.signinUrl + '?returnUrl=' + encodeURI(location.href);
  window.location = url;
}