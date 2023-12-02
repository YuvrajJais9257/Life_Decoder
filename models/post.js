const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: String,
    entry: String,
    user: {
        type: String, 
        ref: 'User',
        required: true,
    },
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
