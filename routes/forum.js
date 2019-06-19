const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
// User model
const User = require('../models/User');
const Post = require('../models/Post'); 



router.get('/', (req, res) => {
  /*  Post.find({}, (err, posts) => {
      var postMap= {};
      posts.forEach((post) => {
        postMap[post.id] = post;
      });
      res.send(postMap);
    }); */

    Post.find({}, (err, posts) => {
      res.render('../views/forum/mainForum' , {posts: posts});
    });
    //res.render('../views/forum/mainForum');

});

//Create Post Page
router.get('/startJio', (req, res) => res.render('../views/forum/createPost'));

//Register Handle
router.post('/startJio', ensureAuthenticated, (req, res) => {
 
    const { title, content } = req.body;
    const author = req.user;
    var comment = [];
    const newPost = new Post({
      title,
      content,
      author,
      comment
    });    
    res.send('okay');
    newPost.save()
      .then(post => {
      }).catch(err=> console.log(err));

    User.findByIdAndUpdate(req.user.id, 
      { "$push": {"post": newPost}},
      function (err, user) {
        if (err) throw err;
      //  console.log(user);
      }
    );
    console.log(req.user);
});


module.exports = router;