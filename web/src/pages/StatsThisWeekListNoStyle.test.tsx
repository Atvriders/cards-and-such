import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2118: StatsPage's this-week <ul data-testid="stats-this-week-list">
 * carries NO inline `style` attribute. The list's visual presentation —
 * spacing between rows, label/value layout, delta alignment — is owned
 * entirely by the `.stats-week-list` CSS class hook. Sibling tests pin
 * exact className equality (W1391), tagName=UL (W1605), absence of an
 * `id` (W1986), absence of `role` (W1816), and the per-row child count
 * (W1646), but none lock the absence of an inline `style` attribute.
 *
 * An inline `style` would (a) raise CSS specificity above the stylesheet
 * rules backing `.stats-week-list` and silently break overrides or
 * print/responsive variants, (b) couple presentation to JS-side string
 * templating instead of the single CSS source of truth, and (c) diverge
 * from the sibling prev-week list pattern. Pin the ABSENCE of `style` on
 * the this-week <ul> so that any future refactor introducing an inline
 * style attribute on the list is caught and reviewed deliberately.
 */
describe("StatsPage stats-this-week — this-week list style attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2118: stats-this-week-list <ul> has no inline style attribute", () => {
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
    expect(list.classList.contains("stats-week-list")).toBe(true);

    // Pin the absence of an inline `style` attribute on the <ul>. Layout
    // and spacing are owned entirely by `.stats-week-list` in CSS; an
    // inline style would raise specificity above the stylesheet and
    // couple presentation to JS-side string templating.
    expect(list.hasAttribute("style")).toBe(false);
    expect(list.getAttribute("style")).toBeNull();
  });
});
