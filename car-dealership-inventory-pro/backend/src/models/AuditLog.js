const mongoose = require('mongoose');
const auditSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true, enum: ['VEHICLE_CREATED','VEHICLE_UPDATED','VEHICLE_DELETED','PURCHASE','RESTOCK'] },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  quantityChange: { type: Number },
  note: { type: String, maxlength: 300, default: '' },
  requestId: String
}, { timestamps: true, versionKey: false });
auditSchema.index({ createdAt: -1 });
module.exports = mongoose.model('AuditLog', auditSchema);
