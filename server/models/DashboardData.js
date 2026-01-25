// server/models/DashboardData.js
const mongoose = require('mongoose');

const DashboardDataSchema = new mongoose.Schema({
  title: { type: String, required: true },
  value: { type: String, required: true },
  section: { type: String, default: 'docs' },
  imageUrl: { type: String, default: '' },
  category: { type: String, default: 'כללי' },
  // השדה החדש ששומר את המיקום בגרירה
  order: { type: Number, default: 0 }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DashboardData', DashboardDataSchema);