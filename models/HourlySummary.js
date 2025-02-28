const mongoose = require('mongoose');

const HourlySummarySchema = new mongoose.Schema({
  total_orders: { type: Number, required: true },
  total_amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HourlySummary', HourlySummarySchema);