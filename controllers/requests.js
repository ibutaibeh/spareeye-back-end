const express = require("express");
const verifyToken = require("../middlewares/verify-token.js");
const Request = require("../models/request.js");
const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  try {
    req.body.owner = req.user._id;
    const request = await Request.create(req.body);
    request._doc.owner = request.user;
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const requests = await Request.find({})
      .populate("owner")
      .sort({ createdAt: "desc" });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.get('/:requestId', verifyToken, async (req, res) => {
  try {
    // populate owner of request
    const request = await Request.findById(req.params.requestId).populate([
      'owner',
    ]);
    res.status(200).json(request);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.put("/:requestId", verifyToken, async (req, res) => {
  try {
    // Find the request:
    const request = await Request.findById(req.params.requestId);

    // Check permissions:
    if (!request.owner.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    }

    // Update request:
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.requestId,
      req.body,
      { new: true }
    );

    // Append req.user to the owner property:
    updatedRequest._doc.owner = req.user;

    // Issue JSON response:
    res.status(200).json(updatedRequest);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.delete("/:requestId", verifyToken, async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);

    if (!request.owner.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    }

    const deletedRequest = await Request.findByIdAndDelete(req.params.requestId);
    res.status(200).json(deletedRequest);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;