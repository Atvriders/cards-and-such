import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1602 — pin that every solo-card `tile-title` element on the lobby
 * grid renders a *non-empty* visible text node. `GameCard`
 * (LobbyPage.tsx ~L3012) renders:
 *
 *   <div className="tile-title lobby-tile-title">{g.title}</div>
 *
 * (modulo optional `tile-fav-marker` / `tile-plays` decorations and
 * the `<mark>` highlight wrapper). The `g.title` text node is the
 * primary, screen-readable identifier of the tile — it is what users
 * read to decide whether to click, what screen-reader users hear
 * after the tile's `aria-label` summary, and what the search-filter
 * substring matches against. A regression that accidentally rendered
 * the title element with NO inner text (e.g. swapping `{g.title}` for
 * an unresolved Promise, an empty Suspense fallback, or stripping the
 * text in an i18n migration that lost a key) would leave every tile
 * looking blank yet still pass W1579 (tagName=DIV) and W1590
 * (classList contains `lobby-tile-title`) trivially.
 *
 * Sibling W1579 (LobbyTileTitleTag) pins the element's `tagName` as
 * `DIV`, and sibling W1590 (LobbyTileTitleLobbyClass) pins both
 * className tokens. Neither asserts on the title's text content.
 * Grepping `Lobby*.test.tsx` for `tile-title.*textContent` returns
 * zero matches. This test pins the orthogonal "title element has
 * visible text" contract, distinct from the tag- and class-name pins.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * convention used by W1579/W1590/W1567/W1546.
 */
describe("LobbyPage — solo-card tile-title visible text (W1602)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile's title with non-empty textContent", async () => {
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

      // The contract: the rendered title element has a non-empty
      // visible text node. Trimming guards against a regression that
      // accidentally emitted only whitespace (e.g. `{" "}` or
      // `{title ?? ""}` for a missing key).
      const text = (title.textContent ?? "").trim();
      expect(text.length).toBeGreaterThan(0);
      checked += 1;
    }

    // Sanity: at least one real tile title was inspected so the
    // suite cannot pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
