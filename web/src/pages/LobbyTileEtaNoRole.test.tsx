import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2211 — pin that the per-tile `tile-chip-eta` chip rendered by
 * `TileMetaChips` (LobbyPage.tsx ~L2735) carries NO `role` attribute.
 *
 *   <span
 *     className="tile-chip tile-chip-eta"
 *     data-testid={`tile-eta-${gameId}`}
 *     title={`Estimated playtime: ${eta.label}`}
 *   >…</span>
 *
 * The eta chip is purely presentational — a `<span>` with class
 * tokens, a data-testid hook, and a `title` attribute. It deliberately
 * does NOT advertise an ARIA role: it is plain inline content with a
 * tooltip, not a semantic widget (button, status, tooltip, etc.).
 * Sibling tests already pin the chip's tagName (W1609 LobbyTileEtaTag),
 * className (W1550), exact-class (LobbyTileEtaClassExact), label-class
 * (W1564 LobbyTileEtaLabelClass), title attribute (W1244
 * LobbyTileEtaTitle), inner-glyph aria-hidden (W1748
 * LobbyTileEtaGlyphAria), absence of an `id` attribute (W2075
 * LobbyTileEtaNoId), and absence of a `style` attribute (W2157
 * LobbyTileEtaNoStyle), but NONE of those exercise the `role`
 * attribute — grepping `web/src/pages/Lobby*.test.tsx` for `tile-eta`
 * together with `role` returns zero hits, so a silent regression that
 * added e.g. `role="status"` (which would force every screen-reader
 * to announce the eta as a live region on every tile, polluting
 * lobby a11y) would still pass every existing assertion.
 *
 * Lives in a NEW SIBLING file (rather than appending to an existing
 * tile-eta test) per the same rationale as the W2075 / W2157 / W1609
 * splits: shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to the mega-file or to any sibling
 * tile-eta test.
 */
describe("LobbyPage — tile-chip-eta has no role attribute (W2211)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the first tile-eta chip without a `role` attribute", async () => {
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

    // Core assertion: the chip carries no `role` attribute. Using
    // `hasAttribute` (rather than reading `getAttribute("role")`)
    // catches both the missing-attr and explicit-empty-string cases
    // while still failing if any non-empty role is added.
    const first = etaChips[0]!;
    expect(first.hasAttribute("role")).toBe(false);
  });
});
