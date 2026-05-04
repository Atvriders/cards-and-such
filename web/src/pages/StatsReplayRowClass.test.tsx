import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1243: StatsPage renders saved replays as `<li>` rows inside the replays
 * panel. Each row carries the className `stats-replay-row` — this hook is
 * load-bearing for the dedicated row layout (title / meta / play link laid
 * out via flex in StatsPage.css). Existing tests pin the row's
 * `data-testid="stats-replay-<idx>"` and the play link's testid, but no
 * test actually asserts the row's className. A regression that drops or
 * renames this class (e.g. during a CSS module migration) would silently
 * collapse the row's visual layout while every existing testid-based
 * assertion still passes. We seed a single replay and pin
 * `stats-replay-0`'s className to exactly "stats-replay-row".
 */
describe("StatsPage replays panel — replay row className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1243: stats-replay-0 row carries the 'stats-replay-row' className", () => {
    localStorage.setItem(
      "cards-replays",
      JSON.stringify([
        { id: "r-only", gameId: "klondike", seed: 7, actions: ["a"], savedAt: 1 },
      ]),
    );

    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const panel = screen.getByTestId("stats-replays-panel");
    const row = within(panel).getByTestId("stats-replay-0");
    // Pin the load-bearing layout hook on the row element.
    expect(row.className).toBe("stats-replay-row");
    // Sanity: row is in fact an <li> inside the replays list.
    expect(row.tagName).toBe("LI");
  });
});
