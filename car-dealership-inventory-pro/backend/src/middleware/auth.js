const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const auth = asyncHandler(async (req, res, next) => {
  const header = req.get('authorization') || '';
  if (!header.startsWith('Bearer ')) return res.status(401).json({ success:false, error:{ code:'AUTH_REQUIRED', message:'A bearer token is required.' }, requestId:req.id });
  let payload;
  try { payload = jwt.verify(header.slice(7), process.env.JWT_SECRET, { issuer:'autolot-api', audience:'autolot-client' }); }
  catch { return res.status(401).json({ success:false, error:{ code:'INVALID_TOKEN', message:'Token is invalid or expired.' }, requestId:req.id }); }
  const user = await User.findById(payload.sub).select('_id name email role');
  if (!user) return res.status(401).json({ success:false, error:{ code:'USER_NOT_FOUND', message:'Account no longer exists.' }, requestId:req.id });
  req.user = user; next();
});
function requireRole(...roles) { return (req,res,next) => roles.includes(req.user?.role) ? next() : res.status(403).json({ success:false,error:{code:'FORBIDDEN',message:'You do not have permission to perform this action.'},requestId:req.id }); }
module.exports = { auth, requireRole };
