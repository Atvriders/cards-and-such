import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain presentational <ul>. The `onbeforetogglechanged`
 * attribute is not a defined HTML event handler attribute and has no
 * standardized semantics on any element. Leaving such an attribute present
 * would still be exposed via DOM serialization and could mislead assistive
 * technology, crawlers, or future refactors that try to interpret it.
 * Sibling tests already pin the absence of a broad array of attributes on
 * this <ul>; pinning `onbeforetogglechanged` here ensures any future change
 * that accidentally attaches it to this presentational summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onbeforetogglechanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onbeforetogglechanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.hasAttribute("onbeforetogglechanged")).toBe(false);
    expect(ul.getAttribute("onbeforetogglechanged")).toBeNull();
  });
});
