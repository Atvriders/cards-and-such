import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3142: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onresize` content attribute is
 * an inline event handler that browsers only honor on <body> and <frameset>
 * (it mirrors window's resize event). On a <ul> it carries no defined
 * semantics, but if it were ever attached the parsed value would still be
 * exposed via DOM serialization, could execute as inline script under permissive
 * CSP, and would mislead future refactors. Sibling tests already pin the
 * absence of many other inline event handlers and global attributes on this
 * <ul>, but none pin the absence of `onresize`. Pinning it here ensures any
 * future change that accidentally attaches an `onresize` handler attribute to
 * this presentational summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onresize attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3142: stats-prev-week ul has no onresize attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onresize")).toBe(false);
    expect(ul.getAttribute("onresize")).toBeNull();
  });
});
