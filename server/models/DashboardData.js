// server/models/DashboardData.js
const mongoose = require('mongoose');

const DashboardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  value: { // הלינק לאתר
    type: String,
    required: true,
  },
  type: { // link, file, widget
    type: String,
    default: 'link',
  },
  category: { // work, social, design, etc.
    type: String,
    default: 'general',
  }
});

module.exports = mongoose.model('DashboardData', DashboardSchema);