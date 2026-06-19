const Customer = require('../models/customer.model');

function buildFilter(req) {
  const filter = {};
  if (req.params.country) filter.Country = req.params.country;
  if (req.params.city) filter.City = req.params.city;
  if (req.params.gender) filter.Gender = req.params.gender;
  if (req.params.signupQuarter) filter.Signup_Quarter = req.params.signupQuarter;

  const { country, city, gender, minAge, maxAge, membershipYears, minPurchases, minLifetime, minCredit, churned, signupQuarter, minLoginFrequency, minMobileUsage, minDiscountRate, minSessionDuration } = req.query;
  if (country) filter.Country = country;
  if (city) filter.City = city;
  if (gender) filter.Gender = gender;
  if (minAge) filter.Age = { $gte: Number(minAge) };
  if (maxAge) filter.Age = { ...filter.Age, $lte: Number(maxAge) };
  if (membershipYears) filter.Membership_Years = { $gte: Number(membershipYears) };
  if (minPurchases) filter.Total_Purchases = { $gte: Number(minPurchases) };
  if (minLifetime) filter.Lifetime_Value = { $gte: Number(minLifetime) };
  if (minCredit) filter.Credit_Balance = { $gte: Number(minCredit) };
  if (churned !== undefined) filter.Churned = Number(churned);
  if (signupQuarter) filter.Signup_Quarter = signupQuarter;
  if (minLoginFrequency) filter.Login_Frequency = { $gte: Number(minLoginFrequency) };
  if (minMobileUsage) filter.Mobile_App_Usage = { $gte: Number(minMobileUsage) };
  if (minDiscountRate) filter.Discount_Usage_Rate = { $gte: Number(minDiscountRate) };
  if (minSessionDuration) filter.Session_Duration_Avg = { $gte: Number(minSessionDuration) };
  return filter;
}

function buildSort(req) {
  const sortMap = {
    age: 'Age', membershipYears: 'Membership_Years', loginFrequency: 'Login_Frequency',
    sessionDuration: 'Session_Duration_Avg', purchases: 'Total_Purchases',
    averageOrderValue: 'Average_Order_Value', lifetimeValue: 'Lifetime_Value',
    creditBalance: 'Credit_Balance', discountRate: 'Discount_Usage_Rate', mobileUsage: 'Mobile_App_Usage'
  };
  const sortKey = req.query.sort;
  return (sortKey && sortMap[sortKey]) ? { [sortMap[sortKey]]: -1 } : {};
}

function buildPagination(req) {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 20;
  if (page < 1) page = 1;
  if (limit < 1) limit = 20;
  return { page, limit, skip: (page - 1) * limit };
}

exports.buildFindOptions = (req) => ({
  filter: buildFilter(req),
  sort: buildSort(req),
  pagination: buildPagination(req)
});

exports.getAll = async (filter, sort, page, limit) => {
  const skip = (page - 1) * limit;
  const data = await Customer.find(filter).sort(sort).skip(skip).limit(limit);
  const total = await Customer.countDocuments(filter);
  return { data, pagination: { page, limit, total } };
};

exports.getById = async (id) => Customer.findById(id);

exports.create = async (body) => Customer.create(body);

exports.update = async (id, body) =>
  Customer.findByIdAndUpdate(id, body, { new: true, runValidators: true });

exports.remove = async (id) => Customer.findByIdAndDelete(id);

exports.exists = async (id) => Customer.exists({ _id: id });

exports.bulkCreate = async (docs) => Customer.insertMany(docs);

exports.bulkUpdate = async (updates) => {
  const ops = updates.map(({ id, ...data }) => ({
    updateOne: { filter: { _id: id }, update: { $set: data } }
  }));
  return Customer.bulkWrite(ops);
};

exports.bulkDelete = async (ids) => Customer.deleteMany({ _id: { $in: ids } });

exports.count = () => Customer.countDocuments();

exports.churnAnalysis = async () => {
  const total = await Customer.countDocuments();
  const churned = await Customer.countDocuments({ Churned: 1 });
  return { total, churned, churnRate: ((churned / total * 100) || 0).toFixed(2) + '%' };
};

exports.search = async (q) => {
  if (!q || !q.trim()) return [];
  const regex = new RegExp(q, 'i');
  return Customer.find({
    $or: [
      { Country: regex }, { City: regex }, { Gender: regex },
      { Signup_Quarter: regex }
    ]
  });
};

