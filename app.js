const express = require("express");
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const app = express();
const methodOverride = require('method-override');
var path = require('path'); 
const socketEvents = require('./socketEvents');

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
 
//Static
app.use(express.static(path.join(__dirname, './views/chat')));
app.use('/style', express.static('style'));

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

//global variables middleware for msg
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

//Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/forum', require('./routes/forum'));
app.use('/chat', require('./routes/chat'))

//Body-parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())


var socket = require("socket.io")

const PORT = process.env.PORT || 5000;

var server = app.listen(PORT, console.log(`Server started on port ${PORT}`));


//const io = require('socket.io').listen(server);

var io = socket(server);
//app.use(express.static('./views/chat'));

app.use(express.static(path.join(__dirname, 'views/chat')));
//listen on every connection
io.on('connection', (soc) => {
    console.log('New user connected');
})



//socketEvents(io);


