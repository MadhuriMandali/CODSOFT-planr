const express = require('express');
const jwt     = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User    = require('../models/User');
const protect = require('../middleware/auth');
const router  = express.Router();

const sign = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN||'7d' });

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({min:8}).withMessage('Password min 8 chars'),
], async (req, res, next) => {
  const err = validationResult(req);
  if (!err.isEmpty()) return res.status(400).json({ message: err.array()[0].msg });
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message:'Email already registered' });
    const user  = await User.create({ name, email, password });
    res.status(201).json({ token: sign(user._id), user });
  } catch(e) { next(e); }
});

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message:'Incorrect email or password' });
    res.json({ token: sign(user._id), user });
  } catch(e) { next(e); }
});

router.get('/me', protect, (req, res) => res.json(req.user));

module.exports = router;
