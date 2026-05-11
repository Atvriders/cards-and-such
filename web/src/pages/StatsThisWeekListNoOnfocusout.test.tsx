import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3156: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `onfocusout` attribute is a legacy inline event handler that, if present,
 * would register a script-string-based focusout listener on this list element.
 * On a presentational <ul> summarizing weekly stats there is no need to react
 * to focusout events at all, and using an inline event handler attribute would
 * additionally introduce an inline-script execution path that bypasses React's
 * synthetic event system, complicates CSP hardening, and is generally
 * discouraged. Many sibling inline-handler absences are pinned on this list
 * (onblur, onfocus, onfocusin, etc.) but `onfocusout` absence is not yet
 * pinned. Pinning it here ensures any future change that accidentally attaches
 * an inline `onfocusout` handler to this presentational weekly summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onfocusout attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3156: stats-this-week-list ul has no onfocusout attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onfocusout")).toBe(false);
    expect(ul.getAttribute("onfocusout")).toBeNull();
  });
});
