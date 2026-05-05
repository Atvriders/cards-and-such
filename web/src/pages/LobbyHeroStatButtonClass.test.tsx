import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1879 — the per-category hero-stat button for the "cards" category in
 * the lobby's `.lobby-hero-stats` row carries the exact className
 * `"lobby-stat lobby-stat--cards"` on initial render, with no
 * `is-active` modifier (because the default filter is "all", not
 * "cards").
 *
 * Why this needs its own pin:
 *  - Existing Lobby coverage already pins the hero stats container
 *    aria-label (W1165) and the visible count/label spans inside the
 *    Solitaire tile (W1231), but no test pins the literal *className*
 *    string on a hero-stat category button. The className is built via
 *    a template literal that interpolates the category key and a
 *    conditional " is-active" suffix; a regression that drops the
 *    `lobby-stat--<cat>` modifier, reorders tokens, or accidentally
 *    appends an unconditional " is-active" would silently break the
 *    per-category accent styling (the `--stat-accent` custom property
 *    is keyed off `.lobby-stat--cards` in `LobbyPage.css`) without
 *    failing any existing assertion.
 *
 * Pinning the *cards* tile specifically (rather than the lead-off
 * Solitaire tile already covered structurally) protects the second
 * tile in `CATEGORY_ORDER` and exercises the same template-literal
 * branch with a different category key.
 *
 * Sibling-file placement keeps the test under the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to
 * LobbyPage.test.tsx.
 */
describe("LobbyPage — hero cards-category stat button className (W1879)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders .lobby-stat--cards with className exactly 'lobby-stat lobby-stat--cards'", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve the per-category button via its stable category-suffix
    // class so the lookup is independent of the className string we
    // are about to assert exact equality on.
    const btn = container.querySelector<HTMLButtonElement>(
      ".lobby-hero-stats .lobby-stat--cards",
    );
    expect(btn).not.toBeNull();

    // Pin the literal className string. With the default filter of
    // "all" (no persisted filter), the conditional " is-active"
    // suffix must NOT be present, leaving exactly the two stable
    // tokens emitted by the template literal.
    expect(btn!.className).toBe("lobby-stat lobby-stat--cards");
  });
});
