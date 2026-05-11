import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3184: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `ondrag` attribute is an
 * inline event handler that fires continuously while an element is being
 * dragged. This presentational summary list does not participate in any
 * drag-and-drop interaction, and attaching an inline `ondrag` handler would
 * execute attribute-sourced JavaScript outside of React's synthetic event
 * system, bypass Content Security Policy script-src protections, and create a
 * footgun for future refactors. Sibling tests already pin the absence of `id`,
 * `role`, `style`, `tabindex`, `is`, `cite`, and a broad array of ARIA /
 * global attributes on this <ul>, but none pin the absence of `ondrag`.
 * Pinning it here ensures any future change that accidentally attaches an
 * inline `ondrag` handler to this list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — ondrag attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3184: stats-prev-week ul has no ondrag attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ondrag")).toBe(false);
    expect(ul.getAttribute("ondrag")).toBeNull();
  });
});
