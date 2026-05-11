import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3314: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onbeforematch` event handler attribute relates to the experimental
 * `beforematch` event fired on hidden=until-found content when the browser is
 * about to reveal it (find-in-page / scroll-to-text-fragment). On a
 * presentational weekly summary list with no `hidden="until-found"` content
 * inside it, attaching an `onbeforematch` handler would be meaningless and
 * would inject script-like attribute surface into the DOM. A wide array of
 * other this-week-list attribute absences are pinned (id, role, style,
 * tabindex, ARIA, cite, etc.), but no test pins `onbeforematch` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches an `onbeforematch` handler to this presentational ul
 * is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onbeforematch attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3314: stats-this-week-list ul has no onbeforematch attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforematch")).toBe(false);
    expect(ul.getAttribute("onbeforematch")).toBeNull();
  });
});
