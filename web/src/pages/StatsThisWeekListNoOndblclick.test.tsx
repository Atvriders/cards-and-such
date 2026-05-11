import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3179: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The `ondblclick`
 * inline event-handler attribute, if present, would register a JavaScript handler
 * fired on double-click. On a presentational summary <ul> there is no double-click
 * interaction defined, and inline `on*` attributes are an XSS vector when their
 * value is derived from user-influenced data. The sibling `stats-prev-week` ul
 * already has its `ondblclick` absence pinned, and a wide array of other inline
 * event-handler absences (onclick, onmousedown, onkeydown, etc.) are pinned on
 * `stats-this-week-list`, but no test pins `ondblclick` absence on this element.
 * Pinning it here ensures any future change that accidentally attaches an inline
 * `ondblclick` handler to this presentational weekly summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ondblclick attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3179: stats-this-week-list ul has no ondblclick attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ondblclick")).toBe(false);
    expect(ul.getAttribute("ondblclick")).toBeNull();
  });
});
