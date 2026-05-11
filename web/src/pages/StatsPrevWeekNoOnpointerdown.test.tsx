import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3208: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onpointerdown` content
 * attribute, when present in markup, registers an inline event handler that
 * fires for pointer-down interactions (mouse press, touch start, stylus
 * contact) on the element. This presentational summary list has no
 * interactive affordance — clicks are handled on inner buttons and links —
 * so any inline `onpointerdown` attribute would either be dead code or, worse,
 * an XSS sink if a string ever made it into the rendered output. Sibling
 * tests already pin the absence of many event-handler and global attributes
 * on this <ul>, but none pin the absence of `onpointerdown`. Pinning it
 * here ensures any future change that accidentally attaches an inline
 * pointer-down handler to this list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onpointerdown attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3208: stats-prev-week ul has no onpointerdown attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpointerdown")).toBe(false);
    expect(ul.getAttribute("onpointerdown")).toBeNull();
  });
});
