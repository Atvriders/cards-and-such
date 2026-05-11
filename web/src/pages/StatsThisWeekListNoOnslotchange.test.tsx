import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3311: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is rendered as a plain <ul> with
 * className "stats-week-list". The HTML `onslotchange` attribute is a
 * content-attribute event handler that only fires on <slot> elements inside
 * a shadow DOM when the assigned nodes change. On any other element — and
 * certainly on a presentational <ul> — it has no defined behavior, but
 * leaving it present would still register a string-form event handler via
 * DOM serialization and could leak code into the global execution scope,
 * confuse future refactors that try to interpret it as a slot binding, or
 * trip security audits scanning for inline event handlers. The sibling
 * `stats-prev-week` ul already has its `onslotchange` absence pinned
 * (W3310), and a wide array of other this-week-list attribute absences are
 * pinned (id, role, style, tabindex, ARIA, cite, etc.), but no test pins
 * `onslotchange` absence on `stats-this-week-list`. Pinning it here ensures
 * any future change that accidentally attaches an `onslotchange` handler to
 * this presentational weekly summary list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onslotchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3311: stats-this-week-list ul has no onslotchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onslotchange")).toBe(false);
    expect(ul.getAttribute("onslotchange")).toBeNull();
  });
});
