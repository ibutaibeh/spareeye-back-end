const bcrypt = require('bcrypt');
const User = require('../models/user');

const getProfile = async (req, res) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : null;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(userId).select('username email role');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    if (!oldPassword) {
      return res.status(400).json({ error: 'Old password is required' });
    }

    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    const userId = req.user && req.user._id ? req.user._id : null;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.hashedPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Old password is incorrect' });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({ error: 'New password must be different from the old password' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    user.hashedPassword = hashed;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProfile,
  changePassword
};
