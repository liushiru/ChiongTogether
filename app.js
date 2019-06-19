const express = require("express");
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const app = express();
const methodOverride = require('method-override');
//Passport config
require('./config/passport')(passport);

//DB Config
const db = require('./config/keys').MongoURI;
     //Connect to Mongo//pass in DB, return a promise
mongoose.connect(db, { useNewUrlParser: true})
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));


    mongoose.set('useFindAndModify', false);
//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

//methodOverride
app.use(methodOverride('_method'));
//Bodyparser
app.use(express.urlencoded({ extended: false}));

//Express Session 
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

//global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

//app.engine('html', require('ejs').renderFile);
//app.set('view engine', 'html');

//Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/forum', require('./routes/forum'));



const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));

