import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2881: StatsPage's `stats-prev-week` <ul> is a generic baseline metrics
 * list, not a microdata item. Existing prev-week tests pin tagName,
 * className, testid, and absence of itemprop/itemscope/itemtype, but none
 * lock the absence of `itemid`. A regression that adds an
 * `itemid="…"` would silently turn this list into a globally identified
 * microdata item, polluting the page's structured-data surface and
 * potentially confusing search engines and assistive-tech consumers that
 * scan for Schema.org item identifiers. This test pins that the host
 * <ul> has no `itemid` attribute at all.
 */
describe("StatsPage stats-prev-week — no itemid attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2881: stats-prev-week <ul> has no itemid attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const prior = within(card).getByTestId("stats-prev-week");
    expect(prior.hasAttribute("itemid")).toBe(false);
  });
});
