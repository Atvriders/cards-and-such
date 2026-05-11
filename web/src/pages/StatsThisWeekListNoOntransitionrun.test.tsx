import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `ontransitionrun` IDL attribute fires when a CSS transition first starts
 * (including its delay phase). It is purely a presentational/animation event
 * handler and has no role on a static weekly summary list. Pinning its
 * absence ensures any future change that accidentally attaches an inline
 * `ontransitionrun` handler to this presentational <ul> is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ontransitionrun attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no ontransitionrun attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ontransitionrun")).toBe(false);
    expect(ul.getAttribute("ontransitionrun")).toBeNull();
  });
});
