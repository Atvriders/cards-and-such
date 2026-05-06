import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2885: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is rendered as a plain <ul> with
 * className "stats-week-list". It is a presentational summary list of
 * three rows (Plays / Wins / Avg time) — it is NOT a hyperlink, form
 * action target, or browsing-context navigation element.
 *
 * The HTML `target` attribute is meaningful on <a>, <area>, <base>,
 * <form>, and <button type="submit"> elements: it specifies the
 * browsing context (e.g. _blank, _self, _parent, _top, or a named
 * frame) that should receive the navigation/submission. On a <ul>
 * element the attribute has no defined semantics — it is silently
 * ignored by browsers, but its presence would suggest the list is an
 * actionable navigation surface (which it is not) and could mislead
 * future maintainers, accessibility tooling, or static analyzers.
 *
 * Existing pins for this <ul> already cover the tagName (W1318), exact
 * className (W1361/W1768), absence of `id` (W1986), `role` (W1816),
 * inline `style` (W2118), `tabindex` (W2268), `aria-label` (W2468),
 * `aria-labelledby` (W2492), `aria-modal` (W2780), the global
 * `popover` attribute (W2849), and the `popovertarget` attribute
 * (W2853). The plain `target` attribute absence is NOT yet pinned
 * anywhere in the Stats suite.
 *
 * Pinning the absence of `target` ensures any future refactor that
 * accidentally turns this list into a navigation invoker (e.g. via a
 * careless prop spread from an anchor/form helper, or misuse of a
 * routing component) will be caught immediately.
 */
describe("StatsPage stats-this-week-list ul — target attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2885: stats-this-week-list <ul> has no target attribute", () => {
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
    expect(list.hasAttribute("target")).toBe(false);
    expect(list.getAttribute("target")).toBeNull();
  });
});
