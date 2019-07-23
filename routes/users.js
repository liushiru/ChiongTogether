const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
var mongoose = require('mongoose');
// Uswer model
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');


//login page
router.get('/login', (req, res) => res.render('../views/login/login'));

//Register Page
router.get('/register', (req, res) => res.render('../views/login/register'));

//Register Handle
router.post('/register', (req, res) => {
    
    //pull out info from submit data
    const { name, matricNo, email, password, password2, year} = req.body;
    
    let errors = [];

    //check required fields
    if(!name || !matricNo || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields'});
    };
    //check password match
    if(password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }
    //Check password length
    if(password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters'});
    }

    if(errors.length > 0) {
        if(password !== password2 || password.length < 6) {
            res.render('register', {
                errors,
                name,
                matricNo,
                email,
                year
            }); 
        } else {
            res.render('register', {
                errors,
                name,
                matricNo,
                email,
                password,
                password2,
                year
            });
        }    
    } else {
        //Validation passed
        User.findOne({ matricNo: matricNo })
            .then(user => {
                if(user) {
                    console.log('User exists');
                    //User exists
                    errors.push({ msg: 'This Matric Card Number is already registered' });
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2,
                        year
                    });
                } else {
                    User.findOne({ email: email })
                        .then(user1 => {
                            if(user1) {
                                console.log('User exists');
                                 //User exists
                                errors.push({ msg: 'This email is already registered' });
                                res.render('register', {
                                    errors,
                                    name,
                                    matricNo,
                                    password,
                                    password2,
                                    year
                                });
                            } else {
                                const newUser = new User({ 
                                    name,
                                    matricNo,
                                    email,
                                    password,
                                    year,
                                    post: []
                                });

                                //Hash Password
                                bcrypt.genSalt(10, (err, salt) => 
                                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                                        if(err) throw err;
                                        //set password to hashed
                                        newUser.password = hash;
                                        //Save User
                                        newUser.save()
                                            .then(user => {
                                                req.flash('success_msg', 'You are now registered and can log in');
                                                res.redirect('/users/login');
                                            }).catch(err => console.log(err));
                                    })
                                )
                            }   
                        }).catch(err => console.log(err));
                }   
            }).catch(err => console.log(err));
    }
});

// Login handle 
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/home',
        failureRedirect: './login',
        failureFlash: true
    })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
  });


//
router.get("/:matricNo", ensureAuthenticated, (req, res, next) =>{
    let posts = [];
    const matricNo = req.params.matricNo;
    const edit = (req.user.matricNo === matricNo);
    User.findOne({matricNo: matricNo}, (err, user) => {
        if (err) {
            res.send(err);
        } else {
            if (user.post.length === 0) {
                res.render('../views/profile/show', {
                    user,
                    posts,
                    edit
                });
            } else {
                for(let i=0; i<user.post.length; i++) {
                    Post.findById(user.post[i], (err, post) => {
                        if (err) {
                            res.send(err);
                        } else {
                            posts.push({id: post.id, title: post.title});
                            if (posts.length === user.post.length) {
                                res.render('../views/profile/show', {
                                    user,
                                    posts,
                                    edit
                                });
                            }
                        }
                    });
                }
            }
        }
    });
  });


router.get("/:matricNo/edit", ensureAuthenticated, async (req, res) => {
    try {
        const user = User.findById(req.params.matricNo)
        res.render('../views/profile/edit', { user : user })
    } catch {
        //res.redirect(':matricNo');
        res.send('its an error')
    }
});

router.put('/change', ensureAuthenticated, async (req, res) => {
    let user;
    try {
        user = await User.findById(req.user.id);
        console.log(`/change/ ${user}`);
        user.name = req.body.name;
        console.log(req.body);
        await user.save();
        res.redirect(`/users/${user.matricNo}`)
    } catch {
        if (user == null) {
            res.redirect(`/users/${user.matricNo}`);
            //add in messages
            console.log('Cannot find users');
        } else {
            res.render('../views/profile/edit', {
                
                user: user,
                errorMessage: "Error updating user"
            });
            console.log('lmao');
        }
    }    
});

//delete post
router.delete("/:id", async (req, res) => {
    let postToDelete;
    try {
 /*       postToDelete = await Post.findById(req.params.id);
        //array of comment id under the post
        let comments = postToDelete.comment;
        console.log(comments);
        
        //Delete otherUser.comment
        for(var i=0; i<comments.length; i++) {
            console.log('line 221 enter for loop')
            await Comment.findById(postToDelete.comment[i], (err, comment) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log(`did you find the comment or not ${comment}`);
                    User.findByIdAndUpdate(comment.author, 
                        {"$pull": {"comment": comments[i]}});
                }
                console.log('line228');
            });
        }

        //Delete Comments
        for(var i=0; i<comments.length; i++) {
            Comments.findByIdAndDelete(comments[i]);
            console.log(`i = ${i}`);
        }
        
        //Delete user.post
        User.findByIdAndUpdate(req.user.id,
                {"$pull": {"post": req.params.id}});
        console.log('line 241');
        //Delete Post
        Post.findByIdAndDelete(req.params.id);
        console.log('line244');
        res.redirect('back');   */

        Post.findById(req.params.id, (err, post) => {
            for(var i=0; i<post.comment.length; i++) {
                Comment.findById(post.comment[i], (err, comment) => {
                    if (err) {
                        console.log(`line 256${err}`);
                    } else {
                        //did not pull
                       // console.log(comment);
                        const commentAuthorID = mongoose.mongo.ObjectID(comment.author);
                        const commentID = mongoose.mongo.ObjectID(post.comment[i])
                        User.findOneAndUpdate({_id: commentAuthorID}, 
                            {"$pull": {comment: commentID}},
                            (err, user) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(`line 268 ${user}`);
                                }
                            });
                    }
                });
            }

            //Delete Comments
            for(var i=0; i<post.comment.length; i++) {
                const commentID = mongoose.mongo.ObjectID(post.comment[i])
                Comment.findByIdAndDelete(commentID, (err, comment) => {
                    if (err) console.log(err);
                    console.log(comment)
                });
            }
        });
        //Delete user.post
        const userID = mongoose.mongo.ObjectID(req.user.id);
        const postID = mongoose.mongo.ObjectID(req.params.id);
        User.findByIdAndUpdate(userID,
                {"$pull": {"post": postID}},
                (err, user) => {
                    if (err) console.log(`290 ${err}`);
                    else console.log(`291 ${user}`);
                });
        //Delete Post
        Post.findByIdAndDelete(postID, (err, post) => {
            if (err) {
                console.log(`296 ${err}`);
            } else {
                console.log(`298 ${post}`);
            }
        });
        res.redirect('back');   
    } catch {
        if (postToDelete === null) {
            res.send('null');
        }
    }
});

module.exports = router;