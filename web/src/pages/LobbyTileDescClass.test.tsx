import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1546 — pin the `tile-desc` className on every solo-card tile's
 * description `<div>`.
 *
 * Each `GameCard` (LobbyPage.tsx ~L3037) renders:
 *
 *   <div className="tile-desc">{g.description}</div>
 *
 * The `.tile-desc` selector is keyed by lobby CSS for the small
 * description block beneath the tile title; renaming or dropping
 * the class would silently regress every tile's description
 * typography across the lobby grid.
 *
 * Sibling tests pin tile-cat-glyph aria (W1461), tile-stripe aria
 * (W1373), tile-sheen aria (W1389), tile-foot class (W1473),
 * tile-wrap class (W1334), eta title (W1244), fav-glyph aria
 * (W1291), difficulty (W1478/W1511) — but no test asserts on the
 * inner `.tile-desc` class. Grepping `Lobby*.test.tsx` for
 * `tile-desc` returns zero matches.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the
 * same convention used by W1389/W1461/W1473.
 */
describe("LobbyPage — solo-card tile-desc class (W1546)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile's description `<div>` with the `tile-desc` class", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Every game tile renders a `tile-<id>` testid on the inner Link
    // root. From there, locate the descendant `.tile-desc` div.
    const tiles = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-"]',
    );
    expect(tiles.length).toBeGreaterThan(0);

    let checked = 0;
    for (const tile of Array.from(tiles)) {
      // Skip nested tile chrome that shares the `tile-` prefix
      // (`tile-rating-*`, `tile-eta-*`, `tile-fav-marker-*`, etc.)
      // and skeletons; only inspect real solo-card / family-card roots.
      const testid = tile.getAttribute("data-testid") ?? "";
      if (!/^tile-/.test(testid)) continue;
      if (/^tile-(rating|eta|fav|drag|badge|tooltip|difficulty|plays)-/.test(testid)) continue;

      const desc = tile.querySelector<HTMLElement>(":scope > .tile-desc");
      if (desc === null) continue; // skeleton tiles have no inner direct child

      expect(desc).toHaveClass("tile-desc");
      checked += 1;
    }

    // Sanity: at least one real tile description was inspected so
    // the suite cannot pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
