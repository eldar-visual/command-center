// server/index.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const DashboardData = require('./models/DashboardData');

const app = express();

// --- פתרון CORS ידני (בלי ספריות) ---
// זה מוסיף את הכותרות הדרושות לכל תשובה שהשרת שולח
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // מאפשר גישה לכולם
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  // אם הדפדפן שואל "האם מותר?" (בקשת OPTIONS) - ענה מיד "כן"
  if (req.method === "OPTIONS") {
     return res.sendStatus(200);
  }
  next();
});

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