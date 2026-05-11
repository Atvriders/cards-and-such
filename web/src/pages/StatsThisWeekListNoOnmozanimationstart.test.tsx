import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The legacy
 * Mozilla-prefixed `onmozanimationstart` inline event-handler attribute was
 * only ever recognized by Gecko-based browsers as a hook for the
 * `MozAnimationStart` event (the vendor-prefixed precursor to standard
 * `animationstart`). Modern Firefox has long since unified on the
 * unprefixed `animationstart` event, and every other engine ignores
 * `onmozanimationstart` entirely. Attaching it to this presentational
 * weekly summary list would do nothing useful in any current browser,
 * but would still ship inline JavaScript through DOM serialization and
 * could trip CSP audits or confuse future refactors. Pinning its absence
 * ensures any future change that accidentally attaches a Mozilla-prefixed
 * animation-start handler to this list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onmozanimationstart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onmozanimationstart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmozanimationstart")).toBe(false);
    expect(ul.getAttribute("onmozanimationstart")).toBeNull();
  });
});
