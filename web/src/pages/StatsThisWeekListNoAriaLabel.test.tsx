import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2468: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is rendered as a plain <ul> with
 * className "stats-week-list" and contains three summary rows
 * (Plays / Wins / Avg time). Each row's meaning is carried by an inline
 * <span class="stats-week-label"> child, so the list itself does not —
 * and should not — carry an authored `aria-label` override. Existing
 * pins already cover the <ul> tagName (W1318), the exact className
 * (W1361/W1768), the absence of `id` (W1986), `role` (W1816), inline
 * `style` (W2118), and `tabindex` (W2268), plus child / label / value
 * counts (W1747/W1758/W1949). The matching prior-week list has its
 * aria-label absence pinned via W2373, but no existing test pins the
 * absence of an `aria-label` attribute on the THIS-week <ul>. Adding an
 * `aria-label` would (a) introduce an authored accessible name that
 * could drift from the visible per-row labels, (b) silently change the
 * screen-reader announcement contract for this presentational list, and
 * (c) diverge from the sibling prev-week list contract. Pinning the
 * absence of `aria-label` ensures any future refactor that attempts to
 * attach an authored name to the list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — aria-label attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2468: stats-this-week-list <ul> has no aria-label attribute", () => {
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
    expect(list.hasAttribute("aria-label")).toBe(false);
    expect(list.getAttribute("aria-label")).toBeNull();
  });
});
