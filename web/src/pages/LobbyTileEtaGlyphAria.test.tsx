import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1748 — pin `aria-hidden="true"` on the inner clock-glyph span of
 * the lobby tile-eta chip rendered by `TileMetaChips` (LobbyPage.tsx
 * ~L2740).
 *
 * The eta pill has two direct children:
 *   <span aria-hidden="true">⏱</span>   <-- this test
 *   <span className="tile-chip-label">{compactLabel}</span>
 *
 * The leading clock emoji is decorative chrome — the chip's verbose
 * `title` ("Estimated playtime: …") and the digit-bearing label span
 * already carry the semantic playtime info. If the glyph is exposed
 * to assistive tech, screen readers double-announce ("clock 5m") and
 * the chip's compact pill aesthetic leaks into audio output. Pinning
 * `aria-hidden="true"` on the glyph keeps the emoji purely visual.
 *
 * Sibling coverage:
 *   W1244 LobbyTileEtaTitle      — outer chip `title` attribute
 *   W1550 LobbyTileEtaClass      — outer chip `tile-chip-eta` token
 *   W1642 LobbyTileEtaClassExact — outer chip exact className string
 *   W1564 LobbyTileEtaLabelClass — inner `tile-chip-label` className
 *   W1609 LobbyTileEtaTag        — outer chip tagName === "SPAN"
 *
 * The inner glyph span's `aria-hidden` had no dedicated coverage —
 * grepping `web/src/pages/Lobby*.test.tsx` for the combination of
 * `tile-eta` and `aria-hidden` (or the ⏱ glyph) returns zero hits.
 *
 * Lives in a NEW SIBLING file per the same rationale as the other
 * tile-eta atomic regression gates above.
 */
describe("LobbyPage — tile-eta inner glyph aria-hidden (W1748)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("marks the clock-glyph span aria-hidden=\"true\" on every tile-eta chip", async () => {
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

    for (const chip of Array.from(etaChips)) {
      // The glyph is the FIRST direct child span; the second child is
      // the `.tile-chip-label`. Use that contrast to isolate the glyph
      // without binding to the specific emoji codepoint (a future
      // refactor may swap ⏱ for a different clock variant or an SVG
      // — the contract under test is purely the aria-hidden attribute
      // on whichever decorative leaf precedes the label).
      const glyph = chip.querySelector<HTMLElement>(
        ":scope > span:not(.tile-chip-label)",
      );
      expect(glyph).not.toBeNull();
      expect(glyph!.getAttribute("aria-hidden")).toBe("true");
    }
  });
});
