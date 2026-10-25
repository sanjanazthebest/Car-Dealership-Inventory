const mongoose = require('mongoose');
const purchaseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  vehicleSnapshot: { make: String, model: String, category: String, unitPrice: Number },
  quantity: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true, min: 0 },
  idempotencyKey: { type: String, sparse: true },
  status: { type: String, enum: ['confirmed'], default: 'confirmed' }
}, { timestamps: true, versionKey: false });
purchaseSchema.index({ user: 1, createdAt: -1 });
purchaseSchema.index({ user: 1, idempotencyKey: 1 }, { unique: true, sparse: true });
module.exports = mongoose.model('Purchase', purchaseSchema);
