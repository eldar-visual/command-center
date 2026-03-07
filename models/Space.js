import mongoose from 'mongoose';

const SpaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: String }, 
  iconName: { type: String, default: 'Folder' }, 
  color: { type: String, default: '#94a3b8' },
  customTabs: { type: [String], default: [] }
}, { timestamps: true });

delete mongoose.models.Space;

export default mongoose.model('Space', SpaceSchema);