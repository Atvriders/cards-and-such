import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `onslotdetached` attribute on the StatsPage
 * current-week breakdown list (data-testid="stats-this-week-list").
 *
 * `onslotdetached` is not a standard HTML event handler attribute; it has no
 * defined behavior on a <ul>. Should it ever be added (intentionally or via a
 * typo of a real slot lifecycle hook), it would be serialized into the DOM and
 * could confuse tooling, linters, or future refactors. This test guards
 * against that drift by pinning both `hasAttribute` and `getAttribute` checks,
 * matching the pattern used by the sibling absence pins on this element.
 */
describe("StatsPage stats-this-week-list ul — onslotdetached attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onslotdetached attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onslotdetached")).toBe(false);
    expect(ul.getAttribute("onslotdetached")).toBeNull();
  });
});
