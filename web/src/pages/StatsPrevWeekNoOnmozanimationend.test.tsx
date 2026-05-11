import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. `onmozanimationend` is a legacy Mozilla-prefixed
 * event handler attribute for CSS animation completion. It has no role on a
 * presentational summary list and, if present, would register an inline event
 * handler that could execute arbitrary script at animation end. Sibling tests
 * pin the absence of many global / ARIA / event-handler attributes on this
 * <ul>, but none pin the absence of `onmozanimationend`. Pinning it here
 * ensures any future change that attaches this handler to the list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onmozanimationend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onmozanimationend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmozanimationend")).toBe(false);
    expect(ul.getAttribute("onmozanimationend")).toBeNull();
  });
});
