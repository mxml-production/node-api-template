const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    expires: {
        type: Date,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Token', tokenSchema);