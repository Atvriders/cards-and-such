import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1564 — pin the inner label `tile-chip-label` className on the eta
 * chip rendered by `TileMetaChips` (LobbyPage.tsx ~L2741).
 *
 * The eta pill is two children: a clock glyph (aria-hidden) and a
 * `<span class="tile-chip-label">{compactLabel}</span>` carrying the
 * "Nm" text. The label span carries the `tile-chip-label` class hook
 * that LobbyPage.css uses to scope typography (line-height, padding,
 * letter-spacing) within the chip without bleeding onto the glyph.
 * Drop the className and the label collapses to the chip's default
 * styling, breaking visual alignment of the digits.
 *
 * Sibling W1244 (LobbyTileEtaTitle) covers the chip's title attr,
 * sibling W1550 (LobbyTileEtaClass) covers the `tile-chip-eta` outer
 * modifier. The inner label span's class token had no coverage —
 * grepping `Lobby*.test.tsx` for `tile-chip-label` returns zero hits.
 *
 * Lives in a NEW SIBLING file per the same rationale as W1244/W1550.
 */
describe("LobbyPage — tile-eta inner label className (W1564)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders an inner `tile-chip-label` span on every tile-eta chip", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    await screen.findByPlaceholderText(/search/i);

    const etaChips = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-eta-"]',
    );
    expect(etaChips.length).toBeGreaterThan(0);

    // Each eta chip must contain exactly one descendant with the
    // `tile-chip-label` class hook used by LobbyPage.css for digit
    // typography. querySelector(":scope > .tile-chip-label") would be
    // stricter, but the rendered DOM only has direct children here.
    for (const chip of Array.from(etaChips)) {
      const labels = chip.querySelectorAll<HTMLElement>(".tile-chip-label");
      expect(labels.length).toBe(1);
      // The label is the text-bearing leaf — confirm it actually has
      // visible "Nm" text so a future refactor that strips children
      // can't silently satisfy the className check with an empty span.
      expect(labels[0].textContent ?? "").toMatch(/^\d+m$/);
    }
  });
});
