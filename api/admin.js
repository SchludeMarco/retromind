// Admin area backend (only for ADMIN_EMAIL, see api/_admin.js), next to the
// usage numbers in api/stats.js:
// GET  ?view=feedback        → all entries of feedback.md
// POST {action, id}          → "accept": copy into the README as a To Do (like
//                              the link in the feedback mail), "done": tick it
//                              off without a To Do (only feedback.md changes,
//                              which triggers no Vercel build)
// GET  ?view=live            → which commit each domain serves vs. master
// GET  ?view=version         → public: the commit of this deployment
// GET  ?view=gate            → public: Google client id for /gate.html
// POST {action:"guestLogin", token} → public: Google token of an invited
//                              guest → signed cookie (see api/_guests.js)
// POST {action:"guestLogout"} → public: removes that cookie
// GET  ?view=guests          → the guest list
// POST {action:"guestAdd"|"guestRemove", email} → change the guest list

import {
  FEEDBACK_PATH,
  README_PATH,
  addTodo,
  findEntry,
  listEntries,
  markAccepted,
  markDone,
  readFile,
  storeConfigured,
  updateFile,
} from "./_feedbackStore.js";
import { cors, isAdmin, readJsonBody } from "./_admin.js";
import {
  ADMIN_EMAIL,
  addGuest,
  clearCookie,
  googleEmail,
  guestsConfigured,
  isGuest,
  listGuests,
  makeCookie,
  normalizeEmail,
  removeGuest,
  validEmail,
} from "./_guests.js";

const REPO = process.env.FEEDBACK_GITHUB_REPO || "SchludeMarco/retromind";
const BRANCH = process.env.FEEDBACK_GITHUB_BRANCH || "master";
const DOMAINS = [
  { id: "zeitreise", label: "Zeitreise", url: "https://retromind.vercel.app", project: "retromind" },
  { id: "gaming", label: "Gaming", url: "https://retromind-gaming.vercel.app", project: "retromind-gaming" },
];
// Commits that only touch these files are skipped by vercel.json's ignoreCommand.
const NO_BUILD_FILES = ["feedback.md"];

const unescape = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">");

