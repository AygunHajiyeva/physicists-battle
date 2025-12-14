// server.js
import express from "express";
import cors from "cors";
import "dotenv/config";
import fetch from "node-fetch"; // omit if Node >=18 and you prefer global fetch

const app = express();
app.use(cors());
app.use(express.json());

// Serve your game files from the current folder:
app.use(express.static("."));

// Quick health check
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    keyLoaded: Boolean(process.env.OPENAI_API_KEY),
  });
});

// AI proxy
app.post("/api/chat", async (req, res) => {
  try {
    const { system, messages } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY on server." });
    }

    // Build input for Responses API
    const input = [];
    if (system) input.push({ role: "system", content: system });
    if (Array.isArray(messages)) input.push(...messages);

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",   // reliable + affordable; change if you have access to another
        input
      })
    });

    const text = await r.text(); // read raw for better debugging
    if (!r.ok) {
      console.error("OpenAI error:", r.status, text);
      return res.status(500).json({ error: "OpenAI error", details: text });
    }

    let data;
    try { data = JSON.parse(text); } catch (e) {
      console.error("JSON parse error:", e, text);
      return res.status(500).json({ error: "Bad JSON from OpenAI" });
    }

    // Responses API helper: output_text often contains the whole message
    const reply =
      data.output_text ||
      (Array.isArray(data.output)
        ? data.output
            .map(p => (p?.content?.[0]?.text?.value) || "")
            .join("\n")
        : "");

    if (!reply) {
      console.warn("Empty reply from OpenAI:", JSON.stringify(data, null, 2));
      return res.json({ reply: "(empty response from model)" });
    }

    res.json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error", details: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`AI proxy on http://localhost:${PORT}  (key loaded: ${Boolean(process.env.OPENAI_API_KEY)})`)
);
