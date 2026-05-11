import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `onsuspend` attribute on the StatsPage current-week
 * breakdown list (data-testid="stats-this-week-list"). The `onsuspend` event
 * handler attribute is defined for media elements (<audio>, <video>) and fires
 * when media loading is suspended. On a presentational <ul> it has no defined
 * semantics, but if accidentally added it would be parsed as an inline event
 * handler — both a CSP/XSS risk surface and a misleading signal to any tool
 * inspecting the DOM. This test ensures any future change that attaches an
 * `onsuspend` attribute to this weekly summary list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onsuspend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onsuspend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onsuspend")).toBe(false);
    expect(ul.getAttribute("onsuspend")).toBeNull();
  });
});
