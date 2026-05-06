import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2857: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is a plain, fully-rendered <ul>
 * summarising the three read-only "this week" stats rows (plays / wins /
 * average time). The HTML `anchor` attribute is part of the experimental
 * CSS Anchor Positioning proposal and is intended to associate a
 * positioned element with an anchor element by id. This static summary
 * <ul> is rendered inline inside the activity card and is neither
 * popover-positioned, tethered, nor anchored to any other element — it
 * has no need for the experimental `anchor` attribute. Sibling pins
 * already cover the absence of many other attributes on this same <ul>
 * (role, tabindex, aria-checked, aria-roledescription, aria-hidden,
 * etc.), but no existing test pins the absence of the `anchor`
 * attribute. Placing `anchor` on a plain summary list is meaningless and
 * could confuse future tooling that scans for anchor-positioned
 * elements. Pinning the absence ensures a future refactor that
 * accidentally introduces an `anchor` attribute on this static list is
 * caught in review.
 */
describe("StatsPage stats-this-week-list ul — anchor attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2857: stats-this-week-list ul has no anchor attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("anchor")).toBe(false);
    expect(ul.getAttribute("anchor")).toBeNull();
  });
});
