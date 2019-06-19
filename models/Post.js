const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

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
    comments: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Comment"
        }
     ]
});
PostSchema.plugin(timestamps);
//createdAt + updatedAt
mongoose.model('Post', PostSchema);

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
