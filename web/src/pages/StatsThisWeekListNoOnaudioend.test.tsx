import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `onaudioend` attribute on the StatsPage current-week
 * breakdown list (data-testid="stats-this-week-list"). The `onaudioend` event
 * handler attribute is only meaningful on media-bearing elements such as
 * <audio> or <video>; on a presentational <ul> it carries no defined
 * semantics. Pinning its absence ensures any future change that accidentally
 * attaches an `onaudioend` handler to this weekly summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onaudioend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onaudioend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onaudioend")).toBe(false);
    expect(ul.getAttribute("onaudioend")).toBeNull();
  });
});
