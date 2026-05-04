import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1246: StatsPage's footer "Reset stats" control is rendered as a
 * `<button>` carrying the className `btn btn-ghost stats-reset-btn`. The
 * `stats-reset-btn` token is the load-bearing CSS hook that pins the
 * destructive button's spacing/alignment inside `.stats-footer`. Existing
 * tests cover the button's `data-testid="stats-reset"` and click behavior
 * (confirm dialog, reset isolation, etc.), but no test pins the
 * `stats-reset-btn` className itself. A regression that renames or drops
 * this class — e.g. during a styling refactor — would silently break the
 * footer's visual contract while every behavior test still passes.
 */
describe("StatsPage footer — reset button className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1246: stats-reset button carries the 'stats-reset-btn' className token", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("stats-reset");
    // Pin the load-bearing footer-button class hook.
    expect(btn.className).toContain("stats-reset-btn");
    // Sanity: this is in fact a <button> element.
    expect(btn.tagName).toBe("BUTTON");
  });
});
