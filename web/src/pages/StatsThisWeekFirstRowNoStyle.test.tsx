import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2499: StatsPage's `stats-this-week` card renders the current-week summary
 * <ul data-testid="stats-this-week-list"> whose three <li> rows are bare
 * list items with NO presentation attributes — neither class (pinned by
 * W1789), nor id (W2480), nor inline style. Existing first-row tests pin
 * the tagName as LI (W1781), the absence of a class attribute (W1789), the
 * exact element-child count of three (W1656), the inner label tag as SPAN
 * (W1607), and the absence of an id (W2480). The parent <ul>'s no-style
 * invariant is pinned by W2118, but NONE of those assertions inspect
 * whether the first <li> wrapper itself carries an inline `style`
 * attribute.
 *
 * A regression that added `style="border-top: 1px solid var(--rule)"` (for
 * example, while introducing a row-level highlight or a divider hack on
 * the first row only) would silently satisfy every existing this-week
 * assertion while raising CSS specificity above the stylesheet rules
 * backing `.stats-week-list` and coupling presentation to JS-side string
 * templating instead of the single CSS source of truth on the parent <ul>.
 * This test pins the FIRST this-week <li> (the "Plays" row) as having NO
 * inline `style` attribute, mirroring the no-style contract pinned for the
 * parent <ul> by W2118.
 */
describe("StatsPage stats-this-week — first <li> has no inline style", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2499: stats-this-week-list first <li> has no inline style attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    const firstRow = list.querySelector("li");
    expect(firstRow).not.toBeNull();
    expect(firstRow!.tagName).toBe("LI");
    // The first <li> wrapper must remain presentation-attribute-free: no
    // inline `style` attribute. All visual hooks live on the parent <ul>'s
    // `.stats-week-list` class and the inner SPAN/EM/SPAN children.
    expect(firstRow!.hasAttribute("style")).toBe(false);
    expect(firstRow!.getAttribute("style")).toBeNull();
  });
});
