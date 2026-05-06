import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2660: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is a plain, fully-rendered <ul>
 * summarising the three read-only "this week" stats rows (plays / wins /
 * average time). The data backing the list is derived synchronously from
 * localStorage during render — there is no async fetch, no suspense
 * boundary, and no loading state attached to this list. Sibling pins
 * already cover the absence of `id`, `role`, `style`, `tabindex`,
 * `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-controls`,
 * and `aria-hidden` on this same <ul>, but no existing test pins the
 * absence of an `aria-busy` attribute. Adding `aria-busy="true"` would
 * misleadingly signal to assistive technology that the list is still
 * loading or being updated, causing screen readers to announce stale or
 * incomplete content and to suppress live updates. Pinning the absence of
 * `aria-busy` ensures any future refactor that attempts to mark this
 * static summary list as busy is reviewed deliberately rather than
 * slipping in unnoticed. (The sibling stats-prev-week ul already has the
 * analogous pin under W2654; this completes the parity for the
 * stats-this-week-list ul.)
 */
describe("StatsPage stats-this-week-list ul — aria-busy attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2660: stats-this-week-list ul has no aria-busy attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-busy")).toBe(false);
    expect(ul.getAttribute("aria-busy")).toBeNull();
  });
});
