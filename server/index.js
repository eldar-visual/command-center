// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// ייבוא המודל
const DashboardData = require('./models/DashboardData');

const app = express();

// הגדרות אבטחה וחיבור
app.use(cors());
app.use(express.json());

// התחברות לדאטה-בייס
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// --- נתיבים (Routes) ---

// 1. קבלת כל הפריטים (GET)
app.get('/api/data', async (req, res) => {
  try {
    // שליפת כל הנתונים ומיון לפי סדר יצירה (החדש ביותר למעלה)
    const items = await DashboardData.find().sort({ createdAt: -1 });
    res.json(items); // חשוב: מחזיר מערך []
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. הוספת פריט חדש (POST)
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

// 3. מחיקת פריט (DELETE)
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