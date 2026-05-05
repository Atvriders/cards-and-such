import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1681 — pin the EXACT className equality (no trailing/leading
 * tokens, no concatenated state classes) of the solo-card
 * `.tile-foot` wrapper rendered as the bottom row of every game
 * tile.
 *
 * Each `GameCard` (LobbyPage.tsx ~L3039) closes its layout with:
 *
 *   <div className="tile-foot">
 *     <span className="tile-players">…</span>
 *     <span className="tile-cta" aria-hidden="true">Play</span>
 *   </div>
 *
 * Sibling W1473 (`LobbyTileFootClass.test.tsx`) pins the wrapper's
 * tagName ("DIV") and verifies the `.tile-foot` selector resolves a
 * direct child of the tile root, but it does NOT pin the exact
 * className string. If a future edit silently appended a state
 * class (e.g. `tile-foot tile-foot--mp`) or replaced the class with
 * a CSS module hash, the wrapper would still match
 * `:scope > .tile-foot` and W1473 would still pass — but the
 * `.tile-foot` rule in `LobbyPage.css` would no longer apply
 * cleanly across every solo tile. Pinning `class === "tile-foot"`
 * (exact equality, matching the W1670 tile-meta className-equality
 * pattern) guards against silent class-list expansion.
 *
 * Lives in a NEW SIBLING file per the same rationale as W1670 /
 * W1473: shares the `src/pages/LobbyTile` vitest path filter without
 * colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — solo-card tile-foot wrapper className equality (W1681)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile's `.tile-foot` wrapper with the EXACT 'tile-foot' className (no extra tokens)", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    const tiles = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-"]',
    );
    expect(tiles.length).toBeGreaterThan(0);

    let checked = 0;
    for (const tile of Array.from(tiles)) {
      // Only inspect real solo-card roots (skip nested tile chrome
      // such as `tile-rating-*`, `tile-eta-*`, etc.).
      const testid = tile.getAttribute("data-testid") ?? "";
      if (!/^tile-\d+$/.test(testid)) continue;

      const foot = tile.querySelector<HTMLElement>(":scope > .tile-foot");
      expect(
        foot,
        `tile ${testid} missing direct child .tile-foot wrapper`,
      ).not.toBeNull();
      // Exact className equality — no leading/trailing whitespace,
      // no extra state-class tokens, no module hashes.
      expect(foot!.getAttribute("class")).toBe("tile-foot");
      checked += 1;
    }

    // Sanity: at least one real solo tile was inspected so the
    // assertion above can't pass by skipping every element.
    expect(checked).toBeGreaterThan(0);
  });
});
