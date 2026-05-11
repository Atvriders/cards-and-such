import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The `onmoztransitionend` attribute is a legacy
 * Mozilla-prefixed inline event handler for the (now standard) transitionend
 * event. Inline event-handler attributes are a well-known XSS sink: any
 * accidental injection of one would execute attacker-controlled JavaScript in
 * the page origin the moment a CSS transition completed on the element.
 * This presentational summary list has no reason to carry such a handler, and
 * pinning its absence here ensures any future change that attaches an inline
 * Mozilla transition-end handler to this <ul> is reviewed deliberately rather
 * than slipping in unnoticed alongside other attribute changes.
 */
describe("StatsPage stats-prev-week ul — onmoztransitionend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onmoztransitionend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmoztransitionend")).toBe(false);
    expect(ul.getAttribute("onmoztransitionend")).toBeNull();
  });
});
