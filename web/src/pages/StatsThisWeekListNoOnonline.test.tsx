import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3293: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `ononline` attribute is an event-handler content attribute defined on
 * <body> for the browser's `online` event (fired on `window` when the user
 * agent regains network connectivity). On a <ul> it has no defined
 * semantics — it would not wire up a handler in any standards-compliant
 * way and would just sit in the serialized DOM as dead weight, or worse,
 * leak attacker-controlled script-like text into the markup. The sibling
 * `stats-prev-week` ul and this `stats-this-week-list` ul already have a
 * broad array of event-handler attribute absences pinned (onclick,
 * onmouseover, onfocus, onblur, onerror, onload, onbeforeunload, etc.),
 * but no test pins `ononline` absence on `stats-this-week-list`. Pinning
 * it here ensures any future change that accidentally attaches an
 * `ononline` handler to this presentational weekly summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ononline attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3293: stats-this-week-list ul has no ononline attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ononline")).toBe(false);
    expect(ul.getAttribute("ononline")).toBeNull();
  });
});
