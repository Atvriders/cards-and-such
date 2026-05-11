import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3163: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `oncontextmenu` HTML attribute,
 * when present, registers an inline event handler that fires on right-click /
 * long-press, typically used to suppress or replace the browser's native
 * context menu. On a presentational summary <ul> it has no legitimate use:
 * the list is not interactive, has no associated menu, and any inline handler
 * would also constitute an inline-script vector that bypasses CSP and reduces
 * accessibility (right-click is an important escape hatch for many users).
 * Sibling tests already pin the absence of `id`, `role`, `style`, `tabindex`,
 * `is`, `cite`, and a broad array of ARIA / global attributes on this <ul>,
 * but none pin the absence of `oncontextmenu`. Pinning it here ensures any
 * future change that accidentally attaches an inline context-menu handler to
 * this list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — oncontextmenu attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3163: stats-prev-week ul has no oncontextmenu attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("oncontextmenu")).toBe(false);
    expect(ul.getAttribute("oncontextmenu")).toBeNull();
  });
});
