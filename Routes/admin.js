const { showR, approveR } = require('../Controllers/admin');
const express = require('express');
const router = express.Router();

router.get('/show', showR);
router.put('/approve', approveR);

module.exports = router;