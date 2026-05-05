import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1692 — pin the EXACT `className` string ("tile-chips") on every
 * solo-card tile's chips wrapper.
 *
 * The `TileMetaChips` component (LobbyPage.tsx ~L2734) renders the
 * eta + difficulty pills inside a `<div className="tile-chips">`.
 * Sibling W1397 (LobbyTileChipsAria) pins the wrapper's
 * `aria-hidden="false"` attribute, but selects elements via the
 * `div.tile-chips` querySelector — so a regression that adds a
 * stray utility class (e.g. `"tile-chips lobby-pad"`) or trims to
 * `"chips"` would NOT be caught: the `.tile-chips` selector still
 * matches the first variant, and the aria check passes regardless.
 *
 * The CSS in LobbyPage.css keys the flex layout, gap, and pill
 * spacing off `.tile .tile-chips` ALONE — any extra className
 * tokens would silently break the cascade for downstream specificity
 * overrides, and a renamed class would collapse the chip layout.
 *
 * Sibling tests: tile-foot className equality (W1681), tile-meta
 * tag+className (W1670), tile-desc tag+class (W1567/W1546),
 * tile-chips aria (W1397). The CHIPS WRAPPER's exact `className`
 * string had no dedicated assertion — grepping `Lobby*.test.tsx`
 * for `tile-chips` returns only the aria test (which uses a
 * `div.tile-chips` SELECTOR, not a `className === "tile-chips"`
 * EQUALITY check).
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the
 * same rationale as W1373 / W1389 / W1397 / W1681: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-chips wrapper className equality (W1692)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile-chips wrapper with className === \"tile-chips\"", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Locate every chips wrapper. Use an attribute-startswith selector
    // so a regression that injects extra class tokens (e.g.
    // "tile-chips lobby-pad") is still caught by the equality check
    // below, rather than silently filtered out by `.tile-chips`.
    const wrappers = document.querySelectorAll<HTMLElement>(
      '[class*="tile-chips"]',
    );
    expect(wrappers.length).toBeGreaterThan(0);

    let checked = 0;
    for (const wrapper of Array.from(wrappers)) {
      // Only inspect the actual chips WRAPPER, not the inner
      // `.tile-chip` / `.tile-chip-eta` / `.tile-chip-diff-*`
      // pills that share the `tile-chip` prefix.
      const cls = wrapper.className;
      if (!/(^|\s)tile-chips(\s|$)/.test(cls)) continue;

      // Pin the EXACT className string — no extra tokens, no
      // rename, no whitespace drift.
      expect(cls).toBe("tile-chips");
      checked += 1;
    }

    // Sanity: at least one real wrapper was inspected so the suite
    // can't pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
