import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2386 — The category × day-of-week heatmap root names itself for
 * assistive tech via a literal `aria-label` (W1250 pins the exact copy
 * "Plays by category and day of week, last 30 days" alongside
 * `role="img"`). The heatmap is a self-contained chart whose entire
 * accessible description is encoded in the per-cell `title` tooltips
 * ("solitaire · Mon: 3", etc.) and the column day labels — there is NO
 * separate sibling element rendered as a long-form description block
 * with a stable id. The root therefore deliberately does NOT carry an
 * `aria-describedby` attribute. Layering one on would either point at a
 * non-existent id (silently breaking AT description) or duplicate the
 * aria-label content into a redundant announcement.
 *
 * W2019 already pins the absence of `aria-labelledby` (so AT only
 * receives one accessible-name source); pin the absence of
 * `aria-describedby` here so a refactor that wires up an unrelated
 * description target (e.g. pointing at a tooltip container or a
 * decorative legend) fails loudly before shipping a regression in
 * heatmap screen-reader description.
 */
describe("StatsPage cat heatmap aria-describedby absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2386: stats-cat-heatmap root has no aria-describedby attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("aria-describedby")).toBe(false);
  });
});
