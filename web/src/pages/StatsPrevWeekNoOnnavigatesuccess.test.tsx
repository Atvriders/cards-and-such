import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className "stats-week-list stats-week-list--prev".
 * The `onnavigatesuccess` attribute is associated with the Navigation API's
 * NavigateEvent (fired on window.navigation), not with arbitrary HTML elements.
 * Placing it inline on a <ul> would be meaningless, would not wire up any
 * listener, and could confuse future readers or static analyzers. Sibling
 * tests pin the absence of many other global / event-handler attributes on
 * this element; this test pins the absence of `onnavigatesuccess` so any
 * accidental addition is reviewed deliberately rather than slipping in.
 */
describe("StatsPage stats-prev-week ul — onnavigatesuccess attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onnavigatesuccess attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onnavigatesuccess")).toBe(false);
    expect(ul.getAttribute("onnavigatesuccess")).toBeNull();
  });
});
