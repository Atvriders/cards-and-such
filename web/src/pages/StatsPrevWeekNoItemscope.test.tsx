import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2869: StatsPage's `stats-prev-week` <ul> is a plain baseline metrics
 * list, not a microdata item. Existing prev-week tests pin tagName,
 * className, testid, and absence of various ARIA/global/microdata
 * attributes (including `itemprop`), but none lock the absence of
 * `itemscope`. A regression that adds `itemscope` would silently turn
 * this list into a microdata item root, polluting the page's
 * structured-data surface and potentially confusing search-engine and
 * assistive-tech consumers that scan for Schema.org item boundaries.
 * This test pins that the host <ul> has no `itemscope` attribute at all.
 */
describe("StatsPage stats-prev-week — no itemscope attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2869: stats-prev-week <ul> has no itemscope attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const prior = within(card).getByTestId("stats-prev-week");
    expect(prior.hasAttribute("itemscope")).toBe(false);
  });
});
