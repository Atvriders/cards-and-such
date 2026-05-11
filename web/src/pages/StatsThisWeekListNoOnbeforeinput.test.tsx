import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3206: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The `onbeforeinput`
 * IDL attribute / inline event handler attribute is intended for editable form
 * controls (inputs, textareas, contenteditable hosts) where it surfaces the
 * `beforeinput` event before the browser applies a user-initiated edit. A
 * presentational <ul> displaying aggregated weekly stats is not editable, never
 * dispatches `beforeinput`, and should not carry an inline `onbeforeinput`
 * handler attribute. While many other attribute absences on this element are
 * already pinned (cite, id, role, style, tabindex, ARIA, etc.), no test
 * currently pins `onbeforeinput` absence on `stats-this-week-list`. Pinning it
 * here ensures any future change that attaches an inline `onbeforeinput`
 * handler to this read-only weekly summary list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onbeforeinput attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3206: stats-this-week-list ul has no onbeforeinput attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforeinput")).toBe(false);
    expect(ul.getAttribute("onbeforeinput")).toBeNull();
  });
});
