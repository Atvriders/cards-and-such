import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2560 — the `chip-top-rated` button (the "top rated" filter chip in
 * the lobby chip-strip, rendered through the shared `Chip` helper at
 * LobbyPage.tsx) declares `role="tab"` so that it composes correctly
 * with the parent `role="tablist"` chip-strip and is announced by
 * assistive technology as a tab inside that tablist (per the WAI-ARIA
 * Authoring Practices for the Tabs pattern). A regression that drops
 * the role — e.g. a refactor that converts the top-rated chip into a
 * plain <button> popover trigger or that special-cases the top-rated
 * filter in its own JSX branch (because it is the first
 * curated/sortable filter and a tempting candidate for ad-hoc markup) —
 * would silently break the tablist/tab semantics without altering the
 * visual markup, leaving the chip announced as a generic button and
 * confusing screen-reader users navigating the filter strip.
 *
 * Why this needs its OWN per-chip pin:
 *  - The shared `Chip` helper assigns `role="tab"` to ALL chips today,
 *    but no existing test reads `getAttribute("role")` on the
 *    `chip-top-rated` button specifically. Sibling files such as
 *    LobbyChipTopRatedType.test.tsx,
 *    LobbyChipTopRatedGlyphAria.test.tsx,
 *    LobbyChipTopRatedNoId.test.tsx and
 *    LobbyChipTopRatedNoStyle.test.tsx all fetch the chip via
 *    `data-testid="chip-top-rated"` but each pins a different
 *    attribute, leaving the per-tab role unverified for this chip.
 *  - LobbyChipStripAria.test.tsx and LobbyChipStripChildCount.test.tsx
 *    pin `role="tablist"` on the parent strip but never read the
 *    per-tab role on the top-rated chip itself. A future refactor that
 *    keeps the strip's tablist role but drops the per-tab role on a
 *    single chip would slip past those parent-level pins.
 *  - LobbyChipCardsRole.test.tsx (W2542) and LobbyChipDiceRole.test.tsx
 *    pin the role on sibling category chips but neither targets
 *    `chip-top-rated`, so a special-case branch for the top-rated chip
 *    would not be caught by those existing per-chip role pins.
 *
 * We resolve the chip via its stable `data-testid="chip-top-rated"`
 * (the testId wired at LobbyPage.tsx via `testId="chip-top-rated"`) so
 * the lookup is locale-independent and immune to translation-key
 * changes. The assertion uses `getAttribute("role")` to read the
 * literal markup attribute — confirming the exact string `"tab"`
 * rather than a truthiness check that would pass for any role value.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx
 * or extending an existing chip-top-rated test) mirrors the W2542
 * (chip-cards role) per-chip-attribute pattern so this shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to either mega-file.
 */
describe("LobbyPage — chip-top-rated role attribute (W2560)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders chip-top-rated with role=\"tab\" so it composes with the tablist chip-strip", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-top-rated") as HTMLButtonElement;

    // Raw attribute check — `getAttribute` returns the literal markup
    // value, so a regression that drops the prop (or substitutes a
    // different role like "button") fails here with a clear diff
    // rather than silently degrading the tablist/tab pairing.
    expect(chip.getAttribute("role")).toBe("tab");
  });
});
