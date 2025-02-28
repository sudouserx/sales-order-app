const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const HourlySummary = require('../models/HourlySummary');

router.get('/hourly-summaries', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    
    const summaries = await HourlySummary.find().sort({ timestamp: -1 });
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;