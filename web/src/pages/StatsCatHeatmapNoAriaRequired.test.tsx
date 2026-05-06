import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2794 — The category × day-of-week heatmap chart root, identified by
 * `data-testid="stats-cat-heatmap"`, is a presentational data visualization
 * div, not an interactive form control. The `aria-required` attribute is
 * defined by ARIA only for widgets that accept user input (e.g. roles like
 * `textbox`, `combobox`, `listbox`, `radiogroup`, `tree`, `spinbutton`)
 * and signals to assistive technology that the user must supply a value
 * before form submission. Applying `aria-required` to a static heatmap
 * grid would (a) violate the ARIA spec by attaching a form-state attribute
 * to a non-form-widget element, (b) cause screen readers to announce a
 * spurious "required" hint on a chart the user cannot fill in, and (c)
 * mislead automated accessibility tooling into reporting a missing label
 * for an associated form field that does not exist. Pin the absence of
 * `aria-required` on the heatmap root so a future refactor that copies
 * attributes from a nearby form control (or that adds the attribute via
 * a generic spread of widget props) fails here before it ships and degrades
 * the screen-reader experience on the Stats page.
 */
describe("StatsPage cat heatmap aria-required absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2794: stats-cat-heatmap root has no aria-required attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("aria-required")).toBe(false);
  });
});
