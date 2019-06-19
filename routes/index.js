const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
router.get('/', (req, res) => res.render('../views/welcome'));


const User = require('../models/User');
const Post = require('../models/Post');


router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('../views/dashboard', {
    user: req.user
  })
);

router.get('/logout', ensureAuthenticated, (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

// //Create Post Page
// router.get('/forum/startJio', (req, res) => res.render('../views/forum/createPost'));

// //Register Handle
// router.post('/forum/startJio', ensureAuthenticated, (req, res) => {
 
//     const { title, content } = req.body;
//     console.log(req);
//    // res.send(req);
//     var author = req.user;
//     var comment = [];
//     const newPost = new Post({
//       title,
//       content,
//       author,
//       comment
//     });
//     console.log('new post:');console.log('new post:');console.log('new post:');console.log('new post:');console.log('new post:');console.log('new post:');
//     console.log('new post:');console.log('new post:');console.log('new post:');console.log('new post:');
//     console.log('new post:');console.log('new post:');console.log('new post:');console.log('new post:');console.log('new post:');
//     console.log('new post:');console.log('new post:');console.log('new post:');
//     console.log(newPost);
//     console.log(' the following is req.user:');
//     console.log(req.user);
//     console.log(' the following is author:');
//     console.log(author);
//     res.send('okay');
//     newPost.save()
//       .then(post => {
//       }).catch(err=> console.log(err));
// });

module.exports = router;
