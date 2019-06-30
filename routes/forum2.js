const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

const User = require('../models/User');

//start jio - type
//router.get('/startJio', (req, res) => res.render('start-jio-type'));

//start jio - type (with authentication)
router.get('/startJio', ensureAuthenticated, (req, res) => 
  res.render('../views/forum/start-jio-type', {
    user: req.user
  })
);

router.get('/studyPost', ensureAuthenticated, (req, res) => 
    res.render('../views/forum/createPost-study.ejs', {
        user: req.user
    })
);

router.get('/main', ensureAuthenticated, (req, res) => 
    res.render('../views/forum/mainForum.ejs', {
        user: req.user
    })
);

module.exports = router;