import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1389 — pin the `aria-hidden="true"` attribute on every solo-card
 * tile's `.tile-sheen` decorative span.
 *
 * Each `GameCard` / `FamilyCard` (LobbyPage.tsx ~L2989) renders a
 * `<span className="tile-sheen" aria-hidden="true" />` immediately
 * inside the tile `<Link>` root, alongside the `tile-stripe` sibling.
 * The sheen span is the sweep highlight keyed by `.tile:hover .tile-sheen`
 * in LobbyPage.css (~L706) — purely decorative chrome that MUST be
 * hidden from assistive tech, otherwise screen readers would announce
 * a phantom empty child on every lobby tile.
 *
 * Sibling tests pin tile-stripe aria (W1373), tile-wrap class (W1334),
 * eta-chip title (W1244), fav-glyph aria (W1291), rating aria (W1262),
 * and play-CTA aria (W1344). The `tile-sheen` aria-hidden attribute had
 * no dedicated assertion — grepping `Lobby*.test.tsx` for `tile-sheen`
 * returns zero matches. Dropping the `aria-hidden` (or rendering the
 * sheen as a focusable/visible element) would silently regress
 * screen-reader output across the entire lobby grid.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W874 / W1244 / W1334 / W1373: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — solo-card tile-sheen aria-hidden (W1389)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile's `.tile-sheen` span with aria-hidden=\"true\"", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Every game tile renders a `tile-<id>` testid on the inner Link
    // root. From there, locate the descendant `.tile-sheen` span.
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

      const sheen = tile.querySelector<HTMLElement>(":scope > .tile-sheen");
      expect(sheen, `tile ${testid} missing .tile-sheen child`).not.toBeNull();
      expect(sheen!.getAttribute("aria-hidden")).toBe("true");
      checked += 1;
    }

    // Sanity: at least one real tile was inspected so the suite can't
    // pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
