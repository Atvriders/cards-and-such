import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2434: StatsPage renders `.stats-summary` containers — flat CSS-grid
 * strips of headline `.stat-card` counters that sit inside the
 * "Activity" and "Records" stats cards. Sibling tests pin the wrapper's
 * absence of an `id` (W2069) and absence of an inline `style` (W2103),
 * and pin its descendant counters and parent Activity card's tagName
 * (W1850, which despite a stale comment in W2069 actually pins the
 * `stats-activity` card — not `.stats-summary` itself). Nothing pins
 * the `.stats-summary` element's OWN tagName.
 *
 * The element is a presentational DIV grid; swapping it for
 * `<section>`/`<article>`/`<aside>`/`<ul>` would silently mutate the
 * page's accessibility tree — `<section>`/`<article>` introduce
 * implicit "region"/"article" roles, `<aside>` adds a "complementary"
 * landmark, and `<ul>` would force list semantics on what is a flat
 * counter strip whose cells are not list items. The CSS in
 * StatsPage.css targets `.stats-summary { display: grid; ... }` and
 * does not assume list/landmark semantics, and screen readers should
 * read each `.stat-card` cell as a plain label/value pair, not as a
 * landmark heading or list entry. Pin the tagName so a tag swap fails
 * loudly and is reviewed deliberately.
 */
describe("StatsPage .stats-summary wrapper — tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2434: .stats-summary inside stats-activity is a DIV", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-activity");
    const summary = card.querySelector(".stats-summary");
    expect(summary).not.toBeNull();
    expect(summary!.tagName).toBe("DIV");
  });
});
