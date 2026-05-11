import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the non-standard `onunloadchanged` attribute on
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list").
 * `onunloadchanged` is not a defined HTML event handler attribute and carries
 * no semantics on a <ul>. Pinning its absence ensures any future change that
 * accidentally attaches it to this presentational weekly summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onunloadchanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onunloadchanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onunloadchanged")).toBe(false);
    expect(ul.getAttribute("onunloadchanged")).toBeNull();
  });
});
