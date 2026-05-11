import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `onprogress` content attribute is a global event-handler attribute that, when
 * present, registers a JavaScript handler for `progress` events on the element.
 * A presentational weekly summary <ul> has no progress lifecycle and should
 * never carry an `onprogress` attribute. Leaving one in place would attach an
 * unintended event handler, surface a confusing string-based handler in DOM
 * serialization, and could be misused as an injection sink. A wide array of
 * other this-week-list attribute absences are already pinned (id, role, style,
 * tabindex, ARIA, cite, etc.), but no test pins `onprogress` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches an `onprogress` handler to this presentational weekly
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onprogress attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onprogress attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onprogress")).toBe(false);
    expect(ul.getAttribute("onprogress")).toBeNull();
  });
});
