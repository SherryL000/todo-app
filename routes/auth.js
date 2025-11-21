const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Login page
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Handle login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.render('login', { error: 'Invalid credentials' });
    }
    req.session.userId = user._id;
    res.redirect('/tasks');
  } catch (err) {
    res.render('login', { error: 'Server error' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/auth/login'));
});

// Register (simple, for demo)
router.get('/register', (req, res) => res.render('register', { error: null }));
router.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    req.session.userId = user._id;
    res.redirect('/tasks');
  } catch (err) {
    console.error('Registration error:', err);
    res.render('register', { error: 'Username taken or error' });
  }
});

module.exports = router;
