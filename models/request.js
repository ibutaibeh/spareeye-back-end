// models/request.js
const mongoose = require('mongoose');

const carDetailsSchema = new mongoose.Schema(
  {
    carType: {
      type: String,
      required: true
    },
    carModel: {
      type: String,
      required: true
    },
    carMade: {
      type: String,
      required: true
    },
    carYear: {
      type: String,
      required: true
    },
  }
)

const requestSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: {
      type: Date,
      required: true,
    },
    carDetails: [carDetailsSchema],
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } //this is to let MongoDB track the record created data and updated data
);

const Request = mongoose.model('Request', requestSchema);
module.exports = Request;