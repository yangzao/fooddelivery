const {placeOrder, shippingAddr, makePayment, acceptOrder, assignAndShip, confirmDelivery} = require('../Controllers/orders');

const express = require('express');
const router = express.Router();

router.post('/place', placeOrder);
router.put('/shipping', shippingAddr);
router.put('/pay', makePayment);
router.put('/accept', acceptOrder);
router.put('/ship', assignAndShip);
router.put('/delivered', confirmDelivery);

module.exports = router;