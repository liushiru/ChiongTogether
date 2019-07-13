const express = require('express');
const router = express.Router();
const ChatController = require('./ChatController')
const { ensureAuthenticated, forwardAuthenticated}  = require('../config/auth');

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
        sender: req.user.name
    });
    console.log(req.user.name);
})

module.exports = router;