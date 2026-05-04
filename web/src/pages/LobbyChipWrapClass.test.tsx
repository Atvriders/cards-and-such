import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1501 — the lobby Chip BUTTON wrapper renders with the exact `lobby-chip`
 * className token. The Chip helper (LobbyPage.tsx ~L2651-2666) emits:
 *
 *     <button
 *       type="button"
 *       role="tab"
 *       aria-selected={active}
 *       aria-pressed={active}
 *       className={`lobby-chip${active ? " is-active" : ""}`}
 *       …
 *
 * That base `lobby-chip` token is the styling anchor for the entire chip
 * strip — padding, pill rounding, focus ring, the `:hover` lift, and the
 * `.lobby-chip.is-active` modifier rule all key off of it.
 *
 * Why this needs its own pin:
 *  - LobbyPage.test.tsx (W608/W2415) checks `aria-pressed`, role="tab",
 *    and the `is-active` modifier via `className.toContain("is-active")`,
 *    but `toContain` would still pass if the base token were renamed to,
 *    say, `chip lobby-pill is-active` (substring match on "is-active").
 *  - Sibling tests in this directory pin the chip-strip wrapper
 *    (`.lobby-chips-wrap` — W1286) and the inner badge/glyph tokens
 *    (`.lobby-chip-count`, `.lobby-chip-glyph`), but NONE assert the
 *    wrapper button's exact `lobby-chip` token via `classList.contains`.
 *  - A regression that renamed the base class (e.g. to `lobby-chip-pill`
 *    while leaving the inner spans untouched) would silently break the
 *    chip styling without tripping any existing test.
 *
 * Using `classList.contains` (exact list-token match, not substring)
 * gives us a regression-proof pin that ignores the conditional
 * `is-active` modifier. We resolve the chip via its stable
 * `data-testid="chip-all"` so the test is robust against translation
 * key changes.
 */
describe("LobbyPage — chip wrapper className token (W1501)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the chip-all button with classList token "lobby-chip"', () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // The "All" chip is unconditionally rendered (it has no per-category
    // visibility gating) so it's the safest anchor across viewports.
    const chip = document.querySelector<HTMLElement>(
      '[data-testid="chip-all"]',
    );
    expect(chip).not.toBeNull();
    // Sanity-check we resolved the actual button wrapper, not a child
    // span — the Chip helper emits a <button> for keyboard accessibility.
    expect(chip!.tagName).toBe("BUTTON");

    // classList.contains performs an exact whitespace-delimited token
    // match, so this assertion fails if a refactor renames the base
    // class even when the conditional `is-active` modifier survives
    // (which `className.toContain("lobby-chip")` would happily ignore
    // because every child also has a `lobby-chip-…` substring).
    expect(chip!.classList.contains("lobby-chip")).toBe(true);
  });
});
