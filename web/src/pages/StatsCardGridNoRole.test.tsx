import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2018: StatsPage's responsive `.stats-card-grid` <section> wrapper currently
 * has NO explicit `role` attribute. Sibling tests pin its tagName=SECTION
 * (W1235), exact className (W1918), the absence of aria-label/aria-labelledby
 * (W1930), and the absence of an `id` (W1998) — but no test pins the absence
 * of an explicit `role`. A `<section>` element without an accessible name
 * intentionally exposes a generic implicit role to assistive tech (it is NOT
 * promoted to a "region" landmark unless aria-label/aria-labelledby is set),
 * which keeps the page's landmark topology shallow and predictable. Adding
 * an explicit `role` attribute (e.g. `role="region"`, `role="grid"`,
 * `role="list"`) would change the accessibility tree, potentially introduce
 * an unnamed landmark, or coerce children into roles incompatible with the
 * existing flat <div>-based card layout.
 *
 * Pin the ABSENCE of any `role` attribute on the `.stats-card-grid` <section>
 * so that any future refactor which decorates the section with a `role` is
 * caught and reviewed deliberately.
 */
describe("StatsPage stats-card-grid — section role attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2018: .stats-card-grid <section> has no role attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const activity = screen.getByTestId("stats-activity");
    const grid = activity.parentElement;
    expect(grid).not.toBeNull();
    expect(grid!.tagName).toBe("SECTION");
    expect(grid!.classList.contains("stats-card-grid")).toBe(true);

    // Pin the absence of a `role` on the section. A future change adding an
    // explicit `role` would alter the accessibility tree / landmark topology
    // and must be reviewed deliberately.
    expect(grid!.hasAttribute("role")).toBe(false);
  });
});
