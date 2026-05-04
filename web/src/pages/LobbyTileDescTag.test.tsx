import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1567 — pin the `tile-desc` element's tagName as `DIV` on every
 * solo-card tile. `GameCard` (LobbyPage.tsx ~L3037) renders:
 *
 *   <div className="tile-desc">{g.description}</div>
 *
 * The tag matters: lobby CSS keys block-level layout (margins,
 * padding, line-height, multi-line clamp) off the `<div>` element
 * type. Swapping it to a `<span>` (inline) or a `<p>` (default
 * margin block) would silently regress tile description spacing
 * and the multi-line clamp across the lobby grid.
 *
 * Sibling W1546 (LobbyTileDescClass) pins the `.tile-desc`
 * className. No sibling test asserts on the underlying tagName —
 * grepping `Lobby*.test.tsx` for `tile-desc` returns only the
 * W1546 className test. This test pins the orthogonal element-type
 * contract.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the
 * same convention used by W1546/W1389/W1461/W1473.
 */
describe("LobbyPage — solo-card tile-desc tagName (W1567)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile's description as a `DIV` element", async () => {
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

      const desc = tile.querySelector<HTMLElement>(":scope > .tile-desc");
      if (desc === null) continue; // skeleton tiles have no inner direct child

      // The contract: the description block is a block-level <div>,
      // not an inline <span> or default-margin <p>.
      expect(desc.tagName).toBe("DIV");
      checked += 1;
    }

    // Sanity: at least one real tile description was inspected so
    // the suite cannot pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
