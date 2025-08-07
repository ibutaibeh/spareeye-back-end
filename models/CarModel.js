const mongoose = require('mongoose');

const carModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  carType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarType',
    required: true,
  },
  year: {
    type: Number,
  },
});

module.exports = mongoose.model('CarModel', carModelSchema);
