import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2196 — pin that the OUTER `tile-chip-eta` span rendered by
 * `TileMetaChips` (LobbyPage.tsx ~L2735) carries NO `aria-hidden`
 * attribute of its own.
 *
 *   <div className="tile-chips" aria-hidden="false">  <-- parent
 *     <span
 *       className="tile-chip tile-chip-eta"
 *       data-testid={`tile-eta-${gameId}`}             <-- THIS span
 *       title={`Estimated playtime: ${eta.label}`}
 *     >
 *       <span aria-hidden="true">⏱</span>             <-- pinned by W1748
 *       <span className="tile-chip-label">{compactLabel}</span>
 *     </span>
 *     …
 *   </div>
 *
 * The chip text ("Xm") is meaningful to assistive tech and the
 * surrounding `.tile-chips` wrapper already declares `aria-hidden="false"`,
 * so the outer chip itself must NOT introduce a competing `aria-hidden`
 * attribute — doing so would either silence the playtime label
 * (`aria-hidden="true"`) or duplicate the parent's already-explicit
 * `aria-hidden="false"` and add noise to the a11y tree.
 *
 * Sibling tests pin the inner clock-glyph aria-hidden (W1748
 * LobbyTileEtaGlyphAria), the chip tagName (W1609 LobbyTileEtaTag),
 * className (W1550 / LobbyTileEtaClassExact), label-class (W1564),
 * title (W1244 LobbyTileEtaTitle), missing-id (W2075 LobbyTileEtaNoId),
 * and missing-style (LobbyTileEtaNoStyle), but NONE of them exercise
 * the OUTER chip's own `aria-hidden` attribute — grepping
 * `web/src/pages/Lobby*.test.tsx` for `tile-eta` together with
 * `aria-hidden` (excluding the inner-glyph file) returns zero hits, so a
 * silent regression that added e.g. `aria-hidden="true"` to the outer
 * chip would still pass every existing assertion while making the
 * playtime label invisible to screen readers.
 *
 * Lives in a NEW SIBLING file (rather than appending to an existing
 * tile-eta test) per the same rationale as the W2075 / W1670 / W1609
 * splits: shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to the mega-file or to any sibling
 * tile-eta test.
 */
describe("LobbyPage — tile-chip-eta outer aria-hidden absence (W2196)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the first tile-eta chip without an `aria-hidden` attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — search input is the canonical
    // "lobby is ready" anchor shared by sibling tile-eta tests.
    await screen.findByPlaceholderText(/search/i);

    const etaChips = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-eta-"]',
    );
    expect(etaChips.length, "no tile-eta chips rendered").toBeGreaterThan(0);

    // Core assertion: the OUTER chip carries no `aria-hidden`. Using
    // `hasAttribute` (rather than asserting a specific string) catches
    // both the explicit-"true" and explicit-"false" regressions — the
    // intent is that the chip inherits visibility from its `.tile-chips`
    // parent, not that it re-declares an `aria-hidden` of its own.
    const first = etaChips[0]!;
    expect(first.hasAttribute("aria-hidden")).toBe(false);
    expect(first.getAttribute("aria-hidden")).toBeNull();
  });
});
