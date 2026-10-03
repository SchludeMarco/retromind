// Server-side endpoint for user feedback. Two channels, each optional:
// - mail to Marco via Resend (RESEND_API_KEY + FEEDBACK_TO_EMAIL)
// - an entry in feedback.md in the repository (FEEDBACK_GITHUB_TOKEN)
// When both are set, the mail carries a signed link that copies the
// feedback into the README as a To Do once Marco agrees.
// Secrets live only here (Vercel env vars) and never reach the browser.

import {
  CATEGORY_LABELS,
  FEEDBACK_PATH,
  addEntry,
  newFeedbackId,
  signId,
  storeConfigured,
  updateFile,
} from "./_feedbackStore.js";

const MAX_MESSAGE_LENGTH = 4000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

const FAILED = { error: "upstream", message: "Der Feedback-Versand ist fehlgeschlagen." };

async function sendMail({ apiKey, toEmail, categoryLabel, text, contact, approveUrl }) {
  const bodyLines = [
    `Kategorie: ${categoryLabel}`,
    contact ? `Kontakt: ${contact}` : "Kontakt: (keine Angabe)",
    "",
    text,
  ];
  if (approveUrl) {
    bodyLines.push(
      "",
      "—",
      "Gespeichert in feedback.md (Status: offen).",
      "Als To Do in die README übernehmen:",
      approveUrl,
    );
  }
  const upstream = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.FEEDBACK_FROM_EMAIL || "RetroMind Feedback <onboarding@resend.dev>",
      to: [toEmail],
      subject: `RetroMind Feedback: ${categoryLabel}`,
      text: bodyLines.join("\n"),
      ...(contact ? { reply_to: contact } : {}),
    }),
  });
  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    throw new Error(`resend ${upstream.status} ${detail}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  // FEEDBACK_TO_MAIL is accepted too (that is how it was first set in Vercel).
  const toEmail = process.env.FEEDBACK_TO_EMAIL || process.env.FEEDBACK_TO_MAIL;
  const mailConfigured = !!(apiKey && toEmail);
  const store = storeConfigured();
  if (!mailConfigured && !store) {
    res.status(503).json({
      error: "not_configured",
      message:
        "Dieses Demo läuft ohne konfigurierten Feedback-Versand – dein Feedback kann hier nicht zugestellt werden.",
    });
    return;
  }

  const { category, message, contactEmail } = await readJsonBody(req);

  const text = typeof message === "string" ? message.trim() : "";
  if (!text) {
    res.status(400).json({ error: "empty_message" });
    return;
  }
  if (text.length > MAX_MESSAGE_LENGTH) {
    res.status(400).json({ error: "message_too_long" });
    return;
  }

  const categoryLabel = CATEGORY_LABELS[category] || "Feedback";
  const trimmedContact = typeof contactEmail === "string" ? contactEmail.trim() : "";
  const contact = trimmedContact && EMAIL_RE.test(trimmedContact) ? trimmedContact : "";

  const now = new Date();
  const id = newFeedbackId(now);
  // Berlin time, readable in feedback.md: "2026-10-03 14:05"
  const date = now
    .toLocaleString("sv-SE", { timeZone: "Europe/Berlin", hour12: false })
    .slice(0, 16);

  // 1) feedback.md (never with the contact address: the repository is public)
  let stored = false;
  if (store) {
    try {
      await updateFile(
        FEEDBACK_PATH,
        (content) => addEntry(content, { id, date, categoryLabel, text }),
        `Feedback: ${categoryLabel} (${id})`,
      );
      stored = true;
    } catch (e) {
      console.error("feedback store error:", e?.message || e);
    }
  }

  // 2) mail, with the approve link when the entry was stored
  let mailed = false;
  if (mailConfigured) {
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const approveUrl =
      stored && host
        ? `https://${host}/api/feedback-approve?id=${encodeURIComponent(id)}&sig=${signId(id)}`
        : "";
    try {
      await sendMail({ apiKey, toEmail, categoryLabel, text, contact, approveUrl });
      mailed = true;
    } catch (e) {
      console.error("feedback mail error:", e?.message || e);
    }
  }

  if (!stored && !mailed) {
    res.status(502).json(FAILED);
    return;
  }
  res.status(200).json({ ok: true, stored, mailed });
}
