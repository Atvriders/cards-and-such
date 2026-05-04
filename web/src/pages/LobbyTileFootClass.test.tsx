import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1473 — pin the `.tile-foot` wrapper `<div>` rendered as the bottom
 * row of every solo-card lobby tile. Each `GameCard` (LobbyPage.tsx
 * ~L3039) closes its layout with:
 *
 *   <div className="tile-foot">
 *     <span className="tile-players">…</span>
 *     <span className="tile-cta" aria-hidden="true">Play</span>
 *   </div>
 *
 * The `.tile-foot` selector is the CSS hook for the tile's footer
 * flex row (players count on the left, decorative "Play" CTA on the
 * right). Sibling tests already pin tile-cat-glyph aria (W1461),
 * tile-stripe aria (W1373), tile-sheen aria (W1389), tile-chips aria
 * (W1397), tile-wrap class (W1334), tile-eta title (W1244) — but
 * grepping `Lobby*.test.tsx` for the `tile-foot` selector itself
 * returns zero direct assertions. Renaming the class (or dropping
 * the wrapper) would silently break every footer layout rule
 * scoped to `.tile-foot` in `LobbyPage.css`.
 *
 * Lives in a new sibling file (not LobbyPage.test.tsx) per the
 * same rationale as W1461 / W1389 / W1334: shares the
 * `src/pages/LobbyTile` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — solo-card tile-foot wrapper class (W1473)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every solo tile's bottom row as a `.tile-foot` <div>", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the
    // canonical "lobby is ready" anchor used by sibling tests.
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
      expect(foot!.tagName).toBe("DIV");
      checked += 1;
    }

    // Sanity: at least one real solo tile was inspected so the
    // assertion above can't pass by skipping every element.
    expect(checked).toBeGreaterThan(0);
  });
});