exports.filterAboveAvg = async (field, fallback) => {
  const avg = await Customer.aggregate([
    { $group: { _id: null, avg: { $avg: `$${field}` } } }
  ]);
  return Customer.find({ [field]: { $gte: avg[0]?.avg || fallback } });
};

exports.filterBelowAvg = async (field, fallback) => {
  const avg = await Customer.aggregate([
    { $group: { _id: null, avg: { $avg: `$${field}` } } }
  ]);
  return Customer.find({ [field]: { $lt: avg[0]?.avg || fallback } });
};

exports.sortDesc = async (field, limit = 20) =>
  Customer.find().sort({ [field]: -1 }).limit(limit);

exports.getRandom = async () => {
  const [c] = await Customer.aggregate([{ $sample: { size: 1 } }]);
  return c;
};

exports.getTrending = async () =>
  Customer.find().sort({ Lifetime_Value: -1 }).limit(10);

exports.getRecent = async () =>
  Customer.find().sort({ createdAt: -1 }).limit(20);

exports.getRecommendations = async () => {
  const avg = await Customer.aggregate([
    { $group: { _id: null, avgLifetime: { $avg: '$Lifetime_Value' }, avgPurchases: { $avg: '$Total_Purchases' } } }
  ]);
  return Customer.find({
    Lifetime_Value: { $gte: avg[0]?.avgLifetime || 1000 },
    Churned: 0
  }).limit(20);
};

exports.predictChurn = async () => {
  const total = await Customer.countDocuments();
  const churned = await Customer.countDocuments({ Churned: 1 });
  return { total, churned, churnRate: ((churned / total) * 100).toFixed(2) + '%' };
};

exports.predictRetention = async () => {
  const total = await Customer.countDocuments();
  const active = await Customer.countDocuments({ Churned: 0 });
  return { total, retained: active, retentionRate: ((active / total) * 100).toFixed(2) + '%' };
};

exports.heatmapCountries = async () =>
  Customer.aggregate([{ $group: { _id: '$Country', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);

exports.heatmapCities = async () =>
  Customer.aggregate([{ $group: { _id: '$City', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);

exports.insightPurchases = async () => {
  const [stats] = await Customer.aggregate([
    { $group: { _id: null, avgPurchases: { $avg: '$Total_Purchases' }, minPurchases: { $min: '$Total_Purchases' }, maxPurchases: { $max: '$Total_Purchases' }, totalRevenue: { $sum: '$Lifetime_Value' } } }
  ]);
  return stats;
};

exports.insightMobile = async () => {
  const [stats] = await Customer.aggregate([
    { $group: { _id: null, avgMobile: { $avg: '$Mobile_App_Usage' }, highUsers: { $sum: { $cond: [{ $gte: ['$Mobile_App_Usage', 20] }, 1, 0] } } } }
  ]);
  return stats;
};

exports.insightDiscounts = async () => {
  const [stats] = await Customer.aggregate([
    { $group: { _id: null, avgDiscount: { $avg: '$Discount_Usage_Rate' } } }
  ]);
  return stats;
};

exports.insightEngagement = async () => {
  const [stats] = await Customer.aggregate([
    { $group: { _id: null, avgEngagement: { $avg: '$Social_Media_Engagement_Score' }, highEngaged: { $sum: { $cond: [{ $gte: ['$Social_Media_Engagement_Score', 50] }, 1, 0] } } } }
  ]);
  return stats;
};

exports.dashboardSummary = async () => {
  const total = await Customer.countDocuments();
  const churned = await Customer.countDocuments({ Churned: 1 });
  const [avgLifetime] = await Customer.aggregate([
    { $group: { _id: null, avg: { $avg: '$Lifetime_Value' } } }
  ]);
  return { totalCustomers: total, churned, active: total - churned, averageLifetimeValue: avgLifetime?.avg || 0 };
};

exports.dashboardRevenue = async () => {
  const [stats] = await Customer.aggregate([
    { $group: { _id: null, totalRevenue: { $sum: '$Lifetime_Value' }, avgOrderValue: { $avg: '$Average_Order_Value' } } }
  ]);
  return stats;
};

exports.liveSearch = async (q) => {
  if (!q || !q.trim()) return [];
  const regex = new RegExp(q, 'i');
  return Customer.find({
    $or: [{ Country: regex }, { City: regex }, { Gender: regex }]
  }).limit(10);
};
