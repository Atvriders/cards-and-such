import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1481 — the `chip-top-rated` chip wires `glyph="★"` per LobbyPage.tsx
 * ~L1941, and the `Chip` component (LobbyPage.tsx ~L2662) wraps that
 * glyph in a `<span class="lobby-chip-glyph" aria-hidden="true">`. On a
 * fresh mount with no stored ratings (per W1139 in
 * LobbyTopRatedChipBadgeZero.test.tsx) the literal "★" star would
 * otherwise be announced before the chip label by assistive tech, so
 * the wrapping span MUST carry both the `lobby-chip-glyph` class (for
 * the visual layout) and `aria-hidden="true"` (for the screen-reader
 * contract).
 *
 * Sibling coverage:
 *   - W1139 (LobbyTopRatedChipBadgeZero.test.tsx) pins the chip's
 *     count badge text "0" on the same fresh mount, but never reads the
 *     glyph span at all — a regression that dropped `aria-hidden` from
 *     the glyph (or replaced the span with bare text) would slip.
 *   - W1458 (LobbyChipHiddenGlyphAria.test.tsx) pins the analogous
 *     contract on the `chip-hidden` glyph (◌) but never touches the
 *     top-rated chip glyph.
 *   - W1462 (LobbyChipRecentGlyphAria.test.tsx) pins the analogous
 *     contract on the `chip-recently-played` glyph (↺) but never
 *     touches the top-rated chip glyph.
 *   - W1470 (LobbyChipFavoritesGlyphAria.test.tsx) pins the analogous
 *     contract on the `chip-favorites` glyph (♥) but never touches the
 *     top-rated chip glyph.
 *   - LobbyTopRatedFilter.test.tsx exercises the top-rated filter path
 *     but doesn't inspect the chip glyph wrapper at all.
 *
 * A regression that swapped the glyph span for plain text, dropped
 * `aria-hidden`, or rendered "★" outside the `.lobby-chip-glyph`
 * wrapper would either expose the bare star character to assistive
 * tech or break the visual layout. This pins the exact glyph text and
 * the `aria-hidden="true"` attribute on a fresh, ratings-free mount.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1470 / W1462 / W1458 / W1194 / W1175 / W1158 / W1139:
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-top-rated glyph carries aria-hidden=\"true\" on empty ratings mount (W1481)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the chip-top-rated glyph span with aria-hidden=\"true\" and the literal '★' text when no ratings are stored", () => {
    // Sanity: the canonical ratings blob is absent so every game's
    // rating resolves to 0 — same precondition as W1139.
    expect(localStorage.getItem("cards-ratings")).toBeNull();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-top-rated");
    expect(chip).toBeInTheDocument();

    // The Chip component (LobbyPage.tsx ~L2662) renders the glyph in a
    // dedicated `.lobby-chip-glyph` span. The presence of that span
    // guards against a regression that inlined the glyph as bare text.
    const glyph = chip.querySelector<HTMLElement>(".lobby-chip-glyph");
    expect(glyph).not.toBeNull();

    // Pin the literal glyph character. The chip-top-rated wiring at
    // LobbyPage.tsx ~L1941 sets `glyph="★"`, so this is the contract.
    expect(glyph!.textContent).toBe("★");

    // The load-bearing assertion: assistive tech MUST NOT announce the
    // bare "★" star before the chip label — the wrapping span
    // therefore MUST carry `aria-hidden="true"`.
    expect(glyph!.getAttribute("aria-hidden")).toBe("true");
  });
});
