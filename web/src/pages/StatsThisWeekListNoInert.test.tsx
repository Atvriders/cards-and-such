import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2833: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is rendered as a plain <ul> with
 * className "stats-week-list" and contains three visible summary rows
 * (Plays / Wins / Avg time). The list participates in normal in-flow
 * content and must remain interactive/focusable for assistive
 * technology and pointer events. Existing pins already cover the <ul>
 * tagName, exact className, absence of `id`, `role`, inline `style`,
 * `tabindex`, `aria-label`, `aria-labelledby`, `aria-hidden`, and
 * `aria-checked` — but no existing test pins the absence of an `inert`
 * attribute on the THIS-week <ul>. Adding `inert` would silently make
 * the list and all its descendants non-focusable and non-clickable
 * (inert subtrees skip pointer events and focus), effectively hiding
 * the per-row content from interaction even though it remains visible.
 * Pinning `inert` absence guarantees the list stays a live, reachable
 * region of the page.
 */
describe("StatsPage stats-this-week-list ul — inert attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2833: stats-this-week-list <ul> has no inert attribute", () => {
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
    expect(list.hasAttribute("inert")).toBe(false);
    expect(list.getAttribute("inert")).toBeNull();
  });
});
