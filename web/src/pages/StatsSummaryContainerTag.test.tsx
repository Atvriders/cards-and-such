import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1850 — Sibling-test partner to W1641 (records-card tagName=DIV) and
 * W1235 (stats-card-grid wrapper tagName=SECTION). The Activity card is
 * the top summary section of the stats page — it wraps the `.stats-summary`
 * grid of headline counters (games played, total wins, total hints/undos,
 * total time, sessions) plus the line chart, and is the visual entry point
 * to the page. Existing tests pin (a) the card's data-testid + classList
 * containing `stats-card` (W1235's grid-membership branch at line 1941),
 * (b) the parent SECTION wrapper's tag (W1235), and (c) the h2 nesting
 * relationship (W1263), but NOTHING pins the `stats-activity` element's
 * own tagName. A refactor that swapped the card from `<div>` to
 * `<section>`/`<article>`/`<aside>` would silently change the page's
 * implicit landmark/role topology — `<section>` and `<article>` create
 * implicit ARIA regions that screen readers expose as separate landmarks,
 * `<aside>` becomes a "complementary" landmark — re-routing focus order
 * and announcement behaviour without tripping any current assertion. The
 * `.stats-card-grid > div` CSS selector and the page's flat semantic
 * structure (only the outer SECTION should be a landmark, cards are
 * presentational divs) both depend on this remaining a plain DIV. Pin
 * the tagName so a tag swap fails loudly.
 */
describe("StatsPage Activity (top summary) container tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1850: stats-activity top-summary card is a DIV (not a section/article/aside)", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const activity = screen.getByTestId("stats-activity");
    expect(activity.tagName).toBe("DIV");
  });
});
