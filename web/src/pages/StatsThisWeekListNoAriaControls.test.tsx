import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2646: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is rendered as a plain,
 * presentational <ul> with className "stats-week-list" and three
 * read-only summary rows (Plays / Wins / Avg time). It is not a
 * disclosure trigger, tab, combobox, or any other widget that owns a
 * controlled region, so it does — and should — not carry an
 * `aria-controls` attribute. Sibling pins already cover the absence of
 * `aria-label` (W2468), `aria-labelledby` (W2498), `id` (W1986), `role`
 * (W1816), inline `style` (W2118), and `tabindex` (W2268) on this same
 * ul, but no existing test pins the absence of `aria-controls`. Adding
 * an `aria-controls` reference would (a) imply an interactive
 * owner→controlled relationship that does not exist for this static
 * summary list, (b) likely point at a non-existent or stale element id,
 * producing an authoring-time accessibility defect, and (c) diverge
 * from the matching prior-week list (W2641 pins the same absence
 * there). Pinning the absence of `aria-controls` ensures any future
 * refactor that attempts to wire this <ul> as a controller for another
 * region is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — aria-controls attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2646: stats-this-week-list <ul> has no aria-controls attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    expect(list.tagName).toBe("UL");
    expect(list.hasAttribute("aria-controls")).toBe(false);
    expect(list.getAttribute("aria-controls")).toBeNull();
  });
});
