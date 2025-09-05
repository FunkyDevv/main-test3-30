import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import cors from "cors";
import fs from "fs";
import path from "path";
import { franc } from "franc";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// === Allow more image formats + safe rejection ===
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/gif",
      "image/bmp",
      "image/tiff",
      "image/svg+xml",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type. Please upload PNG, JPG, WEBP, GIF, BMP, TIFF, or SVG."), false);
    }
  },
});

const DEFAULT_SELLER_LANGUAGE = 'en';
const EMOJI_MAX = 2;

function buildSystemPrompt(sellerLanguageCode, buyerName, sellerName) {
  const targetLanguage = sellerLanguageCode || DEFAULT_SELLER_LANGUAGE;

  return `
You are an assistant to an Etsy seller.

Do not invent: no prices/processing times/shipping times/policies/perks/promises not provided by the seller.
Do not provide an exact delivery date without explicit seller information.

Tone: professional, courteous, concise; no slang or meta text.
Off-platform: never ask for WhatsApp/email/phone. If the buyer asks, reply that we’ll continue on Etsy (fixed wording in §11).
Links (URLs): allowed only if they appeared in seller_message; preserve 1:1 and in order of appearance (§5.5/§11).

Dropshipping adaptations (if present in the text):
“My suppliers” → “we”
“warehouse in China” → “our fulfillment center”
“international shipping” → “our shipping”

Liability boundary: if the seller stated the order was handed to the carrier, a short sentence about carrier responsibility is allowed while continuing to help.



Always produce three outputs, but DO NOT label them with section numbers.
Output must appear in this order:

[SUMMARY BLOCK]
⚠️ Always in English only.
Summary: one line ≤30 words — what the buyer wants now.
Details: 4 lines ≤20 words; missing info → –.
What to answer: same line, single value: No reply needed. or one action/micro-question.
Do not answer the buyer inside SUMMARY.

[SELLER LANGUAGE BLOCK]
⚠️ Must be written in ${targetLanguage} only (except product names/SKUs/units which remain unchanged).
Paragraph 1: greeting + thanks + proof of understanding from context. If proven confusion caused by the seller (e.g., suede↔leather) — brief apology, no commitments.
Paragraph 2: 1–2 factual, direct sentences that answer only seller_message (even if a contradiction exists — §6).
Paragraph 3: one next step or one micro-question (by §7 priorities).
Signature: one line (“Thank you,”/“Best regards,” + valid name if present). No emojis.

Rules:
- Language: ${targetLanguage}.
- ≤120 words, ≤${EMOJI_MAX} emojis mirrored with English, ≤1 exclamation mark.
- No emojis in signature.
- Preserve URLs 1:1 and in order.
- No promises, times, prices unless in seller_message.

[ENGLISH VERSION BLOCK]
\`\`\`text
Paragraph 1: greeting + thanks + proof of understanding from context. If proven confusion caused by the seller (e.g., suede↔leather) — brief apology, no commitments.
Paragraph 2: 1–2 factual, direct sentences that answer only seller_message (even if a contradiction exists — §6).
Paragraph 3: one next step or one micro-question (by §7 priorities).
Warmly,
${sellerName || 'Seller'}
\`\`\`

Rules:
- Always English.
- Exactly same content as seller language, but translated to English.
- Signature = "Warmly," (not “Thank you,”).
- Strict English spelling.
`;
}

// Function to parse the response and extract blocks
function parseResponse(reply) {
  const summaryMatch = reply.match(/\[SUMMARY BLOCK\](.*?)(?=\[SELLER LANGUAGE BLOCK\])/s);
  const sellerMatch = reply.match(/\[SELLER LANGUAGE BLOCK\](.*?)(?=\[ENGLISH VERSION BLOCK\])/s);
  const englishMatch = reply.match(/\[ENGLISH VERSION BLOCK\](.*)/s);

  return {
    summary: summaryMatch ? summaryMatch[1].trim() : '',
    seller: sellerMatch ? sellerMatch[1].trim() : '',
    english: englishMatch ? englishMatch[1].trim() : ''
  };
}

// Function to detect language using franc
function detectLanguage(text) {
  const lang = franc(text, { minLength: 3 });
  return lang === 'und' ? 'en' : lang;
}

// === Chat endpoint ===
app.post("/chat", (req, res, next) => {
  upload.single("image")(req, res, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { message, seller_language_code, buyer_name, seller_name } = req.body;

    let imageBase64 = null;
    let mimeType = "image/png";

    if (req.file) {
      const filePath = path.resolve(req.file.path);
      imageBase64 = fs.readFileSync(filePath, { encoding: "base64" });
      mimeType = req.file.mimetype || "image/png";
      fs.unlinkSync(filePath);
    }

    const systemPrompt = buildSystemPrompt(seller_language_code, buyer_name, seller_name);

    const messages = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: message || "No message provided." },
          ...(imageBase64
            ? [
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${imageBase64}`,
                  },
                },
              ]
            : []),
        ],
      },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      return res.status(500).json({ error: "Invalid response from OpenAI" });
    }

    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error("Error in /chat:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// === Enhanced chat endpoint with validation ===
app.post("/chat-validated", (req, res, next) => {
  upload.single("image")(req, res, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    let { message, seller_language_code, buyer_name, seller_name } = req.body;
    const maxRetries = 2;
    let retryCount = 0;
    let lastReply = null;

    let imageBase64 = null;
    let mimeType = "image/png";

    if (req.file) {
      const filePath = path.resolve(req.file.path);
      imageBase64 = fs.readFileSync(filePath, { encoding: "base64" });
      mimeType = req.file.mimetype || "image/png";
      fs.unlinkSync(filePath);
    }

    const systemPrompt = buildSystemPrompt(seller_language_code, buyer_name, seller_name);

    while (retryCount <= maxRetries) {
      const messages = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: message || "No message provided." },
            ...(imageBase64
              ? [
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${mimeType};base64,${imageBase64}`,
                    },
                  },
                ]
              : []),
          ],
        },
      ];

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages,
        }),
      });

      const data = await response.json();

      if (!data.choices || !data.choices[0]?.message?.content) {
        return res.status(500).json({ error: "Invalid response from OpenAI" });
      }

      const reply = data.choices[0].message.content;
      lastReply = reply;

      const blocks = parseResponse(reply);
      const sellerBlock = blocks.seller;

      const detectedLang = detectLanguage(sellerBlock);
      console.log(`Detected language: ${detectedLang}, Expected: ${seller_language_code}`);

      if (detectedLang === seller_language_code || detectedLang === 'und') {
        return res.json({ reply });
      }

      retryCount++;
      console.log(`Language mismatch detected. Retry attempt ${retryCount}`);

      message = `Please re-translate ONLY the [SELLER LANGUAGE BLOCK] into ${seller_language_code}, keep [SUMMARY BLOCK] in English, and keep [ENGLISH VERSION BLOCK] in English:\n\n${reply}`;
    }

    res.json({ reply: lastReply });
  } catch (error) {
    console.error("Error in /chat-validated:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});



app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
