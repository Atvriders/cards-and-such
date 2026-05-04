import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1588 — pin the SPAN tagName of the inner `.tile-chip-dot` elements
 * inside the lobby tile's difficulty chip rendered by `TileMetaChips`
 * (LobbyPage.tsx ~L2749):
 *
 *   {[1, 2, 3].map((i) => (
 *     <span
 *       className={`tile-chip-dot${i <= dots ? " tile-chip-dot--on" : ""}`}
 *       aria-hidden="true"
 *     />
 *   ))}
 *
 * The dots MUST stay phrasing-content `<span>` elements — the outer
 * `.tile-chip-diff` is itself a `<span>` and the inline-flex chip
 * layout (and its CSS-only collapse on narrow viewports) assumes
 * inline children. A refactor that reaches for `<div>` or `<i>` would
 * either trigger a "div inside span" hydration warning or reflow the
 * chip into a block layout, distorting the at-a-glance pill.
 *
 * Sibling W1478 (LobbyTileDiffAria) pins the chip's outer `aria-label`.
 * Sibling W1511 (LobbyTileDiffDots) pins the dot count + filled-state
 * className. Sibling W1537 (LobbyTileDiffTitle) pins the chip's `title`.
 * Sibling W1577 (LobbyTileDiffDotAria) pins the per-dot
 * `aria-hidden="true"`. None of them inspect the dot's tagName —
 * grepping `web/src/pages/Lobby*.test.tsx` for `tile-chip-dot.*tagName`
 * (and `tagName.*tile-chip-dot`) returns zero hits, so the per-dot
 * element type is unpinned in executable assertions.
 *
 * Lives in a NEW SIBLING file per the same rationale as the other
 * W1478/W1511/W1537/W1577 sibling tests: shares the
 * `src/pages/LobbyTileDiff` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-chip-diff inner dot tagName (W1588)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every inner `.tile-chip-dot` as a SPAN element", async () => {
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

    // Collect every inner dot across every chip — the assertion must
    // hold for ALL dots, not just the first one (a refactor that
    // swaps just the trailing dot to a `<div>` would otherwise slip
    // through).
    let totalDots = 0;
    for (const chip of Array.from(diffChips)) {
      const dots = chip.querySelectorAll<HTMLElement>(".tile-chip-dot");
      expect(dots.length).toBe(3);
      for (const dot of Array.from(dots)) {
        expect(dot.tagName).toBe("SPAN");
      }
      totalDots += dots.length;
    }
    // Sanity floor: at minimum one chip × three dots.
    expect(totalDots).toBeGreaterThanOrEqual(3);
  });
});
