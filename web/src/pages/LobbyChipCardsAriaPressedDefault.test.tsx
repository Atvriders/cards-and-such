import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2503 — the `chip-cards` button (the per-category cards chip in the
 * lobby chip-strip, rendered through the shared `Chip` helper at
 * LobbyPage.tsx ~L2651) must default to `aria-pressed="false"` on a
 * cold initial render. The default filter on first paint is `"all"`
 * (the chip-strip is keyed `active={filter === cat}` and the persisted
 * filter falls back to "all" when localStorage is empty), so the
 * cards chip — which is NOT the active category — must surface
 * `aria-pressed="false"` to assistive tech and any UA-level styling
 * that hooks into the pressed-state CSS pseudo-class.
 *
 * Why this needs its OWN per-chip pin:
 *  - LobbyPage.test.tsx W608 / W2415 pin the chip-all aria-pressed
 *    flip ("true" by default, "false" after another chip is
 *    selected), and W2415 area pins chip-solitaire's default of
 *    "false" (LobbyPage.test.tsx ~L2131). Neither test reads the
 *    `chip-cards` button on the same fresh render — a regression
 *    that drops `aria-pressed` from the cards chip alone (e.g. a
 *    refactor that special-cases the cards category to a popover
 *    trigger that forgets the prop) would NOT fail those pins.
 *  - LobbyChipCardsBadge (W1424), LobbyChipCardsGlyphAria (W1495),
 *    LobbyChipCardsNoId (W2469) and LobbyChipCardsType (W2489) all
 *    fetch the chip-cards button but each pins a different attribute
 *    (count text, glyph aria-hidden, id absence, type="button") and
 *    none of them reads `aria-pressed`.
 *  - LobbyChipAllChipBadge / LobbyChipAllNoId / LobbyChipAllNoStyle
 *    only constrain chip-all, not chip-cards.
 *
 * We resolve the chip via its stable `data-testid="chip-cards"` (the
 * testId wired at LobbyPage.tsx ~L1970 via `testId={`chip-${cat}`}`)
 * so the lookup is locale-independent and immune to translation-key
 * changes. The assertion uses `getAttribute("aria-pressed")` to read
 * the literal string attribute — not a JSX-coerced boolean — so the
 * pin captures the exact serialized value React emits when the chip
 * is inactive (`"false"`, not `null` or `"undefined"`). A regression
 * that drops the prop entirely (`getAttribute` → `null`), flips the
 * default to `"true"`, or accidentally inverts the JSX boolean fails
 * here.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx
 * or extending an existing chip-cards test) mirrors the W2489
 * (chip-cards type) and W2467 (chip-arcade type) per-chip-attribute
 * pattern so this shares the `src/pages/Lobby` vitest path filter
 * without colliding with concurrent edits to either mega-file.
 */
describe("LobbyPage — chip-cards default aria-pressed (W2503)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders chip-cards with aria-pressed=\"false\" on initial render (chip-all is active by default)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-cards") as HTMLButtonElement;

    // Raw attribute check — `getAttribute` returns null when the
    // attribute is omitted, so a regression that drops the prop OR
    // flips the default to "true" fails here. We assert the literal
    // string "false" rather than a coerced boolean to catch JSX
    // serialization regressions.
    expect(chip.getAttribute("aria-pressed")).toBe("false");
  });
});
