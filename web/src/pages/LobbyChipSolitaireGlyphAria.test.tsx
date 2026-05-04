import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1520 — the `chip-solitaire` chip wires `glyph={CATEGORY_GLYPHS[cat]}` per
 * LobbyPage.tsx ~L1971, and CATEGORY_GLYPHS.solitaire (LobbyPage.tsx ~L617)
 * is the literal "♤" white-spade-suit character. The `Chip` component
 * (LobbyPage.tsx ~L2662) wraps that glyph in a `<span class="lobby-chip-glyph"
 * aria-hidden="true">`, so the bare "♤" character would otherwise be
 * announced before the chip label by assistive tech. The wrapping span
 * therefore MUST carry both the `lobby-chip-glyph` class (for the visual
 * layout) and `aria-hidden="true"` (for the screen-reader contract).
 *
 * Sibling coverage:
 *   - W1495 (LobbyChipCardsGlyphAria.test.tsx) pins the analogous
 *     contract on the `chip-cards` glyph (♣).
 *   - W1499 (LobbyChipBoardGlyphAria.test.tsx) pins the same contract
 *     on the `chip-board` glyph (▦).
 *   - W1507 (LobbyChipArcadeGlyphAria.test.tsx) pins the same contract
 *     on the `chip-arcade` glyph (✦).
 *   - LobbyChipDiceGlyphAria.test.tsx pins the chip-dice glyph (⚂).
 *   - W1374-style badge tests (LobbySolitaireChipBadge.test.tsx) pin the
 *     chip-solitaire count badge but never read the glyph span at all —
 *     a regression that dropped `aria-hidden` from the solitaire glyph
 *     (or replaced the span with bare text) would slip past the badge audit.
 *
 * This is the first analogous coverage on the `chip-solitaire` glyph. A
 * regression that swapped the glyph span for plain text, dropped
 * `aria-hidden`, or rendered "♤" outside the `.lobby-chip-glyph` wrapper
 * would either expose the bare spade character to assistive tech or
 * break the visual layout. This pins the exact glyph text and the
 * `aria-hidden="true"` attribute on a fresh mount.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1495 / W1499 / W1507: shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to the
 * mega-file.
 */
describe("LobbyPage — chip-solitaire glyph carries aria-hidden=\"true\" on fresh mount (W1520)", () => {
  it("renders the chip-solitaire glyph span with aria-hidden=\"true\" and the literal '♤' text", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-solitaire");
    expect(chip).toBeInTheDocument();

    // The Chip component (LobbyPage.tsx ~L2662) renders the glyph in a
    // dedicated `.lobby-chip-glyph` span. The presence of that span
    // guards against a regression that inlined the glyph as bare text.
    const glyph = chip.querySelector<HTMLElement>(".lobby-chip-glyph");
    expect(glyph).not.toBeNull();

    // Pin the literal glyph character. CATEGORY_GLYPHS.solitaire
    // (LobbyPage.tsx ~L617) is "♤", and the chip-solitaire wiring at
    // LobbyPage.tsx ~L1971 forwards that into the `glyph` prop, so this
    // is the contract.
    expect(glyph!.textContent).toBe("♤");

    // The load-bearing assertion: assistive tech MUST NOT announce the
    // bare "♤" spade before the chip label — the wrapping span
    // therefore MUST carry `aria-hidden="true"`.
    expect(glyph!.getAttribute("aria-hidden")).toBe("true");
  });
});
