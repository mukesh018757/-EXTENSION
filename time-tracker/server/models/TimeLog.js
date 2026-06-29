const mongoose = require('mongoose');

const timeLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  domain: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['productive', 'unproductive', 'neutral']
  },
  seconds: {
    type: Number,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TimeLog', timeLogSchema);
