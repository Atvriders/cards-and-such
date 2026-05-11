import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pin the absence of the `ontouchmove` attribute on StatsPage's current-week
 * breakdown list (data-testid="stats-this-week-list"). The list is a plain
 * presentational <ul> and should never carry an inline `ontouchmove` event
 * handler attribute: such an attribute would inject string-evaluated JS into
 * the DOM (a CSP/XSS hazard), bypass React's synthetic event system, and
 * potentially interfere with touch scrolling on mobile. React surfaces touch
 * handlers via the `onTouchMove` prop, never as a serialized DOM attribute.
 * Pinning this absence ensures any future change that accidentally attaches
 * an `ontouchmove` attribute to this weekly summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ontouchmove attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no ontouchmove attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ontouchmove")).toBe(false);
    expect(ul.getAttribute("ontouchmove")).toBeNull();
  });
});
