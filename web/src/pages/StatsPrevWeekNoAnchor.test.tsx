import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2859: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev" containing a static set of
 * summary rows (Prior plays / Prior wins / Prior avg time). It is a
 * standalone, always-visible block inside the StatsPage layout — it is
 * not anchored to any other element. The HTML `anchor` attribute is part
 * of the CSS Anchor Positioning API: it associates an element with a
 * named anchor element so that subsequent positioned elements can be
 * laid out relative to it. Setting `anchor` on the prior-week list would
 * register it as the implicit anchor target for any positioned
 * descendants, change how popover/positioned siblings resolve their
 * anchor() references, and tie this list into a positioning graph it
 * was never intended to participate in — all without any visible
 * change at first glance, making the regression easy to miss in
 * review. Sibling contracts already pin a long list of attribute
 * absences on this <ul> (id, role, style, tabindex, dir, hidden, inert,
 * spellcheck, popover, popovertarget, plus the full aria-* surface),
 * but `anchor` is not yet pinned. Freezing `anchor` absence here
 * guarantees that any future refactor that wires the prior-week list
 * into the anchor-positioning system must do so deliberately rather
 * than slipping in as an invisible side effect.
 */
describe("StatsPage stats-prev-week ul — anchor attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2859: stats-prev-week ul has no anchor attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("anchor")).toBe(false);
  });
});
