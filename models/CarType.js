const mongoose = require('mongoose');

const carTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model('CarType', carTypeSchema);
