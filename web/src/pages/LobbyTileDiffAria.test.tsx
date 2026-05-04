import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1478 — pin the `aria-label` attribute of the lobby tile's difficulty
 * chip. The compact tile-meta strip rendered by `TileMetaChips`
 * (LobbyPage.tsx ~L2743) renders a sibling difficulty pill next to the
 * eta chip:
 *
 *   <span
 *     className={`tile-chip tile-chip-diff tile-chip-diff-${difficulty}`}
 *     data-testid={`tile-difficulty-${gameId}`}
 *     aria-label={`Difficulty: ${difficulty}`}
 *     title={`Difficulty: ${difficulty}`}
 *   >
 *     {[1, 2, 3].map((i) => (
 *       <span className="tile-chip-dot…" aria-hidden="true" />
 *     ))}
 *   </span>
 *
 * The chip's only visible content is three decorative dots
 * (filled = harder), all `aria-hidden="true"`. Without the
 * `aria-label="Difficulty: <level>"`, AT users would hear nothing for
 * the chip — the dots are meaningless to a screen reader.
 *
 * Sibling W1244 (LobbyTileEtaTitle) pins the eta chip's `title`. Sibling
 * W1397 (LobbyTileChipsAria) pins the WRAPPING `.tile-chips`
 * `aria-hidden="false"` attribute. Sibling W965 (LobbyTileRatingNone)
 * pins the rating render-gate. None of them inspect the difficulty
 * chip's `aria-label` — and grepping `web/src/pages/*.test.tsx` for
 * `tile-difficulty-` / `tile-chip-diff` returns zero hits, so the
 * label string ("Difficulty: easy" / "medium" / "hard") is unpinned.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1244 / W1397 / W1473: shares the `src/pages/LobbyTile`
 * vitest path filter without colliding with concurrent edits to the
 * mega-file.
 */
describe("LobbyPage — tile-chip-diff aria-label (W1478)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders 'Difficulty: <level>' as the aria-label on every tile-difficulty chip", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Every tile renders a `tile-difficulty-<id>` chip. Grab them all so
    // the assertion can't be defeated by an off-by-one tile-render path.
    const diffChips = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-difficulty-"]',
    );
    expect(diffChips.length).toBeGreaterThan(0);

    // Every chip's aria-label must start with the canonical prefix and
    // end with a non-empty difficulty token. The exact level string
    // ("easy" / "medium" / "hard") is owned by `getDifficulty` and
    // covered by its own unit tests; here we pin only the AT chrome.
    for (const chip of Array.from(diffChips)) {
      const label = chip.getAttribute("aria-label");
      expect(label).not.toBeNull();
      expect(label).toMatch(/^Difficulty: \S.+$/);
    }
  });
});
