/**
 * Module dependencies.
 */

var config = require('config');
var template = require('./admin-container');
var sidebar = require('admin-sidebar');
var LawsList = require('admin-laws');
var LawForm = require('admin-laws-form');
var TagsList = require('admin-tags');
var TagForm = require('admin-tags-form');
var classes = require('classes');
var citizen = require('citizen');
var request = require('request');
var render = require('render');
var title = require('title');
var empty = require('empty');
var laws = require('laws');
var tags = require('tags');
var page = require('page');
var o = require('query');
var qs = require('querystring');
var log = require('debug')('democracyos:admin');

page("/admin/:section(*)?", valid, citizen.required, function(ctx, next) {
  var section = ctx.params.section;
  var container = render.dom(template);
  var content = o('.admin-content', container);

  // prepare wrapper and container
  empty(o('#content')).appendChild(container);

  // set active section on sidebar
  sidebar.set(section);
  sidebar.appendTo(o('.sidebar-container', container));

  // Set page's title
  title();

  // if all good, then jump to section route handler
  next();
});

page('/admin/laws', citizen.isStaff, laws.middleware, function (ctx, next) {
  var lawsList = new LawsList();
  lawsList.replace('.admin-content');
  sidebar.set('laws');
});

page('/admin/laws/create', tags.middleware, function (ctx, next) {
  var params = qs.parse(ctx.querystring)
  var content = o('.admin-content');
  var publish = params.publish === undefined ? false : ('yes' === params.publish);
  var showSidebar = params.sidebar === undefined ? true : ('yes' === params.sidebar);

  if (showSidebar) {
    sidebar.set('laws');
  } else {
    sidebar.hide();
  }

  // render new law form
  var form = new LawForm(undefined, { publish: publish });
  form.replace('.admin-content');
  form.once('success', function(data) {
    laws.fetch();
  });
});

page('/admin/laws/:id', citizen.isStaff, tags.middleware, loadLaw, function (ctx, next) {
  // force section for edit
  // as part of list
  sidebar.set('laws');

  // render law form for edition
  var form = new LawForm(ctx.law);
  form.replace('.admin-content');
  form.on('success', function() {
    laws.fetch();
  });
});

page('/admin/tags', citizen.isStaff, tags.middleware, function (ctx, next) {
  var tagsList = new TagsList();
  tagsList.replace('.admin-content');
  sidebar.set('tags');
});

page('/admin/tags/create', citizen.isStaff, function (ctx, next) {
  var form = new TagForm();
  form.replace('.admin-content');
  sidebar.set('tags');
});

page('/admin/tags/:id', citizen.isStaff, loadTag, function (ctx, next) {
  // force section for edit
  // as part of list
  sidebar.set('tags');

  // render law form for edition
  var form = new TagForm(ctx.tag);
  form.replace('.admin-content');
});

if (config.usersWhitelist) {
  require('admin-whitelists');
  require('admin-whitelists-form');
}

/**
 * Check if page is valid
 */

function valid(ctx, next) {
  // fix path for next matching handlers
  if (/^\/admin$/.test(ctx.path)) ctx.path = ctx.path + '/laws';
  if (/^\/admin\/$/.test(ctx.path)) ctx.path = ctx.path + 'laws';

  // test valid section
  var section = ctx.params.section = ctx.params.section || "laws";
  if (/laws|tags|users/.test(section)) return next();
  if (/laws|tags|users\/create/.test(section)) return next();
  if (/laws|tags|users\/[a-z0-9]{24}\/?$/.test(section)) return next();
}

/**
 * Load specific law from context params
 */

function loadLaw(ctx, next) {
  request
  .get('/api/law/' + ctx.params.id)
  .end(function(err, res) {
    if (err || !res.ok) {
      var message = 'Unable to load law for ' + ctx.params.id;
      return log(message);
    };

    ctx.law = res.body;
    return next();
  });
}

/**
 * Load specific tag from context params
 */

function loadTag(ctx, next) {
  request
  .get('/api/tag/' + ctx.params.id)
  .end(function(err, res) {
    if (err || !res.ok) {
      var message = 'Unable to load tag for ' + ctx.params.id;
      return log(message);
    };

    ctx.tag = res.body;
    return next();
  });
}
