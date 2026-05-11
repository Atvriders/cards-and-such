import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins absence of the non-standard `onlanguagechangechanged` attribute on the
 * StatsPage current-week breakdown list (data-testid="stats-this-week-list").
 * The list is rendered as a plain <ul> with no event handlers, and
 * `onlanguagechangechanged` is not a recognized DOM event handler attribute
 * (the real event is `languagechange`, dispatched on `window`). Pinning its
 * absence here ensures any future change that accidentally attaches such a
 * spurious handler attribute to this presentational weekly summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onlanguagechangechanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onlanguagechangechanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onlanguagechangechanged")).toBe(false);
    expect(ul.getAttribute("onlanguagechangechanged")).toBeNull();
  });
});
