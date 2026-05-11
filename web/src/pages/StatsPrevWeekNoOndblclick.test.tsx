import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3178: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `ondblclick` attribute is an
 * inline event handler that would execute arbitrary JavaScript when the user
 * double-clicks the element. Sibling tests already pin the absence of `id`,
 * `role`, `style`, `tabindex`, `is`, `cite`, and a broad array of ARIA /
 * global attributes on this <ul>, but none pin the absence of `ondblclick`.
 * Pinning it here ensures any future change that accidentally attaches an
 * inline double-click handler — which would bypass React's synthetic event
 * system, evade CSP controls, and create an XSS sink — is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — ondblclick attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3178: stats-prev-week ul has no ondblclick attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ondblclick")).toBe(false);
    expect(ul.getAttribute("ondblclick")).toBeNull();
  });
});
