const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/user');
const verifyToken = require('../middlewares/verify-token');

// GET /api/users/:userId (already in your code)
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    if (String(req.user._id) !== String(req.params.userId)) {
      return res.status(403).json({ error: 'unauthorized' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'user not found' });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/users/:userId
 * Update username/email (self-only)
 */
router.put('/:userId', verifyToken, async (req, res) => {
  try {
    if (String(req.user._id) !== String(req.params.userId)) {
      return res.status(403).json({ error: 'unauthorized' });
    }

    const { username, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: { username, email } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ error: 'user not found' });

    res.json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/users/:userId/password
 * Change password (self-only)
 */
router.put('/:userId/password', verifyToken, async (req, res) => {
  try {
    if (String(req.user._id) !== String(req.params.userId)) {
      return res.status(403).json({ error: 'unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }

    const user = await User.findById(req.params.userId).select('+hashedPassword');
    if (!user) return res.status(404).json({ error: 'user not found' });

    // Verify current password
    const match = await bcrypt.compare(currentPassword, user.hashedPassword);
    if (!match) return res.status(400).json({ error: 'Current password is incorrect' });

    // Hash new password
    const saltRounds = 10;
    const hashed = await bcrypt.hash(newPassword, saltRounds);

    user.hashedPassword = hashed;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;