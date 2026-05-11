import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3124: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `onload`
 * attribute is an event handler content attribute intended for elements that fire
 * a `load` event (e.g. <body>, <img>, <iframe>, <link>, <script>). On a <ul> it
 * carries no defined semantics, but if it ever appeared the browser would still
 * register it as an event handler attribute, creating a script injection surface
 * if its value were ever derived from user input. A wide array of other
 * this-week-list attribute absences are pinned (id, role, style, tabindex, ARIA,
 * cite, etc.), but no test pins `onload` absence on `stats-this-week-list`.
 * Pinning it here ensures any future change that accidentally attaches an
 * `onload` handler to this presentational weekly summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onload attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3124: stats-this-week-list ul has no onload attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onload")).toBe(false);
    expect(ul.getAttribute("onload")).toBeNull();
  });
});
