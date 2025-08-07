// models/request.js
const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: {
      type: Date,
      required: true,
    },
    carDetails: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Request = mongoose.model('Request', requestSchema);
module.exports = Request;