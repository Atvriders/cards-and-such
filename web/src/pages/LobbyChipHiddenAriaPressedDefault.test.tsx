import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2501 — the LobbyPage `chip-hidden` Chip <button> MUST render with
 * `aria-pressed="false"` on initial mount. The default lobby filter is
 * "all" (LobbyPage.tsx — `filter` state initialised from
 * `cards-lobby-filter` in localStorage, falling back to "all" when no
 * persisted value exists), and the Chip helper at LobbyPage.tsx ~L2651
 * wires `aria-pressed={active}` where `active = filter === "hidden"`:
 *
 *     <Chip
 *       active={filter === "hidden"}
 *       onClick={() => setFilter("hidden")}
 *       count={hiddenCount}
 *       testId="chip-hidden"
 *       glyph="◌"
 *     >Hidden</Chip>
 *
 *     // Chip helper (~L2651-2666):
 *     <button
 *       type="button"
 *       role="tab"
 *       aria-selected={active}
 *       aria-pressed={active}
 *       …
 *     >…</button>
 *
 * On a clean mount with no persisted filter, `active` evaluates to
 * `false`, so React must serialise `aria-pressed="false"` on the
 * chip-hidden button. This pin closes the following regression class:
 *
 *   1. A refactor that drops the `aria-pressed` binding entirely and
 *      relies on `aria-selected` alone — screen readers using toggle
 *      semantics (NVDA's button mode, VoiceOver Quick Nav) would lose
 *      the announced "off" state.
 *   2. A refactor that flips the default JSX literal to
 *      `aria-pressed="true"` (e.g. inverting the `active` boolean by
 *      mistake) — sighted users would see the chip un-highlighted while
 *      AT users would hear "pressed", a silent a11y desync.
 *   3. A refactor that switches the binding to `aria-pressed={active ||
 *      undefined}` — React would omit the attribute on the inactive
 *      branch, breaking the contract that toggle buttons MUST always
 *      surface their state (WAI-ARIA Authoring Practices §3.5).
 *
 * Sibling pins on `chip-hidden` already cover OTHER attributes but NOT
 * the initial-render aria-pressed value:
 *   - W2466 / LobbyChipHiddenNoId pins the absence of an `id` attr.
 *   - W1962 / LobbyChipTag pins `tagName === "BUTTON"`.
 *   - W1194 / LobbyHiddenChipBadgeZero pins the count badge text "0".
 *   - W1458 / LobbyChipHiddenGlyphAria pins the "◌" glyph + aria-hidden.
 *   - LobbyPageHide.test.tsx (~L176) pins aria-pressed flipping to
 *     "true" AFTER a click on the chip — but does NOT pin the initial
 *     "false" value before any user interaction.
 *   - LobbyPage.test.tsx (~L2131, ~L2183) pins the same default-false /
 *     click-true contract on chip-solitaire and chip-recently-played,
 *     but neither covers chip-hidden specifically.
 *
 * The default-false branch on chip-hidden is the load-bearing one: a
 * regression that flipped the default to "true" would cause the lobby
 * to mount with the Hidden filter announced as active to AT users
 * even though the grid renders the "all" pool — exactly the silent
 * a11y desync class W2501 closes.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx)
 * mirrors the W2466 / W1458 / W1194 sibling pattern so the test
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-hidden aria-pressed default on initial render (W2501)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders chip-hidden with aria-pressed=\"false\" on a fresh mount", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-hidden");

    // Sanity: confirm we pinned the actual chip-hidden <button>
    // wrapper and not a child span. A future refactor that moved the
    // testid down onto an inner span would itself be a regression and
    // is caught by W2466 / LobbyChipHiddenNoId, but we belt-and-
    // suspenders it here so a passing assertion below cannot be a
    // false positive sourced from the wrong DOM node.
    expect(chip.tagName).toBe("BUTTON");

    // The contract pin: aria-pressed MUST be the literal string
    // "false" — present, not omitted, and not "true". `getAttribute`
    // returns the serialised attribute value (or null if absent), so
    // the strict-equality check captures all three failure modes
    // enumerated in the file header at once.
    expect(chip.getAttribute("aria-pressed")).toBe("false");
  });
});
