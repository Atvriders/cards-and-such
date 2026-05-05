import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2401: StatsPage's replays panel always renders a "View all replays →" Link
 * pointing at /replays (data-testid="view-all-replays"). Existing tests pin
 * the link's testid (W513, W745), href (W513, W745), tagName=A (W760), exact
 * textContent (W760), and className "stats-replays-all" (W1367). What is NOT
 * pinned is the *absence of an id attribute* on the link element. The element
 * is identified for tests via data-testid and is selected via className for
 * CSS — adding an `id` would create a global-namespace collision risk
 * (duplicate IDs if the StatsPage ever re-mounts inside a route transition,
 * or if the same affordance label is reused on /replays itself), and would
 * also encourage anchor-jump linking (`/stats#view-all-replays`) which would
 * break the moment we move/rename the panel. Pin id absence so a regression
 * that adds an id slips no farther than this test.
 */
describe("StatsPage replays panel — view-all link id attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2401: view-all-replays link has no id attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const panel = screen.getByTestId("stats-replays-panel");
    const viewAll = within(panel).getByTestId("view-all-replays");
    // The link must not carry an id attribute — testid is the stable test
    // hook, className is the stable CSS hook; an id would be redundant
    // and a uniqueness-collision hazard.
    expect(viewAll.hasAttribute("id")).toBe(false);
    // Sanity: we are still asserting against the real anchor (Link → <a>).
    expect(viewAll.tagName).toBe("A");
  });
});
