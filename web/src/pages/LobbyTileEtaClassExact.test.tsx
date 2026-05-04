import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1642 — pin the EXACT `className` string on the lobby tile-eta chip
 * rendered by `TileMetaChips` (LobbyPage.tsx ~L2735):
 *
 *   <span
 *     className="tile-chip tile-chip-eta"
 *     data-testid={`tile-eta-${gameId}`}
 *     title={`Estimated playtime: ${eta.label}`}
 *   >
 *
 * Sibling W1550 (LobbyTileEtaClass) only asserts that BOTH tokens are
 * present via `classList.contains(...)` — a strict whole-token check
 * that, by design, is robust to additional tokens being appended. That
 * leaves the inverse property unpinned: a refactor that adds a stray
 * modifier (e.g. `"tile-chip tile-chip-eta tile-chip-eta--compact"` or
 * a stale state token like `"tile-chip tile-chip-eta is-loading"`)
 * would silently slip past every existing tile-eta assertion while
 * polluting the className with tokens the CSS contract knows nothing
 * about.
 *
 * The eta chip's className is intentionally a fixed two-token string —
 * the difficulty sibling carries dynamic suffixes (`tile-chip-diff-easy`
 * etc.) whereas the eta chip never varies its className across renders.
 * Pinning it via exact equality codifies that invariant: the eta chip
 * MUST be exactly `"tile-chip tile-chip-eta"`, no more and no less, in
 * that token order.
 *
 * Coverage map (all sibling files):
 *   W1244 LobbyTileEtaTitle       — `title` attribute value
 *   W1550 LobbyTileEtaClass       — `classList.contains` token check
 *   W1564 LobbyTileEtaLabelClass  — inner `.tile-chip-label` class
 *   W1609 LobbyTileEtaTag         — outer `tagName === "SPAN"`
 *   W1642 (this file)             — exact `className` equality
 *
 * Grepping `web/src/pages/Lobby*.test.tsx` for `\.className\).toBe` /
 * `\.className === ` against tile-eta returns zero hits, confirming
 * the exact-equality property has no executable assertion today.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1244/W1550/W1564/W1609: shares the `src/pages/Lobby`
 * vitest path filter without colliding with the mega-file.
 */
describe("LobbyPage — tile-eta chip exact className (W1642)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile-eta chip with className === 'tile-chip tile-chip-eta'", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    const etaChips = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-eta-"]',
    );
    expect(etaChips.length).toBeGreaterThan(0);

    // Strict equality, NOT classList.contains. This catches both
    // missing tokens (regressing W1550) AND extra tokens (which W1550
    // happily allows). Token order is also pinned: the JSX writes
    // "tile-chip" first, then "tile-chip-eta".
    for (const chip of Array.from(etaChips)) {
      expect(chip.className).toBe("tile-chip tile-chip-eta");
    }
  });
});
