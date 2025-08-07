const mongoose = require('mongoose');

const sparePartSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  carType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarType',
    required: true,
  },
  carModel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarModel',
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  description: String,
  price: Number,
  phone: String,
  image: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('SparePart', sparePartSchema);
