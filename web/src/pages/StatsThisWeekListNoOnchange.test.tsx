import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3116: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `onchange`
 * attribute is an inline event handler intended for form controls such as
 * <input>, <select>, and <textarea>, where it fires when the value commits.
 * On a presentational <ul> there are no value semantics, so an `onchange`
 * attribute would be both meaningless and a potential inline-script vector
 * that bypasses React's synthetic event system. Many other attribute absences
 * are already pinned on this list (id, role, style, tabindex, ARIA, cite,
 * etc.), but no test currently pins the absence of the `onchange` inline
 * handler. Pinning it here ensures any future change that accidentally
 * attaches an `onchange="..."` string to this weekly summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3116: stats-this-week-list ul has no onchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onchange")).toBe(false);
    expect(ul.getAttribute("onchange")).toBeNull();
  });
});
