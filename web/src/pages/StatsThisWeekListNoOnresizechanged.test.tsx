import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onresizechanged` attribute is not a standard HTML event handler attribute;
 * it has no defined semantics on any element and would be ignored by browsers
 * as an inline event handler. Even so, an attribute named `onresizechanged`
 * would still appear in DOM serialization, could be misread by tooling or
 * future refactors as an event hook, and would clutter the element's
 * attribute surface. A wide array of other this-week-list attribute absences
 * are already pinned (cite, id, role, style, tabindex, ARIA, etc.), but no
 * test pins `onresizechanged` absence on `stats-this-week-list`. Pinning it
 * here ensures any future change that accidentally attaches an
 * `onresizechanged` handler attribute to this presentational weekly summary
 * list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onresizechanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onresizechanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onresizechanged")).toBe(false);
    expect(ul.getAttribute("onresizechanged")).toBeNull();
  });
});
