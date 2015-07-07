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
  this.edit = this.find('.edit');
  this.cancel = this.find('.cancel');
}

/**
 * Inherit from FormView
 */

FormView(ProposalMessage);

ProposalMessage.prototype.switchOn = function() {
  this.on('success', this.bound('onsuccess'));
  this.edit.on('click', this.bound('onEditClick'));
  this.cancel.on('click', this.bound('onCancelClick'));
};

ProposalMessage.prototype.onsuccess = function(res) {
  this.static.html(this.textarea.val());
  this.static.removeClass('hide');
  this.edit.removeClass('hide');
  this.form.addClass('hide');
  this.cancel.addClass('hide');
};

ProposalMessage.prototype.onEditClick = function(ev) {
  ev.preventDefault();
  this.textarea.val(this.static.html());
  this.static.addClass('hide');
  this.edit.addClass('hide');
  this.form.removeClass('hide');
  this.cancel.removeClass('hide');
};

ProposalMessage.prototype.onCancelClick = function(ev) {
  ev.preventDefault();
  this.static.removeClass('hide');
  this.edit.removeClass('hide');
  this.form.addClass('hide');
};
