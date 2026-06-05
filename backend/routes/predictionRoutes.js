const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { getPrediction } = require('../controllers/predictionController');

// Get prediction for logged in student
router.get('/predict', verifyToken, getPrediction);

module.exports = router;