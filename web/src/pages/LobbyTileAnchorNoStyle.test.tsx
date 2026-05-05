import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2168 — pin that LobbyPage standalone tile anchors do NOT carry an
 * inline `style` attribute. Standalone game tiles render as
 * `<Link to={`/play/${g.id}`} className={...} data-testid={`tile-${g.id}`} ...>`
 * (LobbyPage.tsx ~L2970–L2987). Visual presentation is delegated entirely
 * to the `tile`, `tile--cat-<tag>`, and `tile--pressed` className tokens
 * resolved against the stylesheet — there is NO `style={...}` prop on
 * the JSX, and react-router's `<Link>` does not synthesize one.
 *
 * An accidental `style={...}` (or any computed inline style) would:
 *   - Override stylesheet-driven theming (light/dark, responsive
 *     breakpoints, hover/pressed transitions) at the highest CSS
 *     specificity tier (inline beats class), silently breaking visual
 *     consistency across surfaces.
 *   - Force a render-time recompute of style strings, defeating the
 *     class-only fast-path the lobby grid relies on for scroll
 *     performance with the full registry.
 *   - Bypass the `tile--cat-<tag>` category-color contract that sibling
 *     tile-chrome tests depend on (LobbyTileStripeNoStyle, LobbyTileSheen-
 *     NoStyle, LobbyTileCatNoStyle, LobbyTileFootNoStyle, LobbyTileMeta-
 *     NoStyle, etc. all pin `style` absence on tile sub-elements; this
 *     test fills the gap at the anchor root itself).
 *
 * Existing-coverage audit (web/src/pages/Lobby*.test.tsx):
 *   - LobbyTileCatNoStyle / LobbyTileCatGlyphNoStyle / LobbyTileChips-
 *     NoStyle / LobbyTileDifficultyNoStyle / LobbyTileEtaNoStyle /
 *     LobbyTileFootNoStyle / LobbyTileMetaNoStyle / LobbyTileSheenNoStyle
 *     / LobbyTileStripeNoStyle each pin `hasAttribute("style") === false`
 *     on tile sub-elements (cat chip, glyph, chips wrap, difficulty
 *     chip, eta chip, foot row, meta row, sheen, stripe) — none target
 *     the tile anchor root itself.
 *   - LobbyTileAnchor* sibling tests (Tag, NoId, RelAbsent, TargetAbsent)
 *     pin tagName / id / rel / target on the anchor but do NOT inspect
 *     the `style` attribute.
 *   - LobbyTileRatingWrapStyle pins the rating widget's style absence,
 *     not the surrounding tile anchor's.
 *
 * No existing Lobby test asserts the absence of `style` on tile
 * anchors, so a regression that introduces `style={{...}}` on the tile
 * `<Link>` would slip through silently.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the rest of the `Lobby*.test.tsx` corpus: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — standalone tile anchor has no `style` attribute (W2168)", () => {
  it("renders standalone tile Links without an inline `style` attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // "Lobby is mounted" anchor used by sibling tests — search box is
    // part of the persistent header and resolves before any grid
    // hydration, so the standalone tile anchors are guaranteed mounted
    // by the time this resolves.
    await screen.findByPlaceholderText(/search/i);

    // Standalone game-tile anchors only — `[data-testid^="tile-"]`
    // intentionally captures the standalone grid surface. Recommended
    // (`rec-tile-`) and featured (`feat-tile-`) flavors live in their
    // own surfaces and are out of scope for this pin (sibling tests
    // can extend coverage there if/when needed).
    const nodes = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-"]',
    );

    let anchorChecked = 0;
    for (const node of Array.from(nodes)) {
      // Only audit the anchor renderings — `Link` becomes an `<a>` in
      // the DOM. Skip non-anchor children that share a `tile-*` testid
      // prefix (e.g. `tile-rating-*`, `tile-fav-marker-*`,
      // `tile-drag-handle-*`, `tile-tooltip-*`, family-aggregate
      // buttons, etc).
      if (node.tagName !== "A") continue;

      // Primary contract: no `style` attribute at all. `hasAttribute`
      // is the strictest check — it returns true even for `style=""`
      // (empty string), which JSX would emit if a regression passed
      // `style={{}}` through some pathways. Inspecting `node.style`
      // directly would NOT catch that case because the CSSStyleDecl
      // object exists on every HTMLElement regardless of attribute
      // presence.
      expect(node.hasAttribute("style")).toBe(false);
      anchorChecked += 1;
    }

    // Sanity: ensure the suite actually inspected at least one anchor —
    // guards against a regression that renames the testid prefix and
    // silently zeroes the loop above. The standalone grid is always
    // populated with the full registry under default lobby state, so
    // this floor is robust.
    expect(anchorChecked).toBeGreaterThan(0);
  });
});
