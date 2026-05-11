import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3187: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `ondragstart` attribute is
 * an inline event handler that fires when the user begins dragging an element.
 * This presentational summary list does not participate in any drag-and-drop
 * interaction, and attaching an inline `ondragstart` handler would execute
 * attribute-sourced JavaScript outside of React's synthetic event system,
 * bypass Content Security Policy script-src protections, and create a footgun
 * for future refactors. Sibling tests already pin the absence of `id`, `role`,
 * `style`, `tabindex`, `is`, `cite`, `ondrag`, and a broad array of ARIA /
 * global attributes on this <ul>, but none pin the absence of `ondragstart`.
 * Pinning it here ensures any future change that accidentally attaches an
 * inline `ondragstart` handler to this list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — ondragstart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3187: stats-prev-week ul has no ondragstart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ondragstart")).toBe(false);
    expect(ul.getAttribute("ondragstart")).toBeNull();
  });
});
