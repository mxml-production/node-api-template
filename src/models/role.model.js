const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    }
});

module.exports = mongoose.model('Role', roleSchema);