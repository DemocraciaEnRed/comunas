var config = require('lib/config');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('lib/models').User;
var utils = require('lib/utils');
var log = require('debug')('democracyos:facebook-strategy');

/**
 * Register Facebook Strategy
 */

module.exports = function() {
  passport.use(
    new FacebookStrategy({
      clientID: config.auth.facebook.clientID,
      clientSecret: config.auth.facebook.clientSecret,
      callbackURL: utils.buildUrl(config) + '/auth/facebook/callback',
      enableProof: false,
      profileFields: [ 'id', 'first_name', 'last_name', 'email' ]
    },
    function(accessToken, refreshToken, profile, done) {
      User.findByProvider(profile, function (err, user) {
        if (err) return done(err);

        if (user) return done(null, user);

        if (!profile._json.email) return signupByProvider(profile, done);
        User.findByEmail(profile._json.email, function(err, user) {
          if (err) return done(err);
          if (user) {
            log('Found user already using email %s', profile._json.email);
            return done(null, null, 'signup.error.facebook.user-already-exists');
          }

          signupByProvider(profile, done);
        });

        function signupByProvider(profile, done) {
          User.findByProvider(profile, function (err, user) {
            if (err) return done(err);

            if (!user) return signup(profile, accessToken, done);

            // Remove previous FB App deauthorization
            if (user.profiles.facebook.deauthorized) {
              user.set('profiles.facebook.deauthorized');
            }

            user.isModified() ? user.save(done) : done(null, user);
          });
        }
      });
    })
  );
}

/**
 * Facebook Registration
 *
 * @param {Object} profile PassportJS's profile
 * @param {Function} fn Callback accepting `err` and `user`
 * @api public
 */

function signup (profile, accessToken, fn) {
  var user = new User();

  if (profile._json.first_name) {
    user.firstName = profile._json.first_name;
  }

  if (profile._json.last_name) {
    user.lastName = profile._json.last_name;
  }

  if (profile._json.email){
    user.email = profile._json.email;
    user.emailValidated = true;
  }

  user.profilePictureUrl = 'https://graph.facebook.com/' + profile._json.id + '/picture';
  user.profiles.facebook = profile._json;

  user.save(function(err) {
    fn(err, user);
  });
}
