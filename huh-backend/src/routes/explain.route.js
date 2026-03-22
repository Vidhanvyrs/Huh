const express = require('express');
const router = express.Router();
const { explainVideoSegment } = require('../controllers/explain.controller');

// POST /api/explain
router.post('/', explainVideoSegment);

module.exports = router;
