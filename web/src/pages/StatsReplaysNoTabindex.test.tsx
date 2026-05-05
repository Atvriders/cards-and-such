import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2262: StatsPage's `data-testid="stats-replays-panel"` card — the
 * `.stats-card` wrapper holding the Replays heading, the saved-count
 * subtitle, and either the empty-state paragraph or the list of saved
 * replay rows — carries NO `tabindex` attribute. Sibling pins already
 * cover several attribute-shape contracts on this same card:
 *   - StatsReplaysCardClass.test.tsx pins the exact className.
 *   - StatsReplaysCardNoId.test.tsx pins absence of `id`.
 *   - StatsReplaysCardNoStyle.test.tsx pins absence of inline `style`.
 *   - StatsReplaysPanelSubtitleClass.test.tsx pins the subtitle shape.
 *   - StatsSectionH2ReplaysParent.test.tsx pins the heading parent.
 *
 * What none of those cover is the ABSENCE of a `tabindex` attribute on
 * the replays panel card itself. The card is a presentational grouping
 * wrapper — its actionable descendants (the per-row "Watch replay"
 * Links) already manage their own focus via the anchor tag. Adding any
 * `tabindex` to the card would silently:
 *   1. With `tabIndex={0}`, insert the entire card wrapper into the
 *      keyboard tab order ahead of the replay-row links, forcing
 *      keyboard users through an unannounced stop on a non-actionable
 *      group element before they can reach the Watch links.
 *   2. With `tabIndex={-1}`, make the card programmatically focusable
 *      (`element.focus()` would succeed) and create a new undeclared
 *      focus surface that other code (skip-link targets, scroll-into-
 *      view handlers, post-save focus restoration after a replay is
 *      written) could come to depend on.
 * Either change would alter the page's focus contract and should be
 * reviewed deliberately, not slip in via an unrelated refactor.
 *
 * Pin the ABSENCE of any `tabindex` attribute on the replays panel card,
 * using `hasAttribute` so even an explicit `tabindex="-1"` is caught.
 */
describe("StatsPage stats-replays-panel — card tabindex attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2262: stats-replays-panel card has no tabindex attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-replays-panel");
    expect(card).not.toBeNull();

    // Sanity: confirm we pinned the replays panel card itself and not,
    // say, a descendant that might legitimately carry a tabindex of its
    // own (e.g. an interactive replay-row link).
    expect(card.tagName).toBe("DIV");
    expect(card.classList.contains("stats-card")).toBe(true);

    // The actual contract: no `tabindex` attribute on the replays panel
    // card. `hasAttribute` rather than a specific value check — even
    // `tabindex="-1"` would make the card programmatically focusable
    // and create a new undeclared focus surface.
    expect(card.hasAttribute("tabindex")).toBe(false);
  });
});
