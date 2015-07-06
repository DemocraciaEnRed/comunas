/**
 * Module dependencies.
 */

var citizen = require('citizen');
var config = require('config');
var FormView = require('form-view');
var template = require('./template');
var request = require('request');
var serialize = require('serialize');
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

  FormView.call(this, template, {
    law: law
  });

  this.law = law;
  this.form = this.find('.message-form');
  this.static = this.find('.static');
  this.textarea = this.form.find('textarea');
}

/**
 * Inherit from FormView
 */

FormView(ProposalMessage);

ProposalMessage.prototype.switchOn = function() {
  this.on('success', this.bound('onsuccess'));
};

ProposalMessage.prototype.onsuccess = function(res) {
  this.static.html(this.textarea.val());
  this.static.removeClass('hide');
  this.form.addClass('hide');
};
