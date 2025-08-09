const express = require("express");
const multer = require("multer");
const OpenAI = require("openai");
const verifyToken = require("../middlewares/verify-token.js");
const Request = require("../models/request.js");
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const requests = await Request.find({owner: req.user._id})
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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 6 }, // 10MB each, max 6
  fileFilter: (_req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("UNSUPPORTED_FILE_TYPE"), ok);
  },
});


router.post("/analyze", upload.array("images"), async (req, res) => {
  try {
    const userText = req.body.userText || "";
    const images = req.files || [];

    const analysis = await analyzeWithOpenAI({ userText, images });

    // Mocked result matched to your frontend shape:
    res.status(200).json({ result: analysis });
  } catch (err) {
    if (err.message === "UNSUPPORTED_FILE_TYPE") {
      return res.status(400).json({ error: "Only JPG, PNG, and WEBP are allowed." });
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "One or more files exceed 10MB." });
    }
    res.status(500).json({ error: "Failed to analyze." });
  }
});

async function analyzeWithOpenAI({ userText, images }) {
  const imageDataUrls = images.map((file) => {
    const base64 = file.buffer.toString("base64");
    return `data:${file.mimetype};base64,${base64}`;
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are an expert in diagnosing damaged mechanical parts from images. " +
          "Return JSON with: diagnosis, severity, likely_part_name, repair_steps[], tools_needed[], safety_notes[], recommended_sites[].",
      },
      {
        role: "user",
        content: [
          { type: "text", text: userText || "Analyze these images and describe the issue." },
          ...imageDataUrls.map((url) => ({
            type: "image_url",
            image_url: { url },
          })),
        ],
      },
    ],
    response_format: { type: "json_object" }, // ensures valid JSON
  });

  const raw = response.choices[0].message.content;
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON returned from OpenAI");
  }
}


module.exports = router;