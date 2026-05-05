import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2483 — the `chip-favorites` button (the dedicated favorites-mode filter
 * chip in the lobby chip-strip, rendered through the shared `Chip` helper
 * at LobbyPage.tsx ~L2651-2666 from the static JSX node at
 * LobbyPage.tsx ~L1943-1949) declares `type="button"` explicitly so it
 * can never inherit the default `type="submit"` behaviour if a future
 * refactor wraps the chip-strip (or the surrounding toolbar) in a
 * `<form>` ancestor. A submit-by-default regression there would cause
 * Enter-key activation on the favorites chip to trigger a spurious
 * form submission and a full page reload — losing the user's filter
 * state and any unsaved tile-menu interactions, a UX bug that is
 * invisible in the current markup but trivially introduced by an
 * enclosing form refactor.
 *
 * Why this needs its OWN per-chip pin on chip-favorites specifically:
 *  - W1258 (LobbyChipType.test.tsx) pins the `type="button"` attribute
 *    on `chip-all` ONLY. Every other chip — chip-cards, chip-board,
 *    chip-dice, chip-arcade, chip-solitaire, chip-favorites,
 *    chip-recently-played, chip-top-rated, chip-hidden — has NO
 *    cross-chip pin on the `type` attribute itself.
 *  - W2473 (LobbyChipBoardType.test.tsx) pins the same attribute on
 *    `chip-board` only. W2467 (LobbyChipArcadeType.test.tsx) pins it
 *    on `chip-arcade` only. W2469 (LobbyChipSolitaireType.test.tsx)
 *    pins it on `chip-solitaire` only. W2475 (LobbyChipHiddenType
 *    .test.tsx) pins it on `chip-hidden` only. None of these touch
 *    chip-favorites, which is rendered through the *static* JSX branch
 *    (not the `CATEGORY_ORDER.map` dynamic branch that emits the
 *    per-category chips), so a regression that special-cased the
 *    favorites-filter chip JSX (e.g. inlined a custom <button> for the
 *    favorites chip without going through the shared Chip helper)
 *    could silently drop the `type="button"` attribute on
 *    chip-favorites alone.
 *  - W1962 (LobbyChipTag.test.tsx) pins `tagName === "BUTTON"` on every
 *    chip including chip-favorites, but a `<button>` without an
 *    explicit `type` attribute still satisfies that assertion while
 *    defaulting to "submit" inside a form.
 *  - W1158 (LobbyFavoritesChipBadgeZero.test.tsx) pins the count badge
 *    text on a fresh mount, W1470 (LobbyChipFavoritesGlyphAria.test
 *    .tsx) pins the glyph span and its `aria-hidden` attribute, the
 *    LobbyPage.test.tsx W267 / W649 tests pin `aria-pressed` and
 *    favorites-filter persistence, and W2450 (LobbyChipFavoritesNoId
 *    .test.tsx) pins the `id` attribute absence — but NONE of these
 *    read the button-level `type` attribute on chip-favorites.
 *
 * We resolve the chip via its stable `data-testid="chip-favorites"`
 * (rendered through `testId="chip-favorites"` at LobbyPage.tsx ~L1947)
 * so the lookup is locale-independent and immune to translation-key
 * changes. The assertion uses `getAttribute("type")` to read the
 * literal markup attribute — not the `HTMLButtonElement.type` IDL
 * property which coerces missing/invalid values to "submit" and would
 * mask exactly the regression this pin guards against.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx
 * or extending W1258 / W2473 / W2467 / W2469 / W2475) mirrors the
 * per-chip `type` pin pattern so this shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to the
 * mega-file.
 */
describe("LobbyPage — chip-favorites type attribute (W2483)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders chip-favorites with an explicit type=\"button\" attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-favorites") as HTMLButtonElement;

    // Sanity: confirm we pinned the actual chip-favorites <button>
    // wrapper. The Chip helper emits a <button>, and going through
    // `data-testid="chip-favorites"` would resolve a child element if
    // any future refactor moved the testid down onto an inner span.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: explicit `type="button"`. Use
    // `getAttribute("type")` to read the literal markup attribute —
    // the `HTMLButtonElement.type` IDL property coerces missing or
    // invalid values to "submit" and would mask the very regression
    // this pin guards against (an omitted attribute defaulting to
    // submit inside an enclosing form).
    expect(chip.getAttribute("type")).toBe("button");
  });
});
