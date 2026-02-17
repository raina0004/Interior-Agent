function errorHandler(err, req, res, _next) {
  console.error('Unhandled Error:', err.stack || err.message);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: 'Validation Error', details: errors });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate entry' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
}

function notFound(req, res) {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
}

module.exports = { errorHandler, notFound };
