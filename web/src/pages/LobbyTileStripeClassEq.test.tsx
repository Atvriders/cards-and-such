import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1705 — pin the EXACT `className` string ("tile-stripe") on every
 * solo-card tile's decorative gradient stripe span.
 *
 * Each `GameCard` / `FamilyCard` (LobbyPage.tsx ~L2988 / ~L3228 /
 * ~L3381 / ~L3440) renders a
 * `<span className="tile-stripe" aria-hidden="true" />` immediately
 * inside the tile `<Link>` root. The CSS in LobbyPage.css keys the
 * gradient sweep off `.tile .tile-stripe` ALONE — any extra className
 * tokens would silently break the cascade for downstream specificity
 * overrides, and a renamed class would collapse the visual stripe on
 * every tile in the grid.
 *
 * Sibling W1373 (LobbyTileStripeAria) pins the stripe's
 * `aria-hidden="true"` attribute, but locates the stripe via the
 * `:scope > .tile-stripe` querySelector — so a regression that adds
 * a stray utility class (e.g. `"tile-stripe lobby-anim"`) or trims to
 * `"stripe"` would NOT be caught: the `.tile-stripe` selector still
 * matches the first variant, and the aria check passes regardless.
 *
 * Sibling tests pin tile-foot className equality (W1681), tile-chips
 * className equality (W1692), tile-meta tag+className (W1670),
 * tile-stripe aria (W1373), tile-sheen aria (W1389), tile-cat-glyph
 * aria (W1461). The STRIPE span's exact `className` string had no
 * dedicated assertion — grepping `Lobby*.test.tsx` for
 * `stripe.className` / `className.*toBe.*tile-stripe` returns zero
 * matches.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1373 / W1389 / W1681 / W1692: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-stripe span className equality (W1705)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile-stripe span with className === \"tile-stripe\"", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Locate every stripe span via attribute-substring selector so a
    // regression that injects extra class tokens (e.g.
    // "tile-stripe lobby-anim") is still caught by the equality check
    // below, rather than silently filtered out by `.tile-stripe`.
    const stripes = document.querySelectorAll<HTMLElement>(
      '[class*="tile-stripe"]',
    );
    expect(stripes.length).toBeGreaterThan(0);

    let checked = 0;
    for (const stripe of Array.from(stripes)) {
      const cls = stripe.className;
      // Only inspect the actual stripe span — guard against any
      // future siblings that might share the `tile-stripe` substring
      // (e.g. `tile-stripe-glow`).
      if (!/(^|\s)tile-stripe(\s|$)/.test(cls)) continue;

      // Pin the EXACT className string — no extra tokens, no rename,
      // no whitespace drift.
      expect(cls).toBe("tile-stripe");
      checked += 1;
    }

    // Sanity: at least one real stripe was inspected so the suite
    // can't pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
