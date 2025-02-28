const mongoose = require('mongoose');

const SKUSchema = new mongoose.Schema({
  sku_id: { type: String, unique: true },
  sku_name: { type: String, required: true },
  unit_of_measurement: { type: String, required: true },
  tax_rate: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

SKUSchema.pre('save', async function(next) {
  if (!this.sku_id) {
    const count = await mongoose.model('SKU').countDocuments();
    this.sku_id = `SKU${(count + 1).toString().padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('SKU', SKUSchema);