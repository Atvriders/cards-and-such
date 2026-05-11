import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is a presentational <ul> and must not carry an `onpopover` attribute. There
 * is no standard `onpopover` event handler attribute in HTML — popover-related
 * events are exposed via `ontoggle` / `onbeforetoggle` on elements with the
 * `popover` attribute. Any `onpopover` string on this <ul> would be a
 * misspelled or fabricated inline handler, surviving DOM serialization while
 * doing nothing useful and potentially confusing future maintainers, linters,
 * or assistive tooling. Pinning its absence here ensures any future change
 * that accidentally attaches an `onpopover` attribute to this weekly summary
 * list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onpopover attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onpopover attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpopover")).toBe(false);
    expect(ul.getAttribute("onpopover")).toBeNull();
  });
});
