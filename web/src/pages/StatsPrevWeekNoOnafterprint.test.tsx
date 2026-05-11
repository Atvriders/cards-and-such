import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3307: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onafterprint` event handler
 * attribute is a window-level print lifecycle hook; it has no defined meaning
 * on a list element and, if present as a string attribute, would be parsed as
 * inline JavaScript by the browser when the document is printed. Sibling tests
 * already pin the absence of many global/ARIA attributes and a wide variety of
 * inline event handlers on this <ul>, but none pin the absence of
 * `onafterprint`. Pinning it here ensures any future change that accidentally
 * attaches an `onafterprint` handler string to this presentational summary
 * list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onafterprint attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3307: stats-prev-week ul has no onafterprint attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onafterprint")).toBe(false);
    expect(ul.getAttribute("onafterprint")).toBeNull();
  });
});
