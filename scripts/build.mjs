#!/usr/bin/env node
/**
 * Builds index.html from the AtomIQ app's own Privacy Policy text, so the public page and the
 * in-app policy never differ.
 *
 *   node scripts/build.mjs [path-to-AtomIQ-repo]     (default: ../AtomIQ)
 *
 * Reads content/legal/privacy.ts and constants/legal.ts from the app repo. Run it whenever the
 * app's policy changes, commit index.html, and GitHub Pages serves the new version.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(here, "..");
const appRoot = path.resolve(process.argv[2] ?? path.join(site, "..", "AtomIQ"));

if (!fs.existsSync(path.join(appRoot, "content/legal/privacy.ts"))) {
  console.error(`Not an AtomIQ repo: ${appRoot} (no content/legal/privacy.ts)`);
  process.exit(1);
}

// The app's loader reads TypeScript relative to the current directory and uses its own `typescript`.
process.chdir(appRoot);
const { loadTs } = await import(pathToFileURL(path.join(appRoot, "scripts/lib/ts-require.mjs")).href);
const privacy = loadTs("content/legal/privacy.ts");
const legal = loadTs("constants/legal.ts");
const appJson = JSON.parse(fs.readFileSync(path.join(appRoot, "app.json"), "utf8")).expo;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const email = legal.LEGAL_CONTACT_EMAIL;
const inline = (s) => {
  let out = esc(s);
  if (email) out = out.split(email).join(`<a href="mailto:${email}">${email}</a>`);
  out = out.replace(/\(privacy\.gov\.ph\)/g, '(<a href="https://privacy.gov.ph" rel="noopener">privacy.gov.ph</a>)');
  return out;
};

/** A body is paragraphs split by newline; a line that starts with "• " is a bullet. */
const bodyHtml = (body) => {
  const html = [];
  let list = [];
  const flush = () => {
    if (list.length) html.push(`<ul>${list.map((i) => `<li>${i}</li>`).join("")}</ul>`);
    list = [];
  };
  for (const line of body.split("\n")) {
    if (line.startsWith("• ")) list.push(inline(line.slice(2)));
    else {
      flush();
      html.push(`<p>${inline(line)}</p>`);
    }
  }
  flush();
  return html.join("\n      ");
};

const idOf = (title) => "s" + title.match(/^\d+/)[0];
const sections = privacy.PRIVACY_SECTIONS;
const appName = appJson.name;
const pkg = appJson.android.package;
const title = `${appName} Privacy Policy`;
const description = `${appName} privacy policy: no account, no ads, no analytics and no tracking. Your progress stays on your device.`;

const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="index, follow">
  <meta name="color-scheme" content="light dark">
  <link rel="icon" href="icon.png">
  <style>
    :root {
      --bg: #ffffff; --text: #1f2933; --muted: #5b6770; --line: #e3e8ec;
      --card: #f6f8fa; --accent: #1565c0; --accent-soft: #e8f1fb;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #111418; --text: #e6e9ec; --muted: #9aa5ae; --line: #2a3138;
        --card: #1a1f25; --accent: #6db3ff; --accent-soft: #16263a;
      }
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0; background: var(--bg); color: var(--text);
      font: 17px/1.65 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    }
    main { max-width: 760px; margin: 0 auto; padding: 32px 20px 72px; }
    header.top { display: flex; gap: 16px; align-items: center; margin-bottom: 8px; }
    header.top img { width: 64px; height: 64px; border-radius: 14px; }
    h1 { font-size: 1.9rem; line-height: 1.2; margin: 0; }
    .meta { color: var(--muted); font-size: .95rem; margin: 4px 0 0; }
    .lead { font-size: 1.1rem; margin: 20px 0; }
    .card { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 16px 20px; margin: 20px 0; }
    .card h2 { margin: 0 0 8px; font-size: 1.05rem; border: 0; padding: 0; }
    .card ul { margin: 0; padding-left: 1.2em; }
    .facts { width: 100%; border-collapse: collapse; font-size: .95rem; }
    .facts th, .facts td { text-align: left; padding: 8px 0; border-top: 1px solid var(--line); vertical-align: top; }
    .facts th { width: 38%; color: var(--muted); font-weight: 600; padding-right: 12px; }
    .facts tr:first-child th, .facts tr:first-child td { border-top: 0; }
    nav.toc ol { margin: 0; padding-left: 1.4em; columns: 2; column-gap: 28px; }
    nav.toc li { break-inside: avoid; margin: 2px 0; }
    @media (max-width: 560px) { nav.toc ol { columns: 1; } }
    section { margin-top: 36px; }
    h2 { font-size: 1.3rem; margin: 0 0 8px; padding-top: 8px; border-top: 1px solid var(--line); }
    p { margin: 10px 0; }
    ul { margin: 10px 0; padding-left: 1.3em; }
    li { margin: 6px 0; }
    a { color: var(--accent); }
    footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid var(--line); color: var(--muted); font-size: .9rem; }
    @media print { nav.toc, .card.tint { display: none; } body { font-size: 12pt; } }
  </style>
