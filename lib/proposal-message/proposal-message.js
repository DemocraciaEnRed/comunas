/**
 * Module dependencies.
 */

var citizen = require('citizen');
var config = require('config');
var FormView = require('form-view');
var template = require('./template');
var request = require('request');
var serialize = require('serialize');
// var loading = require('loading-lock');
// var o = require('dom');
var t = require('t');
var log = require('debug')('democracyos:proposal-message');

/**
 * Expose ProposalMessage
 */

module.exports = ProposalMessage;

/**
 * Creates a ProposalMessage
 *
 * @param {String} reference
 */

function ProposalMessage(law) {
  if (!(this instanceof ProposalMessage)) {
    return new ProposalMessage(law);
  }

  this.law = law;

  FormView.call(this, template, {
    law: law
  });
}

/**
 * Inherit from FormView
 */

FormView(ProposalMessage);

ProposalMessage.prototype.switchOn = function() {
  this.bind('submit', '.message-form', 'onsubmit');
};

ProposalMessage.prototype.onsubmit = function (ev) {
  ev.preventDefault();

  var data = serialize.object(ev.target);
  // var errors = this.validate(data);
  // this.errors(errors)
  // if (errors.length) return log('Found errors: %o', errors);
  this.emit('submit', data);
  this.post(data);
};

ProposalMessage.prototype.post = function(data) {
  var view = this;

  request
  .post('/api/law/' + this.law.id + '/message')
  .send({ data })
  .end(function(err, res) {

    if (res.body && res.body.error) {
      return log('Fetch response error: %s', res.body.error), view.errors([res.body.error]);
    };

    if (err || !res.ok) return log('Fetch error: %s', err || res.error);

    view.emit('post', res.body);
  });
};
