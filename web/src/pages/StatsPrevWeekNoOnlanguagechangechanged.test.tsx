import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the (non-standard) `onlanguagechangechanged` attribute
 * on StatsPage's prior-week breakdown list (data-testid="stats-prev-week").
 * The real event handler is `onlanguagechange` (fires on the window when the
 * user's preferred languages change); `onlanguagechangechanged` is a
 * typo-shaped name with no defined behavior. If it ever appeared on this
 * presentational <ul>, it would be silently serialized into the DOM without
 * effect and could mask a real intent or confuse future refactors. This test
 * ensures any such accidental attribute is caught in review.
 */
describe("StatsPage stats-prev-week ul — onlanguagechangechanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onlanguagechangechanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.hasAttribute("onlanguagechangechanged")).toBe(false);
    expect(ul.getAttribute("onlanguagechangechanged")).toBeNull();
  });
});
