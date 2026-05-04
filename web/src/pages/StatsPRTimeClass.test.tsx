import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1375: The "Personal records" stats card (data-testid
 * `stats-personal-records`) renders each best-times row as an <li> with
 * four spans: rank, title, time, and date. The third span carries the
 * `stats-pr-time` className, which the StatsPage.css uses to render the
 * formatted best-time in a bold accent color with tabular-nums so the
 * column aligns vertically across rows. Existing coverage of these rows
 * pins the rank span's class hook (W1308), the by-cat list class
 * (W1333), the by-cat subtitle (W1296) and the fresh-PR badge (W741),
 * but no test pins the time span's `stats-pr-time` class hook itself.
 * A regression that dropped that className (or renamed it to e.g.
 * `stats-pr-best`) would silently break the column's monospaced
 * alignment and accent color while every data-shape assertion stayed
 * green. Seed a single best-time of 90s so the first row formats as
 * "1m 30s", then assert the time span carries `stats-pr-time` and the
 * formatted text.
 */
describe("StatsPage — personal records row time class", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1375: stats-personal-records row 0 renders time span with stats-pr-time class and formatted '1m 30s' text", () => {
    localStorage.setItem(
      "cards-best-times",
      JSON.stringify({ klondike: 90 }),
    );

    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-personal-records");
    const row0 = within(card).getByTestId("stats-pr-row-0");
    // The time span is the row's third <span> child — pin its class
    // hook and the formatted "Mm Ss" text formatBestTime emits for 90s.
    const time = row0.querySelector("span.stats-pr-time");
    expect(time).not.toBeNull();
    expect(time?.tagName).toBe("SPAN");
    expect(time?.textContent).toBe("1m 30s");
  });
});
