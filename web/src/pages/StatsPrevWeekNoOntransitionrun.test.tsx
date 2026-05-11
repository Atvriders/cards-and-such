import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `ontransitionrun` IDL/content
 * attribute is a global event handler attribute that fires at the start of a
 * CSS transition. This presentational summary list has no transition-driven
 * behavior, so any inline `ontransitionrun=` handler would represent either an
 * accidental leak from a refactor or a script-injection vector. Sibling tests
 * pin the absence of many other inline event handlers on this element; this
 * test pins the absence of `ontransitionrun` so that any future change which
 * accidentally attaches such a handler is reviewed deliberately.
 */
describe("StatsPage stats-prev-week ul — ontransitionrun attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no ontransitionrun attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.hasAttribute("ontransitionrun")).toBe(false);
    expect(ul.getAttribute("ontransitionrun")).toBeNull();
  });
});
