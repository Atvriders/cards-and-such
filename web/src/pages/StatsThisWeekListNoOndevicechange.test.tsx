import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `ondevicechange` IDL attribute is a global event handler defined on
 * MediaDevices (navigator.mediaDevices.ondevicechange) and is not a meaningful
 * content attribute on HTML elements. Setting it on a <ul> would have no
 * defined effect, but would still appear in DOM serialization and could
 * mislead future refactors or static analyzers. A wide array of other
 * this-week-list attribute absences are already pinned (id, role, style,
 * tabindex, cite, ARIA, etc.). Pinning `ondevicechange` absence ensures any
 * future change that accidentally attaches a device-change handler attribute
 * to this presentational weekly summary list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ondevicechange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no ondevicechange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ondevicechange")).toBe(false);
    expect(ul.getAttribute("ondevicechange")).toBeNull();
  });
});
