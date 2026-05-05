import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2373: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev" and contains three read-only
 * summary rows (Prior plays / Prior wins / Prior avg time). Each row's
 * meaning is carried by an inline <span class="stats-week-label"> child,
 * so the list itself does not — and should not — carry an `aria-label`
 * override. Sibling pins already cover the absence of `id`, `role`,
 * `style`, and `tabindex`, plus the exact class string and child counts,
 * but no existing test pins the absence of an `aria-label` attribute on
 * this <ul>. Adding an `aria-label` would (a) introduce an authored
 * accessible name that could drift from the visible per-row labels, and
 * (b) silently change the screen-reader announcement contract for this
 * presentational list. Pinning the absence of `aria-label` ensures any
 * future refactor that attempts to attach an authored name to the list
 * is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — aria-label attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2373: stats-prev-week ul has no aria-label attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-label")).toBe(false);
    expect(ul.getAttribute("aria-label")).toBeNull();
  });
});
