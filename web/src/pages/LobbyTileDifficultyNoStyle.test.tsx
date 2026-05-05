import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2147 — pin the absence of the inline `style` attribute on the lobby
 * tile's `tile-difficulty-<id>` chip span.
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
 * The chip is purely class-driven — visual styling lives in the
 * `tile-chip-diff` / `tile-chip-diff-<difficulty>` CSS rules. Adding an
 * inline `style` attribute would override theme tokens, defeat dark-mode
 * cascading, and split the styling source-of-truth between TSX and CSS.
 *
 * Sibling tests pin tile-difficulty aria, title, tag, className, dot
 * tag/aria, dot count, and absence of an `id`, but none assert the
 * `style` attribute is absent on the chip itself. Grepping
 * `Lobby*.test.tsx` for `tile-difficulty` paired with `style` returns no
 * matches, leaving this invariant unprotected.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) so it shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-difficulty chip has no style attribute (W2147)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the tile-difficulty chip without an inline `style` attribute", async () => {
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
    expect(chip!.hasAttribute("style")).toBe(false);
  });
});
