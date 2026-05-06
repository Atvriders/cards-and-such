import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2855: StatsPage's `data-testid="stats-prev-week"` `<ul>` — the prior-week
 * comparison list rendered immediately after the current-week stats list
 * inside the weekly-stats card — carries NO `popovertarget` attribute.
 *
 * Background: `popovertarget` is part of the HTML Popover API and is only
 * meaningful on button-like invokers (`<button>`, `<input type="button">`).
 * It tells the browser that activating that control should toggle, show, or
 * hide the popover element whose id matches the attribute's value. Placing
 * `popovertarget` on a non-invoker element such as a `<ul>` is semantically
 * meaningless: browsers will not wire up popover invocation, the attribute
 * will not surface in any accessibility tree, and the element will not
 * become focusable or activatable as a result. Worse, a stray
 * `popovertarget` on the prior-week list could:
 *   1. Mislead future maintainers into thinking the list participates in a
 *      popover relationship that does not actually exist.
 *   2. Collide with a later refactor that introduces a real popover with the
 *      same id, accidentally promoting the `<ul>` into an invoker-shaped
 *      contract that no test currently guards against.
 *   3. Show up in DOM snapshots / a11y audits as a noisy unknown attribute
 *      on a presentational list.
 *
 * The prior-week `<ul>` is purely a static comparison list of three `<li>`
 * rows (Prior plays / Prior wins / Prior avg time) — it has no interactive
 * behavior, no popover relationship, and should remain a plain unadorned
 * list element. This pin uses `hasAttribute` so even an empty
 * `popovertarget=""` (which still flags the element to the popover
 * machinery) would be caught.
 */
describe("StatsPage stats-prev-week — popovertarget attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2855: stats-prev-week ul has no popovertarget attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const prevWeek = screen.getByTestId("stats-prev-week");
    expect(prevWeek).not.toBeNull();

    // Sanity: confirm we pinned the prior-week list itself (a `<ul>`), not
    // some descendant — `popovertarget` semantics differ wildly between
    // `<ul>` (meaningless / wrong) and a hypothetical `<button>` child
    // (meaningful invoker).
    expect(prevWeek.tagName).toBe("UL");
    expect(prevWeek.classList.contains("stats-week-list")).toBe(true);
    expect(prevWeek.classList.contains("stats-week-list--prev")).toBe(true);

    // The actual contract: the prior-week list MUST NOT carry a
    // `popovertarget` attribute. Use `hasAttribute` rather than a
    // value-equality check so an empty `popovertarget=""` (still a
    // popover-machinery signal) would also fail this pin.
    expect(prevWeek.hasAttribute("popovertarget")).toBe(false);
  });
});
