import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2498: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is rendered as a plain <ul> with
 * className "stats-week-list" and contains three summary rows
 * (Plays / Wins / Avg time). The list itself carries no authored
 * accessible name — the per-row meaning is carried by inline
 * <span class="stats-week-label"> children. Existing pins already cover
 * the <ul> tagName (W1318), exact className (W1361/W1768), absence of
 * `id` (W1986), `role` (W1816), inline `style` (W2118), `tabindex`
 * (W2268), and `aria-label` (W2468), plus child / label / value counts
 * (W1747/W1758/W1949). However, no existing test pins the absence of
 * `aria-labelledby` on this <ul>. `aria-labelledby` would point the
 * accessible name at another DOM node (e.g. the sibling <h2>This week</h2>
 * heading), which would (a) silently couple the list's accessible name
 * to an unrelated element's id, (b) change the screen-reader
 * announcement contract for this presentational list, and (c) diverge
 * from the matching prior-week list. Pinning the absence of
 * `aria-labelledby` ensures any future refactor that attempts to attach
 * a labelledby reference is reviewed deliberately rather than slipping
 * in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — aria-labelledby attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2498: stats-this-week-list <ul> has no aria-labelledby attribute", () => {
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
    expect(list.hasAttribute("aria-labelledby")).toBe(false);
    expect(list.getAttribute("aria-labelledby")).toBeNull();
  });
});
