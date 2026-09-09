export type FeedbackCategory = "lob" | "tadel" | "vorschlag" | "wunsch" | "sonstiges";

interface FeedbackApiError extends Error {
  code?: string;
}

// Thin client for the /api/feedback serverless proxy. Any secrets (e.g. the
// Resend API key) live on the server only; this module never sees them.
export async function submitFeedback(
  category: FeedbackCategory,
  message: string,
  contactEmail?: string
): Promise<void> {
  const res = await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, message, contactEmail }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data?.message || `API-Fehler ${res.status}`) as FeedbackApiError;
    err.code = data?.error;
    throw err;
  }
}
