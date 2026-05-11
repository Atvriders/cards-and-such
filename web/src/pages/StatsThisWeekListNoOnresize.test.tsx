import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3143: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The `onresize`
 * content attribute is only meaningful on a small set of HTML elements — most
 * notably <body>, <frameset>, and the window object itself — where it registers
 * a JavaScript handler for resize events. On a <ul> it carries no defined
 * semantics, but if present it would still be serialized into the DOM and the
 * browser would attempt to compile its value as an event handler. That is both
 * a potential script-injection surface and a confusing footgun for future
 * refactors. A wide array of attribute absences on this presentational weekly
 * summary list are already pinned (id, role, style, tabindex, ARIA, cite,
 * onclick, etc.), but no test pins `onresize` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches an `onresize` handler attribute to this list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onresize attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3143: stats-this-week-list ul has no onresize attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onresize")).toBe(false);
    expect(ul.getAttribute("onresize")).toBeNull();
  });
});
