const Item = require('../Models/items');
const Restaurant = require('../Models/restaurants')
const express = require('express');
const lodash = require('lodash');
const asyncHandler = require('express-async-handler');
const Joi = require('joi');

const createItem = ('/create', asyncHandler(async(req, res) => {
    if (!((await Restaurant.findById(req.body.restaurantID)).approved)){
        return res.status(200).send('Please wait for Admin to approve your registration');
    }
    const { error } = auth(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    let item = new Item(lodash.pick(req.body, ['restaurantID', 'name', 'image', 'description', 'price']));
    item.restaurantName = (await Restaurant.findById(req.body.restaurantID)).name;
    await item.save();
    return res.status(200).send('A new item was created');
}))

const updateItem = ('/update', asyncHandler(async(req, res) => {
    const { error } = validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

   await Item.findOneAndUpdate({ _id: req.body._id}, {
        name: req.body.name,
        image: req.body.image,
        description: req.body.description,
        price: req.body.price
    });
    return res.status(200).send('item info was updated');
}))


const deleteItem = ('/delete', asyncHandler(async(req, res) => {
    let item = await Item.findOne({ _id: req.body._id});
    if (!item) {
        return res.status(404).send('Item not found');
    }
    await item.delete();
    return res.status(200).send('Item was deleted');
}))

const viewItem = ('/view', asyncHandler(async(req, res) => {
    let item = await Item.findOne({ _id: req.body._id});
    if (!item) {
        return res.status(404).send('Item not found');
    }
    res.json({
        restaurantName: item.restaurantName,
        name: item.name,
        image: item.image,
        description: item.description,
        price: item.price,
    });
}))

const listItem = ('/list', asyncHandler(async(req, res) => {
    let item = await Item.find({restaurantID: req.body.restaurantID});
    res.json(item);
    /*res.json({
        name: item.name,
        image: item.image,
        description: item.description,
        price: item.price,
    });*/
}))

function auth(item) {
    const schema = Joi.object({
        restaurantID: Joi.string().required(),
        name: Joi.string().required(),
        image: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required()
    });
    return schema.validate(item);
}

function validate(item) {
    const schema = Joi.object({
        _id: Joi.string().required(),
        name: Joi.string().required(),
        image: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required()
    });
    return schema.validate(item);
}

module.exports = {createItem, updateItem, deleteItem, viewItem, listItem};