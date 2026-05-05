import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1688: StatsPage's `stats-this-week` card renders a prior-week baseline
 * <ul data-testid="stats-prev-week"> whose THIRD <li> row pairs the text
 * label "Prior avg time" with a formatted VALUE. The label is rendered as
 *   <span className="stats-week-label">Prior avg time</span>
 * — a <span> tagName that mirrors the first prev-week row's label markup
 * (W1662), the second prev-week row's label markup (W1678), the
 * current-week list's label markup (W1582/W1587/W1592), and the
 * prev-week value's <em> tagName (W1643). The inline `<span>` keeps the
 * avg-time label and value on the same baseline inside the flex row
 * layout; promoting the label to a block-level element (<div>, <p>,
 * <h3>) would break the row's horizontal alignment and shift the
 * avg-time value onto a new line, desynchronizing the comparison card
 * visually.
 *
 * Existing prev-week tests pin the testid, the <ul> tagName (W1605), the
 * BEM `--prev` modifier className (W1592), the parent `stats-card` class
 * (W1651), the row count (W1627), each row's label COPY
 * (W1606/W1614/W1621), each row's value <em> tagName
 * (W1629/W1635/W1643), the first row's child count (W1647), the FIRST
 * row label tagName (W1662), and the SECOND row label tagName (W1678) —
 * but NONE lock the THIRD row label element's tagName. The existing
 * W1621 third-row label-copy test reaches the label via a
 * `span.stats-week-label` selector, so the `<span>` is required only as
 * a side-effect of the selector; a regression that swapped to
 * `<div className="stats-week-label">Prior avg time</div>` would still
 * preserve the className-based contract while silently breaking the
 * comparison card's row layout. This test pins the third prev-week row
 * label's tagName as "SPAN" via a class-only selector that doesn't
 * pre-filter on tag, so the assertion fails loudly if the element is
 * promoted.
 */
describe("StatsPage stats-this-week — prev-week third row label tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1688: stats-prev-week third <li> label uses <span> tagName", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const prior = within(card).getByTestId("stats-prev-week");
    const rows = prior.querySelectorAll("li");
    expect(rows.length).toBeGreaterThanOrEqual(3);
    const thirdRow = rows[2];
    expect(thirdRow).toBeDefined();
    // Use a class-only selector (no tag prefix) so the assertion truly
    // exercises the element's tagName rather than re-asserting what the
    // selector already required.
    const label = thirdRow!.querySelector(".stats-week-label");
    expect(label).not.toBeNull();
    // The element using the stats-week-label hook must be a <span>, not a
    // <div> / <p> / <h3> / <strong>. This locks the inline-baseline label
    // markup that pairs the prior avg-time label with its <em> value on
    // a single flex row.
    expect(label!.tagName).toBe("SPAN");
  });
});
