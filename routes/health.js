const express = require('express');
const router = express.Router();

router.get('/live', (req, res) => res.json({ status: 'OK' }));
router.get('/ready', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: dbStatus === 'connected' ? 'OK' : 'DOWN',
    database: dbStatus
  });
});

module.exports = router;