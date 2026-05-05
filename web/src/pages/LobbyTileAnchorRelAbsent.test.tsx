import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1886 — pin that LobbyPage tile anchors do NOT carry an HTML `rel`
 * attribute. Tiles are internal SPA `<Link to={`/play/${g.id}`}>` calls
 * (LobbyPage.tsx ~L2048, ~L2970, ~L3431) without a `target`, so a `rel`
 * attribute (e.g. `rel="noopener noreferrer"`, `rel="external"`,
 * `rel="nofollow"`) would be both unnecessary and semantically wrong:
 *
 *   - `noopener`/`noreferrer` only matter alongside `target="_blank"`,
 *     which sibling test W1871 already pins as absent.
 *   - `external`/`nofollow` would mislead crawlers and assistive tech
 *     into treating an in-app route as an outbound link.
 *
 * A regression that wired `rel="noopener"` (e.g. while copy-pasting a
 * pattern from outbound-link components) would silently change the
 * anchor's relationship semantics without breaking navigation, so no
 * existing assertion would catch it. Sibling W1871 pins `target` absence
 * but explicitly does not audit `rel` — this test fills that gap.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the rest of the `Lobby*.test.tsx` corpus: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — tile anchor has no `rel` attribute (W1886)", () => {
  it("renders every tile Link without an HTML `rel` attribute", async () => {
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

        // Primary contract: no `rel` attribute at all.
        expect(node.hasAttribute("rel")).toBe(false);
        // Defensive secondary assertion: even if a regression sets
        // rel="" (empty string), the attribute would still be present
        // and the assertion above would fail. Keep this for diagnostic
        // clarity in the failure message.
        expect(node.getAttribute("rel")).toBeNull();
        anchorChecked += 1;
      }
    }

    // Sanity: ensure the suite actually inspected at least one anchor —
    // guards against a regression that renames the testid prefix and
    // silently zeroes the loop above.
    expect(anchorChecked).toBeGreaterThan(0);
  });
});
