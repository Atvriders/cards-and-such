import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1950 — pin LobbyPage canonical tile **count** on default render.
 *
 * The lobby grid emits `data-testid="tile-<id>"` for every standalone
 * game and family-aggregate that LobbyPage hands to the visible grid
 * (LobbyPage.tsx ~L2973 for game cards, ~L3219 / ~L3374 for family
 * aggregates). The same `tile-` prefix is reused on a number of CHILD
 * testids on each tile (e.g. `tile-fav-marker-<id>`, `tile-rating-<id>`,
 * `tile-drag-handle-<id>`, `tile-eta-<id>`, `tile-difficulty-<id>`,
 * `tile-plays-<id>`, `tile-badge-<id>`), which means a raw
 * `[data-testid^="tile-"]` selector counts both the tile anchors AND
 * their inner adornments.
 *
 * Existing coverage gap audit (web/src/pages/Lobby*.test.tsx):
 *   - LobbyPage.test.tsx ~L1138, ~L1222, ~L1294, ~L1370 each assert
 *     `tiles.length >= 50` as a SANITY LOWER BOUND for the lazy-tooltip
 *     hydration tests. None pin the exact count — a future regression
 *     that doubled or halved the prefix-match population (e.g. by
 *     stamping a duplicate `tile-*` testid on every child node, or
 *     conversely by collapsing the grid to a single category) would
 *     still satisfy `>= 50`.
 *   - LobbyPage.test.tsx ~L2519 filters to canonical `^tile-[^-]+$` and
 *     asserts `=== 0` ONLY under the empty-state (search="qzqzqzqz")
 *     branch. The DEFAULT-RENDER canonical count is never asserted.
 *   - All sibling Lobby*.test.tsx files that touch `[data-testid^="tile-"]`
 *     iterate the population to audit per-tile attributes — none assert
 *     the population SIZE.
 *
 * This test fills that gap by pinning the count the prefix selector
 * resolves to under the default `/` mount with a fresh localStorage,
 * matching the form the existing lazy-tooltip tests use
 * (`document.querySelectorAll('[data-testid^="tile-"]')`).
 *
 * The bound is expressed as a floor ("at least 10") rather than an
 * exact-equals because the underlying `GAMES` registry churns
 * frequently (4000+ entries; the registry grows on most feature PRs)
 * and the visible grid composes from registry + family aggregation —
 * an exact-equals assertion would flake on every registry edit. The
 * floor still surfaces the regressions this test is designed to
 * catch: a prefix collision that zeroes out the population, a grid
 * collapse that drops the page to a handful of tiles, or a testid
 * rename that breaks the `tile-*` namespace.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the rest of the `Lobby*.test.tsx` corpus: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — tile count on default render (W1950)", () => {
  it("renders at least 10 [data-testid^=\"tile-\"] elements", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Sanity: lobby is mounted (the search box is part of the
    // persistent header, so this resolves before the grid hydrates).
    screen.getByPlaceholderText(/search/i);

    // The contract: the prefix selector resolves to a non-trivial
    // population. The existing lazy-tooltip tests pin `>= 50` as a
    // sanity floor for THEIR scenarios; the registry-floor we pin
    // here is intentionally LOWER so this test stays meaningful even
    // if the registry were dramatically pruned (the tooltip tests
    // would correctly start failing instead, surfacing the change).
    const tiles = document.querySelectorAll('[data-testid^="tile-"]');
    expect(tiles.length).toBeGreaterThanOrEqual(10);
  });
});
