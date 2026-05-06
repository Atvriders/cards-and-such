import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2957: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `rows` attribute is
 * defined for the <textarea> element, where it specifies the visible number
 * of text lines for the control. It has no defined meaning on a <ul> and
 * would be silently ignored by browsers and assistive tech, but its presence
 * would falsely imply this list is a multi-line text input control — when in
 * fact it is a presentational summary list (Prior plays / Prior wins /
 * Prior avg time). Sibling contracts already pin the absence of many ARIA,
 * structural, table, and form-related attributes on this <ul>, but no
 * existing test pins the absence of `rows`. Pinning this absence prevents a
 * future refactor from accidentally adding a misplaced `rows` attribute that
 * would semantically misrepresent the list as a textarea-style control.
 */
describe("StatsPage stats-prev-week ul — rows attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2957: stats-prev-week ul has no rows attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("rows")).toBe(false);
    expect(ul.getAttribute("rows")).toBeNull();
  });
});
