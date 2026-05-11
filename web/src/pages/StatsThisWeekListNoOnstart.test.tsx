import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". `onstart` is
 * not a defined HTML event attribute on a <ul> (it exists on SMIL animation
 * elements and on SpeechSynthesisUtterance, not on HTML list elements), so
 * it carries no defined semantics here. Leaving such an attribute in place
 * would still be exposed via DOM serialization and could be misinterpreted
 * by future refactors, crawlers, or assistive tooling. Pinning the absence
 * of `onstart` on `stats-this-week-list` ensures any future change that
 * accidentally attaches such an attribute to this presentational weekly
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onstart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onstart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onstart")).toBe(false);
    expect(ul.getAttribute("onstart")).toBeNull();
  });
});
