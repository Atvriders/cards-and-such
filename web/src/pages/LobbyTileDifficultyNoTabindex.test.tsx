import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2265 — pin the absence of the `tabindex` attribute on the lobby tile's
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
 * The chip is purely decorative metadata — it announces difficulty via
 * its `aria-label`/`title` but is not interactive. Adding a `tabindex`
 * here would inject every tile's difficulty chip into the keyboard tab
 * order, polluting focus traversal across the lobby grid and offering
 * no actionable behavior for keyboard users.
 *
 * Sibling tests pin tile-difficulty aria-hidden, no-id, no-style,
 * no-role, className, title, tag, dot tag/aria, and dot count, but
 * none assert the `tabindex` attribute is absent on the chip. Grepping
 * `Lobby*.test.tsx` for `tile-difficulty` paired with a `tabindex`
 * assertion returns no matches, leaving this invariant unprotected.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) so it shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-difficulty chip has no tabindex (W2265)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the tile-difficulty chip without a `tabindex` attribute", async () => {
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
    expect(chip!.hasAttribute("tabindex")).toBe(false);
  });
});
