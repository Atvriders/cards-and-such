import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Verifies every rummy / canasta game ships with a unique CSS class prefix and
 * a unique themed background palette. The shared RummyView template is
 * differentiated per-game with its own scoped class names + palette so each
 * variant has a distinct visual identity.
 */

const GAMES = [
  "gin-rummy",
  "oklahoma-gin",
  "oklahoma-gin-r",
  "straight-gin",
  "straight-gin-r",
  "hollywood-gin-r",
  "round-corner-gin-r",
  "kaluki-r",
  "liverpool-r",
  "shanghai-r",
  "indian-r",
  "pool-rummy-r",
  "knock-rummy-r",
  "three-thirteen-r",
  "boathouse-r",
  "scala-forty-r",
  "scala-40-r",
  "samba-canasta-r",
  "bolivia-canasta-r",
  "brazilian-canasta-r",
  "italian-canasta-r",
  "uruguay-canasta-r",
  "pennies-heaven-r",
  "cuban-canasta-r",
  "mexicana-canasta-r",
  "hand-foot-r",
  "biriba-r",
  "buraco-r",
  "loba-r",
  "tonk-r",
  "conquian-r",
  "ramino-r",
  "classic-canasta-r",
  "canasta-caliente-r",
  "canasta-mexicana-r",
  "canasta-junior-r",
  "canasta-speed-r",
  "pinochle-rummy-r",
  "wild-card-rummy-r",
  "skarney-r",
  "shed-rummy-r",
  "progressive-rummy-r",
  "quick-rummy-r",
  "rummy-royale-r",
  "nine-five-two-r",
  "paplu-r",
  "deals-rummy-r",
  "points-rummy-r",
  "indian-marriage-r",
  "rummy-tiles-r",
  "michigan-rum-r",
  "michigan-rum-stops-r",
  "persian-rummy-r",
  "rummy-500-classic-r",
];

function gameCss(slug: string): string {
  const dir = join(__dirname, "..", "src", "games", slug);
  for (const name of ["Game.css", "GinRummy.css"]) {
    const p = join(dir, name);
    if (existsSync(p)) return readFileSync(p, "utf8");
  }
  throw new Error(`No CSS for ${slug}`);
}

function firstPrefix(css: string): string {
  // grab the first ".xyz-" class selector; per-game CSS namespaces with a unique prefix
  const m = css.match(/\.([a-z0-9]+)-[a-z][a-z0-9-]*\s*[{,.]/);
  if (!m) throw new Error("no prefix found in css");
  return m[1];
}

function darkPaletteAnchor(css: string): string {
  // the wrap container uses linear-gradient(180deg, #DARK1 0%, #DARK2 100%)
  const m = css.match(
    /linear-gradient\(180deg,\s*(#[0-9a-fA-F]{3,8})\s*0%,\s*(#[0-9a-fA-F]{3,8})\s*100%\)/,
  );
  if (!m) throw new Error("no dark gradient palette found");
  return `${m[1].toLowerCase()}|${m[2].toLowerCase()}`;
}

describe("rummy/canasta themed CSS", () => {
  it("every listed game ships a CSS file", () => {
    for (const g of GAMES) {
      expect(() => gameCss(g)).not.toThrow();
    }
  });

  it("every game has a unique CSS class prefix", () => {
    const seen = new Map<string, string>();
    for (const g of GAMES) {
      const pfx = firstPrefix(gameCss(g));
      if (seen.has(pfx)) {
        throw new Error(
          `duplicate prefix ".${pfx}" for ${g} and ${seen.get(pfx)}`,
        );
      }
      seen.set(pfx, g);
    }
    expect(seen.size).toBe(GAMES.length);
  });

  it("every game has a unique themed background palette", () => {
    const seen = new Map<string, string>();
    for (const g of GAMES) {
      const palette = darkPaletteAnchor(gameCss(g));
      if (seen.has(palette)) {
        throw new Error(
          `duplicate palette ${palette} for ${g} and ${seen.get(palette)}`,
        );
      }
      seen.set(palette, g);
    }
    expect(seen.size).toBe(GAMES.length);
  });

  it("known thematic anchors match the brief", () => {
    // gin family — mint/silver greens
    expect(gameCss("gin-rummy")).toMatch(/#[0-9a-f]*[345][0-9a-f]{2}[a-f]?/i); // a green-ish hex
    expect(gameCss("oklahoma-gin-r")).toMatch(/#[01][0-9a-f]3[de]/i); // dark green family

    // canasta tropical — pinks/teals show up in canasta variants
    expect(gameCss("classic-canasta-r")).toMatch(/#[0-9a-f]{6}/);
    expect(gameCss("canasta-caliente-r")).toMatch(/#[0-9a-f]{6}/);

    // buraco — Brazilian green-yellow
    const buraco = gameCss("buraco-r");
    expect(buraco).toMatch(/#0a5d1a/i); // Brazilian green
    expect(buraco).toMatch(/#fde047|#fff7b3/i); // yellow accent

    // tonk — copper
    const tonk = gameCss("tonk-r");
    expect(tonk).toMatch(/#5a2b08|#f59e0b/i);

    // indian marriage — marigold
    const im = gameCss("indian-marriage-r");
    expect(im).toMatch(/#7a3a08|#fbbf24|#fff3b0/i);
  });
});
