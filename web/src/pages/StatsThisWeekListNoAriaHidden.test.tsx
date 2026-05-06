import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2648: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is rendered as a plain <ul> with
 * className "stats-week-list" and contains three summary rows
 * (Plays / Wins / Avg time). The list is part of the visible, in-flow
 * stats reporting and must remain reachable by assistive technology so
 * that screen-reader users can perceive each per-row label/value pair.
 * Existing pins already cover the <ul> tagName (W1318), the exact
 * className (W1361/W1768), the absence of `id` (W1986), `role` (W1816),
 * inline `style` (W2118), `tabindex` (W2268), `aria-label` (W2468), and
 * `aria-labelledby` — but no existing test pins the absence of an
 * `aria-hidden` attribute on the THIS-week <ul>. Adding `aria-hidden`
 * (whether "true" or "false") would (a) silently remove the rows from
 * the accessibility tree or (b) author an explicit boolean toggle that
 * could drift, in either case changing the contract. The matching
 * prev-week list already has its aria-hidden absence pinned via
 * W2462-style coverage; pinning the THIS-week list mirrors that
 * contract and ensures the per-row content stays announced.
 */
describe("StatsPage stats-this-week-list ul — aria-hidden attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2648: stats-this-week-list <ul> has no aria-hidden attribute", () => {
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
    expect(list.hasAttribute("aria-hidden")).toBe(false);
    expect(list.getAttribute("aria-hidden")).toBeNull();
  });
});
