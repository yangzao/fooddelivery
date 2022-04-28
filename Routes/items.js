const { createItem, updateItem, deleteItem, viewItem, listItem } = require('../Controllers/items');
const express = require('express');
const router = express.Router();

router.post('/create', createItem);
router.put('/update', updateItem);
router.delete('/delete', deleteItem);
router.get('/view', viewItem);
router.get('/list', listItem);

module.exports = router;