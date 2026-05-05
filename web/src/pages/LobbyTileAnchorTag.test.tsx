import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";
import { GAMES } from "../games/registry.js";
import { FAMILIES, expandFamily } from "../games/families.js";

/**
 * W1911 — pin LobbyPage tile anchor `tagName === "A"` for every
 * `tile-<gameId>` (standalone, non-family game), `rec-tile-<id>`, and
 * `feat-tile-<id>` testid that the page stamps directly onto a `<Link>`.
 *
 * LobbyPage.tsx renders three flavors of game-tile ANCHOR, each as a
 * react-router `<Link to={`/play/${g.id}`}>`:
 *   - `data-testid={`tile-${g.id}`}`          (~L2970, standalone grid)
 *   - `data-testid={`rec-tile-${g.id}`}`      (~L2052, recommended row)
 *   - `data-testid={`feat-tile-${g.id}`}`     (~L3431, featured strip,
 *                                              non-family branch)
 *
 * Family aggregate tiles legitimately render as `<button>` (~L3215,
 * ~L3370) with `tile-${familyId}` / `tile-${familyId}` testids — they
 * are popover triggers, not navigations — so this test deliberately
 * EXCLUDES family ids from the `tile-*` audit. The contract under test
 * is: every standalone-game tile across all three flavors is a real
 * `<a>` anchor.
 *
 * Why this matters: `<Link>` rendering as `<a>` is what enables
 * middle-click open-in-new-tab, OS-level "copy link address",
 * screen-reader link list navigation, and the intrinsic Enter-to-
 * activate keyboard behavior. Swapping `<Link>` for a `<button>` or
 * `<div role="link">` would silently break ALL of the above without
 * breaking onClick navigation, so click-based sibling tests (e.g.
 * LobbyTileClick) would NOT catch it.
 *
 * Existing coverage gap audit:
 *   - LobbyPage.test.tsx ~L2075 asserts `tile.tagName === "A"` but ONLY
 *     for a single hard-coded `tile-2048`; it never inspects any
 *     `rec-tile-*` or `feat-tile-*` anchor, and never iterates the
 *     standalone-game set.
 *   - LobbyTileAnchorRelAbsent.test.tsx and LobbyTileAnchorTargetAbsent
 *     iterate the three prefix selectors but SKIP non-anchors via
 *     `if (node.tagName !== "A") continue` — they audit `rel`/`target`
 *     attributes, never assert that the anchor flavor is present at
 *     all.
 *   - LobbyTileRatingTag.test.tsx mentions tile.tagName === "A" only in
 *     a comment about HTML5 nesting rules, not as a runtime assertion.
 *
 * Grepping `web/src/pages/Lobby*.test.tsx` for `rec-tile.*tagName` or
 * `feat-tile.*tagName` returns nothing. This test fills that gap.
 *
 * The lookup deliberately does NOT pre-filter by `role="link"` /
 * `getAllByRole("link")` — it resolves elements purely by testid, so
 * a regression that swapped `<Link>` for a custom `<div role="link">`
 * (which would still satisfy role-based queries) is still caught here
 * because the underlying `tagName` would no longer be "A".
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the rest of the `Lobby*.test.tsx` corpus: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — tile anchor tagName === \"A\" (W1911)", () => {
  it("renders every standalone tile-<gameId>, rec-tile-<id>, and feat-tile-<id> as <a>", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // "Lobby is mounted" anchor used by sibling tests — the search box
    // is part of the persistent header, so this resolves before any
    // grid hydration or recommendation/featured async work.
    await screen.findByPlaceholderText(/search/i);

    // Build the set of family ids and family-member ids — the lobby
    // collapses any family-member game into a `tile-${familyId}` button
    // (popover trigger), and the family itself is also stamped with
    // `tile-${familyId}`. Both are buttons by contract, so we EXCLUDE
    // them from the `tile-*` anchor audit.
    const allIds = GAMES.filter((g) => g != null).map((g) => g.id);
    const familyIds = new Set(FAMILIES.map((f) => f.id));
    const familyMemberIds = new Set<string>();
    for (const fam of FAMILIES) {
      for (const id of expandFamily(fam, allIds)) familyMemberIds.add(id);
    }

    // 1) Standalone game-tile anchors: `tile-${g.id}` for every game
    //    that is NOT a family member (and therefore renders as a Link,
    //    not a family button). Resolve by EXACT testid — no prefix
    //    selector — so child testids that share `tile-` (rating /
    //    drag-handle / etc) cannot pollute the audit.
    let standaloneChecked = 0;
    for (const g of GAMES) {
      if (!g) continue;
      if (familyMemberIds.has(g.id)) continue;
      if (familyIds.has(g.id)) continue;
      const node = document.querySelector<HTMLElement>(
        `[data-testid="tile-${g.id}"]`,
      );
      if (!node) continue; // game off the visible page (paged / filtered)

      // Primary contract: the element resolved by this exact testid is
      // itself an anchor — NOT a wrapper div, NOT a button, NOT a
      // custom role="link". Asserted via tagName so the assertion is
      // independent of any ARIA / role-based query (which a regression
      // to `<div role="link">` would still satisfy).
      expect(node.tagName).toBe("A");
      // Defensive secondary assertion: a real `<a>` MUST carry an
      // `href` for built-in keyboard / middle-click semantics. A
      // regression that produced an `<a>` without `href` (e.g. by
      // dropping the `to=` prop) would render a non-interactive
      // anchor — still tagName "A" but functionally broken.
      expect(node.getAttribute("href")).toBe(`/play/${g.id}`);
      standaloneChecked += 1;
    }

    // 2) Recommended-row anchors: every `rec-tile-${id}` testid is
    //    stamped only on a `<Link>` (LobbyPage.tsx ~L2052) — there is
    //    no child element that shares this prefix — so an attribute
    //    prefix selector here is unambiguous.
    const recNodes = Array.from(
      document.querySelectorAll<HTMLElement>('[data-testid^="rec-tile-"]'),
    );
    for (const node of recNodes) {
      expect(node.tagName).toBe("A");
      expect(node.getAttribute("href")).toMatch(/^\/play\//);
    }

    // 3) Featured-strip anchors: every `feat-tile-${id}` testid is
    //    stamped only on a `<Link>` (LobbyPage.tsx ~L3434) — child
    //    elements use distinct prefixes (`feat-tile-badge-`,
    //    `feat-mp-badge-`), so we filter those out explicitly. Family
    //    aggregates in the featured strip use `tile-${familyId}`
    //    (NOT `feat-tile-`), so this audit is anchor-only by
    //    construction.
    const featNodes = Array.from(
      document.querySelectorAll<HTMLElement>('[data-testid^="feat-tile-"]'),
    ).filter((n) => {
      const id = n.getAttribute("data-testid") ?? "";
      return !id.startsWith("feat-tile-badge-");
    });
    for (const node of featNodes) {
      expect(node.tagName).toBe("A");
      expect(node.getAttribute("href")).toMatch(/^\/play\//);
    }

    // Sanity: the standalone grid MUST surface at least one game-tile
    // anchor under default lobby state — guards against a silent
    // testid rename / prefix change that would zero the standalone
    // loop above without surfacing a tagName mismatch. The standalone
    // grid is always populated with the full registry, so this floor
    // is robust.
    //
    // The recommended strip is gated on `recommendations.length > 0`
    // (mirroring the LobbyRecommended sibling tests' conditional
    // pattern) and the featured strip's FEATURED_IDS happen to be
    // entirely family ids (or absent from the registry) under default
    // state, so neither flavor is guaranteed to surface anchors here
    // — when they DO surface, the loops above pin them; when they
    // don't, the assertion is trivially satisfied. This is the same
    // skip-when-absent contract used by the sibling AnchorRel /
    // AnchorTarget tests, but inverted: those tests SKIP non-anchors
    // via `tagName !== "A" continue`; this test asserts anchor-ness
    // unconditionally for every non-skipped node.
    expect(standaloneChecked).toBeGreaterThan(0);
  });
});
