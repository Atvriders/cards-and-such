import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The HTML `onmouseout` attribute is an inline event
 * handler that would execute arbitrary JavaScript when the pointer leaves the
 * element. This presentational summary list has no interactive behavior tied
 * to mouseout events, and inline event-handler attributes are a known XSS
 * vector / CSP violation risk. Pinning the absence of `onmouseout` here
 * ensures any future change that accidentally attaches an inline mouseout
 * handler to this list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-prev-week ul — onmouseout attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onmouseout attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmouseout")).toBe(false);
    expect(ul.getAttribute("onmouseout")).toBeNull();
  });
});
