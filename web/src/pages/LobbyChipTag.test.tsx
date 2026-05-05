import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1962 — every category/status chip in the LobbyPage chip-strip MUST be
 * rendered as a `<button>` element. The `Chip` helper (LobbyPage.tsx
 * ~L2651-2666) emits exactly one button per chip:
 *
 *     <button
 *       type="button"
 *       role="tab"
 *       aria-selected={active}
 *       aria-pressed={active}
 *       className={`lobby-chip${active ? " is-active" : ""}`}
 *       onClick={onClick}
 *       data-testid={testId}
 *     >…</button>
 *
 * The `<button>` semantics are load-bearing for keyboard accessibility:
 * native Enter/Space activation, default focus ring participation, and
 * the implicit `tabindex=0` that drives the chip-strip's roving-focus
 * behaviour. A refactor that swapped the wrapper to a `<div role="tab">`
 * (per the W1894 tab-strip ARIA wiring) or to an `<a>` element would
 * silently drop those native interactions and force a hand-rolled
 * keydown handler — exactly the kind of subtle a11y regression that
 * passes every aria-* / class-token assertion already in this directory.
 *
 * Why this needs its OWN file (not folded into LobbyChipWrapClass /
 * LobbyChipType / LobbyPage.test.tsx):
 *  - W1501 (LobbyChipWrapClass.test.tsx) pins `tagName === "BUTTON"` on
 *    `chip-all` ONLY. Every other chip — chip-cards, chip-board,
 *    chip-dice, chip-arcade, chip-solitaire, chip-favorites,
 *    chip-recently-played, chip-top-rated, chip-hidden — has NO test
 *    that asserts `tagName === "BUTTON"` exactly. A regression that
 *    swapped just the per-category chips to `<div>` while leaving
 *    chip-all alone would slip through W1501.
 *  - W1258 (LobbyChipType.test.tsx) pins the `type="button"` *attribute*
 *    on chip-all, which is independent of the wrapper element type — a
 *    `<div type="button">` would still pass W1258's getAttribute check.
 *  - W608 / W267 / W2415 in LobbyPage.test.tsx exercise aria-pressed /
 *    aria-selected / role="tab" — none of those imply BUTTON; W1894
 *    explicitly notes the chip uses `role="tab"`, so role-based pins
 *    would NOT catch a `<div role="tab">` regression.
 *
 * Per W1958 abort note: the Chip uses `role="tab"` with aria-selected
 * AND aria-pressed in parallel, so role/ARIA assertions cannot stand in
 * for the underlying `tagName`. This pin is the missing link.
 *
 * We resolve each chip via its stable `data-testid="chip-*"` (the
 * testIds used by Chip in LobbyPage.tsx ~L1935-1972) so the test is
 * locale-independent and immune to translation-key changes.
 */
describe("LobbyPage — every chip wrapper is a <button> element (W1962)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // The full chip-strip per LobbyPage.tsx ~L1935-1972: status chips
  // (all/top-rated/favorites/recently-played/hidden) followed by the
  // per-category chips (cards/board/dice/arcade/solitaire). Order here
  // does NOT matter for the assertion — each chip is rendered through
  // the same `Chip` helper, so all must share the BUTTON tagName.
  const CHIP_TEST_IDS = [
    "chip-all",
    "chip-top-rated",
    "chip-favorites",
    "chip-recently-played",
    "chip-hidden",
    "chip-cards",
    "chip-board",
    "chip-dice",
    "chip-arcade",
    "chip-solitaire",
  ] as const;

  it("renders every chip-* testid with tagName exactly 'BUTTON'", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    for (const testId of CHIP_TEST_IDS) {
      const chip = screen.getByTestId(testId);
      // Exact equality (not toBeInstanceOf / not closest("button")) so
      // that a wrapper change to <div role="tab"><button>…</button></div>
      // — which would still satisfy any descendant button query — fails
      // this assertion. tagName is uppercased by the DOM regardless of
      // JSX casing, so "BUTTON" is the canonical comparand.
      expect(chip.tagName).toBe("BUTTON");
    }
  });
});
