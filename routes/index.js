var express = require('express');
var passport = require('passport');
const router = express.Router();

//GET /login
router.get('/', function (req, res) { res.render('signin'); });
router.get('/signin', function (req, res) {
  
  res.render('signin', {'message' : req.flash('messages')});
});


router.post('/signin', passport.authenticate('local-signin', {
  successRedirect : '/home',
  failureRedirect : '/signin',
  failureFlash: true
}));

//sign up
router.get('/signup', function (req, res) {
  res.render('signup', {'message' : req.flash('messages')});
});

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect : '/signin',
  failureRedirect : '/signup',
  failureFlash: true
}));

router.get('/home', function (req, res) {
  console.log(req.user);
  if (req.isAuthenticated()) {
    res.render('home');
  }
  else {
    res.redirect('/signin');
  }
});

router.get('/signout', function (req, res) {
  req.logout();
  res.redirect('/');
})
module.exports = router;