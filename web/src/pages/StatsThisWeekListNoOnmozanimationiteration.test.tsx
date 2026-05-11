import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The legacy
 * Mozilla-specific `onmozanimationiteration` content attribute was used to
 * register a handler for the `MozAnimationIteration` event (the Gecko-prefixed
 * precursor to the standard `animationiteration` event). Modern browsers
 * dispatch the unprefixed `animationiteration` event, and Firefox removed the
 * prefixed variant. Having `onmozanimationiteration` present on this
 * presentational list would attach a stale, vendor-prefixed inline event
 * handler that no longer fires anywhere, while still bloating the DOM and
 * potentially triggering CSP `unsafe-inline` violations. Pinning its absence
 * ensures no future regression accidentally re-introduces the obsolete
 * attribute on this weekly summary list.
 */
describe("StatsPage stats-this-week-list ul — onmozanimationiteration attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onmozanimationiteration attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmozanimationiteration")).toBe(false);
    expect(ul.getAttribute("onmozanimationiteration")).toBeNull();
  });
});
