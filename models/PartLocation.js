const mongoose = require('mongoose');

const partLocationSchema = new mongoose.Schema({
  city: String,
  country: String,
  address: String,
  coordinates: {
    lat: Number,
    lng: Number,
  },
});

module.exports = mongoose.model('PartLocation', partLocationSchema);
