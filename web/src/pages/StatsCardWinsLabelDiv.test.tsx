import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1323: StatsPage's `stat-total-wins` summary tile renders its caption text
 * ("Total wins") inside a `<div className="stat-label">` child of the outer
 * `<div className="stat-card">`. The `stat-label` className is the
 * load-bearing CSS hook that pins the caption's smaller font-size, muted
 * color, and uppercase tracking (`.stat-label { font-size: ...; color:
 * var(--text-muted); ... }` in StatsPage.css) so the label visually subordinates
 * to the larger numeric value below it.
 *
 * Existing coverage on this card (W738, plus the W825-era textContent check
 * at StatsPage.test.tsx:1654) only reads textContent to pin the count
 * binding — no test pins the `.stat-label` className or the `<div>` tag for
 * the wins card. W1272 pins the outer `stat-card` class on
 * `stat-total-played`, and W1281 pins the this-week plays-row `<em>`, but
 * neither covers the inner label hook on a non-played card. A regression
 * that renamed `stat-label` to e.g. `stat-caption`, or swapped the `<div>`
 * for a `<span>`/`<small>` during a refactor, would silently break the wins
 * card's typography while textContent assertions still pass. This test pins
 * both the className hook and the `<div>` tag for the wins card's label.
 */
describe("StatsPage stats-card-grid — stat-total-wins label className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1323: stat-total-wins label is a <div className='stat-label'>", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stat-total-wins");
    const label = card.querySelector(".stat-label");
    expect(label).not.toBeNull();
    // Pin the load-bearing className hook for the label.
    expect(label!.className).toContain("stat-label");
    // Pin the label tag — <div>, not <span>/<small>.
    expect(label!.tagName).toBe("DIV");
    // Pin the caption text so a label/value swap is caught.
    expect(label!.textContent).toContain("Total wins");
  });
});
