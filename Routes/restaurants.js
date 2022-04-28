const { restaurantRegister, restaurantLogin, restaurantProfile, logout, viewOrders, viewOrder} = require('../Controllers/restaurants');
const express = require('express');
const authRest = require('../Middlewares/authRest');
const router = express.Router();

router.post('/register', restaurantRegister);
router.put('/login', restaurantLogin);
router.get('/profile', authRest, restaurantProfile);
router.put('/logout', authRest, logout);
router.get('/viewOrders', viewOrders);
router.get('/viewOrder', viewOrder);

module.exports = router;