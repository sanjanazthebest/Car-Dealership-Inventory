const Vehicle=require('../models/Vehicle'); const AuditLog=require('../models/AuditLog'); const {purchaseVehicle,AppError}=require('../services/inventoryService');
const positiveInt=(v,def)=>{const n=Number(v??def);return Number.isInteger(n)&&n>0?n:def;};
exports.list=async(req,res)=>{
 const page=positiveInt(req.query.page,1), limit=Math.min(positiveInt(req.query.limit,12),100); const filter={active:true};
 // Admins may include zero-stock vehicles, but archived records remain hidden.
 if(req.query.make) filter.make={$regex:escapeRegex(req.query.make),$options:'i'};
 if(req.query.model) filter.model={$regex:escapeRegex(req.query.model),$options:'i'};
 if(req.query.category) filter.category={$regex:escapeRegex(req.query.category),$options:'i'};
 if(req.query.q){const q=escapeRegex(req.query.q);filter.$or=[{make:{$regex:q,$options:'i'}},{model:{$regex:q,$options:'i'}},{category:{$regex:q,$options:'i'}}];}
 if(req.query.minPrice!==undefined||req.query.maxPrice!==undefined){filter.price={};if(req.query.minPrice!==undefined)filter.price.$gte=Number(req.query.minPrice);if(req.query.maxPrice!==undefined)filter.price.$lte=Number(req.query.maxPrice);}
 if(!(req.query.includeOutOfStock==='true'&&req.user.role==='admin')) filter.quantity={$gt:0};
 const sortMap={price_asc:{price:1},price_desc:{price:-1},newest:{createdAt:-1},make:{make:1,model:1}};const sort=sortMap[req.query.sort]||{createdAt:-1};
 const [items,total]=await Promise.all([Vehicle.find(filter).sort(sort).skip((page-1)*limit).limit(limit).lean(),Vehicle.countDocuments(filter)]);
 res.json({success:true,data:{vehicles:items},meta:{page,limit,total,pages:Math.ceil(total/limit)}});
};
function escapeRegex(s){return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
exports.getOne=async(req,res)=>{const v=await Vehicle.findOne({_id:req.params.id,active:true});if(!v)throw AppError(404,'VEHICLE_NOT_FOUND','Vehicle was not found.');res.json({success:true,data:{vehicle:v}});};
exports.create=async(req,res)=>{const v=await Vehicle.create(req.body);await AuditLog.create({actor:req.user._id,action:'VEHICLE_CREATED',vehicle:v._id,quantityChange:v.quantity,requestId:req.id});res.status(201).json({success:true,data:{vehicle:v}});};
exports.update=async(req,res)=>{const allowed=['make','model','category','price','quantity','year','description','vin','active'];const changes={};for(const k of allowed)if(req.body[k]!==undefined)changes[k]=req.body[k];const v=await Vehicle.findByIdAndUpdate(req.params.id,changes,{new:true,runValidators:true});if(!v)throw AppError(404,'VEHICLE_NOT_FOUND','Vehicle was not found.');await AuditLog.create({actor:req.user._id,action:'VEHICLE_UPDATED',vehicle:v._id,requestId:req.id});res.json({success:true,data:{vehicle:v}});};
exports.remove=async(req,res)=>{const v=await Vehicle.findByIdAndUpdate(req.params.id,{active:false},{new:true});if(!v)throw AppError(404,'VEHICLE_NOT_FOUND','Vehicle was not found.');await AuditLog.create({actor:req.user._id,action:'VEHICLE_DELETED',vehicle:v._id,requestId:req.id});res.json({success:true,data:{message:'Vehicle archived successfully.'}});};
exports.purchase=async(req,res)=>{const quantity=Number(req.body.quantity??1);if(!Number.isInteger(quantity)||quantity<1||quantity>100)throw AppError(400,'INVALID_QUANTITY','Quantity must be an integer between 1 and 100.');const result=await purchaseVehicle({vehicleId:req.params.id,user:req.user,quantity,idempotencyKey:req.get('Idempotency-Key')||req.body.idempotencyKey,requestId:req.id});res.status(result.replayed?200:201).json({success:true,data:{purchase:result.purchase,replayed:result.replayed}});};
exports.restock=async(req,res)=>{const quantity=Number(req.body.quantity);if(!Number.isInteger(quantity)||quantity<1||quantity>100000)throw AppError(400,'INVALID_QUANTITY','Restock quantity must be a positive integer.');const v=await Vehicle.findOneAndUpdate({_id:req.params.id,active:true},{$inc:{quantity}},{new:true,runValidators:true});if(!v)throw AppError(404,'VEHICLE_NOT_FOUND','Vehicle was not found.');await AuditLog.create({actor:req.user._id,action:'RESTOCK',vehicle:v._id,quantityChange:quantity,note:String(req.body.note||'').slice(0,300),requestId:req.id});res.json({success:true,data:{vehicle:v}});};
