import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2076 — pin the absence of the `id` attribute on the lobby tile's
 * `tile-difficulty-<id>` chip span.
 *
 * Each tile renders the difficulty chip at LobbyPage.tsx ~L2743:
 *
 *   <span
 *     className={`tile-chip tile-chip-diff tile-chip-diff-${difficulty}`}
 *     data-testid={`tile-difficulty-${gameId}`}
 *     aria-label={`Difficulty: ${difficulty}`}
 *     title={`Difficulty: ${difficulty}`}
 *   >
 *
 * Because every lobby tile clones this chip (one per game), introducing
 * an `id` attribute would emit duplicate IDs across the grid, violating
 * the HTML uniqueness invariant and breaking any `getElementById` /
 * hash-link lookups that share the namespace. The chip already carries
 * a stable `data-testid`, so an `id` here would also be redundant.
 *
 * Sibling tests pin tile-difficulty aria (W*), title (W*), tag (W*),
 * className (W1652), dot tag/aria, and dot count, but none assert the
 * `id` attribute is absent on the chip itself. Grepping
 * `Lobby*.test.tsx` for `tile-difficulty` paired with a `hasAttribute`
 * id assertion returns no matches, leaving this invariant unprotected.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) so it shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-difficulty chip has no id (W2076)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the tile-difficulty chip without an `id` attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount.
    await screen.findByPlaceholderText(/search/i);

    const chip = document.querySelector<HTMLElement>(
      '[data-testid^="tile-difficulty-"]',
    );
    expect(chip, "expected at least one tile-difficulty chip").not.toBeNull();
    expect(chip!.hasAttribute("id")).toBe(false);
  });
});
