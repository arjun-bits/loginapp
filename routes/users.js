var express = require('express');
var router = express.Router();

var User = require('../models/users');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;



// Register
router.post('/register', function(req, res){
	var email = req.body.email;
	var password = req.body.password;

	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('password', 'Password is required').notEmpty();

	var errors = req.validationErrors();


	var newUser = new User({
		email : email,
		password : password
			});

			User.createUser(newUser, function(err, user){
				if (err) throw err;
				console.log(err);

			}
			);

			req.flash('success_msg','You are registered and can now login');

			res.redirect('/users/login');

			res.status(201).json(email);


});

//login

router.get('/login', function(req, res){
	res.render('login');
});

passport.use(new LocalStrategy(
	function (email, password, done) {
		User.getUserByUsername(email, function (err, user) {
			if (err) throw err;
			if (!email) {
				return done(null, false, { message: 'Unknown User' });
			}

			User.comparePassword(password, user.password, function (err, isMatch) {
				if (err) throw err;
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, { message: 'Invalid password' });
				}
			});
		});
	}));


passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.getUserById(id, function (err, user) {
		done(err, user);
	});
});

router.post('/', function (req, res, next){
	if(req.body.email && req.body.password){
		 User.authenticate(req.body.email, req.body.password, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        req.flash('error','Wrong email or password.');
        return next(err);
      } else {
        req.session.userId = user._id;
        console.log(req.session.userId);
        return res.redirect('/');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
});


module.exports = router;