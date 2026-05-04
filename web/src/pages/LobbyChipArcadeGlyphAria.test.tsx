import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1507 — the `chip-arcade` chip wires `glyph={CATEGORY_GLYPHS[cat]}` per
 * LobbyPage.tsx ~L1971, and CATEGORY_GLYPHS.arcade (LobbyPage.tsx ~L621)
 * is the literal "✦" four-pointed-star character. The `Chip` component
 * (LobbyPage.tsx ~L2662) wraps that glyph in a `<span
 * class="lobby-chip-glyph" aria-hidden="true">`, so the bare "✦"
 * character would otherwise be announced before the chip label by
 * assistive tech. The wrapping span therefore MUST carry both the
 * `lobby-chip-glyph` class (for the visual layout) and
 * `aria-hidden="true"` (for the screen-reader contract).
 *
 * Sibling coverage:
 *   - W1435 (LobbyChipArcadeBadge.test.tsx) pins the chip-arcade count
 *     badge against the registry's arcade count on a fresh mount, but
 *     never reads the glyph span at all — a regression that dropped
 *     `aria-hidden` from the arcade glyph (or replaced the span with
 *     bare text) would slip past the badge audit.
 *   - W1495 (LobbyChipCardsGlyphAria.test.tsx) pins the analogous
 *     contract on the `chip-cards` glyph (♣) but never touches the
 *     arcade chip glyph.
 *   - W1500-ish (LobbyChipBoardGlyphAria.test.tsx) pins the analogous
 *     contract on the `chip-board` glyph (▦) but never touches the
 *     arcade chip glyph.
 *   - W1458 / W1462 / W1470 / W1481 pin the analogous contract on the
 *     user-data chips (hidden / recently-played / favorites /
 *     top-rated) but never touch a category chip glyph.
 *
 * The category chips (cards / board) are now pinned per-glyph; this
 * extends that coverage to `chip-arcade`. A regression that swapped the
 * glyph span for plain text, dropped `aria-hidden`, or rendered "✦"
 * outside the `.lobby-chip-glyph` wrapper would either expose the bare
 * star character to assistive tech or break the visual layout. This
 * pins the exact glyph text and the `aria-hidden="true"` attribute on a
 * fresh mount.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1495 / W1481 / W1470 / W1462 / W1458: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — chip-arcade glyph carries aria-hidden=\"true\" on fresh mount (W1507)", () => {
  it("renders the chip-arcade glyph span with aria-hidden=\"true\" and the literal '✦' text", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-arcade");
    expect(chip).toBeInTheDocument();

    // The Chip component (LobbyPage.tsx ~L2662) renders the glyph in a
    // dedicated `.lobby-chip-glyph` span. The presence of that span
    // guards against a regression that inlined the glyph as bare text.
    const glyph = chip.querySelector<HTMLElement>(".lobby-chip-glyph");
    expect(glyph).not.toBeNull();

    // Pin the literal glyph character. CATEGORY_GLYPHS.arcade
    // (LobbyPage.tsx ~L621) is "✦", and the chip-arcade wiring at
    // LobbyPage.tsx ~L1971 forwards that into the `glyph` prop, so this
    // is the contract.
    expect(glyph!.textContent).toBe("✦");

    // The load-bearing assertion: assistive tech MUST NOT announce the
    // bare "✦" star before the chip label — the wrapping span therefore
    // MUST carry `aria-hidden="true"`.
    expect(glyph!.getAttribute("aria-hidden")).toBe("true");
  });
});
