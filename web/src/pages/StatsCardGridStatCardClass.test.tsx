import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1272: StatsPage's `stats-card-grid` section renders each summary tile as
 * a `<div className="stat-card" data-testid="stat-...">`. The `stat-card`
 * className is the load-bearing CSS hook that pins each tile's padding,
 * border, background, and grid-cell sizing. Existing tests cover the
 * section wrapper className (W1235), the testids, and the inner value
 * text content, but no test pins the `stat-card` className on an
 * individual card or asserts the card is a `<div>`. A regression that
 * renames or drops this class — e.g. during a styling refactor that
 * switches to `stats-tile` — would silently break the grid's visual
 * contract while every behavior/text test still passes.
 */
describe("StatsPage stats-card-grid — stat-card className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1272: stat-total-played tile carries the 'stat-card' className on a <div>", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stat-total-played");
    // Pin the load-bearing tile className hook.
    expect(card.className).toContain("stat-card");
    // Sanity: the card is rendered as a <div> (not a section/article).
    expect(card.tagName).toBe("DIV");
  });
});
