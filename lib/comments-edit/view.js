/**
 * Module dependencies.
 */

var template = require('./template');
var FormView = require('form-view');
var dropdown = require('dropdown');
var o = require('dom');
var t = require('t');


/**
 * Expose comments view
 */

module.exports = CommentsEditView;

/**
 * View constructor
 *
 * @param {Comment} comment
 * @constructor
 */

function CommentsEditView(comment) {
  if (!(this instanceof CommentsEditView)) {
    return new CommentsEditView(comment);
  }

  this.comment = comment;
  FormView.call(this, template, { comment: comment });
  var view = this;
  this.tendencyDropdown = dropdown({
    items: [
      { id: 'infavor', text: t('comments.infavor') },
      { id: 'neutral', text: t('comments.neutral') },
      { id: 'against', text: t('comments.against') }
    ],
    defaultValue: comment.tendency
  })
  .on('change', function (value) {
    view.tendencyDropdown.el.find('button').removeClass('infavor');
    view.tendencyDropdown.el.find('button').removeClass('neutral');
    view.tendencyDropdown.el.find('button').removeClass('against');
    view.tendencyDropdown.el.find('button').addClass(value.id);
  });
}

/**
 * Extend from `View`
 */

FormView(CommentsEditView);

/**
 * Switch on events
 *
 * @api public
 */

CommentsEditView.prototype.switchOn = function() {
  this.bind('click', '.btn-cancel', 'oncancel');
  this.on('success', this.bound('onsuccess'));
  this.tendencyDropdown.appendTo('#change');
  this.tendencyDropdown.el
    .find('button')
    .addClass(this.comment.tendency);
};

CommentsEditView.prototype.postserialize = function(data) {
  data.tendency = this.tendencyDropdown.selectedValue();
};

/**
 * Put a comment
 *
 * @param {Object} data
 * @api public
 */

CommentsEditView.prototype.onsuccess = function(res) {
  this.emit('put', res.body);
}

/**
 * On cancel editing a comment
 *
 * @param {Object} data
 * @api public
 */

 CommentsEditView.prototype.oncancel = function(ev) {
  ev.preventDefault();
  this.el.removeClass('edit');
  this.remove();
};
