const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  customer_id: { type: String, unique: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

CustomerSchema.pre('save', async function(next) {
  if (!this.customer_id) {
    const count = await mongoose.model('Customer').countDocuments();
    this.customer_id = `CUST${(count + 1).toString().padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Customer', CustomerSchema);