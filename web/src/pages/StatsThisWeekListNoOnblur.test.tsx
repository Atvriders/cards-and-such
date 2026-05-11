import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain presentational <ul>. The `onblur` content attribute is
 * a legacy inline event handler that would attach a string-compiled focus-loss
 * listener to the element. Inline event-handler attributes bypass React's
 * synthetic-event system, defeat strict CSP policies, and risk arbitrary code
 * execution if any portion of their value were ever interpolated from data.
 * A <ul> presenting weekly stats has no legitimate need to react to blur,
 * since it is not focusable by default. Pinning the absence of `onblur` here
 * ensures any future change that accidentally attaches an inline blur handler
 * to this presentational weekly summary list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onblur attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onblur attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onblur")).toBe(false);
    expect(ul.getAttribute("onblur")).toBeNull();
  });
});
