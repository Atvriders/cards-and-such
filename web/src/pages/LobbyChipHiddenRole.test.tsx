import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2562 — the `chip-hidden` button (the per-category "Hidden" chip in
 * the lobby chip-strip, rendered through the shared `Chip` helper at
 * LobbyPage.tsx ~L1961 via `testId="chip-hidden"`) declares
 * `role="tab"` so that it composes correctly with the parent
 * `role="tablist"` chip-strip and is announced by assistive technology
 * as a tab inside that tablist (per the WAI-ARIA Authoring Practices
 * for the Tabs pattern). A regression that drops the role — e.g. a
 * refactor that special-cases the hidden category in its own JSX
 * branch (since chip-hidden has bespoke visibility rules around the
 * user's hidden-games list) and forgets to forward `role="tab"`, or a
 * change to the shared `Chip` helper that conditionally suppresses the
 * role — would silently break the tablist/tab pairing without
 * altering the visual markup, leaving the chip announced as a generic
 * button and confusing screen-reader users navigating the filter
 * strip.
 *
 * Why this needs its OWN per-chip pin:
 *  - The shared `Chip` helper assigns `role="tab"` to ALL chips today,
 *    but no existing test reads `getAttribute("role")` on the
 *    `chip-hidden` button specifically. Sibling files such as
 *    LobbyChipHiddenAriaPressedDefault.test.tsx (W2501),
 *    LobbyChipHiddenGlyphAria.test.tsx,
 *    LobbyChipHiddenType.test.tsx,
 *    LobbyChipHiddenNoId.test.tsx (W2466) and
 *    LobbyChipHiddenNoStyle.test.tsx all fetch the chip via
 *    `data-testid="chip-hidden"` but each pins a different attribute.
 *    LobbyChipHiddenAriaPressedDefault.test.tsx and
 *    LobbyChipHiddenNoId.test.tsx mention `role="tab"` only in their
 *    JSDoc preamble — neither asserts the attribute via
 *    `getAttribute`.
 *  - LobbyChipStripAria.test.tsx and LobbyChipStripChildCount.test.tsx
 *    pin `role="tablist"` on the parent strip but never read the
 *    per-tab role on the hidden chip itself. A future refactor that
 *    keeps the strip's tablist role but drops the per-tab role on a
 *    single chip would slip past those parent-level pins.
 *  - Sibling per-chip role pins exist for chip-cards (W2542),
 *    chip-arcade and chip-dice but not for chip-hidden — this fills
 *    the chip-hidden gap so the role contract is locked across every
 *    category chip independently.
 *
 * We resolve the chip via its stable `data-testid="chip-hidden"` (the
 * testId wired at LobbyPage.tsx ~L1961) so the lookup is
 * locale-independent and immune to translation-key changes. The
 * assertion uses `getAttribute("role")` to read the literal markup
 * attribute — confirming the exact string `"tab"` rather than a
 * truthiness check that would pass for any role value.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx
 * or extending an existing chip-hidden test) mirrors the W2542
 * (chip-cards role) per-chip-attribute pattern so this shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to either mega-file.
 */
describe("LobbyPage — chip-hidden role attribute (W2562)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders chip-hidden with role=\"tab\" so it composes with the tablist chip-strip", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-hidden") as HTMLButtonElement;

    // Raw attribute check — `getAttribute` returns the literal markup
    // value, so a regression that drops the prop (or substitutes a
    // different role like "button") fails here with a clear diff
    // rather than silently degrading the tablist/tab pairing.
    expect(chip.getAttribute("role")).toBe("tab");
  });
});
