import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1694: StatsPage's `stats-this-week` card renders the current-week
 * <ul data-testid="stats-this-week-list"> whose first <li> row pairs a text
 * LABEL with a numeric VALUE. The label is rendered as
 *   <span className="stats-week-label">Plays</span>
 * — a <span> tagName that mirrors the prev-week list's first-row label
 * markup (W1662) and the current-week value's <em> tagName (W1281).
 * The inline `<span>` keeps the label and value on the same baseline
 * inside the flex row layout; promoting the label to a block-level element
 * (<div>, <p>, <h3>) would break the row's horizontal alignment and shift
 * every value to a new line.
 *
 * Existing this-week tests pin the testid, the <ul> tagName (W1605-equiv),
 * the parent `stats-card` class, the row count, the first row's child
 * count, the value <em> tagName, and the label className via a
 * tag-prefixed `span.stats-week-label` selector (W1298) — but that
 * selector silently re-asserts what it already filtered on. A regression
 * that swapped to `<div className="stats-week-label">` would still match
 * any class-only contract elsewhere on the page (HeatmapCat etc. don't
 * share this class) but would silently break the current-week card's row
 * layout. This test pins the first this-week row label's tagName as
 * "SPAN" via a class-only selector that doesn't pre-filter on tag, so the
 * assertion fails loudly if the element is promoted.
 */
describe("StatsPage stats-this-week — this-week first row label tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1694: stats-this-week-list first <li> label uses <span> tagName", () => {
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
    // Use a class-only selector (no tag prefix) so the assertion truly
    // exercises the element's tagName rather than re-asserting what the
    // selector already required.
    const label = firstRow!.querySelector(".stats-week-label");
    expect(label).not.toBeNull();
    // The element using the stats-week-label hook must be a <span>, not a
    // <div> / <p> / <h3> / <strong>. This locks the inline-baseline label
    // markup that pairs the current-week label with its <em> value on a
    // single flex row.
    expect(label!.tagName).toBe("SPAN");
  });
});
