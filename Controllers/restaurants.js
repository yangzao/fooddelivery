const mongoose = require('mongoose');
const Restaurant = require('../Models/restaurants');
const Item = require('../Models/items');
const Order = require('../Models/orders');
const authRest = require('../Middlewares/authRest');
const express = require('express');
const bcrypt = require('bcrypt');
const lodash = require('lodash');
const jwt = require('jsonwebtoken');
const config = require('config');
const asyncHandler = require('express-async-handler');
const Joi = require('joi');

const restaurantRegister = ('/register', asyncHandler(async(req,res) => {
    const { error } = auth(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    // Check if this user already exisits
    let restaurant = await Restaurant.findOne({ email: req.body.email });
    if (restaurant) {
        return res.status(400).send('That user already exists!');
    } else {
        // Insert the new user if they do not exist yet
        restaurant = new Restaurant(lodash.pick(req.body, ['name', 'email', 'password', 'logo', 'shippingFee', 'description']));
        const salt = await bcrypt.genSalt(10);
        restaurant.password = await bcrypt.hash(restaurant.password, salt);
        restaurant.address = {
            address: req.body.address,
            city: req.body.city,
            postalCode: req.body.postalCode,
            phone: req.body.phone,
         };
        
        await restaurant.save();
        /*const token = jwt.sign({ _id: restaurant._id }, config.get('PrivateKey'));
        res.header('x-auth-token', token).send(lodash.pick(restaurant, ['_id', 'name', 'email']));*/
    }
}));

const restaurantLogin = ('/login', asyncHandler(async(req, res) => {
    const {error} = validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    let restaurant = await Restaurant.findOne({ email: req.body.email});
    if (!restaurant) {
        return res.status(400).send('Email not registered.');
    }
    const validPassword = await bcrypt.compare(req.body.password, restaurant.password);
    if (!validPassword) {
        return res.status(400).send('Incorrect password');
    }
    let token = jwt.sign({_id: restaurant._id}, config.get('PrivateKey'));
    restaurant.token = token;
    await restaurant.save();

    res.cookie('auth', restaurant.token).json(
        'restaurant logged in'
    );

}));

const restaurantProfile = ('/profile', authRest, asyncHandler(async(req, res) => {
    res.json({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        address: req.user.address.address,
        city: req.user.address.city,
        postalCode: req.user.address.postalCode,
        phone: req.user.address.phone
        
    })
}));

const logout = ('/logout', authRest, asyncHandler(async(req, res) => {
    res.clearCookie("auth");
    await req.user.set('token', null);
    req.user.save();
    res.status(200).send("log out");
}));


const viewOrders = ('/viewOrders', asyncHandler(async(req, res) => {
    const orders = await Order.find({restaurantID: req.body.restaurantID});
    let showOrders = [new mongoose.Schema({
        consumerEmail: {type: String},
        image: {type: String},
        totalPrice: {type: Number},
        orderStatus: {type: String},
        numOfItems: {type: Number},
        orderedAt: {type: String}
    })];

    showOrders = [];

    let numOfItems = 0;
    if(orders.length == 0){
        return res.status(404).send('no orders found');
    }
    for(i = 0; i< orders.length; i++){
        const item = await Item.findById(orders[i].orderItems[0].itemID);
        for(j = 0; j<orders[i].orderItems.length; j++){
            numOfItems = numOfItems + orders[i].orderItems[j].quantity;}
    
        showOrders.push({
            consumerEmail: orders[i].consumerEmail,
            image: item.image,
            totalPrice: orders[i].totalPrice,
            orderStatus: orders[i].orderStatus,
            numOfItems: numOfItems,
            orderedAt: orders[i].orderedAt
        })
    }
    res.json(showOrders);
}));

const viewOrder = ('/viewOrder', asyncHandler(async(req, res) => {
    const order = await Order.findById(req.body.orderID);

    let specific = new mongoose.Schema({
        consumerEmail: {type: String},
        address: {type: String},
        city: {type: String},
        postalCode: {type: String},
        phone: {type: String},
        totalPrice: {type: Number},
        shippingFee: {type: Number},
        orderStatus: {type: String},
        orderedAt: {type: String},
        orderID: {type: mongoose.Schema.Types.ObjectId},

        paymentMethod: {type: String},
        deliveryPerson: {type: String},
        estimateDeliveryTime: {type: String},
        deliveredAt: {type: String},

        items: [
            {
                itemID: {type: mongoose.Schema.Types.ObjectId},
                name: {type: String},
                price: {type: Number},
                quantity: {type: Number},
                image: {type: String}
            }]
    })

    specific = {
        consumerEmail: order.consumerEmail,
        address: order.shippingAddress.address,
        city: order.shippingAddress.city,
        postalCode: order.shippingAddress.postalCode,
        phone: order.shippingAddress.phone,
        totalPrice: order.totalPrice,
        shippingFee: order.shippingFee,
        orderStatus: order.orderStatus,
        orderedAt: order.orderedAt,
        orderID: order._id,

        paymentMethod: '',
        deliveryPerson: '',
        estimateDeliveryTime: '',
        deliveredAt: '',

        items: []

    }

    for(i = 0; i< order.orderItems.length; i++){
        const item = await Item.findById(order.orderItems[i].itemID);
        specific.items.push({
            itemID: item._id,
            name: item.name,
            price: order.orderItems[i].price,
            image: item.image,
            quantity: order.orderItems[i].quantity
        })
    }
    
    if (order.orderStatus == 'Paid'||'Accepted'){
        specific.paymentMethod = order.paymentMethod
    }
    if (order.orderStatus == 'Shipped'){
        specific.deliveryPerson = order.deliveryPerson;
        specific.estimateDeliveryTime = '待计算'
    }
    if (order.orderStatus == 'Delivered'){
        specific.deliveryPerson = order.deliveryPerson,
        specific.deliveredAt = order.deliveredAt
    }

    res.json(specific)

    
}));

function auth(restaurant) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required(),
        address: Joi.string().required(),
        city: Joi.string().required(),
        postalCode: Joi.string().required(),
        phone: Joi.string().required(),
        logo: Joi.string().required(),
        shippingFee: Joi.number().required(),
        description: Joi.string().required()
    });
    return schema.validate(restaurant);
}


function validate(restaurant) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required(),
    });
    return schema.validate(restaurant);
}


module.exports = {restaurantRegister, restaurantLogin, restaurantProfile, logout, viewOrders, viewOrder};