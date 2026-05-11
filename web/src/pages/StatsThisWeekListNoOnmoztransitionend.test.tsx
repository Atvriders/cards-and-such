import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pin the absence of the `onmoztransitionend` attribute on StatsPage's
 * current-week breakdown list (data-testid="stats-this-week-list").
 *
 * `onmoztransitionend` is a legacy Mozilla-prefixed inline event handler for
 * CSS transition completion. The standard event is `transitionend`, and the
 * prefixed Gecko variant should never appear as an inline HTML attribute on a
 * presentational <ul>. Any value placed there would be parsed as inline event
 * handler code, creating an unexpected script execution surface and bypassing
 * React's synthetic event system. This presentational weekly summary list has
 * no business carrying inline transition-end handlers, so we pin the absence
 * to ensure such an attribute cannot be added silently by a future refactor.
 */
describe("StatsPage stats-this-week-list ul — onmoztransitionend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onmoztransitionend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmoztransitionend")).toBe(false);
    expect(ul.getAttribute("onmoztransitionend")).toBeNull();
  });
});
