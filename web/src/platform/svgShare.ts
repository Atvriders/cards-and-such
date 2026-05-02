/**
 * Shared SVG share-card builders for win banners and leaderboard exports.
 *
 * The two flavors here — `buildShareCardSvg` (1200×630, Open Graph aspect)
 * and `buildLadderSvg` (720-wide, vertically scaled) — both produce
 * self-contained `<svg>` documents with no runtime CSS or external image
 * deps. That keeps the file tiny, sharp at every zoom level, and renders
 * identically when previewed outside the browser. Callers download via
 * `downloadSvg`, which wraps the document in a Blob URL and clicks a
 * synthetic anchor — no extra deps, just DOM.
 */

/** XML-escape a user-controlled string before inlining into SVG markup. */
export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Trigger a browser download of the given SVG string under `filename`.
 * Silently no-ops in non-DOM environments (SSR / unit-test setups that
 * don't shim `URL`).
 */
export function downloadSvg(svg: string, filename: string): void {
  if (typeof document === "undefined" || typeof URL === "undefined") return;
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export interface ShareCardParams {
  /** Big headline at the top of the card. */
  title: string;
  /** Body text rows rendered top-to-bottom under the title. */
  lines: string[];
  /** Hex color used for the title gradient end-stop and accent strip. */
  accent: string;
  /** Date stamped into the footer. */
  date: Date;
}

/**
 * Build a 1200×630 Open-Graph-friendly share card. Designed for the
 * post-win "share moment" — title at the top, a stack of `lines`
 * (score, time, seed, …) in the middle, and a "Cards & Such" footer.
 *
 * Line wrapping is deliberately not implemented: callers should keep
 * each `lines` entry short (one statistic per row). The SVG itself
 * is fixed-size — we don't try to scale fonts to fit overflow.
 */
export function buildShareCardSvg(params: ShareCardParams): string {
  const { title, lines, accent, date } = params;
  const W = 1200;
  const H = 630;
  const PAD = 72;

  const titleSize = 84;
  const lineSize = 38;
  const lineGap = 18;
  const blockHeight = lines.length * lineSize + Math.max(0, lines.length - 1) * lineGap;
  const titleY = 220;
  const linesStartY = titleY + 90;

  const linesSvg = lines
    .map((raw, i) => {
      const y = linesStartY + i * (lineSize + lineGap);
      return `<text x="${PAD}" y="${y}" fill="#e2e8f0" font-family="Inter, system-ui, sans-serif" font-size="${lineSize}" font-weight="500">${escapeXml(raw)}</text>`;
    })
    .join("");

  const stamp = date.toISOString().slice(0, 10);
  // Suppress unused-variable noise — `blockHeight` is computed for callers
  // that may want to extend layout, but currently only documents intent.
  void blockHeight;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f1729"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
    <linearGradient id="title" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="${escapeXml(accent)}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${W}" height="6" fill="${escapeXml(accent)}"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="none" stroke="rgba(129,140,248,0.35)" stroke-width="2"/>
  <text x="${PAD}" y="120" fill="#94a3b8" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="600" letter-spacing="3">CARDS &amp; SUCH</text>
  <text x="${PAD}" y="${titleY}" fill="url(#title)" font-family="Inter, system-ui, sans-serif" font-size="${titleSize}" font-weight="800" letter-spacing="-1.5">${escapeXml(title)}</text>
  ${linesSvg}
  <text x="${PAD}" y="${H - 60}" fill="#64748b" font-family="Inter, system-ui, sans-serif" font-size="20">${escapeXml(stamp)}</text>
  <text x="${W - PAD}" y="${H - 60}" fill="#64748b" font-family="Inter, system-ui, sans-serif" font-size="20" text-anchor="end">cards.waterburp.com</text>
</svg>`;
}

export interface LadderRowLike {
  title: string;
  best: number;
  rating: number;
  played: number;
  lastPlayed: number;
  bestTimeSec: number;
}

/**
 * Format a "time since" relative label for the ladder export. Mirrors the
 * original in-page helper byte-for-byte so the regenerated SVG matches the
 * previously shipped layout.
 */
function formatRelative(ms: number): string {
  if (!ms) return "—";
  const diff = Date.now() - ms;
  if (diff < 0) return "just now";
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  const y = Math.floor(d / 365);
  return `${y}y ago`;
}

function formatBestTime(sec: number): string {
  if (!sec || !Number.isFinite(sec) || sec <= 0) return "";
  const mm = Math.floor(sec / 60);
  const ss = String(Math.floor(sec % 60)).padStart(2, "0");
  return `${mm}:${ss}`;
}

/**
 * Build a ladder SVG card from a sorted list of personal-best rows. Used by
 * Leaderboard → My Ladder → "Share". Format and copy preserved from the
 * original W157 implementation so existing screenshots stay recognizable.
 */
export function buildLadderSvg(
  rows: LadderRowLike[],
  username: string | null,
): string {
  const W = 720;
  const PAD = 24;
  const HEAD = 96;
  const ROW_H = 56;
  const FOOT = 48;
  const visible = rows.slice(0, 20);
  const H = HEAD + Math.max(1, visible.length) * ROW_H + FOOT;
  const title = username ? `${username}'s Cards Ladder` : "My Cards Ladder";
  const sub = `Top ${visible.length} games by combined score · ${new Date().toLocaleDateString()}`;

  const rowSvg = visible
    .map((r, i) => {
      const y = HEAD + i * ROW_H;
      const stripe = i % 2 === 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.01)";
      const medalColor =
        i === 0 ? "#fde68a" : i === 1 ? "#e2e8f0" : i === 2 ? "#fdba74" : "#94a3b8";
      const stars =
        "★".repeat(Math.max(0, Math.min(5, Math.round(r.rating)))) +
        "☆".repeat(5 - Math.max(0, Math.min(5, Math.round(r.rating))));
      const bestTime = formatBestTime(r.bestTimeSec);
      const right = bestTime
        ? `${r.best.toLocaleString()} · ${bestTime}`
        : r.best.toLocaleString();
      return [
        `<rect x="${PAD}" y="${y}" width="${W - PAD * 2}" height="${ROW_H - 6}" rx="10" fill="${stripe}" />`,
        `<text x="${PAD + 16}" y="${y + 26}" fill="${medalColor}" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="700">#${i + 1}</text>`,
        `<text x="${PAD + 64}" y="${y + 24}" fill="#f1f5f9" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="600">${escapeXml(r.title)}</text>`,
        `<text x="${PAD + 64}" y="${y + 42}" fill="#94a3b8" font-family="Inter, system-ui, sans-serif" font-size="12">${escapeXml(stars)}  ·  ${formatRelative(r.lastPlayed)}  ·  ${r.played} plays</text>`,
        `<text x="${W - PAD - 16}" y="${y + 32}" fill="#e0e3ff" font-family="Inter, system-ui, sans-serif" font-size="15" font-weight="600" text-anchor="end">${escapeXml(right)}</text>`,
      ].join("");
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f1729"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
    <linearGradient id="title" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#c7cdfe"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" rx="20" fill="url(#bg)"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="20" fill="none" stroke="rgba(129,140,248,0.35)" stroke-width="1"/>
  <text x="${PAD}" y="44" fill="url(#title)" font-family="Inter, system-ui, sans-serif" font-size="26" font-weight="800" letter-spacing="-0.5">${escapeXml(title)}</text>
  <text x="${PAD}" y="72" fill="#94a3b8" font-family="Inter, system-ui, sans-serif" font-size="13">${escapeXml(sub)}</text>
  ${visible.length === 0
    ? `<text x="${W / 2}" y="${HEAD + ROW_H / 2}" fill="#94a3b8" font-family="Inter, system-ui, sans-serif" font-size="14" text-anchor="middle">No games played yet — go set some scores!</text>`
    : rowSvg}
  <text x="${W - PAD}" y="${H - 18}" fill="#64748b" font-family="Inter, system-ui, sans-serif" font-size="11" text-anchor="end">cards.waterburp.com</text>
  <text x="${PAD}" y="${H - 18}" fill="#64748b" font-family="Inter, system-ui, sans-serif" font-size="11">Generated ${new Date().toISOString().slice(0, 10)}</text>
</svg>`;
}
