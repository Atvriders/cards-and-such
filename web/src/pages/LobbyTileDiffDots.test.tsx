import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1511 — pin the inner-dot fill count on the lobby tile's
 * `tile-chip-diff` chip.
 *
 * `TileMetaChips` (LobbyPage.tsx ~L2743) renders the difficulty
 * chip as a 3-dot strip whose filled-dot count encodes the
 * difficulty level:
 *
 *   {[1, 2, 3].map((i) => (
 *     <span
 *       className={`tile-chip-dot${i <= dots ? " tile-chip-dot--on" : ""}`}
 *       aria-hidden="true"
 *     />
 *   ))}
 *
 *   easy   -> 1 filled
 *   medium -> 2 filled
 *   hard   -> 3 filled
 *
 * Sibling W1478 (LobbyTileDiffAria) pins the chip's
 * `aria-label="Difficulty: <level>"`. Sibling W1397
 * (LobbyTileChipsAria) pins the wrapping `.tile-chips`
 * `aria-hidden="false"`. Sibling W1244 (LobbyTileEtaTitle) pins
 * the eta chip's `title`. None of them inspect the inner dot
 * fill count — grepping `web/src/pages/Lobby*.test.tsx` for
 * `tile-chip-dot` returns zero hits, so the visual filled/empty
 * encoding is unpinned.
 *
 * Without this assertion, a refactor that always renders three
 * filled dots (or zero) would still satisfy the aria-label test
 * but visually erase the difficulty signal sighted users rely
 * on.
 *
 * Lives in a NEW SIBLING file per the same rationale as W1478 /
 * W1397: shares the `src/pages/LobbyTile` vitest path filter
 * without colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-chip-diff inner dot fill count (W1511)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders exactly 3 dots per chip, filled count matching the tile-chip-diff-<level> class", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    const diffChips = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-difficulty-"]',
    );
    expect(diffChips.length).toBeGreaterThan(0);

    // easy -> 1, medium -> 2, hard -> 3 (mirrors difficultyDots()
    // in src/games/etaTable.ts; that function has its own unit
    // tests — here we only pin the DOM rendering contract).
    const expectedFilled: Record<string, number> = {
      easy: 1,
      medium: 2,
      hard: 3,
    };

    for (const chip of Array.from(diffChips)) {
      // Every chip MUST render exactly three dot children.
      const allDots = chip.querySelectorAll<HTMLElement>(".tile-chip-dot");
      expect(allDots.length).toBe(3);

      // Identify the difficulty level from the chip's className.
      const cls = chip.className;
      const match = cls.match(/tile-chip-diff-(easy|medium|hard)\b/);
      expect(match).not.toBeNull();
      const level = match![1];

      // The filled-dot count MUST equal difficultyDots(level).
      const filled = chip.querySelectorAll<HTMLElement>(
        ".tile-chip-dot.tile-chip-dot--on",
      );
      expect(filled.length).toBe(expectedFilled[level]);
    }
  });
});
