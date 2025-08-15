// controllers/requests.js
const express = require("express");
const OpenAI = require("openai");
const verifyToken = require("../middlewares/verify-token.js");
const Request = require("../models/request.js");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsp = fs.promises;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ---------------- Ensure user upload dir ---------------- */
function ensureUserDir(userId) {
  const dir = path.join(__dirname, "..", "uploads", String(userId));
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/* ---------------- Disk storage ---------------- */
const storage = multer.diskStorage({
  destination: function (req, _file, cb) {
    const dir = ensureUserDir(req.user._id); // verifyToken must run first
    cb(null, dir);
  },
  filename: function (_req, file, cb) {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${timestamp}-${safeName}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
  cb(ok ? null : new Error("UNSUPPORTED_FILE_TYPE"), ok);
};

const uploadPersistent = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 6 },
  fileFilter,
});

/* ---------------- Memory storage for optional inline analyze ---------------- */
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 6 },
  fileFilter,
});

/* ---------------- Public URL helper ---------------- */
function publicUrlFromDisk(filePathAbs) {
  // absolute -> "/uploads/<userId>/<filename>"
  const idx = filePathAbs.lastIndexOf(path.sep + "uploads" + path.sep);
  const rel = filePathAbs.slice(idx).replace(/\\/g, "/");
  return rel.startsWith("/uploads") ? rel : `/uploads${rel}`;
}

/* ---------------- CRUD ---------------- */
router.post("/", verifyToken, async (req, res) => {
  try {
    req.body.owner = req.user._id;
    const request = await Request.create(req.body);
    const populated = await Request.findById(request._id).populate("owner");
    res.status(201).json(populated);
  } catch (err) {
    // validation errors (e.g., missing required carDetails/description) should be 400
    const status = err?.name === "ValidationError" ? 400 : 500;
    res.status(status).json({ err: err.message });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const requests = await Request.find({ owner: req.user._id })
      .populate("owner")
      .sort({ createdAt: "desc" });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.get("/:requestId", verifyToken, async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId).populate(["owner"]);
    res.status(200).json(request);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.put("/:requestId", verifyToken, async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request.owner.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    }

    const updatedRequest = await Request.findByIdAndUpdate(req.params.requestId, req.body, { new: true });
    updatedRequest._doc.owner = req.user;
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

/* ---------------- Upload images (persist) ---------------- */
router.post("/uploads/images", verifyToken, uploadPersistent.array("images", 6), (req, res) => {
  try {
    const urls = (req.files || []).map((file) => `/uploads/${req.user._id}/${file.filename}`);
    res.json({ urls });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Image upload failed" });
  }
});

/* ---------------- Analyze: accepts urls OR inline files ---------------- */
router.post("/analyze", verifyToken, uploadMemory.array("images"), async (req, res) => {
  try {
    const userText = req.body.userText || "";
    const providedUrls = Array.isArray(req.body.imageUrls)
      ? req.body.imageUrls
      : (typeof req.body.imageUrls === "string" && req.body.imageUrls ? JSON.parse(req.body.imageUrls) : []);

    // If inline files sent, persist them first
    const savedUrls = [];
    if (req.files && req.files.length) {
      const uid = req.user._id;
      const dir = ensureUserDir(uid);
      for (const file of req.files) {
        const ts = Date.now();
        const safe = (file.originalname || "image").replace(/[^a-zA-Z0-9._-]/g, "_");
        const abs = path.join(dir, `${ts}-${safe}`);
        await fsp.writeFile(abs, file.buffer);
        savedUrls.push(publicUrlFromDisk(abs));
      }
    }

    const allUrls = [...providedUrls, ...savedUrls];

    // Convert local /uploads URLs into data URLs for OpenAI
    async function toDataUrl(publicUrl) {
      const abs = path.join(__dirname, "..", publicUrl);
      const buf = await fsp.readFile(abs);
      const lower = publicUrl.toLowerCase();
      const mime = lower.endsWith(".png") ? "image/png" : lower.endsWith(".webp") ? "image/webp" : "image/jpeg";
      return `data:${mime};base64,${buf.toString("base64")}`;
    }

    const imageDataUrls = [];
    for (const u of allUrls) {
      if (u.startsWith("/uploads/")) {
        imageDataUrls.push(await toDataUrl(u));
      } else if (/^https?:\/\//i.test(u)) {
        imageDataUrls.push(u); // pass remote URL directly
      }
    }

    const analysis = await analyzeWithOpenAI({ userText, imageDataUrls });

    res.status(200).json({ result: analysis, imageUrls: allUrls });
  } catch (err) {
    if (err.message === "UNSUPPORTED_FILE_TYPE") {
      return res.status(400).json({ error: "Only JPG, PNG, and WEBP are allowed." });
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "One or more files exceed 10MB." });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to analyze." });
  }
});

async function analyzeWithOpenAI({ userText, imageDataUrls }) {
  const imagesContent = imageDataUrls.map((url) => ({ type: "image_url", image_url: { url } }));
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are an expert in diagnosing damaged mechanical parts from images. " +
          "Return JSON with: diagnosis, severity, likely_part_name, repair_steps[], tools_needed[], safety_notes[], recommended_websites[].",
      },
      {
        role: "user",
        content: [{ type: "text", text: userText || "Analyze these images and describe the issue." }, ...imagesContent],
      },
    ],
    response_format: { type: "json_object" },
  });

  const raw = response.choices?.[0]?.message?.content || "{}";
  return JSON.parse(raw);
}



module.exports = router;