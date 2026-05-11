import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className "stats-week-list stats-week-list--prev".
 * The `onbeforematchchanged` attribute is not a defined HTML or DOM event
 * handler attribute — the standard hidden-until-found event is `beforematch`
 * (and the corresponding IDL attribute `onbeforematch`). A stray
 * `onbeforematchchanged` attribute on this presentational <ul> would carry no
 * defined behavior but would still serialize to the DOM and could mislead
 * future refactors or tooling that scan for inline event handlers. Sibling
 * tests pin the absence of many global, ARIA, and event-handler attributes on
 * this element; this test pins the absence of `onbeforematchchanged` so that
 * any future change which accidentally attaches it is reviewed deliberately.
 */
describe("StatsPage stats-prev-week ul — onbeforematchchanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onbeforematchchanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforematchchanged")).toBe(false);
    expect(ul.getAttribute("onbeforematchchanged")).toBeNull();
  });
});
