import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2212 — pin the absence of the `role` attribute on the lobby tile's
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
 * The chip is a plain decorative `<span>` annotated with `aria-label` and
 * `title`. It is intentionally NOT given an explicit ARIA `role`: the
 * chip is not a button, status, img, meter, or any other interactive /
 * landmark element — adding a role would mislead assistive tech and
 * change the chip's accessibility semantics. Because the inner dots are
 * `aria-hidden="true"`, the span exposes only its `aria-label`, and an
 * explicit `role` here would either silence that label (e.g. `role=
 * "presentation"`) or imply interactive affordances the chip does not
 * support.
 *
 * Sibling tests pin tile-difficulty aria-label (W*), aria-hidden
 * absence, title (W*), tag (W*), id absence (W2076), inline-style
 * absence, className shape (W1652), and the dot tag/aria/count. None
 * of them assert the `role` attribute is absent on the chip itself.
 * Grepping `Lobby*.test.tsx` for `tile-difficulty` paired with `role`
 * returns no matches, leaving this invariant unprotected.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) so it shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-difficulty chip has no role (W2212)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the tile-difficulty chip without a `role` attribute", async () => {
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
    expect(chip!.hasAttribute("role")).toBe(false);
  });
});
