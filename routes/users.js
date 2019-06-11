const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Uswer model
const User = require('../models/User');

//login page
router.get('/login', (req, res) => res.render('../views/login'));

//Register Page
router.get('/register', (req, res) => res.render('../views/register'));

//Register Handle
router.post('/register', (req, res) => {
 
    const { name, matricNo, email, password, password2, avatar } = req.body;
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
        res.render('register', {
            errors,
            name,
            matricNo,
            email,
            password,
            password2,
            avatar
        });
    } else {
        //Validation passed
        User.findOne({ matricNo: matricNo })
            .then(user => {
                if(user) {
                    console.log('User exists');
                    //User exists
                    errors.push({ msg: 'This email is already registered' });
                    res.render('register', {
                        errors,
                        name,
                        matricNo,
                        email,
                        password,
                        password2,
                        avatar
                    });
                } else {
                    const newUser = new User({ 
                        name,
                        matricNo,
                        email,
                        password,
                        avatar
                    });
                //    console.log(newUser);
                //    res.send('hello');

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
            } ).catch(err => console.log(err));
    }
});

// Login handle 
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
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

// User Profile
router.get("/users/:id", (req, res) => {
    User.findById(req.params.id, function(err, foundUser) {
        if(err) {
            req.flash("error", "Something went wrong.");
            res.redirect("/");
        }
        res.render("users/show", {user: foundUser});
    });
});
module.exports = router;