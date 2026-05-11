import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3173: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `onwheel`
 * attribute would attach an inline wheel event handler to the element, which is
 * both an inline event-handler footgun (CSP, double-binding with React synthetic
 * events) and a behavioral surprise for a presentational summary list that has
 * no reason to react to wheel input directly. Many other attribute absences are
 * already pinned on this ul (id, role, style, tabindex, ARIA, cite, etc.), but
 * no test pins `onwheel` absence on `stats-this-week-list`. Pinning it here
 * ensures any future change that accidentally attaches an inline `onwheel`
 * handler to this list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onwheel attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3173: stats-this-week-list ul has no onwheel attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onwheel")).toBe(false);
    expect(ul.getAttribute("onwheel")).toBeNull();
  });
});
