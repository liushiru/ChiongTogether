const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const mongoose = require('mongoose');
const fs = require('fs');
const multer = require('multer');
const path = require('path')
// Uswer model
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

//
//router.use(express.static('./public'));


// Set The Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
      cb(null,file.fieldname + '-' + req.user.id + path.extname(file.originalname));
    }
  });
  
  // Init Upload
  const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb){
      checkFileType(file, cb);
    }
  }).single('myImage');
  
  // Check File Type
  function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|image/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
  
    if(mimetype && extname){
      return cb(null,true);
    } else {
      cb('Error: Images Only!');
    }
  }
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
    // try {
    //     res.render('../views/profile/edit1', { user : req.user })
    // } catch {
    //     res.render('../views/error');
    // }
    res.render('../views/profile/edit1', { user : req.user })
});

router.put('/change', ensureAuthenticated, async (req, res) => {
    let user;
    try {
        user = await User.findById(req.user.id);
        user.name = req.body.name;
        user.year = req.body.year;
        user.course = req.body.course;
        await user.save();
        res.redirect(`/users/${user.matricNo}`)
    } catch (err) {
        console.log(err);
        if (user == null) {
            res.redirect(`/users/${user.matricNo}`);
            console.log('Cannot find users');
        } else {
            res.render('../views/error')
        }
    }    
});

//delete post
router.delete("/:id", async (req, res) => {
    let postToDelete;


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
});

// upload profile image
router.post('/upload', ensureAuthenticated, (req, res) => {
    upload(req, res, (err) => {
      if(err){
        res.render('error', {
          msg: err
        });
        console.log(err);
      } else {
        if(req.file == undefined){
            console.log('no fileselected')
            res.redirect('back', {
            msg: 'Error: No File Selected!'
          });
        } else {
            User.findById(req.user.id, (err, user) => {
                let newUser = user;
                console.log(req.file);
                
                const path = `public/uploads/${req.file.filename}`;
                //newUser.img.data = fs.readFileSync(req.file.path);
             
                        User.findOneAndUpdate({_id: req.user.id}, {img: path}, (err, updatedUser) => {
                            if (err) {
                                console.log(err);
                            } else {
                                res.redirect('/users/' + req.user.matricNo);
                            }
                            
                        });
                    
        
                
                //let updatedUser = User.findById(req.user.id);
          });
        }
      }
    });
  });
module.exports = router;