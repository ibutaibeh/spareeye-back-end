const express = require('express');
const router = express.Router();
const Settings = require('../models/setting');
const verifyToken = require('../middlewares/verify-token');

router.get('/', verifyToken, async (req, res) => {
  try {
    const items = await Settings.find(
      {},
      'user theme aiVoice notifications autoUpdates'
    ).lean();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:userId', verifyToken, async (req, res) => {
  try {
    if (String(req.user._id) !== String(req.params.userId)) {
      return res.status(403).json({ error: 'unauthorized' });
    }

    let doc = await Settings.findOne({ user: req.params.userId });
    if (!doc) doc = await Settings.create({ user: req.params.userId });

    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:userId', verifyToken, async (req, res) => {
  try {
    if (String(req.user._id) !== String(req.params.userId)) {
      return res.status(403).json({ error: 'unauthorized' });
    }

    const allowed = ['theme', 'aiVoice', 'notifications', 'autoUpdates'];
    const updates = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    }

    const doc = await Settings.findOneAndUpdate(
      { user: req.params.userId },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;