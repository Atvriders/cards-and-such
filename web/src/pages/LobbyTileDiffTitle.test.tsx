import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1537 — pin the `title` attribute of the lobby tile's difficulty chip.
 *
 * The compact tile-meta strip rendered by `TileMetaChips`
 * (LobbyPage.tsx ~L2743) renders the difficulty pill with both an
 * `aria-label` (for AT) and a `title` (for sighted hover-tooltip)
 * carrying the same human label:
 *
 *   <span
 *     className={`tile-chip tile-chip-diff tile-chip-diff-${difficulty}`}
 *     data-testid={`tile-difficulty-${gameId}`}
 *     aria-label={`Difficulty: ${difficulty}`}
 *     title={`Difficulty: ${difficulty}`}
 *   >
 *
 * The dots inside the chip are decorative (`aria-hidden="true"`) and
 * convey nothing on hover; the `title` is the ONLY surface that
 * announces "Difficulty: <level>" to sighted mouse users via the
 * native browser tooltip. A regression that drops the `title` (or
 * swaps it for the raw level / a duplicate of the label-less mins
 * string) would silently degrade the hover UX without breaking
 * layout or AT.
 *
 * Sibling W1478 (LobbyTileDiffAria) pins the chip's `aria-label`.
 * Sibling W1511 (LobbyTileDiffDots) pins the inner dot fill count.
 * Sibling W1244 (LobbyTileEtaTitle) pins the ETA chip's `title` —
 * but NOT the difficulty chip's. Grepping `web/src/pages/Lobby*.test.tsx`
 * for `Difficulty:` outside the W1478 docstring returns zero hits, so
 * the diff-chip `title` chrome is unpinned.
 *
 * Lives in a NEW SIBLING file per the same rationale as W1478 / W1511 /
 * W1244: shares the `src/pages/LobbyTile` vitest path filter without
 * colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-chip-diff title attribute (W1537)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders 'Difficulty: <level>' as the title on every tile-difficulty chip", async () => {
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

    // Every chip's title must start with the canonical prefix and
    // end with a non-empty difficulty token. The exact level string
    // ("easy" / "medium" / "hard") is owned by `getDifficulty` and
    // covered by its own unit tests; here we pin only the hover-chrome
    // surface separate from the AT-only `aria-label` pinned by W1478.
    for (const chip of Array.from(diffChips)) {
      const title = chip.getAttribute("title");
      expect(title).not.toBeNull();
      expect(title).toMatch(/^Difficulty: \S.+$/);
    }
  });
});
