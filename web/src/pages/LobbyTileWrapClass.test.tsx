import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1334 — pin the `lobby-tile-wrap` className on every solo-card tile's
 * parent container.
 *
 * Each `GameCard` / `FamilyCard` (LobbyPage.tsx ~L2969, ~L3214) wraps
 * its `<Link className="tile ...">` root in a sibling
 * `<div className="lobby-tile-wrap">`. That wrapper is product-visible
 * chrome — `LobbyPage.css` keys mount-fade animations and grid spacing
 * off `.lobby-grid > .lobby-tile-wrap` (LobbyPage.css ~L1846, ~L1852,
 * ~L1856), and the capture-phase coachmark dismiss listener
 * (LobbyPage.tsx ~L1461) treats `.lobby-tile-wrap` as a
 * tile-equivalent click target via `target.closest(".lobby-tile-wrap")`.
 *
 * Sibling W1244 (LobbyTileEtaTitle) covers the eta chip's title;
 * sibling tests pin the rating widget, fav-toggle glyph, and tile menu
 * trigger. The parent wrapper's className had no dedicated assertion —
 * searching `Lobby*.test.tsx` for `lobby-tile-wrap` only turns up a
 * comment in LobbyPage.test.tsx (~L255), not an `expect` on the class.
 * Dropping the wrapper, renaming it, or pulling the class to the
 * `<Link>` root would silently break the mount-fade and the
 * coachmark's tile-equivalent dismiss path.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W874 / W908 / W932 / W951 / W965 / W1244: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — solo-card tile wrap className (W1334)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile inside a `.lobby-tile-wrap` parent container", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Every game tile renders a `tile-<id>` testid on the inner Link
    // root. Walk up to confirm the parent is the wrap container.
    const tiles = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-"]',
    );
    expect(tiles.length).toBeGreaterThan(0);

    let checked = 0;
    for (const tile of Array.from(tiles)) {
      // Skip the skeleton variant testid (`lobby-skeleton-tile`) and
      // any non-tile chrome that happens to share the `tile-` prefix
      // (e.g. `tile-rating-*`, `tile-eta-*`, `tile-fav-marker-*`).
      const testid = tile.getAttribute("data-testid") ?? "";
      if (!/^tile-\d+$/.test(testid) && !/^tile-fam-/.test(testid)) continue;

      const parent = tile.parentElement;
      expect(parent).not.toBeNull();
      expect(parent!.className).toMatch(/\blobby-tile-wrap\b/);
      checked += 1;
    }

    // Sanity: at least one real tile was inspected so the suite can't
    // pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