async function github(path) {
  const token = process.env.FEEDBACK_GITHUB_TOKEN;
  const res = await fetch(`https://api.github.com/repos/${REPO}/${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "retromind-admin",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`github ${path}: ${res.status}`);
  return res.json();
}

async function feedbackList(res) {
  if (!storeConfigured()) return res.status(200).json({ configured: false, entries: [] });
  const { content } = await readFile(FEEDBACK_PATH);
  const entries = listEntries(content).map((e) => ({ ...e, text: unescape(e.text) }));
  return res.status(200).json({ configured: true, entries });
}

async function feedbackAction(body, res) {
  if (!storeConfigured()) return res.status(503).json({ error: "not_configured" });
  const { action, id } = body;
  if (typeof id !== "string" || !/^fb-[\w-]+$/.test(id)) return res.status(400).json({ error: "bad_id" });
  const { content } = await readFile(FEEDBACK_PATH);
  const entry = findEntry(content, id);
  if (!entry) return res.status(404).json({ error: "not_found" });
  if (entry.status !== "offen") return res.status(409).json({ error: "not_open", status: entry.status });

  if (action === "accept") {
    // README first, then the status, so a failure in between can be retried.
    await updateFile(
      README_PATH,
      (readme) => addTodo(readme, { id, date: entry.date, categoryLabel: entry.categoryLabel, text: entry.text }),
      `README: To Do aus Feedback (${id})`,
    );
    await updateFile(FEEDBACK_PATH, (c) => markAccepted(c, id), `Feedback übernommen (${id})`);
    return res.status(200).json({ status: "übernommen" });
  }
  if (action === "done") {
    await updateFile(FEEDBACK_PATH, (c) => markDone(c, id), `Feedback erledigt (${id})`);
    return res.status(200).json({ status: "erledigt" });
  }
  return res.status(400).json({ error: "bad_action" });
}

// A guest signs in with Google on /gate.html; invited addresses get the cookie
// that middleware.js asks for.
async function guestLogin(body, res) {
  if (!guestsConfigured()) return res.status(503).json({ error: "not_configured" });
  try {
    const email = await googleEmail(String(body.token || ""));
    if (!email) return res.status(401).json({ error: "bad_token" });
    if (!(await isGuest(email))) return res.status(403).json({ error: "not_invited", email });
    res.setHeader("Set-Cookie", await makeCookie(email));
    return res.status(200).json({ ok: true, email });
  } catch (err) {
    console.error("guest login failed", err);
    return res.status(502).json({ error: "upstream" });
  }
}

async function liveCheck(res) {
  const master = await github(`commits/${BRANCH}`);
  const domains = await Promise.all(
    DOMAINS.map(async (d) => {
      const out = { ...d, sha: null, state: "unreachable", behind: 0 };
      try {
        const r = await fetch(`${d.url}/api/admin?view=version`, { cache: "no-store" });
        const v = r.ok ? await r.json() : null;
        out.sha = v?.sha || null;
      } catch {
        return out;
      }
      if (!out.sha) {
        out.state = "unknown";
        return out;
      }
      if (out.sha === master.sha) {
        out.state = "current";
        return out;
      }
      try {
        const cmp = await github(`compare/${out.sha}...${master.sha}`);
        out.behind = cmp.ahead_by || 0;
        const files = (cmp.files || []).map((f) => f.filename);
        out.state = files.length && files.every((f) => NO_BUILD_FILES.includes(f)) ? "current" : "stale";
      } catch {
        out.state = "stale";
      }
      return out;
    }),
  );
  return res.status(200).json({
    master: { sha: master.sha, message: String(master.commit?.message || "").split("\n")[0], date: master.commit?.committer?.date },
    domains,
  });
}

export default async function handler(req, res) {
  if (cors(req, res)) return;
  res.setHeader("Cache-Control", "no-store");
  const view = req.query?.view;

  if (req.method === "GET" && view === "version") {
    return res.status(200).json({ sha: process.env.VERCEL_GIT_COMMIT_SHA || null });
  }
  if (req.method === "GET" && view === "gate") {
    return res.status(200).json({
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || null,
      configured: guestsConfigured(),
    });
  }
  const body = req.method === "POST" ? await readJsonBody(req) : {};
  if (req.method === "POST" && body.action === "guestLogin") return guestLogin(body, res);
  if (req.method === "POST" && body.action === "guestLogout") {
    res.setHeader("Set-Cookie", clearCookie());
    return res.status(200).json({ ok: true });
  }
  if (!(await isAdmin(req))) return res.status(403).json({ error: "forbidden" });

  try {
    if (req.method === "GET" && view === "guests") {
      if (!guestsConfigured()) return res.status(200).json({ configured: false, guests: [], admin: ADMIN_EMAIL });
      return res.status(200).json({ configured: true, guests: await listGuests(), admin: ADMIN_EMAIL });
    }
    if (req.method === "POST" && (body.action === "guestAdd" || body.action === "guestRemove")) {
      const email = normalizeEmail(body.email);
      if (!validEmail(email)) return res.status(400).json({ error: "bad_email" });
      if (body.action === "guestAdd") await addGuest(email);
      else await removeGuest(email);
      return res.status(200).json({ guests: await listGuests() });
    }
    if (req.method === "GET" && view === "feedback") return await feedbackList(res);
    if (req.method === "POST") return await feedbackAction(body, res);
    if (req.method === "GET" && view === "live") return await liveCheck(res);
  } catch (err) {
    console.error("admin failed", err);
    return res.status(502).json({ error: "upstream" });
  }
  return res.status(400).json({ error: "bad_request" });
}
