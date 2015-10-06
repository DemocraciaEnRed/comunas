var log = require('debug')('democracyos:signup');

module.exports = function(req, res, next){
  if (!req.user) return next();
  if (req.user.isComplete) return next();

  log('Restricting user with incomplete profile.');

  res.format({
    html: function() {
      res.redirect('/signup/complete');
    },
    json: function() {
      res.json(401, { error: 'Incomplete user profile' });
    }
  });
}