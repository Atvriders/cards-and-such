import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `onscrollend` attribute on the StatsPage prior-week
 * breakdown list (data-testid="stats-prev-week"). The `onscrollend` event
 * handler attribute fires when scrolling on an element ends. The prev-week
 * <ul> is a presentational summary list that should not carry inline event
 * handlers; attaching `onscrollend` to it would introduce ad-hoc inline
 * JavaScript bound directly to the DOM, bypassing React's synthetic event
 * system and complicating SSR / hydration semantics. This test pins the
 * current absence so any future change that accidentally introduces an
 * `onscrollend` inline handler is reviewed deliberately.
 */
describe("StatsPage stats-prev-week ul — onscrollend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onscrollend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onscrollend")).toBe(false);
    expect(ul.getAttribute("onscrollend")).toBeNull();
  });
});
