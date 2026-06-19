const express = require('express');
const router = express.Router();
const {
  getAllCustomers, getCustomerById, createCustomer, updateCustomer, patchCustomer, deleteCustomer,
  customerExists, bulkCreate, bulkUpdate, bulkDelete,
  getByCountry, getByCity, getByGender, getByAge, getBySignupQuarter,
  getChurned, getActive, getHighValue, getHighPurchases, getHighCredit,
  getHighEngagement, getHighMobileUsage, getHighDiscountUsers, getRecentBuyers,
  getInactive, getTopReviewers, getHighCartAbandonment, getFrequentLogins, getLoyal, getPremium
} = require('../controllers/customer.controller');
const customerService = require('../services/customer.service');

router.get('/', getAllCustomers);

router.post('/bulk-create', bulkCreate);
router.patch('/bulk-update', bulkUpdate);
router.delete('/bulk-delete', bulkDelete);
router.get('/exists/:id', customerExists);

router.get('/country/:country', getByCountry);
router.get('/city/:city', getByCity);
router.get('/gender/:gender', getByGender);
router.get('/age/:age', getByAge);
router.get('/signup-quarter/:quarter', getBySignupQuarter);
router.get('/churned', getChurned);
router.get('/active', getActive);
router.get('/high-value', getHighValue);
router.get('/high-purchases', getHighPurchases);
router.get('/high-credit', getHighCredit);
router.get('/high-engagement', getHighEngagement);
router.get('/high-mobile-usage', getHighMobileUsage);
router.get('/high-discount-users', getHighDiscountUsers);
router.get('/recent-buyers', getRecentBuyers);
router.get('/inactive', getInactive);
router.get('/top-reviewers', getTopReviewers);
router.get('/high-cart-abandonment', getHighCartAbandonment);
router.get('/frequent-logins', getFrequentLogins);
router.get('/loyal', getLoyal);
router.get('/premium', getPremium);

// Route parameters (numeric thresholds)
const numericRoute = (field) => async (req, res, next) => {
  try {
    const v = Number(req.params.value);
    if (isNaN(v)) return res.status(400).json({ success: false, error: 'Invalid numeric value' });
    const result = await customerService.getAll({ [field]: { $gte: v } }, {}, 1, 50);
    res.json({ success: true, data: result.data });
  } catch (e) { next(e); }
};

router.get('/login-frequency/:value', numericRoute('Login_Frequency'));
router.get('/session-duration/:value', numericRoute('Session_Duration_Avg'));
router.get('/purchases/:value', numericRoute('Total_Purchases'));
router.get('/lifetime/:value', numericRoute('Lifetime_Value'));
router.get('/credit/:value', numericRoute('Credit_Balance'));
router.get('/mobile-usage/:value', numericRoute('Mobile_App_Usage'));
router.get('/discount-rate/:value', numericRoute('Discount_Usage_Rate'));
router.get('/reviews/:value', numericRoute('Product_Reviews_Written'));

router.get('/churn-status/:status', async (req, res, next) => {
  try {
    const s = Number(req.params.status);
    if (s !== 0 && s !== 1) return res.status(400).json({ success: false, error: 'Invalid churn status' });
    const result = await customerService.getAll({ Churned: s }, {}, 1, 50);
    res.json({ success: true, data: result.data });
  } catch (e) { next(e); }
});

