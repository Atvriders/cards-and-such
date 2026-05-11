import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onwebkitanimationstart` attribute is a WebKit-specific inline event handler
 * that fires when a CSS animation starts on the element. This presentational
 * weekly summary list does not run any CSS animations and has no need to
 * observe animation lifecycle events; inline event handlers also bypass the
 * React synthetic event system and CSP script-src restrictions, so any
 * accidental introduction would be a regression both for security posture and
 * for the React-managed event model. Pinning the absence of
 * `onwebkitanimationstart` here ensures any future change that attaches a
 * WebKit animation-start handler to this list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onwebkitanimationstart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onwebkitanimationstart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onwebkitanimationstart")).toBe(false);
    expect(ul.getAttribute("onwebkitanimationstart")).toBeNull();
  });
});
