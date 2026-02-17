const express = require('express');
const router = express.Router();
const { handleChat, getRecommendation, clearSession } = require('../controllers/aiController');

router.post('/chat', handleChat);
router.post('/recommendation', getRecommendation);
router.post('/clear-session', clearSession);

module.exports = router;
