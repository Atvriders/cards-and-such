import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2780: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is rendered as a plain <ul> with
 * className "stats-week-list". It is a presentational summary list of
 * three rows (Plays / Wins / Avg time) — it is NOT a modal surface.
 *
 * The `aria-modal` attribute is reserved for elements with role
 * "dialog" or "alertdialog" to indicate that the rest of the page is
 * inert while the dialog is open. Applying `aria-modal` to a non-dialog
 * element (such as this <ul>) is invalid ARIA usage: assistive
 * technologies may either ignore it or, worse, treat surrounding
 * content as inert and break navigation.
 *
 * Existing pins for this <ul> already cover the tagName (W1318), exact
 * className (W1361/W1768), absence of `id` (W1986), `role` (W1816),
 * inline `style` (W2118), `tabindex` (W2268), `aria-label` (W2468),
 * `aria-labelledby` (W2492), `aria-describedby`, `aria-hidden`, etc.
 * The `aria-modal` attribute absence is NOT yet pinned. The only
 * existing `aria-modal` assertion in the Stats suite is on the reset
 * confirm dialog (W1497), which legitimately carries
 * `aria-modal="true"`.
 *
 * Pinning the absence of `aria-modal` on the this-week list ensures
 * any future refactor that accidentally treats this list as a modal
 * surface (e.g. via a careless prop spread or copy-paste from the
 * confirm dialog) will be caught immediately.
 */
describe("StatsPage stats-this-week-list ul — aria-modal attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2780: stats-this-week-list <ul> has no aria-modal attribute", () => {
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
    expect(list.hasAttribute("aria-modal")).toBe(false);
    expect(list.getAttribute("aria-modal")).toBeNull();
  });
});
