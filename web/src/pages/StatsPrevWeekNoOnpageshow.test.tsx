import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3328: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onpageshow` attribute is a
 * window-level event handler attribute that fires when a session-history
 * entry's document is shown (e.g. forward/back-cache restore). Specifying it
 * on a <ul> would register an inline event handler attached at the document
 * level via HTMLBodyElement-style delegation, which is both semantically
 * meaningless on a presentational list and a known XSS / CSP-violation
 * vector when value strings are not sanitized. Sibling tests pin the absence
 * of many other attributes on this <ul>, but none pin the absence of
 * `onpageshow`. Pinning it here ensures any future change that accidentally
 * attaches an `onpageshow` handler to this presentational summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onpageshow attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3328: stats-prev-week ul has no onpageshow attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpageshow")).toBe(false);
    expect(ul.getAttribute("onpageshow")).toBeNull();
  });
});
