import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2030: StatsPage's "Replays" stats card (data-testid="stats-replays-panel"),
 * which wraps the replays subtitle, the empty-state / replays list, and the
 * "View all replays" link, is currently rendered WITHOUT an `id` attribute.
 * Sibling tests pin a number of adjacent contracts on this same node:
 *   - StatsReplaysCardClass pins the className.
 *   - StatsReplaysPanelSubtitleClass pins the subtitle paragraph class.
 *   - StatsReplaysAllClass pins the "View all replays" link class.
 *   - StatsSectionH2ReplaysParent pins the nested "Replays" h2 parent.
 *   - StatsReplayRowClass / StatsReplayMetaSeedCode pin row internals.
 * However, no existing test pins the absence of an `id` attribute on the
 * stats-replays-panel card element itself. Adding an `id` would create a
 * stable in-page anchor / DOM-query handle (e.g. for fragment links,
 * ScrollSpy targets, label-for relationships, or external scripts) that
 * downstream code could silently come to depend on, turning later removal
 * into a hidden breaking change. The current design routes all addressing
 * through `data-testid` (for tests) and class hooks (for styling) so the
 * card's identity stays decoupled from any in-page anchor contract. Pin the
 * absence of an `id` so any future change that adds one is reviewed
 * deliberately.
 */
describe("StatsPage stats-replays-panel card — id attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2030: stats-replays-panel card has no id attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-replays-panel");
    expect(card.hasAttribute("id")).toBe(false);
  });
});
