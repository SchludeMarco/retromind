export type FeedbackCategory = "lob" | "tadel" | "vorschlag" | "wunsch" | "sonstiges";

interface FeedbackApiError extends Error {
  code?: string;
}

// Thin client for the /api/feedback serverless proxy. Any secrets (e.g. the
// Resend API key) live on the server only; this module never sees them.
export async function submitFeedback(
  category: FeedbackCategory,
  message: string,
  contactEmail?: string,
  edition?: "gaming"
): Promise<void> {
  // The Gaming edition's own domain has no feedback secrets, so it sends to
  // the main app (api/feedback.js allows that origin).
  const url = location.hostname.startsWith("retromind-gaming")
    ? "https://retromind.vercel.app/api/feedback"
    : "/api/feedback";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, message, contactEmail, edition }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data?.message || `API-Fehler ${res.status}`) as FeedbackApiError;
    err.code = data?.error;
    throw err;
  }
}
