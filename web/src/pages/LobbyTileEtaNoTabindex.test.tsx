import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2264 — pin that the per-tile `tile-chip-eta` chip rendered by
 * `TileMetaChips` (LobbyPage.tsx ~L2735) carries NO `tabindex`
 * attribute.
 *
 *   <span
 *     className="tile-chip tile-chip-eta"
 *     data-testid={`tile-eta-${gameId}`}
 *     title={`Estimated playtime: ${eta.label}`}
 *   >…</span>
 *
 * The eta chip is purely presentational metadata — the surrounding
 * tile anchor already carries the keyboard affordance. Forcing the
 * eta chip into the tab order would (a) double the tab-stops for
 * every tile in the lobby grid, and (b) advertise interactivity that
 * does not exist (the chip has no click / key handler). Sibling
 * tests already pin the chip's tagName (W1609 LobbyTileEtaTag),
 * className (W1550 LobbyTileEtaClass / LobbyTileEtaClassExact),
 * label-class (W1564 LobbyTileEtaLabelClass), title attribute (W1244
 * LobbyTileEtaTitle), inner-glyph aria-hidden (W1748
 * LobbyTileEtaGlyphAria), missing `id` (W2075 LobbyTileEtaNoId),
 * missing `role` (LobbyTileEtaNoRole), and missing inline `style`
 * (LobbyTileEtaNoStyle) — but NONE of those exercise the `tabindex`
 * attribute. Grepping `web/src/pages/Lobby*.test.tsx` for `tile-eta`
 * together with `tabindex` / `tabIndex` returns zero hits, so a
 * silent regression that added e.g. `tabIndex={0}` to the eta chip
 * would still pass every existing assertion while breaking the
 * no-extra-tab-stop invariant.
 *
 * Lives in a NEW SIBLING file (rather than appending to an existing
 * tile-eta test) per the same rationale as the W2075 / W1670 / W1609
 * splits: shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to the mega-file or to any sibling
 * tile-eta test.
 */
describe("LobbyPage — tile-chip-eta has no tabindex attribute (W2264)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the first tile-eta chip without a `tabindex` attribute", async () => {
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

    // Core assertion: the chip carries no `tabindex` attribute. Using
    // `hasAttribute` (rather than checking `tabIndex === -1`) catches
    // both the missing-attr case and any explicit value (0, -1, "")
    // that would alter focus traversal in the lobby grid.
    const first = etaChips[0]!;
    expect(first.hasAttribute("tabindex")).toBe(false);
  });
});
