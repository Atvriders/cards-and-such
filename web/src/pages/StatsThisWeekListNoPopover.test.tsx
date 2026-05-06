import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2849: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is rendered as a plain <ul> with
 * className "stats-week-list". It is a presentational summary list of
 * three rows (Plays / Wins / Avg time) — it is NOT a top-layer popover
 * surface.
 *
 * The HTML `popover` global attribute (Popover API) promotes an element
 * to the top layer and gives it light-dismiss / invoker semantics
 * (`popover="auto"` or `popover="manual"`). Applying it to this <ul>
 * would turn the in-flow week summary into an initially-hidden top-layer
 * element, breaking the section's static rendering and tab order.
 *
 * Existing pins for this <ul> already cover the tagName (W1318), exact
 * className (W1361/W1768), absence of `id` (W1986), `role` (W1816),
 * inline `style` (W2118), `tabindex` (W2268), `aria-label` (W2468),
 * `aria-labelledby` (W2492), `aria-modal` (W2780), and a long list of
 * other ARIA / global attributes. The `popover` attribute absence is
 * NOT yet pinned anywhere in the Stats suite.
 *
 * Pinning the absence of `popover` ensures any future refactor that
 * accidentally promotes this list into the top layer (e.g. via a
 * careless prop spread, copy-paste from a tooltip/popover component,
 * or framework defaults) will be caught immediately.
 */
describe("StatsPage stats-this-week-list ul — popover attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2849: stats-this-week-list <ul> has no popover attribute", () => {
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
    expect(list.hasAttribute("popover")).toBe(false);
    expect(list.getAttribute("popover")).toBeNull();
  });
});