// Sorting routes
const sortMap = { login: 'Login_Frequency', credit: 'Credit_Balance', purchases: 'Total_Purchases', lifetime: 'Lifetime_Value', age: 'Age' };
router.get('/sort/:field-desc', async (req, res, next) => {
  try {
    const field = sortMap[req.params.field] || req.params.field;
    const data = await customerService.sortDesc(field);
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

// Advanced Routes
router.get('/random', async (req, res, next) => {
  try { const data = await customerService.getRandom(); res.json({ success: true, data }); } catch (e) { next(e); }
});
router.get('/trending', async (req, res, next) => {
  try { const data = await customerService.getTrending(); res.json({ success: true, data }); } catch (e) { next(e); }
});
router.get('/recent', async (req, res, next) => {
  try { const data = await customerService.getRecent(); res.json({ success: true, data }); } catch (e) { next(e); }
});
router.get('/recommendations', async (req, res, next) => {
  try { const data = await customerService.getRecommendations(); res.json({ success: true, data }); } catch (e) { next(e); }
});
router.get('/predictions/churn', async (req, res, next) => {
  try { const data = await customerService.predictChurn(); res.json({ success: true, data }); } catch (e) { next(e); }
});
router.get('/predictions/retention', async (req, res, next) => {
  try { const data = await customerService.predictRetention(); res.json({ success: true, data }); } catch (e) { next(e); }
});
router.get('/segments/premium', async (req, res, next) => {
  try { const data = await customerService.filterAboveAvg('Lifetime_Value', 1500); res.json({ success: true, data }); } catch (e) { next(e); }
});
router.get('/segments/high-value', async (req, res, next) => {
  try { const data = await customerService.filterAboveAvg('Lifetime_Value', 1500); res.json({ success: true, data }); } catch (e) { next(e); }
});
router.get('/segments/loyal', async (req, res, next) => {
  try { const data = await customerService.filterAboveAvg('Membership_Years', 3); res.json({ success: true, data }); } catch (e) { next(e); }
});
router.get('/segments/risky', async (req, res, next) => {
  try { const data = await customerService.sortDesc('Login_Frequency'); res.json({ success: true, data: data.filter(c => c.Churned === 1) }); } catch (e) { next(e); }
});
router.get('/segments/inactive', async (req, res, next) => {
  try { const data = await customerService.sortDesc('Login_Frequency'); res.json({ success: true, data }); } catch (e) { next(e); }
});
router.get('/heatmap/countries', async (req, res, next) => {
  try { const data = await customerService.heatmapCountries(); res.json({ success: true, data }); } catch (e) { next(e); }
});
router.get('/heatmap/cities', async (req, res, next) => {
  try { const data = await customerService.heatmapCities(); res.json({ success: true, data }); } catch (e) { next(e); }
});
router.get('/insights/purchases', async (req, res, next) => {
  try { const data = await customerService.insightPurchases(); res.json({ success: true, data }); } catch (e) { next(e); }
});
router.get('/insights/mobile-usage', async (req, res, next) => {
  try { const data = await customerService.insightMobile(); res.json({ success: true, data }); } catch (e) { next(e); }
});
router.get('/insights/discounts', async (req, res, next) => {
  try { const data = await customerService.insightDiscounts(); res.json({ success: true, data }); } catch (e) { next(e); }
});
router.get('/insights/engagement', async (req, res, next) => {
  try { const data = await customerService.insightEngagement(); res.json({ success: true, data }); } catch (e) { next(e); }
});
router.get('/alerts/high-churn', async (req, res, next) => {
  try { const churned = await customerService.count({ Churned: 1 }); res.json({ success: true, data: { alert: 'High churn detected', count: churned } }); } catch (e) { next(e); }
});
router.get('/alerts/inactive-users', async (req, res, next) => {
  try { const avg = await customerService.filterBelowAvg('Login_Frequency', 10); res.json({ success: true, data: { alert: 'Inactive users', count: avg.length } }); } catch (e) { next(e); }
});
router.get('/alerts/high-cart-abandonment', async (req, res, next) => {
  try { const data = await customerService.filterAboveAvg('Cart_Abandonment_Rate', 50); res.json({ success: true, data: { alert: 'High cart abandonment', count: data.length } }); } catch (e) { next(e); }
});
router.get('/system/health', async (req, res, next) => {
  try { const count = await customerService.count(); res.json({ success: true, data: { status: 'healthy', customersInDB: count } }); } catch (e) { next(e); }
});
router.get('/system/version', async (req, res, next) => {
  try { const pkg = require('../../package.json'); res.json({ success: true, data: { version: pkg.version || '1.0.0' } }); } catch (e) { next(e); }
});
router.get('/system/config', async (req, res, next) => {
  try { res.json({ success: true, data: { environment: process.env.NODE_ENV } }); } catch (e) { next(e); }
});
router.post('/cache/clear', (req, res) => {
  res.json({ success: true, message: 'Cache cleared' });
});
router.get('/logs', (req, res) => {
  res.json({ success: true, message: 'Log endpoint - configure logging middleware for full logs' });
});
router.get('/activity', (req, res) => {
  res.json({ success: true, message: 'Activity log endpoint - configure logging middleware for full logs' });
});
router.get('/live-search', async (req, res, next) => {
  try { const data = await customerService.liveSearch(req.query.q); res.json({ success: true, data }); } catch (e) { next(e); }
});
router.get('/dashboard/summary', async (req, res, next) => {
  try { const data = await customerService.dashboardSummary(); res.json({ success: true, data }); } catch (e) { next(e); }
});
router.get('/dashboard/revenue', async (req, res, next) => {
  try { const data = await customerService.dashboardRevenue(); res.json({ success: true, data }); } catch (e) { next(e); }
});

// --- CRUD at the VERY END (after all named routes) ---
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.patch('/:id', patchCustomer);
router.delete('/:id', deleteCustomer);
router.get('/:id', getCustomerById);

module.exports = router;
