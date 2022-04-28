const { consumerRegister, consumerLogin, consumerProfile, logout, viewRests, viewRest, viewOrders, viewOrder } = require('../Controllers/consumers');
const express = require('express');
const authCons = require('../Middlewares/authCons');
const router = express.Router();

router.post('/register', consumerRegister);
router.put('/login', consumerLogin);
router.get('/profile', authCons, consumerProfile);
router.put('/logout', authCons, logout)

router.get('/nearby',viewRests);
router.get('/view',viewRest);
router.get('/viewOrders',viewOrders); 
router.get('/viewOrder',viewOrder);

module.exports = router;