import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onmozanimationstart` attribute
 * is a legacy Mozilla-specific inline event handler that fires when a CSS
 * animation begins on the element. It has been superseded by the standard
 * `onanimationstart` attribute and is not part of any current web standard.
 * Pinning its absence on this presentational summary list ensures that any
 * future change that accidentally attaches a Mozilla-prefixed animation start
 * handler to this <ul> is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-prev-week ul — onmozanimationstart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onmozanimationstart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmozanimationstart")).toBe(false);
    expect(ul.getAttribute("onmozanimationstart")).toBeNull();
  });
});
