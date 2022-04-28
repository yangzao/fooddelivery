const {addToCart, addOne, subOne, listCart, deleteItem, clearCart} = require('../Controllers/cart');

const express = require('express');
const router = express.Router();

router.post('/addto', addToCart);
router.put('/add1', addOne);
router.put('/sub1', subOne);
router.get('/list', listCart);
router.delete('/delete', deleteItem);
router.delete('/clear', clearCart);

module.exports = router;