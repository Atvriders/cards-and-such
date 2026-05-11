import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1635: StatsPage's `stats-this-week` card renders a prior-week baseline
 * <ul data-testid="stats-prev-week"> whose second <li> row shows the
 * baseline wins count. The numeric VALUE in that row is rendered inside
 * an <em className="stats-week-value"> element — the <em> tagName mirrors
 * the current-week list's value styling so the baseline wins number
 * visually aligns beneath its live counterpart and inherits the same
 * italic emphasis treatment from the shared CSS hook.
 *
 * Existing prev-week tests pin the testid, the <ul> tagName (W1605), the
 * BEM `--prev` modifier className (W1592), the exact row count (W1627),
 * each row's label copy (W1606/W1614/W1621), and the FIRST row's value
 * tagName (W1629), but none lock the SECOND row's value element tagName.
 * A regression that swapped just the wins-row <em> for <span>, <strong>,
 * <b>, or a plain text node — while leaving the plays row intact — would
 * still satisfy every existing assertion while breaking the italicized
 * emphasis treatment specifically on the wins baseline. This test pins
 * the second prev-week row value's tagName as "EM".
 */
describe("StatsPage stats-this-week — prev-week second row value tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1635: stats-prev-week second <li> value uses <em> tagName", () => {
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
    expect(rows.length).toBeGreaterThanOrEqual(2);
    const secondRow = rows[1];
    expect(secondRow).not.toBeUndefined();
    const value = secondRow!.querySelector(".stats-week-value");
    expect(value).not.toBeNull();
    // The element using the stats-week-value hook on the wins baseline
    // row must be an <em>, not <span> / <strong> / <b> / <div>. This
    // locks the italicized-emphasis visual treatment that pairs the
    // baseline wins value with its live counterpart in the current-week
    // list.
    expect(value!.tagName).toBe("EM");
  });
});
