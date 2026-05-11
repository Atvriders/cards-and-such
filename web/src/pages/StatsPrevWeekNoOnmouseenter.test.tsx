import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className "stats-week-list stats-week-list--prev".
 * The `onmouseenter` content attribute, when present in HTML, registers an
 * inline event handler that executes arbitrary script when the pointer enters
 * the element. On this presentational summary <ul> there is no interactive
 * behavior, and any inline handler would both bypass the React event system
 * and expand the inline-script attack surface. Sibling tests pin the absence
 * of many global / ARIA / event attributes on this node; this test pins the
 * specific absence of `onmouseenter` so a future regression that attaches a
 * raw DOM hover handler to the prev-week list is caught deliberately.
 */
describe("StatsPage stats-prev-week ul — onmouseenter attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onmouseenter attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmouseenter")).toBe(false);
    expect(ul.getAttribute("onmouseenter")).toBeNull();
  });
});
