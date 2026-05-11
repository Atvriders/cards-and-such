import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onintersectionchange`
 * attribute is not a standardized HTML event handler attribute — intersection
 * observation is wired up via the IntersectionObserver API in JavaScript, not
 * via an inline HTML attribute. Pinning its absence here ensures any future
 * change that accidentally attaches an `onintersectionchange` inline handler
 * (which would silently do nothing yet pollute the serialized DOM) is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onintersectionchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onintersectionchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onintersectionchange")).toBe(false);
    expect(ul.getAttribute("onintersectionchange")).toBeNull();
  });
});
