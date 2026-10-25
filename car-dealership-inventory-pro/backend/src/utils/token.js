const jwt = require('jsonwebtoken');
function signToken(user) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters');
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '2h', issuer: 'autolot-api', audience: 'autolot-client' });
}
module.exports = signToken;
