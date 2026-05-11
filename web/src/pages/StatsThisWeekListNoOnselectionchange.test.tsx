import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3320: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onselectionchange` event handler attribute is a global event handler content
 * attribute that fires when the selection inside the associated element changes;
 * it is meaningful primarily on the document or on editable hosts, and on a
 * presentational <ul> it would only register a stray inline handler exposed via
 * DOM serialization. Many other attribute absences on `stats-this-week-list`
 * are already pinned (id, role, style, tabindex, ARIA, cite, etc.), but no
 * test pins `onselectionchange` absence on this ul. Pinning it here ensures any
 * future change that accidentally attaches an inline `onselectionchange`
 * handler to this presentational weekly summary list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onselectionchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3320: stats-this-week-list ul has no onselectionchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onselectionchange")).toBe(false);
    expect(ul.getAttribute("onselectionchange")).toBeNull();
  });
});
