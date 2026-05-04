import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1461 — pin the `aria-hidden="true"` attribute on every solo-card
 * tile's `.tile-cat-glyph` decorative span (the inner emoji/icon
 * inside the `.tile-meta > .tile-cat` category chip).
 *
 * Each `GameCard` (LobbyPage.tsx ~L3001) renders the category chip as:
 *
 *   <div className="tile-meta">
 *     <span className="tile-cat tile-cat-<tag>">
 *       <span className="tile-cat-glyph" aria-hidden="true">{glyph}</span>
 *       {CATEGORY_LABELS[g.category]}
 *     </span>
 *     ...
 *   </div>
 *
 * The glyph is a purely-decorative emoji (e.g. "🃏", "🎲") that
 * REPEATS information already conveyed by the visible category label
 * sitting next to it. Without `aria-hidden="true"` screen readers
 * would announce the bare emoji in addition to the human-readable
 * label on every tile in the grid — confusing and noisy.
 *
 * Sibling tests pin tile-sheen aria (W1389), tile-stripe aria
 * (W1373), tile-fav-marker aria, rating aria, etc. The
 * `tile-cat-glyph` aria-hidden attribute had no dedicated assertion —
 * grepping `Lobby*.test.tsx` for `tile-cat-glyph` returns zero
 * matches. Dropping the attribute (or rendering the glyph as a
 * focusable element) would silently regress screen-reader output
 * across the entire lobby grid.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1389 / W1373 / W1334: shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to the
 * mega-file.
 */
describe("LobbyPage — solo-card tile-cat-glyph aria-hidden (W1461)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile's `.tile-cat-glyph` span with aria-hidden=\"true\"", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Every game tile renders a `tile-<id>` testid on the inner Link
    // root. From there, locate the descendant `.tile-cat-glyph` span
    // inside the `.tile-meta` wrapper.
    const tiles = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-"]',
    );
    expect(tiles.length).toBeGreaterThan(0);

    let checked = 0;
    for (const tile of Array.from(tiles)) {
      // Skip nested tile chrome that shares the `tile-` prefix
      // (`tile-rating-*`, `tile-eta-*`, `tile-fav-marker-*`, etc.)
      // and skeletons; only inspect real solo-card roots.
      const testid = tile.getAttribute("data-testid") ?? "";
      if (!/^tile-\d+$/.test(testid) && !/^tile-fam-/.test(testid)) continue;

      const glyph = tile.querySelector<HTMLElement>(
        ":scope > .tile-meta > .tile-cat > .tile-cat-glyph",
      );
      expect(
        glyph,
        `tile ${testid} missing .tile-meta > .tile-cat > .tile-cat-glyph`,
      ).not.toBeNull();
      expect(glyph!.getAttribute("aria-hidden")).toBe("true");
      checked += 1;
    }

    // Sanity: at least one real tile was inspected so the suite can't
    // pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
