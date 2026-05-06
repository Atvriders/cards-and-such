import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2649: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is rendered as a plain <ul> with
 * className "stats-week-list" and contains three summary rows
 * (Plays / Wins / Avg time). Each row's meaning is carried by an inline
 * <span class="stats-week-label"> child, so the list itself does not —
 * and should not — carry an authored `aria-describedby` reference.
 * Existing pins already cover the <ul> tagName, the exact className,
 * absence of `id`, `role`, inline `style`, `tabindex`, `aria-label`
 * (W2468), `aria-labelledby`, `aria-controls`, and `aria-hidden`, plus
 * child / label / value counts. However, NO existing test pins the
 * absence of an `aria-describedby` attribute on the THIS-week <ul>.
 *
 * Adding `aria-describedby` to the list would (a) wire some sibling
 * paragraph or chart-label node as a programmatic description that
 * assistive tech would announce alongside the list, (b) couple the
 * list's a11y semantics to the existence and id of whatever element is
 * referenced, making future copy / id refactors riskier, and (c) imply
 * the list itself carries an accessible name worth describing — which
 * conflicts with the current presentational, per-row-labelled contract.
 * Pin the absence so any future change attaching a programmatic
 * description to the list is reviewed deliberately rather than slipping
 * in unnoticed. Mirrors W2468 (this-week-list no-aria-label) and the
 * established ListNoAria* pattern used by sibling list pins.
 */
describe("StatsPage stats-this-week-list ul — aria-describedby attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2649: stats-this-week-list <ul> has no aria-describedby attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    expect(list.tagName).toBe("UL");
    expect(list.hasAttribute("aria-describedby")).toBe(false);
    expect(list.getAttribute("aria-describedby")).toBeNull();
  });
});
