import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2695 — the LobbyPage `chip-board` Chip <button> MUST NOT carry a
 * `value` attribute. The Chip helper (LobbyPage.tsx ~L2651-2666) emits
 * its <button> wrapper without any `value` prop, and that omission is
 * load-bearing:
 *
 *   1. `value` on a <button> is only meaningful inside a <form> (it is
 *      submitted as the chosen button's value). The lobby category
 *      chips are filter triggers, not form controls — adding `value`
 *      would silently turn each chip into form-submission payload data
 *      if a future refactor wrapped the chip strip in a <form>, which
 *      would change network behaviour without any visible UI change.
 *   2. A `value` attribute also alters the `HTMLButtonElement.value`
 *      DOM property, which automated harnesses (Playwright, RTL
 *      `toHaveValue`) treat as a stable identifier. Pinning its
 *      absence prevents an undeclared identifier surface from
 *      accreting on the chip.
 *   3. The peer per-category chips (chip-all, chip-arcade, chip-cards,
 *      chip-dice, chip-solitaire, etc.) are all expected to share the
 *      same minimal attribute footprint; a regression that added
 *      `value={cat}` only on the dynamic `CATEGORY_ORDER.map` branch
 *      (LobbyPage.tsx ~L1964) would slip past chip-all's pins unless
 *      each per-category chip is independently pinned.
 *
 * Sibling pins on `chip-board` already in the suite cover OTHER
 * attributes but NOT the `value` absence:
 *   - W2495 / LobbyChipBoardNoId pins `id`-absence on chip-board.
 *   - W2473 / LobbyChipBoardType pins the explicit `type="button"`.
 *   - W1962 / LobbyChipTag pins `tagName === "BUTTON"`.
 *   - LobbyChipBoardNoName pins `name`-absence on chip-board.
 *   - LobbyChipBoardNoForm pins `form`-absence on chip-board.
 *
 * Resolves the chip via its stable `data-testid="chip-board"`
 * (rendered through `testId={`chip-${cat}`}` at LobbyPage.tsx ~L1970)
 * so the assertion is locale-independent and immune to translation-key
 * changes.
 */
describe("LobbyPage — chip-board button has no value attribute (W2695)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-board <button> does NOT carry a value attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-board");

    // Sanity: confirm we pinned the actual chip-board <button> wrapper
    // and not a child span. If a future refactor moved the testid down
    // onto an inner span the wrong element could pass this assertion
    // trivially (spans never get a `value` attribute).
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `value` attribute on chip-board. Use
    // `hasAttribute` rather than checking for an empty string — a
    // `value=""` is still a (broken) public surface that form-encoding
    // and `HTMLButtonElement.value` consumers would observe, and
    // `getAttribute("value")` returning "" would silently pass a
    // `.toBeFalsy()` style assertion.
    expect(chip.hasAttribute("value")).toBe(false);
  });
});
