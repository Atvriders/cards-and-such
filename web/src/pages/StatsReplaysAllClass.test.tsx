import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1367: StatsPage's replays panel always renders a "View all replays →" link
 * pointing at /replays. Existing tests pin the link's testid, href, and text
 * content, but no test pins the link's className `stats-replays-all` — the
 * load-bearing hook the StatsPage.css uses to lay out the link as a
 * full-width footer affordance below the replay rows. A regression that drops
 * or renames this class (e.g. during a CSS module migration) would silently
 * collapse the link's spacing/alignment while every existing assertion still
 * passed. We pin the className to exactly "stats-replays-all".
 */
describe("StatsPage replays panel — view-all link className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1367: view-all-replays link carries the 'stats-replays-all' className", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const panel = screen.getByTestId("stats-replays-panel");
    const viewAll = within(panel).getByTestId("view-all-replays");
    // Pin the load-bearing layout hook on the link element.
    expect(viewAll.className).toBe("stats-replays-all");
    // Sanity: the affordance is a real anchor (Link from react-router).
    expect(viewAll.tagName).toBe("A");
  });
});
