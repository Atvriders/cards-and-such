import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3305: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `onbeforeprint` attribute is a window event handler IDL attribute defined on
 * <body>, registering JavaScript to run immediately before the document is
 * printed. On a <ul> it carries no defined semantics: the HTML spec only
 * exposes onbeforeprint as a content attribute on body via the
 * WindowEventHandlers mixin, and an inline handler on any other element is
 * silently ignored by browsers. However, any string assigned to it would still
 * be exposed via DOM serialization, would still be parsed as JavaScript source
 * by older or non-conformant tooling, and could mislead future refactors or
 * static-analysis passes that try to interpret it as a real print hook.
 * A wide array of other this-week-list attribute absences are already pinned
 * (id, role, style, tabindex, ARIA, cite, and many other window event handler
 * attributes), but no test pins `onbeforeprint` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches an `onbeforeprint` handler to this presentational
 * weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onbeforeprint attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3305: stats-this-week-list ul has no onbeforeprint attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforeprint")).toBe(false);
    expect(ul.getAttribute("onbeforeprint")).toBeNull();
  });
});
