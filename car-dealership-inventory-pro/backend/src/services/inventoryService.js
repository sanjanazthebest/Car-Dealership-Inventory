const Vehicle = require('../models/Vehicle');
const Purchase = require('../models/Purchase');
const AuditLog = require('../models/AuditLog');
const AppError = (status, code, message) => Object.assign(new Error(message), { status, code });
async function purchaseVehicle({ vehicleId, user, quantity, idempotencyKey, requestId }) {
  if (idempotencyKey) { const old=await Purchase.findOne({user:user._id,idempotencyKey}); if(old) return { purchase:old, replayed:true }; }
  // Atomic predicate + decrement prevents overselling without requiring replica-set transactions.
  const vehicle = await Vehicle.findOneAndUpdate({ _id:vehicleId, active:true, quantity:{$gte:quantity} }, { $inc:{quantity:-quantity} }, { new:true, runValidators:true });
  if (!vehicle) {
    const exists=await Vehicle.exists({_id:vehicleId,active:true});
    if (!exists) throw AppError(404,'VEHICLE_NOT_FOUND','Vehicle was not found.');
    throw AppError(409,'INSUFFICIENT_STOCK','Not enough vehicles are currently in stock.');
  }
  let purchase;
  try {
    [purchase] = await Purchase.create([{user:user._id,vehicle:vehicle._id,vehicleSnapshot:{make:vehicle.make,model:vehicle.model,category:vehicle.category,unitPrice:vehicle.price},quantity,totalPrice:Number((vehicle.price*quantity).toFixed(2)),idempotencyKey}]);
  } catch (err) {
    // Restore stock if the purchase record could not be persisted.
    await Vehicle.updateOne({_id:vehicle._id},{$inc:{quantity}});
    if (err.code===11000 && idempotencyKey) { const old=await Purchase.findOne({user:user._id,idempotencyKey}); if(old) return {purchase:old,replayed:true}; }
    throw err;
  }
  // Audit failure must not undo a valid purchase after it has been committed.
  await AuditLog.create({actor:user._id,action:'PURCHASE',vehicle:vehicle._id,quantityChange:-quantity,requestId}).catch(err=>console.error('Purchase audit log failed:',err.message));
  return {purchase,replayed:false};
}
module.exports = { purchaseVehicle, AppError };
