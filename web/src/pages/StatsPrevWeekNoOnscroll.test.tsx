import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3175: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onscroll` attribute is an
 * inline event handler that, when present in HTML, executes arbitrary
 * JavaScript when the element fires a scroll event. Inline event handler
 * attributes are a known XSS surface and bypass React's synthetic event
 * system entirely. On a presentational summary <ul> there is no legitimate
 * reason to attach an `onscroll` handler via attribute — React would use
 * the JSX `onScroll` prop, which is wired through the synthetic event
 * system and does not appear as an `onscroll` DOM attribute. Pinning the
 * absence here ensures any future change that accidentally serializes an
 * `onscroll=` attribute onto this list is caught immediately.
 */
describe("StatsPage stats-prev-week ul — onscroll attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3175: stats-prev-week ul has no onscroll attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onscroll")).toBe(false);
    expect(ul.getAttribute("onscroll")).toBeNull();
  });
});
