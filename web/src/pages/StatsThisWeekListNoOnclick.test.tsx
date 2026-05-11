import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3153: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain presentational <ul>. The HTML `onclick` attribute would
 * attach an inline event handler string evaluated as JavaScript, which is both a
 * code-injection / CSP foot-gun and a maintenance hazard — React event handlers
 * should be wired through props (e.g. onClick) so they participate in synthetic
 * event delegation, not serialized into the DOM. The sibling `stats-prev-week`
 * ul and many other attribute absences on `stats-this-week-list` (id, role,
 * style, tabindex, ARIA, cite, etc.) are already pinned, but no test pins
 * `onclick` absence on `stats-this-week-list`. Pinning it here ensures any
 * future change that accidentally attaches an inline `onclick=` handler to this
 * presentational weekly summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onclick attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3153: stats-this-week-list ul has no onclick attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onclick")).toBe(false);
    expect(ul.getAttribute("onclick")).toBeNull();
  });
});
