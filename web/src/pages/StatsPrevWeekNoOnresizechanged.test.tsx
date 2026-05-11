import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. `onresizechanged` is not a standard HTML event
 * handler attribute -- it is not part of the HTML spec, not a DOM event in
 * any modern browser, and not used by React. Leaving such a non-standard
 * attribute on a presentational <ul> would still serialize into the DOM and
 * could be confused with a real event handler by future maintainers or
 * tooling. Pinning the absence of `onresizechanged` here ensures any
 * accidental future addition of this non-standard handler attribute on the
 * stats-prev-week list is flagged immediately rather than silently slipping
 * through.
 */
describe("StatsPage stats-prev-week ul — onresizechanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onresizechanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onresizechanged")).toBe(false);
    expect(ul.getAttribute("onresizechanged")).toBeNull();
  });
});
