import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2475 — the `chip-hidden` button (the dedicated hidden-mode filter chip
 * in the lobby chip-strip, rendered through the shared `Chip` helper at
 * LobbyPage.tsx ~L2651-2666 from the static JSX node at
 * LobbyPage.tsx ~L1957-1963) declares `type="button"` explicitly so it
 * can never inherit the default `type="submit"` behaviour if a future
 * refactor wraps the chip-strip (or the surrounding toolbar) in a
 * `<form>` ancestor. A submit-by-default regression there would cause
 * Enter-key activation on the hidden-filter chip to trigger a spurious
 * form submission and a full page reload — a hard-to-diagnose UX bug
 * that is invisible in the current markup but trivially introduced by
 * an enclosing form refactor.
 *
 * Why this needs its OWN per-chip pin on chip-hidden specifically:
 *  - W1258 (LobbyChipType.test.tsx) pins the `type="button"` attribute
 *    on `chip-all` ONLY. Every other chip — chip-cards, chip-board,
 *    chip-dice, chip-arcade, chip-solitaire, chip-favorites,
 *    chip-recently-played, chip-top-rated, chip-hidden — has NO
 *    cross-chip pin on the `type` attribute itself.
 *  - W2473 (LobbyChipBoardType.test.tsx) pins the same attribute on
 *    `chip-board` only. W2467 (LobbyChipArcadeType.test.tsx) pins it
 *    on `chip-arcade` only. W2469 (LobbyChipSolitaireType.test.tsx)
 *    pins it on `chip-solitaire` only. None of these touch chip-hidden,
 *    which is rendered through the *static* JSX branch (not the
 *    `CATEGORY_ORDER.map` dynamic branch that emits the per-category
 *    chips), so a regression that special-cased the hidden-filter chip
 *    JSX (e.g. inlined a custom <button> for the hidden chip without
 *    going through the shared Chip helper) could silently drop the
 *    `type="button"` attribute on chip-hidden alone.
 *  - W1962 (LobbyChipTag.test.tsx) pins `tagName === "BUTTON"` on every
 *    chip including chip-hidden, but a `<button>` without an explicit
 *    `type` attribute still satisfies that assertion while defaulting
 *    to "submit" inside a form.
 *  - W1194 (LobbyHiddenChipBadgeZero.test.tsx) pins the count badge
 *    text on a fresh mount, W1458 (LobbyChipHiddenGlyphAria.test.tsx)
 *    pins the glyph span and its `aria-hidden` attribute, W697
 *    (LobbyPageHide.test.tsx) pins the count badge flipping after a
 *    hide-tile menu click, and W2466 (LobbyChipHiddenNoId.test.tsx)
 *    pins the `id` attribute absence — but NONE of these read the
 *    button-level `type` attribute on chip-hidden.
 *
 * We resolve the chip via its stable `data-testid="chip-hidden"`
 * (rendered through `testId="chip-hidden"` at LobbyPage.tsx ~L1961)
 * so the lookup is locale-independent and immune to translation-key
 * changes. The assertion uses `getAttribute("type")` to read the
 * literal markup attribute — not the `HTMLButtonElement.type` IDL
 * property which coerces missing/invalid values to "submit" and would
 * mask exactly the regression this pin guards against.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx
 * or extending W1258 / W2473 / W2467) mirrors the per-chip `type` pin
 * pattern (W2473 / W2467 / W2469) so this shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to the
 * mega-file.
 */
describe("LobbyPage — chip-hidden type attribute (W2475)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders chip-hidden with an explicit type=\"button\" attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-hidden") as HTMLButtonElement;

    // Sanity: confirm we pinned the actual chip-hidden <button>
    // wrapper. The Chip helper emits a <button>, and going through
    // `data-testid="chip-hidden"` would resolve a child element if
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
