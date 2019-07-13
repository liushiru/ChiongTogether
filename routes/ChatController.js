"use strict"
const Conversation = require('../models/Conversation')
const Message = require('../models/Message')
const User = require('../models/User');
const mongoose = require('mongoose');

exports.getConversations = function(req, res, next) {
    //Only return one message from each conversation to display as snippet
    Conversation.find({ participans: req.use._id })
    .select('_id')
    .exec(function(err, conversations) {
        if (err) {
            res.send({ error: err});
            return next(err);
        }

        // Set up empty array to hold conversations + most recent message
        let fullConversations=[];
        conversations.forEach(function(conversations){
            Message.find({ 'conversationId': conversations._id })
            .sort('-createdAt')
            .limit(1)
            .populate({
                path: "author",
                select: "name"
            })
            .exec(function(err, message) {
                if(err){
                    res.send({ error: err});
                    return next(err);
                }
                fullConversations.push(message);
                if(fullConversations.length === conversations.length) {
                    return res.status(200).json({ conversations: fullConversations });
                }
            });
        });
    });
}


exports.getConversation = function(req, res, next) {
    Message.find({ conversationId: req.params.conversationId })
    .select('createdAt body author')
    .sort('-createdAt')
    .populate({
        path: 'author',
        select: 'name'
    })
    .exec(function(err, messages){
        if(err){
            res.send({error: err});
            return next(err);
        }

        res.status(200).json({ conversations: message});
    });
}

exports.newConversation = function(req, res, next) {
    if(!req.body.recipient) {
        res.status(422).send({ error: 'Please choose a valid recipient for your message'});
        return next();
    }

    //console.log(req.body);
    if(!req.body.message) {
        res.status(422).send({ error: 'Please enter a message.'});
        return next();
    }

    const prettyRecipientId = JSON.parse(req.body.recipient)

    const senderId = mongoose.mongo.ObjectID(req.user._id);
    const recipientId = mongoose.mongo.ObjectID(prettyRecipientId);

    const conversation = new Conversation({
        participants: [senderId, recipientId]
    });

    conversation.save(function(err, newConversation) {
        if(err){
            res.send({ error: err});
            console.log('conversation error')
            return next(err);
        }
        // console.log('newConversation:');
        // console.log(newConversation);
        // console.log('req.body')
        // console.log(req.body);
        const message = new Message({
            conversationId: newConversation._id,
            body: req.body.message,
            author: req.user._id
        });
        console.log(message);
        message.save(function(err, newMessage) {
            if (err) {
                console.log('message error')
                res.send(err.body.message);
                return next(err);
            }
            console.log(103)
            res.status(200).json({ message: 'Conversation started!', conversationId: conversation._id});
            //return next();
        });
    }); 
}

exports.sendReply = function(req, res, next) {
    const reply = new Message({
        conversationId: req.params.conversationId,
        body: req.body.composedMessage,
        author: req.user._id
    });

    reply.save(function(err, sentReply) {
        if(err) {
            res.send(err);
           // return next(err);
        }

        // res.status(200).json({ message: 'Reply successfully sent!'});
        // return(next);
    });
}

exports.deleteConversation = function(req, res, next) {
    Conversation.findOneAndRemove({
        $and: [
            { '_id': req.params.conversationId }, {'participants': req.user._id}
        ]}, function(err) { 
            if(err) {
                res.send({ error: err});
                return next(err);
            }
            
            res.status(200).json({ message: 'Conversation removed!' });
            return next();
        });
}

