import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1373 — pin the `aria-hidden="true"` attribute on every solo-card
 * tile's `.tile-stripe` decorative span.
 *
 * Each `GameCard` / `FamilyCard` (LobbyPage.tsx ~L2988) renders a
 * `<span className="tile-stripe" aria-hidden="true" />` immediately
 * inside the tile `<Link>` root. The span is purely decorative chrome
 * (LobbyPage.css keys the gradient stripe off `.tile .tile-stripe`),
 * so it MUST be hidden from assistive tech — otherwise screen readers
 * would announce a phantom child element on every tile.
 *
 * Sibling tests pin the tile wrap class (W1334), eta-chip title
 * (W1244), fav-glyph aria (W1291), rating aria (W1262), and play-CTA
 * aria (W1344). The `tile-stripe` aria-hidden attribute had no
 * dedicated assertion — grepping `Lobby*.test.tsx` for `tile-stripe`
 * returns no matches. Dropping the `aria-hidden` (or rendering the
 * stripe as visible text) would silently regress screen-reader output
 * on the entire lobby grid.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W874 / W1244 / W1334: shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to the
 * mega-file.
 */
describe("LobbyPage — solo-card tile-stripe aria-hidden (W1373)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile's `.tile-stripe` span with aria-hidden=\"true\"", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Every game tile renders a `tile-<id>` testid on the inner Link
    // root. From there, locate the descendant `.tile-stripe` span.
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
      expect(stripe, `tile ${testid} missing .tile-stripe child`).not.toBeNull();
      expect(stripe!.getAttribute("aria-hidden")).toBe("true");
      checked += 1;
    }

    // Sanity: at least one real tile was inspected so the suite can't
    // pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
