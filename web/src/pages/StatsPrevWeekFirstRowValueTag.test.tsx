import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1629: StatsPage's `stats-this-week` card renders a prior-week baseline
 * <ul data-testid="stats-prev-week"> whose first <li> row shows the
 * baseline plays count. The numeric VALUE in that row is rendered inside
 * an <em className="stats-week-value"> element — the <em> tagName mirrors
 * the current-week list's value styling (W1583/W1588/W1593) so the
 * baseline numbers visually align beneath their live counterparts and
 * inherit the same emphasis treatment from the shared CSS hook.
 *
 * Existing prev-week tests pin the testid, the <ul> tagName (W1605), the
 * BEM `--prev` modifier className (W1592), the exact row count (W1627),
 * and each row's label copy (W1606/W1614/W1621), but NONE lock the value
 * element's tagName. A regression that swapped <em> for <span>, <strong>,
 * or a plain text node would still satisfy every existing assertion
 * while breaking the italicized-value visual treatment used to highlight
 * baseline numbers in the comparison card. This test pins the first
 * prev-week row value's tagName as "EM".
 */
describe("StatsPage stats-this-week — prev-week first row value tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1629: stats-prev-week first <li> value uses <em> tagName", () => {
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
    const value = firstRow!.querySelector(".stats-week-value");
    expect(value).not.toBeNull();
    // The element using the stats-week-value hook must be an <em>, not a
    // <span> / <strong> / <b> / <div>. This locks the italicized-emphasis
    // visual treatment that pairs the baseline value with its live
    // counterpart in the current-week list.
    expect(value!.tagName).toBe("EM");
  });
});
