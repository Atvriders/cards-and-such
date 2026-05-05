import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1871 — pin that LobbyPage tile anchors do NOT carry an HTML `target`
 * attribute, so navigation to `/play/<gameId>` stays in the current
 * tab/window via react-router's client-side routing.
 *
 * Each tile (regular `[data-testid^="tile-"]`, recommended
 * `[data-testid^="rec-tile-"]`, featured `[data-testid^="feat-tile-"]`)
 * is rendered as a `<Link to={`/play/${g.id}`}>` (LobbyPage.tsx ~L2048,
 * ~L2970, ~L3431). None pass a `target` prop, so the rendered anchor
 * MUST omit the attribute — preserving SPA navigation (no `_blank` popup,
 * no `_top` frame-bust, no opener leak).
 *
 * A regression that wired `target="_blank"` (e.g. while adding a
 * "share/preview in new tab" affordance) would silently bypass the
 * react-router history and break in-app routing without failing any
 * existing assertion. Sibling tests pin click semantics
 * (`LobbyTileClick.test.tsx`) and the wrap container
 * (`LobbyTileWrapClass.test.tsx`) but none audit the anchor's `target`.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the rest of the `Lobby*.test.tsx` corpus: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — tile anchor has no `target` attribute (W1871)", () => {
  it("renders every tile Link without an HTML `target` attribute", async () => {
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
        // `tile-drag-handle-*`).
        if (node.tagName !== "A") continue;

        // Whether the attribute is present at all — the contract is
        // "no target attribute", which is stricter than "target !== _blank".
        expect(node.hasAttribute("target")).toBe(false);
        // Defensive secondary assertion: even if a regression sets
        // target="" (empty string), the attribute would still be present
        // and the assertion above would fail. Keep this for diagnostic
        // clarity in the failure message.
        expect(node.getAttribute("target")).toBeNull();
        anchorChecked += 1;
      }
    }

    // Sanity: ensure the suite actually inspected at least one anchor —
    // guards against a regression that renames the testid prefix and
    // silently zeroes the loop above.
    expect(anchorChecked).toBeGreaterThan(0);
  });
});
