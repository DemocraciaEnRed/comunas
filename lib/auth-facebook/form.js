var cookie = require('cookie');
var View = require('view');
var template = require('./template');

module.exports = AuthFacebookForm;

function AuthFacebookForm() {
  if (!(this instanceof AuthFacebookForm)) return new AuthFacebookForm();

  var flashMessage = cookie('flash-message');

  if (flashMessage) {
    flashMessage = JSON.parse(flashMessage);
    cookie('flash-message', null);
  }

  View.call(this, template, { flashMessage: flashMessage });
}

View(AuthFacebookForm);