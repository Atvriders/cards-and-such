import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1346: StatsPage's `<footer className="stats-footer">` renders two children
 * in a load-bearing order: the privacy note (`.stats-footer-note`, "Stats are
 * stored locally in your browser.") FIRST, followed by the destructive
 * "Reset stats" button. W888 pins the exact note copy and asserts the note
 * + reset button are *co-located* inside the same `<footer>`, but it does
 * NOT pin the order — a regression that flips the children (rendering the
 * destructive button before the reassuring privacy copy) would still pass
 * W888 while silently weakening the UX: users would see the dangerous
 * action first and the reassurance last. Lock the note as the footer's
 * `firstElementChild` and the reset button as its immediate
 * `nextElementSibling` so any reorder is caught.
 */
describe("StatsPage footer — note precedes reset button", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1346: stats-footer-note is the footer's firstElementChild and precedes stats-reset", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const note = screen.getByText("Stats are stored locally in your browser.");
    const footer = note.closest("footer");
    expect(footer).not.toBeNull();

    // Note is the first child of the footer (renders BEFORE the reset btn).
    expect(footer!.firstElementChild).toBe(note);

    // Reset button is the immediate next sibling — pins the two-child shape
    // and the note-then-button order in one assertion.
    const resetBtn = screen.getByTestId("stats-reset");
    expect(note.nextElementSibling).toBe(resetBtn);
  });
});
