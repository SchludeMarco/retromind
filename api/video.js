// Streams a generated Veo video through the server so the API key (needed as a
// query parameter on the download endpoint) never appears in the browser.

export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  const uri = typeof req.query.uri === "string" ? req.query.uri : "";

  if (!apiKey) {
    res.status(503).end("Server ohne Schlüssel konfiguriert.");
    return;
  }

  let target;
  try {
    target = new URL(uri);
  } catch {
    res.status(400).end("Ungültige URL.");
    return;
  }
  // Only allow Google's own media hosts — prevents this route from being an
  // open proxy.
  if (target.protocol !== "https:" || !/(^|\.)googleapis\.com$/.test(target.hostname)) {
    res.status(400).end("Nicht erlaubte Quelle.");
    return;
  }

  target.searchParams.set("key", apiKey);

  try {
    const upstream = await fetch(target.toString());
    if (!upstream.ok || !upstream.body) {
      res.status(502).end("Video konnte nicht geladen werden.");
      return;
    }
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "video/mp4");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="retromind-erinnerung.mp4"'
    );
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.status(200).send(buf);
  } catch (e) {
    console.error("video proxy error:", e?.message || e);
    res.status(502).end("Video-Proxy-Fehler.");
  }
}
