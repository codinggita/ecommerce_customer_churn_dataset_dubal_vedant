module.exports = function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, error: err.message });
  }

  if (err.code === 11000) {
    return res.status(409).json({ success: false, error: 'Duplicate key error' });
  }

  res.status(err.statusCode || 500).json({ success: false, error: err.message || 'Internal server error' });
};
