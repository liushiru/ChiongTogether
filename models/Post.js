const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

// const CommentSchema = new mongoose.Schema({
//     response: {
//         type: String,
//         required: true
//     },
//     author: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User"
//     }
// })
const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    comment: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }]
});

PostSchema.plugin(timestamps);
//createdAt + updatedAt
mongoose.model('Post', PostSchema);

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
