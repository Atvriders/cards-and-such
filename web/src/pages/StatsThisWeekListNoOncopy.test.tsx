import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3161: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The `oncopy`
 * attribute is a legacy inline event handler that fires when content within an
 * element is copied to the clipboard. Attaching it via markup would execute
 * arbitrary string-evaluated JavaScript and bypass React's synthetic event
 * system, making it both a CSP/security smell and a maintenance hazard for a
 * presentational weekly summary list. A wide array of other attribute absences
 * are already pinned on this ul (id, role, style, tabindex, ARIA, cite, etc.),
 * but no test pins `oncopy` absence on `stats-this-week-list`. Pinning it here
 * ensures any future change that accidentally attaches an inline oncopy
 * handler to this list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — oncopy attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3161: stats-this-week-list ul has no oncopy attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("oncopy")).toBe(false);
    expect(ul.getAttribute("oncopy")).toBeNull();
  });
});
