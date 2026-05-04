import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1617 — pin that the `tile-title` element's parent is the
 * outer interactive tile node (carrying both the `tile` class
 * and the `data-testid="tile-<id>"` attribute). LobbyPage renders
 * solo cards via a `<Link>` (anchor) and family cards via a
 * `<button type="button">`, but in BOTH cases the tile-title div
 * sits as a direct child of the tile-itself node:
 *
 *   <Link className="tile ..." data-testid="tile-<id>"> | <button className="tile ..." data-testid="tile-<id>">
 *     ...
 *     <div className="tile-title lobby-tile-title">…</div>
 *     ...
 *
 * The parent identity matters: lobby CSS rules cascade through
 * `.tile > .tile-title` selectors for hover/focus state styling,
 * the pressed-state outline, and color inheritance from the tile
 * chrome. If the title were nested inside an intermediate wrapper
 * (e.g. `<div class="tile-body">`) those direct-child cascade
 * rules would silently break — none of which is caught by sibling
 * tests that only inspect the title element itself.
 *
 * Distinct from sibling pins:
 *   - W1579 (LobbyTileTitleTag) — title element's own tagName === DIV
 *   - W1590 (LobbyTileTitleLobbyClass) — title classList tokens
 *   - W1602 (LobbyTileTitleText) — title textContent non-empty
 *
 * No sibling test asserts on the *parent's* identity — grepping
 * `Lobby*.test.tsx` for `tile-title.*parentElement|tile-title.*parentNode`
 * returns zero matches. This test pins the orthogonal direct-child
 * structural contract.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the
 * same convention used by W1579/W1590/W1602.
 */
describe("LobbyPage — solo-card tile-title parent identity (W1617)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile's title as a direct child of the outer `.tile` node", async () => {
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

      // The contract: the title's direct parent is the tile node
      // itself (the element bearing the `tile` class AND the
      // matching `data-testid`). NOT an intermediate wrapper.
      const parent = title.parentElement;
      expect(parent).not.toBeNull();
      expect(parent!.classList.contains("tile")).toBe(true);
      expect(parent!.getAttribute("data-testid")).toBe(testid);
      checked += 1;
    }

    // Sanity: at least one real tile title was inspected so the
    // suite cannot pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
