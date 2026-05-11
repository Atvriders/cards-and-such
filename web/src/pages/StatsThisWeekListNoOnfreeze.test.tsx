import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3332: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `onfreeze`
 * attribute is a legacy IE-only event handler attribute that has no defined
 * behavior in modern browsers or the HTML Living Standard. On a presentational
 * <ul> it carries no semantics, but if it were ever serialized into the DOM it
 * could be misinterpreted as an inline event handler by older user agents,
 * static analyzers, or future refactors. A wide array of other attribute
 * absences are already pinned for this element (id, role, style, tabindex,
 * ARIA, cite, etc.); pinning `onfreeze` absence here ensures any future change
 * that accidentally attaches this legacy handler attribute to the weekly
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onfreeze attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3332: stats-this-week-list ul has no onfreeze attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onfreeze")).toBe(false);
    expect(ul.getAttribute("onfreeze")).toBeNull();
  });
});
