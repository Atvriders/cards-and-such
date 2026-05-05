import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1857: StatsPage's `stats-this-week` card opens with the section title
 * "This week", authored as `<h2>This week</h2>` — a literal H2 tagName
 * that anchors the card in the StatsPage heading hierarchy beneath the
 * page-level h1. Existing tests pin (a) the heading text + level via
 * `getByRole("heading", { level: 2, name: "This week" })` (W847,
 * W1468) and (b) various sibling/inner contracts (subtitle <p>
 * tagName at W1796, ul cardinality at W1780, wrap div at W1226), but
 * NOTHING locks the title's literal `tagName === "H2"` via a selector
 * that doesn't pre-filter on heading role.
 *
 * The level-2 ARIA heading role can be satisfied by an element with
 * `role="heading" aria-level="2"` on a <div>, <span>, <p>, etc. — the
 * implicit-vs-explicit ARIA gap means the existing role-based
 * assertions would still pass after a swap to `<div role="heading"
 * aria-level={2}>This week</div>`, while every CSS rule targeting
 * `.stats-card--week h2` and every screen-reader heading-list shortcut
 * that depends on native heading semantics would silently break.
 *
 * This test locks the title's tagName as "H2" via a text-based lookup
 * scoped to the card (no role/tag pre-filter), so the assertion fails
 * loudly if the heading is demoted to a generic container or promoted
 * to a different heading level.
 */
describe("StatsPage stats-this-week — title tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1857: stats-this-week 'This week' title uses <h2> tagName", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const title = within(card).getByText("This week");
    expect(title).toBeInTheDocument();
    // The title must be a native <h2>, not a <div>/<span>/<p> with
    // role="heading" or a different heading level. This locks the
    // semantic heading element used by every other stats card title.
    expect(title.tagName).toBe("H2");
  });
});
