const express = require('express');
const router = express();
const ChatController = require('./ChatController')
const { ensureAuthenticated, forwardAuthenticated}  = require('../config/auth');
const Conversation = require('../models/Conversation')
const User = require('../models/User')
const Message = require('../models/Message')
//const server = require('http').Server(router);
//const io = require('socket.io')(server);
router.use(express.urlencoded({ extended: true}));





// View messages to and from authenticated user
router.get('/myChats', ensureAuthenticated, (req, res) => {
    let allRecipients = [];  
    Conversation.find({participants: req.user.id})
    .populate({
        path: "participant",
        select: "name id"
    })
    .exec(function(err, conversations) {
        if (err) {
            res.send(err);
            console.log(err);
        } else if (conversations.length === 0) {
            res.render('../views/chat/allChats', {
                recipients: allRecipients
            });
        } else {
            conversations.forEach((conversation) => {
                conversation.participants.forEach((participant) => {
                    if (participant !== req.user.id) {
                        User.findById(participant)
                        .select("_id name")
                        .exec((err, user) => {
                            if (err) {
                                console.log(err)
                            } else {
                                allRecipients.push({id: user._id, name: user.name})
                                if (allRecipients.length === conversations.length) {
                                    res.render('../views/chat/allChats', {
                                        recipients: allRecipients
                                    });
                                }
                            }
                        })
                    }
                })
            })
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
    //find whether convo already exist 
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
                conversationId: conversation.id,
                messages: []
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

router.delete('/:recipientId', async (req, res) => {
    //Delete all messages
    // await Message.deleteMany({ conversationId: req.params.conversationId });
    //Delete the convo
    console.log('got here');
    Conversation.findOneAndDelete({participants: {$all: [req.user, req.params.recipientId]}}, (err, conversation) => {
        if (err) {
            console.log(err)
        } else {
            Message.deleteMany({ conversationId: conversation.id });
        }
    })
    res.redirect('back');
});
module.exports = router;