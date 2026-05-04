import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1599 — pin the SPAN tagName of the OUTER lobby tile difficulty chip
 * rendered by `TileMetaChips` (LobbyPage.tsx ~L2743):
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
 * The outer chip MUST stay a phrasing-content `<span>`. It is a sibling
 * of the `<span>` eta chip inside the `.tile-chips` flex container;
 * a refactor that reaches for `<div>` / `<button>` / `<a>` would either
 * trigger a "block inside inline" hydration warning, hijack tile click
 * semantics (the whole tile is the click target), or reflow the chip
 * into a block layout that distorts the at-a-glance pill row.
 *
 * Sibling W1478 (LobbyTileDiffAria) pins the chip's `aria-label`.
 * Sibling W1511 (LobbyTileDiffDots) pins the inner dot fill count.
 * Sibling W1537 (LobbyTileDiffTitle) pins the chip's `title`.
 * Sibling W1577 (LobbyTileDiffDotAria) pins the per-dot
 * `aria-hidden="true"`.
 * Sibling W1588 (LobbyTileDiffDotTag) pins the INNER `.tile-chip-dot`
 * tagName — but NOT the outer wrapper. Grepping
 * `web/src/pages/Lobby*.test.tsx` for `tile-difficulty.*tagName` (and
 * vice-versa) returns zero hits, so the outer element type is unpinned
 * in executable assertions.
 *
 * Lives in a NEW SIBLING file per the same rationale as the other
 * W1478/W1511/W1537/W1577/W1588 sibling tests: shares the
 * `src/pages/LobbyTileDiff` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-chip-diff outer tagName (W1599)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile-difficulty chip outer wrapper as a SPAN element", async () => {
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

    // The assertion must hold for EVERY chip — a refactor that swaps a
    // single tile's wrapper to a `<div>` would otherwise slip through.
    for (const chip of Array.from(diffChips)) {
      expect(chip.tagName).toBe("SPAN");
    }
  });
});
