import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1670 — pin the tagName + exact className of the solo-card
 * `.tile-meta` wrapper sitting between the decorative stripe/sheen
 * spans and the `.tile-title` row.
 *
 * Each `GameCard` (LobbyPage.tsx ~L3000) renders the meta row as:
 *
 *   <div className="tile-meta">
 *     <span className="tile-cat tile-cat-<tag>">…</span>
 *     {g.multiplayer && <span className="tile-mp-badge">…</span>}
 *   </div>
 *
 * Sibling tests pin the inner `.tile-cat-glyph` aria attribute
 * (W1461), but no test pins the wrapper itself. If the wrapper were
 * silently re-tagged as a `<span>` (collapsing flex layout) or its
 * className were renamed (breaking the `.tile .tile-meta { … }`
 * grid-row CSS rule that pads + flexes the row), the lobby grid
 * would visually regress without a single failing assertion. Pin
 * BOTH the tagName ("DIV") and the exact className ("tile-meta")
 * for every real solo-card tile.
 *
 * Lives in a NEW SIBLING file per the same rationale as W1461 /
 * W1389 / W1373: shares the `src/pages/Lobby` vitest path filter
 * without colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — solo-card tile-meta wrapper tagName + className (W1670)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile's `.tile-meta` wrapper as a <div> with the exact 'tile-meta' className", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Every game tile renders a `tile-<id>` testid on the inner Link
    // root. From there, locate the immediate `.tile-meta` child.
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

      const meta = tile.querySelector<HTMLElement>(":scope > .tile-meta");
      expect(meta, `tile ${testid} missing direct .tile-meta child`).not.toBeNull();
      expect(meta!.tagName).toBe("DIV");
      expect(meta!.getAttribute("class")).toBe("tile-meta");
      checked += 1;
    }

    // Sanity: at least one real tile was inspected so the suite can't
    // pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
