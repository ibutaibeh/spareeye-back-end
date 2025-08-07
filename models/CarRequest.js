const mongoose = require('mongoose');

const carRequestSchema = new mongoose.Schema({
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  carType: {
    type: String,
    required: true,
  },
  carModel: {
    type: String,
  },
  year: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('CarRequest', carRequestSchema);
