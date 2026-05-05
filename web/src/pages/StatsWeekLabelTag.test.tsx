import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2193: StatsPage's `stats-this-week` card embeds two parallel <ul>
 * lists — `stats-this-week-list` (Plays / Wins / Avg time) and
 * `stats-prev-week` (Prior plays / Prior wins / Prior avg time) —
 * each contributing three `.stats-week-label` elements, for a card-wide
 * total of six labels. Each label is rendered as
 *   <span className="stats-week-label">…</span>
 * so the inline label and its <em> value share a baseline inside the
 * flex row layout. Promoting any of these to a block-level element
 * (<div>, <p>, <h3>) would shift the matching value onto a new line
 * and desynchronize the comparison card visually.
 *
 * Per-row label tagName is already pinned at the <li> scope for all six
 * rows: the three this-week rows via W1694 / W1700 / W1704 and the three
 * prev-week rows via W1662 / W1678 / W1688. The this-week list-level
 * label cardinality is pinned by W1747 (3 spans) and the prev-week
 * counterpart by W1759 (3 spans). The list-level cardinality tests use
 * class-only selectors but assert only on `length`, not on `tagName`,
 * and the per-row tagName tests are scoped narrowly to a single <li>.
 *
 * What none of those tests pin is the CARD-level collective tagName
 * invariant: querying `.stats-week-label` against the entire
 * `stats-this-week` card (parent of both lists) and verifying that EVERY
 * matched element is a <span>. A regression that introduced a stray
 * `.stats-week-label` element of a different tag in the comparison card
 * outside both <ul>s — e.g. a div-tagged label sneaked into the card
 * header or between the two lists — would slip past every per-row
 * (li-scoped) tagName test and past both list-level count tests
 * (which scope to a single <ul>). Pin the card-scoped collective
 * tagName so the comparison card stays a uniform set of <span> labels
 * regardless of where they live within the card.
 */
describe("StatsPage stats-this-week — card-scoped .stats-week-label tagName collective", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2193: every .stats-week-label inside stats-this-week card is a <span>", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    // Class-only selector scoped to the entire comparison card (both
    // this-week and prev-week lists). Six labels total: 3 current + 3 prior.
    const labels = within(card).getAllByText(
      /^(Plays|Wins|Avg time|Prior plays|Prior wins|Prior avg time)$/,
    );
    // Sanity: the regex anchors to the six exact labels — no more, no fewer.
    expect(labels.length).toBeGreaterThan(0);

    // Re-query via class-only selector to exercise the actual hook used by
    // CSS, decoupled from any text-based filter.
    const classLabels = card.querySelectorAll(".stats-week-label");
    expect(classLabels.length).toBe(6);

    // Every card-level .stats-week-label must be a <span>. A single
    // div-tagged sibling would fail this assertion loudly.
    const tagNames = Array.from(classLabels).map((el) => el.tagName);
    expect(tagNames.every((t) => t === "SPAN")).toBe(true);
  });
});
