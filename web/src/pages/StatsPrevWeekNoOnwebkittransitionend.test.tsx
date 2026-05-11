import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is a
 * presentational <ul> and must not carry the legacy `onwebkittransitionend`
 * inline event handler attribute. Any such attribute would attach a WebKit
 * transition-end event listener parsed from a string, which is both a CSP
 * hazard (inline script) and semantically meaningless on a static summary
 * list. Pin its absence so a regression that introduces inline transition
 * event handlers on this element is caught deliberately.
 */
describe("StatsPage stats-prev-week ul — onwebkittransitionend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onwebkittransitionend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onwebkittransitionend")).toBe(false);
    expect(ul.getAttribute("onwebkittransitionend")).toBeNull();
  });
});
