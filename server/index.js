require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const DashboardData = require('./models/DashboardData');

const app = express();
app.use(cors());
app.use(express.json());

// חיבור לדאטהבייס
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// שליפת הנתונים
app.get('/api/data', async (req, res) => {
    try {
        let data = await DashboardData.findOne();
        if (!data) {
            // יצירת נתונים התחלתיים אם אין כלום
            data = await DashboardData.create({ topics: [], quickPills: [], visualFavs: [] });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// עדכון הנתונים (שמירה)
app.post('/api/data', async (req, res) => {
    try {
        // מעדכן את המסמך היחיד או יוצר חדש
        // (בפרויקט אמיתי מרובה משתמשים היינו מסננים לפי UserID)
        const { topics, quickPills, visualFavs } = req.body;

        // מחיקת הקודם ויצירת חדש (הכי פשוט לניהול Drag&Drop)
        // או שימוש ב updateOne עם upsert
        await DashboardData.deleteMany({});
        const newData = await DashboardData.create({ topics, quickPills, visualFavs });

        res.json(newData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));