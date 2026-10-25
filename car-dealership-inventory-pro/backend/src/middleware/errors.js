function notFound(req,res) { res.status(404).json({ success:false, error:{code:'NOT_FOUND',message:`Route ${req.method} ${req.originalUrl} was not found.`}, requestId:req.id }); }
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  let status = err.status || 500, code = err.code || 'INTERNAL_ERROR', message = status >= 500 ? 'An unexpected server error occurred.' : err.message;
  if (err.name === 'ValidationError') { status=400; code='VALIDATION_ERROR'; message='The supplied data is invalid.'; }
  if (err.name === 'CastError') { status=400; code='INVALID_ID'; message='The supplied ID is invalid.'; }
  if (err.code === 11000) { status=409; code='DUPLICATE_RESOURCE'; message='A record with a unique field already exists.'; }
  const body={success:false,error:{code,message},requestId:req.id};
  if (process.env.NODE_ENV !== 'production' && status < 500 && err.details) body.error.details=err.details;
  if (status >= 500) console.error({ requestId:req.id, message:err.message, stack:err.stack });
  res.status(status).json(body);
}
module.exports = { notFound, errorHandler };
