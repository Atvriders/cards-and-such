import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1816: StatsPage's this-week <ul data-testid="stats-this-week-list">
 * intentionally exposes no explicit `role` attribute — it relies on the
 * implicit `list` role granted by the native <ul> tagName (W1605/W1361).
 * Setting role="list" would be redundant; setting
 * role="group"/"presentation"/"none" would actively suppress the list
 * semantics that screen readers depend on to announce "list of 3 items"
 * for the current plays/wins/avg-time week summary.
 *
 * Existing this-week tests pin the modifier class (W1361/W1391), tagName
 * (W1605), li structure, and child counts (W1646/W1765/W1771), but none
 * lock the absence of an overriding `role` attribute. A regression that
 * adds role="presentation" or role="group" to dress up the wrapper for
 * some new ARIA pattern would silently strip list semantics while
 * satisfying every existing assertion. Mirrors W1806 for the prev-week
 * sibling list.
 */
describe("StatsPage stats-this-week — this-week list role attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1816: stats-this-week-list <ul> has no explicit role attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    // No explicit role — implicit `list` from <ul> is the correct semantic.
    expect(list.hasAttribute("role")).toBe(false);
    expect(list.getAttribute("role")).toBeNull();
  });
});
