import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is a
 * presentational <ul>. `onunloadchanged` is not a standardized HTML event
 * handler attribute and has no defined semantics on a <ul>. If it were ever
 * attached, it would be serialized into the DOM as an inert attribute that
 * could confuse assistive technologies, crawlers, or future refactors. This
 * test pins its absence so any accidental introduction of an
 * `onunloadchanged` attribute on this list is reviewed deliberately.
 */
describe("StatsPage stats-prev-week ul — onunloadchanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onunloadchanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onunloadchanged")).toBe(false);
    expect(ul.getAttribute("onunloadchanged")).toBeNull();
  });
});
