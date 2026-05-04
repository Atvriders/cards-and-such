import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1590 — pin the `lobby-tile-title` className token on every solo-card
 * tile-title element. `GameCard` (LobbyPage.tsx ~L3012) renders:
 *
 *   <div className="tile-title lobby-tile-title">…</div>
 *
 * The `lobby-tile-title` token is the lobby-scoped *variant* class
 * that distinguishes a lobby grid title from generic `.tile-title`
 * surfaces elsewhere in the app. Search-state CSS, highlight
 * suppression, and lobby-grid line-height/clamp rules all key off
 * `.lobby-tile-title` specifically. Dropping the variant token
 * (or renaming it) would silently regress those rules without any
 * visual or behavioural test catching it.
 *
 * Sibling W1579 (LobbyTileTitleTag) pins the `tile-title` element's
 * `tagName` as `DIV`, but does NOT assert on its className tokens.
 * Other Lobby tests use `.lobby-tile-title` as a *query selector*
 * (LobbyPage.test.tsx W742, LobbySearchWhitespace.test.tsx) — using
 * the class to *find* an element is not the same as pinning that
 * the lobby title element actually carries that token. Grepping
 * `Lobby*.test.tsx` for `tile-title.*classList|tile-title.*contains`
 * returns zero matches. This test pins the orthogonal className
 * token contract, distinct from W1579's tagName pin.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the
 * same convention used by W1579/W1567/W1546/W1389/W1461/W1473.
 */
describe("LobbyPage — solo-card tile-title lobby variant className (W1590)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile's title with both `tile-title` and `lobby-tile-title` class tokens", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — search input is the canonical
    // "lobby is ready" anchor used by sibling tile tests.
    await screen.findByPlaceholderText(/search/i);

    const tiles = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-"]',
    );
    expect(tiles.length).toBeGreaterThan(0);

    let checked = 0;
    for (const tile of Array.from(tiles)) {
      const testid = tile.getAttribute("data-testid") ?? "";
      if (!/^tile-/.test(testid)) continue;
      // Skip nested tile chrome that shares the `tile-` prefix.
      if (/^tile-(rating|eta|fav|drag|badge|tooltip|difficulty|plays)-/.test(testid)) continue;

      const title = tile.querySelector<HTMLElement>(":scope > .tile-title");
      if (title === null) continue; // skeleton tiles have no inner direct child

      // The contract: the tile title element carries BOTH the
      // generic `tile-title` token AND the lobby-scoped variant
      // `lobby-tile-title` token. Both are required — dropping
      // either one would break a different layer of CSS rules.
      expect(title.classList.contains("tile-title")).toBe(true);
      expect(title.classList.contains("lobby-tile-title")).toBe(true);
      checked += 1;
    }

    // Sanity: at least one real tile title was inspected so the
    // suite cannot pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
