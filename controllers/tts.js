// server/routes/tts.js
const fetch = require("node-fetch");
const express = require('express');

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      text,
      voiceId = "21m00Tcm4TlvDq8ikWAM",           // Rachel (default)
      modelId = "eleven_monolingual_v1",
      stability = 0.5,
      similarityBoost = 0.75,
      style = 0.2,
    } = req.body || {};

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Missing text." });
    }
    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(500).json({ error: "Missing ELEVENLABS_API_KEY." });
    }

    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
          style,
          use_speaker_boost: true,
        },
      }),
    });

    if (!r.ok) {
      const errTxt = await r.text();
      return res.status(r.status).send(errTxt);
    }

    res.set("Content-Type", "audio/mpeg");
    r.body.pipe(res);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "TTS failed." });
  }
});

module.exports = router;