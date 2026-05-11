import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins absence of the `onloadstart` attribute on StatsPage's prior-week
 * breakdown list (data-testid="stats-prev-week"). `onloadstart` is a media
 * event handler attribute meaningful on elements like <audio>, <video>, and
 * <img>. The prev-week summary is rendered as a plain <ul> with no media
 * loading semantics, so an inline `onloadstart=` handler would either be
 * dead weight or, worse, an XSS sink if user-influenced strings ever flowed
 * into it. Sibling tests already pin the absence of many global/ARIA/event
 * attributes on this element; pinning `onloadstart` here ensures any future
 * change that accidentally attaches it is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onloadstart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onloadstart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.hasAttribute("onloadstart")).toBe(false);
    expect(ul.getAttribute("onloadstart")).toBeNull();
  });
});
