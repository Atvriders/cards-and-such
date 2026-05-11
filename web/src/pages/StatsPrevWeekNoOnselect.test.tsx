import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onselect` content attribute
 * registers a handler for the legacy `select` event, which fires when text is
 * selected in form controls such as <input type="text"> and <textarea>. On a
 * presentational <ul> it has no defined behavior, but if it ever leaked in it
 * would still be parsed as an inline event handler and executed in the page's
 * JavaScript context, creating a needless XSS sink and confusing the DOM
 * surface that sibling tests have carefully pinned. Pinning the absence of
 * `onselect` alongside the other inline event-handler and global-attribute
 * tests ensures any future change that accidentally attaches one to this
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onselect attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onselect attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onselect")).toBe(false);
    expect(ul.getAttribute("onselect")).toBeNull();
  });
});
