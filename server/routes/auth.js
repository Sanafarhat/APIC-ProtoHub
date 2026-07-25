const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register - Called after successful Firebase Registration
router.post('/register', async (req, res) => {
  try {
    const { uid, name, email, role } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists in DB' });

    user = new User({
      uid,
      name,
      email,
      role: role || 'innovator'
    });

    await user.save();

    res.status(201).json({ user: { id: user.id, uid: user.uid, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login - Called after successful Firebase Login to fetch user profile
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email });
    
    // If the user doesn't exist in DB but they authenticated via Firebase (e.g., admin created in console)
    if (!user) {
      return res.status(404).json({ message: 'User profile not found in database' });
    }

    res.json({ user: { id: user.id, uid: user.uid, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
