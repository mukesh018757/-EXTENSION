const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const TimeLog = require('../models/TimeLog');
const { classifyDomain } = require('../utils/classifier');

const router = express.Router();

// Save synced time logs from the extension
router.post('/sync', authMiddleware, async (req, res) => {
  try {
    const { logs = [] } = req.body;

    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({ message: 'No logs provided' });
    }

    const normalizedLogs = logs.map(log => ({
      userId: req.user._id,
      domain: log.domain,
      category: log.category || classifyDomain(log.domain),
      seconds: Number(log.seconds) || 0,
      date: log.date
    }));

    await TimeLog.insertMany(normalizedLogs);
    res.json({ message: 'Logs synced successfully' });
  } catch (error) {
    console.error('Sync error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get today's logs for the logged-in user
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const logs = await TimeLog.find({ userId: req.user._id, date: today }).sort({ domain: 1 });
    res.json(logs);
  } catch (error) {
    console.error('Today logs error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get logs for the last 7 days
router.get('/week', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 6);

    const startDate = start.toISOString().slice(0, 10);
    const logs = await TimeLog.find({
      userId: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    res.json(logs);
  } catch (error) {
    console.error('Week logs error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
