const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(require('cors')());
app.use(require('./middlewares/request-time'));

// --- Routes ---
const customerRoutes = require('./routes/customer.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const statsRoutes = require('./routes/stats.routes');
const authRoutes = require('./routes/auth.routes');
const searchRoutes = require('./routes/search.routes');
const filterRoutes = require('./routes/filter.routes');

app.use('/customers', customerRoutes);
app.use('/analytics/customers', analyticsRoutes);
app.use('/stats/customers', statsRoutes);
app.use('/auth', authRoutes);
app.use('/jwt', authRoutes);
app.use('/search', searchRoutes);
app.use('/customers/filter', filterRoutes);

// --- Protected CRUD routes ---
const auth = require('./middlewares/auth');
const customerService = require('./services/customer.service');

app.post('/protected/customers', auth, async (req, res, next) => {
  try { const c = await customerService.create(req.body); res.status(201).json({ success: true, data: c }); } catch (e) { next(e); }
});

app.patch('/protected/customers/:id', auth, async (req, res, next) => {
  try { const c = await customerService.update(req.params.id, req.body); if (!c) return res.status(404).json({ success: false, error: 'Customer not found' }); res.json({ success: true, data: c }); } catch (e) { next(e); }
});

app.delete('/protected/customers/:id', auth, async (req, res, next) => {
  try { const c = await customerService.remove(req.params.id); if (!c) return res.status(404).json({ success: false, error: 'Customer not found' }); res.json({ success: true, message: 'Deleted', data: c }); } catch (e) { next(e); }
});

// --- Middleware demo endpoints ---
const { middlewareLogger, rateLimitMiddleware } = require('./middlewares/index');

app.get('/middleware/logger', middlewareLogger);

app.get('/middleware/auth', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, error: 'No token' });
    jwt.verify(token, process.env.JWT_SECRET);
    res.json({ success: true, message: 'Auth middleware works' });
  } catch (e) {
    res.status(401).json({ success: false, error: e.message });
  }
});

app.get('/middleware/rate-limit', rateLimitMiddleware({ windowMs: 60000, maxRequests: 10 }), (req, res) => res.json({ success: true, message: 'Rate limited' }));

app.get('/middleware/error-handler', (req, res, next) => {
  next(new Error('This is a test error'));
});

// --- Admin routes (auth protected) ---
app.get('/admin/customers', auth, async (req, res, next) => {
  try { const d = await customerService.getAll({}, {}, 1, 20); res.json({ success: true, data: d }); } catch (e) { next(e); }
});

app.get('/admin/stats', auth, async (req, res, next) => {
  try { const count = await customerService.count(); res.json({ success: true, data: { totalCustomers: count } }); } catch (e) { next(e); }
});

app.get('/admin/churn-analysis', auth, async (req, res, next) => {
  try { const result = await customerService.churnAnalysis(); res.json({ success: true, data: result }); } catch (e) { next(e); }
});

app.use(require('./middlewares/error-handler'));

module.exports = app;
