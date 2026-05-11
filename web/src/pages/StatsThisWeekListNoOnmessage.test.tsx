import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3284: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `onmessage`
 * attribute is a window-level event handler content attribute used to register a
 * handler for cross-origin messages posted via `window.postMessage`. It has no
 * defined semantics on a <ul> element, but if present it would still be parsed
 * by the HTML parser as an inline event handler, potentially executing attacker-
 * controlled script if user content ever flowed into the attribute, and would
 * mislead future refactors that try to interpret it as a message channel hook.
 * The sibling `stats-prev-week` ul already has its `onmessage` absence pinned,
 * and many other this-week-list attribute absences are pinned (id, role, style,
 * tabindex, ARIA, cite, etc.), but no test pins `onmessage` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches an `onmessage` handler attribute to this presentational
 * weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onmessage attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3284: stats-this-week-list ul has no onmessage attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmessage")).toBe(false);
    expect(ul.getAttribute("onmessage")).toBeNull();
  });
});
