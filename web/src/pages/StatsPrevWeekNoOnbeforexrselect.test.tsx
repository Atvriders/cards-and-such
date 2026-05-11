import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onbeforexrselect` attribute is
 * a Chromium-specific WebXR event handler hook that fires before XR input
 * source selection. It has no defined meaning on a presentational <ul> and
 * should never appear there; if present, it would attach an inline event
 * handler that violates strict CSP, leaks XR session intent, and would be
 * exposed via DOM serialization. Sibling tests pin the absence of many other
 * attributes on this <ul>, but none pin the absence of `onbeforexrselect`.
 * Pinning it here ensures any future change that accidentally attaches this
 * XR event handler to this presentational summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onbeforexrselect attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onbeforexrselect attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforexrselect")).toBe(false);
    expect(ul.getAttribute("onbeforexrselect")).toBeNull();
  });
});
