const mongoose = require('mongoose');

const Order = mongoose.model("Order", new mongoose.Schema(
  {
    consumerID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    consumerEmail: {
      type: String
    },
    restaurantID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Restaurant',
    },
    restaurantName: {
      type: String
    },
    orderItems: [
      {
        itemID: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Item',
        },
        price: {
          type: Number,
          required: true
        },
        quantity: { type: Number, required: true }
      },
    ],
    shippingAddress: {
      address: { type: String },
      city: { type: String },
      postalCode: { type: String },
      phone: { type: String },
    },
    paymentMethod: {
      type: String
    },
    shippingFee: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    orderStatus: {
      type: String,
      required: true  
    },
    orderedAt: {
      type: String
    },
    deliveryPerson: {
      type: String
    },
    deliveredAt: {
      type: String
    },
    estimateDeliveryTime: {
      type: String
    }
  } 
));

module.exports = Order;