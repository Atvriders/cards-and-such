import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3182: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The `onauxclick`
 * IDL attribute is an event handler that fires for non-primary pointer button
 * presses (typically middle-click). On a presentational summary <ul> there is no
 * legitimate need to handle auxiliary clicks — the element is not interactive,
 * does not represent a link target, and its children carry their own semantics.
 * Other event-handler absences on this list are already pinned (onclick,
 * ondblclick, oncontextmenu, etc.) and adjacent attribute absences (cite,
 * id, role, style, tabindex, ARIA) are likewise pinned, but no test currently
 * pins `onauxclick` absence on `stats-this-week-list`. Pinning it here ensures
 * any future change that accidentally wires a middle-click handler onto this
 * passive weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onauxclick attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3182: stats-this-week-list ul has no onauxclick attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onauxclick")).toBe(false);
    expect(ul.getAttribute("onauxclick")).toBeNull();
  });
});
