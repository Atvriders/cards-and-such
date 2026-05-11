import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3287: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `onlanguagechange` attribute is a window-level event handler content attribute
 * used to register a handler for the `languagechange` event fired on the window
 * when the user's preferred languages change. It has no defined semantics on a
 * <ul> element, but if present it would still be parsed by the HTML parser as
 * an inline event handler, potentially executing attacker-controlled script if
 * user content ever flowed into the attribute, and would mislead future
 * refactors that try to interpret it as a language-change hook. The sibling
 * `stats-prev-week` ul already has its `onlanguagechange` absence pinned, and
 * many other this-week-list attribute absences are pinned (id, role, style,
 * tabindex, ARIA, cite, onmessage, etc.), but no test pins `onlanguagechange`
 * absence on `stats-this-week-list`. Pinning it here ensures any future change
 * that accidentally attaches an `onlanguagechange` handler attribute to this
 * presentational weekly summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onlanguagechange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3287: stats-this-week-list ul has no onlanguagechange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onlanguagechange")).toBe(false);
    expect(ul.getAttribute("onlanguagechange")).toBeNull();
  });
});
