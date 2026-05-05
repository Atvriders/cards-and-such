import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2039 — pin that LobbyPage standalone tile anchors do NOT carry an
 * HTML `id` attribute. Standalone game tiles render as
 * `<Link to={`/play/${g.id}`} data-testid={`tile-${g.id}`} ...>`
 * (LobbyPage.tsx ~L2970–L2987). Identity is communicated via
 * `data-testid` and the `href` route, NOT via a globally-scoped `id`.
 *
 * An accidental `id={`tile-${g.id}`}` (or any other id) would:
 *   - Pollute the global `document.getElementById` namespace and risk
 *     collisions with sibling testids that already use `tile-` prefixes
 *     (e.g. `tile-tooltip-${tileId}` at ~L518 stamps an explicit `id`,
 *     and an id-bearing tile anchor would clash).
 *   - Create an in-page anchor target (`#tile-…`) that fragment links
 *     could scroll to, changing user-visible navigation behavior.
 *   - Break the contract that tiles are addressed only by testid /
 *     route, which sibling tests (LobbyTileAnchorTag,
 *     LobbyTileAnchorRelAbsent, LobbyTileAnchorTargetAbsent) rely on.
 *
 * No existing Lobby test asserts the absence of `id` on tile anchors,
 * so a regression that wires one up would slip through silently.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the rest of the `Lobby*.test.tsx` corpus: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — standalone tile anchor has no `id` attribute (W2039)", () => {
  it("renders standalone tile Links without an HTML `id` attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // "Lobby is mounted" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Standalone game-tile anchors only — `[data-testid^="tile-"]`
    // intentionally captures the standalone grid surface. Recommended
    // (`rec-tile-`) and featured (`feat-tile-`) flavors live in their
    // own surfaces and are out of scope for this pin.
    const nodes = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-"]',
    );

    let anchorChecked = 0;
    for (const node of Array.from(nodes)) {
      // Only audit the anchor renderings — `Link` becomes an `<a>` in
      // the DOM. Skip non-anchor children that share a `tile-*` testid
      // prefix (e.g. `tile-rating-*`, `tile-fav-marker-*`,
      // `tile-drag-handle-*`, `tile-tooltip-*` which DOES carry an id
      // by design but is not an `<a>`).
      if (node.tagName !== "A") continue;

      // Primary contract: no `id` attribute at all.
      expect(node.hasAttribute("id")).toBe(false);
      // Defensive secondary assertion: even if a regression sets
      // id="" (empty string), the attribute would still be present
      // and the assertion above would fail. Keep this for diagnostic
      // clarity in the failure message.
      expect(node.getAttribute("id")).toBeNull();
      anchorChecked += 1;
    }

    // Sanity: ensure the suite actually inspected at least one anchor —
    // guards against a regression that renames the testid prefix and
    // silently zeroes the loop above.
    expect(anchorChecked).toBeGreaterThan(0);
  });
});
