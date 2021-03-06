const express = require("express");
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const app = express();
const methodOverride = require('method-override');
const path = require('path'); 
const multer = require('multer');
const User = require('./models/User');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');


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
app.use('/style', express.static('style'));
//app.use(express.static('./public'));
app.use('/users/public/uploads', express.static('public/uploads'));
//The below version works as well
//app.use('/public/uploads', express.static(path.join(__dirname, 'public/uploads')));


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

//Expose session to ejs
app.use(function(req, res, next) {
    res.locals.user = req.session.user;
    next();
  });
  
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

// Multer for image upload

const PORT = process.env.PORT || 5000;

var server = app.listen(PORT, console.log(`Server started on port ${PORT}`));

var io = require('socket.io')(server);
var connectedUsers = {};
io.on('connection', (socket) => {
  console.log('server add conUser ' + socket.handshake.query.senderId)
  connectedUsers[socket.handshake.query.senderId] = socket;
  socket.on('chat', function(data) {  
      User.findById(data.senderId, (err, sender) => {
      io.to(`${data.senderSocket}`).emit('chat', data, sender.name);
      console.log(data.senderSocket);
     // console.log(socket.handshake.query.recipientId);
     // console.log(connectedUsers[data.recipient]);
      if (connectedUsers[data.recipient] !== undefined) { 
        console.log(connectedUsers[data.recipient].id);
        connectedUsers[data.recipient].emit('chat', data, sender.name);
      }
      // console.log( socket.handshake.query.conversationId);
      //Save reply
      const reply = new Message({
        conversationId: socket.handshake.query.conversationId,
        body: data.message,
        author: data.senderId
      });

      reply.save(function(err, sentReply) {
          if(err) {
              console.log(err);
          } else {
              console.log('reply sent')
          }
      }); 
    });
  });
});
//socketEvents(io);
//app.use(express.static(path.join(__dirname, 'views/chat')));