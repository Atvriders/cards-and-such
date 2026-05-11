import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onintersectionchange` attribute is not a standard HTML event handler
 * attribute — IntersectionObserver callbacks are wired via the JS API rather
 * than inline content attributes — so its presence on a presentational
 * weekly summary <ul> would be meaningless at best and at worst could be
 * misread by tooling or future refactors as an intent to observe viewport
 * intersection. Pinning its absence here ensures any future change that
 * accidentally attaches an `onintersectionchange` attribute to this list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onintersectionchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onintersectionchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onintersectionchange")).toBe(false);
    expect(ul.getAttribute("onintersectionchange")).toBeNull();
  });
});
