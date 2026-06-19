module.exports = function rateLimit(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // default: 15 min
  const maxRequests = options.maxRequests || 100;

  const requestCounts = new Map();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const entry = requestCounts.get(key);

    if (!entry) {
      requestCounts.set(key, { count: 1, timestamp: now });
      return next();
    }

    if (now - entry.timestamp > windowMs) {
      requestCounts.set(key, { count: 1, timestamp: now });
      return next();
    }

    let count = entry.count + 1;
    requestCounts.set(key, { count, timestamp: entry.timestamp });

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count));

    if (count > maxRequests) {
      return res.status(429).json({ success: false, error: 'Too many requests' });
    }

    next();
  };
};
