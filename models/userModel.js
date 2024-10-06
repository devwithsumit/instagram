const mongoose = require('mongoose');
const { Schema, model } = mongoose
const plm = require('passport-local-mongoose');

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    name : {
        type : String,
        default: 'No Name'
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    bio: {
        type: String,
        default: ''
    },
    profilePicture: {
        type: String,
        default: 'https://static.vecteezy.com/system/resources/previews/009/292/244/large_2x/default-avatar-icon-of-social-media-user-vector.jpg'
        // Default profile picture if none is uploaded
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }],
    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

// Use passport-local-mongoose to handle username/password hashing
UserSchema.plugin(plm);
// , { usernameField: 'email' }

const User = model('User', UserSchema);
module.exports = User;
