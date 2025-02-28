const cron = require('node-cron');
const { HourlySummary, Order } = require('./models');

module.exports = function setupCron() {
  cron.schedule('0 * * * *', async () => {
    const start = new Date();
    start.setHours(start.getHours() - 1);
    
    const orders = await Order.find({
      timestamp: { $gte: start, $lt: new Date() }
    });
    
    const summary = new HourlySummary({
      total_orders: orders.length,
      total_amount: orders.reduce((sum, o) => sum + o.total_amount, 0),
      timestamp: new Date()
    });
    
    await summary.save();
    console.log('Hourly summary saved:', summary);
  });
};