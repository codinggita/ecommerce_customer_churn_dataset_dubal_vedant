module.exports = function requestTime(req, res, next) {
  const start = Date.now();
  req.startTime = start;

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });

  next();
};
