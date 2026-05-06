import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2892: StatsPage's this-week <ul data-testid="stats-this-week-list">
 * must not carry the legacy `rev` attribute. `rev` was an obsolete HTML4
 * attribute on <a>/<link> describing a reverse-link relationship and is
 * not valid on <ul>; modern HTML5 dropped it entirely. Existing
 * this-week list tests pin the absence of `role`, `href`, `target`,
 * `rel`, `popover`, ARIA properties, and global attributes
 * (W1816/W1806/W1806-family/W2884) but none lock out `rev` specifically.
 * A regression that copies anchor markup into the list wrapper (e.g. a
 * mis-applied `<ul rev="prev">` for some new "previous week" link
 * pattern) would silently introduce an obsolete attribute while
 * satisfying every existing assertion. Mirrors the rev-absence guard
 * already pinned for the prev-week sibling list (StatsPrevWeekNoRev).
 */
describe("StatsPage stats-this-week — this-week list rev attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2892: stats-this-week-list <ul> has no rev attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    // `rev` is an obsolete HTML4 attribute and must not appear on the list.
    expect(list.hasAttribute("rev")).toBe(false);
    expect(list.getAttribute("rev")).toBeNull();
  });
});
