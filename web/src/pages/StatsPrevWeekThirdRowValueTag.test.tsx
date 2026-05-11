import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1643: StatsPage's `stats-this-week` card renders a prior-week baseline
 * <ul data-testid="stats-prev-week"> whose third <li> row shows the
 * baseline average-time figure. The formatted VALUE in that row is rendered
 * inside an <em className="stats-week-value"> element — the <em> tagName
 * mirrors the current-week list's value styling so the baseline avg-time
 * figure visually aligns beneath its live counterpart and inherits the
 * same italic emphasis treatment from the shared CSS hook.
 *
 * Existing prev-week tests pin the testid, the <ul> tagName (W1605), the
 * BEM `--prev` modifier className (W1592), the exact row count (W1627),
 * each row's label copy (W1606/W1614/W1621), and the FIRST and SECOND
 * rows' value tagNames (W1629/W1635), but none lock the THIRD row's value
 * element tagName. A regression that swapped just the avg-time-row <em>
 * for <span>, <strong>, <b>, or a plain text node — while leaving the
 * plays and wins rows intact — would still satisfy every existing
 * assertion while breaking the italicized emphasis treatment specifically
 * on the avg-time baseline. This test pins the third prev-week row
 * value's tagName as "EM".
 */
describe("StatsPage stats-this-week — prev-week third row value tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1643: stats-prev-week third <li> value uses <em> tagName", () => {
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
    expect(thirdRow).not.toBeUndefined();
    const value = thirdRow!.querySelector(".stats-week-value");
    expect(value).not.toBeNull();
    // The element using the stats-week-value hook on the avg-time baseline
    // row must be an <em>, not <span> / <strong> / <b> / <div>. This
    // locks the italicized-emphasis visual treatment that pairs the
    // baseline avg-time value with its live counterpart in the current-week
    // list.
    expect(value!.tagName).toBe("EM");
  });
});
