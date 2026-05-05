import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2527 — the `chip-solitaire` button (the per-category solitaire chip
 * in the lobby chip-strip, rendered through the shared `Chip` helper at
 * LobbyPage.tsx) must default to `aria-selected="false"` on a cold
 * initial render.
 *
 * The chip-strip is rendered with `role="tablist"` and each chip is a
 * `role="tab"` button, so `aria-selected` is the WAI-ARIA-compliant
 * signal that screen readers (and any UA-level styling hooking into
 * the selected-tab pseudo-class) consume to announce the active tab.
 * On first paint the persisted filter falls back to `"all"` (no
 * localStorage entry under `cards-lobby-filter`), so the solitaire
 * chip — which is NOT the active category — must surface
 * `aria-selected="false"` to assistive tech.
 *
 * Why this needs its OWN per-chip pin:
 *  - The Chip helper currently emits BOTH `aria-selected={active}` AND
 *    `aria-pressed={active}`; a regression that drops `aria-selected`
 *    while preserving `aria-pressed` (e.g. someone trimming what they
 *    think is a redundant ARIA prop, not realising the parent is a
 *    tablist that REQUIRES `aria-selected` per the ARIA Authoring
 *    Practices) would slip past the existing `aria-pressed` pins —
 *    this pin catches that.
 *  - LobbyChipSolitaireGlyphAria, LobbyChipSolitaireNoId and
 *    LobbyChipSolitaireType all fetch the chip-solitaire button but
 *    each pins a different attribute (glyph aria-hidden, id absence,
 *    type="button") and none of them reads `aria-selected`.
 *  - LobbyChipArcadeAriaSelectedDefault (W2521) and
 *    LobbyChipBoardAriaSelectedDefault / LobbyChipCardsAriaSelectedDefault
 *    / LobbyChipDiceAriaSelectedDefault pin the SAME attribute on
 *    sibling chips, not on chip-solitaire itself.
 *  - LobbyChipStripAria (the chip-strip aria-label and role pin)
 *    asserts the parent tablist role but NOT the per-tab
 *    `aria-selected` state on any individual chip.
 *
 * We resolve the chip via its stable `data-testid="chip-solitaire"`
 * (the testId wired at LobbyPage.tsx via `testId={`chip-${cat}`}`) so
 * the lookup is locale-independent and immune to translation-key
 * changes. The assertion uses `getAttribute("aria-selected")` to read
 * the literal string attribute — not a JSX-coerced boolean — so the
 * pin captures the exact serialized value React emits when the chip
 * is inactive (`"false"`, not `null` or `"undefined"`). A regression
 * that drops the prop entirely (`getAttribute` → `null`), flips the
 * default to `"true"`, or accidentally inverts the JSX boolean fails
 * here.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx
 * or extending LobbyChipSolitaireType) mirrors the W2521 / W2509
 * per-chip-attribute pattern so this shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to
 * either mega-file.
 */
describe("LobbyPage — chip-solitaire default aria-selected (W2527)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders chip-solitaire with aria-selected=\"false\" on initial render (chip-all is active by default)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-solitaire") as HTMLButtonElement;

    // Raw attribute check — `getAttribute` returns null when the
    // attribute is omitted, so a regression that drops the prop OR
    // flips the default to "true" fails here. We assert the literal
    // string "false" rather than a coerced boolean to catch JSX
    // serialization regressions.
    expect(chip.getAttribute("aria-selected")).toBe("false");
  });
});
