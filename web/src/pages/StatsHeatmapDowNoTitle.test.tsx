import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1795 — Sibling-test partner to W1198 (head row aria-hidden + Mon..Sun day
 * labels in order), W1784 (day-label SPAN tag), and W1341 (leading category
 * spacer). The heatmap's seven Mon..Sun day-of-week labels are intentionally
 * decorative: the parent head row carries `aria-hidden="true"` (W1198) so
 * assistive tech only hears the grid's `aria-label` and per-cell tooltips.
 * The data cells DO carry a `title="${cat} · ${d}: ${v}"` tooltip (covered
 * elsewhere), but the day labels themselves must NOT render a title — a
 * native browser tooltip would (a) appear on hover even though the labels
 * are abbreviations of their own visible text (a redundant tooltip is a
 * known WCAG nuisance for sighted hover users) and (b) flip the labels back
 * into the accessibility tree on some browsers via `name from title`,
 * undoing the row's aria-hidden contract. A refactor that adds
 * `title={fullDayName(d)}` ("Mon" → "Monday") for "discoverability" is the
 * obvious slip-through here. Equally, the labels must have NO element
 * children — they render plain text (`{d}`) only; a future refactor that
 * wraps the abbreviation in an `<abbr title="Monday">Mon</abbr>` would
 * change the rendered semantics (announcing the expansion via the abbr
 * role) without changing W1198's textContent or W1784's tag assertions.
 * Pin both the absence of the `title` attribute and the zero element
 * children on every day label so either drift fails loudly here.
 */

function renderPage(): void {
  render(
    <MemoryRouter>
      <ConfirmProvider>
        <StatsPage />
      </ConfirmProvider>
    </MemoryRouter>,
  );
}

describe("StatsPage heatmap day-of-week label has no title and no element children", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1795: stats-cat-heatmap head row day labels render plain text only — no title attr, no nested elements", () => {
    renderPage();
    const grid = screen.getByTestId("stats-cat-heatmap");
    const headRow = grid.querySelector(".stats-heatmap-row--head");
    expect(headRow).not.toBeNull();

    const dowLabels = headRow!.querySelectorAll(".stats-heatmap-dow");
    // Sanity: W1198 pins the count, but re-asserting keeps this test
    // independent — if the count drifts, fix W1198 before debugging here.
    expect(dowLabels.length).toBe(7);

    for (const label of Array.from(dowLabels)) {
      // No native browser tooltip — the row is decorative (aria-hidden) and
      // a `title` would both add a redundant hover affordance over the
      // already-visible "Mon"/"Tue"/... text and risk re-promoting the
      // label into the AX tree via `name from title` on some browsers.
      expect(label.hasAttribute("title")).toBe(false);
      // Plain text only — `{d}` renders a single Text node with no element
      // children. An <abbr title="Monday">Mon</abbr> wrapper would change
      // the rendered semantics without tripping W1198/W1784.
      expect(label.childElementCount).toBe(0);
    }
  });
});
