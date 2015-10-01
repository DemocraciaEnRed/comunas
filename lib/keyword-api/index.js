/**
 * Module dependencies.
 */

var express = require('express');
var api = require('lib/db-api');
var accepts = require('lib/accepts');
var utils = require('lib/utils');
var restrict = utils.restrict;
var staff = utils.staff;
var expose = utils.expose;
var log = require('debug')('democracyos:keyword');

var app = module.exports = express();

/**
 * Limit request to json format only
 */

app.use(accepts('application/json'));

app.get('/keyword/all', function (req, res) {
  log('Request /keyword/all');
  api.keyword.all(function (err, keywords) {
    if (err) return _handleError(err, req, res);

    log('Serving all keywords');
    res.json(keywords.map(expose('id name')));
  });
});

app.get('/keyword/:id', function (req, res) {
  log('Request GET /keyword/%s', req.params.id);

  api.keyword.get(req.params.id, function (err, keyword) {
    if (err) return _handleError(err, req, res);

    log('Serving keyword %s', keyword.id);
    var keys = [
      'id name'
    ].join(' ');

    res.json(expose(keys)(keyword.toJSON()));
  });
});

// app.post('/keyword/create', restrict, function (req, res, next) {
//   log('Request /keyword/create %j', req.body.keyword);

//   api.keyword.create(req.body, function (err, keyword) {
//     if (err) return next(err);
//     var keys = [
//       'id name'
//     ].join(' ');
//     res.json(expose(keys)(keyword));
//   });
// });

// app.post('/keyword/:id', restrict, staff, function (req, res) {
//   log('Request POST /keyword/%s', req.params.id);

//   api.keyword.update(req.params.id, req.body, function (err, keyword) {
//     if (err) return _handleError(err, req, res);

//     log('Serving keyword %s', keyword.id);
//     var keys = [
//       'id name'
//     ].join(' ');

//     res.json(expose(keys)(keyword.toJSON()));
//   });
// });

// app.delete('/keyword/:id', restrict, staff, function (req, res) {
//   log('Request POST /keyword/%s/delete', req.params.id);

//   api.keyword.get(req.params.id, function (err, keyword) {
//     if (err) return _handleError(err, req, res);

//     keyword.deletedAt = new Date;
//     keyword.save(function (err, saved) {
//       if (err) return _handleError(err, req, res);
//       log('deleted keyword %s', lawDoc.id);
//       res.json(200);
//     });
//   });
// });

function _handleError (err, req, res) {
  log("Error found: %j", err);
  res.json({ error: err });
}