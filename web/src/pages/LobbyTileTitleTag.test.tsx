import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1579 — pin the `tile-title` element's tagName as `DIV` on every
 * solo-card tile. `GameCard` (LobbyPage.tsx ~L3012) renders:
 *
 *   <div className="tile-title lobby-tile-title">…</div>
 *
 * The tag matters: lobby CSS keys block-level layout (margins,
 * line-height, multi-line clamp, font-weight inheritance) off the
 * `<div>` element type. Swapping it to a `<span>` (inline) or an
 * `<h3>`/`<h4>` (default heading margin + outline semantics) would
 * silently regress tile title spacing across the lobby grid and
 * change the document outline.
 *
 * Sibling W1546 (LobbyTileDescClass) pins `.tile-desc` className,
 * W1567 (LobbyTileDescTag) pins `.tile-desc` tagName, and a sibling
 * test pins the `.lobby-tile-title` className indirectly via the
 * highlight-suppression test (W742 in LobbyPage.test.tsx). No
 * sibling test asserts on the underlying `.tile-title` tagName —
 * grepping `Lobby*.test.tsx` for `tile-title.*tagName` returns
 * zero matches. This test pins the orthogonal element-type contract.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the
 * same convention used by W1567/W1546/W1389/W1461/W1473.
 */
describe("LobbyPage — solo-card tile-title tagName (W1579)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile's title as a `DIV` element", async () => {
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

      // The contract: the title block is a block-level <div>, not
      // an inline <span> or a heading element with default margins
      // and outline-semantics implications.
      expect(title.tagName).toBe("DIV");
      checked += 1;
    }

    // Sanity: at least one real tile title was inspected so the
    // suite cannot pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
