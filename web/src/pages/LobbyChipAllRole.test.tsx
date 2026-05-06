import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2563 — the `chip-all` button (the lobby-strip chip that resets the
 * category filter to "all", rendered through the shared `Chip` helper
 * at LobbyPage.tsx ~L1935) declares `role="tab"` so that it composes
 * correctly with the parent `role="tablist"` chip-strip and is
 * announced by assistive technology as a tab inside that tablist (per
 * the WAI-ARIA Authoring Practices for the Tabs pattern). A regression
 * that drops the role — e.g. a refactor that special-cases the "all"
 * chip into its own JSX branch (perhaps to render it as a clear-filter
 * reset button rather than a category tab) — would silently break the
 * tablist/tab semantics without altering the visual markup, leaving
 * the chip announced as a generic button and confusing screen-reader
 * users navigating the filter strip.
 *
 * Why this needs its OWN per-chip pin:
 *  - The shared `Chip` helper assigns `role="tab"` to ALL chips today
 *    (LobbyPage.tsx ~L2655), but no existing test reads
 *    `getAttribute("role")` on the `chip-all` button specifically.
 *    Sibling files such as LobbyAllChipBadge.test.tsx (W1208),
 *    LobbyChipAllNoId.test.tsx (W2414), LobbyChipAllNoStyle.test.tsx,
 *    LobbyChipBadgeTag.test.tsx and LobbyChipType.test.tsx (W1258)
 *    all fetch the chip via `data-testid="chip-all"` but each pins a
 *    different attribute (badge count, no-id, no-style, badge tag,
 *    button type). LobbyPage.test.tsx assertions on `chip-all` cover
 *    `aria-pressed` and `aria-selected` state transitions but never
 *    the literal `role` markup attribute.
 *  - LobbyChipStripAria.test.tsx and LobbyChipStripChildCount.test.tsx
 *    pin `role="tablist"` on the parent strip but never read the
 *    per-tab role on the all-chip itself. A future refactor that
 *    keeps the strip's tablist role but drops the per-tab role on the
 *    "all" chip alone would slip past those parent-level pins.
 *  - LobbyChipArcadeRole.test.tsx (W2557) and LobbyChipCardsRole /
 *    LobbyChipBoardRole pins cover the equivalent role on per-category
 *    chips but do not cover the "all" reset chip; a regression that
 *    special-cased the all-chip alone (the most likely target for a
 *    "clear filter" UX rework) would slip past those sibling pins.
 *
 * We resolve the chip via its stable `data-testid="chip-all"` (the
 * testId hard-coded at LobbyPage.tsx ~L1935) so the lookup is
 * locale-independent and immune to translation-key changes. The
 * assertion uses `getAttribute("role")` to read the literal markup
 * attribute — confirming the exact string `"tab"` rather than a
 * truthiness check that would pass for any role value.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx
 * or extending an existing chip-all test) mirrors the
 * LobbyChipArcadeRole (W2557) per-chip-attribute pattern so this
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to either mega-file.
 */
describe("LobbyPage — chip-all role attribute (W2563)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders chip-all with role=\"tab\" so it composes with the tablist chip-strip", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-all") as HTMLButtonElement;

    // Raw attribute check — `getAttribute` returns the literal markup
    // value, so a regression that drops the prop (or substitutes a
    // different role like "button") fails here with a clear diff
    // rather than silently degrading the tablist/tab pairing.
    expect(chip.getAttribute("role")).toBe("tab");
  });
});
