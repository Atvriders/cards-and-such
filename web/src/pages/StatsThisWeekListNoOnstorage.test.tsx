import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3281: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `onstorage`
 * attribute is a window event handler content attribute defined on <body> (and
 * reflected onto Window) that fires when a storage area (localStorage /
 * sessionStorage) is mutated by another document sharing the storage. On a
 * presentational <ul> it has no defined semantics, but if present it would be
 * parsed as an inline event handler containing executable JavaScript — exactly
 * the kind of attribute injection vector CSP and DOM hygiene rules try to
 * prevent. The sibling `stats-prev-week` ul already has its `onstorage` absence
 * pinned, and a wide array of other this-week-list attribute absences are
 * pinned (id, role, style, tabindex, ARIA, cite, etc.), but no test pins
 * `onstorage` absence on `stats-this-week-list`. Pinning it here ensures any
 * future change that accidentally attaches an inline storage-event handler to
 * this weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onstorage attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3281: stats-this-week-list ul has no onstorage attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onstorage")).toBe(false);
    expect(ul.getAttribute("onstorage")).toBeNull();
  });
});
