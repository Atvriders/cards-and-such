import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onbeforedragstart` attribute is not a standard HTML event handler attribute
 * (the standard drag lifecycle uses `ondragstart`, `ondrag`, `ondragend`, etc.,
 * with no `onbeforedragstart` hook defined in the HTML spec). On a static
 * presentational <ul> there is no drag interaction at all, so any inline
 * `onbeforedragstart` would be dead, non-standard markup that could mislead
 * future readers or trip up linters/serializers. Pinning its absence here
 * ensures any future change that accidentally attaches an inline
 * `onbeforedragstart` handler to this weekly summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onbeforedragstart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onbeforedragstart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforedragstart")).toBe(false);
    expect(ul.getAttribute("onbeforedragstart")).toBeNull();
  });
});
