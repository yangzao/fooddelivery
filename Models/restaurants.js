const mongoose = require('mongoose');

const Restaurant = mongoose.model('Restaurant', new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    approved: {
        type: Boolean,
        required: true,
        default: false
    },
    address: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        phone: { type: String, required: true },
    },
    description: {
        type: String,
        required: true
    },
    shippingFee: {
        type: Number,
        required: true
    },
    logo: {
        type: String,
        required: true
    },
    token: {
        type: String
    }
}));

module.exports = Restaurant;