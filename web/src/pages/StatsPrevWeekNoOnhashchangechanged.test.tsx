import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onhashchangechanged`
 * attribute is not a defined HTML event handler attribute — the real event
 * is `hashchange` (handler attribute `onhashchange`), and only on the
 * <body>/Window. A misspelled/duplicated form like `onhashchangechanged`
 * has no defined semantics anywhere in the platform, but if it ever leaked
 * onto this presentational <ul> it would be serialized into the DOM and
 * could confuse linters, crawlers, or future refactors that try to wire up
 * hash-routing behavior to the wrong element. Pinning the absence here
 * ensures any future change that accidentally attaches an
 * `onhashchangechanged` attribute to this summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onhashchangechanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onhashchangechanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onhashchangechanged")).toBe(false);
    expect(ul.getAttribute("onhashchangechanged")).toBeNull();
  });
});
