const customerService = require('../services/customer.service');

exports.getAllCustomers = async (req, res, next) => {
  try {
    const { filter, sort, pagination } = customerService.buildFindOptions(req);
    const result = await customerService.getAll(filter, sort, pagination.page, pagination.limit);
    res.json({ success: true, ...result });
  } catch (e) { next(e); }
};

exports.getCustomerById = async (req, res, next) => {
  try {
    const customer = await customerService.getById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (e) { next(e); }
};

exports.createCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.create(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (e) { next(e); }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.update(req.params.id, req.body);
    if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (e) { next(e); }
};

exports.patchCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.update(req.params.id, req.body);
    if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (e) { next(e); }
};

exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.remove(req.params.id);
    if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });
    res.json({ success: true, message: 'Customer deleted', data: customer });
  } catch (e) { next(e); }
};

exports.customerExists = async (req, res, next) => {
  try {
    const exists = await customerService.exists(req.params.id);
    res.json({ success: true, exists: !!exists });
  } catch (e) { next(e); }
};

exports.bulkCreate = async (req, res, next) => {
  try {
    const customers = await customerService.bulkCreate(req.body);
    res.status(201).json({ success: true, data: customers });
  } catch (e) { next(e); }
};

exports.bulkUpdate = async (req, res, next) => {
  try {
    const result = await customerService.bulkUpdate(req.body);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
};

exports.bulkDelete = async (req, res, next) => {
  try {
    const ids = req.body.ids || [];
    const result = await customerService.bulkDelete(ids);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
};

// --- Filtered views ---
const paginatedView = (fn) => async (req, res, next) => {
  try {
    const { filter, sort, pagination } = customerService.buildFindOptions(req);
    const result = await customerService.getAll({ ...filter, ...fn(req) }, sort, pagination.page, pagination.limit);
    res.json({ success: true, ...result });
  } catch (e) { next(e); }
};

exports.getByCountry = paginatedView((req) => ({ Country: req.params.country }));
exports.getByCity = paginatedView((req) => ({ City: req.params.city }));
exports.getByGender = paginatedView((req) => ({ Gender: req.params.gender }));
exports.getBySignupQuarter = paginatedView((req) => ({ Signup_Quarter: req.params.signupQuarter }));

exports.getByAge = async (req, res, next) => {
  try {
    const age = Number(req.params.age);
    if (isNaN(age)) return res.status(400).json({ success: false, error: 'Invalid age value' });
    const data = await customerService.getAll({ Age: age }, {}, 1, 50);
    res.json({ success: true, data: data.data });
  } catch (e) { next(e); }
};

exports.getChurned = paginatedView(() => ({ Churned: 1 }));
exports.getActive = paginatedView(() => ({ Churned: 0 }));

const sortedView = (field, dir = -1) => async (req, res, next) => {
  try {
    const { pagination } = customerService.buildFindOptions(req);
    const data = await customerService.getAll({}, { [field]: dir }, pagination.page, pagination.limit);
    res.json({ success: true, ...data });
  } catch (e) { next(e); }
};

exports.getHighValue = sortedView('Lifetime_Value');
exports.getHighPurchases = sortedView('Total_Purchases');
exports.getHighCredit = sortedView('Credit_Balance');
exports.getHighEngagement = sortedView('Social_Media_Engagement_Score');
exports.getHighMobileUsage = sortedView('Mobile_App_Usage');
exports.getHighDiscountUsers = sortedView('Discount_Usage_Rate');
exports.getRecentBuyers = sortedView('Days_Since_Last_Purchase', 1);
exports.getInactive = sortedView('Login_Frequency', 1);
exports.getTopReviewers = sortedView('Product_Reviews_Written');
exports.getHighCartAbandonment = sortedView('Cart_Abandonment_Rate');
exports.getFrequentLogins = sortedView('Login_Frequency');
exports.getLoyal = sortedView('Membership_Years');
exports.getPremium = sortedView('Lifetime_Value');
