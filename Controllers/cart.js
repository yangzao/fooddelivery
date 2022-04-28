const Cart = require('../Models/cart');
const Consumer = require('../Models/consumers');
const Order = require('../Models/orders');
const Restaurant = require('../Models/restaurants');
const Item = require('../Models/items');
const express = require('express');
const bcrypt = require('bcrypt');
const lodash = require('lodash');
const jwt = require('jsonwebtoken');
const config = require('config');
const asyncHandler = require('express-async-handler');
const Joi = require('joi');
const mongoose = require('mongoose');
const { isArray } = require('lodash');


const addToCart = ('/addto', asyncHandler(async(req,res) => {
    let cart = await Cart.findOne({consumerID: req.body.consumerID, itemID: req.body.itemID});
    if(cart == null){
        let cart = new Cart(lodash.pick(req.body, ['consumerID', 'itemID', 'quantity']));
        await cart.save();
        return res.status(200).send('item was added to your cart');
    }
    else{
        let quan = cart.quantity + req.body.quantity;
        await Cart.findOneAndUpdate({consumerID: req.body.consumerID, itemID: req.body.itemID}, {
            quantity: quan
        });
        return res.status(200).send('item was added to your cart');
    }
}));

const addOne = ('/add1', asyncHandler(async(req,res) => {
    let cart = await Cart.findOne({consumerID: req.body.consumerID, itemID: req.body.itemID});
    let quan = cart.quantity + 1;
    await Cart.findOneAndUpdate({consumerID: req.body.consumerID, itemID: req.body.itemID}, {
        quantity: quan
    });
    return res.status(200).send('item quantity was added by one');
}));

const subOne = ('/sub1', asyncHandler(async(req,res) => {
    let cart = await Cart.findOne({consumerID: req.body.consumerID, itemID: req.body.itemID});
    let quan = cart.quantity - 1;
    if(quan != 0){
        await Cart.findOneAndUpdate({consumerID: req.body.consumerID, itemID: req.body.itemID}, {
        quantity: quan
    })
    return res.status(200).send('item quantity was subtracted by one');};
    cart.delete();
    return res.status(200).send('Item was deleted');
}));

const listCart = ('/list', asyncHandler(async(req,res) => {
    let cart = await Cart.find({consumerID: req.body.consumerID});
    if(cart.length == 0){
        return res.status(200).send('no items in cart');
    }

    let restaurant = await Restaurant.findById((await Item.findById(cart[0].itemID)).restaurantID);

    let specific = new mongoose.Schema({
        restaurantName: {type: String},
        shippingFee: {type: Number},
        totalPrice: {type: Number},
        items: [
            {
                itemID: {type: mongoose.Schema.Types.ObjectId},
                name: {type: String},
                price: {type: Number},
                quantity: {type: Number},
                image: {type: String}
            }
          ]
    })
    specific = {
        restaurantName: restaurant.name,
        shippingFee: restaurant.shippingFee,
        totalPrice: 0,
        items: []
    }
    for(i = 0; i< cart.length; i++){
        let item = await Item.findById(cart[i].itemID);
        specific.items.push({
            itemID: cart[i].itemID,
            name: item.name,
            price: item.price,
            quantity: cart[i].quantity,
            image: item.image
        });
        specific.totalPrice = specific.totalPrice + item.price * cart[i].quantity;
    }
    specific.totalPrice = specific.totalPrice + specific.shippingFee;
    res.json(specific);

}));

const deleteItem = ('/delete', asyncHandler(async(req, res) => {
    (await Cart.findOne({consumerID: req.body.consumerID, itemID: req.body.itemID})).delete();
    return res.status(200).send('Item was deleted');
}))

const clearCart = ('/clear', asyncHandler(async(req, res) => {
    await Cart.deleteMany({consumerID: req.body.consumerID});
    return res.status(200).send('cart was cleared');
}))

module.exports = {addToCart, addOne, subOne, listCart, deleteItem, clearCart};