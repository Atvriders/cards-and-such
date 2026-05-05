import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1717 — pin the EXACT `className` string ("tile-sheen") on every
 * solo-card tile's decorative sweep-highlight span.
 *
 * Each `GameCard` / `FamilyCard` (LobbyPage.tsx ~L2989 / ~L3229 /
 * ~L3382 / ~L3441 / ~L2058) renders a
 * `<span className="tile-sheen" aria-hidden="true" />` immediately
 * inside the tile `<Link>` root, paired with the sibling `tile-stripe`
 * span. The CSS in LobbyPage.css keys the hover sweep off
 * `.tile:hover .tile-sheen` ALONE — any extra className tokens would
 * silently break the cascade for downstream specificity overrides, and
 * a renamed class would collapse the visual sheen on every tile in the
 * grid.
 *
 * Sibling W1389 (LobbyTileSheenAria) pins the sheen's
 * `aria-hidden="true"` attribute, but locates the sheen via the
 * `:scope > .tile-sheen` querySelector — so a regression that adds
 * a stray utility class (e.g. `"tile-sheen lobby-anim"`) or trims to
 * `"sheen"` would NOT be caught: the `.tile-sheen` selector still
 * matches the first variant, and the aria check passes regardless.
 *
 * Sibling tests pin tile-stripe className equality (W1705), tile-foot
 * className equality (W1681), tile-chips className equality (W1692),
 * tile-meta tag+className (W1670), tile-stripe aria (W1373), tile-sheen
 * aria (W1389), tile-cat-glyph aria (W1461). The SHEEN span's exact
 * `className` string had no dedicated assertion — grepping
 * `Lobby*.test.tsx` for `sheen.className` / `className.*toBe.*tile-sheen`
 * returns zero matches.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1373 / W1389 / W1681 / W1692 / W1705: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-sheen span className equality (W1717)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile-sheen span with className === \"tile-sheen\"", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Locate every sheen span via attribute-substring selector so a
    // regression that injects extra class tokens (e.g.
    // "tile-sheen lobby-anim") is still caught by the equality check
    // below, rather than silently filtered out by `.tile-sheen`.
    const sheens = document.querySelectorAll<HTMLElement>(
      '[class*="tile-sheen"]',
    );
    expect(sheens.length).toBeGreaterThan(0);

    let checked = 0;
    for (const sheen of Array.from(sheens)) {
      const cls = sheen.className;
      // Only inspect the actual sheen span — guard against any
      // future siblings that might share the `tile-sheen` substring
      // (e.g. `tile-sheen-glow`).
      if (!/(^|\s)tile-sheen(\s|$)/.test(cls)) continue;

      // Pin the EXACT className string — no extra tokens, no rename,
      // no whitespace drift.
      expect(cls).toBe("tile-sheen");
      checked += 1;
    }

    // Sanity: at least one real sheen was inspected so the suite
    // can't pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
