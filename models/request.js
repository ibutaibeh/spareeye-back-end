// models/request.js
const mongoose = require("mongoose");

const LinkSchema = new mongoose.Schema(
  {
    label: String,
    url: String,
    image: String,
  },
  { _id: false }
);

const messagesSchema = new mongoose.Schema({
  role: { type: String, required: true, enum: ["user", "assistant"] },
  text: { type: String, required: true },
  imageUrls: { type: [String], default: [] },
  links: { type: [LinkSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const carDetailsSchema = new mongoose.Schema({
  carType: { type: String, required: false },
  carModel: { type: String, required: false },
  carMade: { type: String, required: false },
  carYear: { type: String, required: false },
});

const requestSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String },
    carDetails: carDetailsSchema,
    image: { type: String },
    description: { type: String, required: false },
    messages: { type: [messagesSchema], default: [] },
  },
  { timestamps: true }
);

const Request = mongoose.model("Request", requestSchema);
module.exports = Request;
