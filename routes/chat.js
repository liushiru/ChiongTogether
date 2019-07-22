const express = require('express');
const router = express();
const ChatController = require('./ChatController')
const { ensureAuthenticated, forwardAuthenticated}  = require('../config/auth');
const Conversation = require('../models/Conversation')
const Message = require('../models/Message')
//const server = require('http').Server(router);
//const io = require('socket.io')(server);
router.use(express.urlencoded({ extended: true}));





// View messages to and from authenticated user
router.get('/myChats', ensureAuthenticated, (req, res) => {
    let fullConversations=[];    
    Conversation.find({participants: req.user.id})
    .select('_id')
    .exec(function(err, conversations) {
        if (err) {
            res.send(err);
            console.log(err);
        } else {
            // Set up empty array to hold conversations + most recent message
            conversations.forEach(function(conversation){
                Message.find({ 'conversationId': conversation._id })
                .sort('-createdAt')
                .limit(1)
                .populate({
                    path: "author",
                    select: "name"
                })
                .exec(function(err, message) {
                    if(err){
                        console.log(err);
                    } else {
                        console.log(message);
                        console.log(message[0]);
                        fullConversations.push({to: message[0].author.name, message: message[0].body});
                        if(fullConversations.length === conversations.length) {
                            res.render('../views/chat/allChats', {
                                conversations: fullConversations
                            });
                        }
                    }
                });
            });
        }
    });
    
});

// Retrieve single conversation
router.get('/:conversationId', ensureAuthenticated, ChatController.getConversation);
// Start new conversation
//router.post('/newChat', ensureAuthenticated, ChatController.newConversation);

// Send reply in conversation
//router.post('/reply', ensureAuthenticated, ChatController.sendReply);

// Get the page for new convo
router.get('/new/:recipient', (req, res) => {
    Conversation.findOne({participants: {$all: [req.user, req.params.recipient]}}, (err, conversation) => {
        if (err) {
            console.log(err);
        } else if (conversation === null){
            //save new conversation
            let conversation = new Conversation({
                participants: [req.params.recipient, req.user]
            })
            conversation.save()
            .then((converstation) => {
            }).catch(err => console.log(err));
            res.render('../views/chat/newChat', {
                recipient: req.params.recipient,
                sender: req.user,
                conversationId: conversation.id
            });
        } else {
            //load previous message
            getConversation(conversation.id, req, res);
            // res.render('../views/chat/newChat', {
            //     recipient: req.params.recipient,
            //     sender: req.user,
            //     conversationId: conversation.id
            // });
        }
    });
})

function getConversation (conversationId, req, res) {
    Message.find({ conversationId: conversationId })
    .select('createdAt body author')
    .sort('-createdAt')
    .populate({
        path: 'author',
        select: 'name'
    })
    .exec(function(err, messages){
        if(err){
            console.log(err);
            res.send(err);
        } else {
            res.render('../views/chat/newChat', {
                recipient: req.params.recipient,
                sender: req.user,
                conversationId: conversationId,
                messages: messages            
            })
            console.log('req.user ' + req.user.name + ' ' + req.user.id);
        }
    });
}


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