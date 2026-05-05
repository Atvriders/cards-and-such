import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1987: StatsPage's prev-week <ul data-testid="stats-prev-week"> intentionally
 * carries NO `id` attribute — it is identified for tests/queries via its
 * data-testid and located in the DOM via the parent stats-this-week card.
 * Adding an explicit DOM `id` would create:
 *   - a fragile global identifier that other code could start depending on
 *     for label-for/aria-describedby/anchor links, freezing what is currently
 *     a private implementation detail;
 *   - duplicate-id hazards in tests/snapshots that mount StatsPage twice in
 *     the same JSDOM document (each <ul> id must be unique per HTML spec);
 *   - a temptation to query by id instead of testid, fragmenting the existing
 *     test conventions which uniformly use getByTestId.
 *
 * Existing prev-week tests pin the testid, tagName (W1605), modifier class
 * (W1592), child counts (W1647/W1766/W1772), and the absence of an explicit
 * role attribute (W1806) — but none lock the absence of an `id` attribute.
 * A regression that adds id="stats-prev-week" or any other id (e.g. for
 * scroll-into-view or label association) would satisfy every existing
 * assertion while silently introducing the hazards above.
 */
describe("StatsPage stats-this-week — prev-week list id attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1987: stats-prev-week <ul> has no id attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const prior = within(card).getByTestId("stats-prev-week");
    // No DOM id — the data-testid is the canonical handle for this list.
    expect(prior.hasAttribute("id")).toBe(false);
  });
});
