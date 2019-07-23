const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    matricNo: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    course: {
        type: String,
        default: '',
        required: false
    },
    year: {
        type: Number,
        required: false
    },
    post: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Post"
        }
     ],
     comment: [
         {
             type: mongoose.Schema.Types.ObjectId,
             ref: "Comment"
         }
     ],
    date: {
        type: String,
        default: Date.now
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
