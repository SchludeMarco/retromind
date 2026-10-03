// Opened from the link in a feedback mail. GET only shows what would happen,
// the button sends a POST that copies the feedback into README.md as a To Do
// and marks it "übernommen" in feedback.md. Mail scanners that follow links
// therefore never approve anything on their own. The link is signed, so only
// the mail recipient can use it.

import {
  FEEDBACK_PATH,
  README_PATH,
  addTodo,
  findEntry,
  markAccepted,
  readFile,
  storeConfigured,
  updateFile,
  validSignature,
} from "./_feedbackStore.js";

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function page(res, status, title, body) {
  res.status(status);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex");
  res.end(`<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · RetroMind</title>
<style>
body{margin:0;background:#f4ecd8;color:#2b2118;font-family:Georgia,serif;padding:24px 16px}
main{max-width:560px;margin:0 auto;background:#fffaf0;border:3px solid #2b2118;box-shadow:6px 6px 0 #2b2118;padding:24px}
small{text-transform:uppercase;font-weight:bold;color:#b45309;font-size:12px}
h1{margin:4px 0 16px;font-size:28px}
blockquote{margin:16px 0;padding:12px;border-left:4px solid #d97706;background:#fff;white-space:pre-wrap}
button{font:inherit;font-weight:bold;padding:10px 16px;border:2px solid #2b2118;background:#d97706;color:#fff;cursor:pointer;box-shadow:3px 3px 0 #2b2118}
p{line-height:1.5}
</style></head><body><main><small>RetroMind Feedback</small><h1>${esc(title)}</h1>${body}</main></body></html>`);
}

export default async function handler(req, res) {
  const url = new URL(req.url, "https://local");
  const id = url.searchParams.get("id") || "";
  const sig = url.searchParams.get("sig") || "";

  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).end();
    return;
  }
  if (!storeConfigured()) {
    page(res, 503, "Nicht eingerichtet", "<p>FEEDBACK_GITHUB_TOKEN fehlt in Vercel.</p>");
    return;
  }
  if (!validSignature(id, sig)) {
    page(res, 403, "Link ungültig", "<p>Dieser Link ist ungültig oder unvollständig.</p>");
    return;
  }

  try {
    const { content } = await readFile(FEEDBACK_PATH);
    const entry = findEntry(content, id);
    if (!entry) {
      page(res, 404, "Nicht gefunden", "<p>Dieses Feedback steht nicht (mehr) in feedback.md.</p>");
      return;
    }

    const quote = `<blockquote>${entry.text}</blockquote>`; // already escaped in feedback.md
    const meta = `<p>${esc(entry.categoryLabel)} vom ${esc(entry.date)}</p>`;

    if (req.method === "GET") {
      if (entry.status === "übernommen") {
        page(res, 200, "Schon übernommen", `${meta}${quote}<p>Steht bereits als To Do in der README.</p>`);
        return;
      }
      page(
        res,
        200,
        "Als To Do übernehmen?",
        `${meta}${quote}<p>Damit landet das Feedback in der README unter „Ideen und offene Punkte → To Do“.</p>
<form method="post" action="?id=${encodeURIComponent(id)}&amp;sig=${encodeURIComponent(sig)}"><button type="submit">Als To Do übernehmen</button></form>`,
      );
      return;
    }

    // POST: README first, then the status, so a failure in between can be retried.
    await updateFile(
      README_PATH,
      (readme) => addTodo(readme, { id, date: entry.date, categoryLabel: entry.categoryLabel, text: entry.text }),
      `README: To Do aus Feedback (${id})`,
    );
    await updateFile(FEEDBACK_PATH, (c) => markAccepted(c, id), `Feedback übernommen (${id})`);
    page(res, 200, "Übernommen ✓", `${meta}${quote}<p>Steht jetzt als To Do in der README.</p>`);
  } catch (e) {
    console.error("feedback approve error:", e?.message || e);
    page(res, 502, "Hat nicht geklappt", "<p>GitHub hat nicht geantwortet. Bitte später noch einmal versuchen.</p>");
  }
}
