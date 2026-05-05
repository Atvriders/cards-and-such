import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1860: StatsPage's `stats-prev-week` <ul> lives inside the same
 * `stats-card stats-card--week` wrapper that hosts the current-week
 * list (W1651), and that wrapper opens with the section title
 * "This week", authored as `<h2>This week</h2>`. From the prev-week
 * list's perspective, the card's title heading anchors the comparison
 * block in the StatsPage heading hierarchy beneath the page-level h1
 * — every CSS rule targeting `.stats-card--week h2` and every
 * screen-reader heading-list shortcut that depends on native heading
 * semantics relies on that literal tagName.
 *
 * Existing prev-week tests pin the list's testid + --prev modifier
 * (W1592), the parent card class (W1651), the <ul> tagName (W1605),
 * the row labels (W1606/W1614/W1621), the row count (W1627), all
 * three row value <em> tagNames (W1629/W1635/W1643), and the row
 * label <span> tagNames (W1662/W1678/W1688). W1857 mirrors this lock
 * for the this-week-side selector path
 * (`screen.getByTestId("stats-this-week")` → title), but NOTHING pins
 * the title's `tagName === "H2"` from the prev-week selector path
 * (`stats-prev-week` → parent card → heading). A regression that
 * demoted the card title to `<div role="heading" aria-level={2}>` or
 * promoted it to an h1/h3 would still satisfy every existing
 * prev-week assertion (the ul still sits inside a stats-card; the
 * row contracts still hold) while silently breaking the comparison
 * block's heading hierarchy from the prev-week vantage point.
 *
 * This test walks from the prev-week <ul> up to its parent card and
 * locks the card title's tagName as "H2" via a text-based lookup
 * scoped to that parent (no role/tag pre-filter), so the assertion
 * fails loudly if the heading is demoted to a generic container or
 * promoted to a different heading level. Mirrors W1857 from the
 * stats-prev-week selector path.
 */
describe("StatsPage stats-prev-week — card title tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1860: stats-prev-week card 'This week' title uses <h2> tagName", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const prev = screen.getByTestId("stats-prev-week");
    const card = prev.parentElement;
    expect(card).not.toBeNull();
    // Sanity: the parent is the shared stats-card wrapper (W1651).
    expect(card!.classList.contains("stats-card")).toBe(true);
    const title = within(card as HTMLElement).getByText("This week");
    expect(title).toBeInTheDocument();
    // The card title above the prev-week list must be a native <h2>,
    // not a <div>/<span>/<p> with role="heading" or a different
    // heading level. This locks the semantic heading element from
    // the stats-prev-week selector path.
    expect(title.tagName).toBe("H2");
  });
});
