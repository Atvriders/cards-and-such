import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3167: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `oncut` attribute is an
 * inline event handler that fires when the user cuts content from an editable
 * element. The prev-week summary list is purely presentational, is not
 * contenteditable, and should never wire up cut-clipboard behaviour. Leaving
 * an `oncut` attribute on this <ul> would attach inline JavaScript to the
 * element and could allow stray script execution or mislead future refactors
 * that try to interpret it as an editable target. Sibling tests already pin
 * the absence of many global / ARIA / event-handler attributes on this <ul>,
 * but none pin the absence of `oncut`. Pinning it here ensures any future
 * change that accidentally attaches an `oncut` handler to this presentational
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — oncut attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3167: stats-prev-week ul has no oncut attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("oncut")).toBe(false);
    expect(ul.getAttribute("oncut")).toBeNull();
  });
});
