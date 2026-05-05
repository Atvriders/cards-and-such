import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2133: StatsPage's `data-testid="stats-replays-panel"` card — the
 * `.stats-card` wrapper holding the Replays heading, the saved-replay
 * subtitle, the empty-state placeholder, the saved-replay rows list,
 * and the "view all replays" link — carries NO inline `style`
 * attribute. Sibling tests already pin its className shape
 * (StatsReplaysCardClass), absence of an `id` (StatsReplaysCardNoId),
 * the parent section relationship (StatsSectionH2ReplaysParent), the
 * subtitle class (StatsReplaysPanelSubtitleClass), the replay-row
 * class (StatsReplayRowClass), the saved-replay list class
 * (StatsReplaysAllClass), the seed-code rendering
 * (StatsReplayMetaSeedCode), and the overall stats card count
 * (StatsCardsCount). What was NOT pinned is the replays card element
 * itself remaining free of an inline `style` attribute.
 *
 * All visual presentation of the replays card — padding, background,
 * layout of the subtitle, spacing of the saved-replay rows, the
 * empty-state placeholder appearance, and the trailing view-all link
 * — flows from the `.stats-card` class hook (and the descendant
 * `.stats-chart-label`, `.stats-empty`, `.stats-replays-list`, and
 * `.stats-replay-row` rules) in CSS. An inline `style` attribute on
 * the wrapper would (a) raise CSS specificity above the stylesheet
 * and silently shadow stylesheet rules, (b) couple presentation to
 * JS-side string templating instead of a single source of truth in
 * CSS, and (c) defeat the design intent that the replays card's
 * appearance is controlled exclusively by class hooks. Pin the
 * ABSENCE of `style` on the replays card so any future refactor that
 * sneaks an inline style onto this wrapper is caught and reviewed.
 */
describe("StatsPage stats-replays-panel — card style attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2133: stats-replays-panel card has no inline style attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-replays-panel");
    expect(card).not.toBeNull();
    expect(card.tagName).toBe("DIV");
    expect(card.classList.contains("stats-card")).toBe(true);

    // Pin the absence of an inline `style` attribute on the replays
    // card. Visual presentation is owned entirely by the `.stats-card`
    // CSS rule (and its descendant class hooks); an inline style would
    // raise specificity above the stylesheet and couple presentation
    // to JS-side string templating. Must be reviewed deliberately.
    expect(card.hasAttribute("style")).toBe(false);
  });
});
