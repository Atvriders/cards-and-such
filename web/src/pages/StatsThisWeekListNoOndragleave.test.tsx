import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3197: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The `ondragleave`
 * inline event-handler attribute is only meaningful when registering a drag-and-drop
 * listener — the weekly summary list is a purely presentational static rollup of
 * activity counts and has no drag-and-drop affordances. If an `ondragleave`
 * attribute appeared on this <ul>, it would silently install a global event
 * handler executed when a drag operation left the list, which could leak side
 * effects, mask DOM-clobbering attacks, or cause spurious analytics events.
 * Many sibling drag-event attributes (ondragstart, ondragover, ondrop, etc.)
 * already have their absence pinned on this same list, but `ondragleave` is
 * not yet covered. Pinning it here ensures any future change that adds a
 * drag-leave handler to the weekly summary list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ondragleave attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3197: stats-this-week-list ul has no ondragleave attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ondragleave")).toBe(false);
    expect(ul.getAttribute("ondragleave")).toBeNull();
  });
});
