import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2321 — pin that LobbyPage tile anchors do NOT carry an HTML
 * `draggable` attribute under the default ("all") filter. The lobby
 * implements drag-reorder of favorite tiles by stamping
 * `draggable="true"` and `data-fav-drag-id` onto every visible tile
 * via a `useEffect` (LobbyPage.tsx ~L1558) — but ONLY while
 * `filter === "favorites"`. Every other filter MUST keep `draggable`
 * unset so a stray drag never reshuffles the All grid (or any other
 * non-favorites view) and so the tile anchors retain the browser's
 * default link drag semantics (drag-the-href-to-bookmark-bar etc.).
 *
 * The tile anchor itself (LobbyPage.tsx ~L2970, the `<Link>` carrying
 * the `tile tile--cat-...` className and `data-testid="tile-${g.id}"`)
 * does NOT set a `draggable` prop in JSX, so under default state the
 * rendered `<a>` element should expose `getAttribute("draggable") ===
 * null`. A regression that hard-coded `draggable={false}` (or `"true"`)
 * directly on the `<Link>` JSX would silently change link drag
 * semantics across the entire lobby, while still satisfying the
 * favorites-filter `draggable === "true"` stamp test (the DOM-level
 * `setAttribute` overrides the JSX attribute).
 *
 * Existing coverage gap audit:
 *   - LobbyPage.test.tsx ~L653 ("stamps draggable=true on tiles only
 *     while the favorites filter is active") asserts `draggable ===
 *     "true"` on `.tile[data-fav-drag-id]` elements ONLY while the
 *     favorites filter is active. Its negative assertion after
 *     flipping back to "all" checks for the absence of the
 *     `data-fav-drag-id` STAMP via `favTiles().length === 0` — it
 *     never directly inspects `getAttribute("draggable")` on a default-
 *     state tile anchor, so a regression that introduced a hard-coded
 *     `draggable` JSX prop on the `<Link>` would leave that test
 *     passing (the attribute would be present at the JSX layer, and
 *     `data-fav-drag-id` would still be removed by the effect).
 *   - No `LobbyTile*.test.tsx` sibling references `draggable` at all
 *     (verified by grepping `web/src/pages/Lobby*.test.tsx` for
 *     `draggable`).
 *   - The default ("all") filter's tile-anchor draggable absence is
 *     therefore an UNTESTED behavior — this test fills that gap.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the rest of the `Lobby*.test.tsx` corpus: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile anchor has no `draggable` attribute under default filter (W2321)", () => {
  it("renders every default-state tile anchor without an HTML `draggable` attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // "Lobby is mounted" anchor used by sibling tests — the search
    // box is part of the persistent header and resolves before any
    // grid hydration / async work.
    await screen.findByPlaceholderText(/search/i);

    // The default lobby filter is "all" (the favorites filter only
    // engages when `cards-lobby-filter` was previously persisted to
    // "favorites" or the user has clicked the favorites chip).
    // Without any localStorage seeding the lobby mounts in the
    // non-favorites state, so the favorite-drag effect leaves every
    // tile WITHOUT a `draggable` attribute.
    //
    // We audit the standalone-grid tile-anchor flavor (`tile-${g.id}`
    // testid) — the load-bearing anchor for navigation. We resolve
    // by exact testid prefix and filter to anchors only (children
    // that share the `tile-` prefix — `tile-rating-*`,
    // `tile-fav-marker-*`, `tile-drag-handle-*`, `tile-badge-*`,
    // `tile-plays-*`, `tile-fav-toggle-*`, `tile-meta-chips-*` —
    // are not anchors and are skipped). This mirrors the
    // anchor-filtering pattern used by sibling W1886 / W1871.
    const nodes = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-"]',
    );

    let anchorChecked = 0;
    for (const node of Array.from(nodes)) {
      if (node.tagName !== "A") continue;

      // Primary contract: no `draggable` attribute at all on the
      // tile anchor under default filter state.
      expect(node.hasAttribute("draggable")).toBe(false);
      // Defensive secondary assertion: even if a regression sets
      // `draggable=""` (empty string) or `draggable="false"`, the
      // attribute would still be present and the assertion above
      // would fail. Pinning `getAttribute("draggable")` to `null`
      // makes the failure message diagnostically explicit about the
      // attribute's absence vs. presence-with-falsy-value.
      expect(node.getAttribute("draggable")).toBeNull();
      anchorChecked += 1;
    }

    // Sanity floor: the standalone grid is always populated with the
    // full registry under default state, so this loop MUST inspect
    // at least one anchor — guards against a silent testid rename /
    // prefix change that would zero the loop above without
    // surfacing a draggable-attribute regression.
    expect(anchorChecked).toBeGreaterThan(0);
  });
});
