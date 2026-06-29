const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const TimeLog = require('../models/TimeLog');

const router = express.Router();

// Get summary data for a selected date
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const logs = await TimeLog.find({ userId: req.user._id, date });

    const total = logs.reduce((sum, item) => sum + item.seconds, 0);
    const productive = logs.filter(item => item.category === 'productive').reduce((sum, item) => sum + item.seconds, 0);
    const unproductive = logs.filter(item => item.category === 'unproductive').reduce((sum, item) => sum + item.seconds, 0);
    const neutral = logs.filter(item => item.category === 'neutral').reduce((sum, item) => sum + item.seconds, 0);

    const topDomains = logs
      .reduce((acc, item) => {
        const existing = acc.find(entry => entry.domain === item.domain);
        if (existing) {
          existing.seconds += item.seconds;
        } else {
          acc.push({ domain: item.domain, seconds: item.seconds, category: item.category });
        }
        return acc;
      }, [])
      .sort((a, b) => b.seconds - a.seconds)
      .slice(0, 10);

    res.json({ total, productive, unproductive, neutral, topDomains });
  } catch (error) {
    console.error('Summary error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get weekly productivity data
router.get('/weekly', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    const startDate = start.toISOString().slice(0, 10);

    const logs = await TimeLog.find({
      userId: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    const dailyMap = {};
    logs.forEach(item => {
      if (!dailyMap[item.date]) dailyMap[item.date] = { date: item.date, productive: 0, unproductive: 0 };
      if (item.category === 'productive') dailyMap[item.date].productive += item.seconds;
      if (item.category === 'unproductive') dailyMap[item.date].unproductive += item.seconds;
    });

    const last7Days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const current = new Date(now);
      current.setDate(now.getDate() - i);
      const key = current.toISOString().slice(0, 10);
      last7Days.push({
        date: key,
        productive: (dailyMap[key] && dailyMap[key].productive) || 0,
        unproductive: (dailyMap[key] && dailyMap[key].unproductive) || 0
      });
    }

    const scores = last7Days.map(day => {
      const total = day.productive + day.unproductive;
      return total ? Math.round((day.productive / total) * 100) : 0;
    });

    const overallWeekScore = scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : 0;

    res.json({ data: last7Days, overallWeekScore });
  } catch (error) {
    console.error('Weekly error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get top sites for the week
router.get('/topsites', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    const startDate = start.toISOString().slice(0, 10);

    const logs = await TimeLog.find({
      userId: req.user._id,
      date: { $gte: startDate }
    });

    const summary = {};
    logs.forEach(item => {
      if (!summary[item.domain]) summary[item.domain] = { domain: item.domain, seconds: 0, category: item.category };
      summary[item.domain].seconds += item.seconds;
    });

    const result = Object.values(summary)
      .sort((a, b) => b.seconds - a.seconds)
      .slice(0, 10);

    res.json(result);
  } catch (error) {
    console.error('Top sites error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
