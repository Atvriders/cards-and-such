import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is a plain presentational <ul>. The `onbeforexrselect` attribute is a
 * Chromium-only WebXR-related inline event handler attribute that has no
 * defined meaning on a <ul> and should never appear on this list. Pinning its
 * absence prevents accidental introduction of inline XR event handlers on the
 * weekly summary list, which would be a footgun for both security (inline
 * handler execution) and accessibility/serialization correctness.
 */
describe("StatsPage stats-this-week-list ul — onbeforexrselect attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onbeforexrselect attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforexrselect")).toBe(false);
    expect(ul.getAttribute("onbeforexrselect")).toBeNull();
  });
});
