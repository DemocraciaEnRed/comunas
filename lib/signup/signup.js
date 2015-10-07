/**
 * Module dependencies.
 */

var page = require('page');
var SignupForm = require('./signup-form-view');
var EmailValidationForm = require('./email-validation-form-view');
var EmailValidationCompleteForm = require('./email-validation-complete-view');
var ResendValidationEmailForm = require('./resend-validation-email-form-view');
var dom = require('dom');
var render = require('render');
var classes = require('classes');
var citizen = require('citizen');
var qs = require('querystring');
var title = require('title');
var t = require('t')
var config = require('config');
var SettingsProfile = require('settings-profile');
var signupCompleteTemplate = require('./signup-complete');

function parse(ctx, next) {
  ctx.query = qs.parse(ctx.querystring);
  next();
}

/**
 * Redirect loggedIn users with incomplete profiles to /signup/complete
 */
page(/^(\/logout.+|(?!\/logout).*)$/, citizen.optional, function(ctx, next){
  if (!citizen.logged() || !citizen.incomplete) return next();
  if ('/signup/complete' === ctx.pathname) return next();
  page('/signup/complete');
});

page('/signup', externalSignup, citizen.loggedoff, parse, function(ctx, next) {
  // Build form view with options
  var reference = ctx.query.reference;
  var form = SignupForm(reference);

  // Display content section
  classes(document.body).add('signup-page');

  // Update page's title
  title(t('signin.signup'));

  // Empty container and render form
  form.replace('#content');
});

page('/signup/complete', externalSignup, citizen.required, parse, function(ctx, next) {
  if (!citizen.logged() || !citizen.incomplete) return next();
  // Display content section
  classes(document.body).add('signup-complete-page');

  // Update page's title
  title(t('signin.signup'));

  // Render Template
  var view = dom(render.dom(signupCompleteTemplate));
  dom('#content').empty().append(view);

  // Search for signup forms wrapper
  var forms = dom('[data-signup-complete-form]', view);

  // Render Profile Edit Form
  var form = new SettingsProfile({ returnTo: ctx.query.returnTo });
  form.replace(forms);
  form.el.removeClass('hide');

  form.on('success', function(){
    form.spin();
    citizen.once('loaded', function(){
      window.location = '/';
    });
  });
});

page('/signup/validate/:token', externalSignup, parse, function(ctx, next) {
  // Build form view with options
  var form = EmailValidationForm(ctx.params.token, ctx.query.reference);

  // Display content section
  classes(document.body).add('validate-token');

  form.replace('#content');
});

page('/signup/validated', externalSignup, citizen.required, parse, function(ctx, next) {
  // Build form view with options
  var form = EmailValidationCompleteForm(ctx.query.reference);

  // Display content section
  classes(document.body).add('validation-complete');

  form.replace('#content');

  if (ctx.query.reference) {
    setTimeout(function () {
      page(ctx.query.reference);
    }, 5000);
  }
});

page('/signup/resend-validation-email', externalSignup, function(ctx, next) {
  // Build form view with options
  var form = new ResendValidationEmailForm();

  // Display content section
  classes(document.body).add('signup-page');

  // Update page's title
  title(t('signup.resend-validation-email'));

  // Empty container and render form
  form.replace('#content');
});

function externalSignup(ctx, next) {
  if (!config.signupUrl) return next();
  window.location = config.signupUrl;
}
