import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2218 — pin that LobbyPage standalone tile anchors do NOT carry an
 * explicit `role` attribute. Standalone game tiles render as
 * `<Link to={`/play/${g.id}`} className={...} data-testid={`tile-${g.id}`} ...>`
 * (LobbyPage.tsx ~L2970–L2987). The JSX never sets a `role` prop, and
 * react-router's `<Link>` itself renders a plain `<a>` with no synthesized
 * `role` attribute either. The native `<a href>` element already has the
 * implicit `link` role per the HTML AAM, so an explicit `role="link"`
 * would be redundant and an explicit non-`link` role would be a regression
 * (e.g. `role="button"` on an anchor breaks middle-click open-in-new-tab,
 * "copy link address", screen-reader link list navigation, etc.).
 *
 * Why pin attribute ABSENCE rather than `getAttribute("role") === null`?
 * `hasAttribute("role")` returns true even for `role=""` (empty string),
 * which JSX emits if a regression passes `role={undefined ?? ""}` or a
 * computed role that resolved to falsy through some code path. The
 * stricter `hasAttribute` form catches that without relying on the exact
 * attribute value.
 *
 * Existing-coverage audit (web/src/pages/Lobby*.test.tsx):
 *   - LobbyTileAnchorTag pins `tagName === "A"` (and explicitly notes in
 *     comments that it deliberately does NOT pre-filter by `role="link"`),
 *     but never inspects the `role` attribute itself.
 *   - LobbyTileAnchorNoId / LobbyTileAnchorNoStyle / LobbyTileAnchorRel-
 *     Absent / LobbyTileAnchorTargetAbsent pin id / style / rel / target
 *     absence on the tile anchor — none cover `role`.
 *   - LobbyTileCatNoRole / LobbyTileChipsNoRole / LobbyTileDifficultyNo-
 *     Role / LobbyTileEtaNoRole / LobbyTileFootNoRole / LobbyTileSheenNo-
 *     Role / LobbyTileStripeNoRole pin `role` absence on tile SUB-elements
 *     (cat chip, chips wrap, difficulty chip, eta chip, foot row, sheen,
 *     stripe) — none target the tile anchor root itself.
 *   - LobbyDrawerAsideNoRole pins role absence on the drawer aside, not
 *     a lobby tile.
 *   - LobbyPage.test.tsx mega-file does not assert `role` (presence or
 *     absence) on any `tile-${gameId}` anchor.
 *
 * No existing Lobby test asserts the absence of `role` on tile anchors,
 * so a regression that introduces `role="..."` on the tile `<Link>` —
 * for instance, an over-eager accessibility fix that adds `role="button"`
 * because the anchor also has `aria-haspopup="menu"` — would slip through
 * silently.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the rest of the `Lobby*.test.tsx` corpus: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — standalone tile anchor has no `role` attribute (W2218)", () => {
  it("renders standalone tile Links without an explicit `role` attribute", async () => {
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
    // own surfaces and are out of scope for this pin.
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

      // Primary contract: no `role` attribute at all. `hasAttribute`
      // is the strictest check — it returns true even for `role=""`
      // (empty string), which JSX would emit if a regression passed
      // `role={someFalsyComputed ?? ""}` through some code path.
      expect(node.hasAttribute("role")).toBe(false);
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
