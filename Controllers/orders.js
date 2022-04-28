const Order = require('../Models/orders');
const Cart = require('../Models/cart');
const Restaurant = require('../Models/restaurants')
const Consumer = require('../Models/consumers')
const Item = require('../Models/items')
const express = require('express');
const lodash = require('lodash');
const asyncHandler = require('express-async-handler');
const Joi = require('joi');
const dateTime = require('node-datetime');

const placeOrder = ('/place', asyncHandler(async(req, res) => {
    let cart = await Cart.find({consumerID: req.body.consumerID});
    let order = new Order(lodash.pick(req.body, ['consumerID']));
    for(i = 0; i < cart.length; i++){
        let singlePrice = (await Item.findById(cart[i].itemID)).price;
        let quan = cart[i].quantity;
        order.orderItems.push({
            itemID: cart[i].itemID,
            price: singlePrice,
            quantity: quan
        });
        order.totalPrice = order.totalPrice + singlePrice*quan
    };
    order.restaurantID = (await Item.findById(cart[0].itemID)).restaurantID;
    order.restaurantName = (await Restaurant.findById(order.restaurantID)).name;
    order.consumerEmail = (await Consumer.findById(req.body.consumerID)).email;
    order.shippingFee = (await Restaurant.findById(order.restaurantID)).shippingFee
    order.totalPrice = order.totalPrice + order.shippingFee;
    order.orderedAt = currentTime();
    order.orderStatus = 'Placed';
    await order.save();
    await Cart.deleteMany({consumerID: req.body.consumerID});
    return res.json(order._id);
}));

const shippingAddr = ('/shipping', asyncHandler(async(req, res) =>{
    let order = await Order.findById(req.body.orderID);
    order.shippingAddress = {
       address: req.body.address,
       city: req.body.city,
       postalCode: req.body.postalCode,
       phone: req.body.phone,
    }
    await order.save();
    return res.status(200).send('shipping address fullfilled');
}));

const makePayment = ('/pay', asyncHandler(async(req, res) => {
    let order = await Order.findById(req.body.orderID);
    order.paymentMethod = req.body.paymentMethod;
    order.orderStatus = 'Paid';
    await order.save();
    return res.status(200).send('payment was made successfully');
}));

const acceptOrder = ('/accept', asyncHandler(async(req, res) => {
    let order = await Order.findById(req.body.orderID);
    order.orderStatus = 'Accepted';
    order.save();
    return res.status(200).send('order was accepted');
}));

const assignAndShip = ('/ship', asyncHandler(async(req, res) => {
    let order = await Order.findById(req.body.orderID);
    order.deliveryPerson = req.body.deliveryPerson;
    order.orderStatus = 'Shipped';
    await order.save();
    return res.status(200).send('order was shipped successfully');
}));

const confirmDelivery = ('/delivered',  asyncHandler(async(req, res) => {
    let order = await Order.findById(req.body.orderID);
    order.orderStatus = 'Delivered';
    order.deliveredAt = currentTime();
    await order.save();
    return res.status(200).send('order was delivered successfully');
}));

function currentTime(){
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
    return formatted;
};

module.exports = {placeOrder, shippingAddr, makePayment, acceptOrder, assignAndShip, confirmDelivery};