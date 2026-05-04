import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1514 — the `chip-dice` chip wires `glyph={CATEGORY_GLYPHS[cat]}` per
 * LobbyPage.tsx ~L1971, and CATEGORY_GLYPHS.dice (LobbyPage.tsx ~L619)
 * is the literal "⚂" die-face character. The `Chip` component
 * (LobbyPage.tsx ~L2662) wraps that glyph in a `<span class="lobby-chip-glyph"
 * aria-hidden="true">`, so the bare "⚂" character would otherwise be
 * announced before the chip label by assistive tech. The wrapping span
 * therefore MUST carry both the `lobby-chip-glyph` class (for the visual
 * layout) and `aria-hidden="true"` (for the screen-reader contract).
 *
 * Sibling coverage:
 *   - W1495 (LobbyChipCardsGlyphAria.test.tsx) pins the analogous
 *     contract on the `chip-cards` glyph (♣).
 *   - W1499 (LobbyChipBoardGlyphAria.test.tsx) pins the analogous
 *     contract on the `chip-board` glyph (▦).
 *   - W1458 / W1462 / W1470 / W1481 pin the user-data chip glyphs
 *     (hidden / recently-played / favorites / top-rated) but none of
 *     them assert anything about the registry-driven `chip-dice` glyph.
 *   - LobbyChipDiceBadge.test.tsx pins the chip-dice count badge but
 *     never reads the glyph span at all — a regression that dropped
 *     `aria-hidden` from the dice glyph (or replaced the span with bare
 *     text) would slip past the badge audit.
 *
 * This is the first analogous coverage on the `chip-dice` glyph. A
 * regression that swapped the glyph span for plain text, dropped
 * `aria-hidden`, or rendered "⚂" outside the `.lobby-chip-glyph` wrapper
 * would either expose the bare die-face character to assistive tech or
 * break the visual layout. This pins the exact glyph text and the
 * `aria-hidden="true"` attribute on a fresh mount.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1499 / W1495 / W1481 / W1470 / W1462 / W1458: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — chip-dice glyph carries aria-hidden=\"true\" on fresh mount (W1514)", () => {
  it("renders the chip-dice glyph span with aria-hidden=\"true\" and the literal '⚂' text", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-dice");
    expect(chip).toBeInTheDocument();

    // The Chip component (LobbyPage.tsx ~L2662) renders the glyph in a
    // dedicated `.lobby-chip-glyph` span. The presence of that span
    // guards against a regression that inlined the glyph as bare text.
    const glyph = chip.querySelector<HTMLElement>(".lobby-chip-glyph");
    expect(glyph).not.toBeNull();

    // Pin the literal glyph character. CATEGORY_GLYPHS.dice
    // (LobbyPage.tsx ~L619) is "⚂", and the chip-dice wiring at
    // LobbyPage.tsx ~L1971 forwards that into the `glyph` prop, so this
    // is the contract.
    expect(glyph!.textContent).toBe("⚂");

    // The load-bearing assertion: assistive tech MUST NOT announce the
    // bare "⚂" die-face before the chip label — the wrapping span
    // therefore MUST carry `aria-hidden="true"`.
    expect(glyph!.getAttribute("aria-hidden")).toBe("true");
  });
});
