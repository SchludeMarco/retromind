// Server-side proxy for user feedback. Sends the submitted text as an email
// via Resend. The API key and recipient live only here (Vercel env vars) and
// never reach the browser.

const CATEGORY_LABELS = {
  lob: "Lob",
  tadel: "Tadel",
  vorschlag: "Vorschlag",
  wunsch: "Wunsch",
  sonstiges: "Sonstiges",
};

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.FEEDBACK_TO_EMAIL;
  if (!apiKey || !toEmail) {
    res.status(503).json({
      error: "not_configured",
      message:
        "Dieses Demo läuft ohne konfigurierten Feedback-Versand – dein Feedback kann hier nicht als E-Mail zugestellt werden.",
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
  const hasContact = trimmedContact.length > 0 && EMAIL_RE.test(trimmedContact);

  const bodyLines = [
    `Kategorie: ${categoryLabel}`,
    hasContact ? `Kontakt: ${trimmedContact}` : "Kontakt: (keine Angabe)",
    "",
    text,
  ];

  try {
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
        ...(hasContact ? { reply_to: trimmedContact } : {}),
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
      console.error("feedback api error:", upstream.status, detail);
      res.status(502).json({ error: "upstream", message: "Der Feedback-Versand ist fehlgeschlagen." });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error("feedback api error:", e?.message || e);
    res.status(502).json({ error: "upstream", message: "Der Feedback-Versand ist fehlgeschlagen." });
  }
}
