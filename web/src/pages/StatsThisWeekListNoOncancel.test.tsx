import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3245: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `oncancel`
 * event-handler attribute is associated with the `cancel` event fired by <dialog>
 * and <input type="file"> elements, where it is invoked when the user dismisses
 * the dialog or file picker. On a <ul> the attribute has no defined behaviour,
 * but if present it would still be parsed as an inline event handler string and
 * compiled into a function at attribute-set time, creating an unnecessary script
 * surface and potential CSP violation. The sibling `stats-prev-week` ul has many
 * inline-handler absences pinned, and this `stats-this-week-list` ul has a wide
 * array of other inline-handler absences pinned (onclick, onload, onerror,
 * onsubmit, etc.), but no test pins `oncancel` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches an `oncancel` handler to this presentational weekly
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — oncancel attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3245: stats-this-week-list ul has no oncancel attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("oncancel")).toBe(false);
    expect(ul.getAttribute("oncancel")).toBeNull();
  });
});
