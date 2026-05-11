import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3269: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `onbeforeunload` content attribute is an event handler attribute defined on
 * <body> (and notionally on <frameset>) — it has no defined behavior on a
 * <ul>, where it would simply be exposed via DOM serialization while doing
 * nothing useful. Leaving such a stray handler attribute on a presentational
 * weekly summary list could mislead future refactors into believing this list
 * participates in page-unload lifecycle, encourage spurious side effects, or
 * trigger lint/accessibility warnings. A wide array of other this-week-list
 * attribute absences are pinned (id, role, style, tabindex, ARIA, cite, etc.),
 * but no test pins `onbeforeunload` absence on `stats-this-week-list`. Pinning
 * it here ensures any future change that accidentally attaches an
 * `onbeforeunload` handler attribute to this list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onbeforeunload attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3269: stats-this-week-list ul has no onbeforeunload attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforeunload")).toBe(false);
    expect(ul.getAttribute("onbeforeunload")).toBeNull();
  });
});
