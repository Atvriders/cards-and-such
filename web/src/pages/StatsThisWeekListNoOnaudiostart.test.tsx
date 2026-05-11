import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `onaudiostart` attribute on the StatsPage
 * current-week breakdown list (data-testid="stats-this-week-list"). The
 * `onaudiostart` content attribute is associated with SpeechRecognition
 * events and is not a valid global HTML event handler. On a plain
 * presentational <ul> it has no defined behavior, but allowing it to
 * appear would expose an inline script-like surface that could be
 * misinterpreted by tooling, scrapers, or future refactors. Pinning its
 * absence ensures any future change that accidentally attaches an
 * `onaudiostart` handler to this weekly summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onaudiostart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onaudiostart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onaudiostart")).toBe(false);
    expect(ul.getAttribute("onaudiostart")).toBeNull();
  });
});
