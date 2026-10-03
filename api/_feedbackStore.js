// Shared helpers for the feedback functions (files starting with "_" are not
// exposed as routes by Vercel). Feedback is stored in feedback.md in the
// GitHub repository via the contents API; approved entries are copied into
// README.md as To Do items. Needs FEEDBACK_GITHUB_TOKEN (a fine-grained token
// with "Contents: read and write" on this repository only).

import crypto from "node:crypto";

const REPO = process.env.FEEDBACK_GITHUB_REPO || "SchludeMarco/retromind";
const BRANCH = process.env.FEEDBACK_GITHUB_BRANCH || "master";
export const FEEDBACK_PATH = "feedback.md";
export const README_PATH = "README.md";

export const CATEGORY_LABELS = {
  lob: "Lob",
  tadel: "Tadel",
  vorschlag: "Vorschlag",
  wunsch: "Wunsch",
  sonstiges: "Sonstiges",
};

const token = () => process.env.FEEDBACK_GITHUB_TOKEN;
export const storeConfigured = () => !!token();

async function gh(path, init = {}) {
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "retromind-feedback",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  return res;
}

export async function readFile(path) {
  const res = await gh(`${path}?ref=${encodeURIComponent(BRANCH)}`);
  if (res.status === 404) return { content: null, sha: undefined };
  if (!res.ok) throw new Error(`github read ${path}: ${res.status}`);
  const data = await res.json();
  return { content: Buffer.from(data.content, "base64").toString("utf8"), sha: data.sha };
}

async function writeFile(path, content, sha, message) {
  const res = await gh(path, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf8").toString("base64"),
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
  return res;
}

// Read-modify-write with one retry when someone else wrote in between.
export async function updateFile(path, transform, message) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { content, sha } = await readFile(path);
    const next = transform(content);
    if (next === null || next === content) return false;
    const res = await writeFile(path, next, sha, message);
    if (res.ok) return true;
    if (res.status !== 409 && res.status !== 422) {
      throw new Error(`github write ${path}: ${res.status} ${await res.text().catch(() => "")}`);
    }
  }
  throw new Error(`github write ${path}: conflict`);
}

// Approval links are signed so only the mail recipient can approve.
const signingKey = () =>
  crypto.createHash("sha256").update(`retromind-feedback-approve:${token() || ""}`).digest();

export const signId = (id) => crypto.createHmac("sha256", signingKey()).update(id).digest("hex").slice(0, 32);

export const validSignature = (id, sig) => {
  if (typeof id !== "string" || typeof sig !== "string" || sig.length !== 32) return false;
  return crypto.timingSafeEqual(Buffer.from(signId(id)), Buffer.from(sig));
};

export const newFeedbackId = (now) => {
  const stamp = now.toISOString().slice(0, 10).replace(/-/g, "");
  return `fb-${stamp}-${crypto.randomBytes(3).toString("hex")}`;
};

// Feedback text comes from anyone: keep it from breaking the markdown.
export const sanitize = (text) =>
  text
    .replace(/\r\n?/g, "\n")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export const FEEDBACK_HEADER = `# Feedback

Feedback aus der App (Einstellungen → „Feedback geben“), neueste oben. Kontakt-
E-Mail-Adressen werden hier nie gespeichert, sie stehen nur in der Mail an Marco.

Status **offen**: wartet auf Marcos Zustimmung (Link in der Feedback-Mail).
Status **übernommen**: steht als To Do in der README unter „Ideen und offene Punkte“.
`;

export function addEntry(content, { id, date, categoryLabel, text }) {
  const base = content && content.trim() ? content : FEEDBACK_HEADER;
  const quoted = sanitize(text)
    .split("\n")
    .map((l) => `> ${l}`.trimEnd())
    .join("\n");
  const entry = `## ${date} · ${categoryLabel} · offen\n\n<!-- id: ${id} -->\n\n${quoted}\n`;
  const marker = base.indexOf("\n## ");
  if (marker === -1) return `${base.trimEnd()}\n\n${entry}`;
  return `${base.slice(0, marker).trimEnd()}\n\n${entry}\n${base.slice(marker + 1)}`;
}

// Finds an entry by id: its heading line, status and plain text.
export function findEntry(content, id) {
  if (!content) return null;
  const at = content.indexOf(`<!-- id: ${id} -->`);
  if (at === -1) return null;
  const headStart = content.lastIndexOf("\n## ", at) + 1;
  const headEnd = content.indexOf("\n", headStart);
  const heading = content.slice(headStart, headEnd);
  const m = heading.match(/^## (.+?) · (.+?) · (offen|übernommen)$/);
  if (!m) return null;
  const nextHead = content.indexOf("\n## ", at);
  const block = content.slice(at, nextHead === -1 ? content.length : nextHead);
  const text = block
    .split("\n")
    .filter((l) => l.startsWith(">"))
    .map((l) => l.replace(/^> ?/, ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return { headStart, headEnd, heading, date: m[1], categoryLabel: m[2], status: m[3], text };
}

export function markAccepted(content, id) {
  const e = findEntry(content, id);
  if (!e || e.status !== "offen") return null;
  return content.slice(0, e.headStart) + e.heading.replace(/ · offen$/, " · übernommen") + content.slice(e.headEnd);
}

// Adds a To Do line to the README's "### To Do" list (created if missing)
// at the top of "## Ideen und offene Punkte".
export function addTodo(readme, { id, date, categoryLabel, text }) {
  if (!readme || readme.includes(`<!-- ${id} -->`)) return null;
  const short = text.length > 300 ? `${text.slice(0, 297)}…` : text;
  const line = `- [ ] **${categoryLabel}** (Feedback vom ${date.slice(0, 10)}): ${short} <!-- ${id} -->`;
  const ideas = readme.indexOf("## Ideen und offene Punkte");
  if (ideas === -1) return `${readme.trimEnd()}\n\n## Ideen und offene Punkte\n\n### To Do\n\n${line}\n`;
  const todo = readme.indexOf("### To Do", ideas);
  if (todo === -1) {
    const afterHeading = readme.indexOf("\n", ideas) + 1;
    return `${readme.slice(0, afterHeading)}\n### To Do\n\n${line}\n${readme.slice(afterHeading)}`;
  }
  const listStart = readme.indexOf("\n", todo) + 1;
  // insert after the last item of the existing list
  let pos = listStart;
  const rest = readme.slice(listStart);
  const lines = rest.split("\n");
  let offset = 0;
  let sawItem = false;
  for (const l of lines) {
    if (l.startsWith("- ")) sawItem = true;
    else if (sawItem && l.trim() === "") break;
    else if (l.startsWith("#")) break;
    offset += l.length + 1;
  }
  pos = listStart + offset;
  const before = readme.slice(0, pos).replace(/\n*$/, "\n");
  const needsBlank = !sawItem;
  return `${before}${needsBlank ? "\n" : ""}${line}\n${readme.slice(pos).replace(/^\n?/, "\n")}`;
}
