const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        min: 3,
        max: 20
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        min: 3,
        max: 20
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    salt: {
        type: String,
        required: true
    },
    password: {
        type: String,
        trim: true,
        required: true
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    },
    phone: {
        type: String
    },
    address: {
        type: String
    },
    enabled: {
        type: Boolean,
        default: true,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
