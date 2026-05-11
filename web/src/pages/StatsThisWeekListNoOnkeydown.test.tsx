import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3127: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain presentational <ul> with className "stats-week-list".
 * The HTML `onkeydown` content attribute serializes an inline event handler
 * string that the browser would compile into a keydown listener on the
 * element. Pinning its absence on this ul ensures no future refactor
 * accidentally introduces inline keyboard handling on a non-interactive
 * weekly summary list — keyboard interactions should be wired through
 * React's synthetic event system on focusable interactive descendants,
 * not as inline attributes on the container. Many other this-week-list
 * attribute absences are already pinned (id, role, style, tabindex,
 * ARIA, cite, etc.), but no test pins `onkeydown` absence. Pinning it
 * here keeps the list strictly presentational.
 */
describe("StatsPage stats-this-week-list ul — onkeydown attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3127: stats-this-week-list ul has no onkeydown attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onkeydown")).toBe(false);
    expect(ul.getAttribute("onkeydown")).toBeNull();
  });
});
