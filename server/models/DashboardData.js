// server/models/DashboardData.js
const mongoose = require('mongoose');

const DashboardDataSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  section: {
    type: String, // 'docs', 'buttons', 'visuals'
    default: 'docs'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  // --- זה השדה שהיה חסר ולכן הטאבים נעלמו ---
  category: {
    type: String,
    default: 'כללי' 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DashboardData', DashboardDataSchema);