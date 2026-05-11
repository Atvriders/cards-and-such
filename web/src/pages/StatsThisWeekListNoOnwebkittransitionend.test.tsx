import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onwebkittransitionend` inline event handler attribute, if present, would
 * register a WebKit-prefixed transition-end listener at parse time. On this
 * presentational weekly summary list it has no purpose, and leaving an inline
 * handler attribute in the DOM risks executing attacker-controlled script if
 * the string ever became attacker-influenced, as well as violating any future
 * strict CSP that forbids inline event handlers. Pinning its absence ensures
 * any future change that accidentally attaches an `onwebkittransitionend`
 * handler to this list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onwebkittransitionend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onwebkittransitionend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onwebkittransitionend")).toBe(false);
    expect(ul.getAttribute("onwebkittransitionend")).toBeNull();
  });
});
