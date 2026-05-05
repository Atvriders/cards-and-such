import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1662: StatsPage's `stats-this-week` card renders a prior-week baseline
 * <ul data-testid="stats-prev-week"> whose first <li> row pairs a text
 * LABEL with a numeric VALUE. The label is rendered as
 *   <span className="stats-week-label">Prior plays</span>
 * — a <span> tagName that mirrors the current-week list's label markup
 * (W1582/W1587/W1592) and the prev-week value's <em> tagName (W1629).
 * The inline `<span>` keeps the label and value on the same baseline
 * inside the flex row layout; promoting the label to a block-level element
 * (<div>, <p>, <h3>) would break the row's horizontal alignment and shift
 * every value to a new line.
 *
 * Existing prev-week tests pin the testid, the <ul> tagName (W1605), the
 * BEM `--prev` modifier className (W1592), the parent `stats-card` class
 * (W1651), the row count (W1627), each row's label COPY
 * (W1606/W1614/W1621), each row's value <em> tagName
 * (W1629/W1635/W1643), and the first row's child count (W1647) — but
 * NONE lock the label element's tagName. Today the existing label-copy
 * tests reach the label via a `span.stats-week-label` selector, so the
 * `<span>` is required only as a side-effect of the selector; a regression
 * that swapped to `<div className="stats-week-label">` would still
 * preserve the className-based contract elsewhere on the page (HeatmapCat,
 * etc. don't share this class) but would silently break the comparison
 * card's row layout. This test pins the first prev-week row label's
 * tagName as "SPAN" via a class-only selector that doesn't pre-filter on
 * tag, so the assertion fails loudly if the element is promoted.
 */
describe("StatsPage stats-this-week — prev-week first row label tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1662: stats-prev-week first <li> label uses <span> tagName", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const prior = within(card).getByTestId("stats-prev-week");
    const firstRow = prior.querySelector("li");
    expect(firstRow).not.toBeNull();
    // Use a class-only selector (no tag prefix) so the assertion truly
    // exercises the element's tagName rather than re-asserting what the
    // selector already required.
    const label = firstRow!.querySelector(".stats-week-label");
    expect(label).not.toBeNull();
    // The element using the stats-week-label hook must be a <span>, not a
    // <div> / <p> / <h3> / <strong>. This locks the inline-baseline label
    // markup that pairs the prior-week label with its <em> value on a
    // single flex row.
    expect(label!.tagName).toBe("SPAN");
  });
});
