import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1594: StatsPage's footer "Reset stats" control is rendered with the
 * className `btn btn-ghost stats-reset-btn`. The base `btn` token is the
 * load-bearing CSS hook that wires this control into the shared button
 * design system (sizing, padding, focus ring, base typography) shared by
 * every other `<button class="btn …">` in the app. Existing tests pin the
 * page-specific `stats-reset-btn` token (W1246), the visual-emphasis
 * modifier `btn-ghost` (W1582), the `type="button"` attribute (W1484),
 * and the visible text "Reset stats" (W1545), but no test pins the base
 * `btn` token itself. A regression that drops the base `btn` class (e.g.
 * a refactor switching the footer to `btn-ghost stats-reset-btn` only,
 * losing the shared button styles) would visually break the control while
 * every existing assertion still passes — `stats-reset-btn` and `btn-ghost`
 * remain present, the type and text are unchanged. Lock the base `btn`
 * className token so design-system drift on this destructive control is
 * caught at the test layer.
 */
describe("StatsPage footer — reset button base btn token", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1594: stats-reset button carries the base 'btn' className token (shared design-system hook)", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("stats-reset");
    // Pin the base design-system token via classList.contains so the
    // assertion does not accidentally match the `btn-ghost` or
    // `stats-reset-btn` modifiers via substring inclusion.
    expect(btn.classList.contains("btn")).toBe(true);
    // Sanity: still inside the stats-footer (anchors to the footer reset
    // button, not some other `btn` elsewhere on the page).
    expect(btn.closest("footer.stats-footer")).not.toBeNull();
  });
});
