// models/Image.js
const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalname: { type: String, required: true },
  path: { type: String, required: true },
  contentType: { type: String, required: true },
  size: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Images = mongoose.model('Images', imageSchema);
module.exports = Images;
