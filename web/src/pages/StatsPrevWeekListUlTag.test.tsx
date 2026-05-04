import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1605: StatsPage's `stats-this-week` card renders its prior-week metric
 * rows inside a <ul className="stats-week-list stats-week-list--prev"
 * data-testid="stats-prev-week">. The <ul> tag is load-bearing semantics —
 * it tells assistive tech that the prior plays/wins/avg-time rows form an
 * unordered list of peer baseline metrics (not a ranked list via <ol>, not
 * a generic stack of <div>s).
 *
 * Existing prev-week tests pin the testid, the modifier class (W1592), and
 * walk the <li> children, but none lock the host element's tagName. A
 * regression that swaps the <ul> for an <ol> (implying ranking of the
 * baseline rows) or a <div> (losing list semantics entirely) would still
 * satisfy every existing assertion. This test pins the actual tagName of
 * the prior-week wrapper, distinct from the W1318 lock on the current-week
 * list and the W1592 lock on the modifier class.
 */
describe("StatsPage stats-this-week — prev-week list <ul> tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1605: stats-prev-week is rendered as a <ul> element", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const prior = within(card).getByTestId("stats-prev-week");
    // Pin the load-bearing tag — <ul>, not <ol>/<div>.
    expect(prior.tagName).toBe("UL");
  });
});
