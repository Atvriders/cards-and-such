import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2643: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev" and contains three read-only
 * summary rows (Prior plays / Prior wins / Prior avg time). The list is a
 * visible, semantically meaningful summary block — it must remain exposed
 * to assistive technology. Sibling pins already cover the absence of `id`,
 * `role`, `style`, `tabindex`, `aria-label`, `aria-labelledby`,
 * `aria-describedby`, `aria-controls`, plus the exact class string and
 * child counts, but no existing test pins the absence of an `aria-hidden`
 * attribute on this <ul>. Adding `aria-hidden="true"` would silently strip
 * the entire prior-week summary from the screen-reader experience, hiding
 * three rows of user-facing stats. Pinning the absence of `aria-hidden`
 * ensures any future refactor that attempts to hide this list from
 * assistive technology is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-prev-week ul — aria-hidden attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2643: stats-prev-week ul has no aria-hidden attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-hidden")).toBe(false);
    expect(ul.getAttribute("aria-hidden")).toBeNull();
  });
});
