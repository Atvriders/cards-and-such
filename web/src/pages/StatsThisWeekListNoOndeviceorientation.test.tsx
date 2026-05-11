import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `ondeviceorientation` attribute is a window-level event handler intended for
 * the global Window object to react to device orientation changes; it has no
 * defined meaning on a <ul> element. Even though browsers may silently ignore
 * such a handler on a list element, leaving it present would surface as a
 * spurious inline attribute in the DOM, could mislead future refactors into
 * thinking the list participates in motion/orientation events, and would
 * needlessly enlarge the serialized markup. Pinning its absence here ensures
 * any future change that accidentally attaches `ondeviceorientation` to this
 * presentational weekly summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ondeviceorientation attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no ondeviceorientation attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ondeviceorientation")).toBe(false);
    expect(ul.getAttribute("ondeviceorientation")).toBeNull();
  });
});
