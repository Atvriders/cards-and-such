import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";
import { getEta } from "../games/etaTable.js";

/**
 * W2311 — pin the EXACT `title` attribute string on a lobby tile-eta
 * chip, not just the prefix.
 *
 * `TileMetaChips` (LobbyPage.tsx ~L2735) renders
 *
 *   <span
 *     className="tile-chip tile-chip-eta"
 *     data-testid={`tile-eta-${gameId}`}
 *     title={`Estimated playtime: ${eta.label}`}
 *   >…</span>
 *
 * Sibling test W1244 (LobbyTileEtaTitle) only asserts the title
 * matches the regex `/^Estimated playtime: \S.*$/` — that lets a
 * regression slip through if e.g. a stray space, trailing colon, or
 * truncated label ("Estimated playtime: 5") were introduced. The
 * full title string (prefix, separator, AND eta-label payload) is
 * product-visible chrome surfaced as the hover tooltip and to
 * assistive tech that reads tooltips, so its exact value is worth
 * pinning.
 *
 * Approach: pick the first rendered tile-eta chip, parse its game id
 * from its `data-testid`, derive the canonical title from
 * `etaTable.getEta(...)`, and assert string equality. This is
 * resilient to lobby-ordering changes (no hard-coded id) while still
 * being a strict equality assertion against the format string.
 *
 * Lives in a NEW SIBLING file (rather than appending to
 * LobbyTileEtaTitle.test.tsx) per the same rationale as the W2196 /
 * W2075 / W1609 splits: shares the `src/pages/Lobby` vitest path
 * filter without colliding with concurrent edits to the mega-file or
 * any sibling tile-eta test.
 */
describe("LobbyPage — tile-eta chip title attribute exact equality (W2311)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the first tile-eta chip with title === `Estimated playtime: ${eta.label}`", async () => {
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

    const first = etaChips[0]!;
    const testid = first.getAttribute("data-testid");
    expect(testid).not.toBeNull();
    // `tile-eta-<gameId>` — split off the prefix to recover the id.
    const gameId = testid!.replace(/^tile-eta-/, "");
    expect(gameId.length).toBeGreaterThan(0);

    const expected = `Estimated playtime: ${getEta(gameId).label}`;
    expect(first.getAttribute("title")).toBe(expected);
  });
});
