// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var OAuth2Strategy = require('passport-oauth2'),
  OAuth2RefreshTokenStrategy = require('passport-oauth2-middleware').Strategy;
// load up the user model
var User = require('../models/user');


module.exports = function (passport) {



  

  // used to serialize the user for the session
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  var refreshStrategy = new OAuth2RefreshTokenStrategy({
    refreshWindow: 10,
    userProperty: 'ticket',
    authenticationURL: '/signin',
    callbackParameter: 'callback'
  });
  

  passport.use('main', refreshStrategy);

  var oauthStartegy = new OAuth2Strategy({
    authorizationURL: 'https://localhost:4000/oauth2/auth',
    tokenURL: 'https://localhost:4000/oauth2/token',
    clientID: 'clientID',
    clientSecret: 'clientSecret',
    callbackURL: '/home',
    passReqToCallback: false
  },
    refreshStrategy.getOAuth2StrategyCallback()
  );
  passport.use('oauth', oauthStartegy);
  refreshStrategy.useOAuth2Strategy(oauthStartegy);
 

  var localStrategy_signin = new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true 
  },
    function (req, email, password, done) {
      if (email)
        email = email.toLowerCase(); 

      // asynchronous
      process.nextTick(function () {
        User.findOne({ 'email': email }, function (err, user) {
          if (err)
            return done(err);
          if (!user)
            return done(null, false, req.flash('messages', 'No user found.'));

          if (!user.validPassword(password)) {
            return done(null, false, req.flash('messages', 'Oops! Wrong password.'));
          } else {
            return done(null, user);
          }
        });
      });

    });
  passport.use('local-signin', localStrategy_signin);
  var localStrategy_signup = new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
    function (req, email, password, done) {
      if (email)
        email = email.toLowerCase();
        console.log("body");
        console.log(req.body);

      // asynchronous
      process.nextTick(function () {
        if (!req.user) {
          User.findOne({ 'email': email }, function (err, user) {
            if (err)
              return done(err);
            if (user) {
              return done(null, false, req.flash('messages', 'That email is already taken.'));
            } else {
              var newUser = new User();
              newUser.email = email;
              newUser.role = req.body.role;
              newUser.password = newUser.generateHash(password);
              newUser.save(function (err) {
                if (err)
                  return done(err);
                return done(null, newUser);
              });
            }

          });
        } else if (!req.user.email) {
          User.findOne({ 'email': email }, function (err, user) {
            if (err)
              return done(err);

            if (user) {
              return done(null, false, req.flash('messages', 'That email is already taken.'));
            } else {
              var user = req.user;
              user.email = email;
              user.role = req.body.role;
              user.password = user.generateHash(password);
              user.save(function (err) {
                if (err)
                  return done(err);

                return done(null, user);
              });
            }
          });
        } else {
          // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
          return done(null, req.user);
        }

      });

    });

  passport.use('local-signup', localStrategy_signup);
  refreshStrategy.useLocalStrategy(localStrategy_signin);
  refreshStrategy.useLocalStrategy(localStrategy_signup);
};
