const mongoose = require('mongoose');

const websiteCategorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  domain: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['productive', 'unproductive', 'neutral']
  }
});

module.exports = mongoose.model('WebsiteCategory', websiteCategorySchema);
