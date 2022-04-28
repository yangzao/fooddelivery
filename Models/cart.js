const mongoose = require('mongoose');

const Cart = mongoose.model('Cart', new mongoose.Schema({
    consumerID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    itemID: {
        type: mongoose.Schema.Types.ObjectId
    },
    quantity: {
        type: Number
    }
}));

module.exports = Cart;