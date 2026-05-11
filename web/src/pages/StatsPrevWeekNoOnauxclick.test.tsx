import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3181: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onauxclick` content attribute
 * registers an inline event handler that fires for non-primary pointer button
 * activations (typically middle-click). On this presentational summary list
 * there is no interactive contract — clicks, middle-clicks, and other auxiliary
 * pointer events should pass through to the document/browser defaults without
 * any inline handler intercepting them. Sibling tests already pin the absence
 * of `cite`, `id`, `role`, `style`, `tabindex`, `is`, and a broad array of
 * ARIA / global attributes on this <ul>, but none pin the absence of
 * `onauxclick`. Pinning it here ensures any future change that accidentally
 * attaches an inline auxiliary-click handler to this list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onauxclick attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3181: stats-prev-week ul has no onauxclick attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onauxclick")).toBe(false);
    expect(ul.getAttribute("onauxclick")).toBeNull();
  });
});
