import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1359: StatsPage's `stat-total-hints` summary tile renders its caption
 * text ("Total hints used") inside a `<div className="stat-label">` child of
 * the outer `<div className="stat-card">`. The `stat-label` className is the
 * load-bearing CSS hook for the card-caption typography (smaller font,
 * muted color, uppercase tracking) defined in StatsPage.css.
 *
 * Existing coverage on this card (W225 at StatsPage.test.tsx:918, plus the
 * aggregate-render assertion at StatsPage.test.tsx:902) only reads
 * textContent to pin the hints sum — no test pins the `.stat-label`
 * className or the `<div>` tag for the hints card. W1323 pins the wins
 * card's label, W1313 pins the streak card's value, but neither covers the
 * inner label hook on the hints aggregate card. A regression that renamed
 * `stat-label` (e.g. to `stat-caption`), or swapped the `<div>` for a
 * `<span>`/`<small>` during a refactor, would silently break the hints
 * card's typography while the textContent assertions still pass.
 */
describe("StatsPage stats-card-grid — stat-total-hints label className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1359: stat-total-hints label is a <div className='stat-label'>", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stat-total-hints");
    const label = card.querySelector(".stat-label");
    expect(label).not.toBeNull();
    // Pin the load-bearing className hook for the label.
    expect(label!.className).toContain("stat-label");
    // Pin the label tag — <div>, not <span>/<small>.
    expect(label!.tagName).toBe("DIV");
    // Pin the caption text so a label/value swap is caught.
    expect(label!.textContent).toContain("Total hints used");
  });
});
