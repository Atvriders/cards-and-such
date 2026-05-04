import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1462 — the `chip-recently-played` chip wires `glyph="↺"` per
 * LobbyPage.tsx ~L1955, and the `Chip` component (LobbyPage.tsx ~L2662)
 * wraps that glyph in a `<span class="lobby-chip-glyph"
 * aria-hidden="true">`. On a fresh mount with zero recently-played
 * games (per W1158 in LobbyRecentlyPlayedChipBadgeZero.test.tsx) the
 * literal "↺" arrow would otherwise be announced before the chip label
 * by assistive tech, so the wrapping span MUST carry both the
 * `lobby-chip-glyph` class (for the visual layout) and
 * `aria-hidden="true"` (for the screen-reader contract).
 *
 * Sibling coverage:
 *   - W1158 (LobbyRecentlyPlayedChipBadgeZero.test.tsx) pins the chip's
 *     count badge text "0" on the same fresh mount, but never reads the
 *     glyph span at all — a regression that dropped `aria-hidden` from
 *     the glyph (or replaced the span with bare text) would slip.
 *   - W1458 (LobbyChipHiddenGlyphAria.test.tsx) pins the analogous
 *     contract on the `chip-hidden` glyph (◌) but never touches the
 *     recently-played chip glyph.
 *   - LobbyPage.test.tsx ~L2182 clicks `chip-recently-played` to flip
 *     the filter, but never inspects its glyph wrapper at all.
 *
 * A regression that swapped the glyph span for plain text, dropped
 * `aria-hidden`, or rendered "↺" outside the `.lobby-chip-glyph`
 * wrapper would either expose the bare arrow character to assistive
 * tech or break the visual layout. This pins the exact glyph text and
 * the `aria-hidden="true"` attribute on a fresh mount.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1458 / W1194 / W1175 / W1158 / W1139: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-recently-played glyph carries aria-hidden=\"true\" on fresh mount (W1462)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the chip-recently-played glyph span with aria-hidden=\"true\" and the literal '↺' text on a fresh mount", () => {
    // Sanity: the canonical recently-played blob is absent so the chip
    // mounts with count = 0 — same precondition as W1158.
    expect(localStorage.getItem("cards-recently-played")).toBeNull();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-recently-played");
    expect(chip).toBeInTheDocument();

    // The Chip component (LobbyPage.tsx ~L2662) renders the glyph in a
    // dedicated `.lobby-chip-glyph` span. The presence of that span
    // guards against a regression that inlined the glyph as bare text.
    const glyph = chip.querySelector<HTMLElement>(".lobby-chip-glyph");
    expect(glyph).not.toBeNull();

    // Pin the literal glyph character. The chip-recently-played wiring
    // at LobbyPage.tsx ~L1955 sets `glyph="↺"`, so this is the
    // contract.
    expect(glyph!.textContent).toBe("↺");

    // The load-bearing assertion: assistive tech MUST NOT announce the
    // bare "↺" arrow before the chip label — the wrapping span
    // therefore MUST carry `aria-hidden="true"`.
    expect(glyph!.getAttribute("aria-hidden")).toBe("true");
  });
});
