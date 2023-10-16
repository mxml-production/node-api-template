const mongoose = require('mongoose');
const mongooseSlugUpdater = require('mongoose-slug-updater');

mongoose.plugin(mongooseSlugUpdater);

const establishmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    cover: String,
    images: [String],
    slug: {
        type: String,
        slug: 'name',
        unique: true,
    },
    address: {
        type: String,
        required: true,
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    phone: {
        type: String,
        required: true,
        min: 10,
        max: 10
    },
    link: String,
    email: {
        type: String,
        required: true
    },
    minPrice: {
        type: Number,
        required: true,
        min: 1
    },
    maxPrice: {
        type: Number,
        required: true,
        min: 1
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
