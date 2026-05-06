import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2561 — the `chip-recently-played` button (the "recently played" chip
 * in the lobby chip-strip, rendered through the shared `Chip` helper at
 * LobbyPage.tsx) declares `role="tab"` so that it composes correctly
 * with the parent `role="tablist"` chip-strip and is announced by
 * assistive technology as a tab inside that tablist (per the WAI-ARIA
 * Authoring Practices for the Tabs pattern). A regression that drops
 * the role — e.g. a refactor that special-cases the recently-played
 * chip into its own JSX branch as a plain <button> popover trigger, or
 * that swaps the role to "button" because of misplaced "this is just a
 * filter pill" reasoning — would silently break the tablist/tab
 * semantics without altering the visual markup, leaving the chip
 * announced as a generic button and confusing screen-reader users
 * navigating the filter strip.
 *
 * Why this needs its OWN per-chip pin:
 *  - The shared `Chip` helper assigns `role="tab"` to ALL chips today,
 *    but no existing test reads `getAttribute("role")` on the
 *    `chip-recently-played` button specifically. Sibling files such as
 *    LobbyChipRecentlyPlayedType.test.tsx (W2464),
 *    LobbyChipRecentlyPlayedNoId.test.tsx (W2485),
 *    LobbyChipRecentlyPlayedNoStyle.test.tsx (W2536),
 *    LobbyChipRecentGlyphAria.test.tsx (W1462) and
 *    LobbyRecentlyPlayedChipBadgeZero.test.tsx all fetch the chip via
 *    `data-testid="chip-recently-played"` but each pins a different
 *    attribute (type, id-absence, style-absence, glyph aria-hidden,
 *    badge count) — none reads the role.
 *  - LobbyChipStripAria.test.tsx and LobbyChipStripChildCount.test.tsx
 *    pin `role="tablist"` on the parent strip but never read the
 *    per-tab role on the recently-played chip itself. A future refactor
 *    that keeps the strip's tablist role but drops the per-tab role on
 *    a single chip would slip past those parent-level pins.
 *  - LobbyChipArcadeRole.test.tsx (W2557) and LobbyChipCardsRole.test.tsx
 *    (W2542) pin the equivalent role on the arcade and cards chips but
 *    do not cover the recently-played meta-filter chip; a regression
 *    that special-cased the recently-played chip alone (its filter is
 *    distinct from the per-category chips and already has bespoke
 *    badge / ordering wiring) would slip past those sibling pins.
 *
 * We resolve the chip via its stable `data-testid="chip-recently-played"`
 * (the testId wired at LobbyPage.tsx ~L1954) so the lookup is
 * locale-independent and immune to translation-key changes. The
 * assertion uses `getAttribute("role")` to read the literal markup
 * attribute — confirming the exact string `"tab"` rather than a
 * truthiness check that would pass for any role value.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx
 * or extending an existing chip-recently-played test) mirrors the
 * LobbyChipArcadeRole (W2557) / LobbyChipCardsRole (W2542)
 * per-chip-attribute pattern so this shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to either
 * mega-file.
 */
describe("LobbyPage — chip-recently-played role attribute (W2561)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders chip-recently-played with role=\"tab\" so it composes with the tablist chip-strip", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-recently-played") as HTMLButtonElement;

    // Raw attribute check — `getAttribute` returns the literal markup
    // value, so a regression that drops the prop (or substitutes a
    // different role like "button") fails here with a clear diff
    // rather than silently degrading the tablist/tab pairing.
    expect(chip.getAttribute("role")).toBe("tab");
  });
});
