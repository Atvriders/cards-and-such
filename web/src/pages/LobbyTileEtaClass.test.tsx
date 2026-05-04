import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1550 — pin the `tile-chip-eta` className token on the lobby tile's
 * eta chip.
 *
 * The eta pill rendered by `TileMetaChips` (LobbyPage.tsx ~L2735)
 * carries two class tokens: the generic `tile-chip` (shared with the
 * difficulty chip) and the eta-specific `tile-chip-eta`. The latter is
 * the hook that LobbyPage.css uses to apply
 * `font-variant-numeric: tabular-nums` so the digit width stays stable
 * as the minutes label flips between values like "5m" / "10m" / "20m".
 * Drop the modifier and the chip silently regresses to proportional
 * digits, jiggling the layout on filter changes.
 *
 * Sibling W1244 (LobbyTileEtaTitle) pins the `title` attribute. The
 * className token had no dedicated coverage — searching `Lobby*.test.tsx`
 * for the literal `tile-chip-eta` only matches comments referencing
 * `tile-eta-*` testids, never the className itself.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1244: shares the `src/pages/Lobby` vitest path filter
 * without colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-eta chip className token (W1550)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("tags every tile-eta chip with the `tile-chip-eta` modifier class", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    const etaChips = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-eta-"]',
    );
    expect(etaChips.length).toBeGreaterThan(0);

    // Every eta chip must carry both the shared `tile-chip` token and
    // the eta-specific `tile-chip-eta` token. classList.contains gives
    // a strict whole-token match (no false positives from substrings).
    for (const chip of Array.from(etaChips)) {
      expect(chip.classList.contains("tile-chip")).toBe(true);
      expect(chip.classList.contains("tile-chip-eta")).toBe(true);
    }
  });
});
