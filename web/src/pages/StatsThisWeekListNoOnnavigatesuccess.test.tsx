import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul>. The `onnavigatesuccess` attribute is a Navigation
 * API event handler that belongs on the global `navigation` object, not on
 * arbitrary DOM elements. Pinning its absence on this presentational weekly
 * summary list ensures any future change that accidentally attaches such a
 * handler is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onnavigatesuccess attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onnavigatesuccess attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onnavigatesuccess")).toBe(false);
    expect(ul.getAttribute("onnavigatesuccess")).toBeNull();
  });
});
