import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is a
 * presentational <ul> with className "stats-week-list stats-week-list--prev".
 * The `onmouseleave` inline event handler attribute attaches a JavaScript
 * handler that fires when the pointer leaves the element. On a static summary
 * list this would be both an unwanted behavioral hook and a potential XSS sink
 * if ever populated from user data, and it would bypass React's synthetic
 * event system entirely. Sibling tests already pin the absence of many other
 * attributes on this <ul>; pinning the absence of `onmouseleave` here ensures
 * any future change that accidentally attaches an inline mouseleave handler
 * to this presentational list is reviewed deliberately rather than slipping
 * in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onmouseleave attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onmouseleave attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmouseleave")).toBe(false);
    expect(ul.getAttribute("onmouseleave")).toBeNull();
  });
});
