const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  order_id: { type: String, unique: true },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  sku_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SKU', required: true },
  quantity: { type: Number, required: true },
  rate: { type: Number, required: true },
  total_amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});


OrderSchema.index({ customer_id: 1 });
OrderSchema.index({ sku_id: 1 });
OrderSchema.index({ createdBy: 1 });
OrderSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Order', OrderSchema);