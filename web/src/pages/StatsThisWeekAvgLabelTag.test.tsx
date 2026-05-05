import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1704: StatsPage's `stats-this-week` card renders the current-week
 * <ul data-testid="stats-this-week-list"> whose THIRD <li> row pairs the
 * text label "Avg time" with a numeric VALUE. The label is rendered as
 *   <span className="stats-week-label">Avg time</span>
 * — a <span> tagName that mirrors the current-week first row's label
 * markup (W1694), the current-week wins row's label markup (W1700), the
 * prev-week list's first/second/third row label markup
 * (W1662/W1678/W1688), and the current-week value's <em> tagName
 * (W1281). The inline `<span>` keeps the avg-time label and value on the
 * same baseline inside the flex row layout; promoting the label to a
 * block-level element (<div>, <p>, <h3>) would break the row's
 * horizontal alignment and shift the avg-time value onto a new line,
 * desynchronizing the comparison card visually.
 *
 * Existing this-week tests pin the testid, the <ul> tagName, the parent
 * `stats-card` class, the row count, the avg row's child count
 * (W1645-equiv), the avg value <em> tagName (W1518-adjacent), the avg
 * delta direction, and the avg label className via a tag-prefixed
 * `span.stats-week-label` selector (W1518) — but that selector silently
 * re-asserts what it already filtered on. A regression that swapped to
 * `<div className="stats-week-label">Avg time</div>` would still
 * preserve the className-based contract (the className-with-tag
 * selector would fail loudly only because of the prefix, not because
 * of an isolated tagName check) while silently breaking the row
 * layout. This test pins the third this-week row label's tagName as
 * "SPAN" via a class-only selector that doesn't pre-filter on tag, so
 * the assertion fails loudly if the element is promoted.
 */
describe("StatsPage stats-this-week — this-week avg row label tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1704: stats-this-week-list third <li> label uses <span> tagName", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    const rows = list.querySelectorAll("li");
    expect(rows.length).toBeGreaterThanOrEqual(3);
    const avgRow = rows[2];
    expect(avgRow).toBeDefined();
    // Use a class-only selector (no tag prefix) so the assertion truly
    // exercises the element's tagName rather than re-asserting what the
    // selector already required.
    const label = avgRow!.querySelector(".stats-week-label");
    expect(label).not.toBeNull();
    // The element using the stats-week-label hook must be a <span>, not a
    // <div> / <p> / <h3> / <strong>. This locks the inline-baseline label
    // markup that pairs the current-week avg-time label with its <em>
    // value on a single flex row.
    expect(label!.tagName).toBe("SPAN");
  });
});
