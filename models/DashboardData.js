import mongoose from 'mongoose';

const DashboardDataSchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: { type: String },
  value: { type: String },
  section: { type: String },
  isFavorite: { type: Boolean, default: false },
  isPinnedToMain: { type: Boolean, default: false },
  spaceId: { type: String },
  customTab: { type: String },
  userId: { type: String },
  order: { type: Number, default: 0 },
  customIcon: { type: String }, 
}, { timestamps: true });

delete mongoose.models.DashboardData;

export default mongoose.model('DashboardData', DashboardDataSchema); 