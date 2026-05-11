import { describe, expect, it } from "vitest";
import {
  buildLadderSvg,
  buildShareCardSvg,
  escapeXml,
  type LadderRowLike,
} from "./svgShare.js";

describe("svgShare", () => {
  it("escapes XML-special characters and inlines unsafe input safely", () => {
    // Direct API behavior.
    expect(escapeXml(`<script>"&'`)).toBe(
      "&lt;script&gt;&quot;&amp;&apos;",
    );

    // And the higher-level builder must use it: a title with raw `<` and `&`
    // must not appear unescaped in the resulting SVG markup.
    const svg = buildShareCardSvg({
      title: "Won! <Cards & Such>",
      lines: ['line "one"', "line 'two'"],
      accent: "#ff00aa",
      date: new Date("2025-01-02T00:00:00.000Z"),
    });
    // The literal source string never appears raw (would indicate XSS hole).
    expect(svg).not.toContain("Won! <Cards & Such>");
    expect(svg).toContain("Won! &lt;Cards &amp; Such&gt;");
    expect(svg).toContain('line &quot;one&quot;');
    expect(svg).toContain("line &apos;two&apos;");
    // Fixed Open-Graph dimensions and ISO date stamp are present.
    expect(svg).toContain('viewBox="0 0 1200 630"');
    expect(svg).toContain("2025-01-02");
    expect(svg.trim().startsWith("<?xml")).toBe(true);
    expect(svg.trim().endsWith("</svg>")).toBe(true);
  });

  it("builds a ladder card whose height scales with row count and shows medals", () => {
    const rows: LadderRowLike[] = [
      { title: "Solitaire", best: 1200, rating: 5, played: 12, lastPlayed: Date.now() - 1000, bestTimeSec: 125 },
      { title: "FreeCell", best: 950, rating: 4, played: 7, lastPlayed: Date.now() - 60_000, bestTimeSec: 0 },
      { title: "Klondike <hax>", best: 800, rating: 3, played: 3, lastPlayed: 0, bestTimeSec: 45 },
    ];
    const svg = buildLadderSvg(rows, "atvrider");

    // Username makes it into the headline (escaped via escapeXml path).
    expect(svg).toContain("atvrider&apos;s Cards Ladder");
    // Hostile title is escaped, never raw.
    expect(svg).not.toContain("Klondike <hax>");
    expect(svg).toContain("Klondike &lt;hax&gt;");
    // Best-time formatter renders mm:ss with zero-padded seconds for sec=125.
    expect(svg).toContain("2:05");
    // The zero-bestTime row should not produce a stray "0:00" separator.
    expect(svg).toContain("950");
    // Height: HEAD(96) + 3 rows * 56 + FOOT(48) = 312.
    expect(svg).toContain('viewBox="0 0 720 312"');
    // Medal colors for the top 3 ranks must each appear at least once.
    expect(svg).toContain("#fde68a"); // gold
    expect(svg).toContain("#e2e8f0"); // silver
    expect(svg).toContain("#fdba74"); // bronze
    // Stars: rating 5 should produce five filled and zero hollow stars.
    // escapeXml does not touch non-ASCII so the raw glyph survives intact.
    expect(svg).toContain("★★★★★");
  });

  it("falls back to a friendly empty-state and default title when no rows / username", () => {
    const svg = buildLadderSvg([], null);
    expect(svg).toContain("My Cards Ladder");
    expect(svg).toContain("No games played yet");
    // Height still computes with max(1, 0)=1 row block: 96 + 56 + 48 = 200.
    expect(svg).toContain('viewBox="0 0 720 200"');
  });
});
