const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
ObjectId = require('mongoose').ObjectID;
// User model
const User = require('../models/User');
const Post = require('../models/Post'); 
const Comment = require('../models/Comment');


//main forum
router.get('/', (req, res) => {
  /*  Post.find({}, (err, posts) => {
      var postMap= {};
      posts.forEach((post) => {
        postMap[post.id] = post;
      });
      res.send(postMap);
    }); */
    Post.find({}, (err, posts) => {
      if (err) throw err;
      res.render('../views/forum/mainForum' , {posts: posts});
    });
    //res.render('../views/forum/mainForum');

});

router.get('/search', (req, res) => {
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Post.find( 
      {$or:[
            {"title": regex},
            {"content": regex}
        ]},
      (err, allPosts) => {
      if (err) {
        console.log(err);
      } else {
        Comment.find()
        res.render("../views/forum/mainForum", {posts: allPosts})
      }
    });
  } else {
    res.redirect('back');
  }
});
//Create Post
router.get('/startJio', ensureAuthenticated, (req, res) => 
  res.render('../views/forum/createPost-study', {
    user: req.user
  })
);


router.post('/studyPost', ensureAuthenticated, (req, res) => {
 
    const { title, content } = req.body;
    const author = req.user;
    var comment = [];
    const newPost = new Post({
      title,
      content,
      author,
      comment
    });    
    res.redirect('/forum');
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


function getPostInfo (post, author, res) {
  let comments = [];
  if (post.comment.length === 0) {
    res.render('../views/forum/singleForum', {
      post,
      author,
      comments
    });
  } else {
    for (var i=0; i<post.comment.length; i++) {
      Comment.findById(post.comment[i], (err, comment) => {
        User.findById(comment.author, (err, commentor) => {
          comments.push({commentor: commentor, content: comment.content});
          if (comments.length === post.comment.length) {
            res.render('../views/forum/singleForum', {
              post: post,
              author: author,
              comments: comments
            });
          }
        });
      });
    }
  }
}

//enter one post
router.get('/:id', (req, res) => {
  Post.findOne({_id: req.params.id}, (err, post) => {
    if (err) {
      res.send(err);
    } else {
      User.findOne({_id: post.author}, (err, author) => {
        if (err) {
          res.send(err);
        } else {
          getPostInfo(post, author, res);
        }
      });      
    }
  });
});

//add comment
router.put('/addComment', ensureAuthenticated, async (req, res) => {
  //Handle comment
  console.log("are you coming hereeee?")
  const newComment = new Comment({
    content: req.body.comment, 
    author: req.user
  });
  await newComment.save()
     .then(comment => {
       console.log('comment saved successfully');
     }).catch(err => console.log(err));
  
  
  //handle User
  User.findByIdAndUpdate(req.user.id, 
    {"$push" : {"comment": newComment}},
    (err, user) => {
      if(err) throw err;
      //else author = user;
    });


  //handle Forum
  Post.findByIdAndUpdate(req.body.postId, 
    {"$push" : {"comment": newComment}},
    (err, post) => {
      if(err) throw err;
    });

  res.redirect('back');
      
});


function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;