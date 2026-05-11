import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3169: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `oninput` attribute is an
 * inline event handler that, when set via markup, executes its string value as
 * JavaScript whenever the element (or a descendant form control) fires an
 * `input` event. Allowing it to slip onto this presentational summary list
 * would create a script-injection sink and bypass React's synthetic event
 * system, hurting auditability. Sibling tests already pin the absence of many
 * inline handlers and global attributes on this <ul>, but none specifically
 * pin the absence of `oninput`. Pinning it here ensures any future change that
 * accidentally attaches an `oninput` handler to this list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — oninput attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3169: stats-prev-week ul has no oninput attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("oninput")).toBe(false);
    expect(ul.getAttribute("oninput")).toBeNull();
  });
});
