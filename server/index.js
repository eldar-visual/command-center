// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // חובה
require('dotenv').config();

const DashboardData = require('./models/DashboardData');

const app = express();

// --- כאן התיקון: פתיחת גישה לכולם ---
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// התחברות לדאטה-בייס
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// --- נתיבים ---

app.get('/api/data', async (req, res) => {
  try {
    const items = await DashboardData.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/data', async (req, res) => {
  try {
    const newItem = new DashboardData({
      title: req.body.title,
      value: req.body.value,
      section: req.body.section || 'docs',
      imageUrl: req.body.imageUrl || '',
      category: req.body.category || 'general'
    });
    const savedItem = await newItem.save();
    res.json(savedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/data/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await DashboardData.findByIdAndDelete(id);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));