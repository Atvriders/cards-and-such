import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2704: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is a plain, fully-rendered <ul>
 * summarising the three read-only "this week" stats rows (plays / wins /
 * average time). The element is a semantically standard unordered list and
 * relies on its native ARIA role ("list") for assistive-technology
 * announcements. Sibling pins already cover the absence of `id`, `role`,
 * `style`, `tabindex`, `aria-label`, `aria-labelledby`, `aria-describedby`,
 * `aria-controls`, `aria-hidden`, and `aria-busy` on this same <ul>, but no
 * existing test pins the absence of an `aria-roledescription` attribute.
 * Adding `aria-roledescription` would override the screen-reader-spoken role
 * with a custom string (e.g. "weekly summary"), inconsistently re-labelling
 * a structure that the rest of the page exposes as an ordinary list and
 * potentially confusing assistive-technology users who rely on consistent
 * role announcements. Pinning the absence of `aria-roledescription` ensures
 * any future refactor that attempts to attach a custom role description to
 * this static summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — aria-roledescription attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2704: stats-this-week-list ul has no aria-roledescription attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-roledescription")).toBe(false);
    expect(ul.getAttribute("aria-roledescription")).toBeNull();
  });
});
