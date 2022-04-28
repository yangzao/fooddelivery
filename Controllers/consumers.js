const mongoose = require('mongoose');
const Consumer = require('../Models/consumers');
const Order = require('../Models/orders');
const Restaurant = require('../Models/restaurants');
const Item = require('../Models/items');
const authCons = require('../Middlewares/authCons');
const express = require('express');
const bcrypt = require('bcrypt');
const lodash = require('lodash');
const jwt = require('jsonwebtoken');
const config = require('config');
const asyncHandler = require('express-async-handler');
const Joi = require('joi');

const consumerRegister = ('/register', asyncHandler(async(req,res) => {
    const { error } = auth(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    // Check if this user already exisits
    let consumer = await Consumer.findOne({ email: req.body.email });
    if (consumer) {
        return res.status(400).send('That user already exists!');
    } else {
        // Insert the new user if they do not exist yet
        consumer = new Consumer(lodash.pick(req.body, ['name', 'email', 'password']));
        const salt = await bcrypt.genSalt(10);
        consumer.password = await bcrypt.hash(consumer.password, salt);
        consumer.address = {
            address: req.body.address,
            city: req.body.city,
            postalCode: req.body.postalCode,
            phone: req.body.phone,
         }
        await consumer.save();
        return res.status(200).send('user was registered successfully!');
       /* const token = jwt.sign({ _id: consumer._id }, config.get('PrivateKey'));
        res.header('x-auth-token', token).send(lodash.pick(consumer, ['_id', 'name', 'email']));*/
    }
}));

const consumerLogin = ('/login', asyncHandler(async(req, res) => {
    const {error} = validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    let consumer = await Consumer.findOne({ email: req.body.email});
    if (!consumer) {
        return res.status(400).send('Email not registered.');
    }
    const validPassword = await bcrypt.compare(req.body.password, consumer.password);
    if (!validPassword) {
        return res.status(400).send('Incorrect password');
    }
    let token = jwt.sign({_id: consumer._id}, config.get('PrivateKey'));
    consumer.token = token;
    await consumer.save();

    res.cookie('auth', consumer.token).json(
        'user logged in'
    );
}));

const consumerProfile = ('/profile', authCons, asyncHandler(async(req, res) => {
    res.json({
        id: req.user._id,
        email: req.user.email,
        name: req.user.name
        
    })
}));

const logout = ('/logout', authCons, asyncHandler(async(req, res) => {
    res.clearCookie("auth");
    await req.user.set('token', null);
    req.user.save();
    res.status(200).send("log out");
    
}));

const viewRests = ('/nearby', asyncHandler(async(req, res) => {
    const restaurants = await Restaurant.find({approved: true});
    let approvedRest = [new mongoose.Schema({
        name: {type: String},
        description: {type: String},
        shippingFee: {type: Number},
        location: {type: String},
        logo: {type: String}
    })]
    if(restaurants.length == 0){
        return res.status(404).send('no restaurants found');
    }
    for(i = 0; i< restaurants.length; i++){
        approvedRest[i] = {
            name: restaurants[i].name,
            description: restaurants[i].description,
            shippingFee: restaurants[i].shippingFee,
            location: '待计算',
            logo: restaurants[i].logo
        }
    }
    res.json(approvedRest)
}));

const viewRest = ('/view', asyncHandler(async(req, res) => {
    const restaurant = await Restaurant.findById(req.body.restaurantID);
    let specific = new mongoose.Schema({
        restaurantName: {type: String},
        restaurantDes: {type: String},
        shippingFee: {type: Number},
        location: {type: String},
        logo: {type: String},
        items: [
            {
                itemID: {type: mongoose.Schema.Types.ObjectId},
                name: {type: String},
                description: {type: String},
                price: {type: Number},
                image: {type: String}
            }
          ]
    })
    specific = {
        restaurantName: restaurant.name,
        restaurantDes: restaurant.description,
        logo: restaurant.logo,
        shippingFee: restaurant.shippingFee,
        location: "待计算",
        items: []
    }
    let items = await Item.find({restaurantID: req.body.restaurantID});
    for(i = 0; i< items.length; i++){
        specific.items.push({
            itemID: items[i]._id,
            name: items[i].name,
            description: items[i].description,
            price: items[i].price,
            image: items[i].image
        });
    }
    res.json(specific)
}));

const viewOrders = ('/viewOrders', asyncHandler(async(req, res) => {
    const orders = await Order.find({consumerID: req.body.consumerID});
    let showOrders = [new mongoose.Schema({
        restaurantName: {type: String},
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
            restaurantName: orders[i].restaurantName,
            image: item.image,
            totalPrice: orders[i].totalPrice,
            orderStatus: orders[i].orderStatus,
            numOfItems: numOfItems,
            orderedAt: orders[i].orderedAt
        })
    }
    res.json(showOrders)
}));

const viewOrder = ('/viewOrder', asyncHandler(async(req, res) => {
    const order = await Order.findById(req.body.orderID);

    let specific = new mongoose.Schema({
        restaurantName: {type: String},
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
        restaurantName: order.restaurantName,
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

function auth(consumer) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required(),
        address: Joi.string().required(),
        city: Joi.string().required(),
        postalCode: Joi.string().required(),
        phone: Joi.string().required()
    });
    return schema.validate(consumer);
}


function validate(consumer) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required(),
    });
    return schema.validate(consumer);
}


module.exports = {consumerRegister, consumerLogin, consumerProfile, logout, viewRests, viewRest, viewOrders, viewOrder};