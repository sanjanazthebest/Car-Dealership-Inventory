
const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  make: { type: String, required: true, trim: true, maxlength: 80, index: true },
  model: { type: String, required: true, trim: true, maxlength: 80, index: true },
  category: { type: String, required: true, trim: true, maxlength: 50, index: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0, validate: Number.isInteger, default: 0 },
  year: { type: Number, min: 1886, max: new Date().getFullYear() + 2 },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  vin: { type: String, trim: true, uppercase: true, sparse: true, unique: true },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

vehicleSchema.index({ make: 1, model: 1 });
vehicleSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);