</head>
<body>
<main>
  <header class="top">
    <img src="icon.png" alt="" width="64" height="64">
    <div>
      <h1>${esc(title)}</h1>
      <p class="meta">Version ${esc(legal.LEGAL_VERSION)} · Last updated ${esc(legal.LEGAL_LAST_UPDATED)}</p>
    </div>
  </header>

  <p class="lead">${inline(privacy.PRIVACY_LEAD)}</p>

  <div class="card">
    <table class="facts">
      <tr><th>App</th><td>${esc(appName)} (Android package <code>${esc(pkg)}</code>)</td></tr>
      <tr><th>Developer</th><td>Kent Garcia. AtomIQ is made for the MythSmashers by the DOST-PNRI.</td></tr>
      <tr><th>Contact</th><td>${email ? `<a href="mailto:${email}">${email}</a>` : "See the app store page"}</td></tr>
      <tr><th>Data collected by us</th><td>None. We run no server that receives your information.</td></tr>
      <tr><th>Data shared with third parties</th><td>None by us. Opening a source link or loading a picture contacts that site directly (see <a href="#s8">section 8</a>).</td></tr>
      <tr><th>Ads, analytics, crash reporting</th><td>None. The app contains no advertising, analytics or crash-reporting SDK.</td></tr>
      <tr><th>Android permissions</th><td>Internet only</td></tr>
      <tr><th>Delete your data</th><td>In the app: Settings &gt; Delete Account. Or uninstall the app.</td></tr>
    </table>
  </div>

  <div class="card tint">
    <h2>In short</h2>
    <ul>
${privacy.PRIVACY_HIGHLIGHTS.map((h) => `      <li>${inline(h)}</li>`).join("\n")}
    </ul>
  </div>

  <nav class="card toc" aria-label="Contents">
    <h2>Contents</h2>
    <ol>
${sections.map((s) => `      <li><a href="#${idOf(s.title)}">${esc(s.title.replace(/^\d+\.\s*/, ""))}</a></li>`).join("\n")}
    </ol>
  </nav>

${sections
  .map(
    (s) => `  <section id="${idOf(s.title)}">
    <h2>${esc(s.title)}</h2>
      ${bodyHtml(s.body)}
  </section>`,
  )
  .join("\n\n")}

  <footer>
    <p>${esc(appName)} Privacy Policy, version ${esc(legal.LEGAL_VERSION)}, last updated ${esc(legal.LEGAL_LAST_UPDATED)}. This page is the same text as Settings &gt; Privacy Policy inside the app.</p>
  </footer>
</main>
</body>
</html>
`;

fs.writeFileSync(path.join(site, "index.html"), page);
const icon = path.join(appRoot, "assets/images/mascot/icon-256.png");
if (fs.existsSync(icon)) fs.copyFileSync(icon, path.join(site, "icon.png"));
console.log(`index.html written: ${sections.length} sections, version ${legal.LEGAL_VERSION}, ${page.length} bytes`);
