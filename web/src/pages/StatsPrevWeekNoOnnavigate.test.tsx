import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className "stats-week-list stats-week-list--prev".
 * The `onnavigate` attribute is associated with the experimental Navigation API
 * on the global Window object, not on arbitrary HTML elements. Placing
 * `onnavigate` on a <ul> has no defined semantics and would not register a
 * navigation event handler. Sibling tests pin the absence of many other
 * attributes on this <ul>, but none pin the absence of `onnavigate`. Pinning
 * it here ensures any future change that accidentally attaches an
 * `onnavigate` attribute to this presentational summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onnavigate attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onnavigate attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onnavigate")).toBe(false);
    expect(ul.getAttribute("onnavigate")).toBeNull();
  });
});
