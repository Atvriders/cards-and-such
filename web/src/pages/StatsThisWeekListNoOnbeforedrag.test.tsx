import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onbeforedrag` attribute is not a defined HTML event attribute (the modern
 * drag-and-drop event surface is `ondragstart`, `ondrag`, `ondragend`, etc.),
 * and on a presentational summary list it has no semantics whatsoever. Leaving
 * it present — even with a no-op value — would still be exposed via DOM
 * serialization and could mislead assistive technology, crawlers, or future
 * refactors that try to interpret it as a drag-interaction hook. A wide array
 * of other this-week-list attribute absences are pinned (id, role, style,
 * tabindex, ARIA, cite, etc.), but no test pins `onbeforedrag` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches an `onbeforedrag` handler to this presentational
 * weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onbeforedrag attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onbeforedrag attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforedrag")).toBe(false);
    expect(ul.getAttribute("onbeforedrag")).toBeNull();
  });
});
