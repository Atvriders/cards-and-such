import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pin the absence of the `ontouchcancel` attribute on StatsPage's prior-week
 * breakdown list (data-testid="stats-prev-week"). The element is a plain
 * presentational <ul> and should not carry inline touch-event handlers.
 * Leaving an `ontouchcancel` handler on it would execute arbitrary inline
 * script on touch cancellation, which is both a CSP-hostile pattern and a
 * latent XSS/footgun surface. Pinning the absence ensures any future change
 * that accidentally attaches `ontouchcancel` is reviewed deliberately.
 */
describe("StatsPage stats-prev-week ul — ontouchcancel attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no ontouchcancel attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.hasAttribute("ontouchcancel")).toBe(false);
    expect(ul.getAttribute("ontouchcancel")).toBeNull();
  });
});
