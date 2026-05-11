import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the legacy Mozilla-prefixed `onmozanimationend` event
 * handler attribute on the StatsPage current-week breakdown list
 * (data-testid="stats-this-week-list"). The non-prefixed `onanimationend`
 * handler attribute is the standard form, and the `moz`-prefixed variant is a
 * historical Gecko-only artifact that should never appear on this
 * presentational <ul>. Pinning its absence ensures any future change that
 * accidentally attaches a `onmozanimationend` inline handler to this weekly
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onmozanimationend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onmozanimationend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmozanimationend")).toBe(false);
    expect(ul.getAttribute("onmozanimationend")).toBeNull();
  });
});
