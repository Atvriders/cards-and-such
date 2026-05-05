import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2492 — the `chip-top-rated` button (the dedicated top-rated-mode
 * filter chip in the lobby chip-strip, rendered through the shared
 * `Chip` helper at LobbyPage.tsx from the static JSX node ~L1940)
 * declares `type="button"` explicitly so it can never inherit the
 * default `type="submit"` behaviour if a future refactor wraps the
 * chip-strip (or the surrounding toolbar) in a `<form>` ancestor.
 * A submit-by-default regression there would cause Enter-key
 * activation on the top-rated chip to trigger a spurious form
 * submission and a full page reload — losing the user's filter
 * state and any unsaved tile-menu interactions, a UX bug that is
 * invisible in the current markup but trivially introduced by an
 * enclosing form refactor.
 *
 * Why this needs its OWN per-chip pin on chip-top-rated specifically:
 *  - W1258 (LobbyChipType.test.tsx) pins the `type="button"` attribute
 *    on `chip-all` ONLY. Every other chip — chip-cards, chip-board,
 *    chip-dice, chip-arcade, chip-solitaire, chip-favorites,
 *    chip-recently-played, chip-top-rated, chip-hidden — needs its
 *    own per-chip pin on the `type` attribute itself.
 *  - Sibling per-chip type pins exist on chip-favorites (W2483),
 *    chip-board (W2473), chip-arcade (W2467), chip-solitaire
 *    (W2469), chip-hidden (W2475), chip-cards, and chip-dice. None
 *    of these touch chip-top-rated, which is rendered through the
 *    *static* JSX branch (not the `CATEGORY_ORDER.map` dynamic
 *    branch that emits the per-category chips), so a regression
 *    that special-cased the top-rated-filter chip JSX (e.g. inlined
 *    a custom <button> for the top-rated chip without going through
 *    the shared Chip helper) could silently drop the `type="button"`
 *    attribute on chip-top-rated alone.
 *  - W1962 (LobbyChipTag.test.tsx) pins `tagName === "BUTTON"` on
 *    every chip including chip-top-rated, but a `<button>` without
 *    an explicit `type` attribute still satisfies that assertion
 *    while defaulting to "submit" inside a form.
 *  - W1481 (LobbyChipTopRatedGlyphAria.test.tsx) pins the glyph span
 *    and its `aria-hidden` attribute, W2460
 *    (LobbyChipTopRatedNoId.test.tsx) pins the `id` attribute
 *    absence on chip-top-rated, and the
 *    LobbyTopRatedChipBadgeZero / LobbyTopRatedFilter tests pin the
 *    badge count and filter behaviour respectively — but NONE of
 *    these read the button-level `type` attribute on chip-top-rated.
 *
 * We resolve the chip via its stable `data-testid="chip-top-rated"`
 * so the lookup is locale-independent and immune to translation-key
 * changes. The assertion uses `getAttribute("type")` to read the
 * literal markup attribute — not the `HTMLButtonElement.type` IDL
 * property which coerces missing/invalid values to "submit" and
 * would mask exactly the regression this pin guards against.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx
 * or extending the existing per-chip type pin files) mirrors the
 * per-chip `type` pin pattern so this shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to the
 * mega-file.
 */
describe("LobbyPage — chip-top-rated type attribute (W2492)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders chip-top-rated with an explicit type=\"button\" attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-top-rated") as HTMLButtonElement;

    // Sanity: confirm we pinned the actual chip-top-rated <button>
    // wrapper. The Chip helper emits a <button>, and going through
    // `data-testid="chip-top-rated"` would resolve a child element
    // if any future refactor moved the testid down onto an inner
    // span.
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
