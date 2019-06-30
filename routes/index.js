const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

const User = require('../models/User');
const Post = require('../models/Post');

//Welcome Page
router.get('/', (req, res) => res.render('../views/login/welcome'));

//Home Page (with authentication)
router.get('/home', ensureAuthenticated, (req, res) => 
  res.render('home', {
    user: req.user
  })
);

//Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('../views/dashboard', {
    user: req.user
  })
);

//Logout
router.get('/logout', ensureAuthenticated, (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
