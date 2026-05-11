import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The `onorientationchange` IDL attribute reflects
 * a legacy device-orientation event handler that is meaningful on <body> (and
 * historically <window>) but carries no defined semantics on a <ul>. Leaving
 * such a handler attribute on a presentational summary list would expose
 * inline event-handler surface area to DOM serialization and risk masking
 * unintended event wiring. Sibling tests pin the absence of many other global
 * and ARIA attributes on this element; this test pins the absence of
 * `onorientationchange` so any future change that accidentally attaches an
 * orientation-change handler attribute to this list is reviewed deliberately.
 */
describe("StatsPage stats-prev-week ul — onorientationchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onorientationchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onorientationchange")).toBe(false);
    expect(ul.getAttribute("onorientationchange")).toBeNull();
  });
});
