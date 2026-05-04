import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1244 — pin the `title` attribute of the lobby tile's eta chip.
 *
 * The compact tile-meta strip rendered by `TileMetaChips`
 * (LobbyPage.tsx ~L2728) shows a tiny clock-glyph + "<mins>m" pill so
 * sighted users can see at-a-glance how long a game takes. The pill's
 * label is intentionally compact (e.g. "8m" for a 5-10 min game), so a
 * verbose `title` ("Estimated playtime: 5-10 min") is what surfaces the
 * full label on hover and to assistive tech that reads tooltips. The
 * shape of that title string is product-visible chrome — a regression
 * that drops the prefix or swaps it for the raw label would silently
 * change what users see without breaking layout.
 *
 * Sibling W965 (LobbyTileRatingNone) covers the rating-widget render
 * gate. The eta-chip `title` had no dedicated coverage — searching for
 * `tile-eta` or "Estimated playtime" across `Lobby*.test.tsx` returns
 * nothing. This test pins the exact format string.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W874 / W908 / W932 / W951 / W965: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-eta chip title attribute (W1244)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders 'Estimated playtime: <label>' as the title on every tile-eta chip", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Every tile renders a `tile-eta-<id>` chip. Grab them all so the
    // assertion can't be defeated by an off-by-one tile-render path.
    const etaChips = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-eta-"]',
    );
    expect(etaChips.length).toBeGreaterThan(0);

    // Every chip's title must start with the canonical prefix and
    // include a non-empty label after the colon. The exact label
    // ("5 min", "<1 min", "5-10 min", "10-20 min") is owned by
    // etaTable.ts and exercised by its own unit tests; here we only
    // pin the chrome surface.
    for (const chip of Array.from(etaChips)) {
      const title = chip.getAttribute("title");
      expect(title).not.toBeNull();
      expect(title).toMatch(/^Estimated playtime: \S.*$/);
    }
  });
});
