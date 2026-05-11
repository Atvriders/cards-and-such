import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `ongamepadconnected` attribute is a global event handler IDL attribute that
 * is only meaningful on <body> (and a few related window-targeted elements)
 * where it wires up a gamepadconnected event listener via inline HTML. On a
 * presentational <ul> it has no defined semantics, but if it were ever set it
 * would still be parsed and could execute arbitrary inline JavaScript when a
 * gamepad is connected — a footgun for both XSS and accidental side effects.
 * A wide array of other this-week-list attribute absences are pinned (id,
 * role, style, tabindex, ARIA, cite, etc.), but no test pins
 * `ongamepadconnected` absence on `stats-this-week-list`. Pinning it here
 * ensures any future change that accidentally attaches an
 * `ongamepadconnected` handler to this list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ongamepadconnected attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no ongamepadconnected attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ongamepadconnected")).toBe(false);
    expect(ul.getAttribute("ongamepadconnected")).toBeNull();
  });
});
