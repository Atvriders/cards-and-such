import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onpermissionchange` attribute is an inline event-handler-style attribute
 * tied to the Permissions API's PermissionStatus.onpermissionchange handler,
 * which is only meaningful on PermissionStatus objects — never on a static
 * presentational <ul>. If such an attribute were ever attached to this list
 * it would be a no-op at best and a sign of a misplaced inline handler at
 * worst, and could be misinterpreted by future refactors or tooling.
 * Pinning its absence guards against any inadvertent attachment slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onpermissionchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onpermissionchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpermissionchange")).toBe(false);
    expect(ul.getAttribute("onpermissionchange")).toBeNull();
  });
});
