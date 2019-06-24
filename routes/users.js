const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
// Uswer model
const User = require('../models/User');
const Post = require('../models/Post');

//login page
router.get('/login', (req, res) => res.render('../views/login'));

//Register Page
router.get('/register', (req, res) => res.render('../views/register'));

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


//trying to pass in all the posts the user have
router.get("/:matricNo", ensureAuthenticated, (req, res, next) =>{
    let post = [];
    for( var i=0; i < req.user.post.length; i++) {
        Post.findById(req.user.post[i]);
        //console.log('post[i]:') 
        //console.log(post[i]);
        console.log('findByIddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd')
        //console.log(req.user.post[i]);
        //console.log(Post.findById(req.user.post[i]));

    }
    res.render('../views/profile/show', {
      user: req.user
    });
    //console.log('post: post');
    //console.log(post);
  });


router.get("/:matricNo/edit", async (req, res) => {
    try {
        const user = User.findById(req.params.matricNo)
        res.render('../views/profile/edit', { user : user })
    } catch {
        res.redirect(':matricNo');
    }
});

router.put('/change', async (req, res) => {
    let user;
    try {

        user = await User.findById(req.user.id);
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


router.delete("/:matricNo", (req, res) => {

});

module.exports = router;