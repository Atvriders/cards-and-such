import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1582: StatsPage's footer "Reset stats" control is rendered with the
 * className `btn btn-ghost stats-reset-btn`. The `btn-ghost` token is the
 * load-bearing visual modifier that styles this destructive control as a
 * low-emphasis (ghost) button — distinct from the solid primary buttons used
 * for non-destructive actions elsewhere on the page. Existing tests pin the
 * `stats-reset-btn` token (W1246), the `type="button"` attribute (W1484),
 * the visible text "Reset stats" (W1545), the footer note order (W1346),
 * and the wrapper's `<footer>` tagName (W1571), but no test pins the
 * `btn-ghost` modifier itself. A regression that drops `btn-ghost` (e.g.
 * upgrading the destructive button to a solid `btn-primary` style) would
 * silently flip the visual hierarchy — making "Reset stats" the loudest
 * button in the footer — while every existing assertion still passes. Lock
 * the `btn-ghost` className token so any visual-emphasis drift is caught.
 */
describe("StatsPage footer — reset button btn-ghost modifier", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1582: stats-reset button carries the 'btn-ghost' className token (low-emphasis destructive style)", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("stats-reset");
    // Pin the load-bearing visual-emphasis modifier — destructive controls
    // must remain ghost-styled, not promoted to solid/primary.
    expect(btn.className).toContain("btn-ghost");
    // Sanity: still inside the stats-footer (anchors the assertion to the
    // footer reset button, not some other ghost button on the page).
    expect(btn.closest("footer.stats-footer")).not.toBeNull();
  });
});
