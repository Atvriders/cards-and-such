import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1806: StatsPage's prev-week <ul data-testid="stats-prev-week"> intentionally
 * exposes no explicit `role` attribute — it relies on the implicit `list` role
 * granted by the native <ul> tagName (W1605). Setting role="list" would be
 * redundant; setting role="group"/"presentation"/"none" would actively suppress
 * the list semantics that screen readers depend on to announce "list of 3
 * items" for the prior plays/wins/avg-time baseline rows.
 *
 * Existing prev-week tests pin the modifier class (W1592), tagName (W1605), li
 * structure, and child counts (W1647/W1766/W1772), but none lock the absence
 * of an overriding `role` attribute. A regression that adds role="presentation"
 * or role="group" to dress up the wrapper for some new ARIA pattern would
 * silently strip list semantics while satisfying every existing assertion.
 */
describe("StatsPage stats-this-week — prev-week list role attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1806: stats-prev-week <ul> has no explicit role attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const prior = within(card).getByTestId("stats-prev-week");
    // No explicit role — implicit `list` from <ul> is the correct semantic.
    expect(prior.hasAttribute("role")).toBe(false);
    expect(prior.getAttribute("role")).toBeNull();
  });
});
