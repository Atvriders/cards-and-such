import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2558 — the `chip-solitaire` button (the per-category solitaire chip
 * in the lobby chip-strip, rendered through the shared `Chip` helper at
 * LobbyPage.tsx) declares `role="tab"` so that it composes correctly
 * with the parent `role="tablist"` chip-strip and is announced by
 * assistive technology as a tab inside that tablist (per the WAI-ARIA
 * Authoring Practices for the Tabs pattern). A regression that drops
 * the role — e.g. a refactor that converts the solitaire chip into a
 * plain <button> popover trigger or that special-cases the solitaire
 * category in its own JSX branch — would silently break the
 * tablist/tab semantics without altering the visual markup, leaving
 * the chip announced as a generic button and confusing screen-reader
 * users navigating the filter strip.
 *
 * Why this needs its OWN per-chip pin:
 *  - The shared `Chip` helper assigns `role="tab"` to ALL chips today,
 *    but no existing test reads `getAttribute("role")` on the
 *    `chip-solitaire` button specifically. Sibling files such as
 *    LobbyChipSolitaireAriaSelectedDefault.test.tsx,
 *    LobbyChipSolitaireGlyphAria.test.tsx,
 *    LobbyChipSolitaireType.test.tsx,
 *    LobbyChipSolitaireNoId.test.tsx and
 *    LobbyChipSolitaireNoStyle.test.tsx all fetch the chip via
 *    `data-testid="chip-solitaire"` but each pins a different
 *    attribute. LobbySolitaireChipBadge.test.tsx pins the count
 *    badge. None reads the per-tab role.
 *  - LobbyChipStripAria.test.tsx and LobbyChipStripChildCount.test.tsx
 *    pin `role="tablist"` on the parent strip but never read the
 *    per-tab role on the solitaire chip itself. A future refactor
 *    that keeps the strip's tablist role but drops the per-tab role
 *    on a single chip would slip past those parent-level pins.
 *  - LobbyChipCardsRole.test.tsx (W2542) pins `role="tab"` on the
 *    sibling `chip-cards` button using the same per-chip pattern;
 *    this file applies the same pin to `chip-solitaire`.
 *
 * We resolve the chip via its stable `data-testid="chip-solitaire"`
 * (the testId wired at LobbyPage.tsx via `testId={`chip-${cat}`}`) so
 * the lookup is locale-independent and immune to translation-key
 * changes. The assertion uses `getAttribute("role")` to read the
 * literal markup attribute — confirming the exact string `"tab"`
 * rather than a truthiness check that would pass for any role value.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx
 * or extending an existing chip-solitaire test) mirrors the W2542
 * (chip-cards role) per-chip-attribute pattern so this shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to either mega-file.
 */
describe("LobbyPage — chip-solitaire role attribute (W2558)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders chip-solitaire with role=\"tab\" so it composes with the tablist chip-strip", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-solitaire") as HTMLButtonElement;

    // Raw attribute check — `getAttribute` returns the literal markup
    // value, so a regression that drops the prop (or substitutes a
    // different role like "button") fails here with a clear diff
    // rather than silently degrading the tablist/tab pairing.
    expect(chip.getAttribute("role")).toBe("tab");
  });
});
