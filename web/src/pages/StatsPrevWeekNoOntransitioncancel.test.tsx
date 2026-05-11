import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is a
 * plain presentational <ul>. The `ontransitioncancel` IDL attribute is a
 * transition event handler; setting it as an inline HTML attribute would wire
 * arbitrary inline script and bypass the project's React-driven event model.
 * Pinning its absence guards against future refactors accidentally attaching
 * an inline `ontransitioncancel` handler to this summary list.
 */
describe("StatsPage stats-prev-week ul — ontransitioncancel attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no ontransitioncancel attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ontransitioncancel")).toBe(false);
    expect(ul.getAttribute("ontransitioncancel")).toBeNull();
  });
});
