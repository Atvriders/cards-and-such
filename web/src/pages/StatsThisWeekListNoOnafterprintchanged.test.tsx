import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pin the absence of the `onafterprintchanged` attribute on StatsPage's
 * current-week breakdown list (data-testid="stats-this-week-list"). The
 * `onafterprintchanged` event handler attribute is not part of any standard
 * HTML event model for a presentational <ul>, and attaching it would expose
 * unintended scripting hooks via DOM serialization. Pinning its absence here
 * ensures any future change that accidentally attaches an
 * `onafterprintchanged` handler to this weekly summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onafterprintchanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onafterprintchanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onafterprintchanged")).toBe(false);
    expect(ul.getAttribute("onafterprintchanged")).toBeNull();
  });
});
