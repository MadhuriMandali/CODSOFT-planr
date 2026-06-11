module.exports = (err, _req, res, _next) => {
  console.error(err);
  if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors).map(e=>e.message).join(', ') });
  if (err.code === 11000) return res.status(400).json({ message: `${Object.keys(err.keyValue)[0]} already in use` });
  res.status(err.status||500).json({ message: err.message||'Server error' });
};
