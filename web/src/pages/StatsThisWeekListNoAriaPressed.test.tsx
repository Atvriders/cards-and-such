import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2756: StatsPage's `data-testid="stats-this-week-list"` element — the
 * `<ul class="stats-week-list">` rendering the current week's Plays,
 * Wins, and Avg time entries with their delta indicators — carries NO
 * explicit `aria-pressed` attribute.
 *
 * `aria-pressed` is a state attribute that belongs on toggle buttons
 * (role="button"); placing it on a presentational <ul> would either be
 * silently ignored by some assistive technologies or — worse — promote
 * the list into a toggle-button-like control in screen readers that
 * surface the attribute regardless of role. Either outcome would
 * misrepresent the semantics of a static stats summary list.
 *
 * The this-week list is a plain, non-interactive presentation of the
 * current week's totals. It is not a button, not a toggle, and has no
 * pressed/unpressed state. Pin the absence of `aria-pressed` so a
 * future refactor cannot introduce a stray toggle-state attribute on
 * this purely presentational list. Using `hasAttribute` ensures even
 * an empty `aria-pressed=""` is caught — an empty string would itself
 * be interpreted as a state declaration by some ATs.
 */
describe("StatsPage stats-this-week-list — aria-pressed attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2756: stats-this-week-list ul has no aria-pressed attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const list = screen.getByTestId("stats-this-week-list");
    expect(list).not.toBeNull();

    // Sanity: confirm we pinned the actual <ul> and not a descendant —
    // aria-pressed semantics differ wildly between element types.
    expect(list.tagName).toBe("UL");
    expect(list.classList.contains("stats-week-list")).toBe(true);

    // The contract: no explicit `aria-pressed` attribute. Use
    // hasAttribute so an empty `aria-pressed=""` (which is itself a
    // meaningful state signal in some ATs) is also rejected.
    expect(list.hasAttribute("aria-pressed")).toBe(false);
  });
});
