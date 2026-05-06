import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2865: StatsPage's `stats-prev-week` <ul> is a generic baseline metrics
 * list, not a microdata property. Existing prev-week tests pin tagName,
 * className, testid, and absence of various ARIA/global attributes, but
 * none lock the absence of `itemprop`. A regression that adds an
 * `itemprop="…"` would silently turn this list into a microdata-bearing
 * element, polluting the page's structured-data surface and potentially
 * confusing search-engine and assistive-tech consumers that scan for
 * Schema.org properties. This test pins that the host <ul> has no
 * `itemprop` attribute at all.
 */
describe("StatsPage stats-prev-week — no itemprop attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2865: stats-prev-week <ul> has no itemprop attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const prior = within(card).getByTestId("stats-prev-week");
    expect(prior.hasAttribute("itemprop")).toBe(false);
  });
});
