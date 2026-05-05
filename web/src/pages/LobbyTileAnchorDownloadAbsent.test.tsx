import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2410 — pin that LobbyPage tile anchors do NOT carry an HTML `download`
 * attribute. Tile anchors are internal SPA `<Link to={`/play/${g.id}`}>`
 * navigations (LobbyPage.tsx ~L2048, ~L2970, ~L3431) — they route to the
 * play view, they do not initiate a file download. A `download` attribute
 * on an internal route would instruct the browser to save the SPA's HTML
 * response as a file rather than navigate, silently breaking every tile
 * activation while leaving every existing tile assertion (className,
 * aria-label, aria-haspopup, aria-expanded, tagName === "A", href,
 * target/rel/role/id/style/draggable absence) trivially satisfied.
 *
 * Existing coverage:
 *   - LobbyTileAnchorTag pins tagName === "A" + href === "/play/<id>".
 *   - LobbyTileAnchorRelAbsent / LobbyTileAnchorTargetAbsent pin
 *     `rel`/`target` absence.
 *   - LobbyTileAnchorNoRole / LobbyTileAnchorNoId / LobbyTileAnchorNoStyle
 *     / LobbyTileAnchorDraggable pin role/id/style/draggable absence.
 *   - LobbyTileAnchorAriaLabel pins the rich aria-label string.
 *
 * Grepping `web/src/pages/Lobby*.test.tsx` for
 * `hasAttribute("download")` / `getAttribute("download")` returns
 * nothing — the `download` attribute axis is wholly unaudited on tile
 * anchors. This test fills that gap, mirroring the sibling
 * AnchorRelAbsent / AnchorTargetAbsent structure.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the rest of the `Lobby*.test.tsx` corpus: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — tile anchor has no `download` attribute (W2410)", () => {
  it("renders every tile Link without an HTML `download` attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // "Lobby is mounted" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Cover all three tile flavors: regular grid, recommended, featured.
    const selectors = [
      '[data-testid^="tile-"]',
      '[data-testid^="rec-tile-"]',
      '[data-testid^="feat-tile-"]',
    ];

    let anchorChecked = 0;
    for (const sel of selectors) {
      const nodes = document.querySelectorAll<HTMLElement>(sel);
      for (const node of Array.from(nodes)) {
        // Only audit the anchor renderings — `Link` becomes an `<a>` in
        // the DOM. Skip non-anchor children that share a `tile-*` testid
        // prefix (e.g. `tile-rating-*`, `tile-fav-marker-*`,
        // `tile-drag-handle-*`) and the family-aggregate `<button>` tiles
        // (which legitimately render as buttons, not anchors).
        if (node.tagName !== "A") continue;

        // Primary contract: no `download` attribute at all.
        expect(node.hasAttribute("download")).toBe(false);
        // Defensive secondary assertion: even if a regression sets
        // download="" (empty string is a valid `download` per HTML spec —
        // it tells the browser to use the resource's filename), the
        // attribute would still be present and the assertion above would
        // fail. Keep this getAttribute pin for diagnostic clarity in the
        // failure message.
        expect(node.getAttribute("download")).toBeNull();
        anchorChecked += 1;
      }
    }

    // Sanity: ensure the suite actually inspected at least one anchor —
    // guards against a regression that renames the testid prefix and
    // silently zeroes the loop above.
    expect(anchorChecked).toBeGreaterThan(0);
  });
});
