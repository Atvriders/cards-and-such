import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2189: StatsPage's replays panel renders saved replays inside a
 * `<ul className="stats-replays-list">` element (the inner list child
 * of the `data-testid="stats-replays-panel"` card). Sibling tests pin
 * the panel card itself remaining free of an inline `style`
 * (StatsReplaysCardNoStyle), the card's className shape
 * (StatsReplaysCardClass), absence of an `id` on the card
 * (StatsReplaysCardNoId), the replay-row className
 * (StatsReplayRowClass), the seed-code rendering
 * (StatsReplayMetaSeedCode), the view-all link's className
 * (StatsReplaysAllClass), the panel subtitle class
 * (StatsReplaysPanelSubtitleClass), and the parent section
 * relationship (StatsSectionH2ReplaysParent). What is NOT pinned is
 * the inner `<ul>` list itself remaining free of an inline `style`
 * attribute.
 *
 * The replays list's vertical rhythm, gap between rows, padding,
 * list-style suppression, and any flex/grid layout flow exclusively
 * from the `.stats-replays-list` class hook in StatsPage.css. An
 * inline `style` attribute on this `<ul>` would (a) raise CSS
 * specificity above the stylesheet and silently shadow stylesheet
 * rules controlling the list layout, (b) couple list presentation to
 * JS-side string templating instead of a single CSS source of truth,
 * and (c) defeat the design intent that the list's appearance is
 * controlled exclusively by class hooks. Pin the ABSENCE of `style`
 * on the inner replays list so any future refactor that sneaks an
 * inline style onto this `<ul>` is caught and reviewed.
 */
describe("StatsPage stats-replays-list — list style attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2189: stats-replays-list <ul> has no inline style attribute", () => {
    // Seed a single replay so the `<ul className="stats-replays-list">`
    // branch renders (the empty-state path otherwise renders a `<p>`).
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
    // The replays list is the only `<ul>` inside the replays panel.
    const list = within(panel).getByRole("list") as HTMLElement;
    expect(list).not.toBeNull();
    expect(list.tagName).toBe("UL");
    expect(list.classList.contains("stats-replays-list")).toBe(true);

    // Pin the absence of an inline `style` attribute on the inner
    // replays list. Visual presentation is owned entirely by the
    // `.stats-replays-list` CSS rule; an inline style would raise
    // specificity above the stylesheet and couple presentation to
    // JS-side string templating. Must be reviewed deliberately.
    expect(list.hasAttribute("style")).toBe(false);
  });
});
