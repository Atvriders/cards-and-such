import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onsoundstart` IDL attribute is a legacy media event handler hook that has
 * no defined purpose on a presentational <ul>. If it were present it would
 * register a JavaScript event handler via inline-attribute parsing, which is
 * both a CSP risk and a potential vector for unintended side effects. The
 * sibling absences (cite, id, role, style, tabindex, ARIA, etc.) are already
 * pinned, but no test pins `onsoundstart` absence on `stats-this-week-list`.
 * Pinning it here ensures any future change that accidentally attaches an
 * `onsoundstart` handler to this weekly summary list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onsoundstart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onsoundstart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onsoundstart")).toBe(false);
    expect(ul.getAttribute("onsoundstart")).toBeNull();
  });
});
