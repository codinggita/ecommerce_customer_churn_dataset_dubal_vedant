const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;
    if (!token) return res.status(401).json({ success: false, error: 'Access denied - no token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};
