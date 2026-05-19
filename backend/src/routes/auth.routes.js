const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const authMiddleware = require('../middlewares/auth');

const generateToken = (user, expiresIn = '24h') =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn });

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });
    if (password.length < 4) return res.status(400).json({ success: false, error: 'Password must be at least 4 characters' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, error: 'Email already registered' });
    const user = await User.create({ email, password, name });
    const token = generateToken(user);
    res.status(201).json({ success: true, data: { token, user } });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, error: 'Invalid email or password' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid email or password' });
    const token = generateToken(user);
    res.json({ success: true, data: { token, user } });
  } catch (e) { next(e); }
});

router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (e) { next(e); }
});

router.patch('/profile', authMiddleware, async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) updates.email = req.body.email;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: user });
  } catch (e) { next(e); }
});

router.delete('/profile', authMiddleware, async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ success: true, message: 'Profile deleted' });
  } catch (e) { next(e); }
});

router.post('/forgot-password', (req, res) => {
  res.json({ success: true, message: 'Password reset email sent' });
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ success: false, error: 'Token and new password required' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password reset successful' });
  } catch (e) { next(e); }
});

router.post('/change-password', authMiddleware, async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ success: false, error: 'Old and new password required' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed' });
  } catch (e) { next(e); }
});

router.post('/verify-email', (req, res) => {
  res.json({ success: true, message: 'Email verified' });
});

router.post('/send-otp', (req, res) => {
  res.json({ success: true, message: 'OTP sent' });
});

router.post('/verify-otp', (req, res) => {
  res.json({ success: true, message: 'OTP verified' });
});

router.post('/resend-verification', (req, res) => {
  res.json({ success: true, message: 'Verification email resent' });
});

router.get('/session', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, data: user });
  } catch (e) { next(e); }
});

router.delete('/session', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'All sessions logged out' });
});

// --- JWT Routes ---
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, data: user });
  } catch (e) { next(e); }
});

router.get('/dashboard', authMiddleware, async (req, res, next) => {
  try {
    const Customer = require('../models/customer.model');
    const total = await Customer.countDocuments();
    const churned = await Customer.countDocuments({ Churned: 1 });
    res.json({ success: true, data: { totalCustomers: total, churned } });
  } catch (e) { next(e); }
});

router.post('/generate-token', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email required' });
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, data: { token } });
  } catch (e) { next(e); }
});

router.post('/verify-token', async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, error: 'Token required' });
    jwt.verify(token, process.env.JWT_SECRET);
    res.json({ success: true, message: 'Token valid' });
  } catch (e) { res.status(401).json({ success: false, error: 'Invalid token' }); }
});

router.post('/refresh-token', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, error: 'Refresh token required' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const token = jwt.sign({ email: decoded.email || 'user@example.com' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, data: { token } });
  } catch (e) { res.status(401).json({ success: false, error: 'Invalid refresh token' }); }
});

router.delete('/revoke-token', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Token revoked' });
});

router.get('/private-customers', authMiddleware, async (req, res, next) => {
  try {
    const Customer = require('../models/customer.model');
    const data = await Customer.find().limit(10);
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.get('/private-stats', authMiddleware, async (req, res, next) => {
  try {
    const Customer = require('../models/customer.model');
    const count = await Customer.countDocuments();
    res.json({ success: true, data: { totalCustomers: count } });
  } catch (e) { next(e); }
});

router.get('/admin', authMiddleware, async (req, res, next) => {
  try {
    const Customer = require('../models/customer.model');
    const total = await Customer.countDocuments();
    const churned = await Customer.countDocuments({ Churned: 1 });
    res.json({ success: true, data: { admin: true, totalCustomers: total, churned } });
  } catch (e) { next(e); }
});

router.get('/customer-insights', authMiddleware, async (req, res, next) => {
  try {
    const Customer = require('../models/customer.model');
    const total = await Customer.countDocuments();
    const churned = await Customer.countDocuments({ Churned: 1 });
    res.json({ success: true, data: { totalCustomers: total, churnRate: ((churned / total * 100) || 0).toFixed(2) + '%' } });
  } catch (e) { next(e); }
});

module.exports = router;
