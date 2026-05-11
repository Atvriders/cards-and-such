import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onsearch` content attribute is
 * a non-standard event handler historically associated with <input type="search">
 * elements in WebKit-derived browsers; on a <ul> it has no defined semantics and
 * would be ignored by conformant parsers, but its presence would still serialize
 * into the DOM and could be misinterpreted by tooling, linters, or assistive
 * technology that scans for event-handler-like attributes. Sibling tests pin
 * the absence of other inline event handlers and global attributes on this
 * list; this test pins the absence of `onsearch` so any future change that
 * accidentally attaches it to this presentational summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onsearch attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onsearch attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onsearch")).toBe(false);
    expect(ul.getAttribute("onsearch")).toBeNull();
  });
});
