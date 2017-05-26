const express    = require('express');
const passport   = require('passport');
const router     = express.Router();
const multer     = require('multer');
const path       = require('path');
const User       = require('../models/user.js');
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');

const imgUpload  = multer ({ dest: path.join(__dirname, '../public/uploads') });

router.get('/login', ensureLoggedOut(), (req, res) => {
    res.render('authentication/login', { message: req.flash('error')});
});

router.post('/login', ensureLoggedOut(), passport.authenticate('local-login', {
  successRedirect : '/',
  failureRedirect : '/login',
  failureFlash : true
}));

router.get('/signup', ensureLoggedOut(), (req, res) => {
    res.render('authentication/signup', { message: req.flash('error')});
});

router.post('/signup', ensureLoggedOut(), passport.authenticate('local-signup', {
  successRedirect : '/',
  failureRedirect : '/signup',
  failureFlash : true
}));

router.get('/profile', ensureLoggedIn('/login'), (req, res) => {
    res.render('authentication/profile', {
      //all of the variables you want to pass to the DOM should go to the render portion of route
        user : req.user

    });
});

router.get('/profile/edit', ensureLoggedIn('/login'), (req, res) => {
    res.render('authentication/edit-user', {
        user : req.user
    });
});

router.post('/profile/edit',
  ensureLoggedIn('/login'),
  //give it the filename structure
  imgUpload.single('profileImg'),

  (req, res, next) => {

    console.log('FILE UPLOAD ------');
    console.log(req.file);

    const updatedProfile = new User ({
      username:   req.body.username,
      password:   req.body.password,
      email:      req.body.email,
      imageURL:   `/uploads/${req.file.filename}`
    });

    updatedProfile.save((err) => {
      if (err) {
        next(err);
        return;
      }

      req.flash('success', 'Profile updated');

      res.redirect('/profile');
    });
  }
);

//the logout should be a get request...not a post.
router.get('/logout', ensureLoggedIn('/login'), (req, res) => {
    req.logout();
    // req.flash('success', 'You have logged out successfully'); //need to make sure I could use flash
    res.redirect('/');
});

module.exports = router;
