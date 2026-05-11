import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onformdata` content attribute
 * is an HTML event handler attribute that, if set, would be parsed as
 * JavaScript and installed as a `formdata` event listener. It is only
 * meaningful on form-bearing elements and has no defined semantics on a <ul>,
 * but its presence would still expose inline-script surface area and could
 * confuse future refactors. Sibling tests pin the absence of many other
 * inline event handler and global attributes on this element; this test pins
 * the absence of `onformdata` so any future change that accidentally attaches
 * one is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onformdata attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onformdata attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.hasAttribute("onformdata")).toBe(false);
    expect(ul.getAttribute("onformdata")).toBeNull();
  });
});
