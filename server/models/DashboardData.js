const mongoose = require('mongoose');

const DashboardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  value: { type: String, required: true }, // הלינק
  section: { 
    type: String, 
    default: 'docs', 
    enum: ['docs', 'buttons', 'visuals'] // שלושת האזורים: מסמכים, כפתורים צבעוניים, כרטיסיות
  },
  imageUrl: { type: String }, // אופציונלי: תמונה שהמשתמש העלה
  order: { type: Number, default: 0 }, // הכנה ל-Drag & Drop עתידי
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DashboardData', DashboardSchema);