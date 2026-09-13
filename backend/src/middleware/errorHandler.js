function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err);

  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced resource does not exist' });
  }
  if (err.code === '22P02') {
    return res.status(400).json({ error: 'Invalid input format' });
  }

  res.status(500).json({
    error: 'Internal server error. Please try again.',
  });
}

module.exports = errorHandler;