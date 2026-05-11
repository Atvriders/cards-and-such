import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain presentational <ul>. `onnetworkchange` is not a standard
 * HTML event handler attribute — it has no defined semantics on any element
 * and is not part of the HTML living standard. If it appeared on this <ul>
 * it would be inert as far as the platform is concerned, but it would still
 * be serialized into the DOM and could mislead future refactors, linters, or
 * assistive tooling that try to interpret unknown `on*`-prefixed attributes
 * as event handlers. Pinning its absence ensures any accidental addition is
 * reviewed deliberately rather than slipping in unnoticed alongside the other
 * attribute-absence pins on this element.
 */
describe("StatsPage stats-prev-week ul — onnetworkchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onnetworkchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onnetworkchange")).toBe(false);
    expect(ul.getAttribute("onnetworkchange")).toBeNull();
  });
});
