import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2853: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is rendered as a plain <ul> with
 * className "stats-week-list". It is a presentational summary list of
 * three rows (Plays / Wins / Avg time) — it is NOT a popover invoker.
 *
 * The HTML `popovertarget` attribute (Popover API) wires an invoker
 * element up to a target popover by id, so that activating the invoker
 * shows / hides / toggles the target popover in the top layer. The
 * attribute is only meaningful on form-associated invoker elements
 * (typically <button>, <input type="button">), and assigning it to a
 * <ul> is invalid: it would either be silently ignored or, in
 * future-spec evolutions, interfere with implicit invoker behavior.
 *
 * Existing pins for this <ul> already cover the tagName (W1318), exact
 * className (W1361/W1768), absence of `id` (W1986), `role` (W1816),
 * inline `style` (W2118), `tabindex` (W2268), `aria-label` (W2468),
 * `aria-labelledby` (W2492), `aria-modal` (W2780), and the global
 * `popover` attribute (W2849). The `popovertarget` attribute absence
 * is NOT yet pinned anywhere in the Stats suite.
 *
 * Pinning the absence of `popovertarget` ensures any future refactor
 * that accidentally turns this list into a popover invoker (e.g. via a
 * careless prop spread, copy-paste from a tooltip/menu component, or
 * misuse of the Popover API) will be caught immediately.
 */
describe("StatsPage stats-this-week-list ul — popovertarget attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2853: stats-this-week-list <ul> has no popovertarget attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    expect(list.tagName).toBe("UL");
    expect(list.hasAttribute("popovertarget")).toBe(false);
    expect(list.getAttribute("popovertarget")).toBeNull();
  });
});
