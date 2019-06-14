const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
router.get('/', (req, res) => res.render('../views/welcome'));

router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('../views/dashboard', {
    user: req.user
  })
);

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

router.get('/shows', (req, res) =>
  res.render('../views/test', {
    user: req.user
  })
);


module.exports = router;
