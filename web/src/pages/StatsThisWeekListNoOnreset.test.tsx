import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3146: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The `onreset`
 * content attribute is the inline event handler for the `reset` event, which is
 * only fired on <form> elements. On a <ul> the attribute is meaningless: there
 * is no reset event to handle, and any handler would be dead code or, worse,
 * an inline-handler XSS sink if a future refactor accidentally interpolated
 * untrusted strings into it. The sibling `stats-prev-week` ul already has its
 * `onreset` absence pinned, and many other this-week-list attribute absences
 * are pinned (id, role, style, tabindex, cite, ARIA, etc.), but no test pins
 * `onreset` absence on `stats-this-week-list`. Pinning it here ensures any
 * future change that accidentally attaches an inline reset handler to this
 * presentational weekly summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onreset attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3146: stats-this-week-list ul has no onreset attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onreset")).toBe(false);
    expect(ul.getAttribute("onreset")).toBeNull();
  });
});
