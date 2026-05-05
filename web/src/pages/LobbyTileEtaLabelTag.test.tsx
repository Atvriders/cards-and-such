import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2220 — pin the SPAN tagName of the INNER `.tile-chip-label` span
 * rendered inside every lobby tile-eta chip by `TileMetaChips`
 * (LobbyPage.tsx ~L2741):
 *
 *   <span
 *     className="tile-chip tile-chip-eta"
 *     data-testid={`tile-eta-${gameId}`}
 *     title={`Estimated playtime: ${eta.label}`}
 *   >
 *     <span aria-hidden="true">⏱</span>
 *     <span className="tile-chip-label">{compactLabel}</span>   <-- THIS
 *   </span>
 *
 * The `.tile-chip-label` element is the digit-bearing leaf inside the
 * eta pill. It MUST stay a phrasing-content `<span>` — its parent is
 * itself an inline `<span>` (pinned by W1609 LobbyTileEtaTag), and the
 * chip lives inside the `.tile-chips` flex row. A refactor reaching
 * for `<div>` / `<p>` / `<label>` / `<output>` here would either trip
 * a "block inside inline" hydration warning (DOM-spec illegal nesting)
 * or hijack semantics — `<label>` would imply a form association the
 * eta chip does not have, and `<output>` would expose a live region
 * that the compact "Nm" pill should not advertise.
 *
 * Sibling coverage:
 *   W1244 LobbyTileEtaTitle       — outer chip `title` attribute
 *   W1550 LobbyTileEtaClass       — outer chip `tile-chip-eta` token
 *   W1642 LobbyTileEtaClassExact  — outer chip exact className string
 *   W1564 LobbyTileEtaLabelClass  — inner label `tile-chip-label` class
 *   W1609 LobbyTileEtaTag         — outer chip tagName === "SPAN"
 *   W1748 LobbyTileEtaGlyphAria   — inner glyph `aria-hidden="true"`
 *   W2196 LobbyTileEtaAriaHidden  — outer chip has no `aria-hidden`
 *   W2211 LobbyTileEtaNoRole      — outer chip has no `role`
 *
 * The INNER label span's tagName had no executable coverage —
 * grepping `web/src/pages/Lobby*.test.tsx` for the combination of
 * `tile-chip-label` and `tagName` returns zero hits, so a silent
 * refactor that swapped the leaf to a `<div>` would slip past every
 * existing assertion while breaking inline layout.
 *
 * Lives in a NEW SIBLING file per the same rationale as the W2196 /
 * W2211 / W1609 splits: shares the `src/pages/Lobby` vitest path
 * filter without colliding with concurrent edits to the LobbyPage
 * mega-file or to any sibling tile-eta test.
 */
describe("LobbyPage — tile-chip-label inner tagName (W2220)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every `.tile-chip-label` inside a tile-eta chip as a SPAN element", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor shared by sibling tile-eta tests.
    await screen.findByPlaceholderText(/search/i);

    const etaChips = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-eta-"]',
    );
    expect(etaChips.length, "no tile-eta chips rendered").toBeGreaterThan(0);

    // The assertion must hold for EVERY chip — a refactor that swapped
    // a single tile's label leaf to a `<div>` would otherwise slip
    // through a "first chip only" check.
    for (const chip of Array.from(etaChips)) {
      const label = chip.querySelector<HTMLElement>(".tile-chip-label");
      expect(label, "tile-chip-label not found inside tile-eta chip").not.toBeNull();
      expect(label!.tagName).toBe("SPAN");
    }
  });
});
