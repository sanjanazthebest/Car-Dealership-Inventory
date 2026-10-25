const { validationResult } = require('express-validator');
function validate(req,res,next) { const result=validationResult(req); if (!result.isEmpty()) return res.status(400).json({success:false,error:{code:'VALIDATION_ERROR',message:'Please correct the invalid fields.',details:result.array().map(e=>({field:e.path || e.param,message:e.msg}))},requestId:req.id}); next(); }
module.exports = validate;
