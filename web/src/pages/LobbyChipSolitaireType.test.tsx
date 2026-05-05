import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2471 — the `chip-solitaire` button (the per-category solitaire chip
 * in the lobby chip-strip, rendered through the shared `Chip` helper at
 * LobbyPage.tsx ~L2651) declares `type="button"` explicitly so it can
 * never inherit the default `type="submit"` behaviour if a future
 * refactor wraps the chip-strip (or the entire toolbar) in a `<form>`
 * ancestor. A submit-by-default regression there would cause Enter-key
 * activation to trigger a spurious form submission and a full page
 * reload — a hard-to-diagnose UX bug that is invisible in the current
 * markup but trivially introduced by an enclosing form refactor.
 *
 * Why this needs its OWN per-chip pin:
 *  - W1258 (LobbyChipType.test.tsx) pins the `type="button"` attribute
 *    on `chip-all` ONLY. Every other chip — chip-cards, chip-board,
 *    chip-dice, chip-arcade, chip-solitaire, chip-favorites,
 *    chip-recently-played, chip-top-rated, chip-hidden — has NO test
 *    that asserts the `type` attribute exactly. While all chips share
 *    the same `Chip` helper today, a future refactor that special-cases
 *    a category chip (e.g. solitaire becomes the default-active chip
 *    with its own JSX) could silently drop the attribute for just that
 *    chip without breaking W1258.
 *  - W2467 (LobbyChipArcadeType.test.tsx) pins `type="button"` for
 *    `chip-arcade` only — leaving solitaire still unpinned at the
 *    button-level `type` attribute.
 *  - W1962 (LobbyChipTag.test.tsx) pins `tagName === "BUTTON"` for every
 *    chip including `chip-solitaire`, but a `<button>` without an
 *    explicit `type` attribute still satisfies that assertion while
 *    defaulting to "submit" inside a form.
 *  - W1229 (LobbySolitaireChipBadge.test.tsx) and W1520
 *    (LobbyChipSolitaireGlyphAria.test.tsx) pin the badge count and the
 *    glyph span respectively for `chip-solitaire`, but neither reads
 *    the button-level `type` attribute. W812 / W2284 (LobbyDrawerEnter
 *    & friends) read `aria-pressed` but not `type`.
 *
 * We resolve the chip via its stable `data-testid="chip-solitaire"` (the
 * testId wired at LobbyPage.tsx ~L1970 via `testId={`chip-${cat}`}`)
 * so the lookup is locale-independent and immune to translation-key
 * changes. The assertion uses `getAttribute("type")` to read the
 * literal markup attribute — not the `HTMLButtonElement.type` IDL
 * property which coerces missing/invalid values to "submit" and would
 * mask exactly the regression this pin guards against.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx
 * or extending W1258 / W2467) mirrors the per-chip `Type` test pattern
 * so this shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to either mega-file.
 */
describe("LobbyPage — chip-solitaire type attribute (W2471)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders chip-solitaire with an explicit type=\"button\" attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-solitaire") as HTMLButtonElement;

    // Raw attribute check — `getAttribute` returns null when the
    // attribute is omitted, so a regression that drops the prop
    // (and lets the button default to "submit") fails here.
    expect(chip.getAttribute("type")).toBe("button");
  });
});
