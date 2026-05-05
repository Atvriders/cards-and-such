import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2157 — pin that the per-tile `tile-chip-eta` chip rendered by
 * `TileMetaChips` (LobbyPage.tsx ~L2735) carries NO inline `style`
 * attribute.
 *
 *   <span
 *     className="tile-chip tile-chip-eta"
 *     data-testid={`tile-eta-${gameId}`}
 *     title={`Estimated playtime: ${eta.label}`}
 *   >…</span>
 *
 * The eta chip is purely presentational and styled exclusively via
 * its `tile-chip` / `tile-chip-eta` className tokens (covered by
 * W1550 LobbyTileEtaClass and LobbyTileEtaClassExact). Sibling tests
 * already pin the chip's tagName (W1609 LobbyTileEtaTag), className
 * (W1550), exact-class (LobbyTileEtaClassExact), label-class (W1564
 * LobbyTileEtaLabelClass), title attribute (W1244 LobbyTileEtaTitle),
 * inner-glyph aria-hidden (W1748 LobbyTileEtaGlyphAria), and absence
 * of an `id` attribute (W2075 LobbyTileEtaNoId), but NONE of those
 * exercise the `style` attribute — grepping
 * `web/src/pages/Lobby*.test.tsx` for `tile-eta` together with
 * `style` returns zero hits, so a silent regression that added e.g.
 * `style={{ color: "red" }}` would still pass every existing
 * assertion while leaking inline styling that bypasses the CSS
 * tokens used by the rest of the chip strip.
 *
 * Lives in a NEW SIBLING file (rather than appending to an existing
 * tile-eta test) per the same rationale as the W2075 / W1670 / W1609
 * splits: shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to the mega-file or to any sibling
 * tile-eta test.
 */
describe("LobbyPage — tile-chip-eta has no style attribute (W2157)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the first tile-eta chip without a `style` attribute", async () => {
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

    // Core assertion: the chip carries no inline `style` attribute.
    // Using `hasAttribute` (rather than checking `style.cssText`)
    // catches both the missing-attr and explicit-empty-string cases
    // while still failing if any non-empty style is added.
    const first = etaChips[0]!;
    expect(first.hasAttribute("style")).toBe(false);
  });
});
