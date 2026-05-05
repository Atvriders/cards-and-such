import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2075 — pin that the per-tile `tile-chip-eta` chip rendered by
 * `TileMetaChips` (LobbyPage.tsx ~L2735) carries NO `id` attribute.
 *
 *   <span
 *     className="tile-chip tile-chip-eta"
 *     data-testid={`tile-eta-${gameId}`}            <-- testid hook only
 *     title={`Estimated playtime: ${eta.label}`}
 *   >…</span>
 *
 * The eta chip is a presentational sibling of the difficulty chip
 * inside `.tile-chips`. Every solo-card tile renders its own copy, so
 * attaching an `id` would either (a) collide across tiles producing
 * duplicate-id document warnings, or (b) leak a stable hook that
 * external code could couple to. Sibling tests already pin the chip's
 * tagName (W1609 LobbyTileEtaTag), className (W1550 LobbyTileEtaClass),
 * exact-class (LobbyTileEtaClassExact), label-class (W1564
 * LobbyTileEtaLabelClass), title attribute (W1244 LobbyTileEtaTitle),
 * and inner-glyph aria-hidden (W1748 LobbyTileEtaGlyphAria), but NONE
 * of those exercise the `id` attribute — grepping
 * `web/src/pages/Lobby*.test.tsx` for `tile-eta` together with
 * `hasAttribute("id")` / `getAttribute("id")` returns zero hits, so a
 * silent regression that added e.g. `id="tile-eta"` would still pass
 * every existing assertion while breaking the no-document-id-collision
 * invariant.
 *
 * Lives in a NEW SIBLING file (rather than appending to an existing
 * tile-eta test) per the same rationale as the W2073 / W1670 / W1609
 * splits: shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to the mega-file or to any sibling
 * tile-eta test.
 */
describe("LobbyPage — tile-chip-eta has no id attribute (W2075)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the first tile-eta chip without an `id` attribute", async () => {
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

    // Core assertion: the chip carries no `id` attribute. Using
    // `hasAttribute` (rather than just checking `chip.id === ""`)
    // catches both the missing-attr and explicit-empty-string cases
    // while still failing if any non-empty id is added.
    const first = etaChips[0]!;
    expect(first.hasAttribute("id")).toBe(false);
  });
});
