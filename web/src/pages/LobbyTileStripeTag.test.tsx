import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1838 — pin the tagName ("SPAN") of the solo-card `.tile-stripe`
 * decorative gradient element.
 *
 * Each `GameCard` / `FamilyCard` (LobbyPage.tsx ~L2988 / ~L3228 /
 * ~L3381 / ~L3440) renders the stripe as
 * `<span className="tile-stripe" aria-hidden="true" />` — an inline
 * span by design. The CSS in LobbyPage.css keys the gradient sweep
 * off `.tile .tile-stripe`, but more importantly the layout assumes
 * an INLINE element so the stripe absolutely-positions inside the
 * tile without forcing a block-level reflow of the surrounding meta
 * row. Silently re-tagging the stripe as a `<div>` (or any block
 * element) would shift sibling layout — yet none of the sibling
 * tests would catch it: W1373 pins `aria-hidden`, W1705 pins the
 * exact className, but neither pins the tag.
 *
 * Sibling tests pin tile-stripe aria (W1373) and className equality
 * (W1705); tile-meta tag+className (W1670); tile-sheen aria (W1389).
 * The stripe span's tagName had no dedicated assertion — grepping
 * `Lobby*.test.tsx` for `tile-stripe` + `tagName` returns zero
 * matches.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1670 / W1705 / W1373: shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to the
 * mega-file.
 */
describe("LobbyPage — solo-card tile-stripe tagName (W1838)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile's `.tile-stripe` element with tagName === \"SPAN\"", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Every game tile renders a `tile-<id>` testid on the inner Link
    // root. From there, locate the immediate `.tile-stripe` child.
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

      const stripe = tile.querySelector<HTMLElement>(":scope > .tile-stripe");
      expect(stripe, `tile ${testid} missing direct .tile-stripe child`).not.toBeNull();
      expect(stripe!.tagName).toBe("SPAN");
      checked += 1;
    }

    // Sanity: at least one real tile was inspected so the suite can't
    // pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
