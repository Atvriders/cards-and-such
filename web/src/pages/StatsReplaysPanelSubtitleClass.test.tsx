import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1331: The replays panel (data-testid="stats-replays-panel") renders its
 * "Last {n} saved replay(s) (max 5)" header as a <p> with the load-bearing
 * styling hook className `stats-chart-label`. Existing tests pin the
 * panel's testid, the header copy, the row className, and the singular /
 * plural pluralization of "replay" — but no test pins the className on
 * this subtitle paragraph itself. A regression that drops or renames
 * `.stats-chart-label` here (e.g. during a CSS-module migration or a
 * subtitle-copy refactor) would silently strip the muted-subtitle
 * typography while every other replays-panel assertion still passes.
 * This test pins the className on the replays-panel subtitle paragraph.
 */
describe("StatsPage replays panel — subtitle className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1331: stats-replays-panel subtitle paragraph carries the 'stats-chart-label' className", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const panel = screen.getByTestId("stats-replays-panel");
    // The subtitle paragraph is the only <p> with this class inside the panel.
    const subtitle = within(panel).getByText(/Last \d+ saved replays? \(max 5\)/);
    expect(subtitle.tagName).toBe("P");
    expect(subtitle.className).toBe("stats-chart-label");
  });
});
