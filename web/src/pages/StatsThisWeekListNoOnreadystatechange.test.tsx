import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onreadystatechange` attribute is an event handler historically associated
 * with XMLHttpRequest and (legacy) <script> readiness, and has no defined
 * meaning on a <ul>. If it were ever attached as an HTML attribute, the
 * value would be parsed and compiled as inline JavaScript by the browser,
 * which is both a security and correctness concern. This test pins the
 * absence of `onreadystatechange` on `stats-this-week-list` so that any
 * future change that accidentally attaches such a handler attribute is
 * surfaced deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onreadystatechange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onreadystatechange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onreadystatechange")).toBe(false);
    expect(ul.getAttribute("onreadystatechange")).toBeNull();
  });
});
