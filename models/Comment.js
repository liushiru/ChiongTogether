const mongoose = require("mongoose");
const timestamps = require('mongoose-timestamp');

var CommentSchema = mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
    }
});

CommentSchema.plugin(timestamps);
const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
