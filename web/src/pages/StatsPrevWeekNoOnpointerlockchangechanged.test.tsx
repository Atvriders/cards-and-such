import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The
 * `onpointerlockchangechanged` attribute is not a defined HTML event-handler
 * content attribute (the real Pointer Lock API event is `pointerlockchange`,
 * exposed via the `onpointerlockchange` IDL attribute on Document, not on
 * arbitrary elements). Attaching a non-standard handler attribute named
 * `onpointerlockchangechanged` to a presentational <ul> would be a no-op at
 * runtime but would still surface in DOM serialization and could mislead
 * future refactors, accessibility tooling, or crawlers. Sibling tests pin the
 * absence of many other inline event-handler attributes; pinning
 * `onpointerlockchangechanged` here ensures any accidental introduction of
 * this attribute on the prev-week list is caught and reviewed deliberately.
 */
describe("StatsPage stats-prev-week ul — onpointerlockchangechanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onpointerlockchangechanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpointerlockchangechanged")).toBe(false);
    expect(ul.getAttribute("onpointerlockchangechanged")).toBeNull();
  });
});
