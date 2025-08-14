// models/request.js
const mongoose = require('mongoose');


const messagesSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    }
  }
)

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
    name: {
      type: String,
    },
    carDetails: carDetailsSchema,
    image: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    messages: [messagesSchema]
  },
  { timestamps: true } //this is to let MongoDB track the record created data and updated data
);

const Request = mongoose.model('Request', requestSchema);
module.exports = Request;