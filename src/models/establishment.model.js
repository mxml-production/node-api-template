const mongoose = require('mongoose');
const mongooseSlugUpdater = require('mongoose-slug-updater');

mongoose.plugin(mongooseSlugUpdater);

const establishmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        min: 3,
        max: 20
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        slug: 'name',
        unique: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        min: 3,
        max: 20
    },
    zipCode: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        min: 3,
        max: 20
    },
    phone: {
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
        lowercase: true
    },
    price: {
        type: Number,
        required: true,
        trim: true,
        lowercase: true
    },
    timeZone: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    language: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    currency: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        default: 'EUR'
    },
    visible: {
        type: Boolean,
        default: true,
        required: true
    },
    enable: {
        type: Boolean,
        default: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City'
    }
}, { timestamps: true });

module.exports = mongoose.model('Establishment', establishmentSchema);
