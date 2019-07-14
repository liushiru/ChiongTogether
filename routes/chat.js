const express = require('express');
const router = express();
const ChatController = require('./ChatController')
const { ensureAuthenticated, forwardAuthenticated}  = require('../config/auth');


const server = require('http').Server(router);
const io = require('socket.io')(server);
router.use(express.urlencoded({ extended: true}));

const rooms = {name: {}, name2: {}};



// View messages to and from authenticated user
router.get('/', ensureAuthenticated, ChatController.getConversations);

// Retrieve single conversation
router.get('/:conversationId', ensureAuthenticated, ChatController.getConversation);
// Start new conversation
router.post('/newChat', ensureAuthenticated, ChatController.newConversation);

// Send reply in conversation
router.post('/:conversationId', ensureAuthenticated, ChatController.sendReply);



// Get the page for new convo
router.get('/new/:recipient', ensureAuthenticated, (req, res) => {
    var receiver = JSON.stringify(req.params.recipient)
    res.render('../views/chat/newChat', {
        recipient: req.params.recipient,
        sender: req.user
    });
})



module.exports = router;
// exports.io = io;
/* 
router.get('/', (req, res) => {
    res.render('../views/chat/index', { rooms: rooms })
});

router.post('/room', (req, res) => {
    if (rooms[req.body.room] != null) {
        return res.redirect('/');
    }
    rooms[req.body.room] = { users: {} }
    var lol = req.body.room;
    console.log(lol);
    res.redirect('/chat/' + lol);
    io.emit('room-created', req.body.room);
    //res.send('this line');
    // Send message that new room was created

})
router.get('/:room', (req, res) => {
    console.log(req.params);
    res.render('../views/chat/room.ejs', {roomName: req.params.room})
})*/