import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1577 — pin `aria-hidden="true"` on the inner `.tile-chip-dot` spans
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
 * The dots are purely DECORATIVE — the outer chip carries
 * `aria-label="Difficulty: <level>"` (pinned by W1478) and that label
 * is the only thing AT users should hear. If the inner dots lose
 * `aria-hidden="true"`, screen readers would announce three empty
 * generic spans alongside the chip's accessible name, producing
 * confusing output like "Difficulty: medium, dimensionless, dimensionless,
 * dimensionless".
 *
 * Sibling W1478 (LobbyTileDiffAria) pins the chip's outer `aria-label`.
 * Sibling W1511 (LobbyTileDiffDots) pins the dot count + filled-state
 * className. Sibling W1537 (LobbyTileDiffTitle) pins the chip's `title`.
 * None of them inspect the per-dot `aria-hidden` attribute — grepping
 * `web/src/pages/Lobby*.test.tsx` for `aria-hidden.*tile-chip-dot` (and
 * vice-versa) returns only docstring mentions, so the attribute is
 * unpinned in executable assertions.
 *
 * Lives in a NEW SIBLING file per the same rationale as W1478/W1511/
 * W1537: shares the `src/pages/LobbyTileDiff` vitest path filter
 * without colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-chip-diff inner dot aria-hidden (W1577)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("marks every inner `.tile-chip-dot` span with aria-hidden='true'", async () => {
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
    // forgets aria-hidden on the trailing dots would otherwise slip
    // through).
    let totalDots = 0;
    for (const chip of Array.from(diffChips)) {
      const dots = chip.querySelectorAll<HTMLElement>(".tile-chip-dot");
      expect(dots.length).toBe(3);
      for (const dot of Array.from(dots)) {
        expect(dot.getAttribute("aria-hidden")).toBe("true");
      }
      totalDots += dots.length;
    }
    // Sanity floor: at minimum one chip × three dots.
    expect(totalDots).toBeGreaterThanOrEqual(3);
  });
});
