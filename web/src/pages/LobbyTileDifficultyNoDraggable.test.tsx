import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2385 — pin the absence of the `draggable` attribute on the lobby
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
 * The difficulty chip is a passive metadata badge — it MUST NOT
 * participate in HTML5 drag-and-drop. The lobby grid carries an
 * unrelated `tile-drag-handle-<id>` element that owns reorder gestures;
 * marking the difficulty chip `draggable` would create a competing drag
 * source, leak `dragstart` events to the tile reorder logic, and on
 * touch devices interfere with native long-press selection.
 *
 * Sibling tests pin tile-difficulty `aria-label` (W*), `title` (W*),
 * `tagName` (W*), exact `className` (W1652), absence of `id` (W2076),
 * `role` (W*), `style` (W2147), `tabindex` (W2265), and `aria-hidden`
 * (W2197), but none assert the `draggable` attribute is absent.
 * Grepping `web/src/pages/Lobby*.test.tsx` for `tile-difficulty` paired
 * with `draggable` returns zero hits, leaving this invariant
 * unprotected.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) so it shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-difficulty chip has no draggable (W2385)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the tile-difficulty chip without a `draggable` attribute", async () => {
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
    expect(chip!.hasAttribute("draggable")).toBe(false);
  });
});
