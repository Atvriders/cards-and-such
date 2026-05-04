import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1458 — the `chip-hidden` chip wires `glyph="◌"` per LobbyPage.tsx
 * ~L1962, and the `Chip` component (LobbyPage.tsx ~L2662) wraps that
 * glyph in a `<span class="lobby-chip-glyph" aria-hidden="true">`. On a
 * fresh mount with zero hidden games (the count surfaces 0 per W1194 in
 * LobbyHiddenChipBadgeZero.test.tsx) screen-reader users would
 * otherwise hear the bare "◌" character announced before the chip
 * label, so the `aria-hidden="true"` attribute MUST stay pinned.
 *
 * Sibling coverage:
 *   - W1194 (LobbyHiddenChipBadgeZero.test.tsx) pins the chip's count
 *     badge text on the same fresh mount, but never reads the glyph
 *     span at all — so a regression that dropped `aria-hidden` from
 *     the glyph (or replaced the span with bare text) would slip.
 *   - W1139 / W1158 / W1175 cover the analogous count-zero state on
 *     the other user-data chips but not the glyph aria contract.
 *   - LobbyPage.test.tsx ~L2333 audits the chip-strip count format
 *     (`/^\d[\d,]*$/`) and ~L2131 pins `aria-pressed="false"` on
 *     non-active category chips, but neither inspects the glyph span.
 *
 * A regression that swapped the glyph span for plain text, dropped
 * `aria-hidden`, or rendered the glyph outside the `.lobby-chip-glyph`
 * wrapper would either expose the "◌" character to assistive tech or
 * break the visual layout. This pins the exact glyph text and the
 * `aria-hidden="true"` attribute on a fresh, hidden-free mount.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1139 / W1158 / W1175 / W1194 / W874 / W908: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-hidden glyph carries aria-hidden=\"true\" on zero hidden mount (W1458)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the chip-hidden glyph span with aria-hidden=\"true\" and the literal '◌' text when no games are hidden", () => {
    // Sanity: the canonical hidden-games blob is absent so
    // hiddenSet.size = 0 — same precondition as W1194.
    expect(localStorage.getItem("cards-hidden-games")).toBeNull();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-hidden");
    expect(chip).toBeInTheDocument();

    // The Chip component (LobbyPage.tsx ~L2662) renders the glyph in a
    // dedicated `.lobby-chip-glyph` span. The presence of that span
    // guards against a regression that inlined the glyph as bare text.
    const glyph = chip.querySelector<HTMLElement>(".lobby-chip-glyph");
    expect(glyph).not.toBeNull();

    // Pin the literal glyph character. The chip-hidden wiring at
    // LobbyPage.tsx ~L1962 sets `glyph="◌"`, so this is the contract.
    expect(glyph!.textContent).toBe("◌");

    // The load-bearing assertion: assistive tech MUST NOT announce the
    // bare "◌" character before the chip label — the wrapping span
    // therefore MUST carry `aria-hidden="true"`.
    expect(glyph!.getAttribute("aria-hidden")).toBe("true");
  });
});
