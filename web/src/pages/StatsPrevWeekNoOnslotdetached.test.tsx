import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className "stats-week-list stats-week-list--prev".
 * `onslotdetached` is not a defined HTML event handler attribute; if it were
 * ever set as a content attribute on this <ul>, it would be inert (no event of
 * that name fires on a <ul>) but would still serialize into the DOM and could
 * confuse linters, accessibility tooling, or future refactors. This test pins
 * its absence so any accidental introduction is reviewed deliberately.
 */
describe("StatsPage stats-prev-week ul — onslotdetached attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onslotdetached attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onslotdetached")).toBe(false);
    expect(ul.getAttribute("onslotdetached")).toBeNull();
  });
});
