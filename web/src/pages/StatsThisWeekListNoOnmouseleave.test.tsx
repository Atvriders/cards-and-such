import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pin the absence of an `onmouseleave` attribute on the StatsPage current-week
 * breakdown list (data-testid="stats-this-week-list"). The list is a plain
 * presentational <ul> with no interactive hover behavior, so attaching an
 * inline `onmouseleave` handler would be both semantically inappropriate and a
 * potential XSS/code-injection vector. This test pins the current state so any
 * future change that introduces an inline `onmouseleave` attribute on this
 * element is reviewed deliberately.
 */
describe("StatsPage stats-this-week-list ul — onmouseleave attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onmouseleave attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmouseleave")).toBe(false);
    expect(ul.getAttribute("onmouseleave")).toBeNull();
  });
});
