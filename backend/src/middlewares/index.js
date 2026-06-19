const Customer = require('../models/customer.model');

exports.middlewareLogger = async (req, res) => {
  try { const d = await Customer.find().limit(5); res.json({ success: true, data: d, message: 'Request logged' }); } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.middlewareAuth = require('./auth');
exports.rateLimitMiddleware = require('./rate-limit');
exports.errorHandlerMiddleware = require('./error-handler');
exports.requestTimeMiddleware = require('./request-time');

// --- Admin / Protected Routes ---
const auth = require('./auth');

exports.adminCustomers = async (req, res) => {
  try { const d = await Customer.find().limit(20); res.json({ success: true, data: d }); } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.adminStats = async (req, res) => {
  try { const count = await Customer.countDocuments(); res.json({ success: true, data: { totalCustomers: count } }); } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.adminChurnAnalysis = async (req, res) => {
  try { const total = await Customer.countDocuments(); const churned = await Customer.countDocuments({ Churned: 1 }); res.json({ success: true, data: { total, churned, churnRate: ((churned / total * 100) || 0).toFixed(2) + '%' } }); } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};
