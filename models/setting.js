const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
    aiVoice: { type: String, enum: ['male', 'female'], default: 'male' },

    notifications: { type: Boolean, default: false },
    autoUpdates: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', SettingsSchema);
