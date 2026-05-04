import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1495 — the `chip-cards` chip wires `glyph={CATEGORY_GLYPHS[cat]}` per
 * LobbyPage.tsx ~L1971, and CATEGORY_GLYPHS.cards (LobbyPage.tsx ~L618)
 * is the literal "♣" club character. The `Chip` component (LobbyPage.tsx
 * ~L2662) wraps that glyph in a `<span class="lobby-chip-glyph"
 * aria-hidden="true">`, so the bare "♣" character would otherwise be
 * announced before the chip label by assistive tech. The wrapping span
 * therefore MUST carry both the `lobby-chip-glyph` class (for the visual
 * layout) and `aria-hidden="true"` (for the screen-reader contract).
 *
 * Sibling coverage:
 *   - W1424 (LobbyChipCardsBadge.test.tsx) pins the chip-cards count
 *     badge against the registry's cards count on a fresh mount, but
 *     never reads the glyph span at all — a regression that dropped
 *     `aria-hidden` from the cards glyph (or replaced the span with bare
 *     text) would slip past the badge audit.
 *   - W1458 (LobbyChipHiddenGlyphAria.test.tsx) pins the analogous
 *     contract on the `chip-hidden` glyph (◌) but never touches a
 *     category chip glyph.
 *   - W1462 (LobbyChipRecentGlyphAria.test.tsx) pins the analogous
 *     contract on the `chip-recently-played` glyph (↺) but never
 *     touches a category chip glyph.
 *   - W1470 (LobbyChipFavoritesGlyphAria.test.tsx) pins the analogous
 *     contract on the `chip-favorites` glyph (♥) but never touches a
 *     category chip glyph.
 *   - W1481 (LobbyChipTopRatedGlyphAria.test.tsx) pins the analogous
 *     contract on the `chip-top-rated` glyph (★) but never touches a
 *     category chip glyph.
 *
 * The user-data chips (hidden / recently-played / favorites / top-rated)
 * are now all pinned per-glyph; this is the first analogous coverage on
 * a registry-driven category chip. A regression that swapped the glyph
 * span for plain text, dropped `aria-hidden`, or rendered "♣" outside
 * the `.lobby-chip-glyph` wrapper would either expose the bare club
 * character to assistive tech or break the visual layout. This pins the
 * exact glyph text and the `aria-hidden="true"` attribute on a fresh
 * mount.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1481 / W1470 / W1462 / W1458: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — chip-cards glyph carries aria-hidden=\"true\" on fresh mount (W1495)", () => {
  it("renders the chip-cards glyph span with aria-hidden=\"true\" and the literal '♣' text", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-cards");
    expect(chip).toBeInTheDocument();

    // The Chip component (LobbyPage.tsx ~L2662) renders the glyph in a
    // dedicated `.lobby-chip-glyph` span. The presence of that span
    // guards against a regression that inlined the glyph as bare text.
    const glyph = chip.querySelector<HTMLElement>(".lobby-chip-glyph");
    expect(glyph).not.toBeNull();

    // Pin the literal glyph character. CATEGORY_GLYPHS.cards
    // (LobbyPage.tsx ~L618) is "♣", and the chip-cards wiring at
    // LobbyPage.tsx ~L1971 forwards that into the `glyph` prop, so this
    // is the contract.
    expect(glyph!.textContent).toBe("♣");

    // The load-bearing assertion: assistive tech MUST NOT announce the
    // bare "♣" club before the chip label — the wrapping span therefore
    // MUST carry `aria-hidden="true"`.
    expect(glyph!.getAttribute("aria-hidden")).toBe("true");
  });
});
