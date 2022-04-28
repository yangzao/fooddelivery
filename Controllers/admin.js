const Restaurant = require('../Models/restaurants')
const express = require('express');
const lodash = require('lodash');
const asyncHandler = require('express-async-handler');
const Joi = require('joi');

const showR = ('/show', asyncHandler(async(req, res) => {
    let unApproved = await Restaurant.find({approved: false});
    let approved = await Restaurant.find({approved: true});
    res.json(unApproved);
    res.json(approved);

}));

const approveR = ('/approve', asyncHandler(async(req, res) => {
    let unApproved = await Restaurant.findById(req.body.restaurantID);
    unApproved.approved = true;
    await unApproved.save();
    return res.status(200).send('you have approved this registration');
}));

module.exports = {showR, approveR};